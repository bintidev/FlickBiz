import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilm, FiStar, FiUser, FiChevronDown, FiLogOut,
  FiBell, FiShuffle, FiMenu, FiX
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NAV = [
  { label: "Media", icon: FiFilm, children: [{ label: "Movies", to: "/movies" }, { label: "Series", to: "/series" }] },
  { label: "Reviews", icon: FiStar, to: "/reviews" },
  { label: "Discover", icon: FiShuffle, to: "/discover" },
];

function Dropdown({ items, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden min-w-[160px]"
      style={{ background: "#0d0d18", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 50 }}
    >
      {items.map((item) => (
        <Link key={item.to} to={item.to} onClick={onClose}>
          <motion.div whileHover={{ background: "rgba(255,63,108,0.09)", x: 4 }}
            className="px-4 py-3 text-sm font-medium flex items-center gap-2"
            style={{ color: "#c0c0d0", fontFamily: "var(--font-display)" }}>
            <span className="w-1 h-1 rounded-full" style={{ background: "#ff3f6c" }} />
            {item.label}
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // dropdown key
  const [mobileOpen, setMobileOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);

  // Detect narrow viewport
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close dropdowns on route change
  useEffect(() => { setOpen(null); setMobileOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    toast.success("See you soon!");
    navigate("/");
  };

  const toggle = (key) => setOpen((p) => (p === key ? null : key));

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily: "var(--font-display)" }}>
            F
          </motion.div>
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>FlickBiz</span>
        </Link>

        {/* Desktop nav links — hidden when narrow */}
        {!narrow && (
          <div className="flex items-center gap-1">
            {NAV.map((link) => (
              <div key={link.label} className="relative">
                {link.children ? (
                  <>
                    <motion.button whileHover={{ color: "#ff3f6c" }}
                      onClick={() => toggle(link.label)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{ color: open === link.label ? "#ff3f6c" : "#c0c0d0", fontFamily: "var(--font-display)", cursor: "none", background: open === link.label ? "rgba(255,63,108,0.08)" : "transparent" }}>
                      <link.icon size={15} />{link.label}
                      <motion.span animate={{ rotate: open === link.label ? 180 : 0 }}><FiChevronDown size={13} /></motion.span>
                    </motion.button>
                    <AnimatePresence>
                      {open === link.label && <Dropdown items={link.children} onClose={() => setOpen(null)} />}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link to={link.to}>
                    <motion.div whileHover={{ color: "#ff3f6c" }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{ color: location.pathname === link.to ? "#ff3f6c" : "#c0c0d0", fontFamily: "var(--font-display)", background: location.pathname === link.to ? "rgba(255,63,108,0.08)" : "transparent" }}>
                      <link.icon size={15} />{link.label}
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link to="/notifications">
            <motion.div whileHover={{ scale: 1.1, color: "#ff3f6c" }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", color: "#8888aa", cursor: "none" }}>
              <FiBell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#ff3f6c", boxShadow: "0 0 6px #ff3f6c" }} />
            </motion.div>
          </Link>

          {/* Profile dropdown — always visible */}
          <div className="relative">
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => toggle("profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: open === "profile" ? "rgba(255,63,108,0.1)" : "rgba(255,255,255,0.04)", cursor: "none", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#ff3f6c,#ff8c42)", fontFamily: "var(--font-display)" }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              {!narrow && (
                <span className="text-sm font-medium" style={{ color: "#c0c0d0", fontFamily: "var(--font-display)" }}>
                  {user?.username}
                </span>
              )}
              <motion.span animate={{ rotate: open === "profile" ? 180 : 0 }}>
                <FiChevronDown size={13} style={{ color: "#8888aa" }} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {open === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden min-w-[200px]"
                  style={{ background: "#0d0d18", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 50 }}
                >
                  {/* When narrow: show all nav links here too */}
                  {narrow && (
                    <>
                      {NAV.map((link) => (
                        link.children
                          ? link.children.map((child) => (
                            <Link key={child.to} to={child.to} onClick={() => setOpen(null)}>
                              <motion.div whileHover={{ background: "rgba(255,63,108,0.08)", x: 4 }}
                                className="px-4 py-3 text-sm font-medium flex items-center gap-2"
                                style={{ color: "#c0c0d0", fontFamily: "var(--font-display)" }}>
                                <link.icon size={14} style={{ color: "#ff3f6c" }} />{child.label}
                              </motion.div>
                            </Link>
                          ))
                          : (
                            <Link key={link.to} to={link.to} onClick={() => setOpen(null)}>
                              <motion.div whileHover={{ background: "rgba(255,63,108,0.08)", x: 4 }}
                                className="px-4 py-3 text-sm font-medium flex items-center gap-2"
                                style={{ color: "#c0c0d0", fontFamily: "var(--font-display)" }}>
                                <link.icon size={14} style={{ color: "#ff3f6c" }} />{link.label}
                              </motion.div>
                            </Link>
                          )
                      ))}
                      <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </>
                  )}
                  <Link to="/profile" onClick={() => setOpen(null)}>
                    <motion.div whileHover={{ background: "rgba(255,63,108,0.08)", x: 4 }}
                      className="px-4 py-3 text-sm font-medium flex items-center gap-2"
                      style={{ color: "#c0c0d0", fontFamily: "var(--font-display)" }}>
                      <FiUser size={14} /> My profile
                    </motion.div>
                  </Link>
                  <div className="h-px mx-3" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <motion.button whileHover={{ background: "rgba(255,63,108,0.08)", x: 4 }}
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm font-medium flex items-center gap-2"
                    style={{ color: "#ff3f6c", fontFamily: "var(--font-display)", cursor: "none" }}>
                    <FiLogOut size={14} /> Sign out
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* Click outside to close */}
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(null)} />
      )}
    </>
  );
}