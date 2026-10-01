import assert from 'node:assert/strict';
import {test} from 'node:test';
import {defaultProfile,evaluate,installment,marketSummary,seedListings} from '../lib/car-domain.ts';
const car=seedListings[0];
test('할부는 무이자와 유이자를 처리하고 기간 0에서 무한값을 만들지 않는다',()=>{
 assert.equal(installment(1200,0,12),100);
 assert.ok(Math.abs(installment(1200,6,12)-103.28)<.1);
 assert.equal(installment(0,6,12),0);
 assert.equal(installment(1200,6,0),0);
 assert.equal(evaluate(car,{...defaultProfile,months:0}),null);
});
test('현금 지출 항목의 합, 보험 견적 보정, 할부 추가분이 일치한다',()=>{
 const cash=evaluate(car,defaultProfile);
 const loan=evaluate(car,{...defaultProfile,payment:'loan'});
 assert.equal(cash.low,Math.round((cash.insurance[0]+cash.fuel[0]+cash.model.tax+cash.model.reserve[0]+7)*10)/10);
 assert.ok(Math.abs(loan.high-cash.high-loan.loan)<.11);
 assert.equal(evaluate(car,{...defaultProfile,insurancequote:120}).insurance[0],10);
 assert.ok(loan.initial<cash.initial);
});
test('예산·탑승·월 한도 미달은 추천 대상에서 제외한다',()=>{
 const result=evaluate(car,{...defaultProfile,budget:500,monthly:5,passengers:9});
 assert.equal(result.eligible,false);
 assert.equal(result.blockers.length,3);
 assert.equal(evaluate({...car,status:'판매완료'},defaultProfile).eligible,false);
 assert.equal(evaluate({...car,modelkey:'other'},defaultProfile),null);
});
test('거리·가중치 변화가 실제 비용과 점수에 반영된다',()=>{
 const low=evaluate(car,{...defaultProfile,annualkm:0});
 const high=evaluate(car,{...defaultProfile,annualkm:24000});
 assert.ok(high.high>low.high);
 assert.ok(high.score<low.score);
 const purpose=evaluate(car,{...defaultProfile,weights:{cost:0,purpose:100,space:0}});
 assert.equal(purpose.score,purpose.scores.purpose);
});
test('시장 가격은 자료가 적거나 차종이 미식별이면 만들지 않는다',()=>{
 assert.equal(marketSummary(car,[]).available,false);
 assert.equal(marketSummary({...car,modelkey:'other'},[]).available,false);
});
test('중복·오래된 자료·이상값을 제외하고 중앙값과 범위를 계산한다',()=>{
 const now=Date.parse('2026-09-30T12:00:00Z');
 const make=(id,price,observedat='2026-09-29T00:00:00Z')=>({id,price,observedat,modelkey:car.modelkey,trim:car.trim,year:car.year,mileage:car.mileage,accident:car.accident,source:'가상 테스트',sourceurl:'https://example.test'});
 const rows=Array.from({length:12},(_,i)=>make('r'+i,1000+i*10));
 rows.push(make('r0',9999),make('old',600,'2026-08-01T00:00:00Z'),make('outlier',9999));
 const s=marketSummary(car,rows,now);
 assert.equal(s.available,true); assert.equal(s.n,12); assert.equal(s.excluded,1);
 assert.equal(s.median,1055); assert.equal(s.low,1027.5); assert.equal(s.high,1082.5);
});
