// Ammar Cell — Kasir Lite
// File tunggal ringan khusus tablet, ~2500 baris
// Supabase sama dengan App.jsx utama
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { db, dbShift, dbBank, supabase } from "./supabase.js";

// ─── Utils ────────────────────────────────────────────────────────────────────
const uid  = () => Math.random().toString(36).slice(2,10).toUpperCase();
const now  = () => new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const today= () => { const d=new Date(); return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const todayISO = () => new Date().toISOString().split('T')[0];
const fmtRp= n => "Rp "+Math.round(+n||0).toLocaleString("id-ID");

const DEFAULT_APPS = ["DIGIPOS","SIDIVA","RITA","OK","DANA","OVO","GOPAY","SHOPEEPAY","LINKAJA","M-KIOS","SIMPEL AMMAR","SIMPEL SULTAN","SIMPEL CIKRIK","MITRA","GRAB"];
const C = {
  primary:"#0d9488", primaryDark:"#0a7a70", primaryLight:"#e0faf5",
  bank:"#2563eb", bankLight:"#eff6ff",
  danger:"#dc2626", warn:"#f59e0b",
  bg:"#f0faf8", white:"#fff", text:"#1e293b", muted:"#64748b",
  border:"#b2ede6",
};
const css = `
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{margin:0;background:${C.bg};font-family:'Nunito',sans-serif;}
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  input:focus{outline:none;border-color:${C.primary}!important;}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:#b2ede6;border-radius:4px}
  html{font-size:clamp(13px,1.8vw,16px);}
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({msg,type}){
  if(!msg) return null;
  const bg = type==="err"?C.danger:type==="warn"?C.warn:C.primary;
  return <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"#fff",padding:"10px 20px",borderRadius:12,fontWeight:800,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,.25)",animation:"fadeUp .2s ease",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center"}}>{msg}</div>;
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({children,onClose,title}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:18,padding:20,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)",animation:"fadeUp .2s ease"}}>
        {title&&<div style={{fontWeight:900,fontSize:16,color:C.primaryDark,marginBottom:14}}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ─── Input style helpers ──────────────────────────────────────────────────────
const inp = {width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:10};
const lbl = {fontSize:12,fontWeight:700,color:C.muted,marginBottom:4,display:"block"};
const btn = (bg=C.primary,txt="#fff",extra={})=>({background:bg,border:"none",borderRadius:12,padding:"12px 20px",color:txt,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",width:"100%",...extra});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({users,onLogin}){
  const [un,setUn]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false);

  const handle=()=>{
    if(!un||!pw) return setErr("Isi username dan password!");
    if(!users||Object.keys(users).length===0) return setErr("Data belum termuat, tunggu sebentar...");
    setLoading(true);
    setTimeout(()=>{
      const u=users[un.toLowerCase()];
      if(!u||u.pass!==pw){ setErr("Username atau password salah!"); setLoading(false); return; }
      setErr(""); onLogin({username:un.toLowerCase(),...u});
    },400);
  };

  return(
    <div style={{minHeight:"100vh",width:"100%",background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <style>{css}</style>
      <div style={{background:C.white,borderRadius:20,padding:28,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.25)",animation:"fadeUp .3s ease"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>🏪</div>
          <div style={{fontWeight:900,fontSize:22,color:C.primaryDark}}>Ammar Cell</div>
          <div style={{fontSize:12,color:C.muted,fontWeight:600}}>Kasir Lite</div>
        </div>
        <label style={lbl}>Username</label>
        <input style={inp} value={un} onChange={e=>setUn(e.target.value)} placeholder="Username..." onKeyDown={e=>e.key==="Enter"&&handle()} autoCapitalize="none" autoCorrect="off"/>
        <label style={lbl}>Password</label>
        <div style={{position:"relative",marginBottom:10}}>
          <input style={{...inp,marginBottom:0,paddingRight:44}} type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password..." onKeyDown={e=>e.key==="Enter"&&handle()}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.muted}}>{showPw?"🙈":"👁️"}</button>
        </div>
        {err&&<div style={{background:"#fff0f0",color:C.danger,borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,marginBottom:10}}>⚠️ {err}</div>}
        <button onClick={handle} disabled={loading} style={btn(loading?"#ccc":C.primary)}>
          {loading?"⏳ Masuk...":"Masuk →"}
        </button>
      </div>
    </div>
  );
}

// ─── BUKA SHIFT KASIR ─────────────────────────────────────────────────────────
function BukaShiftKasir({user,outlet,saldoApps,onBuka,onCancel}){
  const APPS = Array.isArray(saldoApps)&&saldoApps.length>0 ? saldoApps : DEFAULT_APPS;
  const [cashKemb,setCashKemb]=useState("");
  const [saldo,setSaldo]=useState(()=>{const m={};APPS.forEach(a=>m[a]="");return m;});
  const totalApps = useMemo(()=>Object.values(saldo).reduce((s,v)=>s+(+v||0),0),[saldo]);

  return(
    <div style={{minHeight:"100vh",width:"100%",background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:12,overflowY:"auto"}}>
      <div style={{background:C.white,borderRadius:16,padding:18,width:"100%",maxWidth:500,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
        <div style={{fontWeight:900,fontSize:16,color:C.primary,marginBottom:14}}>🟢 Buka Shift Kasir</div>
        <div style={{background:C.primaryLight,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>👤</span>
          <div>
            <div style={{fontSize:10,color:C.primary,fontWeight:700}}>Nama Shift</div>
            <div style={{fontWeight:900,fontSize:15}}>{user.username||user.nama}</div>
          </div>
        </div>
        <label style={lbl}>Cash Kembalian (Catatan)</label>
        <input style={inp} type="number" value={cashKemb} onChange={e=>setCashKemb(e.target.value)} placeholder="0"/>
        <div style={{fontWeight:800,fontSize:12,color:C.primary,background:C.primaryLight,borderRadius:8,padding:"6px 12px",marginBottom:10}}>📱 Saldo Aplikasi (Catatan)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {APPS.map(a=>(
            <div key={a}>
              <label style={{...lbl,fontSize:11,marginBottom:3}}>{a}</label>
              <input style={{...inp,marginBottom:0,fontSize:13,padding:"8px 10px"}} type="number" value={saldo[a]||""} onChange={e=>setSaldo(p=>({...p,[a]:e.target.value}))} placeholder="0"/>
            </div>
          ))}
        </div>
        <div style={{background:C.primaryLight,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13}}>Total Saldo Aplikasi</span>
          <span style={{fontWeight:900,fontSize:16,color:C.primary}}>{fmtRp(totalApps)}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
          <button onClick={()=>onBuka({namaShift:user.username||user.nama,cashKembalian:+cashKemb||0,saldoApps:saldo,totalSaldoApps:totalApps})} style={btn(C.primary,"#fff",{flex:2})}>Buka Shift</button>
        </div>
      </div>
    </div>
  );
}

// ─── BUKA SHIFT BANK ─────────────────────────────────────────────────────────
function BukaShiftBank({user,outlet,saldoApps,onBuka,onCancel}){
  const APPS = Array.isArray(saldoApps)&&saldoApps.length>0 ? saldoApps : DEFAULT_APPS;
  const [cashKemb,setCashKemb]=useState("");
  const [saldo,setSaldo]=useState(()=>{const m={};APPS.forEach(a=>m[a]="");return m;});
  const totalApps = useMemo(()=>Object.values(saldo).reduce((s,v)=>s+(+v||0),0),[saldo]);

  return(
    <div style={{minHeight:"100vh",width:"100%",background:`linear-gradient(135deg,#1e3a5f,${C.bank})`,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:12,overflowY:"auto"}}>
      <div style={{background:C.white,borderRadius:16,padding:18,width:"100%",maxWidth:500,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
        <div style={{fontWeight:900,fontSize:16,color:C.bank,marginBottom:14}}>🏦 Buka Shift Bank</div>
        <div style={{background:C.bankLight,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>👤</span>
          <div>
            <div style={{fontSize:10,color:C.bank,fontWeight:700}}>Nama Shift</div>
            <div style={{fontWeight:900,fontSize:15}}>{user.username||user.nama}</div>
          </div>
        </div>
        <label style={lbl}>Cash Kembalian (Catatan)</label>
        <input style={inp} type="number" value={cashKemb} onChange={e=>setCashKemb(e.target.value)} placeholder="0"/>
        <div style={{fontWeight:800,fontSize:12,color:C.bank,background:C.bankLight,borderRadius:8,padding:"6px 12px",marginBottom:10}}>💰 Saldo Bank & Aplikasi</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {APPS.map(a=>(
            <div key={a}>
              <label style={{...lbl,fontSize:11,marginBottom:3}}>{a}</label>
              <input style={{...inp,marginBottom:0,fontSize:13,padding:"8px 10px"}} type="number" value={saldo[a]||""} onChange={e=>setSaldo(p=>({...p,[a]:e.target.value}))} placeholder="0"/>
            </div>
          ))}
        </div>
        <div style={{background:C.bankLight,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13}}>Total Saldo</span>
          <span style={{fontWeight:900,fontSize:16,color:C.bank}}>{fmtRp(totalApps)}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
          <button onClick={()=>onBuka({namaShift:user.username||user.nama,cashKemb:+cashKemb||0,saldoApps:saldo,totalSaldo:totalApps})} style={btn(C.bank,"#fff",{flex:2})}>Buka Shift Bank</button>
        </div>
      </div>
    </div>
  );
}

// ─── TUTUP SHIFT KASIR ────────────────────────────────────────────────────────
// ─── TUTUP SHIFT KASIR+BANK (GABUNGAN) ───────────────────────────────────────
function TutupShiftGabungan({shift,bankShift,txHariIni,bankTrxList,saldoApps,outlet,onTutup,onCancel}){
  const [laciFisik,setLaciFisik]=useState("");
  const [saldoAkhir,setSaldoAkhir]=useState({});
  const [catatan,setCatatan]=useState("");
  const [closing,setClosing]=useState(false);
  const APPS = Array.isArray(saldoApps)&&saldoApps.length>0?saldoApps:DEFAULT_APPS;

  // Kasir calc
  const omsetKasir = useMemo(()=>txHariIni
    .filter(t=>t.shift_id===shift?.id)
    .reduce((s,t)=>{const rv=(t.items||[]).filter(i=>i.refunded).reduce((rs,i)=>rs+i.price*i.qty,0);return s+t.total-rv;},0)
  ,[txHariIni,shift?.id]);
  const modalAwal = (shift?.saldo_data?.cashKembalian||0)+(shift?.saldo_data?.totalSaldoApps||0);
  const kasSystemKasir = modalAwal + omsetKasir;

  // Bank calc
  const bankTrxShift = useMemo(()=>bankTrxList.filter(t=>t.shiftId===bankShift?.id),[bankTrxList,bankShift?.id]);
  const kasBersihBank = useMemo(()=>bankTrxShift.reduce((s,t)=>s+t.netNominal,0),[bankTrxShift]);
  const feeBankTotal  = useMemo(()=>bankTrxShift.filter(t=>t.netNominal>0&&t.fee>0).reduce((s,t)=>s+t.fee,0),[bankTrxShift]);

  // Total laci sistem
  const totalLaciSistem = kasSystemKasir + kasBersihBank;
  const laciFisikNum = +laciFisik||0;
  const selisih = laciFisikNum - totalLaciSistem;

  const handle=async()=>{
    if(!laciFisik) return alert("Isi dulu Uang Fisik di Laci!");
    if(!navigator.onLine) return alert("Tidak ada koneksi internet!");
    setClosing(true);
    await onTutup({
      laciFisik:laciFisikNum, totalLaciSistem, selisih,
      omsetKasir, kasBersihBank, modalAwal,
      saldoAkhirApps:saldoAkhir, catatan,
    });
    setClosing(false);
  };

  return(
    <div style={{minHeight:"100vh",background:"#f0f4f8",overflowY:"auto",padding:16,fontFamily:"'Nunito',sans-serif"}}>
      <style>{css}</style>

      {/* Rekap Card */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)",borderRadius:16,padding:20,marginBottom:16,color:"#fff"}}>
        <div style={{fontWeight:900,fontSize:16,marginBottom:4}}>🧾 Rekap Penutupan 1 Laci</div>
        <div style={{fontSize:11,opacity:.7,marginBottom:16}}>{new Date().toLocaleDateString("id-ID")} · {outlet?.nama}</div>

        {[
          {l:"Modal Awal (kembalian + saldo apps)",v:fmtRp(modalAwal),c:"rgba(255,255,255,.85)"},
          {l:`+ Omset Kasir Hari Ini`,v:"+"+fmtRp(omsetKasir),c:"#86efac"},
          {l:`= Kas Sistem Kasir`,v:fmtRp(kasSystemKasir),c:"#fff",bold:true},
          {l:`+ Kas Bersih Bank (${bankTrxShift.length} transaksi)`,v:"+"+fmtRp(kasBersihBank),c:"#93c5fd"},
          ...(feeBankTotal>0?[{l:`   (termasuk fee bank: ${fmtRp(feeBankTotal)})`,v:"",c:"rgba(255,255,255,.5)",small:true}]:[]),
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:r.bold?0:6}}>
            <span style={{fontSize:r.small?10:12,color:r.c,fontWeight:r.bold?800:600}}>{r.l}</span>
            <span style={{fontSize:r.small?10:13,color:r.c,fontWeight:r.bold?900:700}}>{r.v}</span>
          </div>
        ))}

        <div style={{background:"rgba(255,255,255,.15)",borderRadius:12,padding:"12px 16px",marginTop:12}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>Total Laci Menurut Sistem</div>
          <div style={{fontWeight:900,fontSize:24,color:"#fbbf24"}}>{fmtRp(totalLaciSistem)} 💰</div>
        </div>

        {/* Uang Fisik di dalam dark card */}
        <div style={{marginTop:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.8)",marginBottom:6}}>Uang Fisik di Laci (hitung manual)</div>
          <div style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontWeight:700,fontSize:16,color:"rgba(255,255,255,.7)"}}>Rp</span>
            <input type="number" value={laciFisik} onChange={e=>setLaciFisik(e.target.value)}
              style={{flex:1,background:"transparent",border:"none",color:"#fff",fontWeight:900,fontSize:22,outline:"none",fontFamily:"inherit"}}
              placeholder="0"/>
          </div>
        </div>

        {/* Selisih */}
        {laciFisik!==""&&(
          <div style={{marginTop:10,background:selisih===0?"rgba(34,197,94,.3)":selisih>0?"rgba(245,158,11,.3)":"rgba(239,68,68,.3)",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,color:"#fff"}}>{selisih===0?"✅ Sesuai!":selisih>0?"📈 Lebih":"📉 Kurang"}</span>
            <span style={{fontWeight:900,fontSize:20,color:"#fff"}}>{selisih>0?"+":""}{fmtRp(selisih)}</span>
          </div>
        )}
      </div>

      {/* Detail transaksi */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"2px solid #e2e8f0"}}>
        <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:12}}>📊 Detail Transaksi Hari Ini</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><div style={{fontSize:11,color:C.muted}}>Transaksi Kasir</div><div style={{fontWeight:800,fontSize:16,color:C.text}}>{txHariIni.filter(t=>t.shift_id===shift?.id).length} trx</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Omset Kasir</div><div style={{fontWeight:800,fontSize:16,color:C.primary}}>{fmtRp(omsetKasir)}</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Transaksi Bank</div><div style={{fontWeight:800,fontSize:16,color:C.bank}}>{bankTrxShift.length} trx</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Net Kas Bank</div><div style={{fontWeight:800,fontSize:16,color:"#16a34a"}}>+{fmtRp(kasBersihBank)}</div></div>
        </div>
      </div>

      {/* Saldo Akhir Aplikasi */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"2px solid #e2e8f0"}}>
        <div style={{fontWeight:800,fontSize:13,color:C.primary,marginBottom:12}}>💳 Saldo Akhir Aplikasi (opsional)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {APPS.map(a=>(
            <div key={a}>
              <label style={{...lbl,fontSize:11}}>{a}</label>
              <input style={{...inp,marginBottom:0,fontSize:13}} type="number" value={saldoAkhir[a]||""} onChange={e=>setSaldoAkhir(p=>({...p,[a]:e.target.value}))} placeholder="0"/>
            </div>
          ))}
        </div>
      </div>

      {/* Catatan */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"2px solid #e2e8f0"}}>
        <label style={lbl}>Catatan (opsional)</label>
        <textarea style={{...inp,resize:"vertical",minHeight:60}} value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Misal: ada lebih Rp 5.000 kemungkinan salah kembalian..."/>
      </div>

      {!laciFisik&&<div style={{textAlign:"center",color:C.muted,fontSize:12,marginBottom:12}}>💡 Isi "Uang Fisik di Laci" untuk mengaktifkan tombol tutup shift</div>}

      <div style={{display:"flex",gap:10,paddingBottom:20}}>
        <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
        <button onClick={handle} disabled={closing||!laciFisik} style={btn(closing||!laciFisik?"#ccc":C.danger,"#fff",{flex:2,fontSize:15})}>
          {closing?"⏳ Menutup...":"🔒 Tutup & Simpan Shift"}
        </button>
      </div>
    </div>
  );
}

