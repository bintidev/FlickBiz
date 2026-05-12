import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiGlobe, FiCheck } from "react-icons/fi";

const COUNTRIES = [
  { code: "ES", name: "Spain" }, { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" }, { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" }, { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" }, { code: "CA", name: "Canada" },
];

// Animated step indicator
function StepBar({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i} className="relative h-1.5 rounded-full overflow-hidden"
          animate={{ width: i === current ? 32 : 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{ background: i < current ? "#ff3f6c" : i === current ? "transparent" : "#1e1e2a" }}>
          {i === current && (
            <motion.div className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(90deg,#ff3f6c,#ff8c42)" }} />
          )}
          {i < current && (
            <motion.div className="absolute inset-0" initial={{ x: "-100%" }} animate={{ x: "0%" }}
              style={{ background: "#ff3f6c" }} />
          )}
        </motion.div>
      ))}
      <span className="text-xs ml-1" style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>
        {current + 1}/{total}
      </span>
    </div>
  );
}

// Animated input
function AnimInput({ icon: Icon, error, focused, onFocus, onBlur, children, accent = "#ff3f6c" }) {
  return (
    <div>
      <motion.div
        animate={{
          borderColor: focused ? accent : error ? accent + "55" : "rgba(255,255,255,0.07)",
          background: focused ? `${accent}08` : "rgba(255,255,255,0.02)",
          boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
        }}
        className="relative rounded-2xl overflow-hidden flex items-center px-4 py-4 gap-3"
        style={{ border: "1px solid rgba(255,255,255,0.07)", transition: "box-shadow 0.2s" }}>
        <motion.div animate={{ color: focused ? accent : "#8888aa" }} transition={{ duration: 0.2 }}>
          <Icon size={16} />
        </motion.div>
        {children}
        <AnimatePresence>
          {focused && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-xs ml-2" style={{ color: accent }}>{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Scanline sweep
function ScanLine() {
  return (
    <motion.div className="absolute inset-x-0 h-[2px] pointer-events-none z-20"
      style={{ background: "linear-gradient(90deg,transparent,#a78bfa,#ff3f6c,transparent)" }}
      initial={{ top: "0%", opacity: 0 }}
      animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.9, ease: "easeInOut", delay: 0.1 }} />
  );
}

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [focused, setFocused] = useState(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

  const goNext = async () => {
    const valid = await trigger(["username", "email"]);
    if (valid) setStep(1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data.username, data.email, data.password, data.country);
      setDone(true);
      setTimeout(() => {
        toast.success("Account created! Please sign in.");
        onSwitchToLogin();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || "Registration failed. Try again.";
      toast.error(msg);
      setLoading(false);
    }
  };

  const iStyle = { color: "#f0f0f5", background: "transparent", outline: "none", width: "100%", fontSize: "0.875rem" };

  // Modal open — shatter in from fragments; close — dissolve up
  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 60, rotateX: -24, filter: "blur(24px)" },
    visible: {
      scale: 1, opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 220, damping: 20, mass: 0.9 },
    },
    exit: {
      scale: 1.1, opacity: 0, y: -60, rotateX: 20, filter: "blur(20px)",
      transition: { duration: 0.3, ease: [0.4, 0, 0.6, 1] },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(14px)", backgroundColor: "rgba(0,0,0,0.88)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.25, delay: 0.1 } }}
        onClick={onClose}
        style={{ perspective: 1200 }}
      >
        <motion.div onClick={(e) => e.stopPropagation()}
          variants={modalVariants} initial="hidden" animate="visible" exit="exit"
          className="relative w-full max-w-md overflow-hidden"
          style={{ borderRadius: 28, transformStyle: "preserve-3d" }}>

          <ScanLine />

          {/* BG */}
          <div className="absolute inset-0" style={{ background: "#07070f" }}>
            <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
              style={{ background: "radial-gradient(circle at 100% 0%,rgba(167,139,250,0.16) 0%,transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none"
              style={{ background: "radial-gradient(circle at 0% 100%,rgba(255,63,108,0.12) 0%,transparent 70%)" }} />
            <motion.div animate={{ scale:[1,1.3,1], opacity:[0.08,0.16,0.08] }} transition={{ duration:5, repeat:Infinity }}
              className="absolute -top-16 -right-16 rounded-full pointer-events-none"
              style={{ width:220, height:220, background:"#a78bfa", filter:"blur(70px)" }} />
            <motion.div animate={{ scale:[1,1.2,1], opacity:[0.07,0.13,0.07] }} transition={{ duration:6.5, repeat:Infinity, delay:1.5 }}
              className="absolute -bottom-16 -left-16 rounded-full pointer-events-none"
              style={{ width:220, height:220, background:"#ff3f6c", filter:"blur(70px)" }} />
            <div className="absolute inset-0 opacity-[0.035]"
              style={{ backgroundImage:"linear-gradient(rgba(167,139,250,1) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,1) 1px,transparent 1px)", backgroundSize:"36px 36px" }} />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize:"20px 20px" }} />
          </div>

          {/* Border */}
          <motion.div className="absolute inset-0 rounded-[28px] pointer-events-none"
            animate={{ boxShadow: focused ? "0 0 0 1.5px #a78bfa88, 0 0 60px rgba(167,139,250,0.15) inset, 0 30px 80px rgba(167,139,250,0.1)" : "0 0 0 1px rgba(167,139,250,0.18), 0 0 40px rgba(167,139,250,0.05) inset, 0 20px 60px rgba(0,0,0,0.7)" }}
            transition={{ duration: 0.4 }} />

          {/* Success overlay */}
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[28px]"
                style={{ background: "rgba(7,7,15,0.96)" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", boxShadow: "0 0 50px rgba(255,63,108,0.4)" }}>
                  <FiCheck size={36} color="white" strokeWidth={3} />
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Account created!</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  className="text-sm mt-1" style={{ color: "#8888aa" }}>Taking you to sign in...</motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 p-8">
            <motion.button whileHover={{ scale: 1.15, rotate: 90, background: "rgba(167,139,250,0.15)" }}
              whileTap={{ scale: 0.85 }} onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", color: "#8888aa", cursor: "none" }}>
              <FiX size={15} />
            </motion.button>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-5">
                <motion.div whileHover={{ rotate: -15, scale: 1.1 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily: "var(--font-display)" }}>F</motion.div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#8888aa", fontFamily: "var(--font-display)" }}>FlickBiz</span>
              </div>
              <div className="flex items-end justify-between mb-1">
                <motion.h2 key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                  {step === 0 ? "Create account" : "Almost there"}
                </motion.h2>
                <StepBar current={step} total={2} />
              </div>
              <motion.p key={`sub-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="text-sm mb-6" style={{ color: "#8888aa" }}>
                {step === 0 ? "Your cinema vault awaits" : "One last step"}
              </motion.p>
            </motion.div>

            {/* Steps */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0"
                    initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3">
                    <AnimInput icon={FiUser} error={errors.username?.message} focused={focused === "u"}
                      onFocus={() => setFocused("u")} onBlur={() => setFocused(null)}>
                      <input {...register("username", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })}
                        onFocus={() => setFocused("u")} onBlur={() => setFocused(null)}
                        className="flex-1 bg-transparent outline-none text-sm" style={iStyle} placeholder="Username" />
                    </AnimInput>
                    <AnimInput icon={FiMail} error={errors.email?.message} focused={focused === "em"}>
                      <input {...register("email", { required: "Required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })}
                        type="email" onFocus={() => setFocused("em")} onBlur={() => setFocused(null)}
                        className="flex-1 bg-transparent outline-none text-sm" style={iStyle} placeholder="Email" />
                    </AnimInput>
                    <motion.button type="button"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(255,63,108,0.4)" }}
                      whileTap={{ scale: 0.97 }} onClick={goNext}
                      className="w-full py-4 rounded-2xl font-bold text-sm mt-1 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", color: "white", fontFamily: "var(--font-display)", cursor: "none" }}>
                      <motion.div className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", x: "-100%" }}
                        whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Continue
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
                      </span>
                    </motion.button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3">
                    <AnimInput icon={FiLock} error={errors.password?.message} focused={focused === "pw"} accent="#a78bfa">
                      <input {...register("password", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })}
                        type={showPassword ? "text" : "password"}
                        onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)}
                        className="flex-1 bg-transparent outline-none text-sm" style={iStyle} placeholder="Password (min 8)" />
                      <motion.button type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                        onClick={() => setShowPassword(s => !s)}
                        style={{ color: "#8888aa", cursor: "none", flexShrink: 0 }}>
                        {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </motion.button>
                    </AnimInput>
                    <AnimInput icon={FiGlobe} error={errors.country?.message} focused={focused === "co"} accent="#a78bfa">
                      <select {...register("country")}
                        onFocus={() => setFocused("co")} onBlur={() => setFocused(null)}
                        style={{ ...iStyle, appearance: "none", cursor: "none" }}>
                        <option value="" style={{ background: "#07070f" }}>Country (optional)</option>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code} style={{ background: "#07070f" }}>{c.name}</option>
                        ))}
                      </select>
                    </AnimInput>

                    <div className="flex gap-3 mt-1">
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setStep(0)}
                        className="flex-1 py-4 rounded-2xl font-bold text-sm"
                        style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#8888aa", fontFamily: "var(--font-display)", cursor: "none" }}>
                        ← Back
                      </motion.button>
                      <motion.button type="submit" disabled={loading}
                        whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 50px rgba(167,139,250,0.4)" } : {}}
                        whileTap={!loading ? { scale: 0.97 } : {}}
                        className="flex-2 px-6 py-4 rounded-2xl font-bold text-sm relative overflow-hidden"
                        style={{ background: loading ? "#1a1a24" : "linear-gradient(135deg,#a78bfa,#ff3f6c)", color: "white", fontFamily: "var(--font-display)", cursor: "none", flex: 2 }}>
                        <motion.div className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", x: "-100%" }}
                          whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                        {loading ? (
                          <span className="flex items-center justify-center gap-2 relative z-10">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white" />
                            Creating...
                          </span>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Create account ✓
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07))" }} />
              <span className="text-xs" style={{ color: "#555566" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(255,255,255,0.07),transparent)" }} />
            </div>

            <motion.p className="text-center text-sm" style={{ color: "#8888aa" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Already have an account?{" "}
              <motion.button whileHover={{ color: "#ff8c42" }} onClick={onSwitchToLogin}
                className="font-bold inline-flex items-center gap-1" style={{ color: "#ff3f6c", cursor: "none" }}>
                Sign in
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
              </motion.button>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}