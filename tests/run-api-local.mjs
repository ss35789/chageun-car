import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0'],{stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
let done=false;let serverLog='';server.stdout.on('data',b=>serverLog=(serverLog+String(b)).slice(-8000));server.stderr.on('data',b=>serverLog=(serverLog+String(b)).slice(-8000));
async function stop(){if(done)return;done=true;if(process.platform!=='win32'){try{process.kill(-server.pid,'SIGTERM')}catch{}}else server.kill('SIGTERM')}
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('로컬 서버 시작 시간 초과')),60000);server.stdout.on('data',b=>{if(String(b).includes('Ready on')){clearTimeout(timeout);resolve()}});server.once('exit',code=>{clearTimeout(timeout);reject(new Error('로컬 서버 종료 '+code))})});
 const r=await fetch('http://127.0.0.1:8787/');const html=await r.text();if(r.status!==200||!html.includes('첫 중고차')||html.includes('Internal Server Error'))throw new Error('홈 서버 렌더링 실패');console.log('홈 HTML 렌더링 정상 · 구매조건·게시판 포함');
 await new Promise(resolve=>setTimeout(resolve,1500));
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['--experimental-strip-types','--test','tests/api.test.mjs'],{stdio:'inherit'});child.once('exit',resolve)});
 if(code!==0){process.exitCode=1;console.log(serverLog)}
}finally{await stop()}