// ─── TUTUP SHIFT KASIR (standalone) ──────────────────────────────────────────
function TutupShiftKasir({shift,txHariIni,onTutup,onCancel}){
  const [setor,setSetor]=useState("");
  const [kasNyata,setKasNyata]=useState("");
  const [notes,setNotes]=useState("");
  const [closing,setClosing]=useState(false);

  const totalP = useMemo(()=>txHariIni.reduce((s,t)=>{
    const rv=(t.items||[]).filter(i=>i.refunded).reduce((rs,i)=>rs+i.price*i.qty,0);
    return s+t.total-rv;
  },0),[txHariIni]);

  const st=+setor||0;
  const kasSystem=totalP-st;
  const kasFisik=+kasNyata||0;
  const selisih=kasFisik-kasSystem;

  const handle=async()=>{
    if(!kasNyata) return alert("Isi dulu kas nyata di laci!");
    if(!navigator.onLine) return alert("Tidak ada koneksi internet!");
    setClosing(true);
    await onTutup({setorTunai:st,kasNyataSystem:kasSystem,kasNyataFisik:kasFisik,selisih,notes});
    setClosing(false);
  };

  return(
    <Modal title="🔴 Tutup Shift Kasir" onClose={onCancel}>
      <div style={{background:C.primaryLight,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{fontSize:11,color:C.muted}}>Shift: {shift?.nama} · {txHariIni.length} transaksi</div>
        <div style={{fontWeight:800,color:C.primary}}>Omset: {fmtRp(totalP)}</div>
      </div>
      <label style={lbl}>Setor Tunai (opsional)</label>
      <input style={inp} type="number" value={setor} onChange={e=>setSetor(e.target.value)} placeholder="0"/>
      <div style={{background:"#f8fffe",border:`2px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:900}}>= Kas di Laci (Sistem)</span>
          <b style={{fontSize:17,color:C.primary}}>{fmtRp(kasSystem)}</b>
        </div>
      </div>
      <label style={{...lbl,fontSize:13}}>Kas Nyata di Laci *</label>
      <div style={{background:C.bg,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,border:`2px solid ${kasNyata?C.primary:C.border}`}}>
        <span style={{fontWeight:700,color:C.primary}}>Rp</span>
        <input type="number" value={kasNyata} onChange={e=>setKasNyata(e.target.value)} style={{flex:1,border:"none",background:"transparent",fontWeight:900,fontSize:20,outline:"none",fontFamily:"inherit"}} placeholder="0"/>
      </div>
      {kasNyata!==""&&(
        <div style={{background:selisih===0?"#e8f8f4":selisih>0?"#fffbe6":"#fff0f0",border:`2px solid ${selisih===0?"#2ecc71":selisih>0?C.warn:C.danger}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800}}>{selisih===0?"✅ Sesuai!":selisih>0?"📈 Lebih":"📉 Kurang"}</span>
            <span style={{fontWeight:900,fontSize:20,color:selisih===0?"#2ecc71":selisih>0?C.warn:C.danger}}>{selisih>0?"+":""}{fmtRp(selisih)}</span>
          </div>
        </div>
      )}
      <label style={lbl}>Catatan</label>
      <textarea style={{...inp,resize:"vertical",minHeight:50}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Catatan closing..."/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
        <button onClick={handle} disabled={closing||!kasNyata} style={btn(closing||!kasNyata?"#ccc":C.danger,"#fff",{flex:2})}>
          {closing?"⏳ Menutup...":"Tutup & Simpan Shift"}
        </button>
      </div>
    </Modal>
  );
}

