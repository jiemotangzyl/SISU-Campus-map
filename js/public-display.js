// Keep collection notes in the source data, outside the visitor-facing content.
const pending=/(?:永久停业|未给出|未明确|未提供|未说明|未记录|未勾选|不能把|暂无资料|暂无信息|采集表|采集人|采集资料|采集包|采集记录|资料记录|资料内|交付稿|待(?:补|核|复核|确认|采集|查|定位|交叉)|尚待|未(?:核实|确认|复核)|冲突|不一致|不详|未知)/;
export function publicText(value){
  if(typeof value!=='string')return value;
  return pending.test(value)?'':value.replace(/[（(](?:临时称谓|临时名称|暂称)[）)]/g,'').trim();
}
export function publicFacility(raw){
  function clean(value){
    if(typeof value==='string')return publicText(value);
    if(Array.isArray(value))return value.map(clean).filter(v=>v!==''&&v!=null);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v)]));
    return value;
  }
  const f=clean(raw);
  for(const conflict of raw.conflicts||[]){
    if(['departments','opening_hours','access_rules','aliases','location_desc'].includes(conflict.field))f[conflict.field]=Array.isArray(f[conflict.field])?[]:null;
  }
  f.name=raw.name.replace(/[（(][^（）()]*待[^（）()]*[）)]/g,'');
  f.services=(raw.services||[]).filter(s=>!pending.test(typeof s==='string'?s:JSON.stringify(s))).map(clean);
  for(const key of ['verified_at','content_status','verification_notes','pending_items','conflicts','field_sources','collection_ids'])delete f[key];
  return f;
}
