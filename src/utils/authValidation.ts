import { IRAN_PROVINCES, ACTIVITY_FIELDS } from "../data/iranLocations";
export const normalizeDigits=(value:string)=>value.replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
export const mobileInput=(value:string)=>normalizeDigits(value).replace(/[^0-9]/g,"").slice(0,11);
export const identifierInput=(value:string)=>normalizeDigits(value).replace(/[^a-zA-Z0-9_]/g,"").slice(0,32);
export const personNameInput=(value:string)=>value.replace(/[^\p{L}\p{M}\s\u200c'-]/gu,"").slice(0,50);
export function authRegistrationError(p:Record<string,unknown>):string|null {
 if(typeof p.mobile!=="string" || !/^09[0-9]{9}$/.test(normalizeDigits(p.mobile)))return "شماره موبایل باید دقیقاً ۱۱ رقم و با 09 شروع شود.";
 for(const field of ["firstName","lastName"]) {
  const value=typeof p[field]==="string"?(p[field] as string).trim():"";
  if(value.length<2 || value.length>50 || !/^[\p{L}\p{M}\s\u200c'-]+$/u.test(value) || !/\p{L}/u.test(value))return "نام و نام خانوادگی باید ۲ تا ۵۰ نویسه و فقط شامل حروف باشند.";
 }
 if(typeof p.companyName!=="string" || p.companyName.trim().length<2 || p.companyName.length>150 || /[\u0000-\u001f\u007f]/.test(p.companyName))return "نام شرکت یا فروشگاه باید ۲ تا ۱۵۰ نویسه باشد.";
 const province=IRAN_PROVINCES.find(item=>item.id===p.provinceId);
 if(!province || !province.cities.some(item=>item.id===p.cityId))return "استان و شهر معتبر و مرتبط انتخاب کنید.";
 if(typeof p.activityField!=="string" || !ACTIVITY_FIELDS.some(value=>value===p.activityField))return "زمینه فعالیت را از فهرست انتخاب کنید.";
 if(p.email && (typeof p.email!=="string" || p.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)))return "ایمیل معتبر وارد کنید یا فیلد اختیاری را خالی بگذارید.";
 return null;
}
