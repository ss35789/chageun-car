// 권한과 접근 경로가 확보된 환경에서 일정 실행기에 등록합니다.
// 직접 호출할 때만 실행하며, 이 파일 자체가 스케줄을 만들지는 않습니다.
const { SITE_URL, REFRESH_SECRET } = process.env;
if (!SITE_URL || !REFRESH_SECRET || REFRESH_SECRET.length < 32) {
  throw new Error('SITE_URL 및 32자 이상 REFRESH_SECRET을 서버 환경에 설정하세요.');
}
const url = new URL('/api/refresh', SITE_URL);
if (url.protocol !== 'https:') throw new Error('HTTPS 사이트 주소가 필요합니다.');
const response = await fetch(url, {
  method: 'POST',
  redirect: 'error',
  signal: AbortSignal.timeout(60000),
  headers: { Authorization: `Bearer ${REFRESH_SECRET}`, 'Content-Type': 'application/json' },
  body: '{}',
});
const result = await response.json();
if (!response.ok) throw new Error(result.error || `갱신 응답 ${response.status}`);
console.log(JSON.stringify(result));
