import{publicFacility}from'./public-display.js?v=20261020-latest';
export const CATEGORIES=['全部','教学学习','餐饮','体育运动','生活服务','行政办事','文化场馆','校门道路'];
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function loadData(){const r=await fetch('data/campus_facilities.json',{cache:'no-cache'});if(!r.ok)throw Error('资料文件读取失败');const data=await r.json();if(!Array.isArray(data)||data.some(f=>!f.id||!f.name)||new Set(data.map(f=>f.id)).size!==data.length)throw Error('资料格式有误');return data.map(publicFacility);}
export function filterFacilities(data,q='',category='全部'){q=q.trim().toLocaleLowerCase();return data.filter(f=>(category==='全部'||f.category===category)&&(!q||JSON.stringify([f.name,f.id,f.aliases,f.departments,f.services,f.summary,f.location_desc]).toLocaleLowerCase().includes(q)));}
export function isLocated(f){return typeof f.latitude==='number'&&typeof f.longitude==='number'&&f.latitude!==0&&f.longitude!==0&&Math.abs(f.latitude)<=90&&Math.abs(f.longitude)<=180&&f.coordinate_system==='GCJ-02'&&['腾讯地图POI','已定位，待现场复核','已现场复核'].includes(f.coordinate_status)&&!!f.coordinate_source;}
export const detailUrl=id=>'building.html?id='+encodeURIComponent(id);
export function safeURL(value){if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function saveState(value){try{sessionStorage.setItem('sisu-map-state',JSON.stringify(value));}catch{}}
export function readState(){try{return JSON.parse(sessionStorage.getItem('sisu-map-state'))||{};}catch{return {};}}

