import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, subtitle, linkTo, linkLabel, icon: Icon, color = "#ff3f6c" }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
            <Icon size={17} style={{ color }} />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily:"var(--font-display)" }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color:"#8888aa" }}>{subtitle}</p>}
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo} data-cursor>
          <motion.span whileHover={{ color:"#ff8c42", x:3 }}
            className="text-xs font-bold flex items-center gap-1 transition-colors"
            style={{ color:"#ff3f6c", fontFamily:"var(--font-display)", cursor:"none" }}>
            {linkLabel}
            <motion.span animate={{ x:[0,3,0] }} transition={{ duration:1.2, repeat:Infinity }}>→</motion.span>
          </motion.span>
        </Link>
      )}
    </div>
  );
}