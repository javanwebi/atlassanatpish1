import React, { useMemo, useState } from 'react';
import type { Product } from '../../types';
import { getImageAssignmentAudit } from '../../data/imageAssignments';
import { getProductImageUrl } from '../../assets/imagesproducts';
import { ProductImage } from '../../components/product/ProductImage';
import { normalizeCatalogueText } from '../../data/userProducts';
import { Modal } from '../../components/ui/Modal';

type FamilyCategory={name:string;subcategories?:string[]};
export function ProductImageAudit({products,categories,onEdit,onCreateCategory,onCreateFamily}:{
  products:Product[];
  categories:FamilyCategory[];
  onEdit:(familyCode:string,file:string,skuCode?:string)=>void;
  onCreateCategory:()=>void;
  onCreateFamily:(file:string,category:string,subcategory:string)=>void;
}) {
  const [query,setQuery]=useState('');const [status,setStatus]=useState('all');const [page,setPage]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [familyQuery,setFamilyQuery]=useState('');
  const [selectedCategory,setSelectedCategory]=useState('');
  const [selectedSubcategory,setSelectedSubcategory]=useState('');
  const [selectedFamily,setSelectedFamily]=useState('');
  const [selectedSku,setSelectedSku]=useState('');
  const [location,setLocation]=useState<'family'|'sku'>('family');
  const audit=useMemo(()=>getImageAssignmentAudit(products),[products]);
  const filtered=useMemo(()=>audit.filter(row=>(status==='all'||row.status===status||(status==='catalogue-photo'&&!!row.ownerCatalogue))&&normalizeCatalogueText([row.file,row.observed,row.research?.visualType,row.research?.visibleFeatures,row.ownerCatalogue?.catalogueGroup,...row.families.flatMap(f=>[f.code,f.name,...f.skus.flatMap(v=>[v.code,v.name])])].join(' ')).includes(normalizeCatalogueText(query))),[audit,query,status]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/24));const activePage=Math.min(page,pageCount-1);
  const families=products.filter(p=>
    (!selectedCategory||p.categoryName===selectedCategory)
    &&(!selectedSubcategory||p.subcategory===selectedSubcategory)
    &&normalizeCatalogueText(p.code+' '+p.name+' '+(p.variants||[]).map(v=>v.code+' '+v.name).join(' ')).includes(normalizeCatalogueText(familyQuery))
  ).slice(0,80);
  const currentFamily=products.find(p=>p.code===selectedFamily);
  const categoryOptions=Array.from(new Set([...categories.map(c=>c.name),...products.map(p=>p.categoryName)].filter(Boolean))).sort((a,b)=>a.localeCompare(b,'fa'));
  const subcategoryOptions=Array.from(new Set([
    ...(categories.find(c=>c.name===selectedCategory)?.subcategories||[]),
    ...products.filter(p=>p.categoryName===selectedCategory).map(p=>p.subcategory||'')
  ].filter(Boolean))).sort((a,b)=>a.localeCompare(b,'fa'));
  const chooseImage=(file:string)=>{
    setSelected(file);setFamilyQuery('');setSelectedCategory('');setSelectedSubcategory('');
    setSelectedFamily('');setSelectedSku('');setLocation('family');
  };
  const openEditor=()=>{
    if(!selectedFamily||!selected)return;
    if(location==='sku'&&!selectedSku)return;
    onEdit(selectedFamily,selected,location==='sku'?selectedSku:undefined);
    setSelected(null);
  };
  const download=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(audit,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='sanatpish-image-assignments.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <details className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
    <summary className="cursor-pointer font-bold text-[#55565A]">بررسی تصویر، خانواده و کد کالا — {audit.length.toLocaleString('fa-IR')} تصویر</summary>
    <p className="text-xs leading-6 text-slate-600">تصویر نمونهٔ خانواده با تصویر کد کالا متفاوت است. نام فایل و شمارهٔ عکس، کد انبار نیست. حتی خانوادهٔ تک‌کد بدون شاهد کاتالوگ، اتصال قطعی محسوب نمی‌شود.</p>
    <div className="flex flex-wrap gap-2 text-xs">
      <input aria-label="جستجوی تصاویر و کدهای متصل" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder="نام، کد یا شماره تصویر" className="min-w-48 rounded-xl border p-2" />
      <select aria-label="وضعیت اتصال تصویر" value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}} className="rounded-xl border p-2"><option value="all">همهٔ تصاویر</option><option value="sku-linked">دارای اتصال به کد کالا</option><option value="family-example">نمونهٔ خانواده</option><option value="unassigned">نیازمند تعیین خانواده</option><option value="catalogue-photo">عکس و عنوان در کاتالوگ پیدا شده</option></select>
      <button type="button" onClick={download} className="rounded-xl border px-3 text-[#E06518]">خروجی همهٔ تصاویر و اتصال‌ها</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{filtered.slice(activePage*24,activePage*24+24).map(row=><article key={row.file} className="rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
      <ProductImage src={getProductImageUrl(row.file)} alt={row.observed} className="h-32 w-full object-contain" />
      {row.ownerCatalogue&&<div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2 leading-6"><strong>عنوان گروه در کاتالوگ: {row.ownerCatalogue.catalogueGroup}</strong><p>صفحهٔ چاپی {row.ownerCatalogue.printedPage}؛ صفحهٔ PDF {row.ownerCatalogue.page}</p><p>خود عکس و عنوان گروه تطبیق دارد؛ اتصال به کد انبار و سایز دقیق هنوز تأیید نشده است.</p></div>}
      <strong dir="ltr">{row.file}</strong>{row.research && <div className="rounded-lg border border-orange-100 bg-orange-50/30 p-2 space-y-2"><strong>{row.research.visualType}</strong><p className="leading-5">{row.research.visibleFeatures}</p><p className="leading-5">برای تعیین مدل: {row.research.requiredChecks.join('، ')}</p><p>استاندارد و کد دقیق هنوز تأیید نشده‌اند.</p></div>}<p className="leading-5 text-slate-600">{row.observed}</p>
      {row.families.map(f=><div key={f.code} className="rounded-lg bg-slate-50 p-2 leading-6"><p>خانواده: {f.name} ({f.code})</p><p>{f.category}</p>{f.skus.length ? f.skus.map(v=><p key={v.code}>کد متصل‌شده: {v.code} — {v.name}</p>) : <p>نمونهٔ خانواده؛ {f.candidateSkuCount.toLocaleString('fa-IR')} کد احتمالی، بدون کد تأییدشده</p>}</div>)}
      {!row.families.length&&<p className="text-amber-700">خانواده و کد هنوز تأیید نشده است</p>}
      {!!row.duplicateFiles.length&&<p>فایل تکراریِ یکسان: {row.duplicateFiles.join('، ')}</p>}
      <button type="button" onClick={()=>chooseImage(row.file)} className="rounded-lg border px-3 py-2 font-bold text-[#E06518]">بررسی و اتصال به خانواده / کد</button>
    </article>)}</div>
    <div className="flex gap-3 items-center text-xs"><button type="button" disabled={activePage===0} onClick={()=>setPage(activePage-1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">قبلی</button><span>{activePage+1} / {pageCount} — {filtered.length.toLocaleString('fa-IR')} تصویر</span><button type="button" disabled={activePage===pageCount-1} onClick={()=>setPage(activePage+1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">بعدی</button></div>
    <Modal isOpen={!!selected} onClose={()=>setSelected(null)} title="بررسی و اتصال تصویر به کالا">
      <div className="space-y-4 max-h-[78vh] overflow-y-auto p-1" dir="rtl">
        <div className="flex gap-3 items-center rounded-xl bg-[#FAFAFB] border p-3">
          {selected&&<ProductImage src={getProductImageUrl(selected)} alt={selected} className="w-20 h-20 rounded-xl object-contain bg-white shrink-0"/>}
          <div className="min-w-0"><b className="text-sm text-[#55565A]">این تصویر متعلق به کجاست؟</b><p className="text-xs text-slate-500 mt-1" dir="ltr">{selected}</p><p className="text-[11px] text-amber-700 mt-1">پیشنهادها تأیید هویت فنی نیستند؛ شما محل و کد نهایی را تعیین می‌کنید.</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-bold text-slate-700">۱. دسته‌بندی
            <select value={selectedCategory} onChange={e=>{setSelectedCategory(e.target.value);setSelectedSubcategory('');setSelectedFamily('');setSelectedSku('')}} className="mt-1.5 w-full p-3 rounded-xl border bg-white">
              <option value="">همه دسته‌بندی‌ها</option>{categoryOptions.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700">۲. زیردسته
            <select disabled={!selectedCategory} value={selectedSubcategory} onChange={e=>{setSelectedSubcategory(e.target.value);setSelectedFamily('');setSelectedSku('')}} className="mt-1.5 w-full p-3 rounded-xl border bg-white disabled:opacity-50">
              <option value="">همه زیردسته‌ها</option>{subcategoryOptions.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <button type="button" className="text-xs text-[#C65A16] underline" onClick={()=>{setSelected(null);onCreateCategory()}}>+ افزودن دسته‌بندی یا زیردسته جدید</button>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">۳. خانواده کالا</label>
          <input value={familyQuery} onChange={e=>setFamilyQuery(e.target.value)} placeholder="جستجوی نام خانواده، کد خانواده یا SKU" className="w-full border rounded-xl p-3 text-sm"/>
          <select aria-label="انتخاب خانواده" size={Math.min(5,Math.max(2,families.length+1))} value={selectedFamily} onChange={e=>{setSelectedFamily(e.target.value);setSelectedSku('')}} className="w-full p-2 border rounded-xl bg-white text-xs">
            <option value="">خانواده را انتخاب کنید...</option>
            {families.map(f=><option key={f.code} value={f.code}>{f.name} — {f.code}</option>)}
          </select>
          <button type="button" className="text-xs text-[#C65A16] underline" onClick={()=>{if(selected){onCreateFamily(selected,selectedCategory,selectedSubcategory);setSelected(null)}}}>+ تعریف خانواده و کالای جدید برای همین تصویر</button>
        </div>
        {currentFamily&&<div className="rounded-xl border border-[#F4D4BE] bg-[#FFF9F5] p-3 space-y-3">
          <strong className="text-xs text-[#55565A]">۴. محل اتصال تصویر</strong>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex gap-2 items-center rounded-xl bg-white border p-3 text-xs"><input type="radio" name="attach-place" checked={location==='family'} onChange={()=>{setLocation('family');setSelectedSku('')}}/> تصویر عمومی خانواده</label>
            <label className="flex gap-2 items-center rounded-xl bg-white border p-3 text-xs"><input type="radio" name="attach-place" checked={location==='sku'} onChange={()=>setLocation('sku')}/> تصویر مخصوص یک کد کالا</label>
          </div>
          {location==='sku'&&<label className="block text-xs font-bold text-slate-700">کد کالای دقیق
            <select value={selectedSku} onChange={e=>setSelectedSku(e.target.value)} className="mt-1.5 w-full border rounded-xl p-3 bg-white">
              <option value="">انتخاب کد کالا الزامی است</option>{(currentFamily.variants||[]).map(v=><option value={v.code} key={v.code}>{v.code} — {v.name}</option>)}
            </select>
          </label>}
          <p className="text-[11px] text-slate-600">برای افزودن کد جدید، تغییر نام، سایز، مشخصات فنی و سایر اطلاعات، وارد ویرایشگر خانواده شوید. تصویر در پیش‌نویس قرار می‌گیرد و فقط پس از ذخیره نهایی ثبت می‌شود.</p>
        </div>}
        <div className="sticky bottom-0 bg-white border-t pt-3 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={()=>setSelected(null)} className="border rounded-xl px-4 py-2.5 text-xs">انصراف</button>
          <button type="button" onClick={openEditor} disabled={!selectedFamily||(location==='sku'&&!selectedSku)} className="bg-[#E06518] text-white rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-50">ادامه در ویرایشگر و بررسی مشخصات</button>
        </div>
      </div>
    </Modal>
  </details>;
}
