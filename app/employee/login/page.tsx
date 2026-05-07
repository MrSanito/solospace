"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Fixed star positions to avoid hydration mismatch
const STARS = [
  { top: 8, left: 12, w: 2.1, h: 2.1, dur: 3.2, delay: 0.4 },
  { top: 15, left: 78, w: 1.4, h: 1.4, dur: 4.1, delay: 1.2 },
  { top: 22, left: 45, w: 2.8, h: 2.8, dur: 2.8, delay: 0.9 },
  { top: 31, left: 88, w: 1.2, h: 1.2, dur: 3.7, delay: 0.2 },
  { top: 38, left: 5,  w: 2.3, h: 2.3, dur: 4.4, delay: 1.7 },
  { top: 44, left: 62, w: 1.6, h: 1.6, dur: 3.0, delay: 0.6 },
  { top: 52, left: 29, w: 2.5, h: 2.5, dur: 4.8, delay: 1.1 },
  { top: 58, left: 91, w: 1.8, h: 1.8, dur: 3.5, delay: 0.3 },
  { top: 65, left: 17, w: 1.3, h: 1.3, dur: 2.6, delay: 2.0 },
  { top: 71, left: 55, w: 2.0, h: 2.0, dur: 4.2, delay: 0.8 },
  { top: 77, left: 38, w: 1.5, h: 1.5, dur: 3.9, delay: 1.4 },
  { top: 83, left: 72, w: 2.6, h: 2.6, dur: 2.9, delay: 0.5 },
  { top: 90, left: 22, w: 1.1, h: 1.1, dur: 4.6, delay: 1.8 },
  { top: 95, left: 84, w: 2.2, h: 2.2, dur: 3.3, delay: 0.1 },
  { top: 5,  left: 50, w: 1.7, h: 1.7, dur: 4.0, delay: 1.6 },
  { top: 19, left: 33, w: 2.4, h: 2.4, dur: 3.1, delay: 0.7 },
  { top: 47, left: 8,  w: 1.9, h: 1.9, dur: 4.5, delay: 2.1 },
  { top: 60, left: 42, w: 1.2, h: 1.2, dur: 2.7, delay: 1.3 },
  { top: 74, left: 96, w: 2.7, h: 2.7, dur: 3.8, delay: 0.0 },
  { top: 86, left: 60, w: 1.4, h: 1.4, dur: 4.3, delay: 1.9 },
  { top: 13, left: 69, w: 2.0, h: 2.0, dur: 3.6, delay: 0.4 },
  { top: 28, left: 15, w: 1.6, h: 1.6, dur: 4.7, delay: 1.0 },
  { top: 41, left: 80, w: 2.3, h: 2.3, dur: 3.4, delay: 0.6 },
  { top: 55, left: 35, w: 1.8, h: 1.8, dur: 2.5, delay: 1.5 },
  { top: 68, left: 25, w: 2.1, h: 2.1, dur: 4.1, delay: 0.2 },
  { top: 80, left: 48, w: 1.3, h: 1.3, dur: 3.2, delay: 1.7 },
  { top: 92, left: 10, w: 2.5, h: 2.5, dur: 4.9, delay: 0.8 },
  { top: 35, left: 57, w: 1.1, h: 1.1, dur: 3.0, delay: 2.2 },
  { top: 63, left: 73, w: 2.8, h: 2.8, dur: 3.7, delay: 1.2 },
  { top: 88, left: 40, w: 1.5, h: 1.5, dur: 4.4, delay: 0.3 },
];

