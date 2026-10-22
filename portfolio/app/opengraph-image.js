import { ImageResponse } from 'next/og';

export const alt = 'Jaelani Surya Saputra — Web Developer & IT, Jay Szrs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '65px 75px', background: '#050506', color: '#ededef', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', fontSize: 26, color: '#a1a1a8' }}>Jay Szrs / jayszrs.my.id</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ display: 'flex', fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>Jaelani Surya</div><div style={{ display: 'flex', fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>Saputra.</div></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333338', paddingTop: 28, fontSize: 25 }}><span>Web Developer &amp; IT</span><span style={{ color: '#a1a1a8' }}>Jakarta / Bekasi</span></div>
  </div>, size);
}
