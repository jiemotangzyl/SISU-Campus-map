"""Local photo library, persisted outside the public website directory."""
from presence_server import Handler as BaseHandler,ThreadingHTTPServer,cleanup
from pathlib import Path
from PIL import Image,ImageOps,UnidentifiedImageError
import base64,hashlib,hmac,io,json,re,secrets,sqlite3,threading,time,uuid,warnings
from http.cookies import SimpleCookie

ROOT=Path(__file__).resolve().parents[1]
class Library:
    def __init__(self,folder):
        self.folder=Path(folder);self.folder.mkdir(parents=True,exist_ok=True)
        self.images=self.folder/'images';self.images.mkdir(exist_ok=True);self.lock=threading.RLock()
        self.db=sqlite3.connect(self.folder/'library.sqlite',check_same_thread=False)
        self.db.execute('CREATE TABLE IF NOT EXISTS photos(id TEXT PRIMARY KEY,title TEXT,category TEXT,width INTEGER,height INTEGER,created TEXT)')
        self.db.execute('CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT)');self.db.commit()
        if not self.db.execute("SELECT value FROM settings WHERE key='password'").fetchone():
            password=secrets.token_urlsafe(18);salt=secrets.token_hex(16)
            hashed=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),200000).hex()
            self.db.execute("INSERT INTO settings VALUES('password',?)",(salt+':'+hashed,));self.db.commit()
            (self.folder/'管理员登录.txt').write_text('本地照片管理页面：http://localhost:5183/admin.html\n管理员密码：'+password+'\n\n请勿公开此文件或上传到GitHub。\n',encoding='utf-8')
    def login(self,password):
        with self.lock:salt,stored=self.db.execute("SELECT value FROM settings WHERE key='password'").fetchone()[0].split(':')
        actual=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),200000).hex()
        return hmac.compare_digest(actual,stored)
    def list(self):
        with self.lock:rows=self.db.execute('SELECT id,title,category,width,height,created FROM photos ORDER BY created DESC,id DESC').fetchall()
        return [{'id':'upload-'+x[0],'photo_id':x[0],'title':x[1],'category':x[2],'width':x[3],'height':x[4],'uploaded_at':x[5],'src':'/user-photos/'+x[0]+'.jpg','public_use':True} for x in rows]
    def add(self,body):
        if body.get('consent') is not True:raise ValueError('请确认照片可公开展示。')
        title=body.get('title','');category=body.get('category','校园日常');encoded=body.get('image','')
        if not isinstance(title,str) or not 1<=len(title.strip())<=60:raise ValueError('标题请填写1至60个字。')
        if not isinstance(category,str) or category not in ['校园日常','湖畔','建筑','四季','夜色']:raise ValueError('请选择有效分类。')
        if not isinstance(encoded,str) or len(encoded)>11200000:raise ValueError('照片不能超过8MB。')
        try:raw=base64.b64decode(encoded,validate=True)
        except Exception:raise ValueError('图片内容格式错误。')
        if not 0<len(raw)<=8*1024*1024:raise ValueError('照片不能超过8MB。')
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('error',Image.DecompressionBombWarning)
                with Image.open(io.BytesIO(raw)) as im:
                    if im.format not in ['JPEG','PNG','WEBP'] or im.width*im.height>24000000 or getattr(im,'n_frames',1)>1:raise ValueError('请使用2400万像素以内的静态JPG、PNG或WebP照片。')
                    im.load();im=ImageOps.exif_transpose(im);im.thumbnail((2000,2000))
                    image=Image.new('RGB',im.size,'white');rgba=im.convert('RGBA');image.paste(rgba,mask=rgba.getchannel('A'))
                    out=io.BytesIO();image.save(out,format='JPEG',quality=86);clean=out.getvalue();width,height=image.size
        except (UnidentifiedImageError,OSError,Image.DecompressionBombError,Image.DecompressionBombWarning):raise ValueError('无法识别这张图片，请换一张照片。')
        ident=uuid.uuid4().hex;filename=self.images/(ident+'.jpg')
        with self.lock:
            if self.db.execute('SELECT COUNT(*) FROM photos').fetchone()[0]>=500 or sum(p.stat().st_size for p in self.images.glob('*.jpg'))+len(clean)>200*1024*1024:raise ValueError('本地相册容量已满，请联系管理员清理。')
            filename.write_bytes(clean)
            try:self.db.execute('INSERT INTO photos VALUES(?,?,?,?,?,?)',(ident,title.strip(),category,width,height,time.strftime('%Y-%m-%d %H:%M:%S')));self.db.commit()
            except Exception:filename.unlink(missing_ok=True);raise
        return next(p for p in self.list() if p['photo_id']==ident)
    def delete(self,ident):
        if not re.fullmatch('[a-f0-9]{32}',ident):raise ValueError('图片编号无效。')
        with self.lock:
            self.db.execute('DELETE FROM photos WHERE id=?',(ident,));self.db.commit();(self.images/(ident+'.jpg')).unlink(missing_ok=True)

