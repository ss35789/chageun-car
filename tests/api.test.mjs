import assert from 'node:assert/strict';
import {test} from 'node:test';
import {defaultProfile} from '../lib/car-domain.ts';
// 로컬 빌드 검증 전용. 배포 사이트에 테스트 사용자 헤더를 보내지 않습니다.
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8787';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('로컬 테스트 주소만 허용됩니다.');
const prefix='qa-'+Date.now();
async function api(path,method='GET',body,user='a',origin=base){
 const headers={'Content-Type':'application/json',Origin:origin,Connection:'close'};
 if(user){headers['oai-authenticated-user-id']=prefix+'-'+user;headers['oai-authenticated-user-email']='local-'+user+'@example.test'}
 const res=await fetch(base+'/api/'+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});
 const raw=await res.text();let data;try{data=JSON.parse(raw)}catch{throw new Error(`${method} ${path}: ${res.status} ${raw.slice(0,500)}`)}return {status:res.status,data};
}
test('저장·수정·찜·비교 입력·게시판·문의 권한 핵심 흐름',async()=>{
 let r=await api('state','GET',null,null);assert.equal(r.status,200);assert.equal(r.data.user,null);assert.equal(r.data.listings.filter(c=>c.demo).length,3);
 assert.equal((await api('profile','PUT',{...defaultProfile,months:0})).status,400);
 assert.equal((await api('profile','PUT',{...defaultProfile,monthly:55})).status,200);
 assert.equal((await api('state')).data.profile.monthly,55);
 const mediaStatus=async(path,headers={})=>{const r=await fetch(base+path,{headers});const b=await r.arrayBuffer();if(r.status===503)console.log('media error',new TextDecoder().decode(b));return r.status};
 const uploadHeaders={'oai-authenticated-user-id':prefix+'-a','oai-authenticated-user-email':'local-a@example.test',Origin:base};
 const imageForm=new FormData();imageForm.append('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'test.png');
 const upload=await fetch(base+'/api/upload',{method:'POST',headers:uploadHeaders,body:imageForm});assert.equal(upload.status,201);const photo=(await upload.json()).url;
 assert.equal(await mediaStatus(photo,uploadHeaders),200);
 assert.equal(await mediaStatus(photo),404);
 const listing={make:'기아',modelname:'니로 하이브리드',generation:'DE',fuel:'하이브리드',modelkey:'niro',title:'로컬 테스트 판매글',year:2017,firstregistered:'2017-06',trim:'1.6 HEV 프레스티지',mileage:100000,price:1200,region:'서울 송파',sellertype:'개인',status:'판매중',accident:'없음',repair:'',maintenance:'',options:[],description:'로컬 데이터베이스에서 검증하는 테스트 자료입니다.',images:[photo],transmission:'자동'};
 assert.equal((await api('listings','POST',listing,'b')).status,403);
 r=await api('listings','POST',listing);assert.equal(r.status,201);const lid=r.data.id;assert.equal(await mediaStatus(photo),200);
 assert.equal((await api('listings/'+lid,'PUT',{...listing,price:1150},'b')).status,403);
 assert.equal((await api('listings/'+lid,'PUT',{...listing,price:1150})).status,200);
 r=await api('state');assert.equal(r.data.listings.find(c=>c.id===lid).previousprice,1200);
 assert.equal(r.data.listings.find(c=>c.id===lid).verified,false);
 assert.equal((await api('favorites','PUT',{listingid:lid,active:true},'b')).status,200);
 assert.ok((await api('state','GET',null,'b')).data.favorites.includes(lid));
 assert.equal((await api('inquiries','POST',{listingid:lid,body:'테스트 문의'},'a')).status,400);
 // 로컬 테스트 레코드만 사용합니다. 외부 사용자나 메일로 전송하지 않습니다.
 assert.equal((await api('inquiries','POST',{listingid:lid,body:'로컬 테스트 문의'},'b')).status,201);
 assert.equal((await api('inquiries','GET',null,'a')).data.length,1);
 assert.equal((await api('inquiries','GET',null,'c')).data.length,0);
 r=await api('posts','POST',{category:'구매상담',title:'테스트 게시글',body:'로컬 게시판 테스트 본문입니다.',modelkey:'niro',images:[]});assert.equal(r.status,201);const pid=r.data.id;
 assert.equal((await api('comments','POST',{postid:pid,body:'테스트 댓글'},'b')).status,201);
 r=await api('comments?postid='+pid);assert.equal(r.data.length,1);const cid=r.data[0].id;
 assert.equal((await api('comments','PATCH',{id:cid,hide:true},'a')).status,403);
 assert.equal((await api('comments','PATCH',{id:cid,body:'수정 댓글'},'b')).status,200);
 assert.equal((await api('comments?postid='+pid)).data[0].body,'수정 댓글');
 assert.equal((await api('reports','POST',{targettype:'post',targetid:pid,reason:'로컬 테스트 신고'},'b')).status,201);
 assert.equal((await api('reports','GET',null,'b')).status,403);
 assert.equal((await api('blocks','PUT',{targetid:prefix+'-a',active:true},'b')).status,200);
 assert.ok(!(await api('state','GET',null,'b')).data.listings.some(c=>c.id===lid));
 assert.equal((await api('inquiries','POST',{listingid:lid,body:'차단 상태 테스트'},'b')).status,403);
 assert.equal((await api('hide','POST',{id:lid},'b')).status,403);
 assert.equal((await api('hide','POST',{id:lid})).status,200);
 assert.ok(!(await api('state')).data.listings.some(c=>c.id===lid));
 assert.equal((await api('hide','POST',{id:pid})).status,200);
 assert.equal((await api('refresh','POST',{},'a')).status,403);
 assert.equal((await api('profile','PUT',defaultProfile,null)).status,401);
 assert.equal((await api('profile','PUT',defaultProfile,'a','https://unrelated.example')).status,403);

});
