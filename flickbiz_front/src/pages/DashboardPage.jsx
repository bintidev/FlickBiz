import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  getTrending, getStatuses, getMovies, getSeries, getDiscover,
  toggleFavorite, removeFavorite, setStatus, removeStatus
} from "../services/mediaService";
import { getPopularReviews, likeReview } from "../services/reviewService";
import {
  FiFilm, FiEye, FiHeart, FiClock, FiTrendingUp, FiZap,
  FiStar, FiShuffle, FiRefreshCw, FiMoreVertical, FiCheck, FiMessageSquare
} from "react-icons/fi";
import toast from "react-hot-toast";

// ── Canvas de Fondo ──
function DashCanvas() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const frame = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const onR = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    const onM = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", onR); window.addEventListener("mousemove", onM);
    const pts = Array.from({ length: 80 }, () => ({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25, s: Math.random()*1.2+.3, a: Math.random()*.3+.08, col: Math.random()>.6?"#ff3f6c":Math.random()>.5?"#ff8c42":"#fff" }));
    const stars = Array.from({ length: 160 }, () => ({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*.7+.2, a: Math.random()*.4+.08, t: Math.random()*Math.PI*2 }));
    let t = 0;
    const draw = () => {
      frame.current = requestAnimationFrame(draw); ctx.clearRect(0,0,W,H); t+=.007;
      const {x:mx,y:my}=mouse.current;
      const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.8); bg.addColorStop(0,"rgba(18,8,18,1)"); bg.addColorStop(1,"rgba(4,4,10,1)"); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      const mg=ctx.createRadialGradient(mx,my,0,mx,my,280); mg.addColorStop(0,"rgba(255,63,108,0.07)"); mg.addColorStop(1,"transparent"); ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
      [{x:W*.15,y:H*.3,r:180,c:"rgba(255,63,108,0.07)"},{x:W*.85,y:H*.6,r:220,c:"rgba(255,140,66,0.06)"},{x:W*.5,y:H*.85,r:160,c:"rgba(167,139,250,0.06)"}].forEach((o,i)=>{ const ox=o.x+Math.sin(t+i*1.2)*60,oy=o.y+Math.cos(t*.8+i)*40,g=ctx.createRadialGradient(ox,oy,0,ox,oy,o.r); g.addColorStop(0,o.c); g.addColorStop(1,"transparent"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); });
      for(let y=0;y<H;y+=4){ctx.fillStyle="rgba(0,0,0,0.022)";ctx.fillRect(0,y,W,1);}
      const bY=((t*60)%(H+80))-40,bm=ctx.createLinearGradient(0,bY,0,bY+40); bm.addColorStop(0,"transparent"); bm.addColorStop(.5,"rgba(255,63,108,0.03)"); bm.addColorStop(1,"transparent"); ctx.fillStyle=bm; ctx.fillRect(0,bY,W,40);
      ctx.strokeStyle="rgba(255,63,108,0.04)"; ctx.lineWidth=.5;
      const vx=W/2+Math.sin(t*.25)*80,vy=H*.45;
      for(let i=0;i<=16;i++){ctx.beginPath();ctx.moveTo((W/16)*i,H);ctx.lineTo(vx,vy);ctx.stroke();}
      for(let i=0;i<=10;i++){const p=i/10,e=p*p,y2=vy+(H-vy)*e;ctx.beginPath();ctx.moveTo(vx-(W/2)*e,y2);ctx.lineTo(vx+(W/2)*e,y2);ctx.stroke();}
      stars.forEach(s=>{s.t+=.018;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.a*(.5+.5*Math.sin(s.t))})`;ctx.fill();});
      pts.forEach(p=>{const dx=mx-p.x,dy=my-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<160){p.vx+=(dx/d)*.01;p.vy+=(dy/d)*.01;}p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.globalAlpha=p.a;ctx.fillStyle=p.col;ctx.fill();ctx.globalAlpha=1;});
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<60){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(255,63,108,${.05*(1-d/60)})`;ctx.lineWidth=.5;ctx.stroke();}}
    };
    draw();
    return()=>{cancelAnimationFrame(frame.current);window.removeEventListener("resize",onR);window.removeEventListener("mousemove",onM);};
  },[]);
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none" style={{zIndex:0}}/>;
}

