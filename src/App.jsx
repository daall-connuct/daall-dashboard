/* eslint-disable */
import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvzvbplqqyxdepaxxoig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2enZicGxxcXl4ZGVwYXh4b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mjc2OTQsImV4cCI6MjA5ODQwMzY5NH0.VyCBjWgsB3eyrfGjHM6-zm6JKLIvEvYdWrf8Q10ttg8'
);

const C = {
  bg:"#F0F4F8", surface:"#FFFFFF", border:"#E2E8F0", dim:"#F1F5F9",
  text:"#0F172A", muted:"#64748B", accent:"#3B82F6", green:"#10B981",
  red:"#EF4444", orange:"#F59E0B", purple:"#8B5CF6", teal:"#14B8A6", indigo:"#6366F1",
};

const AREAS = [
  { id:"revenue",   label:"경영·매출",   icon:"💰", color:"#3B82F6" },
  { id:"patient",   label:"환자 분석",   icon:"👥", color:"#10B981" },
  { id:"marketing", label:"마케팅 성과", icon:"📈", color:"#8B5CF6" },
  { id:"hr",        label:"인사·조직",   icon:"🏢", color:"#F59E0B" },
  { id:"ops",       label:"원내 운영",   icon:"⚙️", color:"#EF4444" },
];

const fmt = (n) => Number(n||0).toLocaleString();
const today = () => new Date().toISOString().slice(0,10);
const thisMonth = () => new Date().toISOString().slice(0,7);
const genMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = -3; i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  }
  return months.sort().reverse();
};

const inputSt = {
  width:"100%", padding:"8px 12px", borderRadius:8,
  border:`1px solid ${C.border}`, background:"#F8FAFC",
  fontSize:13, color:C.text, outline:"none", boxSizing:"border-box",
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20, ...style }}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <div style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:16 }}>{children}</div>
);

const KPI = ({ label, value, unit="", sub, color=C.accent, diff }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
    <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{label}</div>
    <div style={{ color, fontSize:22, fontWeight:900 }}>
      {value}<span style={{ fontSize:13, marginLeft:4, fontWeight:600 }}>{unit}</span>
      {diff!==undefined && diff!==0 && <span style={{ fontSize:11, color:diff>0?C.green:C.red, marginLeft:8, fontWeight:700 }}>{diff>0?"▲":"▼"}{fmt(Math.abs(diff))}</span>}
    </div>
    {sub && <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>{sub}</div>}
  </div>
);

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

function NumInput({ value, onSave, align="left", width="100%" }) {
  const [local, setLocal] = useState(value===0?"":String(value));
  useEffect(()=>{ setLocal(value===0?"":String(value)); },[value]);
  return (
    <input type="text" inputMode="numeric" value={local}
      onChange={e=>setLocal(e.target.value.replace(/[^0-9.]/g,""))}
      onBlur={e=>{ const n=+e.target.value||0; setLocal(n===0?"":String(n)); onSave(n); }}
      style={{ ...inputSt, width, textAlign:align, fontWeight:700, fontSize:13 }} />
  );
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const handleLogin = async () => {
    if (pw === "Daall2025!") { onLogin("관리자"); return; }
    try {
      const { data } = await supabase.from('admin_accounts').select('*').eq('id',1).single();
      const acc = (data?.data||[]).find(a=>a.password===pw);
      if (acc) onLogin(acc.name);
      else setErr("비밀번호가 올바르지 않아요.");
    } catch { setErr("서버 연결 오류가 발생했어요."); }
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1E3A5F,#2D6A9F)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:40, width:340, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏥</div>
          <div style={{ fontWeight:900, fontSize:20, color:C.text }}>다올커넥트</div>
          <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>병원 경영 대시보드</div>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="비밀번호 입력" style={{ ...inputSt, marginBottom:12, fontSize:15 }} autoFocus />
        {err && <div style={{ color:C.red, fontSize:12, marginBottom:10 }}>{err}</div>}
        <Btn onClick={handleLogin} style={{ width:"100%", padding:"11px", fontSize:14 }}>로그인</Btn>
      </div>
    </div>
  );
}

