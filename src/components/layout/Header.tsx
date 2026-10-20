import { ReferenceMegaMenu } from "../catalog/ReferenceMegaMenu";
import { IndustryNavigation } from "../storefront/IndustryTools";
import {AboutNavigation} from '../../pages/DiscoveryPages';
import { ProductImage } from '../product/ProductImage';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Camera,
  X,
  ChevronDown,
  ChevronLeft,
  Phone,
  Layers,
  ShieldCheck,
  Building,
  Award,
  Heart,
  FileText,
  Headphones,
  ClipboardList,
  Truck,
  LayoutGrid,
  Factory,
  Tag,
  Wrench,
  Users,
  BookOpen,
  Sparkles,
  ExternalLink,
  Instagram,
  Send,
  MessageCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CATEGORIES, PRIMARY_CATALOG_CATEGORIES } from '../../data/categories';
import { CategoryNavigation } from '../catalog/CategoryNavigation';
import { BRANDS } from '../../data/brands';
import { getInstantSearchResults } from '../../data/mockGenerator';
import { toPersianDigits, formatPrice } from '../../utils/formatters';
import { Product } from '../../types';
import { AiVisualPartSearchModal } from '../search/AiVisualPartSearchModal';
import { AiConsultModal } from '../search/AiConsultModal';