// ─── TUTUP SHIFT BANK (standalone) ────────────────────────────────────────────
function TutupShiftBank({shift,trxList,onTutup,onCancel}){
  const [uangLaci,setUangLaci]=useState("");
  const [catatan,setCatatan]=useState("");
  const [closing,setClosing]=useState(false);

  const shiftTrx = useMemo(()=>trxList.filter(t=>t.shiftId===shift?.id),[trxList,shift?.id]);
  const sMasuk   = useMemo(()=>shiftTrx.filter(t=>t.netNominal>0).reduce((s,t)=>s+t.netNominal,0),[shiftTrx]);
  const sKeluar  = useMemo(()=>shiftTrx.filter(t=>t.netNominal<0).reduce((s,t)=>s+Math.abs(t.netNominal),0),[shiftTrx]);
  const cashKemb = shift?.cashKemb||0;
  const uangSistem = cashKemb + sMasuk - sKeluar;
  const uangFisik  = +uangLaci||0;
  const selisih    = uangFisik - uangSistem;

  const handle=async()=>{
    if(!uangLaci) return alert("Isi uang di laci!");
    if(!navigator.onLine) return alert("Tidak ada koneksi internet!");
    setClosing(true);
    await onTutup({uangLaci:uangFisik,uangSistem,selisih,catatan});
    setClosing(false);
  };

  return(
    <Modal title="🔴 Tutup Shift Bank" onClose={onCancel}>
      <div style={{background:"#f8fffe",border:`2px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span>Total Masuk</span><b style={{color:"#16a34a"}}>{fmtRp(sMasuk)}</b>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:`2px solid ${C.border}`}}>
          <span style={{fontWeight:900}}>= Uang Sistem</span><b style={{fontSize:17,color:C.bank}}>{fmtRp(uangSistem)}</b>
        </div>
      </div>
      <label style={{...lbl,fontSize:13}}>Uang di Laci (Hitung Fisik) *</label>
      <div style={{background:C.bg,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8,border:`2px solid ${uangLaci?C.bank:C.border}`}}>
        <span style={{fontWeight:700,color:C.bank}}>Rp</span>
        <input type="number" value={uangLaci} onChange={e=>setUangLaci(e.target.value)} style={{flex:1,border:"none",background:"transparent",fontWeight:900,fontSize:20,outline:"none",fontFamily:"inherit"}} placeholder="0"/>
      </div>
      {uangLaci!==""&&(
        <div style={{background:selisih===0?"#e8f8f4":selisih>0?"#fffbe6":"#fff0f0",border:`2px solid ${selisih===0?"#2ecc71":selisih>0?C.warn:C.danger}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800}}>{selisih===0?"✅ Sesuai!":selisih>0?"📈 Lebih":"📉 Kurang"}</span>
            <span style={{fontWeight:900,fontSize:20,color:selisih===0?"#2ecc71":selisih>0?C.warn:C.danger}}>{selisih>0?"+":""}{fmtRp(selisih)}</span>
          </div>
        </div>
      )}
      <label style={lbl}>Catatan</label>
      <textarea style={{...inp,resize:"vertical",minHeight:50}} value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Catatan closing..."/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
        <button onClick={handle} disabled={closing||!uangLaci} style={btn(closing||!uangLaci?"#ccc":C.danger,"#fff",{flex:2})}>
          {closing?"⏳ Menutup...":"Tutup & Simpan Shift Bank"}
        </button>
      </div>
    </Modal>
  );
}

// ─── SETOR TUNAI FORM ────────────────────────────────────────────────────────
function SetorTunaiForm({onSave,onCancel}){
  const [nominal,setNominal]=useState("");
  const [saving,setSaving]=useState(false);
  const handle=async()=>{
    if(!+nominal) return alert("Isi nominal!");
    setSaving(true);
    await onSave({nama:"SETOR TUNAI",jenis:"keluar",feeType:"include",fee:0,nominal:+nominal,netNominal:-(+nominal)});
    setSaving(false);
  };
  return(
    <>
      <label style={lbl}>Nominal Setor *</label>
      <input style={inp} type="number" value={nominal} onChange={e=>setNominal(e.target.value)} placeholder="0" autoFocus/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
        <button onClick={handle} disabled={saving||!+nominal} style={btn(saving||!+nominal?"#ccc":C.danger,"#fff",{flex:2})}>
          {saving?"⏳...":"⬆ Setor Tunai"}
        </button>
      </div>
    </>
  );
}

// ─── PINJAM VOUCHER FORM ─────────────────────────────────────────────────────
function PinjamVoucherForm({onSave,onCancel}){
  const [nama,setNama]=useState("");
  const [nominal,setNominal]=useState("");
  const [saving,setSaving]=useState(false);
  const handle=async()=>{
    if(!nama.trim()||!+nominal) return alert("Isi nama dan nominal!");
    setSaving(true);
    await onSave({nama:"BANK PINJAM: "+nama,jenis:"masuk",feeType:"include",fee:0,nominal:+nominal,netNominal:+(+nominal)});
    setSaving(false);
  };
  return(
    <>
      <label style={lbl}>Keterangan *</label>
      <input style={inp} value={nama} onChange={e=>setNama(e.target.value)} placeholder="Contoh: Voucher Indosat 50k"/>
      <label style={lbl}>Nominal *</label>
      <input style={inp} type="number" value={nominal} onChange={e=>setNominal(e.target.value)} placeholder="0"/>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={onCancel} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
        <button onClick={handle} disabled={saving} style={btn(saving?"#ccc":C.bank,"#fff",{flex:2})}>
          {saving?"⏳...":"⬇ Catat Pinjam"}
        </button>
      </div>
    </>
  );
}

