import { useState, useMemo } from "react";

const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
function useLS(key, def) {
  const [val, setVal] = useState(() => LS.get(key, def));
  const set = v => { const nv = typeof v === "function" ? v(val) : v; LS.set(key, nv); setVal(nv); };
  return [val, set];
}

const CATEGORIES = [
  { id: "clothes",     label: "Clothes",     icon: "👕" },
  { id: "toiletries",  label: "Toiletries",  icon: "🧴" },
  { id: "docs",        label: "Documents",   icon: "📄" },
  { id: "tech",        label: "Tech",        icon: "💻" },
  { id: "health",      label: "Health",      icon: "💊" },
  { id: "accessories", label: "Accessories", icon: "📷" },
  { id: "misc",        label: "Misc",        icon: "📦" },
];

const TRIP_EMOJIS = ["✈️","🏖️","🌊","🐚","🚢","🤿","🏄","🗺️","🐠","⛵","🚂"];

const DEFAULT_TEMPLATE = [
  { id: 1,  text: "Passport / ID",     cat: "docs",        essential: true  },
  { id: 2,  text: "Flight tickets",    cat: "docs",        essential: true  },
  { id: 3,  text: "Travel insurance",  cat: "docs",        essential: false },
  { id: 4,  text: "T-shirts (x3)",     cat: "clothes",     essential: false },
  { id: 5,  text: "Underwear (x5)",    cat: "clothes",     essential: true  },
  { id: 6,  text: "Swimwear",          cat: "clothes",     essential: false },
  { id: 7,  text: "Toothbrush",        cat: "toiletries",  essential: true  },
  { id: 8,  text: "Toothpaste",        cat: "toiletries",  essential: true  },
  { id: 9,  text: "Sunscreen",         cat: "toiletries",  essential: false },
  { id: 10, text: "Phone charger",     cat: "tech",        essential: true  },
  { id: 11, text: "Power bank",        cat: "tech",        essential: false },
  { id: 12, text: "Headphones",        cat: "tech",        essential: false },
  { id: 13, text: "Medicines",         cat: "health",      essential: true  },
  { id: 14, text: "Jewellery",         cat: "accessories", essential: false },
  { id: 15, text: "Footwear",          cat: "accessories", essential: true  },
  { id: 16, text: "Cash / card",       cat: "misc",        essential: true  },
  { id: 17, text: "Snacks",            cat: "misc",        essential: false },
];

function uid() { return Date.now() + Math.random().toString(36).slice(2); }
function today() { return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function Ring({ pct, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? "#34d399" : "#22d3ee";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(34,211,238,.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.4,0,.2,1), stroke .4s" }} />
    </svg>
  );
}

function WaveDivider() {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: "100%", height: 32, display: "block", opacity: 0.12 }}>
      <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" fill="#22d3ee" />
    </svg>
  );
}

