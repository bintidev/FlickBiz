import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Navbar from "./Navbar";

function CustomCursor() {
  const cx = useMotionValue(-200), cy = useMotionValue(-200);
  const sx = useSpring(cx, { stiffness: 600, damping: 35 });
  const sy = useSpring(cy, { stiffness: 600, damping: 35 });
  const tx = useSpring(cx, { stiffness: 100, damping: 18 });
  const ty = useSpring(cy, { stiffness: 100, damping: 18 });
  const [st, setSt] = useState("default");

  useEffect(() => {
    const mv = (e) => { cx.set(e.clientX); cy.set(e.clientY); };
    const md = () => setSt("click");
    const mu = () => setSt("default");
    const mo = (e) => setSt(e.target.closest("button,a,[data-cursor]") ? "hover" : "default");
    window.addEventListener("mousemove", mv);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("mouseover", mo);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("mouseover", mo);
    };
  }, []);

  return (
    <>
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border"
        style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", borderColor: st === "hover" ? "#ff3f6c" : "rgba(255,255,255,0.35)" }}
        animate={{ width: st === "hover" ? 44 : st === "click" ? 20 : 32, height: st === "hover" ? 44 : st === "click" ? 20 : 32 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }} />
      {st === "hover" && (
        <motion.div className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
          style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", width: 80, height: 80, background: "radial-gradient(circle,rgba(255,63,108,0.18),transparent)", filter: "blur(8px)" }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} />
      )}
      <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: 8, height: 8, background: st === "hover" ? "#ff3f6c" : "white", boxShadow: st === "hover" ? "0 0 10px #ff3f6c" : "none" }}
        transition={{ type: "spring", stiffness: 800, damping: 35 }} />
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  return (
    <div style={{ background: "#05050a", minHeight: "100vh", cursor: "none" }}>
      <CustomCursor />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main key={location.pathname}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ paddingTop: "72px" }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}