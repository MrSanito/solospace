"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LeadLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Placeholder for lead-specific login API
      const res = await fetch("/api/auth/lead/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Lead Portal Access Granted!");
        // Store lead info for the dashboard
        localStorage.setItem("lead_info", JSON.stringify(data.lead));
        router.push("/lead/dashboard"); 
      } else {
        toast.error(data.error || "Invalid Credentials");
      }
    } catch (error) {
      toast.error("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-base-100 overflow-hidden">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-2/5 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1e3a8a 0%, #3b82f6 30%, #1e40af 60%, #172554 100%)",
        }}
      >
        {/* Animated Background Elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-200/20"
            style={{
              width: Math.random() * 50 + 20,
              height: Math.random() * 50 + 20,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        ))}

        <div className="relative z-10 p-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-20"
          >
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={180} 
              height={60} 
              className="object-contain brightness-0 invert"
              priority
            />
            <span className="text-blue-200 font-bold uppercase tracking-widest text-xs mt-2 ml-2">Portal</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">Your Journey Starts Here</h1>
            <p className="text-blue-100 text-lg leading-relaxed font-medium">
              Access your personalized portal to track your project progress, manage documents, and chat directly with our experts.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 p-10"
        >
          <div className="flex items-center gap-4 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Direct Support Access</p>
              <p className="text-blue-100 text-xs">Chat with your assigned relationship manager.</p>
            </div>
          </div>
          <p className="text-blue-200/50 text-xs">© 2024 SPACE Portal. All rights reserved.</p>
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-blue-100 flex items-center justify-center border border-blue-50 p-4">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={80} 
                height={80} 
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter uppercase">Customer Portal Access</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Sign in with your registered email and portal key</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="label pb-1">
                <span className="label-text text-gray-400 font-black uppercase tracking-widest text-[10px] px-1">Registered Email</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input input-bordered w-full pl-10 bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold rounded-2xl h-12"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="label pb-1">
                <span className="label-text text-gray-400 font-black uppercase tracking-widest text-[10px] px-1">Portal Key</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your key"
                  required
                  className="input input-bordered w-full pl-10 pr-10 bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold rounded-2xl h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="checkbox checkbox-sm rounded-lg checkbox-primary"
                />
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Stay Logged In</span>
              </label>
              <a href="#" className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition-colors">
                Need Help Accessing?
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="space-y-3 pt-2"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary w-full text-white font-black uppercase tracking-[0.2em] rounded-2xl h-14"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none" }}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Access My Portal"}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              Don't have a portal key? <br/>
              <span className="text-blue-500 mt-1 block">Contact your representative</span>
             </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
