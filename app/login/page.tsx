"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Tab = "mobile" | "email";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+1",  flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "GB" },
  { code: "+61", flag: "🇦🇺", name: "AU" },
  { code: "+971",flag: "🇦🇪", name: "AE" },
  { code: "+65", flag: "🇸🇬", name: "SG" },
];

export default function LoginPage() {
  const [tab, setTab]               = useState<Tab>("mobile");
  const [phone, setPhone]           = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const { login, user, loading: authLoading }  = useAuth();
  const router     = useRouter();

  // Strict Redirect: If already logged in, move to dashboard
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        const leadInfo = localStorage.getItem("lead_info");
        if (leadInfo) {
          try {
            const lead = JSON.parse(leadInfo);
            if (lead.id) {
              router.push(`/${lead.id}/dashboard`);
            }
          } catch (e) {
            console.error("Invalid lead_info in storage", e);
          }
        }
      }
    }
  }, [user, authLoading, router]);

  /* ── Send OTP ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Please enter your mobile number");
    setLoadingOtp(true);
    try {
      const res  = await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: `${countryCode}${phone}` }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent successfully!");
        router.push(`/verify-otp?phone=${encodeURIComponent(`${countryCode}${phone}`)}`);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Connection failed. Please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  /* ── Email login ── */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      const res = await fetch("/api/auth/lead/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome to your portal!");
        localStorage.setItem("lead_info", JSON.stringify(data.lead));
        // Standardized dynamic routing: /{leadId}/dashboard
        router.push(`/${data.lead.id}/dashboard`); 
      } else {
        toast.error(data.error || "Access Denied");
      }
    } catch {
      toast.error("Connection synchronization failed");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, #c7d2fe 0%, #dbeafe 30%, #eff6ff 55%, #f8faff 100%)",
      }}
    >
      {/* ── Decorative background orbs ── */}
      {/* Large blue orb — left */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "-80px", top: "50%", transform: "translateY(-50%)",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
      {/* Small solid orb — right middle */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "120px", top: "52%",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#6366f1",
          boxShadow: "0 0 20px rgba(99,102,241,0.5)",
        }}
      />
      {/* Orbit arc — right side */}
      <svg
        className="absolute pointer-events-none"
        style={{ right: "40px", top: "35%", opacity: 0.5 }}
        width="160" height="200" viewBox="0 0 160 200" fill="none"
      >
        <ellipse cx="80" cy="100" rx="70" ry="95"
          stroke="#6366f1" strokeWidth="1.2" fill="none" />
        <circle cx="80" cy="5" r="5" fill="#6366f1" />
        <circle cx="148" cy="120" r="3.5" fill="#818cf8" />
      </svg>
      {/* Tiny sparkles */}
      <div className="absolute pointer-events-none" style={{ left: "60px", top: "18%", color: "#818cf8", fontSize: "18px" }}>✦</div>
      <div className="absolute pointer-events-none" style={{ right: "80px", top: "15%", color: "#a5b4fc", fontSize: "13px" }}>✦</div>
      <div className="absolute pointer-events-none" style={{ left: "18%", bottom: "20%", color: "#6366f1", fontSize: "10px" }}>✦</div>
      <div className="absolute pointer-events-none" style={{ right: "22%", bottom: "25%", color: "#c7d2fe", fontSize: "14px" }}>✦</div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px] rounded-3xl bg-white px-10 pt-10 pb-8"
        style={{
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(99,102,241,0.10), 0 0 0 1px rgba(226,232,240,0.8)",
        }}
      >
        {/* SPACE Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center mb-6"
        >
          <img src="/logo.png" alt="Space Logo" className="h-14 w-auto object-contain" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-center mb-7"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome to Space</h1>
          <p className="text-gray-400 text-sm">Secure conversations. Complete transparency.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="flex rounded-xl overflow-hidden mb-6"
          style={{ border: "1.5px solid #e5e7eb" }}
        >
          {(["mobile", "email"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all relative"
              style={{
                color:      tab === t ? "#4f46e5" : "#6b7280",
                background: tab === t ? "white" : "transparent",
                borderBottom: tab === t ? "2px solid #4f46e5" : "2px solid transparent",
              }}
            >
              {t === "mobile" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {t === "mobile" ? "Login with Mobile" : "Login with Email"}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ── MOBILE TAB ── */}
          {tab === "mobile" && (
            <motion.div
              key="mobile"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
            >
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your mobile number
                  </label>
                  <div className="flex gap-2">
                    {/* Country code selector */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none h-full pl-3 pr-7 py-3 rounded-xl text-sm font-semibold text-gray-700 outline-none cursor-pointer transition-all"
                        style={{
                          border: "1.5px solid #e5e7eb",
                          background: "white",
                          minWidth: "80px",
                        }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                    {/* Phone input */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="Mobile number"
                      maxLength={15}
                      required
                      className="flex-1 px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none transition-all"
                      style={{
                        border: "1.5px solid #e5e7eb",
                        background: "white",
                      }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={e  => { e.currentTarget.style.border = "1.5px solid #e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    We will send you a one-time password (OTP) to verify your number.
                  </p>
                </div>

                {/* Send OTP */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  disabled={loadingOtp}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all mt-2"
                  style={{
                    background: loadingOtp
                      ? "#818cf8"
                      : "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    boxShadow: loadingOtp ? "none" : "0 4px 18px rgba(79,70,229,0.4)",
                  }}
                >
                  {loadingOtp ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </motion.button>

                {/* OR divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Switch to email */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015, backgroundColor: "#f5f3ff" }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setTab("email")}
                  className="w-full py-3 rounded-xl text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    border: "1.5px solid #e5e7eb",
                    background: "white",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Login with Email instead
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ── EMAIL TAB ── */}
          {tab === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400">
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none transition-all"
                      style={{ border: "1.5px solid #e5e7eb", background: "white" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={e  => { e.currentTarget.style.border = "1.5px solid #e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400">
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none transition-all"
                      style={{ border: "1.5px solid #e5e7eb", background: "white" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={e  => { e.currentTarget.style.border = "1.5px solid #e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? (
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  disabled={loadingEmail}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all mt-1"
                  style={{
                    background: loadingEmail
                      ? "#818cf8"
                      : "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    boxShadow: loadingEmail ? "none" : "0 4px 18px rgba(79,70,229,0.4)",
                  }}
                >
                  {loadingEmail ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </motion.button>

                {/* Switch to mobile */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015, backgroundColor: "#f5f3ff" }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setTab("mobile")}
                  className="w-full py-3 rounded-xl text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ border: "1.5px solid #e5e7eb", background: "white" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Login with Mobile instead
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-2.5 mt-7 pt-6"
          style={{ borderTop: "1px solid #f3f4f6" }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600">Your conversations and data are protected</p>
            <p className="text-xs text-gray-400 mt-0.5">All communication is secure and monitored.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}