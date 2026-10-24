import{hasPhotoBackend,photoFetch,compressedPhoto}from'./photo-api.js?v=20261023-sync';
const $=id=>document.getElementById(id);let objectURL=null;
async function available(){if(!hasPhotoBackend)return false;try{const r=await photoFetch('/api/photo-capabilities',{cache:'no-store'});const d=await r.json();return r.ok&&d.uploads===true;}catch{return false;}}
if(await available()){$('upload-service').hidden=true;$('upload-form').hidden=false;}else{$('upload-service').textContent='照片上传暂未开放，仍可浏览校园风景。';}
const pickBox=document.querySelector('.upload-picker'),pickImg=document.querySelector('.pick-img'),pickHint=document.querySelector('.upload-picker .add-hint');function showPick(file){pickImg.hidden=!file;pickBox.classList.toggle('has-photo',!!file);pickHint.textContent=file?'点击更换照片':'在此处点击＋选择照片';if(file){objectURL=URL.createObjectURL(file);pickImg.src=objectURL;}else{pickImg.removeAttribute('src');objectURL=null;}}
$('photo-file').onchange=()=>{if(objectURL)URL.revokeObjectURL(objectURL);showPick($('photo-file').files[0]);};
$('upload-form').onsubmit=async e=>{e.preventDefault();const file=$('photo-file').files[0];if(!file)return;const status=$('upload-status');if(file.size>20*1024*1024){status.textContent='照片不能超过20MB，请选择较小的照片。';return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='请选择JPG、PNG或WebP照片。';return;}if(!$('photo-consent').checked)return;
  $('upload-submit').disabled=true;status.textContent='正在压缩并提交审核…';
  try{const image=await compressedPhoto(file);const res=await photoFetch('/api/photos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:$('photo-title').value.trim(),category:$('photo-category').value,image,consent:true})});const d=await res.json();if(!res.ok)throw Error(d.message||'上传失败，请重试。');$('upload-view').href='scenery.html';$('upload-form').hidden=true;$('upload-success').hidden=false;status.textContent='';}catch(e){status.textContent=e.message;}finally{$('upload-submit').disabled=false;}
};
$('upload-another').onclick=()=>{$('upload-form').reset();if(objectURL)URL.revokeObjectURL(objectURL);showPick(null);$('upload-success').hidden=true;$('upload-form').hidden=false;};
