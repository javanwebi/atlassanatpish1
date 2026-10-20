import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpLeft,
  ArrowLeft,
  ScanLine,
  Ruler,
  Settings2,
} from "lucide-react";
import { INDUSTRIES } from "../../data/siteContent";
type Industry = (typeof INDUSTRIES)[number];
const briefs: Record<string, [string, string, string]> = {
  ceramic: [
    "تمرکز بر ناحیه کار",
    "گرما، گردوغبار یا تماس با لعاب؟",
    "محل نصب را مشخص کنید تا بررسی جنس و مقاومت قطعه دقیق‌تر شود.",
  ],
  textile: [
    "تمرکز بر حرکت یکنواخت",
    "کدام بخش مسیر پارچه؟",
    "پروفیل تسمه، سرعت و حساسیت سطح پارچه را کنار هم بررسی کنید.",
  ],
  packaging: [
    "تمرکز بر توالی عملیات",
    "قطعه در کدام ایستگاه کار می‌کند؟",
    "از ورودی تا خروجی، وزن محصول و زمان‌بندی حرکت را مشخص کنید.",
  ],
  food: [
    "تمرکز بر شرایط تماس",
    "تماس با محصول یا محیط شست‌وشو؟",
    "جنس، دما و مدارک مورد نیاز را پیش از انتخاب نهایی بررسی کنید.",
  ],
  machinery: [
    "تمرکز بر مشخصات مهندسی",
    "از نقشه تا مجموعه انتقال نیرو",
    "کد، ابعاد اتصال و بار کاری؛ سه ورودی مهم برای انتخاب قطعه.",
  ],
  rubber: [
    "تمرکز بر جنس و کاربرد",
    "کدام جنس، برای کدام شرایط؟",
    "نمونه، نقشه، سختی و محیط کار را برای بررسی فنی آماده کنید.",
  ],
};
export function IndustryTools({ industry: i }: { industry: Industry }) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(0);
  const navigate = useNavigate(),
    brief = briefs[i.slug];
  return (
    <section
      className={`industry-workbench workbench-${i.slug} editorial-wrap`}
    >
      <div className="industry-fastbar">
        <nav aria-label="دسترسی سریع این صنعت">
          <a href="#industry-parts">گروه قطعات</a>
          <a href="#industry-checks">راهنمای انتخاب</a>
          <a href="#industry-catalog">کاتالوگ مرتبط</a>
        </nav>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/products?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`جستجوی قطعه در ${i.title}`}
            placeholder="کد یا نام قطعه…"
          />
          <button aria-label="جستجوی قطعه">
            <ArrowLeft size={18} />
          </button>
        </form>
      </div>
      <div className="industry-selector">
        <div className="industry-selector-intro">
          <span className="store-eyebrow">{brief[0]}</span>
          <h2>{brief[1]}</h2>
          <p>{brief[2]}</p>
          <div className="technical-symbol" aria-hidden="true">
            <Settings2 size={38} />
            <span />
            <Ruler size={24} />
          </div>
        </div>
        <div
          className="industry-stations"
          role="group"
          aria-label="بخش‌های خط تولید"
        >
          {i.steps.map((s, n) => (
            <button
              key={s}
              onClick={() => setSelected(n)}
              aria-pressed={selected === n}
            >
              <b>۰{n + 1}</b>
              <span>{s}</span>
              <ArrowUpLeft size={17} />
            </button>
          ))}
        </div>
        <div className="industry-selection" aria-live="polite">
          <span className="store-eyebrow">بررسی {i.steps[selected]}</span>
          <h3>اطلاعاتی که انتخاب را دقیق‌تر می‌کند</h3>
          <p>{i.checks[selected % i.checks.length]}</p>
          <Link
            to={`/ai-consult?industry=${i.slug}&stage=${encodeURIComponent(i.steps[selected])}`}
            className="editorial-text-link"
          >
            <ScanLine size={17} /> بررسی این بخش با FORZA{" "}
            <ArrowUpLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function IndustryNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="industry-mega">
      <div className="industry-mega-heading">
        <span className="store-eyebrow">از صنعت به قطعه برسید</span>
        <strong>راهنمای تخصصی خطوط تولید</strong>
        <Link to="/industries" onClick={onNavigate}>
          همه صنایع <ArrowLeft size={16} />
        </Link>
      </div>
      <div>
        {INDUSTRIES.map((i) => (
          <Link key={i.slug} to={`/industries/${i.slug}`} onClick={onNavigate}>
            <img src={i.image} alt="" />
            <span>
              <strong>{i.title}</strong>
              <small>{i.eyebrow}</small>
            </span>
            <ArrowUpLeft size={17} />
          </Link>
        ))}
      </div>
    </div>
  );
}
