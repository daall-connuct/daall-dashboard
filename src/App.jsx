/* eslint-disable */
import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabase = createClient(
  'https://bvzvbplqqyxdepaxxoig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2enZicGxxcXl4ZGVwYXh4b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mjc2OTQsImV4cCI6MjA5ODQwMzY5NH0.VyCBjWgsB3eyrfGjHM6-zm6JKLIvEvYdWrf8Q10ttg8'
);

// ─── 색상 ────────────────────────────────────────────────────
const C = {
  bg:"#F0F4F8", surface:"#FFFFFF", border:"#E2E8F0", dim:"#F1F5F9",
  text:"#0F172A", muted:"#64748B", accent:"#3B82F6", green:"#10B981",
  red:"#EF4444", orange:"#F59E0B", purple:"#8B5CF6", teal:"#14B8A6", indigo:"#6366F1",
};

// ─── 메뉴 ────────────────────────────────────────────────────
const AREAS = [
  { id:"overview",  label:"종합현황",   icon:"📊", color:"#3B82F6" },
  { id:"revenue",   label:"경영·매출",  icon:"💰", color:"#10B981" },
  { id:"patient",   label:"환자 분석",  icon:"👥", color:"#8B5CF6" },
  { id:"marketing", label:"마케팅 분석",icon:"📈", color:"#F59E0B" },
  { id:"hr",        label:"인사·조직",  icon:"🏢", color:"#EF4444" },
  { id:"ops",       label:"원내 운영",  icon:"⚙️", color:"#14B8A6" },
];

// ─── 채널 목록 ───────────────────────────────────────────────
const CHANNEL_LIST = ["브랜드블로그","인스타그램","유튜브","카페칼럼","카페침투","지식인","홈페이지SEO","워드프레스","메타광고","검색광고","지도리뷰","어플리뷰","언론보도","당근마켓"];

// ─── 유틸 ────────────────────────────────────────────────────
const fmt = (n) => Number(n||0).toLocaleString();
const pct = (a,b) => (b&&b>0) ? ((a/b)*100).toFixed(1) : null;
const diffPct = (cur,prev) => (prev&&prev>0) ? (((cur-prev)/prev)*100).toFixed(1) : null;
const today = () => new Date().toISOString().slice(0,10);
const thisMonth = () => new Date().toISOString().slice(0,7);

const prevMonthKey = (m) => {
  const [y,mo]=m.split('-').map(Number);
  return mo===1?`${y-1}-12`:`${y}-${String(mo-1).padStart(2,'0')}`;
};
const lastYearKey = (m) => m.replace(/^(\d+)/,y=>String(+y-1));

const genMonths = () => {
  const months=[], now=new Date();
  for (let i=-3;i<=24;i++) {
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  }
  return months.sort().reverse();
};

// 공유 데이터 추출 헬퍼 — 병원 전체 dashData에서 특정 월 전체 지표 조합
const getMonthShared = (dashData, month) => {
  const rev  = (dashData.revenue  ||{})[month]||{};
  const pat  = (dashData.patient  ||{})[month]||{};
  const mkt  = (dashData.marketing||{})[month]||{};
  const hr   = (dashData.hr       ||{})[month]||{};
  const ops  = (dashData.ops      ||{})[month]||{};
  const revenue    = rev.revenue    || 0;
  const target     = rev.target     || 0;
  const newPt      = pat.newPatient || 0;
  const returnPt   = pat.returnPatient || 0;
  const totalPt    = newPt + returnPt;
  const mktCost    = mkt.totalCost  || 0;
  const laborCost  = hr.laborCost   || 0;
  const staffCount = (dashData.hr?.staff||[]).filter(s=>s.status==="재직").length;
  return { revenue,target,newPt,returnPt,totalPt,mktCost,laborCost,staffCount,
    revenuePerPt: totalPt>0 ? Math.round(revenue/totalPt) : null,
    achieveRate:  target>0  ? Math.round(revenue/target*100) : null,
    newPtRatio:   totalPt>0 ? ((newPt/totalPt)*100).toFixed(1) : null,
    mktRatio:     revenue>0 ? ((mktCost/revenue)*100).toFixed(1) : null,
    mktPerNew:    newPt>0   ? Math.round(mktCost/newPt) : null,
    laborRatio:   revenue>0 ? ((laborCost/revenue)*100).toFixed(1) : null,
    revenuePerStaff: staffCount>0 ? Math.round(revenue/staffCount) : null,
  };
};

// ─── 공통 스타일 ─────────────────────────────────────────────
const inputSt = {
  width:"100%", padding:"8px 12px", borderRadius:8,
  border:`1px solid ${C.border}`, background:"#F8FAFC",
  fontSize:13, color:C.text, outline:"none", boxSizing:"border-box",
};

// ─── 공통 컴포넌트 ───────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20, ...style }}>{children}</div>
);

const SecTitle = ({ children, color }) => (
  <div style={{ color:color||C.text, fontWeight:800, fontSize:15, marginBottom:16 }}>{children}</div>
);

// KPI 카드 — value가 null이면 "-" 표시
const KPI = ({ label, value, unit="", sub, color=C.accent, pctDiff, raw }) => {
  const isNull = value===null||value===undefined;
  const dp = pctDiff!==undefined&&pctDiff!==null ? parseFloat(pctDiff) : null;
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
      <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:4, flexWrap:"wrap" }}>
        <span style={{ color:isNull?C.muted:color, fontSize:isNull?16:22, fontWeight:900 }}>
          {isNull ? "-" : (typeof value==="string"?value:fmt(value))}
        </span>
        {!isNull && unit && <span style={{ fontSize:13, color:C.muted, fontWeight:600 }}>{unit}</span>}
        {dp!==null && (
          <span style={{ fontSize:11, color:dp>0?C.green:dp<0?C.red:C.muted, fontWeight:700, marginLeft:4 }}>
            {dp>0?"▲":dp<0?"▼":"→"}{Math.abs(dp)}%
          </span>
        )}
      </div>
      {sub && <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>{sub}</div>}
    </div>
  );
};

