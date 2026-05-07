"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 3,
}));

export default function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, loginType: "MANAGEMENT" }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Owner Authentication Successful!");
        login(data.user);
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Access Denied");
      }
    } catch (error) {
      toast.error("Connection synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans"
      style={{
        background: "radial-gradient(ellipse at 50% 80%, #0a1a4e 0%, #050c1f 40%, #000000 100%)",
      }}
    >
      {/* Outer stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {STARS.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}

        {/* Bottom planet glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full" style={{ height: "200px" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "120%",
              height: "160px",
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(30,100,255,0.45) 0%, rgba(10,50,180,0.2) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          {/* Horizon line */}
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(60,150,255,0.6) 30%, rgba(100,180,255,0.9) 50%, rgba(60,150,255,0.6) 70%, transparent 100%)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "58px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(60,150,255,0.3) 30%, rgba(100,180,255,0.5) 50%, rgba(60,150,255,0.3) 70%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* ─── LEFT PANEL ─── */}
        <div
          className="relative flex flex-col w-5/12 flex-shrink-0 overflow-hidden p-9"
          style={{
            background: "linear-gradient(160deg, #0d1b3e 0%, #080f28 50%, #040a1a 100%)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Left panel inner stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 70}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() * 1.5 + 0.5,
                height: Math.random() * 1.5 + 0.5,
              }}
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* SPACE Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3"
          >
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={160} 
              height={52} 
              className="object-contain brightness-0 invert"
              priority
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm mb-5"
            style={{ letterSpacing: "0.03em" }}
          >
            Secure. Controlled. Encrypted.
          </motion.p>

          {/* Owner Access Badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6 inline-flex"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
              }}
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-gray-200">Owner Access</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-5"
          >
            <h1 className="text-3xl font-black text-white leading-tight">
              Take Control.<br />Monitor Everything.
            </h1>
            <div
              className="mt-4 w-10 h-0.5 rounded-full"
              style={{ background: "linear-gradient(90deg, #4f46e5, #818cf8)" }}
            />
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-5 flex-1"
          >
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "Oversee Chats",
                desc: "View and manage all employee conversations in real-time.",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                ),
                title: "Secure Drive",
                desc: "Access all files including restricted data with full control.",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Audit & Alerts",
                desc: "Monitor activity, review audits and stay ahead with real-time alerts.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom encrypted note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex items-start gap-2"
          >
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-500 text-xs leading-relaxed">
              Your data is encrypted and protected at every layer.
            </p>
          </motion.div>

          {/* Bottom planet glow inside panel */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "120px" }}>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "140%",
                height: "100px",
                background:
                  "radial-gradient(ellipse at 50% 100%, rgba(30,80,255,0.35) 0%, rgba(10,40,180,0.12) 50%, transparent 70%)",
                filter: "blur(6px)",
              }}
            />
            <svg
              width="100%"
              height="80"
              viewBox="0 0 480 80"
              preserveAspectRatio="none"
              style={{ position: "absolute", bottom: 0 }}
            >
              <path
                d="M-40 80 Q240 20 520 80"
                stroke="rgba(60,140,255,0.7)"
                strokeWidth="1.5"
                fill="none"
                filter="url(#glow)"
              />
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex-1 bg-white flex flex-col justify-center px-12 py-12"
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your SPACE owner account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setRemember(!remember)}
                  className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: remember ? "#2563eb" : "white",
                    border: remember ? "2px solid #2563eb" : "2px solid #d1d5db",
                  }}
                >
                  {remember && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 select-none">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-base tracking-wide transition-all"
              style={{
                background: loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* SSO Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.015, backgroundColor: "#f8faff" }}
              whileTap={{ scale: 0.985 }}
              className="w-full py-3.5 rounded-xl font-semibold text-blue-600 text-sm flex items-center justify-center gap-2.5 transition-all"
              style={{
                border: "1.5px solid #e5e7eb",
                background: "white",
              }}
            >
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Sign in with SSO
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure login powered by SPACE
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}