LIB=None
SESSIONS={};ATTEMPTS={};SESSION_LOCK=threading.Lock()
class Handler(BaseHandler):
    def admin(self):
        cookie=SimpleCookie()
        try:cookie.load(self.headers.get('Cookie',''))
        except Exception:return False
        token=cookie.get('campus_admin')
        with SESSION_LOCK:
            for key,deadline in list(SESSIONS.items()):
                if deadline<=time.monotonic():del SESSIONS[key]
            return bool(token and SESSIONS.get(token.value,0)>time.monotonic())
    def json_body(self):
        origin=self.headers.get('Origin');host=self.headers.get('Host','')
        if origin not in ('http://'+host,'https://'+host):raise PermissionError('请求来源不匹配。')
        if self.headers.get_content_type()!='application/json':raise ValueError('请求格式错误。')
        size=int(self.headers.get('Content-Length','0'))
        if not 0<size<=12000000:raise ValueError('上传内容过大。')
        body=json.loads(self.rfile.read(size))
        if not isinstance(body,dict):raise ValueError('请求格式错误。')
        return body
    def cookie_result(self,value,payload):
        raw=json.dumps(payload).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(raw)));self.send_header('Set-Cookie',value);self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        path=self.path.split('?')[0]
        if path=='/api/photos':return self.send_json(200,{'photos':LIB.list()})
        if path=='/api/admin/session':return self.send_json(200,{'authenticated':self.admin()})
        if path=='/api/photo-capabilities':return self.send_json(200,{'uploads':True})
        if path.startswith('/user-photos/'):
            name=path.removeprefix('/user-photos/')
            if not re.fullmatch(r'[a-f0-9]{32}\.jpg',name):return self.send_error(404)
            try:raw=(LIB.images/name).read_bytes()
            except FileNotFoundError:return self.send_error(404)
            self.send_response(200);self.send_header('Content-Type','image/jpeg');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
        return super().do_GET()
    def do_POST(self):
        try:
            body=self.json_body()
            if self.path=='/api/admin/login':
                now=time.monotonic();failures=[t for t in ATTEMPTS.get('login',[]) if now-t<300]
                if len(failures)>=8:return self.send_json(429,{'message':'尝试次数过多，请5分钟后再试。'})
                password=body.get('password','')
                if not isinstance(password,str) or len(password)>128 or not LIB.login(password):
                    ATTEMPTS['login']=failures+[now];return self.send_json(401,{'message':'管理员密码不正确。'})
                token=secrets.token_urlsafe(32)
                with SESSION_LOCK:SESSIONS[token]=now+3600
                return self.cookie_result('campus_admin='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600',{'authenticated':True})
            if self.path=='/api/admin/logout':
                cookie=SimpleCookie(self.headers.get('Cookie',''));token=cookie.get('campus_admin')
                if token:
                    with SESSION_LOCK:SESSIONS.pop(token.value,None)
                return self.cookie_result('campus_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',{'authenticated':False})
            if self.path=='/api/photos':return self.send_json(201,{'photo':LIB.add(body)})
            return self.send_error(404)
        except PermissionError as e:self.send_json(403,{'message':str(e)})
        except (ValueError,TypeError,KeyError) as e:self.send_json(400,{'message':str(e)})
    def do_DELETE(self):
        if self.path.startswith('/api/photos/'):
            try:
                self.json_body()
                if not self.admin():raise PermissionError('请先登录管理员。')
                LIB.delete(self.path.removeprefix('/api/photos/'));return self.send_json(200,{'deleted':True})
            except PermissionError as e:return self.send_json(403,{'message':str(e)})
            except (ValueError,TypeError) as e:return self.send_json(400,{'message':str(e)})
        return super().do_DELETE()

if __name__=='__main__':
    LIB=Library(ROOT.parents[1]/'work/private-photo-library')
    threading.Thread(target=cleanup,daemon=True).start()
    print('Local upload preview: http://localhost:5183/ ; admin: /admin.html',flush=True)
    ThreadingHTTPServer(('127.0.0.1',5183),Handler).serve_forever()