export default function EmployeeLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, loginType: "EMPLOYEE" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Employee Authentication Successful!");
        login(data.user);
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Access Denied");
      }
    } catch {
      toast.error("Connection synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden" style={{ background: "#f0f2f5" }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-[38%] flex-shrink-0 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(167, 37, 165, 0.8) 0%, rgba(139, 28, 137, 0.9) 50%, rgba(107, 21, 105, 1) 100%)",
        }}
      >
        {/* Stars */}
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.w,
              height: s.h,
              background: "rgba(255, 255, 255, 0.4)",
            }}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Planet glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 115%, rgba(167, 37, 165, 0.3) 0%, rgba(139, 28, 137, 0.1) 45%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          {/* Horizon arc */}
          <svg width="100%" height="140" viewBox="0 0 480 140" preserveAspectRatio="none"
            className="absolute bottom-0">
            <defs>
              <filter id="glowArc">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="arcGrad" cx="50%" cy="100%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </radialGradient>
            </defs>
            <ellipse cx="240" cy="200" rx="320" ry="130"
              fill="none" stroke="url(#arcGrad)" strokeWidth="1.5" filter="url(#glowArc)" />
          </svg>
        </div>

        {/* Top content */}
        <div className="relative z-10 p-10 pt-12 flex flex-col items-start text-left">
          {/* SPACE Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <img src="/logo.png" alt="Space Logo" className="h-43 w-auto object-contain brightness-0 invert" />
          </motion.div>

          {/* Welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-start"
          >
            <h1 className="text-5xl font-black mb-8 leading-tight text-white tracking-tighter">
              Welcome in!
            </h1>
            <p className="text-xl leading-relaxed text-purple-100/80 max-w-[340px]">
              Sign in to your employee account to access your assigned leads and conversations.
            </p>
          </motion.div>
        </div>

        {/* Bottom content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 p-10 pb-8 flex flex-col items-start"
        >
          {/* Security badge */}
          <div
            className="flex items-center gap-3 mb-6 p-5 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-white">Secure. Monitored. Logged.</p>
              <p className="text-xs mt-1 text-purple-100/60">All activities are recorded and monitored.</p>
            </div>
          </div>

          <p className="text-xs text-white/30 font-medium">© 2024 SPACE. All rights reserved.</p>
        </motion.div>
      </motion.div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ background: "#f0f2f5" }}
      >
        {/* Language selector — top right */}
        <div className="absolute top-4 right-4 z-20">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer select-none"
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-sm text-gray-600 font-medium">English</span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-[420px]"
          >
            {/* Person icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.4 }}
              className="flex justify-center mb-5"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#eef0fd" }}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1.5">Employee Login</h2>
              <p className="text-gray-400 text-sm">Access your assigned leads and conversations</p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm text-gray-700 bg-white rounded-xl outline-none transition-all placeholder-gray-300"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onFocus={e => { e.currentTarget.style.border = "1.5px solid #6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                    onBlur={e  => { e.currentTarget.style.border = "1.5px solid #e5e7eb"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-11 py-3 text-sm text-gray-700 bg-white rounded-xl outline-none transition-all placeholder-gray-300"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onFocus={e => { e.currentTarget.style.border = "1.5px solid #6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                    onBlur={e  => { e.currentTarget.style.border = "1.5px solid #e5e7eb"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember me + Forgot password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between pt-0.5"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className="w-4 h-4 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-all"
                    style={{
                      background: remember ? "#4f46e5" : "white",
                      border: remember ? "1.5px solid #4f46e5" : "1.5px solid #d1d5db",
                    }}
                  >
                    {remember && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 select-none">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </a>
              </motion.div>

              {/* Login button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78 }}
                className="pt-1"
              >
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base tracking-wide transition-all"
                  style={{
                    background: loading
                      ? "#818cf8"
                      : "linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #312e81 100%)",
                    boxShadow: loading ? "none" : "0 4px 16px rgba(67,56,202,0.45)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.82 }}
                className="flex items-center gap-3 py-1"
              >
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </motion.div>

              {/* OTP button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.88 }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015, backgroundColor: "#f5f3ff" }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full py-3.5 rounded-xl font-medium text-indigo-600 text-base flex items-center justify-center gap-2.5 transition-all"
                  style={{
                    background: "white",
                    border: "1.5px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Login with OTP
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 mt-8 text-gray-400 text-sm"
            >
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              All activities are securely logged and monitored.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}