function MonthSelector({ selMonth, setSelMonth }) {
  const months = genMonths();
  const years = [...new Set(months.map(m=>m.slice(0,4)))].sort().reverse();
  const [selYear, setSelYear] = useState(selMonth.slice(0,4));
  useEffect(()=>{ if(selMonth) setSelYear(selMonth.slice(0,4)); },[selMonth]);
  const filtered = months.filter(m=>m.startsWith(selYear));
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
      <select value={selYear} onChange={e=>{ setSelYear(e.target.value); setSelMonth(e.target.value+"-"+selMonth.slice(5)); }}
        style={{ ...inputSt, width:90, padding:"5px 8px", fontSize:12 }}>
        {years.map(y=><option key={y}>{y}년</option>)}
      </select>
      {filtered.map(m=>(
        <button key={m} onClick={()=>setSelMonth(m)} style={{
          background:selMonth===m?C.accent+"20":"transparent", border:`1px solid ${selMonth===m?C.accent:C.border}`,
          color:selMonth===m?C.accent:C.muted, borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600,
        }}>{m.slice(5)}월</button>
      ))}
    </div>
  );
}

const Btn = ({ children, onClick, color=C.accent, outline=false, style={} }) => (
  <button onClick={onClick} style={{ background:outline?"transparent":color, border:`1px solid ${color}`, color:outline?color:"#fff", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700, ...style }}>{children}</button>
);

const Toast = ({ msg }) => msg ? (
  <div style={{ position:"fixed", bottom:24, right:24, background:C.text, color:"#fff", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>{msg}</div>
) : null;

function NumInput({ value, onSave, align="left", width="100%", placeholder="0" }) {
  const [local, setLocal] = useState(value===0||value===null||value===undefined?"":String(value));
  useEffect(()=>{ setLocal(value===0||value===null||value===undefined?"":String(value)); },[value]);
  return (
    <input type="text" inputMode="numeric" value={local} placeholder={placeholder}
      onChange={e=>setLocal(e.target.value.replace(/[^0-9.]/g,""))}
      onBlur={e=>{ const n=e.target.value===""?0:(+e.target.value||0); setLocal(n===0?"":String(n)); onSave(n); }}
      style={{ ...inputSt, width, textAlign:align, fontWeight:700, fontSize:13 }} />
  );
}

// ─── 로그인 ──────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const handle = async () => {
    if (pw==="Daall2025!") { onLogin("관리자"); return; }
    try {
      const { data } = await supabase.from('admin_accounts').select('*').eq('id',1).single();
      const acc=(data?.data||[]).find(a=>a.password===pw);
      if (acc) onLogin(acc.name); else setErr("비밀번호가 올바르지 않아요.");
    } catch { setErr("서버 오류가 발생했어요."); }
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1E3A5F,#2D6A9F)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:40, width:340, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🏥</div>
          <div style={{ fontWeight:900, fontSize:20, color:C.text }}>다올커넥트</div>
          <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>병원 경영 분석 대시보드</div>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
          placeholder="비밀번호 입력" style={{ ...inputSt, marginBottom:12, fontSize:15 }} autoFocus />
        {err && <div style={{ color:C.red, fontSize:12, marginBottom:10 }}>{err}</div>}
        <Btn onClick={handle} style={{ width:"100%", padding:"11px", fontSize:14 }}>로그인</Btn>
      </div>
    </div>
  );
}