// ── Tarjeta de Contenido ──
const ST=[{value:"watchlist",label:"Watchlist",icon:FiClock,color:"#a78bfa"},{value:"watching",label:"Watching",icon:FiEye,color:"#ff8c42"},{value:"watched",label:"Watched",icon:FiCheck,color:"#34d399"}];

function MediaCard({item,type="movie",isFavorite=false,currentStatus=null,onUpdate}){
  const [fav,setFav]=useState(isFavorite);
  const [st,setSt]=useState(currentStatus);
  const [menu,setMenu]=useState(false);
  const cardRef=useRef(null);
  const rx=useMotionValue(0), ry=useMotionValue(0);
  const srx=useSpring(rx,{stiffness:200,damping:20});
  const sry=useSpring(ry,{stiffness:200,damping:20});
  const glowX=useTransform(sry,[-12,12],["0%","100%"]);
  const glowY=useTransform(srx,[12,-12],["0%","100%"]);
  const title = item.title || item.name || "Sin título";
  const poster = item.poster || item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.poster;

  const onMove=(e)=>{
    const r=cardRef.current?.getBoundingClientRect();
    if(!r)return;
    ry.set(((e.clientX-r.left-r.width/2)/r.width)*12);
    rx.set(-((e.clientY-r.top-r.height/2)/r.height)*12);
  };
  const onLeave=()=>{rx.set(0);ry.set(0);};

  const handleFav=async(e)=>{e.stopPropagation();try{fav?await removeFavorite({[type]:item.id}):await toggleFavorite({[type]:item.id});setFav(!fav);onUpdate?.();}catch{toast.error("Error");}};
  const handleSt=async(s)=>{setMenu(false);try{st===s?(await removeStatus({[type]:item.id}),setSt(null)):(await setStatus({[type]:item.id,status:s}),setSt(s));onUpdate?.();}catch{toast.error("Error");}};
  const ao=ST.find(o=>o.value===st);
  const year=item.release_date?new Date(item.release_date).getFullYear():"—";
  const rating=item.average_rating?Math.round(item.average_rating*10)/10:null;

  return(
    <motion.div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{rotateX:srx,rotateY:sry,transformStyle:"preserve-3d",perspective:600,width:"100%",cursor:"none",zIndex:menu?30:1}}
      whileHover={{zIndex:30}}
      className="group relative">

      <div className="relative rounded-2xl overflow-hidden w-full" style={{aspectRatio:"2/3",background:"#111118",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
        {item.poster
          ?<motion.img src={item.poster} alt={item.title} className="w-full h-full object-cover"
            style={{filter:"brightness(0.82)"}}
            whileHover={{filter:"brightness(0.7)",scale:1.06}}
            transition={{duration:.4}}/>
          :<div className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{background:`linear-gradient(135deg,#1a1a26 0%,#0d0d16 100%)`}}>
            <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:3,repeat:Infinity}}>
              <FiFilm size={36} style={{color:"#ff3f6c",opacity:.5}}/>
            </motion.div>
            <p className="text-xs text-center px-3 leading-tight" style={{color:"#8888aa",fontFamily:"var(--font-display)"}}>{item.title}</p>
          </div>
        }

        <motion.div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{background:`radial-gradient(circle at ${glowX} ${glowY},rgba(255,255,255,0.07) 0%,transparent 60%)`}}/>

        <div className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{background:"linear-gradient(to bottom,rgba(0,0,0,.6),transparent)"}}/>
        <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{background:"linear-gradient(to top,rgba(5,5,10,.98) 0%,rgba(5,5,10,.5) 60%,transparent 100%)"}}/>

        <motion.div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          initial={{opacity:0,scaleX:0}} whileHover={{opacity:1,scaleX:1}}
          transition={{duration:.3}}
          style={{background:"linear-gradient(90deg,transparent,#ff3f6c,#ff8c42,transparent)"}}/>

        {rating&&(
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",color:"#ff8c42",fontFamily:"var(--font-display)"}}>
            <FiStar size={9} fill="#ff8c42"/>{rating}
          </div>
        )}

        <motion.button whileHover={{scale:1.3}} whileTap={{scale:.7}} onClick={handleFav} data-cursor
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{background:fav?"rgba(255,63,108,.9)":"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",cursor:"none"}}>
          <motion.div animate={fav?{scale:[1,1.5,1]}:{scale:1}} transition={{duration:.3}}>
            <FiHeart size={12} fill={fav?"white":"none"} color="white"/>
          </motion.div>
        </motion.button>

        {ao&&(
          <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute top-2.5 right-11 w-7 h-7 rounded-full flex items-center justify-center"
            style={{background:`${ao.color}22`,border:`1px solid ${ao.color}66`,backdropFilter:"blur(4px)"}}>
            <ao.icon size={11} style={{color:ao.color}}/>
          </motion.div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3" style={{transform:"translateZ(8px)"}}>
          <p className="text-sm font-bold leading-tight truncate" style={{fontFamily:"var(--font-display)",color:"#f0f0f5"}}>{item.title}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs" style={{color:"#8888aa"}}>{year}</span>
            <div className="relative">
              <motion.button whileHover={{scale:1.1,background:"rgba(255,63,108,0.2)"}} whileTap={{scale:.9}}
                onClick={e=>{e.stopPropagation();setMenu(!menu);}} data-cursor
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{background:"rgba(255,255,255,.1)",cursor:"none"}}>
                <FiMoreVertical size={11} color="white"/>
              </motion.button>
              <AnimatePresence>
                {menu&&(
                  <motion.div initial={{opacity:0,scale:.85,y:4,originY:1}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.85,y:4}}
                    transition={{type:"spring",stiffness:400,damping:26}}
                    className="absolute bottom-full right-0 mb-1 rounded-2xl overflow-hidden"
                    style={{background:"#080812",border:"1px solid rgba(255,255,255,.1)",minWidth:140,zIndex:40,boxShadow:"0 16px 50px rgba(0,0,0,.95)"}}>
                    {ST.map(o=>(
                      <motion.button key={o.value} whileHover={{background:`${o.color}14`,x:3}} onClick={()=>handleSt(o.value)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium"
                        style={{color:st===o.value?o.color:"#c0c0d0",fontFamily:"var(--font-display)",cursor:"none"}} data-cursor>
                        <o.icon size={12} style={{color:o.color}}/>{o.label}
                        {st===o.value&&<FiCheck size={9} className="ml-auto" style={{color:o.color}}/>}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tarjeta de Reseña (Red de Comentarios Flotantes) ──
function Stars({n}){return<div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><FiStar key={i} size={11} fill={i<n?"#60a5fa":"none"} color={i<n?"#60a5fa":"#333344"}/>)}</div>;}

function ReviewCard({review,index}){
  const [liked,setLiked] = useState(false);
  const [count,setCount] = useState(review.likes_count||0);
  
  // Variaciones de flotado según el índice para evitar que suban sincrónicamente
  const floatY = [0, -7, 5, -5, 0];
  const rotateZ = [0, 0.5, -0.5, 0.2, 0];

  const handleLike=async(e)=>{
    e.stopPropagation();
    try{const r=await likeReview(review.id);setLiked(r.data.liked);setCount(c=>r.data.liked?c+1:c-1);}catch{toast.error("Error");}
  };
  
  return(
    <motion.div
      animate={{ y: floatY, rotateZ: rotateZ }}
      transition={{
        y: { repeat: Infinity, duration: 4.5 + (index % 3), ease: "easeInOut" },
        rotateZ: { repeat: Infinity, duration: 5.5 + (index % 2), ease: "easeInOut" }
      }}
      whileHover={{
        y: -14,
        scale: 1.03,
        rotateX: 5,
        rotateY: -3,
        boxShadow: "0 35px 75px rgba(96,165,250,0.22), 0 0 30px rgba(96,165,250,0.06)",
        borderColor: "rgba(96,165,250,0.5)",
      }}
      className="relative rounded-2xl overflow-hidden transition-all h-full group"
      style={{
        background: "linear-gradient(145deg, rgba(10,10,22,0.96) 0%, rgba(5,5,12,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        cursor: "none",
        transformStyle: "preserve-3d",
        perspective: 1000
      }}>

      <motion.div className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity"
        style={{background:"linear-gradient(90deg,transparent,#60a5fa,#a78bfa,transparent)"}}/>

      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
        style={{backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px"}}/>

      {review.media_poster&&(
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-110">
          <img src={review.media_poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.03] group-hover:opacity-[0.09] transition-opacity duration-500" style={{filter:"blur(24px) saturate(2.5)"}}/>
        </div>
      )}

      <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-4">
        <div className="flex gap-4 items-start">
          {review.media_poster&&(
            <div className="relative flex-shrink-0 z-10" style={{transform: "translateZ(15px)"}}>
              <img src={review.media_poster} alt="" className="w-11 h-15 rounded-lg object-cover shadow-2xl transition-all duration-500 group-hover:brightness-100" style={{filter:"brightness(.65)"}}/>
              <div className="absolute inset-0 rounded-lg" style={{boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.15)"}}/>
            </div>
          )}
          <div className="flex-1 min-w-0" style={{transform: "translateZ(10px)"}}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-bold text-sm truncate text-slate-200 group-hover:text-white transition-colors">{review.title}</p>
              <Stars n={review.rating}/>
            </div>
            {review.media_title&&<p className="text-xs font-semibold tracking-wide mb-2" style={{color:"#60a5fa"}}>{review.media_title}</p>}
            <p className="text-xs line-clamp-3 leading-relaxed" style={{color:"#8888aa"}}>{review.preview}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]" style={{transform: "translateZ(5px)"}}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-inner"
              style={{background:"linear-gradient(135deg,#60a5fa,#a78bfa)",color:"white",fontFamily:"var(--font-display)"}}>
              {review.user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-medium" style={{color:"#656582"}}>{review.user?.username}</span>
          </div>
          <motion.button whileHover={{scale:1.15}} whileTap={{scale:.85}} onClick={handleLike} data-cursor
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
            style={{color:liked?"#ff3f6c":"#656582",background:liked?"rgba(255,63,108,.08)":"transparent",cursor:"none"}}>
            <motion.div animate={liked?{scale:[1,1.4,1]}:{}} transition={{duration:.3}}>
              <FiHeart size={11} fill={liked?"#ff3f6c":"none"}/>
            </motion.div>
            <span className="font-bold text-[11px] tabular-nums">{count}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Contenedor General de Sección ──
function Sec({children,color,transition:trans="slideUp"}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-80px"});

  const variants={
    slideUp:   {hidden:{opacity:0,y:80,filter:"blur(12px)"},  visible:{opacity:1,y:0,filter:"blur(0px)"}},
    slideLeft: {hidden:{opacity:0,x:100,filter:"blur(12px)"}, visible:{opacity:1,x:0,filter:"blur(0px)"}},
    zoomIn:    {hidden:{opacity:0,scale:.85,filter:"blur(16px)"},visible:{opacity:1,scale:1,filter:"blur(0px)"}},
    rotateIn:  {hidden:{opacity:0,rotateX:-15,y:60,filter:"blur(12px)"},visible:{opacity:1,rotateX:0,y:0,filter:"blur(0px)"}},
    flipIn:    {hidden:{opacity:0,scaleY:.7,y:40,filter:"blur(8px)"},visible:{opacity:1,scaleY:1,y:0,filter:"blur(0px)"}},
  };
  const v={...variants[trans]}||variants.slideUp;

  return(
    <section ref={ref} className="relative w-full overflow-hidden py-14">
      <motion.div animate={{scale:[1,1.3,1],opacity:[.05,.12,.05],x:[0,20,0]}}
        transition={{duration:7,repeat:Infinity}}
        className="absolute pointer-events-none rounded-full"
        style={{width:"55vw",height:"55vw",background:color,filter:"blur(120px)",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
      <div className="absolute inset-0 pointer-events-none"
        style={{background:"radial-gradient(ellipse 100% 100% at 50% 50%,transparent 20%,rgba(4,4,10,.7) 100%)"}}/>

      <motion.div
        variants={v} initial="hidden"
        animate={inView?"visible":"hidden"}
        transition={{duration:.75,ease:[.22,1,.36,1]}}
        className="relative z-10 max-w-7xl mx-auto w-full">
        {typeof children==="function"?children(inView):children}
      </motion.div>
    </section>
  );
}

function Skel({aspect}){return<div className="w-full rounded-2xl animate-pulse" style={{aspectRatio:aspect||"2/3",background:"linear-gradient(135deg,#1a1a26,#13131e)"}}/>;}

function SecHeader({icon:Icon,title,accent,subtitle,extra,color,inView}){
  return(
    <motion.div
      initial={{opacity:0,x:-40}} animate={inView?{opacity:1,x:0}:{}}
      transition={{duration:.6,ease:[.22,1,.36,1]}}
      className="flex items-center justify-between mb-8 px-8">
      <div className="flex items-center gap-4">
        <motion.div whileHover={{rotate:15,scale:1.1}}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background:`linear-gradient(135deg,${color},${color}88)`,boxShadow:`0 0 28px ${color}50`}}>
          <Icon size={18} color="white"/>
        </motion.div>
        <div>
          <h2 className="font-extrabold leading-none" style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.3rem,2.5vw,1.8rem)"}}>
            {title} <span style={{color}}>{accent}</span>
          </h2>
          {subtitle&&<p className="text-xs mt-1.5" style={{color:"#8888aa"}}>{subtitle}</p>}
        </div>
      </div>
      {extra}
    </motion.div>
  );
}

// ── COMPONENTE PRINCIPAL EXPORTADO ──
export default function DashboardPage(){
  const { user } = useAuth();

  const [trending, setTrending] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [discover, setDiscover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const fetchDiscover = async () => {
    setSpinning(true);
    try {
      const r = await getDiscover();
      const data = r.data.results ? r.data.results[0] : r.data;
      setDiscover(data);
    } catch (e) {
      console.error("Error en discover:", e);
    } finally {
      setTimeout(() => setSpinning(false), 600);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [tR, rR, sR, mR, srR] = await Promise.all([
          getTrending(),
          getPopularReviews(),
          getStatuses(),
          getMovies({ ordering: "-release_date", page_size: 12 }),
          getSeries({ ordering: "-release_date", page_size: 12 })
        ]);
        setTrending(tR.data.results || tR.data || []);
        setReviews(rR.data.results || rR.data || []);
        setStatuses(sR.data.results || sR.data || []);
        
        const combined = [
          ...(mR.data.results || []).map(m => ({ ...m, _type: "movie" })),
          ...(srR.data.results || []).map(s => ({ ...s, _type: "series" }))
        ].sort((a, b) => new Date(b.release_date) - new Date(a.release_date)).slice(0, 12);
        
        setNewItems(combined);
        await fetchDiscover();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const watched = Array.isArray(statuses) ? statuses.filter(s => s.status === "watched").length : 0;
  const watching = Array.isArray(statuses) ? statuses.filter(s => s.status === "watching").length : 0;
  const watchlist = Array.isArray(statuses) ? statuses.filter(s => s.status === "watchlist").length : 0;
  
  const stats = [
    { icon: FiFilm, label: "Watched", value: watched, color: "#ff3f6c" },
    { icon: FiEye, label: "Watching", value: watching, color: "#ff8c42" },
    { icon: FiClock, label: "Watchlist", value: watchlist, color: "#a78bfa" },
    { icon: FiHeart, label: "Favourites", value: 0, color: "#34d399" }
  ];

  const getGridClasses = (index) => {
    return index === 0 || index === 7 ? "md:col-span-2 md:row-span-2" : "col-span-1";
  };

  return(
    <div style={{minHeight:"100vh",cursor:"none"}}>
      <DashCanvas/>
      <Navbar />

      {/* Ticker de Estadísticas */}
      <div className="fixed top-[72px] left-0 right-0 z-30 overflow-hidden border-b py-2"
        style={{borderColor:"rgba(255,63,108,.1)",background:"rgba(4,4,10,.85)",backdropFilter:"blur(10px)"}}>
        <motion.div animate={{x:["0%","-50%"]}} transition={{duration:22,repeat:Infinity,ease:"linear"}} className="flex gap-12 whitespace-nowrap">
          {[...stats,...stats,...stats,...stats].map((s,i)=>(
            <span key={i} className="text-xs font-bold tracking-[.3em] flex items-center gap-2"
              style={{color:i%2===0?s.color:"#252535",fontFamily:"var(--font-display)"}}>
              <s.icon size={11} style={{color:s.color}}/>{s.label.toUpperCase()}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ══ SECCIÓN BIENVENIDA ══ */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden" style={{paddingTop:108}}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <motion.span animate={{opacity:[.015,.03,.015]}} transition={{duration:5,repeat:Infinity}}
            className="font-extrabold whitespace-nowrap"
            style={{fontFamily:"var(--font-display)",fontSize:"28vw",color:"white",letterSpacing:"-0.06em",lineHeight:1}}>
            VAULT
          </motion.span>
        </div>
        {[16,38,62,84].map((y,i)=>(
          <motion.div key={i} className="absolute inset-x-0 h-px pointer-events-none"
            style={{top:`${y}%`,background:`linear-gradient(90deg,transparent,${["#ff3f6c","#ff8c42","#a78bfa","#34d399"][i]}55,transparent)`}}
            animate={{opacity:[.2,.8,.2]}} transition={{duration:3+i,repeat:Infinity,delay:i*.6}}/>
        ))}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16">
          <div className="text-center lg:text-left max-w-2xl">
            <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.15}}
              className="text-xs font-bold tracking-[.45em] uppercase mb-4"
              style={{color:"#ff3f6c",fontFamily:"var(--font-display)"}}>
              {greeting}
            </motion.p>
            {[user?.username,"Your vault","is ready."].map((line,i)=>(
              <motion.div key={i} initial={{opacity:0,x:i%2===0?-60:60,filter:"blur(12px)"}} animate={{opacity:1,x:0,filter:"blur(0px)"}}
                transition={{delay:.2+i*.15,duration:.8,ease:[.22,1,.36,1]}}>
                <span className={`block font-extrabold leading-[.9] ${i===0?"text-gradient":""}`}
                  style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.8rem,7vw,6rem)"}}>
                  {line}
                </span>
              </motion.div>
            ))}
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}
              className="text-base mt-5" style={{color:"#8888aa",maxWidth:400}}>
              Here's what's happening in your cinema world today.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {stats.map((s,i)=>(
              <motion.div key={s.label}
                initial={{opacity:0,scale:.6,rotateX:-20}} animate={{opacity:1,scale:1,rotateX:0}}
                transition={{delay:.3+i*.1,type:"spring",stiffness:260,damping:18}}
                whileHover={{scale:1.1,y:-8,boxShadow:`0 24px 60px ${s.color}35`}}
                className="relative flex flex-col items-center gap-2 px-8 py-7 rounded-3xl overflow-hidden"
                style={{background:`linear-gradient(135deg,${s.color}14,${s.color}06)`,border:`1px solid ${s.color}35`,cursor:"none",minWidth:130}}>
                <motion.div animate={{rotate:360}} transition={{duration:10,repeat:Infinity,ease:"linear"}}
                  className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                  style={{border:`1px dashed ${s.color}30`}}/>
                <motion.div animate={{opacity:[.4,1,.4],scale:[1,1.3,1]}} transition={{duration:2,repeat:Infinity,delay:i*.4}}
                  className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                  style={{background:s.color,boxShadow:`0 0 10px ${s.color}`}}/>
                <s.icon size={22} style={{color:s.color}}/>
                <span className="text-4xl font-extrabold tabular-nums leading-none"
                  style={{fontFamily:"var(--font-display)",color:s.color}}>{s.value}</span>
                <span className="text-xs font-bold tracking-widest uppercase"
                  style={{color:"#8888aa",fontFamily:"var(--font-display)"}}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECCIÓN: NEW CONTENT ══ */}
      <Sec color="#a78bfa" transition="slideLeft">
        {(inView)=>(
          <>
            <SecHeader icon={FiZap} title="New" accent="&amp; available" subtitle="Latest releases across movies and series"
              color="#a78bfa" inView={inView}
              extra={
                <div className="flex items-center gap-4 mr-8">
                  <div className="flex items-center gap-2">
                    <motion.div animate={{rotate:[0,360]}} transition={{duration:6,repeat:Infinity,ease:"linear"}}
                      className="w-2 h-2 rounded-full" style={{background:"#a78bfa",boxShadow:"0 0 10px #a78bfa"}}/>
                    <span className="text-xs font-bold tracking-widest" style={{color:"#a78bfa",fontFamily:"var(--font-display)"}}>LIVE</span>
                  </div>
                </div>
              }/>
            
            <div className="px-8 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-max">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <Skel key={i} aspect="2/3" />)
                  : newItems.map((item, i) => (
                      <motion.div key={item.id+item._type}
                        initial={{opacity:0,scale:0.95}}
                        animate={inView?{opacity:1,scale:1}:{}}
                        transition={{delay:i*.02, duration:0.4}}
                        className={`transition-all duration-500 ease-out ${getGridClasses(i)}`}>
                        <MediaCard item={item} type={item._type} index={i}/>
                      </motion.div>
                    ))
                }
              </div>
            </div>
          </>
        )}
      </Sec>

      {/* ══ SECCIÓN: TRENDING ══ */}
      <Sec color="#ff3f6c" transition="rotateIn">
        {(inView)=>(
          <>
            <SecHeader icon={FiTrendingUp} title="Trending" accent="this week" subtitle="Most popular right now"
              color="#ff3f6c" inView={inView}
              extra={
                <div className="flex items-center gap-3 mr-8">
                  <motion.div animate={{scale:[1,1.5,1],opacity:[.5,1,.5]}} transition={{duration:1.2,repeat:Infinity}}
                    className="w-3 h-3 rounded-full" style={{background:"#ff3f6c",boxShadow:"0 0 14px #ff3f6c"}}/>
                  <span className="text-xs font-bold" style={{color:"#ff3f6c",fontFamily:"var(--font-display)"}}>UPDATING</span>
                </div>
              }/>
            <div className="px-8 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <Skel key={i} />)
                  : trending.slice(0,12).map((t,i)=>(
                      <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className={i === 0 || i === 9 ? "md:col-span-2 md:row-span-2" : ""}>
                        <MediaCard item={t.movie||t.series} type={t.movie?"movie":"series"} index={i}/>
                      </motion.div>
                    ))
                }
              </div>
            </div>
          </>
        )}
      </Sec>

      {/* ══ SECCIÓN: DISCOVER (CORREGIDA) ══ */}
      <Sec color="#f472b6" transition="zoomIn">
        {(inView) => (
          <div className="w-full">
            <SecHeader 
              icon={FiShuffle} 
              title="Picked" 
              accent="for you" 
              subtitle="Based on your taste — refresh for a new pick"
              color="#f472b6" 
              inView={inView}
              extra={
                <motion.button 
                  whileHover={{ scale: 1.15, boxShadow: "0 0 28px rgba(244,114,182,.5)" }}
                  whileTap={{ scale: .88 }} 
                  animate={{ rotate: spinning ? 360 : 0 }} 
                  transition={{ duration: 0.6 }}
                  onClick={fetchDiscover} 
                  data-cursor
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mr-8"
                  style={{ background: "rgba(244,114,182,.12)", color: "#f472b6", cursor: "none", border: "1px solid rgba(244,114,182,.3)" }}>
                  <FiRefreshCw size={16} />
                </motion.button>
              }
            />
            
            <div className="flex justify-center w-full px-8">
              <AnimatePresence mode="wait">
                {loading || !discover ? (
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full max-w-[280px]">
                    <Skel aspect="2/3" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key={discover.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[280px]">
                    <MediaCard 
                      item={discover} 
                      type={discover.release_date ? "movie" : "series"} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </Sec>

      {/* ══ SECCIÓN: POPULAR REVIEWS ══ */}
      <Sec color="#60a5fa" transition="flipIn">
        {(inView)=>(
          <>
            <SecHeader icon={FiMessageSquare} title="Popular" accent="reviews" subtitle="What the community is whispering" color="#60a5fa" inView={inView}/>
            <div className="px-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max relative">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} aspect="16/10" />)
                  : reviews.slice(0, 6).map((r, i) => (
                      <div key={r.id} className="h-full group">
                        <ReviewCard review={r} index={i}/>
                      </div>
                    ))
                }
              </div>
            </div>
          </>
        )}
      </Sec>
    </div>
  );
}