type NavMenuType = 'products' | 'industries' | 'brands' | 'services' | 'about' | 'clients' | null;

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<{
    products: Product[];
    categories: typeof CATEGORIES;
    brands: typeof BRANDS;
  }>({ products: [], categories: [], brands: [] });

  // Navigation states
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavMenuType>(null);
  const [activeMegaCategory, setActiveMegaCategory] = useState(CATEGORIES[0].slug);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  // Modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live search debouncing / update
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const res = getInstantSearchResults(searchQuery);
      setLiveResults(res as any);
      setIsSearchDropdownOpen(true);
    } else {
      setIsSearchDropdownOpen(false);
    }
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (navBarRef.current && !navBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleOpenSearch = () => {
      setIsMobileSearchOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    };
    const handleOpenConsult = () => navigate('/ai-consult');
    const handleOpenForza = () => navigate('/ai-consult?voice=1');

    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsMegaMenuOpen(false); setActiveDropdown(null); setIsSearchDropdownOpen(false); setIsUserMenuOpen(false); } };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('open-mobile-search', handleOpenSearch);
    window.addEventListener('open-ai-consult', handleOpenConsult);
    window.addEventListener('open-forza-face-to-face', handleOpenForza);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('open-mobile-search', handleOpenSearch);
      window.removeEventListener('open-ai-consult', handleOpenConsult);
      window.removeEventListener('open-forza-face-to-face', handleOpenForza);
    };
  }, [navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchDropdownOpen(false);
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectedCategoryObj = CATEGORIES.find(c => c.slug === activeMegaCategory) || CATEGORIES[0];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Top subtle hairline orange accent bar matching footer */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#E06518] to-transparent opacity-85" />

      {/* 1. TOP NARROW BAR: Matching footer Tier 2 Titanium Slate (#2B313A) */}
      <div className="bg-[#2B313A] text-slate-200 text-[11px] py-1.5 px-4 border-b border-[#3F4550] select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4" dir="ltr">
          {/* Left Group (Trust & Capabilities) - placed on the left */}
          <div className="hidden lg:flex items-center gap-2.5 text-slate-300 font-medium" dir="rtl">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Award className="w-3.5 h-3.5 text-[#E06518] shrink-0" />
              <span>بازرگانی تسمه اطلس از سال ۱۳۶۶</span>
            </div>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Layers className="w-3.5 h-3.5 text-[#E06518] shrink-0" />
              <span>صنعت پیش؛ تولید و تأمین قطعات خطوط تولید | پیش به صنعت</span>
            </div>

            <span className="text-slate-600">|</span>

            <Link
              to="/category/swr-forza-exclusive"
              className="flex items-center gap-1.5 hover:text-[#E06518] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E06518] shrink-0" />
              <span>
                نمایندگی انحصاری <span className="font-sans font-bold text-orange-400">SWR</span> و{' '}
                <span className="font-sans font-bold text-sky-400">FORZA</span>
              </span>
            </Link>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Truck className="w-3.5 h-3.5 text-[#E06518] shrink-0" />
              <span>ارسال رایگان به سراسر کشور</span>
            </div>
          </div>

          {/* Right Group (Phone Hotline, Contact Us, Social Channels) - placed on the right */}
          <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-3 text-slate-300" dir="ltr">
            {/* Phone Hotline with orange phone icon */}
            <a
              href="tel:035352547034"
              className="flex items-center gap-1.5 text-slate-200 hover:text-[#E06518] transition-colors font-mono text-xs"
              title="تلفن تماس مستقیم صنعت پیش و بازرگانی اطلس"
            >
              <Phone className="w-3.5 h-3.5 text-[#E06518] shrink-0" />
              <span className="tracking-wide">۰۳۵-۳۵۲۵۴۷۰۳۴</span>
            </a>

            <span className="text-slate-600">|</span>

            {/* Contact Link */}
            <Link
              to="/contact"
              className="hover:text-[#E06518] text-slate-300 font-medium transition-colors text-[11px]"
            >
              تماس با ما
            </Link>

            <span className="text-slate-600">|</span>

            {/* Social Media Channels (Instagram, Telegram, WhatsApp, Eitaa) */}
            <div className="flex items-center gap-1.5">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-[#383E48] border border-slate-600 hover:border-[#E06518] hover:text-[#E06518] flex items-center justify-center text-slate-300 transition-colors"
                title="اینستاگرام اطلس تریدینگ"
                aria-label="Instagram"
              >
                <Instagram className="w-2.5 h-2.5" />
              </a>

              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-[#383E48] border border-slate-600 hover:border-sky-400 hover:text-sky-400 flex items-center justify-center text-slate-300 transition-colors"
                title="کانال تلگرام اطلس"
                aria-label="Telegram"
              >
                <Send className="w-2.5 h-2.5" />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/989903427027"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-[#383E48] border border-slate-600 hover:border-emerald-500 hover:text-emerald-400 flex items-center justify-center text-slate-300 transition-colors"
                title="واتس‌اپ پشتیبانی فنی"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-2.5 h-2.5" />
              </a>

              {/* Eitaa / Aparat */}
              <a
                href="https://eitaa.com"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-[#383E48] border border-[#E06518]/60 hover:border-[#E06518] hover:bg-[#E06518]/20 flex items-center justify-center text-[#E06518] transition-colors font-bold text-[10px] leading-none"
                title="پیام‌رسان ایتا"
                aria-label="Eitaa"
              >
                <span>e</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER: Matching footer Tier 1 Light Slate Gray Canvas (#DEE2E5) */}
      <div className="bg-[#DEE2E5] border-b border-[#CBD2D8] px-3 sm:px-4 py-1.5 sm:py-2 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Right: ATLAS TRADING Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2B313A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1E293B] transition-colors relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none" />
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#E06518]" />
              </div>
              <div className="flex flex-col text-right">
                <div className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-[#2B313A] leading-none">
                  صنعت پیش
                </div>
                <div className="text-[8px] sm:text-[9px] text-[#E06518] font-bold tracking-tight mt-0.5 leading-none">
                  پیش به صنعت | اطلس
                </div>
              </div>
            </Link>

            {/* B2B Mobile Quick Badge */}
            <Link
              to="/dealer"
              className="hidden sm:flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B313A] text-white border border-[#3F4550] hover:border-[#E06518] text-[10px] font-bold transition-all shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-[#E06518]" />
              <span>پرتال B2B</span>
            </Link>
          </div>

          {/* Center: Search Bar with Orange Button (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSearchDropdownOpen(true);
                }}
                placeholder="جستجوی قطعات خط تولید، تسمه، پولی، بلبرینگ، زنجیر..."
                className="w-full h-11 pr-4 pl-24 bg-[#FFFFFF] hover:bg-white text-[#2B313A] text-xs sm:text-sm rounded-xl border border-[#CBD2D8] focus:border-[#E06518] focus:bg-white focus:outline-none transition-all placeholder:text-[#777A7D] shadow-2xs"
              />

              {/* Camera Icon for Visual Search */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                title="جستجوی تصویری قطعه"
                className="absolute left-14 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#777A7D] hover:text-[#E06518] hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Orange Search Action Button */}
              <button
                type="submit"
                className="absolute left-1 top-1 bottom-1 px-4 bg-[#E06518] hover:bg-[#C95210] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                aria-label="جستجو"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Instant Search Dropdown with 3 Sections */}
            {isSearchDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-[#CBD2D8] overflow-hidden z-50 text-right text-xs">
                {/* 1. Products Section */}
                {liveResults.products.length > 0 && (
                  <div className="p-3 border-b border-[#CBD2D8]">
                    <div className="text-[11px] font-bold text-[#777A7D] mb-2 flex items-center justify-between">
                      <span>کالاهای یافت‌شده ({toPersianDigits(liveResults.products.length)})</span>
                      <span className="text-[10px] text-[#E06518]">Enter برای نمایش همه</span>
                    </div>
                    <div className="space-y-1.5">
                      {liveResults.products.map(p => (
                        <Link
                          key={p.code}
                          to={`/product/${p.code}`}
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <ProductImage
                              src={p.images[0]}
                              alt={p.name}
                              className="w-8 h-8 rounded border border-slate-200 object-contain p-0.5 bg-white"
                            />
                            <div>
                              <div className="font-bold text-[#2B313A] group-hover:text-[#E06518] transition-colors line-clamp-1">
                                {p.name}
                              </div>
                              <div className="font-mono text-[10px] text-[#777A7D]">
                                {p.code} | {p.brand}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-[#2B313A] shrink-0 text-left">
                            <span className="text-[11px] text-[#777A7D]">مشاهده مشخصات</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Categories Section */}
                {liveResults.categories.length > 0 && (
                  <div className="p-3 bg-slate-50/70 border-b border-[#CBD2D8]">
                    <div className="text-[11px] font-bold text-[#777A7D] mb-2">دسته‌بندی‌های مرتبط</div>
                    <div className="flex flex-wrap gap-1.5">
                      {liveResults.categories.map(c => (
                        <Link
                          key={c.id}
                          to={`/category/${c.slug}`}
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="px-2.5 py-1 bg-white border border-[#CBD2D8] rounded-lg text-xs hover:border-[#E06518] hover:text-[#E06518] transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Brands Section */}
                {liveResults.brands.length > 0 && (
                  <div className="p-3 bg-slate-50/40">
                    <div className="text-[11px] font-bold text-[#777A7D] mb-1.5">برندهای صنعتی</div>
                    <div className="flex flex-wrap gap-2">
                      {liveResults.brands.map(b => (
                        <Link
                          key={b.id}
                          to={`/category/swr-forza-exclusive`}
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="text-xs font-bold text-[#2B313A] hover:text-[#E06518] flex items-center gap-1"
                        >
                          <Award className="w-3 h-3 text-[#E06518]" />
                          <span>{b.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {liveResults.products.length === 0 &&
                  liveResults.categories.length === 0 &&
                  liveResults.brands.length === 0 && (
                    <div className="p-6 text-center text-[#777A7D]">
                      موردی برای عبارت واردشده یافت نشد. دکمه Enter را برای جستجوی جامع فشار دهید.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Left/End: Actions (Search icon on mobile, Wishlist, Cart, Login/Register button) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle Icon Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(prev => {
                  const next = !prev;
                  if (next) {
                    setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
                  }
                  return next;
                });
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0 active:scale-95 lg:hidden ${
                isMobileSearchOpen
                  ? 'border-[#E06518] bg-orange-50 text-[#E06518]'
                  : 'border-[#CBD2D8] bg-white hover:border-[#E06518] hover:bg-orange-50/30 text-[#55565A] hover:text-[#E06518]'
              }`}
              title="جستجو در قطعات"
              aria-label="جستجو"
            >
              {isMobileSearchOpen ? (
                <X className="w-4 h-4 text-[#E06518]" />
              ) : (
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </button>

            {/* علاقه‌مندی‌ها (آیکون با بج تعداد) */}
            <Link
              to="/wishlist"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#CBD2D8] bg-white hover:border-[#E06518] hover:bg-orange-50/30 text-[#55565A] hover:text-[#E06518] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 group"
              title="علاقه‌مندی‌ها"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#55565A] group-hover:text-[#E06518] group-hover:scale-110 transition-all" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-4 px-1 rounded-full bg-[#E06518] text-white text-[9px] font-mono font-bold border border-white shadow-xs">
                  {toPersianDigits(wishlist.length)}
                </span>
              )}
            </Link>

            {/* سبد خرید (آیکون با بج تعداد) */}
            <Link
              to="/cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#CBD2D8] bg-white hover:border-[#E06518] hover:bg-orange-50/30 text-[#55565A] hover:text-[#E06518] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 group"
              title="سبد خرید"
              aria-label="سبد خرید"
            >
              <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#55565A] group-hover:text-[#E06518] group-hover:scale-110 transition-all" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-4 px-1 rounded-full bg-[#E06518] text-white text-[9px] font-mono font-bold border border-white shadow-xs">
                  {toPersianDigits(itemCount)}
                </span>
              )}
            </Link>

            {/* User Login / Profile Button placed AFTER shopping cart icon */}
            {currentUser ? (
              /* User Dropdown when Logged In */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 rounded-xl border border-[#CBD2D8] bg-white hover:border-[#E06518] hover:bg-orange-50/30 transition-all text-xs font-medium text-[#2B313A] cursor-pointer shadow-2xs group active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#E06518]/10 text-[#E06518] font-black text-xs flex items-center justify-center shrink-0">
                    {currentUser.fullName ? currentUser.fullName.slice(0, 1) : 'ک'}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[110px] text-[#2B313A] group-hover:text-[#E06518] transition-colors">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-colors hidden sm:inline" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white text-[#2B313A] rounded-2xl shadow-xl border border-[#CBD2D8] py-2 z-50 animate-in fade-in text-right">
                    <div className="px-4 py-3 border-b border-[#CBD2D8] bg-[#DEE2E5]/50">
                      <p className="text-xs font-bold text-[#2B313A]">مشتری گرامی: {currentUser?.fullName}</p>
                      <p className="text-[11px] text-[#777A7D] font-mono mt-0.5">{currentUser?.phone}</p>
                    </div>
                    <div className="py-1 text-xs">
                      {currentUser?.approvedB2B === true ? (
                        <Link
                          to={currentUser?.approvedB2B === true ? "/account" : "/consumer-dashboard"}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-orange-50 text-[#E06518] font-bold"
                        >
                          <Building className="w-4 h-4 text-[#E06518]" />
                          <span>پنل کاربری و سفارشات من</span>
                        </Link>
                      ) : (
                        <Link
                          to="/consumer-dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-[#2B313A] font-bold"
                        >
                          <User className="w-4 h-4 text-[#E06518]" />
                          <span>پنل کاربری و سفارشات من</span>
                        </Link>
                      )}

                      <Link
                        to="/agency"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-slate-50 text-[#55565A]"
                      >
                        درخواست اخذ نمایندگی و عاملیت
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-right px-4 py-2 hover:bg-red-50 text-red-600 font-bold mt-1 border-t border-slate-100 cursor-pointer"
                      >
                        خروج از حساب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* دکمه یکپارچه و زیبای ورود | ثبت‌نام */
              <button
                type="button"
                onClick={() => openAuthModal(undefined, 'login')}
                className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3.5 rounded-xl border border-[#CBD2D8] bg-white hover:border-[#E06518] hover:bg-orange-50/30 text-[#2B313A] hover:text-[#E06518] transition-all text-xs font-bold cursor-pointer shadow-2xs group shrink-0 active:scale-95"
                title="ورود یا ثبت‌نام در سامانه صنعت پیش"
                aria-label="ورود یا ثبت‌نام"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-orange-50 group-hover:bg-[#E06518]/15 text-[#E06518] flex items-center justify-center transition-colors shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:flex items-center gap-1 font-bold">
                  <span>ورود</span>
                  <span className="text-slate-300 font-light text-[11px]">|</span>
                  <span className="text-slate-700 group-hover:text-[#E06518] transition-colors">ثبت‌نام</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Search Bar & Category Quick Bar */}
        {isMobileSearchOpen && (
          <div className="mt-2.5 lg:hidden pt-2 border-t border-[#CBD2D8] animate-in fade-in slide-in-from-top-2 duration-200" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSearchDropdownOpen(true);
                }}
                placeholder="جستجوی قطعات خطوط تولید، تسمه، پولی، بلبرینگ..."
                className="w-full h-10 pr-9 pl-28 bg-white text-xs rounded-xl border border-[#CBD2D8] focus:border-[#E06518] focus:bg-white focus:outline-none transition-all placeholder:text-[#777A7D] shadow-2xs"
              />
              <Search className="w-4 h-4 text-[#777A7D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Camera AI Visual Part Search Trigger */}
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                title="شناسایی تصویری قطعه با AI"
                className="absolute left-11 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-50 text-[#E06518] border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">تصویری</span>
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                className="absolute left-1 top-1 bottom-1 px-2.5 bg-[#E06518] hover:bg-[#C95210] text-white text-[11px] font-bold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                جویا
              </button>
            </form>

            {/* Quick Categories Bar on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none text-[10px]" style={{ scrollbarWidth: 'none' }}>
              <span className="text-[#777A7D] shrink-0 font-bold">دسته‌ها:</span>
              {PRIMARY_CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    navigate(`/category/${cat.slug}`);
                    setIsMobileSearchOpen(false);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-orange-50 hover:text-[#E06518] text-[#2B313A] border border-[#CBD2D8] rounded-md shrink-0 transition-colors font-medium cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SUBHEADER NAVIGATION ROW: Dark Industrial Nav Bar matching image.png exactly */}
      <div className="bg-[#2B313A] border-b border-slate-800 hidden lg:block text-xs text-white" ref={navBarRef}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Main Menus from Right to Left (matching image.png) */}
          <nav className="flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-xs font-medium text-white" dir="rtl">
            
            {/* 1. همه محصولات (Orange LayoutGrid icon + Down Chevron) */}
            <div className="relative" ref={megaMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMegaMenuOpen(prev => !prev);
                  setActiveDropdown(null);
                }}
                onMouseEnter={() => {
                  setActiveDropdown(null);
                }}
                className={`flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 transition-colors cursor-pointer group ${
                  isMegaMenuOpen ? 'text-[#E06518] bg-white/5' : 'text-white hover:text-[#E06518]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-[#E06518] shrink-0" />
                <span className="font-bold">همه محصولات</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-transform duration-200 ${
                    isMegaMenuOpen ? 'rotate-180 text-[#E06518]' : ''
                  }`}
                />
              </button>

              {/* Industrial MegaMenu Dropdown */}
              {isMegaMenuOpen && <ReferenceMegaMenu onNavigate={()=>setIsMegaMenuOpen(false)}/>}
            </div>



            {/* 2. صنایع و کاربردها (White Factory icon + Down Chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(activeDropdown === 'industries' ? null : 'industries');
                  setIsMegaMenuOpen(false);
                }}
                onMouseEnter={() => {
                  if (activeDropdown && activeDropdown !== 'industries') {
                    setActiveDropdown('industries');
                  }
                }}
                className={`flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 transition-colors cursor-pointer group ${
                  activeDropdown === 'industries' ? 'text-[#E06518] bg-white/5' : 'text-white hover:text-[#E06518]'
                }`}
              >
                <Factory className="w-4 h-4 text-white group-hover:text-[#E06518] shrink-0 transition-colors" />
                <span>صنایع تحت پوشش</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-transform duration-200 ${
                    activeDropdown === 'industries' ? 'rotate-180 text-[#E06518]' : ''
                  }`}
                />
              </button>

              {/* Industries Dropdown */}
              {activeDropdown === 'industries' && <IndustryNavigation onNavigate={()=>setActiveDropdown(null)}/> }
            </div>

            <Link to="/brands" onClick={()=>{setActiveDropdown(null);setIsMegaMenuOpen(false);}} className="flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 hover:text-[#E06518] transition-colors text-white"><Tag className="w-4 h-4 text-[#E06518]"/><span>برندهای همکار</span></Link>

            {/* 4. خدمات صنعتی (White Wrench icon + Down Chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(activeDropdown === 'services' ? null : 'services');
                  setIsMegaMenuOpen(false);
                }}
                onMouseEnter={() => {
                  if (activeDropdown && activeDropdown !== 'services') {
                    setActiveDropdown('services');
                  }
                }}
                className={`flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 transition-colors cursor-pointer group ${
                  activeDropdown === 'services' ? 'text-[#E06518] bg-white/5' : 'text-white hover:text-[#E06518]'
                }`}
              >
                <Wrench className="w-4 h-4 text-white group-hover:text-[#E06518] shrink-0 transition-colors" />
                <span>محاسبه‌گرهای فنی</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-transform duration-200 ${
                    activeDropdown === 'services' ? 'rotate-180 text-[#E06518]' : ''
                  }`}
                />
              </button>

              {/* Services Dropdown */}
              {activeDropdown === 'services' && (
                <div className="absolute right-0 top-full w-76 bg-white text-[#55565A] rounded-b-2xl shadow-2xl border border-[#E3E5E6] p-3 z-50 animate-in fade-in duration-150 text-right">
                  <div className="text-[11px] font-bold text-[#777A7D] px-2 py-1 mb-1 border-b border-slate-100">
                    خدمات مهندسی و پشتیبانی اطلس
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navigate('/ai-consult');
                      }}
                      className="w-full text-right p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#55565A] group-hover:text-[#E06518]">مشاوره تخصصی و مهندسی</div>
                        <div className="text-[10px] text-slate-500">انتخاب و محاسبه سایز تسمه و پولی</div>
                      </div>
                      <Sparkles className="w-4 h-4 text-[#E06518]" />
                    </button>

                    <Link
                      to="/inquiry"
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors group"
                    >
                      <div className="font-bold text-[#55565A] group-hover:text-[#E06518]">استعلام قیمت و پیش‌فاکتور رسمی</div>
                      <div className="text-[10px] text-slate-500">صدور فاکتور با سامانه مودیان و ارزش افزوده</div>
                    </Link>

                    <Link
                      to="/dealer"
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors group"
                    >
                      <div className="font-bold text-[#55565A] group-hover:text-[#E06518]">تأمین قطعات کارخانجات و صنایع</div>
                      <div className="text-[10px] text-slate-500">تأمین مستمر با قرارداد سازمانی سالیانه</div>
                    </Link>

                    <Link
                      to="/about"
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors group"
                    >
                      <div className="font-bold text-[#55565A] group-hover:text-[#E06518]">تضمین اصالت و خدمات پس از فروش</div>
                      <div className="text-[10px] text-slate-500">گارانتی تعویض و تأییدیه فنی قطعات</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. مشاوره تخصصی (Sparkles icon - direct link) */}
            <button
              type="button"
              onClick={() => navigate('/ai-consult')}
              onMouseEnter={() => setActiveDropdown(null)}
              className="flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 hover:text-[#E06518] transition-colors cursor-pointer text-white group"
            >
              <Sparkles className="w-4 h-4 text-[#E06518] shrink-0" />
              <span>مشاوره تخصصی</span>
            </button>

            {/* 6. درباره اطلس (White User icon + Down Chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(activeDropdown === 'about' ? null : 'about');
                  setIsMegaMenuOpen(false);
                }}
                onMouseEnter={() => {
                  if (activeDropdown && activeDropdown !== 'about') {
                    setActiveDropdown('about');
                  }
                }}
                className={`flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 transition-colors cursor-pointer group ${
                  activeDropdown === 'about' ? 'text-[#E06518] bg-white/5' : 'text-white hover:text-[#E06518]'
                }`}
              >
                <User className="w-4 h-4 text-white group-hover:text-[#E06518] shrink-0 transition-colors" />
                <span>درباره صنعت پیش</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-transform duration-200 ${
                    activeDropdown === 'about' ? 'rotate-180 text-[#E06518]' : ''
                  }`}
                />
              </button>

              {/* About Dropdown */}
              {activeDropdown === 'about' && (
                <AboutNavigation onNavigate={()=>setActiveDropdown(null)}/>
              )}
            </div>

            {/* 6. مشتریان (White Users icon + Down Chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(activeDropdown === 'clients' ? null : 'clients');
                  setIsMegaMenuOpen(false);
                }}
                onMouseEnter={() => {
                  if (activeDropdown && activeDropdown !== 'clients') {
                    setActiveDropdown('clients');
                  }
                }}
                className={`flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 transition-colors cursor-pointer group ${
                  activeDropdown === 'clients' ? 'text-[#E06518] bg-white/5' : 'text-white hover:text-[#E06518]'
                }`}
              >
                <Users className="w-4 h-4 text-white group-hover:text-[#E06518] shrink-0 transition-colors" />
                <span>مشتریان</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#E06518] transition-transform duration-200 ${
                    activeDropdown === 'clients' ? 'rotate-180 text-[#E06518]' : ''
                  }`}
                />
              </button>

              {/* Clients Dropdown */}
              {activeDropdown === 'clients' && (
                <div className="absolute right-0 top-full w-72 bg-white text-[#55565A] rounded-b-2xl shadow-2xl border border-[#E3E5E6] p-3 z-50 animate-in fade-in duration-150 text-right">
                  <div className="text-[11px] font-bold text-[#777A7D] px-2 py-1 mb-1 border-b border-slate-100">
                    مشتریان و صنایع طرف قرارداد
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/#our-clients-section"
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors"
                    >
                      <div className="font-bold text-[#55565A]">کارخانجات و برندهای همکار</div>
                      <div className="text-[10px] text-slate-500">بیش از ۱۲۰ کارخانه بزرگ در سراسر کشور</div>
                    </Link>
                    <Link
                      to="/dealer"
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors"
                    >
                      <div className="font-bold text-[#55565A]">شبکه نمایندگان استانی</div>
                      <div className="text-[10px] text-slate-500">عاملیت‌های فروش فعال در یزد، تهران و اصفهان</div>
                    </Link>
                    <Link
                      to={currentUser?.approvedB2B === true ? "/account" : "/consumer-dashboard"}
                      onClick={() => setActiveDropdown(null)}
                      className="block p-2 rounded-lg hover:bg-orange-50 hover:text-[#E06518] text-xs transition-colors"
                    >
                      <div className="font-bold text-[#55565A]">باشگاه مشتریان صنعتی اطلس</div>
                      <div className="text-[10px] text-slate-500">تخفیف‌های پلکانی و خریدهای اعتباری</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 7. دانشنامه (White BookOpen icon - NO Chevron, direct link) */}
            <Link
              to="/knowledge"
              onMouseEnter={() => setActiveDropdown(null)}
              className="flex items-center gap-1.5 py-3 px-2 xl:px-2.5 whitespace-nowrap rounded-lg hover:bg-white/5 hover:text-[#E06518] transition-colors cursor-pointer text-white"
            >
              <BookOpen className="w-4 h-4 text-white group-hover:text-[#E06518] shrink-0 transition-colors" />
              <span>دانشنامه</span>
            </Link>

          </nav>

          {/* Left: Hotline Support Badge with Pulse */}
          <div className="header-support-status flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap shrink-0" dir="rtl">
            <span className="text-slate-300 font-sans">پشتیبانی صنعتی:</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-white font-mono" dir="ltr">۰۳۵-۳۸۷۳۹۹۰۰</span>
          </div>
        </div>
      </div>

      {/* AI DYNAMIC VISUAL PART SEARCH MODAL */}

      {/* 5. AI DYNAMIC VISUAL PART SEARCH MODAL */}
      <AiVisualPartSearchModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />

      {/* 6. AI CONSULT MODAL */}
      <AiConsultModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        onOpenVisualSearch={() => setIsCameraModalOpen(true)}
      />
    </header>
  );
};
