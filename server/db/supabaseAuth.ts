import {createClient,type Session} from '@supabase/supabase-js';
import type {IncomingMessage,ServerResponse} from 'node:http';
import crypto from 'node:crypto';
import {database} from './connection';
import {readPortal,writePortal} from './repository';
const error=(status:number,message:string)=>Object.assign(new Error(message),{status});
function client(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;if(!url || !key)throw error(503,'اتصال Supabase Auth هنوز کامل نشده است.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});}
const cookie=(req:IncomingMessage,name:string)=>(req.headers.cookie || '').split(';').map(value=>value.trim()).find(value=>value.startsWith(name+'='))?.slice(name.length+1);
function cookies(req:IncomingMessage,res:ServerResponse,session:Session|null){const secure=process.env.NODE_ENV==='production'?'; Secure':'';const values=[`sp_access=${session?.access_token || ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${session?.expires_in || 0}${secure}`,`sp_refresh=${session?.refresh_token || ''}; Path=/api/portal; HttpOnly; SameSite=Lax; Max-Age=${session?2592000:0}${secure}`];res.setHeader('Set-Cookie',values);req.headers.cookie=[...(req.headers.cookie || '').split(';').filter(value=>!/^\s*sp_(access|refresh)=/.test(value)),`sp_access=${session?.access_token || ''}`,`sp_refresh=${session?.refresh_token || ''}`].join(';');}
function phone(raw:string){const value=String(raw || '').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[\s()-]/g,'').replace(/^(\+98|0098|98)/,'0');if(!/^09\d{9}$/.test(value))throw error(400,'شماره موبایل معتبر وارد کنید.');return {local:value,e164:'+98'+value.slice(1)};}
export async function supabaseIdentity(req:IncomingMessage,db:{users:any[]}){
 const token=cookie(req,'sp_access');if(!token)return {admin:false};
 const result=await client().auth.getUser(token);if(result.error){if(result.error.status && result.error.status>=500)throw error(503,'بررسی ورود در دسترس نیست.');return {admin:false};}
 const user=db.users.find(profile=>profile.authUserId===result.data.user.id && profile.active!==false);return {admin:user?.role==='admin',user};
}
export async function refreshAuth(req:IncomingMessage,res:ServerResponse){const token=cookie(req,'sp_access'),refresh=cookie(req,'sp_refresh');if(!refresh)return;const auth=client();if(token){const result=await auth.auth.getUser(token);if(!result.error)return;}const result=await auth.auth.refreshSession({refresh_token:refresh});if(!result.error && result.data.session)cookies(req,res,result.data.session);}
export async function supabaseAuthAction(req:IncomingMessage,res:ServerResponse,body:any,safe:(value:any)=>any):Promise<boolean>{
 if(!['register','login','admin_login','otp_request','otp_verify','logout'].includes(body.action))return false;
 const send=(status:number,data:any)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 try{
 const auth=client();
 if(body.action==='logout'){const access=cookie(req,'sp_access'),refresh=cookie(req,'sp_refresh');if(access && refresh){const sdk=client();await sdk.auth.setSession({access_token:access,refresh_token:refresh});await sdk.auth.signOut({scope:'local'});}cookies(req,res,null);send(200,{success:true});return true;}
 if(body.action==='register'){
  const p=body.payload || {},number=phone(p.mobile);
  for(const field of ['firstName','lastName','companyName','provinceId','cityId','activityField'])if(typeof p[field]!=='string' || !p[field].trim() || p[field].length>300)throw error(400,'تمام اطلاعات الزامی را کامل کنید.');
  const username=String(p.username || '').trim().toLowerCase();if(!/^[a-z][a-z0-9_]{3,31}$/.test(username))throw error(400,'نام کاربری معتبر وارد کنید.');
  if(typeof p.password!=='string' || p.password.length<10 || p.password.length>128 || p.password===number.local)throw error(400,'رمز امن و متفاوت با شماره موبایل وارد کنید.');
  const db=await readPortal();if(db.users.some(user=>user.phone===number.local || user.username===username))throw error(409,'این شماره یا نام کاربری قبلاً ثبت شده است.');
  const draft={id:crypto.randomUUID(),username,phone:number.local,mobile:number.local,firstName:p.firstName,lastName:p.lastName,fullName:p.firstName+' '+p.lastName,companyName:p.companyName,email:p.email || '',provinceId:p.provinceId,cityId:p.cityId,province:p.province,city:p.city,activityField:p.activityField,role:'retail',approvedB2B:false,clubTier:'bronze',clubPoints:0,totalPurchases:0,creditLimit:0,addresses:[],favoriteBrands:[],onboardingCompleted:false,createdAt:new Date().toISOString()};
  await database().query('insert into app_private.auth_provisioning(id,phone,payload) values($1,$2,$3)',[draft.id,number.local,JSON.stringify(draft)]);
  const result=await auth.auth.signUp({phone:number.e164,password:p.password});if(result.error || !result.data.user)throw error(400,'ثبت حساب در Supabase Auth انجام نشد؛ تنظیمات پیامک و اطلاعات را بررسی کنید.');
  const current=await readPortal();current.users.push({...draft,authUserId:result.data.user.id});await writePortal(current,current.revision);
  await database().query("update app_private.auth_provisioning set status='linked' where id=$1",[draft.id]);
  if(result.data.session)cookies(req,res,result.data.session);
  send(201,{success:true,user:result.data.session?safe(draft):undefined,requiresPhoneVerification:!result.data.session,credentials:{username},isNewUser:true,message:'کد تأیید شماره را وارد کنید.'});return true;
 }
 if(body.action==='otp_request'){const number=phone(body.phone);const result=await auth.auth.signInWithOtp({phone:number.e164,options:{shouldCreateUser:false}});if(result.error)throw error(400,'ارسال کد انجام نشد؛ شماره و تنظیمات پیامک Supabase Auth را بررسی کنید.');send(200,{success:true,retryAfter:60,message:'اگر حساب فعال وجود داشته باشد، کد تأیید ارسال می‌شود.'});return true;}
 let session:Session|null=null;
 if(body.action==='otp_verify'){const result=await auth.auth.verifyOtp({phone:phone(body.phone).e164,token:String(body.code || '').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))),type:'sms'});if(result.error)throw error(401,'کد واردشده معتبر نیست.');session=result.data.session;}
 else{const db=await readPortal();const identifier=String(body.identifier || body.username || '').trim().toLowerCase();const profile=db.users.find(user=>user.username?.toLowerCase()===identifier || user.phone===identifier);if(!profile?.authUserId)throw error(401,'ورود معتبر نیست یا انتقال حساب به Supabase Auth باید تکمیل شود.');const result=await auth.auth.signInWithPassword({phone:phone(profile.phone).e164,password:String(body.password || '')});if(result.error)throw error(401,'نام کاربری یا رمز عبور معتبر نیست؛ در صورت نیاز از ورود پیامکی استفاده کنید.');session=result.data.session;}
 if(!session)throw error(401,'نشست ورود ایجاد نشد.');cookies(req,res,session);
 let db=await readPortal();let profile=db.users.find(user=>user.authUserId===session!.user.id);
 if(!profile && session.user.phone_confirmed_at){const local=phone(session.user.phone!).local;const pending=(await database().query("select id,payload from app_private.auth_provisioning where phone=$1 and status='pending' order by created_at desc limit 1",[local])).rows[0];if(pending){profile={...pending.payload,authUserId:session.user.id};db.users.push(profile!);await writePortal(db,db.revision);await database().query("update app_private.auth_provisioning set status='linked' where id=$1",[pending.id]);}}
 if(!profile || (body.action==='admin_login' && profile.role!=='admin')){cookies(req,res,null);throw error(403,'این حساب دسترسی لازم را ندارد.');}
 send(200,{success:true,user:safe(profile),admin:profile.role==='admin',onboardingStep:profile.onboardingCompleted?'completed':1});return true;
 }catch(e:any){send(e.status || 503,{success:false,message:e.status?e.message:'ارتباط با Supabase Auth برقرار نشد.'});return true;}
}
