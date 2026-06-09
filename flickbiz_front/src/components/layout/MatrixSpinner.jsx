import { motion } from "framer-motion";

export default function MatrixSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070205]">
      {/* Círculo exterior giratorio */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-16 h-16 rounded-full border-t-2 border-l-2 border-[#ff3f6c] border-r-transparent border-b-transparent mb-6"
      />
      
      {/* Texto de estado estilo terminal */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
        className="text-[10px] font-mono tracking-[0.4em] text-[#ff8c42] uppercase"
      >
        LOADING...
      </motion.div>
    </div>
  );
}