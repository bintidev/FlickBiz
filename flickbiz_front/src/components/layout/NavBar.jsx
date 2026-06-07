import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiFilm, FiStar, FiShuffle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";

const NAV = [
  { label: "Media", icon: FiFilm, children: [{ label: "Movies", to: "/movies" }, { label: "Series", to: "/series" }] },
  { label: "Reviews", icon: FiStar, to: "/reviews" },
  { label: "Discover", icon: FiShuffle, to: "/discover" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [narrow, setNarrow] = useState(false);
  const [modal, setModal] = useState(null); // Estado para controlar el modal activo

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setOpen(null); }, [location]);

  const toggle = (key) => setOpen((p) => (p === key ? null : key));

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <img src="/flickbiz-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="hidden sm:block font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
            FlickBiz
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {!narrow && (
                <div className="flex items-center gap-1">
                  {NAV.map((link) => (
                    <div key={link.label} className="relative">
                      {link.children ? (
                        <button 
                          onClick={() => toggle(link.label)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-[#c0c0d0] hover:text-[#ff3f6c]"
                        >
                          <link.icon size={15} /> {link.label} <FiChevronDown size={13} />
                        </button>
                      ) : (
                        <Link to={link.to} className="px-4 py-2 text-sm text-[#c0c0d0] hover:text-[#ff3f6c]">
                          <link.icon size={15} /> {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => toggle("profile")} className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3f6c] to-[#ff8c42] text-xs font-bold text-white">
                {user?.username?.[0]?.toUpperCase()}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setModal("login")}
                className="px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm border border-white/10 text-[#f0f0f5] transition-colors hover:bg-white/5"
              >
                Sign in
              </button>
              <button 
                onClick={() => setModal("register")}
                className="px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm bg-gradient-to-r from-[#ff3f6c] to-[#ff8c42] text-white font-medium hover:opacity-90 transition-opacity"
              >
                {narrow ? "Join" : "Get started"}
              </button>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Overlay para cerrar menús desplegables */}
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(null)} />}

      {/* Renderizado condicional de Modales */}
      {modal === "login" && (
        <LoginModal 
          onClose={() => setModal(null)} 
          onSwitchToRegister={() => setModal("register")} 
        />
      )}
      {modal === "register" && (
        <RegisterModal 
          onClose={() => setModal(null)} 
          onSwitchToLogin={() => setModal("login")} 
        />
      )}
    </>
  );
}