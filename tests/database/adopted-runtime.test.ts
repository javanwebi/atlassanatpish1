import test from 'node:test';import assert from 'node:assert/strict';
import {adoptedDatabase} from './adopted.fixture';
import {readAdoptedProducts,saveAdoptedProducts,readAdoptedDocument,writeAdoptedDocument,persistAdoptedUsers,adoptedUsers} from '../../server/db/adopted';
import {createAdoptedOrder,adoptedOrders} from '../../server/db/adoptedCheckout';
import type {SqlClient} from '../../server/db/connection';
import {getPortalIdentity} from '../../api/portal';
import type {IncomingMessage} from 'node:http';
const id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
test('anonymous database identity does not load private portal documents or authorize commerce',async()=>{const previous=process.env.DATA_BACKEND;try{process.env.DATA_BACKEND='postgres';assert.deepEqual(await getPortalIdentity({headers:{cookie:'sp_guest=untrusted'}} as IncomingMessage),{admin:false,user:undefined,canReadCommerce:false});}finally{if(previous===undefined)delete process.env.DATA_BACKEND;else process.env.DATA_BACKEND=previous;}});
test('adopted runtime retains real codes, currency, stock and unknown UI fields without prototype tables',async()=>{const db=await adoptedDatabase();const sql=db as unknown as SqlClient;try{
 await saveAdoptedProducts(sql,[{code:'source-family',name:'Bearing',categorySlug:'bearings',categoryName:'Bearings',variants:[{code:'6202ZZ',name:'6202ZZ',stock:999,prices:{retail:999}}]}]);
 await db.exec("update public.variant_commercial_specs set stock=10,stock_known=true,retail_price=1200,currency='IRR',inquiry_only=false where variant_code='6202ZZ'");
 const first=(await readAdoptedProducts(sql))[0];assert.equal(first.variants[0].prices.retail,120);assert.equal(first.variants[0].stock,10);
 await saveAdoptedProducts(sql,[{...first,name:'Updated bearing'}]);const row=(await db.query<any>('select * from public.variant_commercial_specs')).rows[0];assert.equal(row.stock,10);assert.equal(Number(row.retail_price),1200);assert.equal(row.currency,'IRR');
 await db.exec('begin');await writeAdoptedDocument(sql,'custom-state',{unknown:{kept:true}},'user:one');await db.exec('commit');assert.deepEqual(await readAdoptedDocument(sql,'custom-state','user:one'),{unknown:{kept:true}});assert.equal(await readAdoptedDocument(sql,'custom-state','user:two'),undefined);
 for(let i=1;i<=26;i++){const result=await db.query<any>("insert into app_private.rate_limits(bucket,attempts,expires_at) values('probe',1,now()+interval '15 minutes') on conflict(bucket) do update set attempts=rate_limits.attempts+1 returning attempts");assert.equal(result.rows[0].attempts,i);}
 await db.exec('begin');await writeAdoptedDocument(sql,'atlas_admin_pages_v1',[{id:'about',slug:'about',title:'About',content:'Industrial supply',unknown:42}],'global');await db.exec('commit');assert.equal((await db.query<any>('select title from public.static_pages')).rows[0].title,'About');assert.equal((await readAdoptedDocument(sql,'atlas_admin_pages_v1','global'))[0].unknown,42);await db.exec("update public.static_pages set title='Edited directly in Supabase' where id='about'");assert.equal((await readAdoptedDocument(sql,'atlas_admin_pages_v1','global'))[0].title,'Edited directly in Supabase');
 await db.exec('set role anon');await assert.rejects(db.query('select * from app_private.scoped_documents'));await assert.rejects(db.query('select * from public.variant_commercial_specs'));
 }finally{await db.close();}});
test('adopted checkout uses Auth identity, own address, database prices, reservations and replay protection',async()=>{const db=await adoptedDatabase();const sql=db as unknown as SqlClient;try{
 await db.query('insert into auth.users(id,phone,phone_confirmed_at) values($1,$2,now()),($3,$4,now())',[id,'989120000001',other,'989120000002']);
 const profile={id:'legacy-buyer',authUserId:id,fullName:'Buyer',role:'admin',password:'must-not-persist',addresses:[{id:'factory',province:'Yazd',city:'Yazd',fullAddress:'Factory'}]};await persistAdoptedUsers(sql,[profile]);
 assert.equal((await adoptedUsers(sql)).find(u=>u.authUserId===id)?.role,'retail');assert.equal((await db.query<any>('select count(*)::int as n from app_private.portal_users')).rows[0].n,0);assert.equal((await db.query<any>('select preferences from public.user_profiles where id=$1',[id])).rows[0].preferences.password,undefined);assert.equal((await adoptedUsers(sql)).find(u=>u.authUserId===id)?.addresses[0].fullAddress,'Factory');
 await saveAdoptedProducts(sql,[{code:'family',name:'Part',categorySlug:'parts',categoryName:'Parts',variants:[{code:'part',name:'Part'}]}]);await db.exec("update public.variant_commercial_specs set stock=3,stock_known=true,inquiry_only=false,retail_price=1000,currency='IRR'");
 const input={requestKey:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',items:[{code:'part',quantity:2,unitPrice:1}],addressId:'factory',shippingId:'freight',paymentMethod:'online',paymentStatus:'paid'};
 await db.exec('begin');const order=await createAdoptedOrder(sql,profile,input);await db.exec('commit');assert.equal(order.finalAmount,200);assert.equal(order.paymentStatus,'awaiting_payment');
 await db.exec('begin');assert.equal((await createAdoptedOrder(sql,profile,input)).id,order.id);await db.exec('commit');assert.equal((await db.query<any>('select stock_reserved from public.variant_commercial_specs')).rows[0].stock_reserved,2);
 assert.equal((await adoptedOrders(sql,other)).length,0);
 await db.exec('begin');await assert.rejects(createAdoptedOrder(sql,profile,{...input,requestKey:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',items:[{code:'part',quantity:2}]}),/استعلام/);await db.exec('rollback');
 await db.exec('begin');await assert.rejects(createAdoptedOrder(sql,profile,{...input,requestKey:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',addressId:'other'}),/نشانی/);await db.exec('rollback');
 assert.equal((await db.query<any>('select count(*)::int as n from public.orders')).rows[0].n,1);
 }finally{await db.close();}});