// ─── 병원 목록 ───────────────────────────────────────────────
function HospitalListScreen({ onSelect, loginName, onLogout }) {
  const [hospitals,setHospitals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [form,setForm]=useState({ name:"",dept:"",region:"",manager:"",color:"#3B82F6",password:"" });
  const [search,setSearch]=useState("");
  const COLORS=["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#14B8A6","#F97316","#EC4899","#6366F1","#84CC16"];

  useEffect(()=>{ loadHospitals(); },[]);

  const loadHospitals = async () => {
    try {
      const { data } = await supabase.from('hospitals').select('*');
      if (data?.length>0) setHospitals(data.filter(r=>r.data?.name).map(r=>({...r.data,id:Number(r.data.id||r.id)})));
    } catch(e) {} finally { setLoading(false); }
  };

  const saveHospital = async () => {
    if (!form.name.trim()) return;
    const h = editTarget ? {...editTarget,...form} : {...form,id:Date.now()};
    await supabase.from('hospitals').upsert({ id:h.id, data:h }, { onConflict:'id' });
    await loadHospitals();
    setShowForm(false); setEditTarget(null);
    setForm({ name:"",dept:"",region:"",manager:"",color:"#3B82F6",password:"" });
  };

  const deleteHospital = async (id) => {
    if (!window.confirm("병원을 삭제할까요?")) return;
    await supabase.from('hospitals').delete().eq('id',id);
    await loadHospitals();
  };

  const filtered = hospitals.filter(h=>h.name?.includes(search)||h.dept?.includes(search)||h.region?.includes(search));

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <div style={{ background:"#1E3A5F", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🏥</span>
          <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>다올커넥트 경영 분석 대시보드</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:"#94A3B8", fontSize:13 }}>{loginName}</span>
          <button onClick={onLogout} style={{ background:"transparent", border:"1px solid #475569", color:"#94A3B8", borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer" }}>로그아웃</button>
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:20, color:C.text }}>병원 목록</div>
            <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>총 {hospitals.length}개 병원 관리 중</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="병원명, 진료과, 지역 검색..." style={{ ...inputSt, width:220 }} />
            <Btn onClick={()=>{ setEditTarget(null); setForm({ name:"",dept:"",region:"",manager:"",color:"#3B82F6",password:"" }); setShowForm(!showForm); }}>+ 병원 추가</Btn>
          </div>
        </div>

        {showForm && (
          <Card style={{ marginBottom:20 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>{editTarget?"병원 정보 수정":"새 병원 추가"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:16 }}>
              {[["병원명 *","name","예: 광주면역치료병원"],["진료과","dept","예: 내과"],["지역","region","예: 광주"],["담당 매니저","manager","예: 김지영"],["비밀번호","password","병원측 접근용"]].map(([label,key,ph])=>(
                <div key={key}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
                  <input value={form[key]||""} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={inputSt} type={key==="password"?"password":"text"} />
                </div>
              ))}
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>대표 색상</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {COLORS.map(c=>(<div key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{ width:24, height:24, borderRadius:"50%", background:c, cursor:"pointer", border:`3px solid ${form.color===c?"#0F172A":"transparent"}` }} />))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={saveHospital}>{editTarget?"저장":"추가"}</Btn>
              <Btn onClick={()=>setShowForm(false)} outline color={C.muted}>취소</Btn>
            </div>
          </Card>
        )}

        {loading ? <div style={{ textAlign:"center", padding:60, color:C.muted }}>불러오는 중...</div> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {filtered.map(h=>(
              <div key={h.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                onClick={()=>onSelect(h)}>
                <div style={{ height:6, background:h.color||C.accent }} />
                <div style={{ padding:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:h.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#fff" }}>{h.name?.[0]||"?"}</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:C.text }}>{h.name}</div>
                      <div style={{ color:C.muted, fontSize:12 }}>{[h.dept,h.region].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                  {h.manager && <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>담당 {h.manager}</div>}
                  <div style={{ display:"flex", justifyContent:"flex-end", gap:6 }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{ setEditTarget(h); setForm({name:h.name||"",dept:h.dept||"",region:h.region||"",manager:h.manager||"",color:h.color||"#3B82F6",password:h.password||""}); setShowForm(true); }} style={{ background:`${h.color||C.accent}15`, border:`1px solid ${h.color||C.accent}30`, color:h.color||C.accent, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>수정</button>
                    <button onClick={()=>deleteHospital(h.id)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:C.muted }}>{search?"검색 결과가 없어요.":"등록된 병원이 없어요."}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 병원 대시보드 ───────────────────────────────────────────
function HospitalDashboard({ hospital, onBack, loginName }) {
  const [activeArea,setActiveArea]=useState("overview");
  const [dashData,setDashData]=useState({});
  const [saving,setSaving]=useState(false);
  const [toastMsg,setToastMsg]=useState("");
  const saveTimer=useRef(null);

  useEffect(()=>{ loadData(); },[hospital.id]);

  const loadData = async () => {
    try {
      const { data } = await supabase.from('hospitals').select('*').eq('id',hospital.id).single();
      if (data?.data?.dashData) setDashData(data.data.dashData);
    } catch(e) {}
  };

  const toast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(""),2000); };

  const saveData = (next) => {
    setDashData(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        await supabase.from('hospitals').upsert({ id:hospital.id, data:{...hospital,dashData:next} }, { onConflict:'id' });
        toast("저장됨");
      } catch(e) { toast("저장 실패"); }
      finally { setSaving(false); }
    }, 1500);
  };

  const updateArea = (area, areaData) => saveData({ ...dashData, [area]:areaData });

  const area = AREAS.find(a=>a.id===activeArea);

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Toast msg={toastMsg} />
      <div style={{ background:"#1E3A5F", padding:"0 24px", display:"flex", alignItems:"center", gap:16, height:56, position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:"#94A3B8", cursor:"pointer", fontSize:20, padding:4 }}>←</button>
        <div style={{ width:32, height:32, borderRadius:8, background:hospital.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:16 }}>{hospital.name?.[0]}</div>
        <div>
          <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>{hospital.name}</div>
          <div style={{ color:"#94A3B8", fontSize:11 }}>{[hospital.dept,hospital.region].filter(Boolean).join(" · ")}</div>
        </div>
        {saving && <div style={{ color:"#94A3B8", fontSize:12, marginLeft:8 }}>저장 중...</div>}
        <div style={{ marginLeft:"auto", color:"#94A3B8", fontSize:13 }}>{loginName}</div>
      </div>

      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", display:"flex", overflowX:"auto" }}>
        {AREAS.map(a=>(
          <button key={a.id} onClick={()=>setActiveArea(a.id)} style={{ background:"transparent", border:"none", borderBottom:activeArea===a.id?`3px solid ${a.color}`:"3px solid transparent", color:activeArea===a.id?a.color:C.muted, padding:"14px 18px", fontSize:13, cursor:"pointer", fontWeight:activeArea===a.id?800:500, whiteSpace:"nowrap" }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
        {activeArea==="overview"  && <OverviewArea  dashData={dashData} hospital={hospital} />}
        {activeArea==="revenue"   && <RevenueArea   data={dashData.revenue||{}}   onChange={d=>updateArea("revenue",d)}   dashData={dashData} hospital={hospital} />}
        {activeArea==="patient"   && <PatientArea   data={dashData.patient||{}}   onChange={d=>updateArea("patient",d)}   dashData={dashData} hospital={hospital} />}
        {activeArea==="marketing" && <MarketingArea data={dashData.marketing||{}} onChange={d=>updateArea("marketing",d)} dashData={dashData} hospital={hospital} />}
        {activeArea==="hr"        && <HrArea        data={dashData.hr||{}}        onChange={d=>updateArea("hr",d)}        dashData={dashData} hospital={hospital} />}
        {activeArea==="ops"       && <OpsArea       data={dashData.ops||{}}       onChange={d=>updateArea("ops",d)}       hospital={hospital} />}
      </div>
    </div>
  );
}

// ─── 종합현황 ────────────────────────────────────────────────
function OverviewArea({ dashData, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const [showLines,setShowLines]=useState({ revenue:true, totalPt:true, newPt:true, mktCost:true });

  const cur  = getMonthShared(dashData, selMonth);
  const prev = getMonthShared(dashData, prevMonthKey(selMonth));

  // 12개월 추이 데이터
  const months = genMonths().slice(0,13).reverse();
  const chartData = months.map(m=>{
    const s=getMonthShared(dashData,m);
    return { month:m.slice(5)+"월", revenue:s.revenue, totalPt:s.totalPt, newPt:s.newPt, mktCost:s.mktCost };
  });

  // 경영 요약 문구
  const summaries = [];
  const rd = diffPct(cur.revenue, prev.revenue);
  if (rd!==null) summaries.push({ text:`매출 전월 대비 ${parseFloat(rd)>=0?"▲증가":"▼감소"} (${Math.abs(rd)}%)`, good:parseFloat(rd)>=0 });
  const nd = diffPct(cur.newPt, prev.newPt);
  if (nd!==null) summaries.push({ text:`신환 전월 대비 ${parseFloat(nd)>=0?"▲증가":"▼감소"} (${Math.abs(nd)}%)`, good:parseFloat(nd)>=0 });
  const md = diffPct(cur.mktCost, prev.mktCost);
  if (md!==null) summaries.push({ text:`마케팅비 전월 대비 ${parseFloat(md)>=0?"▲증가":"▼감소"} (${Math.abs(md)}%)`, good:parseFloat(md)<=0 });
  if (cur.mktPerNew!==null && prev.mktPerNew!==null) {
    const mpd = ((cur.mktPerNew-prev.mktPerNew)/prev.mktPerNew*100).toFixed(1);
    summaries.push({ text:`신환 1인당 마케팅비 ${parseFloat(mpd)>=0?"상승":"하락"} (${Math.abs(mpd)}%)`, good:parseFloat(mpd)<=0 });
  }

  const LINE_CFG = [
    { key:"revenue", label:"월 매출", color:hospital.color||C.accent, unit:"원" },
    { key:"totalPt", label:"총 환자수", color:C.green, unit:"명" },
    { key:"newPt",   label:"신환수", color:C.purple, unit:"명" },
    { key:"mktCost", label:"마케팅비", color:C.orange, unit:"원" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.accent}>📊 종합현황</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      {/* 핵심 KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        <KPI label="월 매출" value={cur.revenue||null} unit="원" color={hospital.color||C.accent} pctDiff={diffPct(cur.revenue,prev.revenue)} sub={prev.revenue?`전월 ${fmt(prev.revenue)}원`:undefined} />
        <KPI label="목표 달성률" value={cur.achieveRate} unit="%" color={cur.achieveRate>=100?C.green:cur.achieveRate>=80?C.orange:C.red} />
        <KPI label="총 환자수" value={cur.totalPt||null} unit="명" color={C.indigo} pctDiff={diffPct(cur.totalPt,prev.totalPt)} />
        <KPI label="신환수" value={cur.newPt||null} unit="명" color={C.purple} pctDiff={diffPct(cur.newPt,prev.newPt)} sub={prev.newPt?`전월 ${fmt(prev.newPt)}명`:undefined} />
        <KPI label="신환 비중" value={cur.newPtRatio} unit="%" color={C.teal} />
        <KPI label="환자당 매출" value={cur.revenuePerPt} unit="원" color={C.green} />
        <KPI label="총 마케팅비" value={cur.mktCost||null} unit="원" color={C.orange} pctDiff={diffPct(cur.mktCost,prev.mktCost)} />
        <KPI label="매출 대비 마케팅비율" value={cur.mktRatio} unit="%" color={C.red} />
        <KPI label="신환 1인당 마케팅비" value={cur.mktPerNew} unit="원" color={C.indigo} sub={prev.mktPerNew?`전월 ${fmt(prev.mktPerNew)}원`:undefined} />
        <KPI label="인건비" value={cur.laborCost||null} unit="원" color={C.muted} sub={cur.laborRatio?`매출 대비 ${cur.laborRatio}%`:undefined} />
      </div>

      {/* 추이 그래프 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.text }}>12개월 추이</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {LINE_CFG.map(l=>(
              <button key={l.key} onClick={()=>setShowLines(p=>({...p,[l.key]:!p[l.key]}))} style={{ background:showLines[l.key]?l.color+"20":"transparent", border:`1px solid ${showLines[l.key]?l.color:C.border}`, color:showLines[l.key]?l.color:C.muted, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer", fontWeight:600 }}>{l.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top:5, right:20, left:10, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.dim} />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:C.muted }} />
            <YAxis tick={{ fontSize:10, fill:C.muted }} tickFormatter={v=>v>=10000000?`${(v/10000000).toFixed(0)}천만`:v>=10000?`${(v/10000).toFixed(0)}만`:v} />
            <Tooltip formatter={(v,n)=>[fmt(v),n]} />
            <Legend wrapperStyle={{ fontSize:11 }} />
            {LINE_CFG.map(l=>showLines[l.key] && (
              <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} strokeWidth={2} dot={{ r:3 }} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 경영 요약 */}
      {summaries.length > 0 && (
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>📋 이번 달 경영 요약</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {summaries.map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, background:s.good?C.green+"10":C.red+"10" }}>
                <span style={{ fontSize:14 }}>{s.good?"✅":"⚠️"}</span>
                <span style={{ fontSize:13, color:C.text }}>{s.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── 경영·매출 ───────────────────────────────────────────────
function RevenueArea({ data, onChange, dashData, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const monthData = data[selMonth]||{};
  const prev = (data[prevMonthKey(selMonth)])||{};
  const ly   = (data[lastYearKey(selMonth)])||{};
  const patData = (dashData.patient||{})[selMonth]||{};
  const totalPt = (patData.newPatient||0)+(patData.returnPatient||0);

  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const revenue = monthData.revenue||0;
  const target  = monthData.target||0;
  const achieveRate = target>0?Math.round(revenue/target*100):null;
  const workDays = monthData.workDays||0;
  const dailyAvg = workDays>0?Math.round(revenue/workDays):null;
  const revenuePerPt = totalPt>0?Math.round(revenue/totalPt):null;

  const treatments = monthData.treatments||[];
  const updTr = (id,f,v) => onChange({...data,[selMonth]:{...monthData,treatments:treatments.map(t=>t.id===id?{...t,[f]:v}:t)}});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.green}>💰 경영·매출</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      {/* 핵심 KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 }}>
        <KPI label="월 매출" value={revenue||null} unit="원" color={hospital.color||C.green} pctDiff={diffPct(revenue,prev.revenue)} sub={prev.revenue?`전월 ${fmt(prev.revenue)}원`:undefined} />
        <KPI label="목표 매출" value={target||null} unit="원" color={C.muted} />
        <KPI label="목표 달성률" value={achieveRate} unit="%" color={achieveRate>=100?C.green:achieveRate>=80?C.orange:C.red} />
        <KPI label="전월 대비" value={prev.revenue?diffPct(revenue,prev.revenue):null} unit="%" color={diffPct(revenue,prev.revenue)>=0?C.green:C.red} />
        <KPI label="전년 동월 대비" value={ly.revenue?diffPct(revenue,ly.revenue):null} unit="%" color={diffPct(revenue,ly.revenue)>=0?C.green:C.red} />
        <KPI label="환자당 매출" value={revenuePerPt} unit="원" color={C.purple} sub={totalPt?`총 ${fmt(totalPt)}명 기준`:undefined} />
      </div>

      {/* 입력 영역 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>매출 입력</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["월 매출 (원)","revenue"],["목표 매출 (원)","target"]].map(([label,key])=>(
              <div key={key}>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
                <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>보조 지표</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>영업일수</label>
              <NumInput value={monthData.workDays||0} onSave={v=>update("workDays",v)} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div style={{ background:C.dim, borderRadius:8, padding:10, textAlign:"center" }}>
                <div style={{ color:C.muted, fontSize:10 }}>일 평균 매출</div>
                <div style={{ fontWeight:700, fontSize:14, color:C.text, marginTop:4 }}>{dailyAvg!==null?`${fmt(dailyAvg)}원`:"-"}</div>
              </div>
              <div style={{ background:C.dim, borderRadius:8, padding:10, textAlign:"center" }}>
                <div style={{ color:C.muted, fontSize:10 }}>총 환자수</div>
                <div style={{ fontWeight:700, fontSize:14, color:C.text, marginTop:4 }}>{totalPt?`${fmt(totalPt)}명`:"-"}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 진료·시술별 매출 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>진료·시술별 매출</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,treatments:[...treatments,{id:Date.now(),name:"",revenue:0,count:0}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {treatments.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:20 }}>항목을 추가해주세요.</div> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:C.dim }}>
                {["진료/시술명","환자수","매출 (원)","환자당 매출","매출 비중",""].map((h,i)=>(
                  <th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"right", color:C.muted, fontWeight:700 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {treatments.map(t=>{
                  const perPt = t.count>0?Math.round((+t.revenue||0)/t.count):null;
                  const revShare = revenue>0?((+t.revenue||0)/revenue*100).toFixed(1):null;
                  return (
                    <tr key={t.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                      <td style={{ padding:"8px 12px" }}><input value={t.name} onChange={e=>updTr(t.id,"name",e.target.value)} placeholder="예: 보톡스" style={{ ...inputSt }} /></td>
                      <td style={{ padding:"8px 12px" }}><NumInput value={t.count||0} onSave={v=>updTr(t.id,"count",v)} align="right" width={70} /></td>
                      <td style={{ padding:"8px 12px" }}><NumInput value={t.revenue||0} onSave={v=>updTr(t.id,"revenue",v)} align="right" /></td>
                      <td style={{ padding:"8px 12px", textAlign:"right", color:C.purple }}>{perPt!==null?`${fmt(perPt)}원`:"-"}</td>
                      <td style={{ padding:"8px 12px", textAlign:"right", color:C.teal }}>{revShare!==null?`${revShare}%`:"-"}</td>
                      <td style={{ padding:"8px 12px" }}><button onClick={()=>onChange({...data,[selMonth]:{...monthData,treatments:treatments.filter(x=>x.id!==t.id)}})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button></td>
                    </tr>
                  );
                })}
                <tr style={{ background:C.dim, fontWeight:700 }}>
                  <td style={{ padding:"8px 12px" }}>합계</td>
                  <td style={{ padding:"8px 12px", textAlign:"right" }}>{fmt(treatments.reduce((s,t)=>s+(+t.count||0),0))}명</td>
                  <td style={{ padding:"8px 12px", textAlign:"right", color:hospital.color||C.green }}>{fmt(treatments.reduce((s,t)=>s+(+t.revenue||0),0))}원</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 환자 분석 ───────────────────────────────────────────────
function PatientArea({ data, onChange, dashData, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const monthData = data[selMonth]||{};
  const prev = (data[prevMonthKey(selMonth)])||{};
  const revenue = ((dashData.revenue||{})[selMonth]||{}).revenue||0;

  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const newPt = monthData.newPatient||0;
  const returnPt = monthData.returnPatient||0;
  const total = newPt+returnPt;
  const revenuePerPt = total>0?Math.round(revenue/total):null;
  const items = monthData.ptTreatments||[];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.purple}>👥 환자 분석</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14 }}>
        <KPI label="신환" value={newPt||null} unit="명" color={hospital.color||C.purple} pctDiff={diffPct(newPt,prev.newPatient)} sub={prev.newPatient?`전월 ${fmt(prev.newPatient)}명`:undefined} />
        <KPI label="재진" value={returnPt||null} unit="명" color={C.green} pctDiff={diffPct(returnPt,prev.returnPatient)} />
        <KPI label="총 환자수" value={total||null} unit="명" color={C.indigo} />
        <KPI label="신환 비중" value={total>0?((newPt/total)*100).toFixed(1):null} unit="%" color={C.teal} />
        <KPI label="환자당 매출" value={revenuePerPt} unit="원" color={C.orange} sub={revenue?`매출 ${fmt(revenue)}원 기준`:undefined} />
      </div>

      <Card>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>환자 수 입력</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[["신환 수","newPatient"],["재진 수","returnPatient"]].map(([label,key])=>(
            <div key={key}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
              <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
            </div>
          ))}
        </div>
      </Card>

      {/* 진료별 환자 + 매출 연결 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>진료별 환자 수 · 매출 연결</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,ptTreatments:[...items,{id:Date.now(),name:"",count:0,revenue:0}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {items.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>항목을 추가해주세요.</div> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:C.dim }}>
                {["진료/시술","환자수","매출 (원)","환자당 매출","전체 비중",""].map((h,i)=>(
                  <th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"right", color:C.muted, fontWeight:700 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {items.map(it=>{
                  const perPt = it.count>0?Math.round((+it.revenue||0)/it.count):null;
                  const ptShare = total>0?((it.count/total)*100).toFixed(1):null;
                  return (
                    <tr key={it.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                      <td style={{ padding:"8px 12px" }}><input value={it.name} onChange={e=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,name:e.target.value}:x)}})} placeholder="예: 도수치료" style={{ ...inputSt }} /></td>
                      <td style={{ padding:"8px 12px" }}><NumInput value={it.count||0} onSave={v=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,count:v}:x)}})} align="right" width={70} /></td>
                      <td style={{ padding:"8px 12px" }}><NumInput value={it.revenue||0} onSave={v=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,revenue:v}:x)}})} align="right" /></td>
                      <td style={{ padding:"8px 12px", textAlign:"right", color:C.purple }}>{perPt!==null?`${fmt(perPt)}원`:"-"}</td>
                      <td style={{ padding:"8px 12px", textAlign:"right", color:C.teal }}>{ptShare!==null?`${ptShare}%`:"-"}</td>
                      <td style={{ padding:"8px 12px" }}><button onClick={()=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.filter(x=>x.id!==it.id)}})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 마케팅 분석 ─────────────────────────────────────────────
function MarketingArea({ data, onChange, dashData, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const monthData = data[selMonth]||{};
  const prev = (data[prevMonthKey(selMonth)])||{};
  const patData = (dashData.patient||{})[selMonth]||{};
  const newPt = patData.newPatient||0;
  const revenue = ((dashData.revenue||{})[selMonth]||{}).revenue||0;

  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const channels = monthData.channels||[];
  const totalMktCost = monthData.totalCost || channels.reduce((s,c)=>s+(+c.cost||0),0);
  const totalAdCost = monthData.adCost||0;
  const mktPerNew = newPt>0?Math.round(totalMktCost/newPt):null;
  const mktRatio = revenue>0?((totalMktCost/revenue)*100).toFixed(1):null;

  // 선택형 컬럼 설정
  const [cols,setCols]=useState({ reservation:false, visit:true, revenue:false, cac:false, roas:false });

  const initChannels = () => {
    const ex=channels.map(c=>c.name);
    const newChs=CHANNEL_LIST.filter(n=>!ex.includes(n)).map(n=>({id:Date.now()+Math.random(),name:n,cost:0,inquiry:0,reservation:0,visit:0,revenue:0,newPt:0}));
    onChange({...data,[selMonth]:{...monthData,channels:[...channels,...newChs]}});
  };

  const updCh = (id,f,v) => onChange({...data,[selMonth]:{...monthData,channels:channels.map(c=>c.id===id?{...c,[f]:v}:c)}});
  const totalCost = channels.reduce((s,c)=>s+(+c.cost||0),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.orange}>📈 마케팅 분석</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 }}>
        <KPI label="총 마케팅비" value={totalMktCost||null} unit="원" color={C.orange} pctDiff={diffPct(totalMktCost,prev.totalCost)} />
        <KPI label="광고비" value={totalAdCost||null} unit="원" color={C.red} />
        <KPI label="신환수" value={newPt||null} unit="명" color={C.purple} sub="환자 분석에서 입력" />
        <KPI label="신환 1인당 마케팅비" value={mktPerNew} unit="원" color={C.indigo} />
        <KPI label="매출 대비 마케팅비율" value={mktRatio} unit="%" color={C.teal} sub={revenue?`매출 ${fmt(revenue)}원 기준`:undefined} />
      </div>

      <Card style={{ padding:14 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>마케팅비 입력</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          <div>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>총 마케팅비 (원)</label>
            <NumInput value={monthData.totalCost||0} onSave={v=>update("totalCost",v)} />
          </div>
          <div>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>광고비 (원)</label>
            <NumInput value={monthData.adCost||0} onSave={v=>update("adCost",v)} />
          </div>
        </div>
      </Card>

      {/* 채널별 성과 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, flexWrap:"wrap", gap:8 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>채널별 성과</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:6 }}>
              선택 컬럼:
              {[["reservation","예약"],["visit","내원"],["revenue","매출기여"],["cac","CAC"],["roas","ROAS"]].map(([key,label])=>(
                <button key={key} onClick={()=>setCols(p=>({...p,[key]:!p[key]}))} style={{ background:cols[key]?C.accent+"20":"transparent", border:`1px solid ${cols[key]?C.accent:C.border}`, color:cols[key]?C.accent:C.muted, borderRadius:5, padding:"2px 8px", fontSize:11, cursor:"pointer" }}>{label}</button>
              ))}
            </div>
            {channels.length===0 && <Btn onClick={initChannels} style={{ padding:"5px 12px", fontSize:12 }}>채널 목록 불러오기</Btn>}
          </div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ background:C.dim }}>
              <th style={{ padding:"8px 10px", textAlign:"left", color:C.muted, fontWeight:700, whiteSpace:"nowrap" }}>채널</th>
              <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>비용 (원)</th>
              <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>문의</th>
              {cols.reservation && <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>예약</th>}
              {cols.visit && <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>내원</th>}
              {cols.revenue && <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>매출기여 (원)</th>}
              {cols.cac && <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>CAC</th>}
              {cols.roas && <th style={{ padding:"8px 10px", textAlign:"right", color:C.muted, fontWeight:700 }}>ROAS</th>}
            </tr></thead>
            <tbody>
              {channels.map(c=>{
                const cac = (c.newPt&&c.newPt>0&&c.cost) ? Math.round(c.cost/c.newPt) : null;
                const roas = (c.revenue&&c.revenue>0&&c.cost&&c.cost>0) ? ((c.revenue/c.cost)*100).toFixed(1) : null;
                return (
                  <tr key={c.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                    <td style={{ padding:"8px 10px", fontWeight:600, color:C.text, whiteSpace:"nowrap" }}>{c.name}</td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.cost||0} onSave={v=>updCh(c.id,"cost",v)} align="right" width={100} /></td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.inquiry||0} onSave={v=>updCh(c.id,"inquiry",v)} align="right" width={70} /></td>
                    {cols.reservation && <td style={{ padding:"6px 10px" }}><NumInput value={c.reservation||0} onSave={v=>updCh(c.id,"reservation",v)} align="right" width={70} /></td>}
                    {cols.visit && <td style={{ padding:"6px 10px" }}><NumInput value={c.visit||0} onSave={v=>updCh(c.id,"visit",v)} align="right" width={70} /></td>}
                    {cols.revenue && <td style={{ padding:"6px 10px" }}><NumInput value={c.revenue||0} onSave={v=>updCh(c.id,"revenue",v)} align="right" width={100} /></td>}
                    {cols.cac && <td style={{ padding:"8px 10px", textAlign:"right" }}>
                      {cac!==null ? `${fmt(cac)}원` : <span style={{ color:C.muted }}>-</span>}
                    </td>}
                    {cols.roas && <td style={{ padding:"8px 10px", textAlign:"right" }}>
                      {roas!==null ? `${roas}%` : <span style={{ color:C.muted }}>-</span>}
                    </td>}
                  </tr>
                );
              })}
              {channels.length>0 && (
                <tr style={{ background:C.dim, fontWeight:700 }}>
                  <td style={{ padding:"8px 10px" }}>합계</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(totalCost)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(channels.reduce((s,c)=>s+(+c.inquiry||0),0))}</td>
                  {cols.reservation && <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(channels.reduce((s,c)=>s+(+c.reservation||0),0))}</td>}
                  {cols.visit && <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(channels.reduce((s,c)=>s+(+c.visit||0),0))}</td>}
                  {cols.revenue && <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(channels.reduce((s,c)=>s+(+c.revenue||0),0))}</td>}
                  {cols.cac && <td />}{cols.roas && <td />}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── 인사·조직 ───────────────────────────────────────────────
function HrArea({ data, onChange, dashData, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const monthData = data[selMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const staff = data.staff||[];
  const updStaff = (newStaff) => onChange({...data,staff:newStaff});
  const activeStaff = staff.filter(s=>s.status==="재직").length;
  const revenue = ((dashData.revenue||{})[selMonth]||{}).revenue||0;
  const laborCost = monthData.laborCost||0;
  const laborRatio = revenue>0?((laborCost/revenue)*100).toFixed(1):null;
  const revenuePerStaff = activeStaff>0?Math.round(revenue/activeStaff):null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.red}>🏢 인사·조직</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 }}>
        <KPI label="총 인원 (재직)" value={activeStaff||null} unit="명" color={hospital.color||C.red} />
        <KPI label="총 인건비" value={laborCost||null} unit="원" color={C.orange} />
        <KPI label="매출 대비 인건비율" value={laborRatio} unit="%" color={C.red} sub={revenue?`매출 ${fmt(revenue)}원 기준`:undefined} />
        <KPI label="직원 1인당 매출" value={revenuePerStaff} unit="원" color={C.green} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        <Card style={{ padding:14 }}>
          <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>총 인건비 (원)</label>
          <NumInput value={monthData.laborCost||0} onSave={v=>update("laborCost",v)} />
        </Card>
      </div>

      {/* 보조 정보 */}
      <Card>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>인사 현황 (이번 달)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
          {[["신규 입사","newHire"],["퇴사","resigned"],["교육 횟수","training"]].map(([label,key])=>(
            <div key={key}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
              <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
            </div>
          ))}
        </div>
      </Card>

      {/* 직원 목록 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>직원 목록 ({staff.length}명 / 재직 {activeStaff}명)</div>
          <Btn onClick={()=>updStaff([...staff,{id:Date.now(),name:"",role:"",dept:"",joinDate:"",status:"재직"}])} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {staff.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>직원을 추가해주세요.</div> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:C.dim }}>
                {["이름","직책","직무","입사일","상태",""].map((h,i)=><th key={i} style={{ padding:"8px 10px", textAlign:"left", color:C.muted, fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {staff.map(s=>(
                  <tr key={s.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                    {[["name","이름"],["role","직책"],["dept","직무"]].map(([f,ph])=>(
                      <td key={f} style={{ padding:"6px 8px" }}><input value={s[f]||""} onChange={e=>updStaff(staff.map(x=>x.id===s.id?{...x,[f]:e.target.value}:x))} placeholder={ph} style={{ ...inputSt, minWidth:80 }} /></td>
                    ))}
                    <td style={{ padding:"6px 8px" }}><input type="date" value={s.joinDate||""} onChange={e=>updStaff(staff.map(x=>x.id===s.id?{...x,joinDate:e.target.value}:x))} style={{ ...inputSt, minWidth:130 }} /></td>
                    <td style={{ padding:"6px 8px" }}><select value={s.status||"재직"} onChange={e=>updStaff(staff.map(x=>x.id===s.id?{...x,status:e.target.value}:x))} style={{ ...inputSt, width:80 }}>{["재직","휴직","퇴사"].map(o=><option key={o}>{o}</option>)}</select></td>
                    <td style={{ padding:"6px 8px" }}><button onClick={()=>updStaff(staff.filter(x=>x.id!==s.id))} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 원내 운영 ───────────────────────────────────────────────
function OpsArea({ data, onChange, hospital }) {
  const [selMonth,setSelMonth]=useState(thisMonth());
  const monthData = data[selMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const complaints = monthData.complaints||[];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SecTitle color={C.teal}>⚙️ 원내 운영</SecTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14 }}>
        <KPI label="컴플레인 건수" value={complaints.length||null} unit="건" color={C.red} />
        <KPI label="평균 대기시간" value={monthData.waitTime||null} unit="분" color={C.orange} />
        <KPI label="예약 취소율" value={monthData.cancelRate||null} unit="%" color={C.purple} />
        <KPI label="노쇼율" value={monthData.noShowRate||null} unit="%" color={C.indigo} />
        <KPI label="운영 이슈 건수" value={monthData.issueCount||null} unit="건" color={C.teal} />
      </div>

      {/* 운영 지표 입력 */}
      <Card>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>운영 지표 입력</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
          {[["평균 대기시간 (분)","waitTime"],["예약 취소율 (%)","cancelRate"],["노쇼율 (%)","noShowRate"],["운영 이슈 건수","issueCount"]].map(([label,key])=>(
            <div key={key}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
              <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
            </div>
          ))}
        </div>
      </Card>

      {/* 운영비용 */}
      <Card>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>운영비용</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
          {[["고정비 (원)","fixedCost"],["변동비 (원)","varCost"],["소모품비 (원)","consumable"],["장비유지비 (원)","equipment"],["기타운영비 (원)","otherCost"]].map(([label,key])=>(
            <div key={key}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>{label}</label>
              <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, padding:10, background:C.dim, borderRadius:8, fontSize:12, color:C.muted }}>
          총 운영비: <strong style={{ color:C.text }}>{fmt(["fixedCost","varCost","consumable","equipment","otherCost"].reduce((s,k)=>s+(monthData[k]||0),0))}원</strong>
        </div>
      </Card>

      {/* 컴플레인 */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>컴플레인 관리 ({complaints.length}건)</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,complaints:[...complaints,{id:Date.now(),date:today(),content:"",category:"",status:"접수"}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {complaints.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>이번 달 컴플레인이 없어요.</div> : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {complaints.map(c=>(
              <div key={c.id} style={{ border:`1px solid ${C.dim}`, borderRadius:10, padding:12, display:"grid", gridTemplateColumns:"130px 1fr 130px 100px 36px", gap:8, alignItems:"center" }}>
                <input type="date" value={c.date||""} onChange={e=>onChange({...data,[selMonth]:{...monthData,complaints:complaints.map(x=>x.id===c.id?{...x,date:e.target.value}:x)}})} style={{ ...inputSt, fontSize:12 }} />
                <input value={c.content||""} onChange={e=>onChange({...data,[selMonth]:{...monthData,complaints:complaints.map(x=>x.id===c.id?{...x,content:e.target.value}:x)}})} placeholder="컴플레인 내용" style={{ ...inputSt, fontSize:12 }} />
                <input value={c.category||""} onChange={e=>onChange({...data,[selMonth]:{...monthData,complaints:complaints.map(x=>x.id===c.id?{...x,category:e.target.value}:x)}})} placeholder="분류 (예: 대기, CS)" style={{ ...inputSt, fontSize:12 }} />
                <select value={c.status||"접수"} onChange={e=>onChange({...data,[selMonth]:{...monthData,complaints:complaints.map(x=>x.id===c.id?{...x,status:e.target.value}:x)}})} style={{ ...inputSt, fontSize:12 }}>
                  {["접수","처리중","완료"].map(o=><option key={o}>{o}</option>)}
                </select>
                <button onClick={()=>onChange({...data,[selMonth]:{...monthData,complaints:complaints.filter(x=>x.id!==c.id)}})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [loginName,setLoginName]=useState("");
  const [selectedHospital,setSelectedHospital]=useState(null);
  if (!isLoggedIn) return <LoginScreen onLogin={(name)=>{ setIsLoggedIn(true); setLoginName(name); }} />;
  if (selectedHospital) return <HospitalDashboard hospital={selectedHospital} onBack={()=>setSelectedHospital(null)} loginName={loginName} />;
  return <HospitalListScreen onSelect={setSelectedHospital} loginName={loginName} onLogout={()=>{ setIsLoggedIn(false); setLoginName(""); setSelectedHospital(null); }} />;
}