// ─── CATAT TRANSAKSI BANK ─────────────────────────────────────────────────────
function FormTrxBank({onSave,onCancel,editData}){
  const [nama,setNama]=useState(editData?.nama||"");
  const [jenis,setJenis]=useState(editData?.jenis||"masuk");
  const [nominal,setNominal]=useState(editData?.nominal||"");
  const [feeType,setFeeType]=useState(editData?.feeType||"include");
  const [fee,setFee]=useState(editData?.fee||"");
  const [saving,setSaving]=useState(false);

  const nomNum=+nominal||0;
  const feeNum=+fee||0;
  const netNominal = jenis==="masuk"
    ? feeType==="fee"     ? nomNum+feeNum
    : feeType==="dipotong"? nomNum-feeNum
    : nomNum
    : feeType==="tarik"   ? -(nomNum)
    : feeType==="fee"     ? -(nomNum+feeNum)
    : feeType==="dipotong"? -(nomNum-feeNum)
    : -(nomNum);

  const FEE_TYPES = jenis==="masuk"
    ?[{k:"include",l:"INCLUDE",sub:"Sudah all-in"},{k:"fee",l:"+ FEE",sub:"Fee ditambah ke nominal"},{k:"dipotong",l:"– DIPOTONG",sub:"Fee dipotong dari nominal"}]
    :[{k:"include",l:"INCLUDE",sub:"Sudah all-in"},{k:"fee",l:"+ FEE",sub:"Fee ditambah ke nominal"},{k:"dipotong",l:"– DIPOTONG",sub:"Fee dipotong dari nominal"},{k:"tarik",l:"🏧 TARIK",sub:"Keluar laci, fee masuk"}];

  const handle=async()=>{
    if(!nama.trim()||!nomNum) return alert("Isi nama dan nominal!");
    setSaving(true);
    if(jenis==="keluar"&&feeType==="tarik"&&feeNum>0){
      await onSave([
        {nama:nama+" (TARIK)",jenis:"keluar",feeType:"tarik",fee:0,nominal:nomNum,netNominal:-nomNum},
        {nama:nama+" (FEE TARIK)",jenis:"masuk",feeType:"tarik",fee:0,nominal:feeNum,netNominal:+feeNum},
      ]);
    } else {
      await onSave([{nama,jenis,feeType,fee:feeNum,nominal:nomNum,netNominal}]);
    }
    setSaving(false);
  };

  return(
    <Modal title="+ Catat Transaksi" onClose={onCancel}>
      {/* Nama */}
      <input style={{...inp,fontSize:14,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}} value={nama} onChange={e=>setNama(e.target.value)} placeholder="Contoh: SETORAN PENJUALAN PUSAT"/>

      {/* Masuk / Keluar */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        {[{k:"masuk",l:"⬇ MASUK"},{k:"keluar",l:"⬆ KELUAR"}].map(j=>(
          <button key={j.k} onClick={()=>{setJenis(j.k);setFeeType("include");}} style={{flex:1,padding:"14px 8px",borderRadius:12,border:`2px solid ${jenis===j.k?(j.k==="masuk"?"#16a34a":C.danger):C.border}`,background:jenis===j.k?(j.k==="masuk"?"#f0fdf4":"#fff0f0"):"#fff",fontWeight:900,fontSize:15,cursor:"pointer",color:jenis===j.k?(j.k==="masuk"?"#16a34a":C.danger):C.muted}}>
            {j.l}
          </button>
        ))}
      </div>

      {/* Nominal */}
      <div style={{background:C.bg,borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:8,border:`2px solid ${C.border}`}}>
        <span style={{fontWeight:800,fontSize:18,color:C.primary}}>Rp</span>
        <input type="number" value={nominal} onChange={e=>setNominal(e.target.value)}
          style={{flex:1,border:"none",background:"transparent",fontWeight:900,fontSize:24,color:C.text,textAlign:"right",fontFamily:"inherit",outline:"none"}}
          placeholder="0"/>
      </div>

      {/* Tipe Fee */}
      <div style={{fontSize:11,fontWeight:800,color:C.muted,letterSpacing:1,marginBottom:8}}>TIPE FEE</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${FEE_TYPES.length},1fr)`,gap:8,marginBottom:12}}>
        {FEE_TYPES.map(f=>(
          <button key={f.k} onClick={()=>setFeeType(f.k)} style={{padding:"10px 6px",borderRadius:12,border:`2px solid ${feeType===f.k?C.primary:C.border}`,background:feeType===f.k?C.primaryLight:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",color:feeType===f.k?C.primary:C.muted,textAlign:"center",lineHeight:1.4}}>
            {f.l}<br/><span style={{fontWeight:600,fontSize:9,opacity:.8}}>{f.sub}</span>
          </button>
        ))}
      </div>

      {/* Fee input */}
      {feeType!=="include"&&feeType!=="tarik"&&(
        <div style={{marginBottom:12}}>
          <label style={lbl}>Nominal Fee</label>
          <input style={inp} type="number" value={fee} onChange={e=>setFee(e.target.value)} placeholder="0"/>
        </div>
      )}
      {feeType==="tarik"&&(
        <div style={{marginBottom:12}}>
          <label style={lbl}>Nominal Fee Tarik</label>
          <input style={inp} type="number" value={fee} onChange={e=>setFee(e.target.value)} placeholder="0"/>
        </div>
      )}

      {/* Net preview */}
      {nomNum>0&&(
        <div style={{background:netNominal>=0?"#f0fdf4":"#fff0f0",border:`2px solid ${netNominal>=0?"#86efac":"#fca5a5"}`,borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13,color:C.muted}}>Net</span>
          <span style={{fontWeight:900,fontSize:20,color:netNominal>=0?"#16a34a":C.danger}}>{netNominal>=0?"+":""}{fmtRp(Math.abs(netNominal))}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{width:50,height:50,borderRadius:12,border:`2px solid ${C.border}`,background:"#fff",color:C.muted,fontWeight:900,fontSize:20,cursor:"pointer",flexShrink:0}}>✕</button>
        <button onClick={handle} disabled={saving||!nama.trim()||!nomNum}
          style={{flex:1,padding:"14px",borderRadius:12,border:"none",background:saving||!nama.trim()||!nomNum?"#e2e8f0":C.primary,color:saving||!nama.trim()||!nomNum?"#94a3b8":"#fff",fontWeight:900,fontSize:15,cursor:saving||!nama.trim()||!nomNum?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {saving?"⏳ Menyimpan...":"💾 Simpan"}
        </button>
      </div>
    </Modal>
  );
}

// ─── STOK FISIK TAB ───────────────────────────────────────────────────────────
function StokFisikTab({products,stocks,outlet,user,notify}){
  const [stokFisik,setStokFisik]=useState({});
  const [search,setSearch]=useState("");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const filtered=useMemo(()=>
    products.filter(p=>!search.trim()||p.name?.toLowerCase().includes(search.toLowerCase()))
  ,[products,search]);

  const hasSelisih=useMemo(()=>
    Object.entries(stokFisik).filter(([id,v])=>v!==""&&+v!==(stocks[id]??0)).length
  ,[stokFisik,stocks]);

  const handleSimpan=async()=>{
    const entries=Object.entries(stokFisik).filter(([,v])=>v!=="");
    if(!entries.length) return notify("Belum ada stok fisik yang diisi","err");
    setSaving(true);
    try{
      const rows=entries.map(([id,fisik])=>({
        outlet_id:outlet.id,
        product_id:id,
        stok_sistem:stocks[id]??0,
        stok_fisik:+fisik,
        selisih:(+fisik)-(stocks[id]??0),
        user:user.username||user.nama,
        tgl:new Date().toISOString().split('T')[0],
        created_at:new Date().toISOString(),
      }));
      await supabase.from('stok_opname').insert(rows);
      setSaved(true);
      notify(`✅ ${rows.length} stok fisik tersimpan ke laporan admin`,"ok");
      setTimeout(()=>setSaved(false),3000);
    }catch(e){ notify("Gagal simpan: "+e.message,"err"); }
    setSaving(false);
  };

  return(
    <div style={{padding:14}}>
      <div style={{background:C.primaryLight,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:C.primary,fontWeight:700}}>
        📦 Input Stok Fisik — hasil dikirim ke laporan admin, tidak mengubah stok sistem
      </div>
      <input style={{...inp,marginBottom:10}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari produk..."/>
      {hasSelisih>0&&(
        <div style={{background:"#fff8e1",border:"2px solid #ffe082",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#7d6608",fontWeight:700}}>
          ⚠️ {hasSelisih} produk ada selisih
        </div>
      )}
      <div style={{background:"#fff",borderRadius:12,border:`2px solid ${C.border}`,overflow:"hidden",marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px",padding:"8px 12px",background:C.primaryLight,fontSize:11,fontWeight:800,color:C.primary,gap:8}}>
          <span>Produk</span><span style={{textAlign:"center"}}>Sistem</span><span style={{textAlign:"center"}}>Fisik</span><span style={{textAlign:"center"}}>Selisih</span>
        </div>
        {filtered.map(p=>{
          const sistem=stocks[p.id]??0;
          const fisikVal=stokFisik[p.id]??"";
          const fisikNum=fisikVal===""?null:+fisikVal;
          const selisih=fisikNum!=null?fisikNum-sistem:null;
          return(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px",padding:"8px 12px",borderTop:`1px solid ${C.border}`,gap:8,alignItems:"center",background:selisih!=null&&selisih!==0?"#fffbe6":"#fff"}}>
              <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <div style={{textAlign:"center",fontWeight:700,fontSize:13,color:C.muted}}>{sistem}</div>
              <input
                type="number" value={fisikVal}
                onChange={e=>setStokFisik(prev=>({...prev,[p.id]:e.target.value}))}
                style={{textAlign:"center",padding:"4px 6px",border:`2px solid ${selisih!=null&&selisih!==0?C.warn:C.border}`,borderRadius:8,fontSize:13,fontWeight:700,fontFamily:"inherit",width:"100%"}}
                placeholder={String(sistem)}
              />
              <div style={{textAlign:"center",fontWeight:800,fontSize:13,color:selisih==null?"#ccc":selisih===0?"#16a34a":selisih>0?"#f59e0b":C.danger}}>
                {selisih==null?"—":selisih===0?"✓":selisih>0?"+"+selisih:selisih}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleSimpan} disabled={saving||saved}
        style={btn(saving||saved?"#ccc":C.primary,"#fff")}>
        {saving?"⏳ Menyimpan...":saved?"✅ Tersimpan!":"💾 Kirim ke Laporan Admin"}
      </button>
    </div>
  );
}

// ─── KASIR MAIN ───────────────────────────────────────────────────────────────
function KasirMain({user,outlet,products,stocks,prodOrder=[],aktifProds={},shift,onAddTrx,onTutupShift,onLogout,onMenu,bankShift,bankTrxList,onAddBankTrx,onTutupBankShift,isGabungan}){
  const [tab,setTab]=useState("kasir"); // kasir | bank | riwayat
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("Semua");
  const [cart,setCart]=useState([]);
  const [showBayar,setShowBayar]=useState(false);
  const [cashInput,setCashInput]=useState("");
  const [paying,setPaying]=useState(false);
  const [showManual,setShowManual]=useState(false);
  const [manualForm,setManualForm]=useState({name:"",modal:"0",price:"0",qty:"1"});
  const [showTutupKasir,setShowTutupKasir]=useState(false);
  const [showTutupBank,setShowTutupBank]=useState(false);
  const [showFormBank,setShowFormBank]=useState(false);
  const [showSetorTunai,setShowSetorTunai]=useState(false);
  const [showPinjamVoucher,setShowPinjamVoucher]=useState(false);
  const [txHariIni,setTxHariIni]=useState([]);
  const [toast,setToast]=useState({msg:"",type:""});
  const timerRef=useRef(null);

  const notify=(msg,type="ok")=>{
    setToast({msg,type});
    clearTimeout(timerRef.current);
    timerRef.current=setTimeout(()=>setToast({msg:"",type:""}),2500);
  };

  // Load transaksi hari ini — filter by outlet + tanggal
  useEffect(()=>{
    const load=async()=>{
      try{
        // Ambil semua transaksi outlet hari ini (30 hari terakhir untuk keamanan)
        const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-1);
        const {data}=await supabase.from('transactions').select('*')
          .eq('outlet_id',outlet.id)
          .gte('created_at',cutoff.toISOString())
          .order('created_at',{ascending:false});
        if(data){
          const tgl=today(); // format dd/m/yyyy
          // Filter yang tanggalnya hari ini (format date di transaksi)
          const filtered=data.filter(t=>t.date===tgl).map(t=>({...t,items:t.items||[]}));
          setTxHariIni(filtered);
        }
      }catch(e){ console.warn('load tx:',e); }
    };
    load();
    const ch=supabase.channel(`kasir-lite-${outlet.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'transactions'},(p)=>{
        if(p.new?.outlet_id===outlet.id) load();
      }).subscribe();
    return()=>supabase.removeChannel(ch);
  },[outlet.id]);

  // Produk aktif untuk outlet ini, diurutkan sesuai prodOrder admin
  const outletAktif = aktifProds[outlet?.id];
  const outletProducts = useMemo(()=>{
    let list = products.filter(p=>!p.deleted);
    // Filter aktif kalau ada data aktif untuk outlet ini
    if(outletAktif!=null) list = list.filter(p=>outletAktif.includes(String(p.id))||outletAktif.includes(p.id));
    // Urutkan sesuai prodOrder (sama dengan admin)
    if(prodOrder.length>0){
      const ordered = prodOrder.map(id=>list.find(p=>String(p.id)===String(id))).filter(Boolean);
      const rest = list.filter(p=>!prodOrder.map(String).includes(String(p.id)));
      return [...ordered,...rest];
    }
    return list.sort((a,b)=>(a.order||999)-(b.order||999));
  },[products,prodOrder,outletAktif,outlet?.id]);

  const cats = useMemo(()=>["Semua",...[...new Set(outletProducts.map(p=>p.category||p.kategori||"Lainnya").filter(Boolean))]]
  ,[outletProducts]);

  const filtered = useMemo(()=>{
    let list=outletProducts;
    if(cat!=="Semua") list=list.filter(p=>(p.category||p.kategori||"Lainnya")===cat);
    if(search.trim()) list=list.filter(p=>p.name?.toLowerCase().includes(search.toLowerCase())||p.kode?.toLowerCase().includes(search.toLowerCase()));
    return list;
  },[outletProducts,cat,search]);

  const stokOutlet = stocks[outlet.id]||{};
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cashNum = +cashInput||0;
  const kembalian = Math.max(0,cashNum-total);

  const addToCart=(p)=>{
    setCart(prev=>{
      const ex=prev.find(i=>i.id===p.id);
      if(ex) return prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);
      return [...prev,{id:p.id,name:p.name,price:p.price,modal:p.modal||p.harga_modal||0,qty:1}];
    });
  };

  const pay=async()=>{
    if(paying||!cart.length) return;
    if(!shift) return notify("Buka shift dulu!","err");
    setPaying(true);
    const trx={
      id:uid(), outlet_id:outlet.id, shift_id:shift.id, shift_nama:shift.nama,
      kasir:user.username||user.nama, date:today(), time:now(),
      total, cash:cashNum>=total?cashNum:total, kembalian,
      items:cart.map(i=>({...i,refunded:false})),
    };
    try{
      await db.addTransaction(trx);
      setTxHariIni(prev=>[trx,...prev]);
      setCart([]); setCashInput(""); setShowBayar(false);
      notify("✓ Transaksi berhasil!","ok");
    }catch(e){ console.error(e); notify("Gagal simpan transaksi!","err"); }
    setPaying(false);
  };

  const omsetShift = useMemo(()=>txHariIni
    .filter(t=>t.shift_id===shift?.id)
    .reduce((s,t)=>{
      const rv=(t.items||[]).filter(i=>i.refunded).reduce((rs,i)=>rs+i.price*i.qty,0);
      return s+t.total-rv;
    },0),[txHariIni,shift?.id]);

  const omsetHari = useMemo(()=>txHariIni.reduce((s,t)=>{
    const rv=(t.items||[]).filter(i=>i.refunded).reduce((rs,i)=>rs+i.price*i.qty,0);
    return s+t.total-rv;
  },0),[txHariIni]);

  const bankTrxHari = useMemo(()=>bankTrxList.filter(t=>t.tgl===today()),[bankTrxList]);
  const bankMasuk   = useMemo(()=>bankTrxHari.filter(t=>t.netNominal>0).reduce((s,t)=>s+t.netNominal,0),[bankTrxHari]);
  const bankKeluar  = useMemo(()=>bankTrxHari.filter(t=>t.netNominal<0).reduce((s,t)=>s+Math.abs(t.netNominal),0),[bankTrxHari]);

  const TABS = isGabungan
    ? [{k:"kasir",l:"🛒 Kasir"},{k:"bank",l:"🏦 Bank"},{k:"stok",l:"📦 Stok"},{k:"riwayat",l:"📋 Riwayat"}]
    : [{k:"kasir",l:"🛒 Kasir"},{k:"stok",l:"📦 Stok"},{k:"riwayat",l:"📋 Riwayat"}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif"}}>
      <style>{css}</style>
      <Toast msg={toast.msg} type={toast.type}/>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,.2)"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:14,color:"#fff"}}>{outlet.nama}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.7)",fontWeight:600}}>{user.username||user.nama}</div>
        </div>
        {/* Omset badge */}
        <div style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:"4px 10px",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,.7)"}}>Omset Shift</div>
          <div style={{fontWeight:900,fontSize:"0.85rem",color:"#fff"}}>{fmtRp(omsetShift)}</div>
        </div>
        {isGabungan&&(
          <div style={{background:"rgba(255,215,0,.2)",borderRadius:10,padding:"4px 10px",textAlign:"center",border:"1px solid rgba(255,215,0,.4)"}}>
            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,.7)"}}>💰 Laci</div>
            <div style={{fontWeight:900,fontSize:"0.85rem",color:"#fbbf24"}}>{fmtRp(omsetShift+((bankShift?.cashKemb||0)+bankMasuk-bankKeluar))}</div>
          </div>
        )}
        {/* Tutup shift */}
        <button onClick={()=>tab==="bank"?setShowTutupBank(true):setShowTutupKasir(true)}
          style={{background:"rgba(220,38,38,.8)",border:"none",borderRadius:10,padding:"7px 12px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer"}}>
          🔴 Tutup
        </button>
        <button onClick={()=>onMenu()} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,padding:"7px 10px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>
          ← Menu
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#fff",borderBottom:`2px solid ${C.border}`,position:"sticky",top:58,zIndex:99}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"11px 4px",border:"none",background:"none",fontWeight:tab===t.k?900:600,fontSize:12,color:tab===t.k?C.primary:C.muted,borderBottom:`3px solid ${tab===t.k?C.primary:"transparent"}`,cursor:"pointer",transition:"all .15s"}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── TAB KASIR ── */}
      {tab==="kasir"&&(
        <div style={{display:"flex",height:"calc(100vh - 100px)"}}>
          {/* Produk */}
          <div style={{flex:1,overflowY:"auto",padding:10}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input style={{...inp,marginBottom:0,flex:1}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari nama / kode..."/>
              <button onClick={()=>{ setManualForm({name:"",modal:"0",price:"0",qty:"1"}); setShowManual(true); }}
                style={{background:C.primary,border:"none",borderRadius:10,padding:"0 14px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                + Manual
              </button>
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:6}}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:20,border:`2px solid ${cat===c?C.primary:C.border}`,background:cat===c?C.primary:"#fff",color:cat===c?"#fff":C.muted,fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  {c}
                </button>
              ))}
            </div>
            {filtered.map(p=>{
              const stk=stokOutlet[p.id]??p.stok??0;
              return(
                <div key={p.id} onClick={()=>addToCart(p)} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 4px rgba(0,0,0,.06)",cursor:"pointer",border:"2px solid transparent",transition:"border .1s"}}
                  onTouchStart={e=>e.currentTarget.style.borderColor=C.primary}
                  onTouchEnd={e=>e.currentTarget.style.borderColor="transparent"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:2}}>{p.category||p.kategori||""}</div>
                    <div style={{fontWeight:800,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                    <div style={{fontWeight:900,fontSize:14,color:C.primary}}>{fmtRp(p.price)}</div>
                    <div style={{fontSize:10,color:stk===0?C.danger:stk<=3?C.warn:C.muted,fontWeight:700}}>stk:{stk}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keranjang */}
          <div style={{width:260,background:"#fff",borderLeft:`2px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontWeight:800,fontSize:13,color:C.primary}}>
              🛒 Keranjang {cart.length>0&&<span style={{background:C.primary,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:11,marginLeft:4}}>{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:8}}>
              {cart.length===0
                ?<div style={{textAlign:"center",color:C.muted,padding:24,fontSize:12}}>🛒<br/>Keranjang kosong</div>
                :cart.map(item=>(
                  <div key={item.id} style={{background:C.bg,borderRadius:9,padding:"8px 10px",marginBottom:6}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>setCart(prev=>prev.map(i=>i.id===item.id?{...i,qty:Math.max(0,i.qty-1)}:i).filter(i=>i.qty>0))} style={{width:26,height:26,borderRadius:8,border:`2px solid ${C.border}`,background:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                      <span style={{fontWeight:800,fontSize:13,minWidth:20,textAlign:"center"}}>{item.qty}</span>
                      <button onClick={()=>setCart(prev=>prev.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))} style={{width:26,height:26,borderRadius:8,border:`2px solid ${C.border}`,background:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                      <span style={{fontWeight:800,fontSize:12,color:C.primary,marginLeft:"auto"}}>{fmtRp(item.price*item.qty)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{padding:"10px 12px",borderTop:`2px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:13}}>Total</span>
                <span style={{fontWeight:900,fontSize:18,color:C.primary}}>{fmtRp(total)}</span>
              </div>
              <button onClick={()=>{if(cart.length)setShowBayar(true);}} disabled={!cart.length}
                style={btn(!cart.length?"#ccc":C.primary,"#fff",{padding:"12px"})}>
                💳 Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB BANK ── */}
      {tab==="bank"&&isGabungan&&(
        <div style={{padding:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[{l:"Uang Sistem",v:fmtRp((bankShift?.cashKemb||0)+bankMasuk-bankKeluar),c:C.bank,bg:C.bankLight},
              {l:"Total Masuk",v:fmtRp(bankMasuk),c:"#16a34a",bg:"#f0fdf4"},
              {l:"Total Keluar",v:fmtRp(bankKeluar),c:C.danger,bg:"#fff0f0"}].map(k=>(
              <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontSize:9,color:k.c,fontWeight:700,marginBottom:4}}>{k.l}</div>
                <div style={{fontWeight:900,fontSize:13,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>setShowSetorTunai(true)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${C.danger}`,background:"#fff0f0",color:C.danger,fontWeight:800,fontSize:12,cursor:"pointer"}}>
              ⬆ Setor Tunai
            </button>
            <button onClick={()=>setShowFormBank(true)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:C.bank,color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>
              + Catat Transaksi
            </button>
            <button onClick={()=>setShowPinjamVoucher(true)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${C.bank}`,background:C.bankLight,color:C.bank,fontWeight:800,fontSize:12,cursor:"pointer"}}>
              ⬇ Pinjam Voucher
            </button>
          </div>
          <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:C.text}}>
            Transaksi Hari Ini ({bankTrxHari.length})
          </div>
          {bankTrxHari.length===0
            ?<div style={{textAlign:"center",color:C.muted,padding:32,fontSize:13}}>Belum ada transaksi hari ini</div>
            :bankTrxHari.map((t)=>(
              <div key={t.id} style={{background:"#fff",borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:t.netNominal>0?"#f0fdf4":"#fff0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{t.netNominal>0?"⬇":"⬆"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.nama}</div>
                  <div style={{fontSize:10,color:C.muted}}>{t.waktu}{t.fee>0&&<span style={{color:C.bank,marginLeft:6}}>+fee {fmtRp(t.fee)}</span>}</div>
                </div>
                <div style={{fontWeight:900,fontSize:14,color:t.netNominal>0?"#16a34a":C.danger,flexShrink:0}}>
                  {t.netNominal>0?"+":""}{fmtRp(t.netNominal)}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── TAB RIWAYAT ── */}
      {tab==="riwayat"&&(
        <div style={{padding:14}}>
          <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:C.text}}>
            Transaksi Hari Ini — Shift {shift?.nama||"-"} ({txHariIni.filter(t=>!shift||t.shift_id===shift?.id).length} trx · {fmtRp(txHariIni.filter(t=>!shift||t.shift_id===shift?.id).reduce((s,t)=>{const rv=(t.items||[]).filter(i=>i.refunded).reduce((rs,i)=>rs+i.price*i.qty,0);return s+t.total-rv;},0))})
          </div>
          {txHariIni.filter(t=>!shift||t.shift_id===shift?.id).length===0
            ?<div style={{textAlign:"center",color:C.muted,padding:32,fontSize:13}}>Belum ada transaksi hari ini</div>
            :txHariIni.filter(t=>!shift||t.shift_id===shift?.id).map(t=>{
              const isRefunded = (t.items||[]).every(i=>i.refunded);
              return(
                <div key={t.id} style={{background:"#fff",borderRadius:10,padding:"10px 14px",marginBottom:6,boxShadow:"0 1px 4px rgba(0,0,0,.06)",opacity:isRefunded?.5:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:11,color:C.muted}}>#{t.id}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {isRefunded&&<span style={{fontSize:10,fontWeight:700,color:C.danger,background:"#fff0f0",padding:"2px 8px",borderRadius:10}}>REFUND</span>}
                      <span style={{fontWeight:900,fontSize:14,color:isRefunded?C.muted:C.primary}}>{fmtRp(t.total)}</span>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{t.date} {t.time}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:isRefunded?0:6}}>
                    {(t.items||[]).map((i,idx)=>(
                      <span key={idx} style={{background:i.refunded?"#f1f5f9":C.primaryLight,color:i.refunded?C.muted:C.primary,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:700,textDecoration:i.refunded?"line-through":"none"}}>{i.name} ×{i.qty}</span>
                    ))}
                  </div>
                  {!isRefunded&&(
                    <button onClick={async()=>{
                      if(!window.confirm("Refund semua item transaksi ini?")) return;
                      try{
                        const updated={...t,items:(t.items||[]).map(i=>({...i,refunded:true}))};
                        await supabase.from('transactions').update({items:updated.items}).eq('id',t.id);
                        setTxHariIni(prev=>prev.map(x=>x.id===t.id?updated:x));
                        notify("✓ Refund berhasil","ok");
                      }catch(e){ notify("Gagal refund: "+e.message,"err"); }
                    }} style={{background:"#fff0f0",border:`1px solid #fca5a5`,borderRadius:8,padding:"4px 10px",color:C.danger,fontWeight:700,fontSize:11,cursor:"pointer"}}>
                      🔄 Refund
                    </button>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* Modal Bayar */}
      {showBayar&&(
        <Modal title="💳 Pembayaran" onClose={()=>setShowBayar(false)}>
          <div style={{background:C.primaryLight,borderRadius:10,padding:"12px 16px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.muted}}>Total Belanja</div>
            <div style={{fontWeight:900,fontSize:28,color:C.primary}}>{fmtRp(total)}</div>
          </div>
          <label style={lbl}>Uang Diterima</label>
          <input style={{...inp,fontSize:18,fontWeight:700}} type="number" value={cashInput} onChange={e=>setCashInput(e.target.value)} placeholder="0" autoFocus/>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[total,Math.ceil(total/5000)*5000,Math.ceil(total/10000)*10000,100000,50000].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4).map(v=>(
              <button key={v} onClick={()=>setCashInput(String(v))} style={{flex:1,padding:"8px 4px",borderRadius:9,border:`2px solid ${C.border}`,background:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",color:C.text}}>
                {fmtRp(v)}
              </button>
            ))}
          </div>
          {cashInput&&(
            <div style={{background:kembalian>=0?C.primaryLight:"#fff0f0",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700}}>Kembalian</span>
              <span style={{fontWeight:900,fontSize:20,color:kembalian>=0?C.primary:C.danger}}>{fmtRp(kembalian)}</span>
            </div>
          )}
          <button onClick={pay} disabled={paying||cashNum<total} style={btn(paying||cashNum<total?"#ccc":C.primary)}>
            {paying?"⏳ Memproses...":"✅ Proses Bayar"}
          </button>
        </Modal>
      )}

      {tab==="stok"&&(
        <StokFisikTab
          products={outletProducts}
          stocks={stocks[outlet?.id]||{}}
          outlet={outlet}
          user={user}
          notify={notify}
        />
      )}

      {/* Modal Input Manual */}
      {showManual&&(
        <Modal title="➕ Input Manual" onClose={()=>setShowManual(false)}>
          {/* Pilihan Cepat */}
          <div style={{marginBottom:10}}>
            <label style={{...lbl,fontSize:11}}>Pilihan Cepat</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["SIUL ISAT","SIUL TRI","SIUL XL","SIUL AXIS","SIUL TSEL","SIUL SMART"].map(prefix=>(
                <button key={prefix} onClick={()=>{
                  const cur=manualForm.name||"";
                  const existing=["SIUL ISAT","SIUL TRI","SIUL XL","SIUL AXIS","SIUL TSEL","SIUL SMART"].find(p=>cur.startsWith(p));
                  const suffix=existing?cur.slice(existing.length):cur;
                  setManualForm(p=>({...p,name:prefix+suffix}));
                }}
                  style={{padding:"4px 10px",borderRadius:8,border:"2px solid",
                    borderColor:manualForm.name?.startsWith(prefix)?C.primary:"#b2ede6",
                    background:manualForm.name?.startsWith(prefix)?C.primary:C.primaryLight,
                    color:manualForm.name?.startsWith(prefix)?"#fff":C.primary,
                    fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                  {prefix}
                </button>
              ))}
            </div>
          </div>
          <label style={lbl}>Nama *</label>
          <input style={inp} value={manualForm.name} onChange={e=>setManualForm(p=>({...p,name:e.target.value}))} placeholder="Nama item..."/>
          <label style={lbl}>Harga Modal *</label>
          <input style={inp} type="number" value={manualForm.modal} onChange={e=>setManualForm(p=>({...p,modal:e.target.value}))} placeholder="0"/>
          <label style={lbl}>Harga Jual *</label>
          <input style={inp} type="number" value={manualForm.price} onChange={e=>setManualForm(p=>({...p,price:e.target.value}))} placeholder="0"/>
          <label style={lbl}>Qty</label>
          <input style={inp} type="number" value={manualForm.qty} onChange={e=>setManualForm(p=>({...p,qty:e.target.value}))} placeholder="1"/>
          <div style={{background:"#fffbe6",border:"2px solid #ffe082",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#7d6608",marginBottom:12}}>
            ⚠️ Item manual tidak terhubung ke stok
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowManual(false)} style={btn("#f1f5f9",C.text,{flex:1})}>Batal</button>
            <button onClick={()=>{
              if(!manualForm.name.trim()||!+manualForm.price) return alert("Isi nama dan harga jual!");
              const item={id:"manual-"+uid(),name:manualForm.name.trim(),price:+manualForm.price,modal:+manualForm.modal||0,qty:+manualForm.qty||1};
              setCart(prev=>{
                const ex=prev.find(i=>i.name===item.name&&i.price===item.price);
                if(ex) return prev.map(i=>i.name===item.name&&i.price===item.price?{...i,qty:i.qty+item.qty}:i);
                return [...prev,item];
              });
              setShowManual(false);
              notify("✓ Item manual ditambahkan","ok");
            }} style={btn(C.primary,"#fff",{flex:2})}>Tambah</button>
          </div>
        </Modal>
      )}
      {showTutupKasir&&isGabungan&&(
        <TutupShiftGabungan
          shift={shift} bankShift={bankShift}
          txHariIni={txHariIni} bankTrxList={bankTrxList}
          saldoApps={[]} outlet={outlet}
          onTutup={async(data)=>{
            await onTutupShift(data);
            await onTutupBankShift(data);
            setShowTutupKasir(false);
          }}
          onCancel={()=>setShowTutupKasir(false)}
        />
      )}
      {showTutupKasir&&!isGabungan&&(
        <TutupShiftKasir shift={shift} txHariIni={txHariIni.filter(t=>t.shift_id===shift?.id)} onTutup={onTutupShift} onCancel={()=>setShowTutupKasir(false)}/>
      )}

      {/* Modal Tutup Shift Bank */}
      {showTutupBank&&isGabungan&&(
        <TutupShiftBank shift={bankShift} trxList={bankTrxList} onTutup={onTutupBankShift} onCancel={()=>setShowTutupBank(false)}/>
      )}

      {/* Modal Catat Transaksi Bank */}
      {showFormBank&&(
        <FormTrxBank onSave={async(data)=>{await onAddBankTrx(data);setShowFormBank(false);}} onCancel={()=>setShowFormBank(false)}/>
      )}

      {/* Modal Setor Tunai */}
      {showSetorTunai&&(
        <Modal title="⬆ Setor Tunai" onClose={()=>setShowSetorTunai(false)}>
          <SetorTunaiForm onSave={async(data)=>{await onAddBankTrx(data);setShowSetorTunai(false);notify("Setor tunai tercatat ✓","ok");}} onCancel={()=>setShowSetorTunai(false)}/>
        </Modal>
      )}

      {/* Modal Bank Pinjam Voucher */}
      {showPinjamVoucher&&(
        <Modal title="⬇ Bank Pinjam Voucher" onClose={()=>setShowPinjamVoucher(false)}>
          <PinjamVoucherForm onSave={async(data)=>{await onAddBankTrx(data);setShowPinjamVoucher(false);notify("Pinjam voucher tercatat ✓","ok");}} onCancel={()=>setShowPinjamVoucher(false)}/>
        </Modal>
      )}
    </div>
  );
}

// ─── Parse user outlet IDs ────────────────────────────────────────────────────
const parseUserOutletIds=(usrs={})=>{
  const result={};
  Object.entries(usrs).forEach(([k,v])=>{
    result[k]={...v,
      outletIds:v.outletIds||v.outlet_ids||(v.outletId?[v.outletId]:[]),
    };
  });
  return result;
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function KasirLite(){
  const [users,   setUsers]   = useState({});
  const [products,setProducts]= useState([]);
  const [stocks,  setStocks]  = useState({});
  const [outlets, setOutlets] = useState([]);
  const [saldoApps,setSaldoApps]=useState([]);
  const [prodOrder,setProdOrder]=useState([]);
  const [aktifProds,setAktifProds]=useState({});
  const [loading, setLoading] = useState(true);
  const [dbErr,   setDbErr]   = useState("");

  // Restore session dari localStorage saat refresh
  const [user,    setUser]    = useState(()=>{ try{ const s=localStorage.getItem('klite_user'); return s?JSON.parse(s):null; }catch{ return null; }});
  const [outlet,  setOutlet]  = useState(()=>{ try{ const s=localStorage.getItem('klite_outlet'); return s?JSON.parse(s):null; }catch{ return null; }});
  const [shift,   setShift]   = useState(()=>{ try{ const s=localStorage.getItem('klite_shift'); return s?JSON.parse(s):null; }catch{ return null; }});
  const [bankShift,setBankShift]=useState(()=>{ try{ const s=localStorage.getItem('klite_bankshift'); return s?JSON.parse(s):null; }catch{ return null; }});
  const [bankTrxList,setBankTrxList]=useState([]);
  const [scene,   setScene]   = useState(()=>{
    try{
      const u=localStorage.getItem('klite_user');
      const o=localStorage.getItem('klite_outlet');
      const sh=localStorage.getItem('klite_shift');
      const bsh=localStorage.getItem('klite_bankshift');
      // Hanya ke main kalau ada shift aktif — jangan buka shift lagi
      if(u&&o&&(sh||bsh)) return "main";
      // Ada user+outlet tapi tidak ada shift — ke pilih mode
      if(u&&o) return "pilih_outlet";
      if(u) return "pilih_outlet";
    }catch{}
    return "login";
  });

  // Filter outlet sesuai user yang sedang login
  const userOutlets = useMemo(()=>{
    if(!user) return outlets;
    if(user.role==="admin"||user.role==="bos") return outlets;
    const ids = (user.outletIds||[]).map(String).concat(user.outletId?[String(user.outletId)]:[]);
    if(ids.length===0) return outlets;
    return outlets.filter(o=>ids.includes(String(o.id)));
  },[user,outlets]);

  const [modeGabungan, setModeGabungan] = useState(()=>{ try{ return localStorage.getItem('klite_mode')==='gabungan'; }catch{ return false; }});

  const isGabungan = modeGabungan || user?.role==="bank";
  const isKasirOnly = user?.role==="kasir" || user?.role==="karyawan";

  // Simpan session ke localStorage setiap berubah
  useEffect(()=>{ try{ if(user) localStorage.setItem('klite_user',JSON.stringify(user)); else localStorage.removeItem('klite_user'); }catch{} },[user]);
  useEffect(()=>{ try{ if(outlet) localStorage.setItem('klite_outlet',JSON.stringify(outlet)); else localStorage.removeItem('klite_outlet'); }catch{} },[outlet]);
  useEffect(()=>{ try{ if(shift) localStorage.setItem('klite_shift',JSON.stringify(shift)); else localStorage.removeItem('klite_shift'); }catch{} },[shift]);
  useEffect(()=>{ try{ if(bankShift) localStorage.setItem('klite_bankshift',JSON.stringify(bankShift)); else localStorage.removeItem('klite_bankshift'); }catch{} },[bankShift]);

  // ── Load data awal ──────────────────────────────────────────────────────────
  useEffect(()=>{
    const load=async()=>{
      const to=setTimeout(()=>{ setDbErr("Koneksi lambat. Coba lagi."); setLoading(false); },30000);
      try{
        // Users dulu dengan retry
        let usrs={};
        for(let i=0;i<3;i++){
          try{ usrs=await db.getUsers(); if(Object.keys(usrs).length>0) break; }
          catch(e){ if(i<2) await new Promise(r=>setTimeout(r,1000)); }
        }
        const [prods,outs,stks,sa,po,ap]=await Promise.all([
          db.getProducts().catch(()=>[]),
          db.getOutlets().catch(()=>[]),
          db.getStocks().catch(()=>({})),
          supabase.from('saldo_apps').select('*').then(r=>{
            const names=(r.data||[]).map(x=>x.app_name||x.nama||x.name).filter(Boolean);
            return names.length>0?names:DEFAULT_APPS;
          }).catch(()=>DEFAULT_APPS),
          supabase.from('product_order').select('*').order('urutan').then(r=>(r.data||[]).map(x=>x.product_id||x.productId)).catch(()=>[]),
          supabase.from('outlet_product_aktif').select('*').then(r=>{
            const m={};(r.data||[]).forEach(x=>{if(!m[x.outlet_id])m[x.outlet_id]=[];m[x.outlet_id].push(x.product_id);});
            return m;
          }).catch(()=>({})),
        ]);
        clearTimeout(to);
        // Load user_outlets untuk filter outlet per user
        let uoRows=[];
        try{ const r=await supabase.from('user_outlets').select('*'); uoRows=r.data||[]; }catch{}
        const uoMap={};
        uoRows.forEach(r=>{ if(!uoMap[r.username])uoMap[r.username]=[]; uoMap[r.username].push(r.outlet_id); });
        // Merge outletIds ke setiap user
        const parsedUsrs = parseUserOutletIds(usrs);
        Object.keys(parsedUsrs).forEach(un=>{
          if(uoMap[un]?.length>0) parsedUsrs[un].outletIds = uoMap[un].map(String);
        });
        setUsers(parsedUsrs); setProducts(prods); setOutlets(outs); setStocks(stks);
        setSaldoApps(sa.length>0?sa:DEFAULT_APPS);
        if(po.length>0) setProdOrder(po);
        if(Object.keys(ap).length>0) setAktifProds(ap);
        setLoading(false);
      }catch(e){ clearTimeout(to); setDbErr("Gagal konek DB."); setLoading(false); }
    };
    load();
  },[]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogin=useCallback((u)=>{
    setUser(u);
    // Selalu tampilkan pilih outlet dulu — user harus konfirmasi
    setScene("pilih_outlet");
  },[]);

  const handlePilihOutlet=useCallback((o)=>{
    setOutlet(o);
    if(shift||bankShift){ setScene("main"); return; }
    // Hanya role bank/staff/admin yang bisa pilih mode
    const canBank = user?.role==="bank"||user?.role==="staff"||user?.role==="admin"||user?.role==="bos";
    if(canBank){
      setScene("pilih_mode");
    } else {
      // Role kasir/karyawan langsung buka shift kasir
      setScene("buka_shift");
    }
  },[user,shift,bankShift]);

  const handleBukaShiftKasir=useCallback(async(data)=>{
    const s={id:uid(),nama:data.namaShift,start:now(),outletId:outlet.id,...data};
    try{
      await dbShift.openShift({...s,saldo_data:{cashKembalian:data.cashKembalian,saldoApps:data.saldoApps,totalSaldoApps:data.totalSaldoApps}},outlet.id,user.username);
      setShift(s);
      if(isGabungan) setScene("buka_shift_bank");
      else setScene("main");
    }catch(e){ alert("Gagal buka shift: "+e.message); }
  },[outlet,user,isGabungan]);

  const handleBukaShiftBank=useCallback(async(data)=>{
    const s={id:uid(),nama:data.namaShift,start:now(),outletId:outlet.id,cashKemb:data.cashKemb||0,saldoApps:data.saldoApps||{},totalSaldo:data.totalSaldo||0};
    try{
      await dbBank.openShift(s,outlet.id,user.username);
      setBankShift(s);

      // Mode gabungan: otomatis buat shift kasir juga
      if(modeGabungan||user?.role==="bank"){
        const ks={id:uid(),nama:data.namaShift,start:now(),outletId:outlet.id,
          saldo_data:{cashKembalian:data.cashKemb||0,saldoApps:data.saldoApps||{},totalSaldoApps:data.totalSaldo||0}};
        try{ await dbShift.openShift(ks,outlet.id,user.username); setShift(ks); }
        catch(e){ console.warn('auto kasir shift:',e); }
      }
      // Load bank trx hari ini
      const {data:rows}=await supabase.from('bank_transactions').select('*').eq('outlet_id',outlet.id).gte('created_at',todayISO()).order('created_at',{ascending:false});
      setBankTrxList((rows||[]).map(t=>({id:t.id,waktu:t.waktu,tgl:t.tgl,shiftId:t.shift_id,nama:t.nama,jenis:t.jenis,feeType:t.fee_type,fee:t.fee,nominal:t.nominal,netNominal:t.net_nominal,outletId:t.outlet_id})));
      setScene("main");
    }catch(e){ alert("Gagal buka shift bank: "+e.message); }
  },[outlet,user]);

  const handleTutupShiftKasir=useCallback(async(data)=>{
    try{
      const withTo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
      await withTo(Promise.all([
        dbShift.closeShift(shift,outlet.id,user.username,{...data,waktuTutup:now()}),
        supabase.from('active_shifts').delete().eq('outlet_id',outlet.id),
      ]),10000);
      setShift(null); setScene("buka_shift");
    }catch(e){
      try{
        const {data:chk}=await supabase.from('active_shifts').select('id').eq('outlet_id',outlet.id).limit(1);
        if(!chk?.length){ setShift(null); setScene("buka_shift"); }
        else alert("Gagal tutup shift: "+e.message);
      }catch{ alert("Gagal tutup shift: "+e.message); }
    }
  },[shift,outlet,user]);

  const handleTutupShiftBank=useCallback(async(data)=>{
    try{
      await dbBank.closeShift(bankShift,outlet.id,user.username,{...data,waktuTutup:now()});
      try{ await supabase.from('bank_shifts').delete().eq('outlet_id',outlet.id); }catch(e){ console.warn('del bank shift:',e); }
      setBankShift(null);
      if(isGabungan) setScene("buka_shift_bank");
    }catch(e){ alert("Gagal tutup shift bank: "+e.message); }
  },[bankShift,outlet,user,isGabungan]);

  const handleAddBankTrx=useCallback(async(dataOrArr)=>{
    const arr = Array.isArray(dataOrArr)?dataOrArr:[dataOrArr];
    for(const data of arr){
      const row={id:uid(),waktu:now(),tgl:today(),outletId:outlet.id,shiftId:bankShift?.id,...data};
      await supabase.from('bank_transactions').insert({
        id:row.id, waktu:row.waktu, tgl:row.tgl,
        outlet_id:outlet.id, shift_id:bankShift?.id,
        nama:data.nama, jenis:data.jenis, fee_type:data.feeType,
        fee:data.fee, nominal:data.nominal, net_nominal:data.netNominal,
      });
      setBankTrxList(prev=>prev.find(x=>x.id===row.id)?prev:[row,...prev]);
    }
  },[outlet,bankShift]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if(loading) return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}>
      <style>{css}</style>
      <div style={{fontSize:48,marginBottom:12}}>🏪</div>
      <div style={{fontWeight:900,fontSize:20,color:"#fff",marginBottom:6}}>Ammar Cell</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:20}}>Kasir Lite — Memuat...</div>
      <div style={{width:36,height:36,border:"4px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <button onClick={()=>window.location.reload()} style={{marginTop:24,background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:12,padding:"10px 24px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>🔄 Refresh</button>
    </div>
  );

  if(dbErr) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif"}}>
      <style>{css}</style>
      <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
      <div style={{fontWeight:900,fontSize:18,color:C.danger,marginBottom:8}}>Koneksi Gagal</div>
      <div style={{color:C.muted,fontSize:13,textAlign:"center",maxWidth:320,marginBottom:20}}>{dbErr}</div>
      <button onClick={()=>window.location.reload()} style={btn(C.primary,"#fff",{width:"auto",padding:"12px 32px"})}>🔄 Coba Lagi</button>
    </div>
  );

  if(scene==="login") return <LoginPage users={users} onLogin={handleLogin}/>;

  if(scene==="pilih_outlet") return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{css}</style>
      <div style={{background:C.white,borderRadius:20,padding:24,width:"100%",maxWidth:380}}>
        <div style={{fontWeight:900,fontSize:17,marginBottom:4,color:C.primaryDark}}>Pilih Outlet</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Login sebagai: <b>{user?.username}</b></div>
        {(shift||bankShift)&&(
          <div style={{background:"#f0fdf4",border:"2px solid #86efac",borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#16a34a",fontWeight:700}}>
            ✅ Shift aktif — pilih outlet untuk lanjutkan
          </div>
        )}
        {userOutlets.map(o=>(
          <button key={o.id} onClick={()=>handlePilihOutlet(o)} style={{...btn(C.primaryLight,C.primaryDark,{marginBottom:8,textAlign:"left",border:`2px solid ${C.border}`})}}>
            🏪 {o.nama}
          </button>
        ))}
        <button onClick={()=>{ 
          setUser(null); setShift(null); setBankShift(null); setOutlet(null);
          try{ ['klite_user','klite_outlet','klite_shift','klite_bankshift'].forEach(k=>localStorage.removeItem(k)); }catch{}
          setScene("login"); }}
          style={{...btn("#fff0f0",C.danger,{border:`2px solid #fca5a5`,marginTop:8})}}>
          Logout
        </button>
      </div>
    </div>
  );

  if(scene==="pilih_mode") return(
    <div style={{minHeight:"100vh",width:"100%",background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{css}</style>
      <div style={{background:"#fff",borderRadius:20,padding:24,width:"100%",maxWidth:380}}>
        <div style={{fontWeight:900,fontSize:17,marginBottom:4,color:C.primaryDark}}>Pilih Mode</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Outlet: <b>{outlet?.nama}</b></div>
        <button onClick={()=>{ setModeGabungan(false); try{localStorage.setItem('klite_mode','kasir');}catch{} setScene("buka_shift"); }} style={{...btn(C.primaryLight,C.primaryDark,{marginBottom:12,border:`2px solid ${C.border}`,padding:"16px"})}}>
          🛒 Kasir<br/>
          <span style={{fontSize:11,fontWeight:600,opacity:.7}}>Buka shift kasir — transaksi penjualan</span>
        </button>
        <button onClick={()=>{ setModeGabungan(true); try{localStorage.setItem('klite_mode','gabungan');}catch{} setScene("buka_shift_bank"); }} style={{...btn(C.bankLight,C.bank,{marginBottom:12,border:`2px solid #bfdbfe`,padding:"16px"})}}>
          🏦 Kasir + Bank (1 Laci)<br/>
          <span style={{fontSize:11,fontWeight:600,opacity:.7}}>Buka shift bank — kasir & transaksi bank</span>
        </button>
        <button onClick={()=>setScene("pilih_outlet")} style={btn("#f1f5f9",C.muted,{border:"none"})}>← Kembali</button>
      </div>
    </div>
  );

  if(scene==="buka_shift") return <BukaShiftKasir user={user} outlet={outlet} saldoApps={saldoApps} onBuka={handleBukaShiftKasir} onCancel={()=>setScene("pilih_mode")}/>;

  if(scene==="buka_shift_bank") return <BukaShiftBank user={user} outlet={outlet} saldoApps={saldoApps} onBuka={handleBukaShiftBank} onCancel={()=>setScene("pilih_mode")}/>;

  if(scene==="main") return(
    <KasirMain
      user={user} outlet={outlet} products={products} stocks={stocks}
      prodOrder={prodOrder} aktifProds={aktifProds}
      shift={shift} onAddTrx={()=>{}} onTutupShift={handleTutupShiftKasir}
      onLogout={()=>{ setUser(null); setShift(null); setBankShift(null); setOutlet(null); setModeGabungan(false); try{['klite_user','klite_outlet','klite_shift','klite_bankshift','klite_mode'].forEach(k=>localStorage.removeItem(k));}catch{} setScene("login"); }}
      onMenu={()=>setScene("pilih_outlet")}
      bankShift={bankShift} bankTrxList={bankTrxList}
      onAddBankTrx={handleAddBankTrx} onTutupBankShift={handleTutupShiftBank}
      isGabungan={isGabungan}
    />
  );

  return null;
}
