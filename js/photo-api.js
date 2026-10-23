import{PHOTO_BACKEND_ORIGIN}from'./backend-config.js?v=20261023-sync';
export const photoBackendOrigin=PHOTO_BACKEND_ORIGIN;
export const hasPhotoBackend=/^https:\/\//.test(photoBackendOrigin);
let deviceToken='';try{deviceToken=localStorage.getItem('sisu-photo-device')||'';}catch{}
async function deviceSession(){if(deviceToken)return deviceToken;const response=await fetch(photoBackendOrigin+'/api/device-session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok)throw Error('投稿服务暂时不可用');deviceToken=(await response.json()).token;try{localStorage.setItem('sisu-photo-device',deviceToken);}catch{}return deviceToken;}
export function saveAdminToken(token){try{if(token)sessionStorage.setItem('sisu-photo-admin',token);else sessionStorage.removeItem('sisu-photo-admin');}catch{}}
export async function photoFetch(path,options={}){
 const headers=new Headers(options.headers);let token='';try{token=sessionStorage.getItem('sisu-photo-admin')||'';}catch{}
 if(path==='/api/photos'&&options.method==='POST')token=await deviceSession();
 if(token)headers.set('Authorization','Bearer '+token);
 let result=await fetch(photoBackendOrigin+path,{...options,headers,signal:options.signal||AbortSignal.timeout(30000)});if(result.status===401&&path==='/api/photos'&&options.method==='POST'){deviceToken='';headers.set('Authorization','Bearer '+await deviceSession());result=await fetch(photoBackendOrigin+path,{...options,headers,signal:options.signal||AbortSignal.timeout(30000)});}return result;
}
export async function compressedPhoto(file){
  const image=await createImageBitmap(file);try{let edge=1200;for(let attempt=0;attempt<7;attempt++){
    const scale=Math.min(1,edge/image.width,edge/image.height),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
    for(const quality of [.82,.65,.48]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=48*1024){return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(Error('无法读取照片。'));reader.readAsDataURL(blob);});}}
    edge=Math.round(edge*.75);
  }throw Error('这张照片压缩后仍过大，请选择较小的照片。');}finally{image.close();}
}
