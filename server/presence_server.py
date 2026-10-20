"""Local-only anonymous presence preview. No database, cookies or identity collection."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json,math,re,threading,time

ROOT=Path(__file__).resolve().parents[1]
TTL=60
def gcj02(lat,lng):
    """Local approximate WGS-84 to GCJ-02 conversion; no extra map API request."""
    x,y=lng-105,lat-35
    dlat=-100+2*x+3*y+.2*y*y+.1*x*y+.2*math.sqrt(abs(x))
    dlng=300+x+2*y+.1*x*x+.1*x*y+.1*math.sqrt(abs(x))
    dlat+=(20*math.sin(6*x*math.pi)+20*math.sin(2*x*math.pi))*2/3
    dlat+=(20*math.sin(y*math.pi)+40*math.sin(y/3*math.pi))*2/3
    dlat+=(160*math.sin(y/12*math.pi)+320*math.sin(y*math.pi/30))*2/3
    dlng+=(20*math.sin(6*x*math.pi)+20*math.sin(2*x*math.pi))*2/3
    dlng+=(20*math.sin(x*math.pi)+40*math.sin(x/3*math.pi))*2/3
    dlng+=(150*math.sin(x/12*math.pi)+300*math.sin(x/30*math.pi))*2/3
    rad=lat*math.pi/180;magic=1-.00669342162296594323*math.sin(rad)**2
    dlat=dlat*180/((6378245*(1-.00669342162296594323))/(magic*math.sqrt(magic))*math.pi)
    dlng=dlng*180/(6378245/math.sqrt(magic)*math.cos(rad)*math.pi)
    return lat+dlat,lng+dlng

class Presence:
    def __init__(self,clock=time.monotonic):
        self.clock=clock;self.records={};self.revoked={};self.lock=threading.RLock()
    def prune(self):
        now=self.clock()
        for token in list(self.records):
            if now-self.records[token]['updated']>=TTL:del self.records[token]
        for token,when in list(self.revoked.items()):
            if now-when>=TTL:del self.revoked[token]
    def remove(self,token):
        with self.lock:
            self.records.pop(token,None);self.prune()
            if len(self.revoked)<1000:self.revoked[token]=self.clock()
    def update(self,token,body):
        if set(body)!={'lat','lng','timestamp','mode'}:raise ValueError('只接受位置与共享模式，不接收个人资料。')
        lat,lng,stamp=body['lat'],body['lng'],body['timestamp']
        if any(type(v) not in (int,float) or not math.isfinite(v) for v in (lat,lng,stamp)):raise ValueError('定位数据格式错误。')
        if abs(time.time()*1000-stamp)>20000:raise ValueError('位置已过期，请重新定位。')
        mode=body['mode']
        if mode not in ('live','demo'):raise ValueError('共享模式错误。')
        if mode=='live':
            if not 30<lat<32 or not 120<lng<122:raise ValueError('当前位置不在校区附近，未公开位置。可使用模拟体验。')
            lat,lng=gcj02(lat,lng)
        # Broad campus envelope only, not an assertion of the exact property boundary.
        if not 31.042<lat<31.051 and mode=='live':raise ValueError('当前位置不在校园共享范围，未公开位置。')
        if not 31.042<lat<31.051 or not 121.221<lng<121.2295:raise ValueError('当前位置不在校园共享范围，未公开位置。可使用模拟体验。')
        with self.lock:
            self.prune();old=self.records.get(token)
            if token in self.revoked:raise PermissionError('此共享已关闭，请重新开启。')
            if old and self.clock()-old['updated']<10:raise ValueError('更新过于频繁，请稍后重试。')
            if not old and len(self.records)>=500:raise ValueError('本地体验人数已满，请稍后重试。')
            self.records[token]={'lat':round(lat,6),'lng':round(lng,6),'mode':mode,'updated':self.clock()}
            return self.snapshot(token)
    def snapshot(self,token):
        with self.lock:
            self.prune();own=self.records.get(token)
            if not own:raise PermissionError('开启共享后才能查看其他共享小点。')
            points=[{'lat':p['lat'],'lng':p['lng'],'ttlMs':max(0,round((TTL-self.clock()+p['updated'])*1000))} for key,p in self.records.items() if key!=token and p['mode']==own['mode']]
            return {'self':{'lat':own['lat'],'lng':own['lng']},'points':points,'ttlMs':max(0,round((TTL-self.clock()+own['updated'])*1000))}

STORE=Presence()
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass
    def end_headers(self):
        self.send_header('Cache-Control','no-store, max-age=0')
        self.send_header('Referrer-Policy','same-origin')
        super().end_headers()
    def send_json(self,status,data):
        raw=json.dumps(data,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def handle_presence(self):
        origin=self.headers.get('Origin')
        if origin and origin not in ('http://'+self.headers.get('Host',''),'https://'+self.headers.get('Host','')):
            return self.send_json(403,{'message':'请求来源不匹配。'})
        auth=self.headers.get('Authorization','')
        if not re.fullmatch(r'Bearer [a-zA-Z0-9-]{48,100}',auth):return self.send_json(401,{'message':'共享会话无效。'})
        token=auth[7:]
        try:
            if self.command=='PUT':
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=512:raise ValueError('请求格式错误。')
                body=json.loads(self.rfile.read(size));result=STORE.update(token,body)
            elif self.command=='DELETE':STORE.remove(token);result={'removed':True}
            else:result=STORE.snapshot(token)
            self.send_json(200,result)
        except PermissionError as e:self.send_json(403,{'message':str(e)})
        except (ValueError,TypeError,KeyError) as e:self.send_json(400,{'message':str(e)})
    def do_GET(self):
        if self.path=='/api/presence':return self.handle_presence()
        if self.path.split('?')[0].startswith('/server/'):
            self.send_error(404);return
        super().do_GET()
    def do_PUT(self):
        if self.path=='/api/presence':self.handle_presence()
        else:self.send_error(404)
    def do_DELETE(self):
        if self.path=='/api/presence':self.handle_presence()
        else:self.send_error(404)

def cleanup():
    while True:
        time.sleep(1)
        with STORE.lock:STORE.prune()
if __name__=='__main__':
    threading.Thread(target=cleanup,daemon=True).start()
    print('Local live map: http://localhost:5182/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',5182),Handler).serve_forever()
