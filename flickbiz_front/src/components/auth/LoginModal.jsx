import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { FiX, FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";

// Scanline that sweeps the modal on open
function ScanLine() {
  return (
    <motion.div
      className="absolute inset-x-0 h-[2px] pointer-events-none z-20"
      style={{ background: "linear-gradient(90deg, transparent, #ff3f6c, #ff8c42, transparent)" }}
      initial={{ top: "0%", opacity: 0 }}
      animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.9, ease: "easeInOut", delay: 0.1 }}
    />
  );
}

// Glitch effect on title
function GlitchText({ text }) {
  const [glitching, setGlitching] = useState(false);

  return (
    <motion.h2
      className="text-3xl font-extrabold relative select-none"
      style={{ fontFamily: "var(--font-display)" }}
      onHoverStart={() => { setGlitching(true); setTimeout(() => setGlitching(false), 400); }}
    >
      {text}
      {glitching && (
        <>
          <motion.span className="absolute inset-0"
            animate={{ x: [-2, 2, -1, 0], opacity: [0.8, 0.6, 0.4, 0] }}
            transition={{ duration: 0.3 }}
            style={{ color: "#ff3f6c", clipPath: "inset(30% 0 50% 0)", fontFamily: "var(--font-display)" }}>
            {text}
          </motion.span>
          <motion.span className="absolute inset-0"
            animate={{ x: [2, -2, 1, 0], opacity: [0.8, 0.6, 0.4, 0] }}
            transition={{ duration: 0.3 }}
            style={{ color: "#60a5fa", clipPath: "inset(60% 0 20% 0)", fontFamily: "var(--font-display)" }}>
            {text}
          </motion.span>
        </>
      )}
    </motion.h2>
  );
}

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.username, data.password);
      toast.success("Welcome back!");
      onClose();
    } catch {
      toast.error("Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal variants — burst open, implode closed
  const modalVariants = {
    hidden: {
      scale: 1.15,
      opacity: 0,
      rotateX: -20,
      y: -60,
      filter: "blur(20px)",
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotateX: 0,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 240, damping: 22, mass: 0.8 },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      rotateX: 30,
      y: 80,
      filter: "blur(16px)",
      transition: { duration: 0.28, ease: [0.4, 0, 0.6, 1] },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ perspective: 1200 }}
        initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)" }}
        exit={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px)", transition: { duration: 0.25, delay: 0.1 } }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md overflow-hidden"
          style={{ borderRadius: 28, transformStyle: "preserve-3d" }}
        >
          {/* Scanline sweep on open */}
          <ScanLine />

          {/* Background */}
          <div className="absolute inset-0" style={{ background: "#07070f" }}>
            {/* Corner accent — top left */}
            <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
              style={{ background: "radial-gradient(circle at 0% 0%, rgba(255,63,108,0.18) 0%, transparent 70%)" }} />
            {/* Corner accent — bottom right */}
            <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
              style={{ background: "radial-gradient(circle at 100% 100%, rgba(255,140,66,0.14) 0%, transparent 70%)" }} />

            {/* Animated orbs */}
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-16 -left-16 rounded-full pointer-events-none"
              style={{ width: 220, height: 220, background: "#ff3f6c", filter: "blur(70px)" }} />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }}
              transition={{ duration: 5.5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-16 -right-16 rounded-full pointer-events-none"
              style={{ width: 220, height: 220, background: "#ff8c42", filter: "blur(70px)" }} />

            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "linear-gradient(rgba(255,63,108,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,63,108,1) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />

            {/* Diagonal stripes */}
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
          </div>

          {/* Outer border glow */}
          <motion.div className="absolute inset-0 rounded-[28px] pointer-events-none"
            animate={{ boxShadow: focused ? `0 0 0 1.5px #ff3f6c88, 0 0 60px rgba(255,63,108,0.2) inset, 0 30px 80px rgba(255,63,108,0.15)` : `0 0 0 1px rgba(255,63,108,0.2), 0 0 40px rgba(255,63,108,0.06) inset, 0 20px 60px rgba(0,0,0,0.6)` }}
            transition={{ duration: 0.4 }} />

          {/* Content */}
          <div className="relative z-10 p-8">

            {/* Close */}
            <motion.button whileHover={{ scale: 1.15, rotate: 90, background: "rgba(255,63,108,0.15)" }}
              whileTap={{ scale: 0.85 }} onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "#8888aa", cursor: "none" }}>
              <FiX size={15} />
            </motion.button>

            {/* Logo + header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-5">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                >
                  <img src="/flickbiz-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </motion.div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>FlickBiz</span>
              </div>
              <GlitchText text="Welcome back" />
              <p className="text-sm mt-1 mb-6" style={{ color: "#8888aa" }}>Sign in to your vault</p>
            </motion.div>

            {/* Form */}
            <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>

              {/* Username */}
              <div>
                <motion.div animate={{
                  borderColor: focused === "username" ? "#ff3f6c" : errors.username ? "#ff3f6c66" : "rgba(255,255,255,0.07)",
                  background: focused === "username" ? "rgba(255,63,108,0.05)" : "rgba(255,255,255,0.02)",
                }}
                  className="relative rounded-2xl overflow-hidden flex items-center px-4 py-4 gap-3"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <motion.div animate={{ color: focused === "username" ? "#ff3f6c" : "#8888aa" }}>
                    <FiUser size={16} />
                  </motion.div>
                  <input {...register("username", { required: "Username is required" })}
                    onFocus={() => setFocused("username")} onBlur={() => setFocused(null)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#f0f0f5" }} placeholder="Username" />
                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {focused === "username" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#ff3f6c", boxShadow: "0 0 6px #ff3f6c" }} />
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs mt-1 ml-2" style={{ color: "#ff3f6c" }}>{errors.username.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div>
                <motion.div animate={{
                  borderColor: focused === "password" ? "#ff3f6c" : errors.password ? "#ff3f6c66" : "rgba(255,255,255,0.07)",
                  background: focused === "password" ? "rgba(255,63,108,0.05)" : "rgba(255,255,255,0.02)",
                }}
                  className="relative rounded-2xl overflow-hidden flex items-center px-4 py-4 gap-3"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  <motion.div animate={{ color: focused === "password" ? "#ff3f6c" : "#8888aa" }}>
                    <FiLock size={16} />
                  </motion.div>
                  <input {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#f0f0f5" }} placeholder="Password" />
                  <motion.button type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                    onClick={() => setShowPassword(s => !s)}
                    style={{ color: "#8888aa", cursor: "none", flexShrink: 0 }}>
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </motion.button>
                  <AnimatePresence>
                    {focused === "password" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#ff3f6c", boxShadow: "0 0 6px #ff3f6c" }} />
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs mt-1 ml-2" style={{ color: "#ff3f6c" }}>{errors.password.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 50px rgba(255,63,108,0.45), 0 0 0 1px rgba(255,63,108,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="w-full py-4 rounded-2xl font-bold text-sm mt-2 relative overflow-hidden"
                style={{ background: loading ? "#1a1a24" : "linear-gradient(135deg,#ff3f6c,#ff8c42)", color: "white", fontFamily: "var(--font-display)", cursor: "none" }}>
                {/* Shimmer on hover */}
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", x: "-100%" }}
                  whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    Sign in <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
                  </span>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <motion.div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08))" }} />
              <span className="text-xs" style={{ color: "#555566" }}>or</span>
              <motion.div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,255,255,0.08),transparent)" }} />
            </div>

            <motion.p className="text-center text-sm" style={{ color: "#8888aa" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              No account yet?{" "}
              <motion.button whileHover={{ color: "#ff8c42", x: 2 }} onClick={onSwitchToRegister}
                className="font-bold inline-flex items-center gap-1" style={{ color: "#ff3f6c", cursor: "none" }}>
                Create one free
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
              </motion.button>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}