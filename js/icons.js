// 设施图标：按名称里的特征给出对应的线条图标，找不到时按类别兜底
const P={
  soccer:'<circle cx="12" cy="12" r="9"/><path d="M12 8.2l3.2 2.3-1.2 3.9h-4l-1.2-3.9z"/><path d="M12 8.2V3.1M15.2 10.5l5-2.2M14 14.4l3.3 5M10 14.4l-3.3 5M8.8 10.5l-5-2.2"/>',
  basketball:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c3.2 3.6 3.2 9.2 0 12.8M18.4 5.6c-3.2 3.6-3.2 9.2 0 12.8"/>',
  shuttle:'<circle cx="12" cy="18.2" r="2.8"/><path d="M9.8 16.4L6.6 5M14.2 16.4L17.4 5M12 15.4V4.4M6.6 5Q12 2.2 17.4 5"/>',
  track:'<rect x="3" y="6" width="18" height="12" rx="6"/><rect x="7" y="9.4" width="10" height="5.2" rx="2.6"/><path d="M12 9.4v5.2"/><circle cx="12" cy="12" r="1.3"/>',
  bowl:'<path d="M4 12h16a8 7 0 0 1-16 0z"/><path d="M9 4.2c-1.4 1.6 1.4 2.4 0 4M13 4.2c-1.4 1.6 1.4 2.4 0 4M17 4.2c-1.4 1.6 1.4 2.4 0 4"/>',
  gate:'<path d="M4.5 21V10a7.5 7.5 0 0 1 15 0v11"/><path d="M9 21v-7.5a3 3 0 0 1 6 0V21M2.5 21h19"/>',
  waves:'<path d="M3 8.5q3-3 6 0t6 0t6 0M3 13.5q3-3 6 0t6 0t6 0M3 18.5q3-3 6 0t6 0t6 0"/>',
  hall:'<path d="M3 9.5L12 3.5l9 6zM6 11.5v7.5M10 11.5v7.5M14 11.5v7.5M18 11.5v7.5M3.5 21h17"/>',
  speech:'<path d="M4 4h10.5A1.5 1.5 0 0 1 16 5.5v5A1.5 1.5 0 0 1 14.5 12H9l-3.5 3v-3H4a1.5 1.5 0 0 1-1.500-1.500v-5A1.5 1.5 0 0 1 4 4z"/><path d="M19 9h1.500a1.500 1.500 0 0 1 1.500 1.500v5a1.500 1.500 0 0 1-1.500 1.500H19v3l-3.500-3H11a1.500 1.500 0 0 1-1.500-1.500V14"/>',
  admin:'<path d="M5 21V9h14v12M3.5 21h17M12 9V3M12 3h5v3h-5M10 21v-4h4v4M8 12.5h1.500M14.500 12.500H16"/>',
  school:'<path d="M3 21h18M5 21V8l7-4.5L19 8v13"/><path d="M9 11.500h2M13 11.500h2M9 15.500h2M13 15.500h2"/>',
  book:'<path d="M12 6.200C10 4.600 7 4 3 4v14c4 0 7 .4 9 2 2-1.600 5-2 9-2V4c-4 0-7 .6-9 2.200zM12 6.200V20"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7.500h14M5 16.500h14"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3.500 20c0-3.300 2.500-5.500 5.500-5.500s5.500 2.200 5.500 5.500"/><circle cx="17" cy="9" r="2.400"/><path d="M16 14.600c2.800-.3 5 1.700 5 4.600"/>',
  road:'<path d="M8 21L10.500 3M16 21l-2.500-18"/><path d="M12 4.500v2.500M12 10v3M12 16.500v3.500"/>',
  parking:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 17V8h3.200a2.700 2.700 0 0 1 0 5.400H10"/>',
  bike:'<circle cx="6" cy="16" r="3.500"/><circle cx="18" cy="16" r="3.500"/><path d="M6 16l3.500-7H15l3 7M9.500 9L12 16h6M13 6.500h3M8 7.200h3"/>',
  lockerBall:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 12h16"/><circle cx="12" cy="7.500" r="2.200"/><path d="M9.800 7.500h4.400M12 5.300v4.400"/><path d="M8 15h3v3H8zM13 15h3v3h-3z"/>',
  lockerPhone:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18"/><rect x="6.500" y="7" width="3" height="6" rx=".8"/><rect x="14.500" y="7" width="3" height="6" rx=".8"/><path d="M7.500 17h1M15.500 17h1"/>'
};
const BY_NAME=[
  [/篮球扫码/,'lockerBall'],[/手机寄存/,'lockerPhone'],[/非机动车/,'bike'],[/停车/,'parking'],
  [/操场/,'track'],[/足球/,'soccer'],[/篮球/,'basketball'],[/羽毛球/,'shuttle'],
  [/图书|图文/,'book'],[/全球治理/,'globe'],[/师生活动/,'people'],[/食堂/,'bowl'],[/行政楼/,'admin'],
  [/教学楼/,'school'],[/镜湖/,'waves'],[/会堂/,'hall'],[/博物馆/,'speech'],[/主干道|路/,'road'],[/[南西北东]门/,'gate']
];
const BY_CATEGORY={教学学习:'school',餐饮:'bowl',体育运动:'track',生活服务:'lockerBall',行政办事:'admin',文化场馆:'hall',校门道路:'road'};
export function facilityIcon(f){
  const hit=BY_NAME.find(([re])=>re.test(f.name||''));
  const key=hit?hit[1]:(BY_CATEGORY[f.category]||'school');
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${P[key]}</svg>`;
}
