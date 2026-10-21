import {mobileInput,normalizeDigits} from "../../utils/authValidation";
import React, { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Smartphone } from "lucide-react";
import { portalRequest, hydratePortal } from "../../services/portalRepository";
import { Customer } from "../../types";
export function PhoneLogin({
  onSuccess,initialPhone="",initialSent=false,
}: {
  initialPhone?:string;initialSent?:boolean;
  onSuccess: (user: Customer, requiresCredentials?: boolean) => void;
}) {
  const [phone, setPhone] = useState(initialPhone),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [sent, setSent] = useState(initialSent),
    [busy, setBusy] = useState(false),
    [seconds, setSeconds] = useState(initialSent?60:0);
  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  const request = async () => {
    if(!/^09[0-9]{9}$/.test(phone)){setError("شماره موبایل باید ۱۱ رقم و با 09 شروع شود.");return;}
    setBusy(true);
    setError("");
    try {
      const r = await portalRequest({ action: "otp_request", phone });
      setSent(true);
      setSeconds(r.retryAfter || 60);
      setNotice(r.message);
    } catch (e: any) {
      setError(e.message || "ارسال پیامک انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sent) return request();
    setBusy(true);
    setError("");
    try {
      const r = await portalRequest({ action: "otp_verify", phone, code });
      await hydratePortal();
      onSuccess(r.user,r.requiresCredentials);
    } catch (e: any) {
      setError(e.message || "کد معتبر نیست.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="account-fields" onSubmit={verify}>
      <label>
        شماره موبایل ثبت‌شده
        <input
          type="tel"
          dir="ltr"
          inputMode="numeric"
          minLength={11}
          maxLength={11}
          pattern="09[0-9]{9}"
          autoComplete="tel"
          required
          value={phone}
          disabled={sent}
          onChange={(e) => setPhone(mobileInput(e.target.value))}
          placeholder="09123456789"
        />
      </label>
      {sent && (
        <>
          <p role="status" className="account-help">
            {notice || "کد ارسال‌شده به شماره موبایل خود را وارد کنید."}
          </p>
          <label>
            کد شش‌رقمی
            <input
              autoFocus
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(normalizeDigits(e.target.value).replace(/[^0-9]/g,"").slice(0,6))}
              placeholder="------"
            />
          </label>
          <div className="otp-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setSent(false);
                setCode("");
                setError("");
              }}
            >
              اصلاح شماره
            </button>
            <button
              type="button"
              disabled={busy || seconds > 0}
              onClick={request}
            >
              <RotateCcw size={14} />
              {seconds
                ? `ارسال مجدد تا ${seconds.toLocaleString("fa-IR")} ثانیه`
                : "ارسال مجدد کد"}
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="account-error">
          {error}
        </p>
      )}
      <button className="store-btn-primary account-submit" disabled={busy}>
        {busy ? "در حال بررسی…" : sent ? "تأیید کد و ورود" : "دریافت کد پیامکی"}
        {sent ? <ArrowLeft size={17} /> : <Smartphone size={17} />}
      </button>
    </form>
  );
}