function TripView({ activeTrip, toggleItem, addTripItem, removeTripItem, uncheckAll, tripProgress, onDelete }) {
  const [addText, setAddText]       = useState("");
  const [addCat, setAddCat]         = useState("misc");
  const [tripFilter, setTripFilter] = useState("all");
  const [onlyLeft, setOnlyLeft]     = useState(false);

  const pct = tripProgress(activeTrip);

  const grouped = useMemo(() => {
    let items = activeTrip.items;
    if (onlyLeft) items = items.filter(i => !i.checked);
    if (tripFilter !== "all") items = items.filter(i => i.cat === tripFilter);
    const g = {};
    CATEGORIES.forEach(c => { g[c.id] = []; });
    items.forEach(i => { if (g[i.cat]) g[i.cat].push(i); });
    return g;
  }, [activeTrip.items, tripFilter, onlyLeft]);

  function doAdd() {
    if (!addText.trim()) return;
    addTripItem(activeTrip.id, addText, addCat);
    setAddText("");
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="d-flex align-items-center gap-3 mb-3" style={{ animation: "fadeUp .4s ease" }}>
        <div style={{ fontSize: 38 }}>{activeTrip.emoji}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: "#e0f7fa", letterSpacing: "-.02em", margin: 0, lineHeight: 1.1 }}>{activeTrip.name}</h1>
          <div style={{ fontSize: 12, color: "rgba(34,211,238,.38)" }}>{activeTrip.date} · {activeTrip.items.length} items</div>
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Ring pct={pct} size={62} stroke={6} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#e0f7fa" }}>{pct}%</div>
        </div>
        <div className="d-flex flex-column gap-2">
          <button className="ghost-btn" style={{ fontSize: 12 }} onClick={() => uncheckAll(activeTrip.id)}>Reset</button>
          <button className="ghost-btn" style={{ fontSize: 12, color: "rgba(248,113,113,.55)", borderColor: "rgba(248,113,113,.18)" }} onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className="progress-bar-bg mb-4" style={{ height: 6, animation: "fadeUp .4s ease .05s both" }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {pct === 100 && (
        <div className="sea-card p-3 mb-4 text-center" style={{ border: "1px solid rgba(52,211,153,.22)", background: "rgba(52,211,153,.06)", animation: "popIn .4s ease" }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#34d399", letterSpacing: ".02em", marginLeft: 10 }}>All packed! Bon voyage! 🌊</span>
        </div>
      )}

      <div className="sea-card p-3 mb-4" style={{ animation: "fadeUp .4s ease .08s both" }}>
        <div className="row g-2">
          <div className="col">
            <input className="form-control pm-input" placeholder="Add extra item for this trip…" value={addText} onChange={e => setAddText(e.target.value)} onKeyDown={e => e.key === "Enter" && doAdd()} />
          </div>
          <div className="col-auto">
            <select className="form-select pm-input pm-select" value={addCat} onChange={e => setAddCat(e.target.value)} style={{ width: 140 }}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="col-auto">
            <button className="cyan-btn" onClick={doAdd} disabled={!addText.trim()}>Add</button>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap" style={{ animation: "fadeUp .4s ease .1s both" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
          <button className={`tab-btn ${tripFilter === "all" ? "active" : ""}`} onClick={() => setTripFilter("all")}>All</button>
          {CATEGORIES.map(c => {
            const n = activeTrip.items.filter(i => i.cat === c.id).length;
            return n > 0 ? (<button key={c.id} className={`tab-btn ${tripFilter === c.id ? "active" : ""}`} onClick={() => setTripFilter(c.id)}>{c.icon}</button>) : null;
          })}
        </div>
        <button
          className="ghost-btn"
          style={{ fontSize: 12, ...(onlyLeft ? { borderColor: "rgba(34,211,238,.35)", color: "#22d3ee", background: "rgba(34,211,238,.08)" } : {}) }}
          onClick={() => setOnlyLeft(v => !v)}
        >
          {onlyLeft ? "⬜ Remaining" : "📋 All items"}
        </button>
      </div>

      {CATEGORIES.map(cat => {
        const items = grouped[cat.id];
        if (!items || !items.length) return null;
        const done = items.filter(i => i.checked).length;
        return (
          <div key={cat.id} className="sea-card mb-3" style={{ animation: "fadeUp .4s ease .12s both" }}>
            <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid rgba(34,211,238,.07)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{cat.icon}</span>
              <span style={{ fontWeight: 700, color: "rgba(224,247,250,.65)", fontSize: 13 }}>{cat.label}</span>
              <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: done === items.length ? "#34d399" : "rgba(34,211,238,.35)" }}>
                {done}/{items.length}
              </span>
            </div>
            {items.map(item => (
              <div key={item.id} className={`check-item ${item.checked ? "checked" : ""}`}>
                <div className={`custom-check ${item.checked ? "on" : ""}`} onClick={() => toggleItem(activeTrip.id, item.id)} />
                {item.essential && !item.checked && <div className="essential-dot" />}
                <div style={{ flex: 1, fontSize: 14, color: item.checked ? "rgba(224,247,250,.35)" : "rgba(224,247,250,.82)", textDecoration: item.checked ? "line-through" : "none", transition: "all .2s" }}>{item.text}</div>
                <button className="del-btn" onClick={() => removeTripItem(activeTrip.id, item.id)}>✕</button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function PackMate() {
  const [template, setTemplate]   = useLS("pm2_template", DEFAULT_TEMPLATE);
  const [trips, setTrips]         = useLS("pm2_trips", []);
  const [view, setView]           = useState("home");
  const [activeTripId, setActive] = useState(null);

  const [tInput, setTInput]    = useState("");
  const [tCat, setTCat]        = useState("misc");
  const [tEss, setTEss]        = useState(false);
  const [filterCat, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [tripName, setTripName]   = useState("");
  const [tripDate, setTripDate]   = useState("");
  const [tripEmoji, setTripEmoji] = useState("🌊");

  const activeTrip = trips.find(t => t.id === activeTripId);

  function addTemplateItem() {
    if (!tInput.trim()) return;
    setTemplate(p => [...p, { id: uid(), text: tInput.trim(), cat: tCat, essential: tEss }]);
    setTInput(""); setTEss(false);
  }
  function removeTemplateItem(id) { setTemplate(p => p.filter(i => i.id !== id)); }
  function toggleEssential(id)    { setTemplate(p => p.map(i => i.id === id ? { ...i, essential: !i.essential } : i)); }

  function createTrip() {
    if (!tripName.trim()) return;
    const trip = { id: uid(), name: tripName.trim(), date: tripDate || today(), emoji: tripEmoji, createdAt: new Date().toISOString(), items: template.map(i => ({ ...i, id: uid(), checked: false })) };
    setTrips(p => [trip, ...p]);
    setTripName(""); setTripDate(""); setTripEmoji("🌊");
    setShowModal(false); setActive(trip.id); setView("trip");
  }
  function deleteTrip(id) {
    setTrips(p => p.filter(t => t.id !== id));
    if (activeTripId === id) { setActive(null); setView("home"); }
  }
  function toggleItem(tid, iid)        { setTrips(p => p.map(t => t.id !== tid ? t : { ...t, items: t.items.map(i => i.id === iid ? { ...i, checked: !i.checked } : i) })); }
  function addTripItem(tid, text, cat) { if (!text.trim()) return; setTrips(p => p.map(t => t.id !== tid ? t : { ...t, items: [...t.items, { id: uid(), text: text.trim(), cat, essential: false, checked: false }] })); }
  function removeTripItem(tid, iid)    { setTrips(p => p.map(t => t.id !== tid ? t : { ...t, items: t.items.filter(i => i.id !== iid) })); }
  function uncheckAll(tid)             { setTrips(p => p.map(t => t.id !== tid ? t : { ...t, items: t.items.map(i => ({ ...i, checked: false })) })); }

  const filteredTemplate = filterCat === "all" ? template : template.filter(i => i.cat === filterCat);
  function tripProgress(trip) { return !trip.items.length ? 0 : Math.round((trip.items.filter(i => i.checked).length / trip.items.length) * 100); }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body{background:#050d18 !important;font-family:'DM Sans',sans-serif !important;min-height:100vh}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn   {0%{opacity:0;transform:scale(.86)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
        @keyframes bubble  {0%{transform:translateY(0) scale(1);opacity:.6}100%{transform:translateY(-80px) scale(.4);opacity:0}}
        @keyframes shimmer {0%,100%{opacity:.4}50%{opacity:.9}}
        @keyframes float   {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

        .pm-sidebar{width:262px;flex-shrink:0;background:linear-gradient(180deg,#071428 0%,#060f1e 100%);border-right:1px solid rgba(34,211,238,.08);min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden}
        .pm-sidebar::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(34,211,238,.07) 0%,transparent 65%);pointer-events:none}
        .pm-main{flex:1;min-width:0;background:#050d18;position:relative;overflow:hidden}
        .pm-main::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 20%,rgba(34,211,238,.05) 0%,transparent 55%),radial-gradient(ellipse at 20% 80%,rgba(14,116,144,.08) 0%,transparent 50%);pointer-events:none;z-index:0}
        .pm-content{position:relative;z-index:1}

        .sea-card{background:rgba(7,20,40,.75);border:1px solid rgba(34,211,238,.10);border-radius:18px;backdrop-filter:blur(12px);box-shadow:0 4px 24px rgba(0,0,0,.35),inset 0 1px 0 rgba(34,211,238,.06)}
        .pm-input{background:rgba(34,211,238,.05) !important;border:1px solid rgba(34,211,238,.14) !important;border-radius:10px !important;color:#e0f7fa !important;font-family:'DM Sans',sans-serif !important;font-size:14px !important}
        .pm-input:focus{border-color:rgba(34,211,238,.45) !important;box-shadow:0 0 0 3px rgba(34,211,238,.10) !important;outline:none !important;background:rgba(34,211,238,.08) !important}
        .pm-input::placeholder{color:rgba(34,211,238,.28) !important}
        .pm-select option{background:#071428;color:#e0f7fa}

        .nav-btn{width:100%;text-align:left;background:transparent;border:none;border-radius:10px;padding:10px 14px;color:rgba(224,247,250,.42);font-size:13.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:10px}
        .nav-btn:hover{background:rgba(34,211,238,.07);color:rgba(224,247,250,.85)}
        .nav-btn.active{background:rgba(34,211,238,.13);color:#22d3ee;border-left:3px solid #22d3ee;padding-left:11px}

        .cyan-btn{background:linear-gradient(135deg,#0891b2,#06b6d4);border:none;border-radius:10px;color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;padding:10px 20px;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 18px rgba(6,182,212,.28)}
        .cyan-btn:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(6,182,212,.40)}
        .cyan-btn:active{transform:scale(.97)}
        .cyan-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}

        .ghost-btn{background:transparent;border:1px solid rgba(34,211,238,.14);border-radius:10px;color:rgba(224,247,250,.45);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;padding:8px 14px;transition:all .15s}
        .ghost-btn:hover{border-color:rgba(34,211,238,.35);color:rgba(224,247,250,.85);background:rgba(34,211,238,.07)}

        .check-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;transition:background .15s;animation:fadeUp .3s ease}
        .check-item:hover{background:rgba(34,211,238,.05)}
        .check-item.checked{opacity:.38}
        .custom-check{width:20px;height:20px;border-radius:6px;flex-shrink:0;border:2px solid rgba(34,211,238,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;background:transparent}
        .custom-check.on{background:linear-gradient(135deg,#0891b2,#22d3ee);border-color:#22d3ee}
        .custom-check.on::after{content:"✓";color:#fff;font-size:11px;font-weight:800}

        .trip-card{background:rgba(7,20,40,.8);border:1px solid rgba(34,211,238,.09);border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;animation:popIn .4s ease}
        .trip-card:hover{border-color:rgba(34,211,238,.28);transform:translateY(-3px);box-shadow:0 10px 28px rgba(6,182,212,.15)}
        .trip-card.active-trip{border-color:rgba(34,211,238,.40);background:rgba(34,211,238,.06)}

        .modal-bg{position:fixed;inset:0;background:rgba(2,8,18,.8);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .2s ease}
        .modal-box{background:#071428;border:1px solid rgba(34,211,238,.14);border-radius:20px;padding:28px;width:100%;max-width:420px;animation:popIn .3s ease;box-shadow:0 24px 60px rgba(0,0,0,.6)}

        .progress-bar-bg{height:5px;border-radius:99px;background:rgba(34,211,238,.08);overflow:hidden;margin-top:8px}
        .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#0891b2,#22d3ee,#67e8f9);transition:width .6s cubic-bezier(.4,0,.2,1)}

        .sec-label{font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:rgba(34,211,238,.35);margin-bottom:8px;margin-top:20px;display:block;padding:0 6px}
        .tab-btn{background:transparent;border:1px solid rgba(34,211,238,.10);border-radius:8px;color:rgba(224,247,250,.38);font-size:12px;font-weight:600;padding:6px 14px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
        .tab-btn.active{background:rgba(34,211,238,.12);border-color:rgba(34,211,238,.32);color:#22d3ee}
        .tab-btn:hover:not(.active){background:rgba(34,211,238,.05);color:rgba(224,247,250,.7)}

        .essential-dot{width:6px;height:6px;border-radius:50%;background:#22d3ee;flex-shrink:0;animation:shimmer 2.4s ease infinite}
        .del-btn{opacity:0;background:none;border:none;color:rgba(248,113,113,.5);font-size:13px;cursor:pointer;padding:2px 6px;border-radius:6px;transition:all .15s}
        .check-item:hover .del-btn{opacity:1}
        .del-btn:hover{background:rgba(248,113,113,.10);color:#f87171}

        .emoji-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .emoji-opt{width:38px;height:38px;border-radius:10px;font-size:18px;background:rgba(34,211,238,.05);border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .emoji-opt:hover{background:rgba(34,211,238,.12)}
        .emoji-opt.sel{border-color:#22d3ee;background:rgba(34,211,238,.14)}

        .bubble{position:fixed;border-radius:50%;background:rgba(34,211,238,.18);animation:bubble 4s ease-in infinite;pointer-events:none;z-index:0}
      `}</style>

      {[
        {w:8,left:"12%",delay:"0s",dur:"4s"},{w:5,left:"28%",delay:"1.2s",dur:"5s"},
        {w:10,left:"60%",delay:"2.1s",dur:"3.8s"},{w:6,left:"80%",delay:"0.6s",dur:"4.5s"},
        {w:4,left:"45%",delay:"3s",dur:"5.2s"},
      ].map((b,i)=>(
        <div key={i} className="bubble" style={{width:b.w,height:b.w,left:b.left,bottom:"8%",animationDelay:b.delay,animationDuration:b.dur}} />
      ))}

      {showModal && (
        <div className="modal-bg" onClick={()=>setShowModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,color:"#e0f7fa",letterSpacing:"-.01em",marginBottom:20}}>
              New <span style={{color:"#22d3ee"}}>Trip</span>
            </h2>
            <label style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,display:"block"}}>Trip name</label>
            <input className="form-control pm-input mb-3" placeholder="e.g. Maldives Dive Trip" value={tripName} onChange={e=>setTripName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createTrip()} autoFocus />
            <label style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,display:"block"}}>Date (optional)</label>
            <input className="form-control pm-input mb-3" type="date" value={tripDate} onChange={e=>setTripDate(e.target.value)} />
            <label style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4,display:"block"}}>Pick an icon</label>
            <div className="emoji-grid mb-4">
              {TRIP_EMOJIS.map(e=>(
                <div key={e} className={`emoji-opt ${tripEmoji===e?"sel":""}`} onClick={()=>setTripEmoji(e)}>{e}</div>
              ))}
            </div>
            <div style={{fontSize:12,color:"rgba(34,211,238,.3)",marginBottom:16}}>
              Copies <strong style={{color:"rgba(34,211,238,.6)"}}>{template.length} items</strong> from your template
            </div>
            <div className="d-flex gap-2">
              <button className="ghost-btn flex-fill" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="cyan-btn flex-fill" onClick={createTrip} disabled={!tripName.trim()}>Create Trip 🌊</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",minHeight:"100vh",position:"relative",zIndex:1}}>

        <div className="pm-sidebar">
          <div style={{padding:"26px 16px 14px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:"#e0f7fa",letterSpacing:"-.01em",lineHeight:1}}>
              Pack<span style={{color:"#22d3ee"}}>Mate</span>
            </div>
            <div style={{fontSize:11,color:"rgba(34,211,238,.35)",marginTop:4,letterSpacing:".05em"}}>ocean edition 🌊</div>
          </div>

          <div style={{padding:"0 10px",flex:1,overflowY:"auto"}}>
            <span className="sec-label">Navigation</span>
            {[
              {key:"home",     icon:"🏠", label:"Home"},
              {key:"template", icon:"📋", label:"Master Template", count:template.length},
            ].map(n=>(
              <button key={n.key} className={`nav-btn ${view===n.key?"active":""}`} onClick={()=>setView(n.key)}>
                <span>{n.icon}</span> {n.label}
                {n.count!=null && <span style={{marginLeft:"auto",fontSize:11,background:"rgba(34,211,238,.12)",color:"#22d3ee",borderRadius:50,padding:"1px 7px"}}>{n.count}</span>}
              </button>
            ))}

            <span className="sec-label">My Trips ({trips.length})</span>
            {!trips.length && <div style={{fontSize:12,color:"rgba(34,211,238,.2)",padding:"6px 14px",fontStyle:"italic"}}>No trips yet</div>}
            {trips.map(t => {
              const pct = tripProgress(t);
              return (
                <button key={t.id} className={`nav-btn ${activeTripId===t.id&&view==="trip"?"active":""}`} onClick={()=>{setActive(t.id);setView("trip")}}>
                  <span>{t.emoji}</span>
                  <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                  <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:pct===100?"#34d399":"rgba(34,211,238,.4)"}}>{pct}%</span>
                </button>
              );
            })}
          </div>

          <div style={{padding:"16px"}}>
            <WaveDivider />
            <button className="cyan-btn w-100 mt-2" onClick={()=>setShowModal(true)}>+ New Trip</button>
          </div>
        </div>

        <div className="pm-main p-4">
          <div className="pm-content">

            {view==="home" && (
              <div style={{maxWidth:680,margin:"0 auto"}}>
                <div style={{animation:"fadeUp .5s ease"}}>
                  <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:46,fontWeight:800,color:"#e0f7fa",letterSpacing:"-.02em",marginBottom:4,lineHeight:1.05}}>
                    Ready to<br/><span style={{color:"#22d3ee"}}>Set Sail?</span>
                  </h1>
                  <p style={{color:"rgba(224,247,250,.38)",fontSize:14,marginBottom:32}}>Build your master packing template. Duplicate it for every adventure. Never leave anything behind.</p>
                </div>

                <div className="row g-3 mb-4" style={{animation:"fadeUp .5s ease .07s both"}}>
                  {[
                    {label:"Template items",  val:template.length,                               icon:"📋",color:"#22d3ee"},
                    {label:"Total trips",      val:trips.length,                                  icon:"✈️",color:"#67e8f9"},
                    {label:"Completed trips",  val:trips.filter(t=>tripProgress(t)===100).length, icon:"✅",color:"#34d399"},
                  ].map((s,i)=>(
                    <div className="col-4" key={i}>
                      <div className="sea-card p-3 text-center">
                        <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
                        <div style={{fontSize:11,color:"rgba(224,247,250,.3)",marginTop:4}}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sea-card p-4 mb-4" style={{animation:"fadeUp .5s ease .13s both"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.4)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:16}}>How it works</div>
                  <div className="row g-3">
                    {[
                      {n:"01",icon:"📋",t:"Build Template",d:"Add all your essentials to the Master Template once."},
                      {n:"02",icon:"🌊",t:"Start a Trip",   d:"Hit New Trip — your full template is instantly cloned."},
                      {n:"03",icon:"✅",t:"Pack & Check",   d:"Check items as you pack and track your ring progress."},
                    ].map(s=>(
                      <div className="col-md-4" key={s.n}>
                        <div style={{padding:"14px",background:"rgba(34,211,238,.04)",borderRadius:12,border:"1px solid rgba(34,211,238,.07)"}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,color:"#22d3ee",letterSpacing:".1em",marginBottom:8}}>{s.n}</div>
                          <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                          <div style={{fontWeight:700,color:"#e0f7fa",fontSize:13,marginBottom:4}}>{s.t}</div>
                          <div style={{fontSize:12,color:"rgba(224,247,250,.35)",lineHeight:1.65}}>{s.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {trips.length > 0 && (
                  <div style={{animation:"fadeUp .5s ease .19s both"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.35)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:12}}>Recent trips</div>
                    <div className="row g-3">
                      {trips.slice(0,4).map(t => {
                        const pct = tripProgress(t);
                        return (
                          <div className="col-sm-6" key={t.id}>
                            <div className={`trip-card ${activeTripId===t.id?"active-trip":""}`} onClick={()=>{setActive(t.id);setView("trip")}}>
                              <div className="d-flex align-items-center gap-3">
                                <div style={{fontSize:26}}>{t.emoji}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontWeight:700,color:"#e0f7fa",fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                                  <div style={{fontSize:11,color:"rgba(34,211,238,.35)"}}>{t.date}</div>
                                </div>
                                <div style={{position:"relative",flexShrink:0}}>
                                  <Ring pct={pct} />
                                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#e0f7fa"}}>{pct}%</div>
                                </div>
                              </div>
                              <div className="progress-bar-bg"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view==="template" && (
              <div style={{maxWidth:680,margin:"0 auto"}}>
                <div className="d-flex align-items-start justify-content-between mb-4" style={{animation:"fadeUp .4s ease"}}>
                  <div>
                    <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:800,color:"#e0f7fa",letterSpacing:"-.02em",margin:0}}>Master <span style={{color:"#22d3ee"}}>Template</span></h1>
                    <p style={{color:"rgba(224,247,250,.35)",fontSize:13,margin:0}}>Edit once — auto-copied to every new trip</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:500,color:"#22d3ee"}}>{template.length}</div>
                    <div style={{fontSize:11,color:"rgba(34,211,238,.35)"}}>items</div>
                  </div>
                </div>

                <div className="sea-card p-3 mb-4" style={{animation:"fadeUp .4s ease .06s both"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"rgba(34,211,238,.38)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Add item</div>
                  <div className="row g-2">
                    <div className="col">
                      <input className="form-control pm-input" placeholder="Item name…" value={tInput} onChange={e=>setTInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTemplateItem()} />
                    </div>
                    <div className="col-auto">
                      <select className="form-select pm-input pm-select" value={tCat} onChange={e=>setTCat(e.target.value)} style={{width:140}}>
                        {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                    <div className="col-auto d-flex align-items-center gap-2">
                      <label style={{fontSize:12,color:"rgba(34,211,238,.45)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                        <input type="checkbox" checked={tEss} onChange={e=>setTEss(e.target.checked)} style={{accentColor:"#22d3ee"}} /> Essential
                      </label>
                    </div>
                    <div className="col-auto">
                      <button className="cyan-btn" onClick={addTemplateItem} disabled={!tInput.trim()}>Add</button>
                    </div>
                  </div>
                </div>

                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20,animation:"fadeUp .4s ease .1s both"}}>
                  <button className={`tab-btn ${filterCat==="all"?"active":""}`} onClick={()=>setFilter("all")}>All ({template.length})</button>
                  {CATEGORIES.map(c => {
                    const n = template.filter(i=>i.cat===c.id).length;
                    return n > 0 ? (<button key={c.id} className={`tab-btn ${filterCat===c.id?"active":""}`} onClick={()=>setFilter(c.id)}>{c.icon} {c.label} ({n})</button>) : null;
                  })}
                </div>

                {CATEGORIES.map(cat => {
                  const items = filteredTemplate.filter(i=>i.cat===cat.id);
                  if (!items.length) return null;
                  return (
                    <div key={cat.id} className="sea-card mb-3" style={{animation:"fadeUp .4s ease .13s both"}}>
                      <div style={{padding:"12px 16px 8px",borderBottom:"1px solid rgba(34,211,238,.07)",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:15}}>{cat.icon}</span>
                        <span style={{fontWeight:700,color:"rgba(224,247,250,.65)",fontSize:13}}>{cat.label}</span>
                        <span style={{marginLeft:"auto",fontSize:11,color:"rgba(34,211,238,.3)"}}>{items.length} item{items.length!==1?"s":""}</span>
                      </div>
                      {items.map(item=>(
                        <div key={item.id} className="check-item">
                          {item.essential&&<div className="essential-dot" title="Essential"/>}
                          <div style={{flex:1,fontSize:14,color:"rgba(224,247,250,.78)"}}>{item.text}</div>
                          <button onClick={()=>toggleEssential(item.id)} title={item.essential?"Remove essential":"Mark essential"}
                            style={{background:"none",border:"none",fontSize:13,cursor:"pointer",opacity:item.essential?1:.25,padding:"2px 4px",color:"#22d3ee",transition:"opacity .15s"}}>★</button>
                          <button className="del-btn" onClick={()=>removeTemplateItem(item.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {!template.length && (
                  <div className="sea-card p-5 text-center">
                    <div style={{fontSize:42,marginBottom:12}}>📋</div>
                    <p style={{color:"rgba(34,211,238,.3)",fontSize:14}}>No items yet. Add your first packing item above!</p>
                  </div>
                )}
              </div>
            )}

            {view==="trip" && activeTrip && (
              <TripView
                activeTrip={activeTrip}
                toggleItem={toggleItem}
                addTripItem={addTripItem}
                removeTripItem={removeTripItem}
                uncheckAll={uncheckAll}
                tripProgress={tripProgress}
                onDelete={() => { deleteTrip(activeTrip.id); setView("home"); }}
              />
            )}

            {view==="trip" && !activeTrip && (
              <div className="text-center" style={{paddingTop:80}}>
                <div style={{fontSize:52,animation:"float 3s ease-in-out infinite"}}>🌊</div>
                <p style={{color:"rgba(34,211,238,.3)",marginTop:16,fontSize:14}}>Select a trip from the sidebar</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}