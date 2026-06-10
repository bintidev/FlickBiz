import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiFilm, FiStar, FiShuffle, FiLogOut, FiUser } from "react-icons/fi";
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
  const [open, setOpen] = useState(null); 
  const [modal, setModal] = useState(null);
  const navRef = useRef(null);

  useEffect(() => { setOpen(null); }, [location]);

  return (
    <>
      <motion.nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(5,5,10,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link to="/" className="flex items-center gap-2 z-50">
          <img src="/flickbiz-logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg hidden sm:block">FlickBiz</span>
        </Link>

        {/* Links Escritorio (Se ocultan si la pantalla baja de 1024px) */}
        {user && (
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV.map((link) => (
              <div key={link.label} className="relative">
                {link.children ? (
                  <button onClick={() => setOpen(open === link.label ? null : link.label)} 
                    className={`flex items-center gap-1.5 text-sm transition-colors ${open === link.label ? "text-[#ff3f6c]" : "text-[#c0c0d0] hover:text-[#ff3f6c]"}`}>
                    <link.icon size={15} /> {link.label} <FiChevronDown size={13} className={`transition-transform duration-300 ${open === link.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link to={link.to} className="flex items-center gap-1.5 text-sm text-[#c0c0d0] hover:text-[#ff3f6c]">
                    <link.icon size={15} /> {link.label}
                  </Link>
                )}

                {link.children && open === link.label && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 mt-3 w-40 bg-[#0a0a10]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]">
                    {link.children.map(c => (
                      <Link key={c.to} to={c.to} className="block px-4 py-2 text-sm text-gray-300 hover:text-[#ff3f6c] hover:bg-white/5 hover:translate-x-1 rounded-xl transition-all duration-300 ease-out">
                        {c.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón Usuario */}
        <div className="z-50 flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(open === "user" ? null : "user")} 
                className="flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-white/5 hover:bg-white/10 transition-all">
                
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 relative">
                  {user.profile_picture ? (
                    <img 
                      key={user.profile_picture}
                      src={user.profile_picture} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-[10px] font-bold uppercase absolute inset-0 flex items-center justify-center"
                    style={{ display: user.profile_picture ? 'none' : 'flex' }}
                  >
                    {user.username ? user.username[0] : "U"}
                  </span>
                </div>
                
                <span className="text-xs font-medium hidden sm:block">{user.username}</span>
                <FiChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${open === "user" ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {open === "user" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-3 w-56 bg-[#0a0a10]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
                  >
                    <div className="lg:hidden border-b border-white/10 mb-2 pb-2 flex flex-col gap-0.5">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Navigation
                      </div>
                      {NAV.map((link) => (
                        <div key={link.label} className="w-full">
                          {link.children ? (
                            link.children.map((child) => (
                              <Link
                                key={child.to}
                                to={child.to}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-[#ff3f6c] hover:bg-white/5 hover:translate-x-1 rounded-xl transition-all duration-300 ease-out"
                              >
                                <link.icon size={15} className="opacity-70" />
                                <span>{child.label}</span>
                              </Link>
                            ))
                          ) : (
                            <Link
                              to={link.to}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-[#ff3f6c] hover:bg-white/5 hover:translate-x-1 rounded-xl transition-all duration-300 ease-out"
                            >
                              <link.icon size={15} />
                              <span>{link.label}</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider lg:hidden">
                        Account
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-[#ff3f6c] hover:bg-white/5 hover:translate-x-1 rounded-xl transition-all duration-300 ease-out">
                        <FiUser size={15}/> Profile
                      </Link>
                      <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 hover:translate-x-1 rounded-xl transition-all duration-300 ease-out">
                        <FiLogOut size={15}/> Logout
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setModal("login")} 
                className="px-5 py-2 text-sm text-[#c0c0d0] hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button 
                onClick={() => setModal("register")} 
                className="px-5 py-2 text-sm text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-medium shadow-[0_0_15px_rgba(255,63,108,0.3)]"
                style={{ 
                  background: "linear-gradient(90deg, #ff3f6c, #ff8c42)" 
                }}
              >
                Join
              </button>
            </div>
          )}
        </div>
      </motion.nav>

      {modal === "login" && <LoginModal onClose={() => setModal(null)} onSwitchToRegister={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal("login")} />}
    </>
  );
}