function HospitalListScreen({ onSelect, loginName, onLogout }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name:"", dept:"", region:"", manager:"", color:"#3B82F6", password:"" });
  const [search, setSearch] = useState("");
  const COLORS = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#14B8A6","#F97316","#EC4899","#6366F1","#84CC16"];

  useEffect(()=>{ loadHospitals(); },[]);

  const loadHospitals = async () => {
    try {
      const { data } = await supabase.from('hospitals').select('*');
      if (data?.length>0) setHospitals(data.filter(r=>r.data?.name).map(r=>({...r.data,id:Number(r.data.id||r.id)})));
    } catch(e) {}
    finally { setLoading(false); }
  };

  const saveHospital = async () => {
    if (!form.name.trim()) return;
    const h = editTarget ? {...editTarget,...form} : {...form,id:Date.now()};
    await supabase.from('hospitals').upsert({ id:h.id, data:h }, { onConflict:'id' });
    await loadHospitals();
    setShowForm(false); setEditTarget(null);
    setForm({ name:"", dept:"", region:"", manager:"", color:"#3B82F6", password:"" });
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
          <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>다올커넥트 경영 대시보드</span>
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
            <Btn onClick={()=>{ setEditTarget(null); setForm({ name:"", dept:"", region:"", manager:"", color:"#3B82F6", password:"" }); setShowForm(!showForm); }}>+ 병원 추가</Btn>
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

function HospitalDashboard({ hospital, onBack, loginName }) {
  const [activeArea, setActiveArea] = useState("revenue");
  const [hData, setHData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const saveTimers = useRef({});

  useEffect(()=>{ loadData(); },[hospital.id]);

  const loadData = async () => {
    try {
      const { data } = await supabase.from('hospitals').select('*').eq('id',hospital.id).single();
      if (data?.data) setHData(data.data.dashData||{});
    } catch(e) {}
  };

  const toast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(""),2200); };

  const updateData = (area, newAreaData) => {
    const next = { ...hData, [area]:newAreaData };
    setHData(next);
    if (saveTimers.current[area]) clearTimeout(saveTimers.current[area]);
    saveTimers.current[area] = setTimeout(async () => {
      try { setSaving(true); await supabase.from('hospitals').upsert({ id:hospital.id, data:{...hospital,dashData:next} }, { onConflict:'id' }); toast("저장됨"); }
      catch(e) { toast("저장 실패"); }
      finally { setSaving(false); }
    }, 1500);
  };

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
        {saving && <div style={{ marginLeft:"auto", color:"#94A3B8", fontSize:12 }}>저장 중...</div>}
        <div style={{ marginLeft: saving?"0":"auto", color:"#94A3B8", fontSize:13 }}>{loginName}</div>
      </div>
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", display:"flex", gap:0, overflowX:"auto" }}>
        {AREAS.map(a=>(
          <button key={a.id} onClick={()=>setActiveArea(a.id)} style={{ background:"transparent", border:"none", borderBottom:activeArea===a.id?`3px solid ${a.color}`:"3px solid transparent", color:activeArea===a.id?a.color:C.muted, padding:"14px 20px", fontSize:13, cursor:"pointer", fontWeight:activeArea===a.id?800:500, whiteSpace:"nowrap" }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
        {activeArea==="revenue"   && <RevenueArea   data={hData.revenue||{}}   onChange={d=>updateData("revenue",d)}   hospital={hospital} />}
        {activeArea==="patient"   && <PatientArea   data={hData.patient||{}}   onChange={d=>updateData("patient",d)}   hospital={hospital} />}
        {activeArea==="marketing" && <MarketingArea data={hData.marketing||{}} onChange={d=>updateData("marketing",d)} hospital={hospital} />}
        {activeArea==="hr"        && <HrArea        data={hData.hr||{}}        onChange={d=>updateData("hr",d)}        hospital={hospital} />}
        {activeArea==="ops"       && <OpsArea       data={hData.ops||{}}       onChange={d=>updateData("ops",d)}       hospital={hospital} />}
      </div>
    </div>
  );
}

function RevenueArea({ data, onChange, hospital }) {
  const [selMonth, setSelMonth] = useState(thisMonth());
  const monthData = data[selMonth]||{};
  const prevMonth = (()=>{ const [y,m]=selMonth.split('-').map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; })();
  const lyMonth = selMonth.replace(/^(\d+)/,y=>String(+y-1));
  const prevData = data[prevMonth]||{};
  const lyData = data[lyMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const treatments = monthData.treatments||[];
  const updTr = (id,f,v) => onChange({...data,[selMonth]:{...monthData,treatments:treatments.map(t=>t.id===id?{...t,[f]:v}:t)}});
  const totalRevenue = monthData.revenue||0;
  const targetRevenue = monthData.target||0;
  const achieveRate = targetRevenue>0?Math.round(totalRevenue/targetRevenue*100):0;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SectionTitle>💰 경영·매출</SectionTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14 }}>
        <KPI label="월 매출" value={fmt(totalRevenue)} unit="원" color={hospital.color||C.accent} diff={prevData.revenue?totalRevenue-(prevData.revenue||0):undefined} sub={prevData.revenue?`전월 ${fmt(prevData.revenue)}원`:undefined} />
        <KPI label="목표 매출" value={fmt(targetRevenue)} unit="원" color={C.muted} />
        <KPI label="달성률" value={achieveRate} unit="%" color={achieveRate>=100?C.green:achieveRate>=80?C.orange:C.red} />
        <KPI label="객단가" value={fmt(monthData.unitPrice||0)} unit="원" color={C.purple} />
        <KPI label="전년 동월" value={fmt(lyData.revenue||0)} unit="원" color={C.teal} diff={lyData.revenue?totalRevenue-(lyData.revenue||0):undefined} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        {[["월 매출 (원)","revenue"],["목표 매출 (원)","target"],["객단가 (원)","unitPrice"],["일 평균 매출 (원)","dailyAvg"],["주간 최고 매출 (원)","weeklyMax"]].map(([label,key])=>(
          <Card key={key} style={{ padding:14 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>{label}</label>
            <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>진료·시술별 매출</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,treatments:[...treatments,{id:Date.now(),name:"",revenue:0,count:0}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {treatments.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:20 }}>항목을 추가해주세요.</div> : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr style={{ background:C.dim }}>{["진료/시술명","매출 (원)","건수","건당 매출",""].map((h,i)=><th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"right", color:C.muted, fontWeight:700, fontSize:12 }}>{h}</th>)}</tr></thead>
            <tbody>
              {treatments.map(t=>(
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                  <td style={{ padding:"8px 12px" }}><input value={t.name} onChange={e=>updTr(t.id,"name",e.target.value)} placeholder="예: 보톡스" style={{ ...inputSt }} /></td>
                  <td style={{ padding:"8px 12px" }}><NumInput value={t.revenue||0} onSave={v=>updTr(t.id,"revenue",v)} align="right" /></td>
                  <td style={{ padding:"8px 12px" }}><NumInput value={t.count||0} onSave={v=>updTr(t.id,"count",v)} align="right" width={80} /></td>
                  <td style={{ padding:"8px 12px", textAlign:"right", color:C.muted, fontSize:12 }}>{t.count>0?fmt(Math.round((+t.revenue||0)/t.count)):"-"}</td>
                  <td style={{ padding:"8px 12px", textAlign:"right" }}><button onClick={()=>onChange({...data,[selMonth]:{...monthData,treatments:treatments.filter(x=>x.id!==t.id)}})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button></td>
                </tr>
              ))}
              <tr style={{ background:C.dim, fontWeight:700 }}>
                <td style={{ padding:"8px 12px" }}>합계</td>
                <td style={{ padding:"8px 12px", textAlign:"right", color:hospital.color||C.accent }}>{fmt(treatments.reduce((s,t)=>s+(+t.revenue||0),0))}</td>
                <td style={{ padding:"8px 12px", textAlign:"right" }}>{fmt(treatments.reduce((s,t)=>s+(+t.count||0),0))}건</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function PatientArea({ data, onChange, hospital }) {
  const [selMonth, setSelMonth] = useState(thisMonth());
  const monthData = data[selMonth]||{};
  const prevMonth = (()=>{ const [y,m]=selMonth.split('-').map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; })();
  const prevData = data[prevMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const newPt=monthData.newPatient||0, returnPt=monthData.returnPatient||0, total=newPt+returnPt;
  const items = monthData.ptTreatments||[];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SectionTitle>👥 환자 분석</SectionTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        <KPI label="신환" value={fmt(newPt)} unit="명" color={hospital.color||C.accent} diff={prevData.newPatient!==undefined?newPt-(prevData.newPatient||0):undefined} />
        <KPI label="재진" value={fmt(returnPt)} unit="명" color={C.green} diff={prevData.returnPatient!==undefined?returnPt-(prevData.returnPatient||0):undefined} />
        <KPI label="총 환자수" value={fmt(total)} unit="명" color={C.purple} />
        <KPI label="재방문율" value={total>0?((returnPt/total)*100).toFixed(1):0} unit="%" color={C.teal} />
        <KPI label="환자당 매출" value={fmt(monthData.revenuePerPt||0)} unit="원" color={C.indigo} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        {[["신환 수","newPatient"],["재진 수","returnPatient"],["환자당 매출 (원)","revenuePerPt"],["예약 취소율 (%)","cancelRate"],["평균 대기시간 (분)","waitTime"],["예약 선점률 (%)","bookingRate"]].map(([label,key])=>(
          <Card key={key} style={{ padding:14 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>{label}</label>
            <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>진료별 환자 수</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,ptTreatments:[...items,{id:Date.now(),name:"",count:0,newCount:0}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {items.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>항목을 추가해주세요.</div> : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr style={{ background:C.dim }}>{["진료/시술","총 환자","신환","재진",""].map((h,i)=><th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"right", color:C.muted, fontWeight:700, fontSize:12 }}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map(it=>(
                <tr key={it.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                  <td style={{ padding:"8px 12px" }}><input value={it.name} onChange={e=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,name:e.target.value}:x)}})} placeholder="예: 도수치료" style={{ ...inputSt }} /></td>
                  <td style={{ padding:"8px 12px" }}><NumInput value={it.count||0} onSave={v=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,count:v}:x)}})} align="right" width={80} /></td>
                  <td style={{ padding:"8px 12px" }}><NumInput value={it.newCount||0} onSave={v=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.map(x=>x.id===it.id?{...x,newCount:v}:x)}})} align="right" width={80} /></td>
                  <td style={{ padding:"8px 12px", textAlign:"right", color:C.muted, fontSize:12 }}>{fmt((it.count||0)-(it.newCount||0))}</td>
                  <td style={{ padding:"8px 12px" }}><button onClick={()=>onChange({...data,[selMonth]:{...monthData,ptTreatments:items.filter(x=>x.id!==it.id)}})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function MarketingArea({ data, onChange, hospital }) {
  const [selMonth, setSelMonth] = useState(thisMonth());
  const monthData = data[selMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const CHANNEL_LIST = ["브랜드블로그","인스타그램","유튜브","카페칼럼","카페침투","지식인","홈페이지SEO","워드프레스","메타광고","검색광고","지도리뷰","어플리뷰","언론보도","당근마켓"];
  const channels = monthData.channels||[];
  const initChannels = () => { const ex=channels.map(c=>c.name); const newChs=CHANNEL_LIST.filter(n=>!ex.includes(n)).map(n=>({id:Date.now()+Math.random(),name:n,inquiry:0,visit:0,cost:0,revenue:0})); onChange({...data,[selMonth]:{...monthData,channels:[...channels,...newChs]}}); };
  const updCh = (id,f,v) => onChange({...data,[selMonth]:{...monthData,channels:channels.map(c=>c.id===id?{...c,[f]:v}:c)}});
  const totalInquiry=channels.reduce((s,c)=>s+(+c.inquiry||0),0);
  const totalVisit=channels.reduce((s,c)=>s+(+c.visit||0),0);
  const totalCost=channels.reduce((s,c)=>s+(+c.cost||0),0);
  const totalRevenue=channels.reduce((s,c)=>s+(+c.revenue||0),0);
  const cac=totalVisit>0?Math.round(totalCost/totalVisit):0;
  const roas=totalCost>0?((totalRevenue/totalCost)*100).toFixed(1):0;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SectionTitle>📈 마케팅 성과</SectionTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        <KPI label="총 문의" value={fmt(totalInquiry)} unit="건" color={hospital.color||C.accent} />
        <KPI label="총 내원" value={fmt(totalVisit)} unit="명" color={C.green} />
        <KPI label="총 광고비" value={fmt(totalCost)} unit="원" color={C.orange} />
        <KPI label="CAC" value={fmt(cac)} unit="원" color={C.purple} sub="내원 1인당 비용" />
        <KPI label="ROAS" value={roas} unit="%" color={C.teal} />
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>채널별 성과</div>
          {channels.length===0 && <Btn onClick={initChannels} style={{ padding:"5px 12px", fontSize:12 }}>채널 목록 불러오기</Btn>}
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr style={{ background:C.dim }}>{["채널","문의","내원","광고비 (원)","매출기여 (원)","CAC","전환율"].map((h,i)=><th key={i} style={{ padding:"8px 10px", textAlign:i===0?"left":"right", color:C.muted, fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
            <tbody>
              {channels.map(c=>{
                const cac=c.visit>0?Math.round((+c.cost||0)/c.visit):0;
                const cvr=c.inquiry>0?((+c.visit||0)/(+c.inquiry||0)*100).toFixed(1):0;
                return (
                  <tr key={c.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                    <td style={{ padding:"8px 10px", fontWeight:600, color:C.text, whiteSpace:"nowrap" }}>{c.name}</td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.inquiry||0} onSave={v=>updCh(c.id,"inquiry",v)} align="right" width={70} /></td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.visit||0} onSave={v=>updCh(c.id,"visit",v)} align="right" width={70} /></td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.cost||0} onSave={v=>updCh(c.id,"cost",v)} align="right" width={110} /></td>
                    <td style={{ padding:"6px 10px" }}><NumInput value={c.revenue||0} onSave={v=>updCh(c.id,"revenue",v)} align="right" width={110} /></td>
                    <td style={{ padding:"8px 10px", textAlign:"right", color:C.muted }}>{fmt(cac)}</td>
                    <td style={{ padding:"8px 10px", textAlign:"right", color:C.muted }}>{cvr}%</td>
                  </tr>
                );
              })}
              {channels.length>0 && (
                <tr style={{ background:C.dim, fontWeight:700 }}>
                  <td style={{ padding:"8px 10px" }}>합계</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(totalInquiry)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(totalVisit)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(totalCost)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(totalRevenue)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(cac)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{totalInquiry>0?((totalVisit/totalInquiry)*100).toFixed(1):0}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function HrArea({ data, onChange, hospital }) {
  const [selMonth, setSelMonth] = useState(thisMonth());
  const monthData = data[selMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const staff = data.staff||[];
  const updStaff = (newStaff) => onChange({...data,staff:newStaff});
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SectionTitle>🏢 인사·조직</SectionTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        <KPI label="총 인원" value={staff.filter(s=>s.status==="재직").length} unit="명" color={hospital.color||C.accent} />
        <KPI label="인건비" value={fmt(monthData.laborCost||0)} unit="원" color={C.orange} />
        <KPI label="신규 입사" value={fmt(monthData.newHire||0)} unit="명" color={C.green} />
        <KPI label="퇴사" value={fmt(monthData.resigned||0)} unit="명" color={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        {[["인건비 합계 (원)","laborCost"],["신규 입사","newHire"],["퇴사","resigned"],["교육 횟수","training"]].map(([label,key])=>(
          <Card key={key} style={{ padding:14 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>{label}</label>
            <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>직원 목록 ({staff.length}명)</div>
          <Btn onClick={()=>updStaff([...staff,{id:Date.now(),name:"",role:"",dept:"",joinDate:"",salary:0,status:"재직"}])} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {staff.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>직원을 추가해주세요.</div> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:C.dim }}>{["이름","직무","부서","입사일","월급여 (원)","상태",""].map((h,i)=><th key={i} style={{ padding:"8px 10px", textAlign:"left", color:C.muted, fontWeight:700 }}>{h}</th>)}</tr></thead>
              <tbody>
                {staff.map(s=>(
                  <tr key={s.id} style={{ borderBottom:`1px solid ${C.dim}` }}>
                    {[["name","이름"],["role","직무"],["dept","부서"]].map(([f,ph])=>(
                      <td key={f} style={{ padding:"6px 8px" }}><input value={s[f]||""} onChange={e=>updStaff(staff.map(x=>x.id===s.id?{...x,[f]:e.target.value}:x))} placeholder={ph} style={{ ...inputSt, minWidth:80 }} /></td>
                    ))}
                    <td style={{ padding:"6px 8px" }}><input type="date" value={s.joinDate||""} onChange={e=>updStaff(staff.map(x=>x.id===s.id?{...x,joinDate:e.target.value}:x))} style={{ ...inputSt, minWidth:130 }} /></td>
                    <td style={{ padding:"6px 8px" }}><NumInput value={s.salary||0} onSave={v=>updStaff(staff.map(x=>x.id===s.id?{...x,salary:v}:x))} width={110} /></td>
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

function OpsArea({ data, onChange, hospital }) {
  const [selMonth, setSelMonth] = useState(thisMonth());
  const monthData = data[selMonth]||{};
  const update = (key,val) => onChange({...data,[selMonth]:{...monthData,[key]:val}});
  const complaints = monthData.complaints||[];
  const updComp = (id,f,v) => onChange({...data,[selMonth]:{...monthData,complaints:complaints.map(c=>c.id===id?{...c,[f]:v}:c)}});
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <SectionTitle>⚙️ 원내 운영</SectionTitle>
        <MonthSelector selMonth={selMonth} setSelMonth={setSelMonth} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        <KPI label="컴플레인" value={fmt(complaints.length)} unit="건" color={C.red} />
        <KPI label="평균 대기시간" value={fmt(monthData.waitTime||0)} unit="분" color={C.orange} />
        <KPI label="고정비" value={fmt(monthData.fixedCost||0)} unit="원" color={C.purple} />
        <KPI label="변동비" value={fmt(monthData.varCost||0)} unit="원" color={C.indigo} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        {[["평균 대기시간 (분)","waitTime"],["고정비 (원)","fixedCost"],["변동비 (원)","varCost"],["소모품비 (원)","consumable"],["장비유지비 (원)","equipment"],["기타 운영비 (원)","otherCost"]].map(([label,key])=>(
          <Card key={key} style={{ padding:14 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>{label}</label>
            <NumInput value={monthData[key]||0} onSave={v=>update(key,v)} />
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>컴플레인 관리 ({complaints.length}건)</div>
          <Btn onClick={()=>onChange({...data,[selMonth]:{...monthData,complaints:[...complaints,{id:Date.now(),date:today(),content:"",category:"",status:"접수"}]}})} style={{ padding:"5px 12px", fontSize:12 }}>+ 추가</Btn>
        </div>
        {complaints.length===0 ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:16 }}>이번 달 컴플레인이 없어요.</div> : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {complaints.map(c=>(
              <div key={c.id} style={{ border:`1px solid ${C.dim}`, borderRadius:10, padding:12, display:"grid", gridTemplateColumns:"130px 1fr 130px 100px 36px", gap:8, alignItems:"center" }}>
                <input type="date" value={c.date||""} onChange={e=>updComp(c.id,"date",e.target.value)} style={{ ...inputSt, fontSize:12 }} />
                <input value={c.content||""} onChange={e=>updComp(c.id,"content",e.target.value)} placeholder="컴플레인 내용" style={{ ...inputSt, fontSize:12 }} />
                <input value={c.category||""} onChange={e=>updComp(c.id,"category",e.target.value)} placeholder="분류 (예: 대기, CS)" style={{ ...inputSt, fontSize:12 }} />
                <select value={c.status||"접수"} onChange={e=>updComp(c.id,"status",e.target.value)} style={{ ...inputSt, fontSize:12 }}>
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  if (!isLoggedIn) return <LoginScreen onLogin={(name)=>{ setIsLoggedIn(true); setLoginName(name); }} />;
  if (selectedHospital) return <HospitalDashboard hospital={selectedHospital} onBack={()=>setSelectedHospital(null)} loginName={loginName} />;
  return <HospitalListScreen onSelect={setSelectedHospital} loginName={loginName} onLogout={()=>{ setIsLoggedIn(false); setLoginName(""); setSelectedHospital(null); }} />;
}
