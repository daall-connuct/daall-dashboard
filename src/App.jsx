/* eslint-disable */
import { useState, useMemo, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://jfausjwfxpturkkmmyrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYXVzandmeHB0dXJra21teXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDE1NzksImV4cCI6MjA4OTQ3NzU3OX0.PofOLAP6nT7NZ8pWM5xNaEq6T-yCNzNThz36IgynOfM'
);
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

// ─── 색상 ─────────────────────────────────────────────────────
const C = {
  bg: "#F1F5F9", surface: "#FFFFFF", border: "#E2E8F0",
  accent: "#0EA5E9", accent2: "#6366F1", green: "#10B981", yellow: "#F59E0B",
  red: "#EF4444", orange: "#F97316", text: "#1E293B", muted: "#64748B", dim: "#E2E8F0",
};

// ─── 병원 목록 ────────────────────────────────────────────────
const HOSPITALS_INIT = [
  { id:1, name:"리드성형외과",   region:"강남", dept:"성형외과", target_patients:120, target_revenue:15000, manager:"김민지", color:"#38BDF8" },
  { id:2, name:"광동병원",       region:"광동", dept:"한방/재활", target_patients:200, target_revenue:22000, manager:"이서준", color:"#34D399" },
  { id:3, name:"아미힐요양병원", region:"부산", dept:"요양/재활", target_patients:80,  target_revenue:9000,  manager:"박지현", color:"#FBBF24" },
  { id:4, name:"서울아산OK치과", region:"서울", dept:"치과",      target_patients:150, target_revenue:18000, manager:"최유나", color:"#F472B6" },
  { id:5, name:"강남미소피부과", region:"강남", dept:"피부과",    target_patients:180, target_revenue:20000, manager:"정다은", color:"#A78BFA" },
  { id:6, name:"연세정형외과",   region:"분당", dept:"정형외과",  target_patients:100, target_revenue:12000, manager:"한승우", color:"#FB923C" },
  { id:7, name:"하늘안과의원",   region:"인천", dept:"안과",      target_patients:90,  target_revenue:11000, manager:"오민아", color:"#2DD4BF" },
];


const TEAM_LEADERS_META = [
  { team:"디자인팀", name:"서보영", color:"#A78BFA" },
  { team:"CS팀",     name:"김혜지", color:"#F97316" },
  { team:"마케팅팀", name:"박다은", color:"#0EA5E9" },
  { team:"기획팀",   name:"홍동호", color:"#10B981" },
];

const ASSIGNEE_COLORS = {
  "서보영": "#A78BFA",
  "김혜지": "#F97316",
  "대표님": "#EF4444",
  "홍동호": "#10B981",
  "박다은": "#0EA5E9",
};
const getAssigneeColor = (assignee) => ASSIGNEE_COLORS[assignee] || null;
const CH_COLORS = ["#00C49F","#0088FE","#FFBB28","#FF8042","#A28DFF","#FF6B9D","#FF6B35","#4ECDC4","#45B7D1","#96CEB4"];

const CHANNEL_META = {
  "네이버블로그":  { color:"#03C75A" }, "인스타그램":   { color:"#E1306C" },
  "유튜브":        { color:"#FF0000" }, "네이버카페":   { color:"#0088FE" },
  "지식인":        { color:"#FFBB28" }, "홈페이지SEO":  { color:"#38BDF8" },
  "웹사이트":      { color:"#6366F1" }, "메타광고":     { color:"#4ECDC4" },
  "검색광고":      { color:"#A78BFA" }, "네이버플레이스":{ color:"#FF6B35" },
  "오프라인/소개": { color:"#96CEB4" }, "블로그":        { color:"#03C75A" },
  "카페":          { color:"#0088FE" }, "플레이스":      { color:"#FF6B35" },
  "강남언니":      { color:"#FF4E8C" }, "힐링페이퍼":   { color:"#7C3AED" },
  "바비톡":        { color:"#F59E0B" },
};

const FIXED_CHANNELS = ["네이버블로그","인스타그램","유튜브","네이버카페","웹사이트","홈페이지SEO","메타광고","검색광고","네이버플레이스","지식인","강남언니","힐링페이퍼","바비톡"];
const CHANNEL_OPTIONS = ["네이버블로그","인스타그램","유튜브","네이버카페","지식인","홈페이지SEO","웹사이트","메타광고","검색광고","네이버플레이스","강남언니","힐링페이퍼","바비톡","오프라인/소개"];
const STATUS_OPTIONS = ["발행","예약발행","임시저장","수정필요"];
const EMPTY_FORM = { channel:"네이버블로그", date:"", title:"", url:"", views:0, clicks:0, rank:"", topExposed:false, status:"발행", memo:"" };

// ─── 초기 월별 성과 데이터 (샘플 없음 - 직접 입력)
const MONTHLY_INIT = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[] };

// ─── 초기 채널 데이터 ─────────────────────────────────────────
const CHANNEL_INIT = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[] };

// ─── 초기 키워드 데이터 ───────────────────────────────────────

// ─── 공통 컴포넌트 ────────────────────────────────────────────
const fmt = (n) => (n || 0).toLocaleString();
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "-";

// ─── 공통 연도+월 선택 컴포넌트 ──────────────────────────────
function YearMonthSelector({ availMonths, selMonth, setSelMonth, color }) {
  const years = [...new Set(availMonths.map(m => m.slice(0,4)))].sort().reverse();
  const [selYear, setSelYear] = useState(() => {
    if (selMonth && selMonth.length >= 4) return selMonth.slice(0,4);
    return years[0] || String(new Date().getFullYear());
  });

  // 외부에서 selMonth가 바뀌면 selYear도 동기화
  useEffect(() => {
    if (selMonth && selMonth.length >= 4) {
      setSelYear(selMonth.slice(0,4));
    } else if (years.length > 0 && !years.includes(selYear)) {
      setSelYear(years[0]);
    }
  }, [selMonth, availMonths]);

  const monthsInYear = availMonths.filter(m => m.startsWith(selYear));
  const accentColor = color || "#38BDF8";

  if (availMonths.length === 0) return (
    <span style={{ color:"#64748B", fontSize:12 }}>데이터 없음</span>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
      <select value={selYear} onChange={e => { setSelYear(e.target.value); setSelMonth(""); }}
        style={{ background:"#F1F5F9", border:`1px solid #1E293B`, borderRadius:8, color:"#0F172A", padding:"4px 10px", fontSize:12, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif", outline:"none", cursor:"pointer" }}>
        {years.map(y => <option key={y} value={y} style={{background:"#F8FAFC"}}>{y}년</option>)}
      </select>
      {monthsInYear.length === 0
        ? <span style={{ color:"#64748B", fontSize:12 }}>{selYear}년 데이터 없음</span>
        : monthsInYear.map(m => (
            <button key={m} onClick={() => setSelMonth(m)} style={{
              background: selMonth===m ? `${accentColor}25` : "transparent",
              border: `1px solid ${selMonth===m ? accentColor : "#0F172A"}`,
              color: selMonth===m ? accentColor : "#64748B",
              borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{+m.slice(5)}월</button>
          ))
      }
    </div>
  );
}

const KPICard = ({ label, value, unit, sub, color = C.accent, trend }) => (
  <div style={{ background: C.surface, border: `1px solid ${color}25`, borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right, ${color}0D, transparent 60%)`, pointerEvents: "none" }} />
    <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{label}</div>
    <div style={{ color, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 14, marginLeft: 4, fontWeight: 600 }}>{unit}</span>
    </div>
    {sub && <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>{sub}</div>}
    {trend !== undefined && (
      <div style={{ position: "absolute", top: 16, right: 14, fontSize: 12, color: trend >= 0 ? C.green : C.red, fontWeight: 700 }}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 15, background: `linear-gradient(180deg, ${C.accent}, ${C.accent2})`, borderRadius: 2 }} />
      <span style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{children}</span>
    </div>
    {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 3, paddingLeft: 11 }}>{sub}</div>}
  </div>
);

const Badge = ({ children, color = C.accent }) => (
  <span style={{ background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>
);

const TT = (props) => (
  <Tooltip contentStyle={{ background: "#F8FAFC", border: `1px solid ${C.dim}`, borderRadius: 10, color: C.text, fontSize: 12 }} {...props} />
);

const inputSt = { background: "#F1F5F9", border: `1px solid ${C.dim}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, fontFamily: "-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif", width: "100%", outline: "none" };

// ─── 한글 입력 버그 방지 Input 컴포넌트 ──────────────────────
function KInput({ value, onChange, style, type="text", placeholder, onKeyDown, autoFocus, ...rest }) {
  const composing = useRef(false);
  const [inner, setInner] = useState(value ?? "");
  const isFirstRender = useRef(true);

  // 외부에서 value가 바뀔 때만 동기화 (조합 중 아닐 때)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!composing.current) setInner(value ?? "");
  }, [value]);

  return (
    <input
      {...rest}
      type={type}
      value={inner}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      style={{ ...inputSt, ...style }}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(e) => {
        composing.current = false;
        setInner(e.target.value);
        onChange?.({ target: { value: e.target.value } });
      }}
      onChange={(e) => {
        setInner(e.target.value);
        if (!composing.current) onChange?.(e);
      }}
    />
  );
}

const Toast = ({ msg }) => msg ? (
  <div style={{ position: "fixed", bottom: 28, right: 28, background: C.green, color: "#000", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{msg}</div>
) : null;


// ─── 병원 목록 화면 ───────────────────────────────────────────
const PALETTE = ["#38BDF8","#34D399","#FBBF24","#F472B6","#A78BFA","#FB923C","#2DD4BF","#60A5FA","#E879F9","#4ADE80","#FCD34D","#F87171"];
const ALL_TABS = [
  { id:"overview",    label:"통합 요약",   required:false },
  { id:"performance", label:"상세 성과",   required:false },
  { id:"channel",     label:"채널 분석",   required:false },
  { id:"funnel",      label:"전환 분석",   required:false },
  { id:"patient",     label:"환자 유입",   required:false },
  { id:"marketing",   label:"마케팅 현황", required:false, defaultOn:true },
  { id:"keyword",     label:"키워드 현황", required:false, defaultOn:true },
  { id:"schedule",    label:"일정 관리",   required:false, defaultOn:true },
  { id:"cost",        label:"비용 관리",   required:false, defaultOn:true },
  { id:"meeting",     label:"미팅 로그",   required:false, defaultOn:true },
];
const DEFAULT_TABS = ALL_TABS.filter(t => t.required || t.defaultOn).map(t => t.id);

const EMPTY_HOSPITAL_FORM = { name:"", region:"", dept:"", manager:"", target_patients:"", target_revenue:"", color:"#38BDF8", password:"", tabs: DEFAULT_TABS };

// ─── 병원 폼 필드 컴포넌트 (외부 선언으로 리렌더링 방지) ──────
function HospitalFormField({ label, k, placeholder, type="text", required, form, setForm }) {
  return (
    <div>
      <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>
        {label}{required && <span style={{color:C.red}}> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[k]}
        onChange={e => setForm(prev => ({...prev, [k]:e.target.value}))}
        style={inputSt}
      />
    </div>
  );
}

function HospitalSelectScreen({ hospitals, onSelect, onAddHospital, onEditHospital, onDeleteHospital, onUpdateHospital, isAdmin, isSuperAdmin, adminRole, loginName, onAdminLogout, globalSchedules, saveGlobalSchedules }) {
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_HOSPITAL_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedMsg, setSavedMsg]     = useState("");
  const [mainTab, setMainTab]       = useState("hospitals"); // "hospitals" | "internal"

  // 관리자 계정 관리 (이름 + 비밀번호)
  const [adminAccounts, setAdminAccounts] = useState([
    { id:1, name:"임지혜", password:"Daall" },
  ]);

  // 관리자 계정 관리 UI
  const [showAccountMgmt, setShowAccountMgmt] = useState(false);
  const [newAccount, setNewAccount] = useState({ name:"", password:"", role:"중간관리자" });
  const [resetConfirmId, setResetConfirmId] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

  // 관리자 계정 Supabase 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('admin_accounts').select('*').eq('id', 1).single();
        if (data?.data?.length > 0) setAdminAccounts(data.data);
      } catch(e) {}
    };
    load();
  }, []);

  const saveAdminAccounts = async (accounts) => {
    try {
      await supabase.from('admin_accounts').upsert({ id: 1, data: accounts }, { onConflict: 'id' });
    } catch(e) { console.error('관리자 계정 저장 실패:', e); }
  };

  const handleAddAccount = () => {
    if (!newAccount.name.trim() || !newAccount.password.trim()) return;
    const newAccounts = [...adminAccounts, { id:Date.now(), ...newAccount }];
    setAdminAccounts(newAccounts);
    saveAdminAccounts(newAccounts);
    setNewAccount({ name:"", password:"" });
    toast("계정 추가 완료!");
  };

  const handleDeleteAccount = (id) => {
    const newAccounts = adminAccounts.filter(a => a.id !== id);
    setAdminAccounts(newAccounts);
    saveAdminAccounts(newAccounts);
    setResetConfirmId(null);
  };

  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2200); };

  const openAdd = () => { setForm(EMPTY_HOSPITAL_FORM); setEditTarget(null); setShowForm(true); };
  const openEdit = (e, h) => { e.stopPropagation(); setForm({ name:h.name, region:h.region, dept:h.dept, manager:h.manager, target_patients:String(h.target_patients), target_revenue:String(h.target_revenue), color:h.color, password:h.password||"", tabs: h.tabs || DEFAULT_TABS, juniorTabs: h.juniorTabs || [] }); setEditTarget(h); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.dept) return;
    if (editTarget) {
      onEditHospital({ ...editTarget, ...form, target_patients:+form.target_patients||0, target_revenue:+form.target_revenue||0 });
      toast("수정 완료!");
    } else {
      onAddHospital({ ...form, target_patients:+form.target_patients||0, target_revenue:+form.target_revenue||0 });
      toast("병원 추가 완료!");
    }
    setShowForm(false); setEditTarget(null); setForm(EMPTY_HOSPITAL_FORM);
  };

  const handleDelete = (e, id) => { e.stopPropagation(); setDeleteConfirm(id); };
  const confirmDelete = (e, id) => { e.stopPropagation(); onDeleteHospital(id); setDeleteConfirm(null); toast("삭제 완료"); };

  const summaries = useMemo(() => hospitals.map(h => {
    const mData = h.monthlyData || [];
    const last = mData[mData.length - 1] || {};
    const roi = last.marketingCost ? Math.round(((last.revenue - last.marketingCost) / last.marketingCost) * 100) : 0;
    const achieve = last.newPatient && h.target_patients ? Math.round((last.newPatient / h.target_patients) * 100) : 0;
    return { ...h, last, roi, achieve };
  }), [hospitals]);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"40px 32px", fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <Toast msg={savedMsg} />

      {/* 헤더 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ color:C.text, fontSize:26, fontWeight:900, marginBottom:4 }}>다올 마케팅 대시보드</div>
            {isAdmin && <Badge color={C.accent}>관리자 · {loginName}</Badge>}
          </div>
          <div style={{ color:C.muted, fontSize:14 }}>병원을 선택하면 상세 대시보드로 이동해요</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {isAdmin && (
            <>
              <button onClick={openAdd} style={{ background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:12, padding:"11px 22px", fontSize:14, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
                + 새 병원 추가
              </button>
              <button onClick={() => { onAdminLogout(); setShowAccountMgmt(false); toast("로그아웃 완료"); }} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:10, padding:"9px 14px", fontSize:12, cursor:"pointer" }}>
                로그아웃
              </button>
              {isSuperAdmin && (
                <>
                  <button onClick={() => setShowAccountMgmt(!showAccountMgmt)} style={{
                    background: showAccountMgmt ? `${C.accent2}20` : "transparent",
                    border: `1px solid ${showAccountMgmt ? C.accent2 : C.dim}`,
                    color: showAccountMgmt ? C.accent2 : C.muted,
                    borderRadius:10, padding:"9px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
                  }}>👤 계정 관리</button>
                  <button onClick={async () => {
                    if (!showActivityLog) {
                      try {
                        const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100);
                        setActivityLogs(data || []);
                      } catch(e) {}
                    }
                    setShowActivityLog(!showActivityLog);
                  }} style={{
                    background: showActivityLog ? `${C.green}20` : "transparent",
                    border: `1px solid ${showActivityLog ? C.green : C.dim}`,
                    color: showActivityLog ? C.green : C.muted,
                    borderRadius:10, padding:"9px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
                  }}>📋 활동 로그</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 관리자 전용 - 계정 관리 */}
      {isAdmin && isSuperAdmin && showAccountMgmt && (
        <div style={{ marginBottom:24, background:"#F8FAFC", border:`1px solid ${C.accent2}30`, borderRadius:20, padding:24 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:18, background:`linear-gradient(180deg,${C.accent2},${C.accent})`, borderRadius:2 }} />
            관리자 계정 관리
          </div>

          {/* 현재 계정 목록 */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {adminAccounts.map(acc => {
              const roleColor = acc.role === "최고관리자" ? C.red : acc.role === "실무자" ? C.green : C.accent2;
              const roleName = acc.role || "중간관리자";
              return (
              <div key={acc.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent2},${C.accent})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#0F172A", fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {acc.name[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color:C.text, fontSize:13, fontWeight:700 }}>{acc.name}</span>
                    <span style={{ background:`${roleColor}15`, color:roleColor, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{roleName}</span>
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>비밀번호: {"●".repeat(acc.password.length)}</div>
                </div>
                {adminAccounts.length > 1 && (
                  resetConfirmId === acc.id ? (
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleDeleteAccount(acc.id)} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:7, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>삭제 확인</button>
                      <button onClick={() => setResetConfirmId(null)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                    </div>
                  ) : (
                    <button onClick={() => setResetConfirmId(acc.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
                  )
                )}
              </div>
              );
            })}
          </div>

          {/* 새 계정 추가 */}
          <div style={{ background:`${C.accent2}08`, border:`1px solid ${C.accent2}25`, borderRadius:12, padding:16 }}>
            <div style={{ color:C.muted, fontSize:12, fontWeight:700, marginBottom:10 }}>새 관리자 계정 추가</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name:e.target.value})}
                placeholder="이름" style={{ ...inputSt, width:100, padding:"7px 10px", fontSize:12 }} />
              <input type="password" value={newAccount.password} onChange={e => setNewAccount({...newAccount, password:e.target.value})}
                onKeyDown={e => e.key === "Enter" && handleAddAccount()}
                placeholder="비밀번호" style={{ ...inputSt, width:120, padding:"7px 10px", fontSize:12 }} />
              <select value={newAccount.role} onChange={e => setNewAccount({...newAccount, role:e.target.value})}
                style={{ ...inputSt, width:110, padding:"7px 10px", fontSize:12, appearance:"none" }}>
                <option value="최고관리자">최고관리자</option>
                <option value="중간관리자">중간관리자</option>
                <option value="실무자">실무자</option>
              </select>
              <button onClick={handleAddAccount} disabled={!newAccount.name || !newAccount.password} style={{
                background: newAccount.name && newAccount.password ? `linear-gradient(135deg,${C.accent2},${C.accent})` : C.dim,
                border:"none", color:"#0F172A", borderRadius:9, padding:"7px 18px", fontSize:12, cursor: newAccount.name && newAccount.password ? "pointer" : "not-allowed", fontWeight:700,
              }}>+ 추가</button>
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>실무자는 병원별로 허용된 탭만 볼 수 있어요.</div>
          </div>
        </div>
      )}

      {/* 슈퍼관리자 전용 - 활동 로그 */}
      {isAdmin && isSuperAdmin && showActivityLog && (
        <div style={{ marginBottom:24, background:"#F8FAFC", border:`1px solid ${C.green}30`, borderRadius:20, padding:24 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:3, height:18, background:`linear-gradient(180deg,${C.green},${C.accent})`, borderRadius:2 }} />
              활동 로그 (최근 100건)
            </div>
            <button onClick={async () => {
              try {
                const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100);
                setActivityLogs(data || []);
              } catch(e) {}
            }} style={{ background:`${C.green}20`, border:`1px solid ${C.green}40`, color:C.green, borderRadius:8, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:600 }}>새로고침</button>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.dim}` }}>
                  {["시간","담당자","병원","액션","상세"].map(h => (
                    <th key={h} style={{ color:C.muted, fontWeight:600, padding:"8px 12px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0
                  ? <tr><td colSpan={5} style={{ padding:"24px", textAlign:"center", color:C.muted }}>활동 로그가 없어요</td></tr>
                  : activityLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom:`1px solid ${C.dim}30` }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${C.green}08`}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"8px 12px", color:C.muted, whiteSpace:"nowrap", fontSize:11 }}>
                        {new Date(log.created_at).toLocaleString("ko-KR", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" })}
                      </td>
                      <td style={{ padding:"8px 12px", color:C.accent, fontWeight:700 }}>{log.actor}</td>
                      <td style={{ padding:"8px 12px", color:C.text }}>{log.hospital_name || "-"}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <span style={{ background:`${C.green}15`, border:`1px solid ${C.green}30`, color:C.green, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{log.action}</span>
                      </td>
                      <td style={{ padding:"8px 12px", color:C.muted }}>{log.detail || "-"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 병원 추가 / 수정 폼 */}
      {showForm && (
        <div style={{ background:"#F8FAFC", border:`2px solid ${form.color}50`, borderRadius:20, padding:28, maxWidth:900, margin:"0 auto", marginBottom:32 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:20 }}>{editTarget ? "병원 정보 수정" : "새 병원 추가"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:14, marginBottom:18 }}>
            <HospitalFormField label="병원명" k="name" placeholder="예: 강남미소피부과" required form={form} setForm={setForm} />
            <HospitalFormField label="진료과" k="dept" placeholder="예: 피부과" required form={form} setForm={setForm} />
            <HospitalFormField label="지역" k="region" placeholder="예: 강남" form={form} setForm={setForm} />
            <HospitalFormField label="담당자" k="manager" placeholder="예: 김민지" form={form} setForm={setForm} />
            <HospitalFormField label="신환 목표 (명/월)" k="target_patients" placeholder="120" type="number" form={form} setForm={setForm} />
            <HospitalFormField label="매출 목표 (만원/월)" k="target_revenue" placeholder="15000" type="number" form={form} setForm={setForm} />
            <HospitalFormField label="공유 링크 비밀번호" k="password" placeholder="예: lead2024" form={form} setForm={setForm} />

            {/* 탭 선택 */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>표시할 탭 선택</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {ALL_TABS.map(t => {
                  const isOn = (form.tabs || DEFAULT_TABS).includes(t.id);
                  return (
                    <div key={t.id} onClick={() => {
                      const cur = form.tabs || DEFAULT_TABS;
                      setForm(prev => ({...prev, tabs: isOn ? cur.filter(id => id !== t.id) : [...cur, t.id]}));
                    }} style={{
                      display:"flex", alignItems:"center", gap:6,
                      background: isOn ? `${form.color||C.accent}20` : "transparent",
                      border: `1px solid ${isOn ? (form.color||C.accent) : C.dim}`,
                      borderRadius:8, padding:"5px 12px", fontSize:12,
                      cursor: "pointer",
                      color: isOn ? (form.color||C.accent) : C.muted,
                    }}>
                      <span>{isOn ? "✓" : "○"}</span>
                      <span>{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 실무자 허용 탭 */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>👤 실무자 허용 탭 <span style={{ color:C.muted, fontWeight:400 }}>(실무자 등급 계정에만 적용)</span></label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {(form.tabs || DEFAULT_TABS).map(tabId => {
                  const tabInfo = ALL_TABS.find(t => t.id === tabId);
                  if (!tabInfo) return null;
                  const isAllowed = (form.juniorTabs || []).includes(tabId);
                  return (
                    <div key={tabId} onClick={() => {
                      const cur = form.juniorTabs || [];
                      setForm(prev => ({...prev, juniorTabs: isAllowed ? cur.filter(id => id !== tabId) : [...cur, tabId]}));
                    }} style={{
                      display:"flex", alignItems:"center", gap:6,
                      background: isAllowed ? `${C.green}20` : "transparent",
                      border: `1px solid ${isAllowed ? C.green : C.dim}`,
                      borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer",
                      color: isAllowed ? C.green : C.muted,
                    }}>
                      <span>{isAllowed ? "✓" : "○"}</span>
                      <span>{tabInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 색상 선택 */}
          <div style={{ marginBottom:20 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:10 }}>대표 색상</label>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              {PALETTE.map(col => (
                <div key={col} onClick={() => setForm(prev => ({...prev, color:col}))} style={{
                  width:28, height:28, borderRadius:"50%", background:col, cursor:"pointer",
                  border: form.color === col ? `3px solid #fff` : "3px solid transparent",
                  boxShadow: form.color === col ? `0 0 0 2px ${col}` : "none",
                  transition:"all 0.15s",
                }} />
              ))}
              {/* 직접 입력 */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:form.color, border:`2px solid rgba(255,255,255,0.2)` }} />
                <KInput type="text" value={form.color} onChange={e => setForm(prev => ({...prev, color:e.target.value}))}
                  style={{...inputSt, width:100, padding:"5px 10px", fontSize:12}} placeholder="#38BDF8" />
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div style={{ background:`${form.color}10`, border:`1px solid ${form.color}30`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${form.color},${form.color}88)`, flexShrink:0 }} />
            <div>
              <div style={{ color:C.text, fontSize:15, fontWeight:800 }}>{form.name || "병원명 미입력"}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                {form.dept && <Badge color={form.color}>{form.dept}</Badge>}
                {form.region && <Badge color={C.muted}>{form.region}</Badge>}
                {form.manager && <span style={{ color:C.muted, fontSize:11 }}>담당 {form.manager}</span>}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleSave} disabled={!form.name || !form.dept} style={{
              background: form.name && form.dept ? `linear-gradient(135deg,${form.color},${C.accent2})` : C.dim,
              border:"none", color:"#0F172A", borderRadius:10, padding:"10px 26px", fontSize:13, cursor: form.name && form.dept ? "pointer" : "not-allowed", fontWeight:700,
            }}>{editTarget ? "수정 완료" : "병원 추가"}</button>
            <button onClick={() => { setShowForm(false); setEditTarget(null); setForm(EMPTY_HOSPITAL_FORM); }} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"10px 18px", fontSize:13, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div style={{ display:"flex", gap:8, marginBottom:28, borderBottom:`1px solid ${C.border}`, paddingBottom:0 }}>
        {[
          { id:"hospitals", label:"🏥 병원 목록" },
          { id:"internal", label:"📋 내부 작업" },
        ].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} style={{
            background:"transparent", border:"none", borderBottom: mainTab===t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            color: mainTab===t.id ? C.accent : C.muted, padding:"10px 20px", fontSize:14, cursor:"pointer", fontWeight: mainTab===t.id ? 700 : 500,
            marginBottom:-1,
          }}>{t.label}</button>
        ))}
      </div>

      {mainTab === "hospitals" && (<>
      {/* 요약 KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, maxWidth:900, margin:"0 auto 36px" }}>
        {[
          { label:"관리 병원", value:hospitals.length, unit:"개", color:C.accent },
          { label:"총 신환", value:fmt(summaries.reduce((s,h) => s+(h.last.newPatient||0), 0)), unit:"명", color:C.green },
          { label:"총 매출", value:fmt(summaries.reduce((s,h) => s+(h.last.revenue||0), 0)), unit:"만원", color:C.yellow },
          { label:"평균 ROI", value:summaries.length ? Math.round(summaries.reduce((s,h) => s+h.roi, 0) / summaries.length) : 0, unit:"%", color:C.orange },
        ].map((item, i) => (
          <div key={i} style={{ background:C.surface, border:`1px solid ${item.color}25`, borderRadius:14, padding:"16px 20px", textAlign:"center" }}>
            <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{item.label}</div>
            <div style={{ color:item.color, fontSize:22, fontWeight:900 }}>{item.value}<span style={{ fontSize:12, marginLeft:3 }}>{item.unit}</span></div>
          </div>
        ))}
      </div>

      {/* 병원 카드 그리드 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20, maxWidth:1100, margin:"0 auto" }}>
        {summaries.map((h) => (
          <div key={h.id} onClick={() => onSelect(h)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${h.color}60`; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${C.border}`; e.currentTarget.style.transform = "translateY(0)"; }}>

            <div style={{ position:"absolute", top:0, right:0, width:120, height:120, background:`radial-gradient(circle at top right, ${h.color}15, transparent)`, pointerEvents:"none" }} />

            {/* 수정 / 삭제 버튼 - 관리자만 */}
            {isAdmin && (
            <div style={{ position:"absolute", top:14, right:14, display:"flex", gap:6, zIndex:10 }} onClick={e => e.stopPropagation()}>
              <button onClick={e => openEdit(e, h)} style={{ background:`${h.color}20`, border:`1px solid ${h.color}40`, color:h.color, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>수정</button>
              {deleteConfirm === h.id ? (
                <button onClick={e => confirmDelete(e, h.id)} style={{ background:`${C.red}25`, border:`1px solid ${C.red}`, color:C.red, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>확인</button>
              ) : (
                <button onClick={e => handleDelete(e, h.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
              )}
            </div>
            )}

            <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16, paddingRight:120 }}>
              <div style={{ width:42, height:42, borderRadius:13, background:`linear-gradient(135deg,${h.color},${h.color}88)`, flexShrink:0 }} />
              <div>
                <div style={{ color:C.text, fontSize:16, fontWeight:800, marginBottom:5 }}>{h.name}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Badge color={h.color}>{h.dept}</Badge>
                  <Badge color={C.muted}>{h.region}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:14 }}>
              {[
                { label:"신환", value:fmt(h.last.newPatient||0), unit:"명" },
                { label:"매출", value:fmt(h.last.revenue||0), unit:"만" },
                { label:"마케팅비", value:fmt(h.last.marketingCost||0), unit:"만" },
              ].map((item,i) => (
                <div key={i} style={{ background:"#F8FAFC", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>{item.label}</div>
                  <div style={{ color:C.text, fontSize:13, fontWeight:700 }}>{item.value}<span style={{ fontSize:10, marginLeft:2, color:C.muted }}>{item.unit}</span></div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:6, display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.muted, fontSize:11 }}>목표 달성률</span>
              <span style={{ color:h.color, fontSize:11, fontWeight:700 }}>{h.achieve}%</span>
            </div>
            <div style={{ background:C.dim, borderRadius:3, height:4 }}>
              <div style={{ width:`${Math.min(h.achieve,100)}%`, height:"100%", background:h.color, borderRadius:3 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              <span style={{ color:C.muted, fontSize:11 }}>담당 {h.manager || "-"}</span>
              <span style={{ color:h.roi > 200 ? C.green : h.roi > 100 ? C.yellow : C.red, fontSize:13, fontWeight:800 }}>ROI {h.roi}%</span>
            </div>
          </div>
        ))}

        {/* 빈 추가 카드 - 관리자만 */}
        {isAdmin && (
        <div onClick={openAdd} style={{ background:"transparent", border:`2px dashed ${C.border}`, borderRadius:20, padding:24, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, minHeight:200, transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.border = `2px dashed ${C.accent}60`; e.currentTarget.style.background = `${C.accent}05`; }}
          onMouseLeave={e => { e.currentTarget.style.border = `2px dashed ${C.border}`; e.currentTarget.style.background = "transparent"; }}>
          <div style={{ width:44, height:44, borderRadius:14, border:`2px dashed ${C.muted}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:C.muted }}>+</div>
          <div style={{ color:C.muted, fontSize:13, fontWeight:600 }}>새 병원 추가</div>
        </div>
        )}
      </div>
      </>)}

      {mainTab === "internal" && (
        <InternalDashboard hospitals={hospitals} loginName={loginName} onUpdateHospital={onUpdateHospital} globalSchedules={globalSchedules} saveGlobalSchedules={saveGlobalSchedules} />
      )}
    </div>
  );
}

// ─── 내부 작업 대시보드 ────────────────────────────────────────
function InternalDashboard({ hospitals, loginName, onUpdateHospital, globalSchedules, saveGlobalSchedules }) {
  const TEAM_LEADERS = [
    { name:"서보영", team:"디자인팀", color:"#F472B6" },
    { name:"김혜지", team:"CS팀",     color:"#34D399" },
    { name:"박다은", team:"마케팅팀", color:"#60A5FA" },
    { name:"홍동호", team:"기획팀",   color:"#FBBF24" },
  ];

  const [internalTab, setInternalTab] = useState("meetings");
  const [kanbanCards, setKanbanCards] = useState([]);
  // schedules는 globalSchedules prop 사용 (단일 소스)
  const schedules = globalSchedules || [];
  const saveSchedule = saveGlobalSchedules;
  const [savedMsg, setSavedMsg] = useState("");
  const [leaderTab, setLeaderTab] = useState("서보영");
  const [leaderColFilter, setLeaderColFilter] = useState("all");
  const [editLeaderCardId, setEditLeaderCardId] = useState(null);
  const [editLeaderForm, setEditLeaderForm] = useState({ text:"", hospital:"", col:"", comment:"", dueDate:"" });
  const [routines, setRoutines] = useState([]);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [routineForm, setRoutineForm] = useState({ title:"", assignee:"서보영", cycle:"weekly", memo:"" });
  const [confirmedLogs, setConfirmedLogs] = useState({});
  const [meetingLogs, setMeetingLogs] = useState([]);
  const [meetingSelMonth, setMeetingSelMonth] = useState("전체");
  const [internalLightbox, setInternalLightbox] = useState(null);
  const [expandedMeetings, setExpandedMeetings] = useState({});
  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  // 최초 로드
  useEffect(() => {
    const load = async () => {
      try {
        const [kb, rt, cf] = await Promise.all([
          supabase.from('kanban_data').select('*').eq('id', 1).single(),
          supabase.from('kanban_data').select('*').eq('id', 2).single(),
          supabase.from('kanban_data').select('*').eq('id', 3).single(), // confirmed logs
        ]);
        if (kb.data?.data) setKanbanCards(kb.data.data);
        if (rt.data?.data) setRoutines(rt.data.data);
        if (cf.data?.data) setConfirmedLogs(cf.data.data);
      } catch(e) {}
    };
    load();
  }, []);

  // 미팅 탭 진입 시 전체 병원 미팅 로그 취합
  useEffect(() => {
    if (internalTab !== "meetings") return;
    const loadMeetings = async () => {
      try {
        const allMeets = [];
        for (const h of hospitals) {
          const res = await supabase.from('meeting_data').select('*').eq('hospital_id', h.id).single();
          if (res.data?.data) {
            res.data.data.forEach(log => allMeets.push({ ...log, hospitalName:h.name, hospitalColor:h.color }));
          }
        }
        setMeetingLogs(allMeets.sort((a,b) => (b.date||"") > (a.date||"") ? 1 : -1));
      } catch(e) {}
    };
    loadMeetings();
  }, [internalTab]);

  const saveKanban = async (cards) => {
    try { await supabase.from('kanban_data').upsert({ id:1, data:cards }, { onConflict:'id' }); } catch(e) {}
  };
  const saveRoutines = async (rts) => {
    try { await supabase.from('kanban_data').upsert({ id:2, data:rts }, { onConflict:'id' }); } catch(e) {}
  };
  const saveConfirmed = async (confirmed) => {
    try { await supabase.from('kanban_data').upsert({ id:3, data:confirmed }, { onConflict:'id' }); } catch(e) {}
  };

  const toggleConfirm = (logId) => {
    const updated = { ...confirmedLogs, [logId]: !confirmedLogs[logId] };
    setConfirmedLogs(updated);
    saveConfirmed(updated);
  };

  // 전체 병원 미팅 로그 취합
  const KANBAN_COLS = [
    { id:"todo",    label:"📬 요청",    color:C.muted },
    { id:"doing",   label:"⚡ 진행 중", color:C.accent },
    { id:"hold",    label:"⏸ 보류",    color:C.orange },
    { id:"done",    label:"✅ 완료",    color:C.green },
  ];

  // 칸반 카드 추가
  const [newCardCol, setNewCardCol] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [newCardHospital, setNewCardHospital] = useState("");
  const [newCardAssignee, setNewCardAssignee] = useState("");
  const [newCardDueDate, setNewCardDueDate] = useState("");
  const [kanbanWeek, setKanbanWeek] = useState("all");
  const [editCardId, setEditCardId] = useState(null);
  const [editCardForm, setEditCardForm] = useState({ text:"", hospital:"", assignee:"", comment:"", dueDate:"" });

  const addCard = (colId) => {
    if (!newCardText.trim()) return;
    const cardId = Date.now();
    const card = { id:cardId, col:colId, text:newCardText.trim(), hospital:newCardHospital, assignee:newCardAssignee, dueDate:newCardDueDate, author:loginName, date:new Date().toLocaleDateString("ko-KR"), comment:"", fromSchedule: !!newCardDueDate, schedDate: newCardDueDate||"" };
    const updated = [...kanbanCards, card];
    setKanbanCards(updated); saveKanban(updated);

    // 마감일이 있으면 일정 관리에도 자동 등록
    if (newCardDueDate) {
      const color = getAssigneeColor(newCardAssignee) || C.accent2;
      const schedItem = { id:cardId+1, date:newCardDueDate, title:newCardText.trim(), hospital:newCardHospital||"", assignee:newCardAssignee||"", memo:"", color, source:"internal" };
      saveGlobalSchedules([...schedules, schedItem]);
    }

    setNewCardText(""); setNewCardHospital(""); setNewCardAssignee(""); setNewCardDueDate(""); setNewCardCol(null);
    toast(newCardDueDate ? "카드 추가 완료! 일정에도 등록됐어요." : "카드 추가 완료!");
  };

  const openEditCard = (card) => {
    setEditCardId(card.id);
    setEditCardForm({ text:card.text, hospital:card.hospital||"", assignee:card.assignee||"", comment:card.comment||"", dueDate:card.dueDate||"" });
  };

  const updateCard = () => {
    const updated = kanbanCards.map(c => c.id === editCardId ? { ...c, ...editCardForm } : c);
    setKanbanCards(updated); saveKanban(updated);
    // 일정에서 온 카드면 schedule_data도 업데이트
    const orig = kanbanCards.find(c => c.id === editCardId);
    if (orig?.fromSchedule && orig?.schedDate) {
      const updatedSched = schedules.map(s =>
        (s.date === orig.schedDate && (s.hospital === orig.hospital || !s.hospital))
          ? { ...s, title:editCardForm.text.replace(/^\[\d{4}-\d{2}-\d{2}\]\s*/,''), hospital:editCardForm.hospital, assignee:editCardForm.assignee, comment:editCardForm.comment }
          : s
      );
      setSchedules(updatedSched); saveSchedule(updatedSched);
    }
    setEditCardId(null); toast("수정 완료!");
  };

  const moveCard = (id, toCol) => {
    const updated = kanbanCards.map(c => c.id === id ? {...c, col:toCol} : c);
    setKanbanCards(updated); saveKanban(updated);
  };

  const deleteCard = (id) => {
    const updated = kanbanCards.filter(c => c.id !== id);
    setKanbanCards(updated); saveKanban(updated);
  };

  // 일정 관련
  const [selCalMonth, setSelCalMonth] = useState(new Date().toISOString().slice(0,7));
  const [showSchedForm, setShowSchedForm] = useState(false);
  const [schedForm, setSchedForm] = useState({ date:"", title:"", hospital:"", memo:"", color:C.accent, assignee:"", source:"internal" });
  const [deleteSchedConfirm, setDeleteSchedConfirm] = useState(null);
  const [calHospitalFilter, setCalHospitalFilter] = useState("전체");
  const [editSchedId, setEditSchedId] = useState(null);
  const [editSchedForm, setEditSchedForm] = useState({ date:"", title:"", hospital:"", memo:"", assignee:"" });

  const addSchedule = () => {
    if (!schedForm.date || !schedForm.title) return;
    const schedId = Date.now();
    const color = getAssigneeColor(schedForm.assignee) || C.accent;
    const newItem = { id:schedId, ...schedForm, color, source:"internal" };
    saveGlobalSchedules([...schedules, newItem]);
    // 칸반 할일에도 자동 추가
    const kanbanCard = { id:schedId+1, col:"todo", text:`[${schedForm.date}] ${schedForm.title}`, hospital:schedForm.hospital, assignee:schedForm.assignee||"", author:loginName, date:new Date().toLocaleDateString("ko-KR"), fromSchedule:true, schedDate:schedForm.date };
    const updatedKanban = [...kanbanCards, kanbanCard];
    setKanbanCards(updatedKanban); saveKanban(updatedKanban);
    setSchedForm({ date:"", title:"", hospital:"", memo:"", color:C.accent, assignee:"" });
    setShowSchedForm(false); toast("일정 추가 완료! 칸반 할일에도 추가됐어요.");
  };

  const updateInternalSchedule = () => {
    const color = getAssigneeColor(editSchedForm.assignee) || C.accent;
    const updated = schedules.map(s => s.id === editSchedId ? { ...s, ...editSchedForm, color } : s);
    saveGlobalSchedules(updated);
    // 칸반에서 연동된 카드도 같이 수정
    const sched = updated.find(s => s.id === editSchedId);
    const updatedKanban = kanbanCards.map(c =>
      c.fromSchedule && c.schedDate === sched?.date
        ? { ...c, text:`[${editSchedForm.date}] ${editSchedForm.title}`, hospital:editSchedForm.hospital, assignee:editSchedForm.assignee||c.assignee, schedDate:editSchedForm.date }
        : c
    );
    setKanbanCards(updatedKanban); saveKanban(updatedKanban);
    setEditSchedId(null); toast("일정 수정 완료! 칸반도 반영됐어요.");
  };

  const deleteSchedule = (id) => {
    const target = schedules.find(s => s.id === id);
    saveGlobalSchedules(schedules.filter(s => s.id !== id));
    // 연결된 칸반 카드도 삭제
    const updatedKanban = kanbanCards.filter(c =>
      !(c.fromSchedule && target && c.schedDate === target.date && (c.hospital === target.hospital || !target.hospital))
    );
    setKanbanCards(updatedKanban); saveKanban(updatedKanban);
    setDeleteSchedConfirm(null); toast("일정 삭제 완료! 칸반도 반영됐어요.");
  };  // 캘린더 계산
  const calDays = useMemo(() => {
    const [y, m] = selCalMonth.split('-').map(Number);
    const firstDay = new Date(y, m-1, 1).getDay();
    const lastDate = new Date(y, m, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    return { days, y, m };
  }, [selCalMonth]);

  const monthSchedules = schedules.filter(s => {
    if (!s.date?.startsWith(selCalMonth)) return false;
    if (calHospitalFilter === "전체") return true;
    if (calHospitalFilter === "내부") return !s.source || s.source === "internal";
    return s.hospital === calHospitalFilter;
  });


  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 라이트박스 모달 */}
      {internalLightbox && (
        <div onClick={() => setInternalLightbox(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out" }}>
          <img src={internalLightbox} alt="" style={{ maxWidth:"90vw", maxHeight:"90vh", borderRadius:12, objectFit:"contain" }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setInternalLightbox(null)} style={{ position:"absolute", top:20, right:24, background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:"50%", width:36, height:36, fontSize:20, cursor:"pointer" }}>×</button>
        </div>
      )}
      <div style={{ display:"flex", gap:8, borderBottom:`1px solid ${C.border}`, paddingBottom:0 }}>
        {[
          { id:"meetings", label:"📞 미팅 요약" },
          { id:"calendar", label:"📅 일정 관리" },
          { id:"kanban",   label:"🗂 칸반보드" },
          { id:"leaders",  label:"👥 팀장 업무" },
        ].map(t => (
          <button key={t.id} onClick={() => setInternalTab(t.id)} style={{
            background:"transparent", border:"none",
            borderBottom: internalTab===t.id ? `2px solid ${C.accent2}` : "2px solid transparent",
            color: internalTab===t.id ? C.accent2 : C.muted,
            padding:"8px 18px", fontSize:13, cursor:"pointer", fontWeight: internalTab===t.id ? 700 : 500,
            marginBottom:-1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* 미팅 요약 */}
      {internalTab === "meetings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* 월 필터 */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 월:</span>
            {["전체", ...Array.from(new Set(meetingLogs.map(l => l.date?.slice(0,7)).filter(Boolean))).sort().reverse()].map(m => (
              <button key={m} onClick={() => setMeetingSelMonth(m)} style={{
                background: meetingSelMonth===m ? `${C.accent2}20` : "transparent",
                border: `1px solid ${meetingSelMonth===m ? C.accent2 : C.border}`,
                color: meetingSelMonth===m ? C.accent2 : C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{m === "전체" ? "전체" : m.slice(5)+"월"}</button>
            ))}
          </div>

          {/* 로그 목록 */}
          {(() => {
            const filtered = meetingSelMonth === "전체"
              ? meetingLogs
              : meetingLogs.filter(l => l.date?.startsWith(meetingSelMonth));
            return filtered.length === 0
              ? <div style={{ background:C.surface, borderRadius:14, padding:32, textAlign:"center", color:C.muted }}>미팅 로그가 없어요</div>
              : filtered.map((log) => {
                const logKey = `${log.hospitalName}_${log.id}`;
                const isConfirmed = confirmedLogs[logKey];
                const isExpanded = expandedMeetings[logKey] === true;
                const doneCount = (log.actions||[]).filter(a=>a.done).length;
                const totalCount = (log.actions||[]).length;
                return (
                  <div key={logKey} style={{ background:C.surface, border:`1px solid ${isConfirmed ? C.green+"60" : C.border}`, borderRadius:14, overflow:"hidden", position:"relative" }}>
                    {/* 헤더 (항상 표시) */}
                    <div onClick={() => setExpandedMeetings(p=>({...p,[logKey]: p[logKey] === true ? false : true}))}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", cursor:"pointer", paddingRight:110 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:log.hospitalColor, flexShrink:0 }} />
                      <span style={{ color:log.hospitalColor, fontWeight:700, fontSize:13 }}>{log.hospitalName}</span>
                      <span style={{ color:C.muted, fontSize:12 }}>{log.date}</span>
                      <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{log.type}</span>
                      {log.attendees && <span style={{ color:C.muted, fontSize:11 }}>👤 {log.attendees}</span>}
                      {totalCount > 0 && (
                        <span style={{ background:doneCount===totalCount?`${C.green}15`:`${C.yellow}15`, color:doneCount===totalCount?C.green:C.yellow, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
                          {doneCount}/{totalCount} 완료
                        </span>
                      )}
                      <span style={{ color:C.muted, fontSize:11, marginLeft:"auto" }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                    {/* 확인 버튼 - 이벤트 전파 중단 */}
                    <button onClick={(e) => { e.stopPropagation(); toggleConfirm(logKey); }} style={{
                      position:"absolute", top:14, right:14,
                      background: isConfirmed ? `${C.green}20` : "transparent",
                      border: `1px solid ${isConfirmed ? C.green : C.dim}`,
                      color: isConfirmed ? C.green : C.muted,
                      borderRadius:7, padding:"3px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                    }}>{isConfirmed ? "✓ 확인됨" : "확인"}</button>

                    {/* 펼쳐진 내용 */}
                    {isExpanded && (
                      <div style={{ padding:"0 18px 14px", borderTop:`1px solid ${C.border}` }}>
                        <div style={{ color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", marginTop:10 }}>{log.summary}</div>
                        {log.images && log.images.length > 0 && (
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
                            {log.images.map((img, idx) => (
                              <img key={idx} src={img} alt="" onClick={() => setInternalLightbox(img)}
                                style={{ width:72, height:72, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}`, cursor:"zoom-in" }} />
                            ))}
                          </div>
                        )}
                        {log.memo && <div style={{ color:C.muted, fontSize:12, marginTop:8, padding:"6px 10px", background:"#F8FAFC", borderRadius:7 }}>💬 {log.memo}</div>}
                        {log.actions?.length > 0 && (
                          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:10 }}>
                            {log.actions.map((a,j) => {
                              const tm = TEAM_LEADERS_META.find(t => t.team === a.team);
                              return (
                                <div key={j} style={{ display:"flex", alignItems:"center", gap:6, background: a.done ? `${C.green}10` : "#F8FAFC", border:`1px solid ${a.done ? C.green : C.dim}`, borderRadius:7, padding:"5px 10px" }}>
                                  <span style={{ color: a.done ? C.green : C.muted, fontSize:12, flexShrink:0 }}>{a.done ? "✓" : "○"}</span>
                                  {a.team && <span style={{ background:`${tm?.color||C.accent2}20`, color:tm?.color||C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{a.team}</span>}
                                  <span style={{ color: a.done ? C.green : C.text, fontSize:12 }}>{a.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
          })()}
        </div>
      )}

      {/* 캘린더 */}
      {internalTab === "calendar" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* 병원 필터 */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>필터:</span>
            {["전체", "내부", ...hospitals.map(h=>h.name)].map(f => (
              <button key={f} onClick={() => setCalHospitalFilter(f)} style={{
                background: calHospitalFilter===f ? `${C.accent2}20` : "transparent",
                border: `1px solid ${calHospitalFilter===f ? C.accent2 : C.border}`,
                color: calHospitalFilter===f ? C.accent2 : C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{f}</button>
            ))}
          </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
          {/* 캘린더 */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={() => {
                  const [y,m] = selCalMonth.split('-').map(Number);
                  const prev = m===1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
                  setSelCalMonth(prev);
                }} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", color:C.muted, fontSize:13 }}>‹</button>
                <span style={{ color:C.text, fontWeight:700, fontSize:15 }}>{calDays.y}년 {calDays.m}월</span>
                <button onClick={() => {
                  const [y,m] = selCalMonth.split('-').map(Number);
                  const next = m===12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
                  setSelCalMonth(next);
                }} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", color:C.muted, fontSize:13 }}>›</button>
              </div>
              <button onClick={() => setShowSchedForm(!showSchedForm)} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>+ 일정 추가</button>
            </div>
            {/* 요일 헤더 */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
              {["일","월","화","수","목","금","토"].map((d,i) => (
                <div key={d} style={{ textAlign:"center", color: i===0?C.red:i===6?C.accent:C.muted, fontSize:11, fontWeight:600, padding:"4px 0" }}>{d}</div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
              {calDays.days.map((d, i) => {
                const dateStr = d ? `${selCalMonth}-${String(d).padStart(2,'0')}` : null;
                const daySchedules = dateStr ? schedules.filter(s => {
                  if (s.date !== dateStr) return false;
                  if (calHospitalFilter === "전체") return true;
                  if (calHospitalFilter === "내부") return !s.source || s.source === "internal";
                  return s.hospital === calHospitalFilter;
                }) : [];
                const isToday = dateStr === new Date().toISOString().slice(0,10);
                const dayOfWeek = i % 7;
                return (
                  <div key={i} style={{ minHeight:70, background: isToday ? `${C.accent}10` : "#F8FAFC", borderRadius:8, padding:4, border: isToday ? `1px solid ${C.accent}40` : `1px solid ${C.border}`, opacity: d ? 1 : 0 }}>
                    {d && <>
                      <div style={{ color: isToday ? C.accent : dayOfWeek===0 ? C.red : dayOfWeek===6 ? C.accent2 : C.text, fontSize:11, fontWeight: isToday ? 800 : 500, marginBottom:2 }}>{d}</div>
                      {daySchedules.map((s,j) => (
                        <div key={j} style={{ background:s.color||C.accent, borderRadius:3, padding:"1px 4px", fontSize:10, color:"#0F172A", fontWeight:600, marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{s.title}</div>
                      ))}
                    </>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 일정 목록 + 추가 폼 */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {showSchedForm && (
              <div style={{ background:C.surface, border:`1px solid ${C.accent2}30`, borderRadius:14, padding:18 }}>
                <div style={{ color:C.text, fontWeight:700, fontSize:13, marginBottom:12 }}>새 일정 추가</div>
                <div style={{ marginBottom:8 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>날짜</label>
                  <input type="date" value={schedForm.date} onChange={e=>setSchedForm(p=>({...p,date:e.target.value}))}
                    style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div style={{ marginBottom:8 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>제목</label>
                  <input type="text" value={schedForm.title} placeholder="일정 제목" onChange={e=>setSchedForm(p=>({...p,title:e.target.value}))}
                    style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div style={{ marginBottom:8 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>병원</label>
                  <select value={schedForm.hospital} onChange={e=>setSchedForm(p=>({...p,hospital:e.target.value}))}
                    style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                    <option value="">병원 선택 (선택)</option>
                    {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:8 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>담당자</label>
                  <select value={schedForm.assignee||""} onChange={e => {
                    const assignee = e.target.value;
                    const color = getAssigneeColor(assignee) || C.accent;
                    setSchedForm(p=>({...p, assignee, color}));
                  }} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                    <option value="">담당자 선택 (선택)</option>
                    {["대표님","서보영","김혜지","박다은","홍동호"].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {schedForm.assignee && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:getAssigneeColor(schedForm.assignee)||C.accent }} />
                      <span style={{ color:C.muted, fontSize:11 }}>색상 자동 적용</span>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label>
                  <input type="text" value={schedForm.memo} placeholder="메모 (선택)" onChange={e=>setSchedForm(p=>({...p,memo:e.target.value}))}
                    style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={addSchedule} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                  <button onClick={() => setShowSchedForm(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
                </div>
              </div>
            )}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
              <div style={{ color:C.text, fontWeight:700, fontSize:13, marginBottom:12 }}>{calDays.m}월 일정 ({monthSchedules.length}건)</div>
              {monthSchedules.length === 0
                ? <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>일정이 없어요</div>
                : monthSchedules.sort((a,b)=>a.date>b.date?1:-1).map(s => (
                  <div key={s.id} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                    {editSchedId === s.id ? (
                      /* 수정 폼 */
                      <div style={{ background:"#F8FAFC", borderRadius:10, padding:12, border:`1px solid ${C.accent2}40` }}>
                        <div style={{ color:C.accent2, fontSize:11, fontWeight:700, marginBottom:8 }}>✏️ 일정 수정</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                          <div>
                            <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>날짜</label>
                            <input type="date" value={editSchedForm.date} onChange={e=>setEditSchedForm(p=>({...p,date:e.target.value}))}
                              style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                          </div>
                          <div>
                            <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>제목</label>
                            <input type="text" value={editSchedForm.title} onChange={e=>setEditSchedForm(p=>({...p,title:e.target.value}))}
                              style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                          </div>
                        </div>
                        <select value={editSchedForm.hospital||""} onChange={e=>setEditSchedForm(p=>({...p,hospital:e.target.value}))}
                          style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                          <option value="">병원 선택 (선택)</option>
                          {hospitals.map(h=><option key={h.id} value={h.name}>{h.name}</option>)}
                        </select>
                        <select value={editSchedForm.assignee||""} onChange={e=>setEditSchedForm(p=>({...p,assignee:e.target.value}))}
                          style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                          <option value="">담당자 선택 (선택)</option>
                          {["대표님","서보영","김혜지","박다은","홍동호"].map(a=><option key={a} value={a}>{a}</option>)}
                        </select>
                        <input type="text" value={editSchedForm.memo||""} onChange={e=>setEditSchedForm(p=>({...p,memo:e.target.value}))}
                          placeholder="메모 (선택)" style={{ ...inputSt, marginBottom:10, padding:"5px 8px", fontSize:12 }} />
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={updateInternalSchedule} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                          <button onClick={() => setEditSchedId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                        </div>
                      </div>
                    ) : (
                      /* 보기 */
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:4, minHeight:50, borderRadius:2, background:s.color||C.accent, flexShrink:0, marginTop:2 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                            <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{s.title}</span>
                            {s.source === "hospital" && s.hospital
                              ? <span style={{ background:`${C.accent}15`, color:C.accent, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>🏥 {s.hospital}</span>
                              : <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>🏢 내부</span>
                            }
                            {s.assignee && <span style={{ background:`${C.green}15`, color:C.green, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>👤 {s.assignee}</span>}
                          </div>
                          <div style={{ color:C.muted, fontSize:11, marginBottom:s.memo?3:0 }}>📅 {s.date}</div>
                          {s.memo && <div style={{ color:C.text, fontSize:12, lineHeight:1.6, background:"#F8FAFC", borderRadius:6, padding:"6px 8px", marginTop:4 }}>💬 {s.memo}</div>}
                        </div>
                        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                          <button onClick={() => { setEditSchedId(s.id); setEditSchedForm({ date:s.date, title:s.title, hospital:s.hospital||"", memo:s.memo||"", assignee:s.assignee||"" }); }}
                            style={{ background:`${C.accent2}10`, border:`1px solid ${C.accent2}30`, color:C.accent2, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:600 }}>수정</button>
                          {deleteSchedConfirm === s.id
                            ? <button onClick={() => deleteSchedule(s.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>확인</button>
                            : <button onClick={() => setDeleteSchedConfirm(s.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 칸반보드 */}
      {internalTab === "kanban" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* 주간 필터 */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ color:C.muted, fontSize:12 }}>기간:</span>
            {[
              { id:"all", label:"전체" },
              { id:"this", label:"이번 주" },
              { id:"next", label:"다음 주" },
              { id:"overdue", label:"기한 초과" },
            ].map(w => (
              <button key={w.id} onClick={() => setKanbanWeek(w.id)} style={{
                background: kanbanWeek===w.id ? `${C.accent2}20` : "transparent",
                border: `1px solid ${kanbanWeek===w.id ? C.accent2 : C.border}`,
                color: kanbanWeek===w.id ? C.accent2 : C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{w.label}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {KANBAN_COLS.map(col => {
            const today = new Date(); today.setHours(0,0,0,0);
            const getWeekRange = (offset=0) => {
              const d = new Date(today);
              const day = d.getDay();
              const mon = new Date(d); mon.setDate(d.getDate() - day + 1 + offset*7);
              const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
              return [mon, sun];
            };
            const allCards = kanbanCards.filter(c => c.col === col.id);
            const cards = allCards.filter(c => {
              if (kanbanWeek === "all") return true;
              const dueDate = c.schedDate || c.dueDate;
              if (!dueDate) return kanbanWeek === "all";
              const d = new Date(dueDate); d.setHours(0,0,0,0);
              if (kanbanWeek === "this") { const [mon,sun] = getWeekRange(0); return d >= mon && d <= sun; }
              if (kanbanWeek === "next") { const [mon,sun] = getWeekRange(1); return d >= mon && d <= sun; }
              if (kanbanWeek === "overdue") return d < today && col.id !== "done";
              return true;
            });
            return (
              <div key={col.id} style={{ background:"#F8FAFC", border:`1px solid ${C.border}`, borderRadius:16, padding:16, minHeight:400 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ color:col.color, fontWeight:700, fontSize:14 }}>{col.label} <span style={{ color:C.muted, fontSize:12, fontWeight:400 }}>({cards.length})</span></div>
                  <button onClick={() => { setNewCardCol(newCardCol===col.id ? null : col.id); setNewCardText(""); setNewCardHospital(""); setNewCardAssignee(""); }} style={{ background:`${col.color}15`, border:`1px solid ${col.color}30`, color:col.color, borderRadius:7, padding:"3px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }}>+ 추가</button>
                </div>

                {newCardCol === col.id && (
                  <div style={{ background:C.surface, border:`1px solid ${col.color}30`, borderRadius:10, padding:12, marginBottom:12 }}>
                    <input value={newCardText} onChange={e=>setNewCardText(e.target.value)} placeholder="할 일 내용"
                      style={{ ...inputSt, marginBottom:6, padding:"6px 10px", fontSize:12 }} />
                    <select value={newCardHospital} onChange={e=>setNewCardHospital(e.target.value)}
                      style={{ ...inputSt, marginBottom:6, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                      <option value="">병원 선택 (선택)</option>
                      {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                    </select>
                    <select value={newCardAssignee} onChange={e=>setNewCardAssignee(e.target.value)}
                      style={{ ...inputSt, marginBottom:6, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                      <option value="">담당자 선택 (선택)</option>
                      <option value="대표님">대표님</option>
                      <option value="서보영">서보영</option>
                      <option value="김혜지">김혜지</option>
                      <option value="박다은">박다은</option>
                      <option value="홍동호">홍동호</option>
                    </select>
                    <div style={{ marginBottom:8 }}>
                      <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>마감일 (선택)</label>
                      <input type="date" value={newCardDueDate} onChange={e=>setNewCardDueDate(e.target.value)}
                        style={{ ...inputSt, padding:"5px 10px", fontSize:12 }} />
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => addCard(col.id)} style={{ background:`linear-gradient(135deg,${col.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>추가</button>
                      <button onClick={() => setNewCardCol(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer" }}>취소</button>
                    </div>
                  </div>
                )}

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {cards.map(card => (
                    <div key={card.id} style={{ background:C.surface, border:`1px solid ${editCardId===card.id ? C.accent2 : C.border}`, borderRadius:10, padding:12 }}>
                      {editCardId === card.id ? (
                        /* 수정 폼 */
                        <div>
                          <div style={{ color:C.accent2, fontSize:11, fontWeight:700, marginBottom:8 }}>✏️ 카드 수정</div>
                          <input value={editCardForm.text} onChange={e=>setEditCardForm(p=>({...p,text:e.target.value}))}
                            placeholder="내용" style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12 }} />
                          <select value={editCardForm.hospital} onChange={e=>setEditCardForm(p=>({...p,hospital:e.target.value}))}
                            style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                            <option value="">병원 선택</option>
                            {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                          </select>
                          <select value={editCardForm.assignee} onChange={e=>setEditCardForm(p=>({...p,assignee:e.target.value}))}
                            style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                            <option value="">담당자 선택</option>
                            <option value="대표님">대표님</option>
                            <option value="서보영">서보영</option>
                            <option value="김혜지">김혜지</option>
                            <option value="박다은">박다은</option>
                            <option value="홍동호">홍동호</option>
                          </select>
                          <div style={{ marginBottom:6 }}>
                            <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>마감일</label>
                            <input type="date" value={editCardForm.dueDate||""} onChange={e=>setEditCardForm(p=>({...p,dueDate:e.target.value}))}
                              style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                          </div>
                          <textarea value={editCardForm.comment} onChange={e=>setEditCardForm(p=>({...p,comment:e.target.value}))}
                            placeholder="코멘트 (메모)" rows={2}
                            style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12, resize:"vertical", lineHeight:1.5 }} />
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={updateCard} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                            <button onClick={() => setEditCardId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                          </div>
                        </div>
                      ) : (
                        /* 카드 보기 */
                        <>
                          {card.hospital && <div style={{ color:C.accent, fontSize:10, fontWeight:700, marginBottom:4 }}>🏥 {card.hospital}</div>}
                          <div style={{ color:C.text, fontSize:13, marginBottom:6, lineHeight:1.5 }}>{card.text}</div>
                          {card.comment && <div style={{ color:C.muted, fontSize:11, background:"#F8FAFC", borderRadius:6, padding:"4px 8px", marginBottom:6, lineHeight:1.5 }}>💬 {card.comment}</div>}
                          {/* 마감일 표시 */}
                          {card.dueDate && (() => {
                            const today = new Date(); today.setHours(0,0,0,0);
                            const due = new Date(card.dueDate);
                            const diff = Math.ceil((due - today) / (1000*60*60*24));
                            const isOverdue = diff < 0 && card.col !== "done";
                            const isSoon = diff >= 0 && diff <= 3 && card.col !== "done";
                            return (
                              <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:5 }}>
                                <span style={{ fontSize:10, color: isOverdue ? C.red : isSoon ? C.orange : C.muted, fontWeight: isOverdue||isSoon ? 700 : 400 }}>
                                  📅 {card.dueDate}
                                  {isOverdue && ` (${Math.abs(diff)}일 초과)`}
                                  {isSoon && diff === 0 && " (오늘 마감!)"}
                                  {isSoon && diff > 0 && ` (${diff}일 남음)`}
                                </span>
                              </div>
                            );
                          })()}
                          {card.schedDate && !card.dueDate && <div style={{ color:C.muted, fontSize:10, marginBottom:4 }}>📅 {card.schedDate}</div>}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                              {card.assignee && <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>👤 {card.assignee}</span>}
                              <span style={{ color:C.muted, fontSize:10 }}>{card.author}</span>
                            </div>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => openEditCard(card)} style={{ background:`${C.accent2}10`, border:`1px solid ${C.accent2}30`, color:C.accent2, borderRadius:5, padding:"2px 6px", fontSize:9, cursor:"pointer", fontWeight:600 }}>수정</button>
                              {KANBAN_COLS.filter(c => c.id !== col.id).map(c => (
                                <button key={c.id} onClick={() => moveCard(card.id, c.id)} style={{ background:`${c.color}15`, border:`1px solid ${c.color}30`, color:c.color, borderRadius:5, padding:"2px 6px", fontSize:9, cursor:"pointer", fontWeight:600 }}>→{c.label.slice(2)}</button>
                              ))}
                              <button onClick={() => deleteCard(card.id)} style={{ background:`${C.red}10`, border:`1px solid ${C.red}30`, color:C.red, borderRadius:5, padding:"2px 6px", fontSize:9, cursor:"pointer" }}>삭제</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* 팀장 업무 */}
      {internalTab === "leaders" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* 팀장 탭 */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {TEAM_LEADERS.map(l => (
              <button key={l.name} onClick={() => setLeaderTab(l.name)} style={{
                background: leaderTab===l.name ? `${l.color}20` : "transparent",
                border: `1px solid ${leaderTab===l.name ? l.color : C.border}`,
                color: leaderTab===l.name ? l.color : C.muted,
                borderRadius:10, padding:"8px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
              }}>{l.team} · {l.name}</button>
            ))}
          </div>

          {TEAM_LEADERS.filter(l => l.name === leaderTab).map(leader => {
            const allLeaderCards = kanbanCards.filter(c => c.assignee === leader.name);
            const leaderCards = leaderColFilter === "all" ? allLeaderCards : allLeaderCards.filter(c => c.col === leaderColFilter);
            const leaderRoutines = routines.filter(r => r.assignee === leader.name);
            return (
              <div key={leader.name} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* 상태 필터 */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ color:C.muted, fontSize:12 }}>상태:</span>
                  {[
                    { id:"all",   label:"전체" },
                    { id:"todo",  label:"📬 요청" },
                    { id:"doing", label:"⚡ 진행" },
                    { id:"hold",  label:"⏸ 보류" },
                    { id:"done",  label:"✅ 완료" },
                  ].map(f => (
                    <button key={f.id} onClick={() => setLeaderColFilter(f.id)} style={{
                      background: leaderColFilter===f.id ? `${leader.color}20` : "transparent",
                      border: `1px solid ${leaderColFilter===f.id ? leader.color : C.border}`,
                      color: leaderColFilter===f.id ? leader.color : C.muted,
                      borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
                    }}>{f.label} {f.id !== "all" ? `(${allLeaderCards.filter(c=>c.col===f.id).length})` : `(${allLeaderCards.length})`}</button>
                  ))}
                </div>
                {/* 현재 할일 (칸반 연동) */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div style={{ color:C.text, fontWeight:700, fontSize:14 }}>📋 담당 업무 <span style={{ color:C.muted, fontSize:12, fontWeight:400 }}>({leaderCards.length}건 · 칸반 연동)</span></div>
                  </div>
                  {leaderCards.length === 0
                    ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:"20px 0" }}>칸반보드에 담당 업무가 없어요</div>
                    : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {leaderCards.map(card => {
                          const col = KANBAN_COLS.find(c => c.id === card.col);
                          const isEditing = editLeaderCardId === card.id;
                          return (
                            <div key={card.id} style={{ background:"#F8FAFC", borderRadius:10, border:`1px solid ${isEditing ? leader.color : C.border}`, padding:"10px 14px" }}>
                              {isEditing ? (
                                <div>
                                  <div style={{ color:leader.color, fontSize:11, fontWeight:700, marginBottom:8 }}>✏️ 업무 수정</div>
                                  <input value={editLeaderForm.text} onChange={e=>setEditLeaderForm(p=>({...p,text:e.target.value}))}
                                    placeholder="업무 내용" style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12 }} />
                                  <select value={editLeaderForm.hospital} onChange={e=>setEditLeaderForm(p=>({...p,hospital:e.target.value}))}
                                    style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                                    <option value="">병원 선택</option>
                                    {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                                  </select>
                                  <select value={editLeaderForm.col} onChange={e=>setEditLeaderForm(p=>({...p,col:e.target.value}))}
                                    style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                                    {KANBAN_COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                  </select>
                                  <div style={{ marginBottom:6 }}>
                                    <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>마감일</label>
                                    <input type="date" value={editLeaderForm.dueDate||""} onChange={e=>setEditLeaderForm(p=>({...p,dueDate:e.target.value}))}
                                      style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                                  </div>
                                  <textarea value={editLeaderForm.comment} onChange={e=>setEditLeaderForm(p=>({...p,comment:e.target.value}))}
                                    placeholder="코멘트 (선택)" rows={2}
                                    style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12, resize:"vertical", lineHeight:1.5 }} />
                                  <div style={{ display:"flex", gap:6 }}>
                                    <button onClick={() => {
                                      const updated = kanbanCards.map(c => c.id === card.id ? { ...c, ...editLeaderForm } : c);
                                      setKanbanCards(updated); saveKanban(updated);
                                      setEditLeaderCardId(null); toast("수정 완료!");
                                    }} style={{ background:`linear-gradient(135deg,${leader.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                                    <button onClick={() => setEditLeaderCardId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                  <div style={{ width:8, height:8, borderRadius:"50%", background:col?.color||C.muted, flexShrink:0 }} />
                                  <div style={{ flex:1 }}>
                                    <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>{card.text}</div>
                                    {card.hospital && <div style={{ color:C.accent, fontSize:11, marginTop:2 }}>🏥 {card.hospital}</div>}
                                    {card.comment && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>💬 {card.comment}</div>}
                                    {card.dueDate && (() => {
                                      const today = new Date(); today.setHours(0,0,0,0);
                                      const due = new Date(card.dueDate);
                                      const diff = Math.ceil((due - today) / (1000*60*60*24));
                                      const isOverdue = diff < 0 && card.col !== "done";
                                      const isSoon = diff >= 0 && diff <= 3 && card.col !== "done";
                                      return <div style={{ fontSize:10, color:isOverdue?C.red:isSoon?C.orange:C.muted, fontWeight:isOverdue||isSoon?700:400, marginTop:2 }}>
                                        📅 {card.dueDate}{isOverdue?` (${Math.abs(diff)}일 초과)`:isSoon&&diff===0?" (오늘 마감!)":isSoon?` (${diff}일 남음)`:""}
                                      </div>;
                                    })()}
                                  </div>
                                  <span style={{ background:`${col?.color||C.muted}15`, color:col?.color||C.muted, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, flexShrink:0 }}>{col?.label||card.col}</span>
                                  <button onClick={() => {
                                    setEditLeaderCardId(card.id);
                                    setEditLeaderForm({ text:card.text, hospital:card.hospital||"", col:card.col, comment:card.comment||"", dueDate:card.dueDate||"" });
                                  }} style={{ background:`${leader.color}10`, border:`1px solid ${leader.color}30`, color:leader.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", fontWeight:600, flexShrink:0 }}>수정</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                  }
                </div>

                {/* 루틴 업무 */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div style={{ color:C.text, fontWeight:700, fontSize:14 }}>🔄 루틴 업무 <span style={{ color:C.muted, fontSize:12, fontWeight:400 }}>({leaderRoutines.length}건)</span></div>
                    <button onClick={() => { setRoutineForm({title:"", assignee:leader.name, cycle:"weekly", memo:""}); setShowRoutineForm(!showRoutineForm); }} style={{
                      background:`${leader.color}15`, border:`1px solid ${leader.color}40`, color:leader.color,
                      borderRadius:8, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
                    }}>+ 루틴 추가</button>
                  </div>

                  {/* 루틴 추가 폼 */}
                  {showRoutineForm && routineForm.assignee === leader.name && (
                    <div style={{ background:"#F8FAFC", border:`1px solid ${leader.color}30`, borderRadius:12, padding:16, marginBottom:14 }}>
                      <input value={routineForm.title} onChange={e=>setRoutineForm(p=>({...p,title:e.target.value}))}
                        placeholder="루틴 업무 내용" style={{ ...inputSt, marginBottom:8, padding:"6px 10px", fontSize:12 }} />
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        {["daily","weekly","monthly"].map(c => (
                          <button key={c} onClick={() => setRoutineForm(p=>({...p,cycle:c}))} style={{
                            background: routineForm.cycle===c ? `${leader.color}20` : "transparent",
                            border:`1px solid ${routineForm.cycle===c ? leader.color : C.border}`,
                            color: routineForm.cycle===c ? leader.color : C.muted,
                            borderRadius:7, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
                          }}>{c==="daily" ? "매일" : c==="weekly" ? "매주" : "매월"}</button>
                        ))}
                      </div>
                      <input value={routineForm.memo} onChange={e=>setRoutineForm(p=>({...p,memo:e.target.value}))}
                        placeholder="메모 (선택)" style={{ ...inputSt, marginBottom:10, padding:"6px 10px", fontSize:12 }} />
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => {
                          if (!routineForm.title.trim()) return;
                          const updated = [...routines, { id:Date.now(), ...routineForm }];
                          setRoutines(updated); saveRoutines(updated);
                          setShowRoutineForm(false); toast("루틴 추가 완료!");
                        }} style={{ background:`linear-gradient(135deg,${leader.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:7, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                        <button onClick={() => setShowRoutineForm(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
                      </div>
                    </div>
                  )}

                  {leaderRoutines.length === 0
                    ? <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:"16px 0" }}>루틴 업무가 없어요</div>
                    : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {leaderRoutines.map(r => (
                          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#F8FAFC", borderRadius:10, border:`1px solid ${C.border}` }}>
                            <span style={{ background:`${leader.color}15`, color:leader.color, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, flexShrink:0 }}>{r.cycle==="daily"?"매일":r.cycle==="weekly"?"매주":"매월"}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>{r.title}</div>
                              {r.memo && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{r.memo}</div>}
                            </div>
                            <button onClick={() => {
                              const updated = routines.filter(rt => rt.id !== r.id);
                              setRoutines(updated); saveRoutines(updated);
                            }} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", flexShrink:0 }}>삭제</button>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── 통합요약 + 상세성과 탭 입력 폼 ──────────────────────────
function PerformanceInputForm({ hospital, monthlyData, onSave, onClose }) {
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({length: 5}, (_, i) => String(currentYear - i));
  const MONTH_NUMS = ["01","02","03","04","05","06","07","08","09","10","11","12"];

  const lastEntry = monthlyData.length > 0 ? monthlyData[monthlyData.length-1].month : null;
  const initYear = lastEntry ? lastEntry.slice(0,4) : String(currentYear);
  const initMonth = lastEntry ? lastEntry.slice(5,7) : "01";

  const [selYear, setSelYear] = useState(initYear);
  const [selMonthNum, setSelMonthNum] = useState(initMonth);
  const [savedMsg, setSavedMsg] = useState("");

  const selMonthKey = `${selYear}-${selMonthNum}`;
  const existing = monthlyData.find(d => d.month === selMonthKey) || {};

  const [form, setForm] = useState({
    month: selMonthKey,
    inquiry: existing.inquiry || 0,
    consult: existing.consult || 0,
    reservation: existing.reservation || 0,
    visit: existing.visit || 0,
    firstVisit: existing.firstVisit || 0,
    payment: existing.payment || 0,
    firstPayment: existing.firstPayment || 0,
    newPatient: existing.newPatient || 0,
    revenue: existing.revenue || 0,
    marketingCost: existing.marketingCost || 0,
  });

  const handleYearChange = (y) => {
    setSelYear(y);
    const key = `${y}-${selMonthNum}`;
    const ex = monthlyData.find(d => d.month === key) || {};
    setForm({ month:key, inquiry:ex.inquiry||0, consult:ex.consult||0, reservation:ex.reservation||0, visit:ex.visit||0, payment:ex.payment||0, newPatient:ex.newPatient||0, revenue:ex.revenue||0, marketingCost:ex.marketingCost||0 });
  };

  const handleMonthChange = (mn) => {
    setSelMonthNum(mn);
    const key = `${selYear}-${mn}`;
    const ex = monthlyData.find(d => d.month === key) || {};
    setForm({ month:key, inquiry:ex.inquiry||0, consult:ex.consult||0, reservation:ex.reservation||0, visit:ex.visit||0, firstVisit:ex.firstVisit||0, payment:ex.payment||0, firstPayment:ex.firstPayment||0, newPatient:ex.newPatient||0, revenue:ex.revenue||0, marketingCost:ex.marketingCost||0 });
  };

  const handleSave = () => {
    const updated = monthlyData.filter(d => d.month !== form.month);
    const newData = [...updated, {
      ...form,
      inquiry:+form.inquiry, consult:+form.consult, reservation:+form.reservation,
      visit:+form.visit, firstVisit:+form.firstVisit||0, payment:+form.payment,
      firstPayment:+form.firstPayment||0, newPatient:+form.newPatient,
      revenue:+form.revenue, marketingCost:+form.marketingCost
    }].sort((a,b) => a.month > b.month ? 1 : -1);
    onSave(newData);
    setSavedMsg("저장 완료!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const fields = [
    { key:"inquiry",      label:"문의 수",    unit:"건" },
    { key:"consult",      label:"상담 수",    unit:"건" },
    { key:"reservation",  label:"예약 수",    unit:"건" },
    { key:"visit",        label:"내원 수",    unit:"명" },
    { key:"firstVisit",   label:"초진 내원",  unit:"명" },
    { key:"payment",      label:"결제 수",    unit:"건" },
    { key:"firstPayment", label:"초진 결제",  unit:"건" },
    { key:"newPatient",   label:"신환 수",    unit:"명" },
    { key:"revenue",      label:"매출",       unit:"만원" },
    { key:"marketingCost",label:"마케팅비",   unit:"만원" },
  ];

  return (
    <div style={{ background:"#F8FAFC", border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24, marginBottom:20 }}>
      <Toast msg={savedMsg} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ color:hospital.color, fontSize:14, fontWeight:700 }}>월별 성과 데이터 입력</div>
        <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>닫기</button>
      </div>

      {/* 연도 선택 */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <label style={{ color:C.muted, fontSize:12, flexShrink:0 }}>연도:</label>
        <select value={selYear} onChange={e => handleYearChange(e.target.value)}
          style={{ ...inputSt, width:100, padding:"6px 10px", fontSize:13, appearance:"none" }}>
          {YEARS.map(y => <option key={y} value={y} style={{background:"#F8FAFC"}}>{y}년</option>)}
        </select>
      </div>

      {/* 월 버튼 */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
        {MONTH_NUMS.map(mn => {
          const key = `${selYear}-${mn}`;
          const hasData = monthlyData.some(d => d.month === key);
          return (
            <button key={mn} onClick={() => handleMonthChange(mn)} style={{
              background: selMonthNum===mn ? `${hospital.color}25` : "transparent",
              border: `1px solid ${selMonthNum===mn ? hospital.color : hasData ? hospital.color+"50" : C.border}`,
              color: selMonthNum===mn ? hospital.color : hasData ? hospital.color : C.muted,
              borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:600, position:"relative",
            }}>
              {+mn}월
              {hasData && <span style={{ position:"absolute", top:2, right:2, width:5, height:5, borderRadius:"50%", background:hospital.color }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12, marginBottom:16 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>{f.label} ({f.unit})</label>
            <input type="number" value={form[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))} style={inputSt} />
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:9, padding:"10px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>
        저장하기
      </button>
    </div>
  );
}

// ─── 채널 분석 입력 폼 ────────────────────────────────────────
function ChannelInputForm({ hospital, channelData, onSave, onClose }) {
  const [data, setData] = useState(() => {
    const existing = [...channelData];
    FIXED_CHANNELS.forEach(ch => { if (!existing.find(c => c.channel === ch)) existing.push({channel:ch,inflow:0,inquiry:0,reservation:0,visit:0,payment:0,revenue:0,cost:0}); });
    return existing;
  });
  const [savedMsg, setSavedMsg] = useState("");

  const handleChange = (idx, key, val) => {
    const newData = [...data];
    newData[idx] = {...newData[idx], [key]: +val};
    setData(newData);
  };

  const handleSave = () => {
    onSave(data.filter(d => d.inflow > 0 || d.visit > 0 || d.payment > 0 || d.revenue > 0 || d.cost > 0));
    setSavedMsg("저장 완료!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const cols = ["inflow","visit","payment","revenue","cost"];
  const colLabels = ["유입","내원","결제","매출(만)","광고비(만)"];

  return (
    <div style={{ background:"#F8FAFC", border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24, marginBottom:20 }}>
      <Toast msg={savedMsg} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ color:hospital.color, fontSize:14, fontWeight:700 }}>채널별 성과 데이터 입력</div>
        <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>닫기</button>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr>
              <th style={{ color:C.muted, fontWeight:600, padding:"8px 10px", textAlign:"left", borderBottom:`1px solid ${C.dim}`, whiteSpace:"nowrap" }}>채널</th>
              {colLabels.map(l => <th key={l} style={{ color:C.muted, fontWeight:600, padding:"8px 10px", textAlign:"left", borderBottom:`1px solid ${C.dim}`, whiteSpace:"nowrap" }}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const meta = CHANNEL_META[row.channel] || { color: C.muted };
              return (
                <tr key={i} style={{ borderBottom:`1px solid ${C.dim}` }}>
                  <td style={{ padding:"6px 10px", color:meta.color, fontWeight:700, whiteSpace:"nowrap" }}>{row.channel}</td>
                  {cols.map(col => (
                    <td key={col} style={{ padding:"4px 6px" }}>
                      <input type="number" value={row[col]||0} onChange={e => handleChange(i, col, e.target.value)}
                        style={{...inputSt, padding:"5px 8px", width:90}} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:16 }}>
        <button onClick={handleSave} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:9, padding:"10px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>
          저장하기
        </button>
      </div>
    </div>
  );
}

// ─── 월간 체크리스트 탭 ──────────────────────────────────────

// ─── 마케팅 현황 탭 ───────────────────────────────────────────
function MarketingTab({ hospital, chData, initialContents, onUpdateHospital, isAdmin }) {
  const [contents, setContents] = useState(() => initialContents);
  const [selMonth, setSelMonth] = useState("전체");
  const [contentFilter, setContentFilter] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showInflowInput, setShowInflowInput] = useState(false);
  const [inflowForm, setInflowForm] = useState({});
  const [inflowMonth, setInflowMonth] = useState("");

  // 월 목록 (콘텐츠에서 추출 + 전체)
  const monthList = useMemo(() => {
    const contentMonths = [...new Set(contents.map(c => c.date?.slice(0,7)).filter(Boolean))];
    const rawCh = hospital.channelData || {};
    const inflowMonths = Array.isArray(rawCh) ? [] : Object.keys(rawCh);
    const months = [...new Set([...contentMonths, ...inflowMonths])].sort().reverse();
    return ["전체", ...months];
  }, [contents, hospital.channelData]);

  // 월 필터 적용된 콘텐츠
  const monthFiltered = useMemo(() =>
    selMonth === "전체" ? contents : contents.filter(c => c.date?.startsWith(selMonth))
  , [contents, selMonth]);

  const allChannels = ["전체", ...Array.from(new Set(monthFiltered.map(c => c.channel)))];

  const saveAll = (newContents) => {
    setContents(newContents);
    onUpdateHospital({...hospital, contentData: newContents});
    setSavedMsg("저장됐어요!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const handleAdd = () => {
    if (!form.title || !form.channel || !form.date) return;
    saveAll([{ ...form, id: Date.now(), views: +form.views||0, clicks: +form.clicks||0, rank: form.rank ? +form.rank : null }, ...contents]);
    setForm(EMPTY_FORM); setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ ...item, views: String(item.views), clicks: String(item.clicks), rank: item.rank ? String(item.rank) : "" });
    setShowForm(true);
  };

  const handleUpdate = () => {
    saveAll(contents.map(c => c.id === editId ? { ...form, id: editId, views: +form.views||0, clicks: +form.clicks||0, rank: form.rank ? +form.rank : null } : c));
    setForm(EMPTY_FORM); setShowForm(false); setEditId(null);
  };

  const handleSort = (key) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("desc"); }};

  const filtered = useMemo(() => {
    let list = contentFilter === "전체" ? monthFiltered : monthFiltered.filter(c => c.channel === contentFilter);
    list = [...list].sort((a,b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "date") { av = av || ""; bv = bv || ""; }
      else { av = +av || 0; bv = +bv || 0; }
      return sortDir === "desc" ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
    return list;
  }, [monthFiltered, contentFilter, sortKey, sortDir]);

  const channelStats = useMemo(() => {
    const activeChs = [...new Set(monthFiltered.map(c => c.channel))];
    return activeChs.map(ch => {
      const items = monthFiltered.filter(c => c.channel === ch);
      const meta = CHANNEL_META[ch] || { color: C.muted };
      const perf = chData.find(c => c.channel === ch) || {};
      const revenue = 0;
      return { channel: ch, color: meta.color, posts: items.length, totalClicks: items.reduce((s,i) => s+(i.clicks||0), 0), inflow: perf.inflow || 0, revenue };
    });
  }, [monthFiltered, chData]);

  const SortBtn = ({ k, label }) => (
    <span onClick={() => handleSort(k)} style={{ cursor:"pointer", userSelect:"none", color: sortKey===k ? hospital.color : C.muted }}>
      {label}{sortKey===k ? (sortDir==="desc" ? " ↓" : " ↑") : ""}
    </span>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <Toast msg={savedMsg} />

      {/* 월 선택 */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 월:</span>
        <button onClick={() => { setSelMonth("전체"); setContentFilter("전체"); }} style={{
          background: selMonth==="전체" ? `${hospital.color}25` : "transparent",
          border: `1px solid ${selMonth==="전체" ? hospital.color : C.border}`,
          color: selMonth==="전체" ? hospital.color : C.muted,
          borderRadius:8, padding:"4px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
        }}>전체</button>
        <YearMonthSelector
          availMonths={monthList.filter(m => m !== "전체")}
          selMonth={selMonth === "전체" ? "" : selMonth}
          setSelMonth={(m) => { setSelMonth(m); setContentFilter("전체"); }}
          color={hospital.color}
        />
      </div>

      {/* 채널별 유입 KPI */}
      {(() => {
        const inflowChannels = [
          { key:"네이버블로그", label:"블로그",  color:"#03C75A" },
          { key:"네이버카페",   label:"카페",    color:"#0088FE" },
          { key:"네이버플레이스",label:"플레이스",color:"#FF6B35" },
          { key:"인스타그램",   label:"인스타",  color:"#E1306C" },
          { key:"유튜브",       label:"유튜브",  color:"#FF0000" },
          { key:"검색광고",     label:"검색광고",color:"#A78BFA" },
        ];
        // 현재 표시할 월의 채널 데이터 (마케팅탭 자체 월 기준)
        const displayMonth = inflowMonth || (selMonth !== "전체" ? selMonth : new Date().toISOString().slice(0,7));
        const rawChAll = hospital.channelData || {};
        const curChData = Array.isArray(rawChAll) ? rawChAll : (rawChAll[displayMonth] || []);

        // 지난달 데이터
        const prevMonth = (() => {
          const [y, m] = displayMonth.split('-').map(Number);
          return m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
        })();
        const prevChData = Array.isArray(rawChAll) ? [] : (rawChAll[prevMonth] || []);

        // 작년 동월 데이터
        const lastYearMonth = (() => {
          const [y, m] = displayMonth.split('-');
          return `${+y-1}-${m}`;
        })();
        const lastYearChData = Array.isArray(rawChAll) ? [] : (rawChAll[lastYearMonth] || []);

        const total = inflowChannels.reduce((s, ch) => s + (curChData.find(c=>c.channel===ch.key)?.inflow||0), 0);

        // 최근 12개월 추이 데이터
        const rawChData = hospital.channelData || {};
        const months12 = Array.isArray(rawChData) ? [] :
          Object.keys(rawChData).sort().slice(-12).map(m => {
            const mData = rawChData[m] || [];
            const entry = { month: m.slice(5) + "월" };
            inflowChannels.forEach(ch => {
              entry[ch.label] = mData.find(c=>c.channel===ch.key)?.inflow || 0;
            });
            return entry;
          });

        const handleSaveInflow = () => {
          const curMonth = inflowMonth || (selMonth !== "전체" ? selMonth : new Date().toISOString().slice(0,7));
          const rawCh = hospital.channelData || {};
          const monthData = Array.isArray(rawCh) ? [] : (rawCh[curMonth] || []);
          const updated = [...monthData];
          inflowChannels.forEach(ch => {
            if (inflowForm[ch.key] !== undefined) {
              const idx = updated.findIndex(c => c.channel === ch.key);
              if (idx >= 0) updated[idx] = { ...updated[idx], inflow: +inflowForm[ch.key] || 0 };
              else updated.push({ channel: ch.key, inflow: +inflowForm[ch.key] || 0, visit:0, payment:0, revenue:0, cost:0 });
            }
          });
          const newChData = Array.isArray(rawCh) ? { [curMonth]: updated } : { ...rawCh, [curMonth]: updated };
          onUpdateHospital({ ...hospital, channelData: newChData });
          setShowInflowInput(false);
          setInflowForm({});
          setInflowMonth("");
        };

        return (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* 헤더 */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ color:C.muted, fontSize:12 }}>채널별 유입 현황</div>
              {isAdmin && (
                <button onClick={() => {
                  const m = selMonth !== "전체" ? selMonth : new Date().toISOString().slice(0,7);
                  setInflowMonth(m);
                  const rawCh = hospital.channelData || {};
                  const mData = Array.isArray(rawCh) ? [] : (rawCh[m] || []);
                  const init = {};
                  inflowChannels.forEach(ch => { init[ch.key] = mData.find(c=>c.channel===ch.key)?.inflow || 0; });
                  setInflowForm(init);
                  setShowInflowInput(!showInflowInput);
                }} style={{
                  background: showInflowInput ? `${hospital.color}20` : "transparent",
                  border:`1px solid ${showInflowInput ? hospital.color : C.border}`,
                  color: showInflowInput ? hospital.color : C.muted,
                  borderRadius:8, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
                }}>✏️ 유입 입력</button>
              )}
            </div>

            {showInflowInput && (
              <div style={{ background:`${hospital.color}06`, border:`1px solid ${hospital.color}25`, borderRadius:14, padding:18 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:700, marginBottom:14 }}>채널별 유입 수 입력</div>
                {/* 월 선택 */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <label style={{ color:C.muted, fontSize:12, flexShrink:0 }}>입력 월:</label>
                  <input type="month" value={inflowMonth || (selMonth !== "전체" ? selMonth : new Date().toISOString().slice(0,7))}
                    onChange={e => {
                      setInflowMonth(e.target.value);
                      // 해당 월 기존 데이터 로드
                      const rawCh = hospital.channelData || {};
                      const mData = Array.isArray(rawCh) ? [] : (rawCh[e.target.value] || []);
                      const init = {};
                      inflowChannels.forEach(ch => { init[ch.key] = mData.find(c=>c.channel===ch.key)?.inflow || 0; });
                      setInflowForm(init);
                    }}
                    style={{ ...inputSt, width:160, padding:"6px 10px", fontSize:13 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                  {inflowChannels.map(ch => (
                    <div key={ch.key} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:ch.color, flexShrink:0 }} />
                      <label style={{ color:C.muted, fontSize:12, width:60, flexShrink:0 }}>{ch.label}</label>
                      <input type="number" value={inflowForm[ch.key] ?? ""} onChange={e => setInflowForm(prev=>({...prev,[ch.key]:e.target.value}))}
                        placeholder="0" style={{ ...inputSt, flex:1, padding:"6px 10px", fontSize:12 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleSaveInflow} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"8px 20px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                  <button onClick={() => { setShowInflowInput(false); setInflowForm({}); setInflowMonth(""); }} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>취소</button>
                </div>
              </div>
            )}

            {/* KPI 카드 */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
              {inflowChannels.map(ch => {
                const val = curChData.find(c=>c.channel===ch.key)?.inflow || 0;
                const prev = prevChData.find(c=>c.channel===ch.key)?.inflow || 0;
                const lastYear = lastYearChData.find(c=>c.channel===ch.key)?.inflow || 0;
                const diffPrev = prev > 0 ? val - prev : null;
                const diffYear = lastYear > 0 ? val - lastYear : null;
                const pct = total > 0 ? Math.round((val/total)*100) : 0;
                return (
                  <div key={ch.key} style={{ background:C.surface, border:`1px solid ${ch.color}25`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{ch.label} 유입</div>
                    <div style={{ color:ch.color, fontSize:20, fontWeight:900 }}>{val.toLocaleString()}<span style={{ fontSize:11, fontWeight:400, marginLeft:2 }}>명</span></div>
                    <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>{total > 0 ? `${pct}%` : "-"}</div>
                    {/* 지난달 대비 */}
                    <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${C.border}`, fontSize:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ color:C.muted }}>전월 대비</span>
                        {diffPrev === null
                          ? <span style={{ color:C.muted }}>-</span>
                          : <span style={{ color: diffPrev > 0 ? C.green : diffPrev < 0 ? C.red : C.muted, fontWeight:700 }}>
                              {diffPrev > 0 ? `▲ ${diffPrev.toLocaleString()}` : diffPrev < 0 ? `▼ ${Math.abs(diffPrev).toLocaleString()}` : "— 동일"}
                            </span>
                        }
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ color:C.muted }}>전년 동월</span>
                        {diffYear === null
                          ? <span style={{ color:C.muted }}>-</span>
                          : <span style={{ color: diffYear > 0 ? C.green : diffYear < 0 ? C.red : C.muted, fontWeight:700 }}>
                              {diffYear > 0 ? `▲ ${diffYear.toLocaleString()}` : diffYear < 0 ? `▼ ${Math.abs(diffYear).toLocaleString()}` : "— 동일"}
                            </span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 12개월 추이 그래프 */}
            {months12.length > 0 && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 22px" }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:700, marginBottom:16 }}>채널별 유입 월간 추이 (최근 {months12.length}개월)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={months12} margin={{ top:5, right:20, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <YAxis stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <TT />
                    <Legend wrapperStyle={{ color:C.muted, fontSize:11 }} />
                    {inflowChannels.map(ch => (
                      <Line key={ch.key} type="monotone" dataKey={ch.label} stroke={ch.color} strokeWidth={2} dot={{ r:3, fill:ch.color }} activeDot={{ r:5 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })()}

      {/* 채널별 요약 카드 */}
      {channelStats.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {channelStats.map((ch, i) => (
            <div key={i} style={{
              background:C.surface, border:`1px solid ${contentFilter===ch.channel ? ch.color : ch.color+"30"}`,
              borderRadius:12, padding:"8px 16px", cursor:"pointer",
              boxShadow: contentFilter===ch.channel ? `0 0 0 2px ${ch.color}40` : "none",
              display:"flex", alignItems:"center", gap:10,
            }} onClick={() => setContentFilter(prev => prev === ch.channel ? "전체" : ch.channel)}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:ch.color, flexShrink:0 }} />
              <div style={{ color:ch.color, fontWeight:700, fontSize:13 }}>{ch.channel}</div>
              <div style={{ color:C.muted, fontSize:12 }}>발행 <span style={{ color:C.text, fontWeight:700 }}>{ch.posts}건</span></div>
            </div>
          ))}
        </div>
      )}

      {/* 콘텐츠 목록 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ color:C.text, fontSize:14, fontWeight:700 }}>
              콘텐츠 관리 ({filtered.length}건{selMonth !== "전체" ? ` · ${+selMonth.slice(5)}월` : ` · 전체 ${contents.length}건`})
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>API 연동 시 클릭수·순위 자동 업데이트 예정</div>
          </div>
          <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(!showForm); }} style={{
            background: showForm && !editId ? "rgba(248,113,113,0.15)" : `linear-gradient(135deg,${hospital.color},${C.accent2})`,
            border: showForm && !editId ? `1px solid ${C.red}` : "none",
            color: showForm && !editId ? C.red : "#0F172A",
            borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
          }}>{showForm && !editId ? "닫기" : editId ? "취소" : "+ 콘텐츠 추가"}</button>
        </div>

        {showForm && (
          <div style={{ background:"#F8FAFC", border:`1px solid ${hospital.color}30`, borderRadius:14, padding:20, marginBottom:20 }}>
            <div style={{ color:hospital.color, fontSize:13, fontWeight:700, marginBottom:14 }}>{editId ? "콘텐츠 수정" : "새 콘텐츠 추가"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))", gap:12, marginBottom:12 }}>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>채널 *</label>
                <select value={form.channel} onChange={e=>setForm(prev => ({...prev, channel:e.target.value}))} style={{...inputSt,appearance:"none"}}>
                  {CHANNEL_OPTIONS.map(o=><option key={o} style={{background:"#F8FAFC"}}>{o}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>발행일 *</label>
                <input type="date" value={form.date} onChange={e=>setForm(prev => ({...prev, date:e.target.value}))} style={inputSt}/>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>상태</label>
                <select value={form.status} onChange={e=>setForm(prev => ({...prev, status:e.target.value}))} style={{...inputSt,appearance:"none"}}>
                  {STATUS_OPTIONS.map(o=><option key={o} style={{background:"#F8FAFC"}}>{o}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>노출 순위</label>
                <input type="number" placeholder="2" value={form.rank} onChange={e=>setForm(prev => ({...prev, rank:e.target.value}))} style={inputSt}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
                <div onClick={()=>setForm(prev => ({...prev, topExposed:!form.topExposed}))} style={{ width:40, height:22, borderRadius:11, background:form.topExposed?C.green:C.dim, cursor:"pointer", position:"relative" }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#E2E8F0", position:"absolute", top:2, left:form.topExposed?20:2, transition:"left 0.2s" }}/>
                </div>
                <label style={{ color:C.muted, fontSize:12, cursor:"pointer" }} onClick={()=>setForm(prev => ({...prev, topExposed:!form.topExposed}))}>상위노출</label>
              </div>
            </div>
            <div style={{ marginBottom:12 }}><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>콘텐츠 제목 *</label>
              <KInput type="text" placeholder="예: 강남 눈매교정 후기" value={form.title} onChange={e=>setForm(prev => ({...prev, title:e.target.value}))} style={inputSt}/>
            </div>
            <div style={{ marginBottom:12 }}><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>URL</label>
              <input type="text" placeholder="https://..." value={form.url} onChange={e=>setForm(prev => ({...prev, url:e.target.value}))} style={inputSt}/>
            </div>
            <div style={{ marginBottom:16 }}><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>메모</label>
              <KInput type="text" placeholder="특이사항 등" value={form.memo} onChange={e=>setForm(prev => ({...prev, memo:e.target.value}))} style={inputSt}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={editId ? handleUpdate : handleAdd} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:10, padding:"9px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>{editId ? "수정 완료" : "저장하기"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);setForm(EMPTY_FORM);}} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>취소</button>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          {allChannels.map(ch => {
            const meta = CHANNEL_META[ch] || {};
            const isActive = contentFilter === ch;
            return (
              <button key={ch} onClick={()=>setContentFilter(ch)} style={{
                background: isActive ? `${meta.color||hospital.color}25` : "transparent",
                border: `1px solid ${isActive ? (meta.color||hospital.color) : C.border}`,
                color: isActive ? (meta.color||hospital.color) : C.muted,
                borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{ch}</button>
            );
          })}
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr>
                {[["channel","채널"],["title","제목"],["date","발행일"],["rank","순위"],["topExposed","상위노출"],["status","상태"],["","관리"]].map(([k,label])=>(
                  <th key={label} style={{ color:C.muted, fontWeight:600, padding:"8px 12px", textAlign:"left", borderBottom:`1px solid ${C.dim}`, whiteSpace:"nowrap" }}>
                    {k ? <SortBtn k={k} label={label} /> : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const meta = CHANNEL_META[item.channel] || { color: C.muted };
                return (
                  <tr key={item.id} style={{ borderBottom:`1px solid ${C.dim}` }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${hospital.color}08`}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 12px" }}><span style={{ color:meta.color, fontWeight:700, fontSize:11 }}>{item.channel}</span></td>
                    <td style={{ padding:"10px 12px", color:C.text, maxWidth:240 }}>
                      <div style={{ fontWeight:600 }}>{item.title}</div>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color:C.accent, fontSize:10 }}>링크</a>}
                      {item.memo && <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{item.memo}</div>}
                    </td>
                    <td style={{ padding:"10px 12px", color:C.muted, whiteSpace:"nowrap" }}>{item.date}</td>
                    <td style={{ padding:"10px 12px" }}>{item.rank ? <Badge color={item.rank<=3?C.green:item.rank<=10?C.yellow:C.muted}>{item.rank}위</Badge> : <span style={{color:C.muted}}>-</span>}</td>
                    <td style={{ padding:"10px 12px" }}><Badge color={item.topExposed?C.green:C.dim}>{item.topExposed?"상위":"–"}</Badge></td>
                    <td style={{ padding:"10px 12px" }}><Badge color={hospital.color}>{item.status}</Badge></td>
                    <td style={{ padding:"10px 12px", whiteSpace:"nowrap" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>handleEdit(item)} style={{ background:`${hospital.color}20`, border:`1px solid ${hospital.color}40`, color:hospital.color, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:600 }}>수정</button>
                        {deleteConfirm === item.id ? (
                          <button onClick={()=>{saveAll(contents.filter(c=>c.id!==item.id));setDeleteConfirm(null);}} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>확인</button>
                        ) : (
                          <button onClick={()=>setDeleteConfirm(item.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding:"32px", textAlign:"center", color:C.muted }}>콘텐츠가 없어요. 추가 버튼을 눌러 등록해 보세요.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", gap:24, marginTop:16, paddingTop:16, borderTop:`1px solid ${C.dim}`, flexWrap:"wrap" }}>
          {[
            { label:"총 콘텐츠", value:`${filtered.length}건`, color:C.accent },
            { label:"상위노출", value:`${filtered.filter(i=>i.topExposed).length}건`, color:C.yellow },
            { label:"3위 이내", value:`${filtered.filter(i=>i.rank&&i.rank<=3).length}건`, color:C.orange },
          ].map((item,i)=>(
            <div key={i}><span style={{ color:C.muted, fontSize:11 }}>{item.label} </span><span style={{ color:item.color, fontSize:13, fontWeight:800 }}>{item.value}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 환자 유입 탭 ─────────────────────────────────────────────
const AGE_GROUPS = ["10대 이하","20대","30대","40대","50대","60대 이상"];
const INFLOW_CHANNELS = ["네이버블로그","인스타그램","유튜브","검색광고","메타광고","지인소개","네이버플레이스","홈페이지","기타"];
const AGE_COLORS = ["#38BDF8","#34D399","#FBBF24","#F472B6","#A78BFA","#FB923C"];

function PatientTab({ hospital }) {
  const [records, setRecords] = useState([]);
  const [selMonth, setSelMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [formData, setFormData] = useState(null);
  const [newTreatment, setNewTreatment] = useState({item:"",count:""});

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2200); };

  // Supabase 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('patient_data').select('*').eq('hospital_id', hospital.id).single();
        if (data?.data?.length > 0) {
          setRecords(data.data);
          const latest = [...data.data].sort((a,b)=>b.month>a.month?1:-1)[0]?.month;
          if (latest) setSelMonth(latest);
        }
      } catch(e) {}
    };
    load();
  }, [hospital.id]);

  const saveToSupabase = async (newRecords) => {
    try {
      await supabase.from('patient_data').upsert({ hospital_id: hospital.id, data: newRecords }, { onConflict: 'hospital_id' });
    } catch(e) { console.error('환자유입 저장 실패:', e); }
  };
  const rec = records.find(r=>r.month===selMonth)||null;
  const availMonths = [...records.map(r=>r.month)].sort().reverse();
  const trendData = [...records].sort((a,b)=>a.month>b.month?1:-1).map(r=>({ month:r.month.slice(5)+"월", 신환:r.newPatient, 구환:r.returnPatient, 목표:r.targetNew }));
  const totalNew = rec?.newPatient||0, totalReturn = rec?.returnPatient||0;
  const totalPatient = totalNew+totalReturn;
  const achieveRate = rec ? Math.round((rec.newPatient/rec.targetNew)*100) : 0;
  const totalFemale = rec ? rec.ageData.reduce((s,a)=>s+a.female,0) : 0;
  const totalMale = rec ? rec.ageData.reduce((s,a)=>s+a.male,0) : 0;
  const maxChannel = rec ? Math.max(...rec.channelData.map(c=>c.count),1) : 1;

  const openAdd = () => {
    setFormData({ month:"", newPatient:0, returnPatient:0, targetNew:hospital.target_patients||100,
      ageData:AGE_GROUPS.map(g=>({group:g,female:0,male:0})),
      channelData:INFLOW_CHANNELS.map(c=>({channel:c,count:0})),
      treatmentData:[],
    });
    setEditMode(false); setShowForm(true);
  };

  const openEdit = () => { setFormData(JSON.parse(JSON.stringify(rec))); setEditMode(true); setShowForm(true); };

  const handleSave = () => {
    if (!formData.month) return;
    const exists = records.find(r=>r.month===formData.month);
    const newRecords = exists
      ? records.map(r=>r.month===formData.month?formData:r)
      : [...records, formData].sort((a,b)=>b.month>a.month?1:-1);
    setRecords(newRecords);
    saveToSupabase(newRecords);
    logActivity("환자유입 저장", hospital.name, formData.month);
    setSelMonth(formData.month); setShowForm(false); toast("저장 완료!");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <Toast msg={savedMsg}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:C.muted,fontSize:13}}>조회 월:</span>
          <YearMonthSelector availMonths={availMonths} selMonth={selMonth} setSelMonth={setSelMonth} color={hospital.color} />
        </div>
        <div style={{display:"flex",gap:8}}>
          {rec && <button onClick={openEdit} style={{background:`${hospital.color}20`,border:`1px solid ${hospital.color}50`,color:hospital.color,borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>수정</button>}
          <button onClick={openAdd} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 월 데이터 추가</button>
        </div>
      </div>

      {showForm && formData && (
        <div style={{background:"#F8FAFC",border:`1px solid ${hospital.color}30`,borderRadius:16,padding:24}}>
          <div style={{color:hospital.color,fontSize:14,fontWeight:700,marginBottom:18}}>{editMode?"데이터 수정":"월 데이터 입력"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={formData.month} onChange={e=>setFormData({...formData,month:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>신환 수</label><input type="number" value={formData.newPatient} onChange={e=>setFormData({...formData,newPatient:+e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>구환 수</label><input type="number" value={formData.returnPatient} onChange={e=>setFormData({...formData,returnPatient:+e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>신환 목표</label><input type="number" value={formData.targetNew} onChange={e=>setFormData({...formData,targetNew:+e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:10}}>연령대별 / 성별</div>
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",fontSize:12,width:"100%"}}>
                <thead><tr>{["연령대","여성","남성"].map(h=><th key={h} style={{color:C.muted,fontWeight:600,padding:"6px 12px",textAlign:"left",borderBottom:`1px solid ${C.dim}`}}>{h}</th>)}</tr></thead>
                <tbody>{formData.ageData.map((row,i)=>(
                  <tr key={i}>
                    <td style={{padding:"6px 12px",color:C.text}}>{row.group}</td>
                    <td style={{padding:"6px 12px"}}><input type="number" value={row.female} onChange={e=>{const d=[...formData.ageData];d[i]={...d[i],female:+e.target.value};setFormData({...formData,ageData:d});}} style={{...inputSt,width:80,padding:"5px 8px"}}/></td>
                    <td style={{padding:"6px 12px"}}><input type="number" value={row.male} onChange={e=>{const d=[...formData.ageData];d[i]={...d[i],male:+e.target.value};setFormData({...formData,ageData:d});}} style={{...inputSt,width:80,padding:"5px 8px"}}/></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:10}}>유입 채널별 환자 수</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
              {formData.channelData.map((row,i)=>(
                <div key={i}>
                  <label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>{row.channel}</label>
                  <input type="number" value={row.count} onChange={e=>{const d=[...formData.channelData];d[i]={...d[i],count:+e.target.value};setFormData({...formData,channelData:d});}} style={{...inputSt,padding:"6px 10px"}}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:10}}>시술/진료 항목별</div>
            <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <KInput type="text" placeholder="시술명" value={newTreatment.item} onChange={e=>setNewTreatment({...newTreatment,item:e.target.value})} style={{...inputSt,width:180}}/>
              <input type="number" placeholder="인원" value={newTreatment.count} onChange={e=>setNewTreatment({...newTreatment,count:e.target.value})} style={{...inputSt,width:100}}/>
              <button onClick={()=>{if(!newTreatment.item)return;setFormData({...formData,treatmentData:[...formData.treatmentData,{item:newTreatment.item,count:+newTreatment.count}]});setNewTreatment({item:"",count:""}); }} style={{background:`${hospital.color}20`,border:`1px solid ${hospital.color}`,color:hospital.color,borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>추가</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {formData.treatmentData.map((t,i)=>(
                <div key={i} style={{background:`${hospital.color}15`,border:`1px solid ${hospital.color}30`,borderRadius:8,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:C.text,fontSize:12}}>{t.item} {t.count}명</span>
                  <span onClick={()=>{const d=[...formData.treatmentData];d.splice(i,1);setFormData({...formData,treatmentData:d});}} style={{color:C.red,cursor:"pointer",fontWeight:700}}>x</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSave} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"10px 24px",fontSize:13,cursor:"pointer",fontWeight:700}}>저장하기</button>
            <button onClick={()=>setShowForm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {!rec && !showForm && (
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:48,textAlign:"center"}}>
          <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:8}}>이 달의 환자 데이터가 없어요</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:20}}>월 데이터 추가 버튼을 눌러 입력해 보세요</div>
          <button onClick={openAdd} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:10,padding:"10px 24px",fontSize:13,cursor:"pointer",fontWeight:700}}>데이터 입력하기</button>
        </div>
      )}

      {rec && (<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          <KPICard label="신환 수" value={totalNew} unit="명" sub={`목표 ${rec.targetNew}명`} color={hospital.color}/>
          <KPICard label="구환 수" value={totalReturn} unit="명" sub={`재내원율 ${totalPatient>0?Math.round((totalReturn/totalPatient)*100):0}%`} color={C.accent2}/>
          <KPICard label="총 내원 환자" value={totalPatient} unit="명" color={C.green}/>
          <KPICard label="신환 목표 달성률" value={achieveRate} unit="%" color={achieveRate>=100?C.green:achieveRate>=70?C.yellow:C.red}/>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <SectionTitle>신환 목표 달성 현황</SectionTitle>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{color:C.muted,fontSize:13}}>달성률</span>
            <span style={{color:achieveRate>=100?C.green:hospital.color,fontWeight:800,fontSize:15}}>{achieveRate}%</span>
          </div>
          <div style={{background:C.dim,borderRadius:8,height:22,overflow:"hidden"}}>
            <div style={{width:`${Math.min(achieveRate,100)}%`,height:"100%",background:`linear-gradient(90deg,${hospital.color},${C.accent2})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:12}}>
              {achieveRate>10&&<span style={{color:"#0F172A",fontSize:12,fontWeight:700}}>{totalNew}명</span>}
            </div>
          </div>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <SectionTitle>환자 유입 추이</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
              <XAxis dataKey="month" stroke={C.muted} tick={{fill:"#64748B",fontSize:11}}/>
              <YAxis stroke={C.muted} tick={{fill:"#64748B",fontSize:11}}/>
              <TT/><Legend wrapperStyle={{color:C.muted,fontSize:12}}/>
              <Line type="monotone" dataKey="신환" stroke={hospital.color} strokeWidth={2.5} dot={{r:4,fill:hospital.color}}/>
              <Line type="monotone" dataKey="구환" stroke={C.accent2} strokeWidth={2} dot={{r:4,fill:C.accent2}}/>
              <Line type="monotone" dataKey="목표" stroke="#E2E8F0" strokeWidth={1.5} strokeDasharray="5 5" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
            <SectionTitle>연령대 · 성별 분포</SectionTitle>
            <div style={{display:"flex",gap:16,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:"#F472B6"}}/><span style={{color:C.muted,fontSize:12}}>여성 {totalFemale}명</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:"#38BDF8"}}/><span style={{color:C.muted,fontSize:12}}>남성 {totalMale}명</span></div>
            </div>
            {rec.ageData.map((row,i)=>{
              const total=row.female+row.male;
              const maxAge=Math.max(...rec.ageData.map(a=>a.female+a.male),1);
              return (<div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.text,fontSize:12,fontWeight:600}}>{row.group}</span>
                  <span style={{color:C.muted,fontSize:12}}>{total}명</span>
                </div>
                <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",background:C.dim}}>
                  <div style={{width:`${(row.female/maxAge)*100}%`,background:"#F472B6"}}/>
                  <div style={{width:`${(row.male/maxAge)*100}%`,background:"#38BDF8"}}/>
                </div>
              </div>);
            })}
          </div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
            <SectionTitle>채널별 유입 현황</SectionTitle>
            {[...rec.channelData].sort((a,b)=>b.count-a.count).filter(c=>c.count>0).map((c,i)=>{
              const meta=CHANNEL_META[c.channel]||{color:C.muted};
              return (<div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.text,fontSize:12}}>{c.channel}</span>
                  <span style={{color:meta.color,fontSize:12,fontWeight:700}}>{c.count}명</span>
                </div>
                <div style={{background:C.dim,borderRadius:4,height:7}}>
                  <div style={{width:`${(c.count/maxChannel)*100}%`,height:"100%",background:meta.color,borderRadius:4}}/>
                </div>
              </div>);
            })}
          </div>
        </div>
        {rec.treatmentData && rec.treatmentData.length > 0 && (
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
            <SectionTitle>시술 · 진료 항목별 현황</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...rec.treatmentData].sort((a,b)=>b.count-a.count)} margin={{top:5,right:20,left:0,bottom:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                <XAxis dataKey="item" stroke={C.muted} tick={{fill:"#64748B",fontSize:11,angle:-15,textAnchor:"end"}}/>
                <YAxis stroke={C.muted} tick={{fill:"#64748B",fontSize:11}}/>
                <TT/>
                <Bar dataKey="count" name="환자 수" radius={[6,6,0,0]}>
                  {rec.treatmentData.map((_,i)=><Cell key={i} fill={AGE_COLORS[i%AGE_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </>)}
    </div>
  );
}

// ─── 전역 활동 로그 함수 ──────────────────────────────────────
const logActivity = async (action, hospitalName = "", detail = "") => {
  try {
    const actor = sessionStorage.getItem("daall_actor") || "알 수 없음";
    await supabase.from('activity_log').insert({ actor, hospital_name: hospitalName, action, detail });
  } catch(e) {}
};

function KeywordRankTab({ hospital, isAdmin }) {
  const [keywords, setKeywords] = useState([]);
  const [selMonth, setSelMonth] = useState("");
  const [selChannel, setSelChannel] = useState("전체");
  const [sortKey, setSortKey] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); };

  // Supabase에서 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('keyword_data').select('*').eq('hospital_id', hospital.id).single();
        if (data?.data?.length > 0) {
          setKeywords(data.data);
          const latest = [...new Set(data.data.map(k => k.month).filter(Boolean))].sort().reverse()[0];
          if (latest) setSelMonth(latest);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [hospital.id]);

  // Supabase에 저장
  const saveKeywords = async (newKeywords) => {
    try {
      await supabase.from('keyword_data').upsert({ hospital_id: hospital.id, data: newKeywords }, { onConflict: 'hospital_id' });
    } catch (e) { console.error('키워드 저장 실패:', e); }
  };

  // 월 목록
  const availMonths = [...new Set(keywords.map(k => k.month).filter(Boolean))].sort().reverse();

  // 현재 월 키워드
  const monthKeywords = keywords.filter(k => k.month === selMonth);
  const availChannels = ["전체", ...new Set(monthKeywords.map(k => k.channel).filter(Boolean))];
  const filtered = selChannel === "전체" ? monthKeywords : monthKeywords.filter(k => k.channel === selChannel);

  // 이전 주 키워드 (전주 대비용) - week 필드 기준
  const availWeeks = [...new Set(keywords.map(k => k.month).filter(Boolean))].sort().reverse();
  const prevWeek = availWeeks[availWeeks.indexOf(selMonth) + 1] || null;
  const prevKeywords = prevWeek ? keywords.filter(k => k.month === prevWeek) : [];

  // 정렬
  const rankScore = (rank) => {
    if (!rank) return 999999;
    const parts = rank.toString().split('-');
    if (parts.length === 2) return parseInt(parts[0]) * 100 + (parseInt(parts[1]) || 0);
    return parseInt(rank) * 100 || 999999;
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortKey === "rank") { av = rankScore(a.rank); bv = rankScore(b.rank); }
      else if (sortKey === "totalRank") { av = +a.totalRank||999999; bv = +b.totalRank||999999; }
      else if (sortKey === "searchVol") { av = +a.searchVol||0; bv = +b.searchVol||0; }
      else { av = a[sortKey]||""; bv = b[sortKey]||""; }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "rank" ? "asc" : "desc"); }
  };

  // CSV 업로드
  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split("\n").filter(Boolean);
      if (lines.length < 2) { toast("데이터가 없어요"); return; }

      // 헤더 파싱 (월,키워드,채널,순위,검색량)
      const parseCSVLine = (line) => {
        const cols = []; let cur = ""; let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') { inQ = !inQ; }
          else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; }
          else { cur += ch; }
        }
        cols.push(cur.trim());
        return cols;
      };
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map(line => {
        const cols = parseCSVLine(line).map(c => c.replace(/^"|"$/g, ""));
        const obj = {};
        headers.forEach((h, i) => obj[h] = cols[i] || "");
        return obj;
      });

      // 헤더 자동 매핑
      const map = {};
      headers.forEach(h => {
        const hl = h.toLowerCase();
        if (hl.includes("주") || hl.includes("week") || hl.includes("월") || hl.includes("month")) map.month = h;
        else if (hl.includes("키워드") || hl.includes("keyword")) map.keyword = h;
        else if (hl.includes("채널") || hl.includes("channel")) map.channel = h;
        else if (hl.includes("현재") || hl.includes("위치") || hl.includes("position")) map.rank = h;
        else if (hl.includes("총순위") || hl.includes("총 순위") || hl.includes("total")) map.totalRank = h;
        else if (hl.includes("순위") || hl.includes("rank")) map.rank = h;
        else if (hl.includes("검색") || hl.includes("search")) map.searchVol = h;
      });

      if (!map.keyword) { toast("키워드 컬럼을 찾을 수 없어요"); return; }

      const parsed = rows.map((r, i) => ({
        id: Date.now() + i,
        month: r[map.month] || selMonth || new Date().toISOString().slice(0,7),
        keyword: r[map.keyword] || "",
        channel: r[map.channel] || "",
        rank: r[map.rank] ? r[map.rank].trim() : null,
        totalRank: r[map.totalRank] ? +r[map.totalRank] : null,
        searchVol: r[map.searchVol] ? +r[map.searchVol].replace(/,/g,"") : null,
      })).filter(r => r.keyword);

      // 같은 월 + 같은 채널 조합만 교체, 나머지는 유지
      const uploadedMonths = [...new Set(parsed.map(r => r.month))];
      const uploadedChannels = [...new Set(parsed.map(r => r.channel).filter(Boolean))];
      const kept = keywords.filter(k => {
        if (!uploadedMonths.includes(k.month)) return true; // 다른 월은 유지
        if (uploadedChannels.length > 0 && !uploadedChannels.includes(k.channel)) return true; // 같은 월이라도 다른 채널은 유지
        return false;
      });
      const newData = [...kept, ...parsed];
      setKeywords(newData);
      saveKeywords(newData);
      logActivity("키워드 업로드", hospital.name, `${parsed.length}개 키워드`);
      if (uploadedMonths.length > 0) setSelMonth(uploadedMonths[0]);
      toast(`${parsed.length}개 키워드 업로드 완료!`);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // 순위 변화 계산
  const getRankChange = (kw) => {
    if (!prevKeywords.length || !kw.totalRank) return null;
    const prev = prevKeywords.find(p => p.keyword === kw.keyword && p.channel === kw.channel);
    if (!prev || !prev.totalRank) return null;
    return prev.totalRank - kw.totalRank; // 양수 = 상승 (낮을수록 좋음)
  };

  const SortBtn = ({ k, label }) => (
    <span onClick={() => handleSort(k)} style={{ cursor:"pointer", userSelect:"none", color: sortKey===k ? hospital.color : C.muted }}>
      {label}{sortKey===k ? (sortDir==="asc" ? " ↑" : " ↓") : ""}
    </span>
  );

  // 요약 통계
  const parseRankPage = (rank) => rank ? parseInt(rank.toString().split("-")[0]) : 99;
  const top3 = filtered.filter(k => k.rank && parseRankPage(k.rank) === 1).length;
  const top10 = filtered.filter(k => k.rank && parseRankPage(k.rank) <= 2).length;


  if (loading) return (
    <div style={{ padding:48, textAlign:"center", color:C.muted, fontSize:13 }}>키워드 데이터 불러오는 중...</div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 상단 - 월 선택 + 업로드 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 주차:</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {availMonths.length === 0
              ? <span style={{ color:C.muted, fontSize:12 }}>데이터 없음</span>
              : availMonths.map(w => (
                  <button key={w} onClick={() => setSelMonth(w)} style={{
                    background: selMonth===w ? `${hospital.color}25` : "transparent",
                    border: `1px solid ${selMonth===w ? hospital.color : C.border}`,
                    color: selMonth===w ? hospital.color : C.muted,
                    borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
                  }}>{w}</button>
                ))
            }
          </div>
        </div>
        {isAdmin && (
          <div style={{ display:"flex", gap:8 }}>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display:"none" }} />
            <button onClick={() => fileRef.current?.click()} style={{
              background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A",
              borderRadius:9, padding:"8px 18px", fontSize:12, cursor:"pointer", fontWeight:700,
            }}>📂 CSV 업로드</button>
          </div>
        )}
      </div>

      {/* 채널 필터 */}
      {availChannels.length > 1 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>채널:</span>
          {availChannels.map(ch => (
            <button key={ch} onClick={() => setSelChannel(ch)} style={{
              background: selChannel===ch ? `${hospital.color}25` : "transparent",
              border: `1px solid ${selChannel===ch ? hospital.color : C.border}`,
              color: selChannel===ch ? hospital.color : C.muted,
              borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{ch}</button>
          ))}
        </div>
      )}

      {/* CSV 양식 안내 */}
      {isAdmin && keywords.length === 0 && (
        <div style={{ background:`${hospital.color}08`, border:`1px dashed ${hospital.color}40`, borderRadius:14, padding:20 }}>
          <div style={{ color:hospital.color, fontSize:13, fontWeight:700, marginBottom:10 }}>📋 CSV 파일 양식 안내</div>
          <div style={{ color:C.muted, fontSize:12, lineHeight:1.8 }}>
            첫 번째 행은 헤더여야 해요. 아래 컬럼명을 사용해주세요.<br/>
            <span style={{ color:C.text, fontWeight:600 }}>주차, 키워드, 채널, 현재위치, 총순위, 검색량</span><br/>
            예시: <span style={{ color:hospital.color }}>2025-03-W1, 강남성형외과, 네이버블로그, 1-3, 13, 12000</span><br/>
            <span style={{ color:C.muted }}>현재위치: 페이지-위치 (예: 1-3 = 1페이지 3번째) / 총순위: 전체 순위 숫자</span>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      {filtered.length > 0 && (
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"총 키워드", value:`${filtered.length}개`, color:hospital.color },
            { label:"1페이지", value:`${top3}개`, color:C.green },
            { label:"2페이지 이내", value:`${top10}개`, color:C.accent },
  
          ].map((item, i) => (
            <div key={i} style={{ background:C.surface, border:`1px solid ${item.color}25`, borderRadius:10, padding:"12px 18px", textAlign:"center", flex:"1", minWidth:100 }}>
              <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>{item.label}</div>
              <div style={{ color:item.color, fontSize:18, fontWeight:800 }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 키워드 테이블 */}
      {filtered.length > 0 ? (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#F8FAFC", borderBottom:`1px solid ${C.border}` }}>
                  {[
                    { k:"keyword",    label:"키워드" },
                    { k:"channel",    label:"채널" },
                    { k:"rank",       label:"현재 위치" },
                    { k:"totalRank",  label:"총 순위" },
                    { k:null,         label:"전주 대비" },
                    { k:"searchVol",  label:"검색량" },
                  ].map((col, i) => (
                    <th key={i} style={{ padding:"12px 16px", textAlign:"left", color:C.muted, fontWeight:600, fontSize:12, whiteSpace:"nowrap" }}>
                      {col.k ? <SortBtn k={col.k} label={col.label} /> : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((kw, i) => {
                  const change = getRankChange(kw);
                  const page = kw.rank ? parseInt(kw.rank.toString().split("-")[0]) : 99;
                  const rankColor = page === 1 ? C.green : page === 2 ? C.yellow : page === 3 ? C.accent : C.muted;
                  const totalRankColor = kw.totalRank ? (kw.totalRank <= 10 ? C.green : kw.totalRank <= 20 ? C.yellow : kw.totalRank <= 30 ? C.accent : C.muted) : C.muted;
                  return (
                    <tr key={kw.id} style={{ borderBottom:`1px solid ${C.border}30`, background: i%2===0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding:"12px 16px", color:C.text, fontWeight:600 }}>{kw.keyword}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{kw.channel || "-"}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {kw.rank
                          ? <span style={{ color:rankColor, fontWeight:800, fontSize:15 }}>{kw.rank}</span>
                          : <span style={{ color:C.muted }}>-</span>}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {kw.totalRank
                          ? <span style={{ color:totalRankColor, fontWeight:800, fontSize:15 }}>{kw.totalRank}<span style={{ fontSize:11, fontWeight:400 }}>위</span></span>
                          : <span style={{ color:C.muted }}>-</span>}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {change === null
                          ? <span style={{ color:C.muted, fontSize:12 }}>-</span>
                          : change > 0
                            ? <span style={{ color:C.green, fontWeight:700 }}>▲ {change}</span>
                            : change < 0
                              ? <span style={{ color:C.red, fontWeight:700 }}>▼ {Math.abs(change)}</span>
                              : <span style={{ color:C.muted }}>— 유지</span>
                        }
                      </td>
                      <td style={{ padding:"12px 16px", color:C.muted }}>{kw.searchVol ? kw.searchVol.toLocaleString() : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:14, padding:48, textAlign:"center" }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:700, marginBottom:8 }}>
            {availMonths.length === 0 ? "아직 키워드 데이터가 없어요" : `${selMonth || ""} 데이터가 없어요`}
          </div>
          <div style={{ color:C.muted, fontSize:13 }}>CSV 파일을 업로드해서 키워드 순위를 관리해보세요</div>
        </div>
      )}
    </div>
  );
}

// ─── 미팅 로그 탭 ────────────────────────────────────────────
const MEETING_TYPES = ["대면", "전화", "화상", "메신저"];
const MEETING_TYPE_COLORS = { "대면": "#34D399", "전화": "#FBBF24", "화상": "#38BDF8", "메신저": "#A78BFA" };

const EMPTY_MEETING = {
  date: "", type: "대면", attendees: "", summary: "", actions: [], link: "", memo: "", images: [],
};

function MeetingTab({ hospital, isReadOnly }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_MEETING);
  const [newAction, setNewAction] = useState("");
  const [newActionTeam, setNewActionTeam] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [selMeetingMonth, setSelMeetingMonth] = useState("전체");

  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await supabase.from('meeting_data').select('*').eq('hospital_id', hospital.id).single();
        if (res.data?.data) setLogs(res.data.data.slice().reverse());
      } catch(e) {}
    };
    load();
  }, [hospital.id]);

  const saveLogs = async (newLogs) => {
    try { await supabase.from('meeting_data').upsert({ hospital_id: hospital.id, data: newLogs.slice().reverse() }, { onConflict: 'hospital_id' }); } catch(e) { console.error('미팅로그 저장 실패:', e); }
  };

  const addAction = () => {
    if (!newAction.trim()) return;
    setForm(prev => ({ ...prev, actions: [...prev.actions, { id: Date.now(), text: newAction.trim(), team: newActionTeam, done: false }] }));
    setNewAction(""); setNewActionTeam("");
  };
  const removeAction = (id) => setForm(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));

  const toggleActionDone = async (logId, actionId) => {
    const updated = logs.map(l =>
      l.id === logId ? { ...l, actions: l.actions.map(a => a.id === actionId ? { ...a, done: !a.done } : a) } : l
    );
    setLogs(updated); await saveLogs(updated);
  };

  const handleAdd = async () => {
    const newLog = { ...form, id: Date.now() };
    const updated = [newLog, ...logs];
    setLogs(updated); await saveLogs(updated);
    setForm(EMPTY_MEETING); setNewAction(""); setNewActionTeam(""); setShowForm(false); toast("미팅 로그 저장 완료!");
  };

  const [followupParentId, setFollowupParentId] = useState(null);
  const [followupForm, setFollowupForm] = useState(EMPTY_MEETING);
  const [newFollowupAction, setNewFollowupAction] = useState("");
  const [newFollowupActionTeam, setNewFollowupActionTeam] = useState("");

  const addFollowupAction = () => {
    if (!newFollowupAction.trim()) return;
    setFollowupForm(prev => ({ ...prev, actions: [...prev.actions, { id:Date.now(), text:newFollowupAction.trim(), team:newFollowupActionTeam, done:false }] }));
    setNewFollowupAction(""); setNewFollowupActionTeam("");
  };

  const handleAddFollowup = async () => {
    if (!followupForm.date || !followupForm.summary) return;
    const newLog = { ...followupForm, id:Date.now(), parentId:followupParentId };
    const updated = [newLog, ...logs];
    setLogs(updated); await saveLogs(updated);
    setFollowupParentId(null); setFollowupForm(EMPTY_MEETING); setNewFollowupAction(""); setNewFollowupActionTeam("");
    toast("후속 미팅 추가 완료!");
  };

  const handleEdit = (log) => { setEditId(log.id); setForm({ ...log, actions: [...log.actions] }); setShowForm(true); };

  const handleUpdate = async () => {
    const updated = logs.map(l => l.id === editId ? { ...form, id: editId } : l);
    setLogs(updated); await saveLogs(updated);
    setEditId(null); setForm(EMPTY_MEETING); setNewAction(""); setNewActionTeam(""); setShowForm(false); toast("수정 완료!");
  };

  const handleDelete = async (id) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated); await saveLogs(updated);
    setDeleteConfirm(null); toast("삭제 완료!");
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_MEETING); setNewAction(""); setNewActionTeam(""); };

  const meetingMonthList = useMemo(() => {
    const months = [...new Set(logs.map(l => l.date?.slice(0,7)).filter(Boolean))].sort().reverse();
    return ["전체", ...months];
  }, [logs]);

  const filteredLogs = useMemo(() =>
    selMeetingMonth === "전체" ? logs : logs.filter(l => l.date?.startsWith(selMeetingMonth))
  , [logs, selMeetingMonth]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 라이트박스 */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out" }}>
          <img src={lightboxImg} alt="" style={{ maxWidth:"90vw", maxHeight:"90vh", borderRadius:12, objectFit:"contain" }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightboxImg(null)} style={{ position:"absolute", top:20, right:24, background:"rgba(255,255,255,0.15)", border:"none", color:"#0F172A", borderRadius:"50%", width:36, height:36, fontSize:20, cursor:"pointer" }}>×</button>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 월:</span>
          {meetingMonthList.map(m => (
            <button key={m} onClick={() => setSelMeetingMonth(m)} style={{
              background: selMeetingMonth===m ? `${hospital.color}20` : "transparent",
              border: `1px solid ${selMeetingMonth===m ? hospital.color : C.border}`,
              color: selMeetingMonth===m ? hospital.color : C.muted,
              borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{m === "전체" ? "전체" : m.slice(5)+"월"}</button>
          ))}
        </div>
        {!isReadOnly && (
          <button onClick={() => { cancelForm(); setShowForm(!showForm); }} style={{
            background: showForm && !editId ? `${C.red}15` : `linear-gradient(135deg,${hospital.color},${C.accent2})`,
            border: showForm && !editId ? `1px solid ${C.red}` : "none",
            color: showForm && !editId ? C.red : "#0F172A",
            borderRadius:9, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
          }}>{showForm && !editId ? "닫기" : "+ 미팅 로그 추가"}</button>
        )}
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div style={{ background:C.surface, border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:20 }}>{editId ? "미팅 로그 수정" : "새 미팅 로그"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>날짜 *</label>
              <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} style={{ ...inputSt, padding:"8px 12px" }} />
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>미팅 방식</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {MEETING_TYPES.map(t => (
                  <button key={t} onClick={() => setForm(p=>({...p,type:t}))} style={{
                    background: form.type===t ? `${hospital.color}20` : "transparent",
                    border: `1px solid ${form.type===t ? hospital.color : C.border}`,
                    color: form.type===t ? hospital.color : C.muted,
                    borderRadius:7, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>참석자</label>
            <input type="text" value={form.attendees} placeholder="예: 원장님, 실장님" onChange={e=>setForm(p=>({...p,attendees:e.target.value}))} style={{ ...inputSt, padding:"8px 12px", fontSize:13 }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>주요 논의 내용 *</label>
            <textarea value={form.summary} rows={4} placeholder="이번 미팅에서 논의된 주요 내용을 기록해주세요" onChange={e=>setForm(p=>({...p,summary:e.target.value}))}
              style={{ ...inputSt, resize:"vertical", lineHeight:1.6, padding:"8px 12px", fontSize:13 }} />
          </div>
          {/* 이미지 */}
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>첨부 이미지 (최대 5장)</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {(form.images||[]).map((img, idx) => (
                <div key={idx} style={{ position:"relative" }}>
                  <img src={img} alt="" style={{ width:60, height:60, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}`, cursor:"pointer" }} onClick={() => setLightboxImg(img)} />
                  <div onClick={() => setForm(p=>({...p,images:p.images.filter((_,i)=>i!==idx)}))}
                    style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:C.red, color:"#0F172A", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>×</div>
                </div>
              ))}
              {(form.images||[]).length < 5 && (
                <label style={{ width:60, height:60, border:`2px dashed ${C.border}`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:20 }}>
                  +
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setForm(p=>({...p, images:[...(p.images||[]), ev.target.result]}));
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
              )}
            </div>
          </div>
          {/* 액션아이템 */}
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>결정사항 / 액션아이템</label>
            {form.actions.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:8 }}>
                {form.actions.map(action => {
                  const teamLeader = TEAM_LEADERS_META.find(t => t.team === action.team);
                  return (
                    <div key={action.id} style={{ display:"flex", alignItems:"center", gap:8, background:"#F8FAFC", borderRadius:8, padding:"8px 12px" }}>
                      <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, background:action.done?C.green:"transparent", border:`2px solid ${action.done?C.green:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {action.done && <span style={{ color:"#0F172A", fontSize:11, fontWeight:900 }}>✓</span>}
                      </div>
                      {action.team && <span style={{ background:`${teamLeader?.color||C.accent2}20`, color:teamLeader?.color||C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{action.team}</span>}
                      <span style={{ flex:1, color:C.text, fontSize:12 }}>{action.text}</span>
                      <span onClick={() => removeAction(action.id)} style={{ color:C.dim, cursor:"pointer", fontSize:16, fontWeight:700, lineHeight:1 }}>×</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <select value={newActionTeam} onChange={e=>setNewActionTeam(e.target.value)}
                style={{ ...inputSt, width:120, padding:"7px 10px", fontSize:12, appearance:"none", flexShrink:0 }}>
                <option value="">팀 선택</option>
                {TEAM_LEADERS_META.map(t => <option key={t.team} value={t.team}>{t.team}</option>)}
              </select>
              <input value={newAction} onChange={e=>setNewAction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAction()}
                placeholder="액션아이템 입력 후 Enter 또는 추가" style={{ ...inputSt, flex:1, padding:"7px 12px", fontSize:12, minWidth:160 }} />
              <button onClick={addAction} style={{ background:`${hospital.color}20`, border:`1px solid ${hospital.color}`, color:hospital.color, borderRadius:8, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:700, flexShrink:0 }}>+ 추가</button>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>메모</label>
            <KInput value={form.memo} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} placeholder="기타 특이사항" style={inputSt} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={editId ? handleUpdate : handleAdd} disabled={!form.date || !form.summary} style={{
              background: form.date && form.summary ? `linear-gradient(135deg,${hospital.color},${C.accent2})` : C.dim,
              border:"none", color:"#0F172A", borderRadius:9, padding:"10px 24px",
              fontSize:13, cursor: form.date && form.summary ? "pointer" : "not-allowed", fontWeight:700,
            }}>{editId ? "수정 완료" : "저장하기"}</button>
            <button onClick={cancelForm} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:9, padding:"10px 16px", fontSize:13, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

      {/* 로그 목록 */}
      {filteredLogs.filter(l => !l.parentId).length === 0 ? (
        <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:16, padding:40, textAlign:"center", color:C.muted }}>
          미팅 로그가 없어요. 위의 버튼으로 추가해보세요!
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filteredLogs.filter(l => !l.parentId).map((log) => {
            const isExpanded = expandedId === log.id;
            const doneCount = log.actions.filter(a=>a.done).length;
            const childLogs = logs.filter(l => l.parentId === log.id).sort((a,b)=>a.date>b.date?1:-1);
            return (
              <div key={log.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
                {/* 헤더 */}
                <div onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"16px 20px", cursor:"pointer" }}>
                  <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>{log.date}</span>
                    <span style={{ background:`${hospital.color}15`, color:hospital.color, borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{log.type}</span>
                    {log.attendees && <span style={{ color:C.muted, fontSize:12 }}>👤 {log.attendees}</span>}
                    {log.actions.length > 0 && (
                      <span style={{ background:doneCount===log.actions.length?`${C.green}15`:`${C.yellow}15`, color:doneCount===log.actions.length?C.green:C.yellow, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                        {doneCount}/{log.actions.length} 완료
                      </span>
                    )}
                    {childLogs.length > 0 && (
                      <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                        📎 후속 {childLogs.length}건
                      </span>
                    )}
                  </div>
                  <span style={{ color:C.muted, fontSize:16 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* 상세 내용 */}
                {isExpanded && (
                  <div style={{ padding:"0 20px 20px", borderTop:`1px solid ${C.dim}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:16 }}>
                      <div style={{ background:"#F8FAFC", borderRadius:10, padding:14 }}>
                        <div style={{ color:C.muted, fontSize:11, fontWeight:600, marginBottom:8 }}>📋 주요 논의 내용</div>
                        <div style={{ color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{log.summary}</div>
                      </div>
                      <div style={{ background:"#F8FAFC", borderRadius:10, padding:14 }}>
                        <div style={{ color:C.muted, fontSize:11, fontWeight:600, marginBottom:8 }}>✅ 결정사항 / 액션아이템</div>
                        {log.actions.length === 0 ? (
                          <div style={{ color:C.muted, fontSize:12 }}>없음</div>
                        ) : (
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {log.actions.map(action => {
                              const tm = TEAM_LEADERS_META.find(t => t.team === action.team);
                              return (
                                <div key={action.id} onClick={() => toggleActionDone(log.id, action.id)}
                                  style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 8px", borderRadius:7, background:action.done?`${C.green}10`:"transparent", transition:"background 0.15s" }}>
                                  <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, background:action.done?C.green:"transparent", border:`2px solid ${action.done?C.green:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                                    {action.done && <span style={{ color:"#0F172A", fontSize:12, fontWeight:900 }}>✓</span>}
                                  </div>
                                  {action.team && <span style={{ background:`${tm?.color||C.accent2}20`, color:tm?.color||C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{action.team}</span>}
                                  <span style={{ flex:1, fontSize:13, lineHeight:1.5, color:action.done?C.muted:C.text, textDecoration:action.done?"line-through":"none", transition:"all 0.15s" }}>{action.text}</span>
                                </div>
                              );
                            })}
                            {log.actions.length > 1 && (
                              <div style={{ marginTop:4, background:C.dim, borderRadius:3, height:4 }}>
                                <div style={{ width:`${Math.round((doneCount/log.actions.length)*100)}%`, height:"100%", background:C.green, borderRadius:3, transition:"width 0.3s" }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 이미지 */}
                    {log.images && log.images.length > 0 && (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
                        {log.images.map((img,idx) => (
                          <img key={idx} src={img} alt="" onClick={() => setLightboxImg(img)}
                            style={{ width:80, height:80, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}`, cursor:"zoom-in" }} />
                        ))}
                      </div>
                    )}
                    {(log.link || log.memo) && (
                      <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
                        {log.link && <a href={log.link} target="_blank" rel="noreferrer" style={{ color:C.accent, fontSize:12 }}>🔗 참고 링크</a>}
                        {log.memo && <div style={{ color:C.muted, fontSize:12 }}>📝 {log.memo}</div>}
                      </div>
                    )}
                    {/* 수정/삭제/후속미팅 버튼 */}
                    {!isReadOnly && (
                    <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.dim}` }}>
                      <button onClick={() => handleEdit(log)} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>수정</button>
                      <button onClick={() => { setFollowupParentId(log.id); setFollowupForm({...EMPTY_MEETING, date:new Date().toISOString().slice(0,10)}); }} style={{ background:`${C.accent2}15`, border:`1px solid ${C.accent2}30`, color:C.accent2, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>📎 후속 미팅</button>
                      {deleteConfirm === log.id ? (
                        <button onClick={() => handleDelete(log.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, color:C.red, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>확인 삭제</button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(log.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer" }}>삭제</button>
                      )}
                    </div>
                    )}

                    {/* 후속 미팅 추가 폼 */}
                    {followupParentId === log.id && (
                      <div style={{ marginTop:16, borderLeft:`3px solid ${C.accent2}`, paddingLeft:16 }}>
                        <div style={{ color:C.accent2, fontWeight:700, fontSize:13, marginBottom:12 }}>📎 후속 미팅 추가</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                          <div>
                            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>날짜 *</label>
                            <input type="date" value={followupForm.date} onChange={e=>setFollowupForm(p=>({...p,date:e.target.value}))} style={{ ...inputSt, padding:"6px 10px" }} />
                          </div>
                          <div>
                            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>미팅 방식</label>
                            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                              {MEETING_TYPES.map(t => (
                                <button key={t} onClick={()=>setFollowupForm(p=>({...p,type:t}))} style={{ background:followupForm.type===t?`${C.accent2}20`:"transparent", border:`1px solid ${followupForm.type===t?C.accent2:C.border}`, color:followupForm.type===t?C.accent2:C.muted, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>{t}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginBottom:10 }}>
                          <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>참석자</label>
                          <input type="text" value={followupForm.attendees} placeholder="참석자" onChange={e=>setFollowupForm(p=>({...p,attendees:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                        </div>
                        <div style={{ marginBottom:10 }}>
                          <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>주요 논의 내용 *</label>
                          <textarea value={followupForm.summary} rows={3} placeholder="후속 미팅 내용" onChange={e=>setFollowupForm(p=>({...p,summary:e.target.value}))} style={{ ...inputSt, resize:"vertical", lineHeight:1.6, padding:"6px 10px", fontSize:12 }} />
                        </div>
                        <div style={{ marginBottom:10 }}>
                          <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>액션아이템</label>
                          {followupForm.actions.length > 0 && (
                            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:6 }}>
                              {followupForm.actions.map(a => {
                                const tm = TEAM_LEADERS_META.find(t=>t.team===a.team);
                                return (
                                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:6, background:"#F8FAFC", borderRadius:6, padding:"5px 8px" }}>
                                    {a.team && <span style={{ background:`${tm?.color||C.accent2}20`, color:tm?.color||C.accent2, borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:700 }}>{a.team}</span>}
                                    <span style={{ flex:1, fontSize:11, color:C.text }}>{a.text}</span>
                                    <span onClick={()=>setFollowupForm(p=>({...p,actions:p.actions.filter(x=>x.id!==a.id)}))} style={{ color:C.dim, cursor:"pointer", fontSize:14 }}>×</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div style={{ display:"flex", gap:5 }}>
                            <select value={newFollowupActionTeam} onChange={e=>setNewFollowupActionTeam(e.target.value)} style={{ ...inputSt, width:100, padding:"5px 8px", fontSize:11, appearance:"none", flexShrink:0 }}>
                              <option value="">팀</option>
                              {TEAM_LEADERS_META.map(t=><option key={t.team} value={t.team}>{t.team}</option>)}
                            </select>
                            <input value={newFollowupAction} onChange={e=>setNewFollowupAction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFollowupAction()} placeholder="액션아이템" style={{ ...inputSt, flex:1, padding:"5px 8px", fontSize:11 }} />
                            <button onClick={addFollowupAction} style={{ background:`${C.accent2}20`, border:`1px solid ${C.accent2}`, color:C.accent2, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", flexShrink:0 }}>추가</button>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={handleAddFollowup} disabled={!followupForm.date||!followupForm.summary} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:7, padding:"7px 18px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                          <button onClick={()=>setFollowupParentId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
                        </div>
                      </div>
                    )}

                    {/* 연결된 후속 미팅 표시 */}
                    {childLogs.length > 0 && (
                      <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10 }}>
                        <div style={{ color:C.muted, fontSize:11, fontWeight:600 }}>📎 후속 미팅 ({childLogs.length}건)</div>
                        {childLogs.map(child => (
                          <div key={child.id} style={{ borderLeft:`3px solid ${C.accent2}`, paddingLeft:14, background:`${C.accent2}05`, borderRadius:"0 10px 10px 0", padding:"12px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                              <span style={{ color:C.accent2, fontWeight:700, fontSize:12 }}>{child.date}</span>
                              <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:5, padding:"1px 8px", fontSize:11 }}>{child.type}</span>
                              {child.attendees && <span style={{ color:C.muted, fontSize:11 }}>👤 {child.attendees}</span>}
                              <button onClick={()=>handleDelete(child.id)} style={{ marginLeft:"auto", background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                            </div>
                            <div style={{ color:C.text, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{child.summary}</div>
                            {child.actions?.length > 0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                                {child.actions.map((a,j) => {
                                  const tm = TEAM_LEADERS_META.find(t=>t.team===a.team);
                                  return (
                                    <span key={j} style={{ background:a.done?`${C.green}15`:`${C.muted}10`, border:`1px solid ${a.done?C.green:C.dim}`, color:a.done?C.green:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10 }}>
                                      {a.done ? "✓" : "○"} {a.team && <span style={{color:tm?.color||C.accent2,fontWeight:700}}>{a.team} </span>}{a.text}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


const COST_CATEGORIES = [
  { id:"marketing",          label:"마케팅",               group:"마케팅", color:"#0EA5E9" },
  { id:"marketing_blog",    label:"마케팅 - 블로그",     group:"마케팅", color:"#03C75A" },
  { id:"marketing_insta",   label:"마케팅 - 인스타그램", group:"마케팅", color:"#E1306C" },
  { id:"marketing_youtube", label:"마케팅 - 유튜브",     group:"마케팅", color:"#FF0000" },
  { id:"marketing_cafe",    label:"마케팅 - 네이버카페", group:"마케팅", color:"#0088FE" },
  { id:"marketing_jisik",   label:"마케팅 - 지식인",     group:"마케팅", color:"#00C73C" },
  { id:"marketing_search",  label:"마케팅 - 검색광고",   group:"마케팅", color:"#A78BFA" },
  { id:"marketing_meta",    label:"마케팅 - 메타광고",   group:"마케팅", color:"#4ECDC4" },
  { id:"design",            label:"디자인물",             group:"디자인", color:"#FBBF24" },
  { id:"cs",                label:"CS 경영지원",          group:"CS",     color:"#FB923C" },
];

function CostTab({ hospital, hData, onDataLoad }) {
  const [contracts, setContracts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const currentYm = new Date().toISOString().slice(0,7);
  const [selMonth, setSelMonth] = useState(currentYm);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({month:selMonth,category:"marketing_blog",amount:"",memo:"",date:""});
  const [contractForm, setContractForm] = useState({month:selMonth,amount:""});
  const [editExpId, setEditExpId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [selGroup, setSelGroup] = useState("전체");

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2200); };

  // Supabase 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('cost_data').select('*').eq('hospital_id', hospital.id).single();
        if (data?.data) {
          if (data.data.contracts) setContracts(data.data.contracts);
          if (data.data.expenses) setExpenses(data.data.expenses);
          if (onDataLoad) onDataLoad({ contracts: data.data.contracts||[], expenses: data.data.expenses||[] });
        }
      } catch(e) {}
    };
    load();
  }, [hospital.id]);

  const saveToSupabase = async (newContracts, newExpenses) => {
    try {
      await supabase.from('cost_data').upsert(
        { hospital_id: hospital.id, data: { contracts: newContracts, expenses: newExpenses } },
        { onConflict: 'hospital_id' }
      );
    } catch(e) { console.error('비용관리 저장 실패:', e); }
  };

  const contractAmt = contracts.find(c=>c.month===selMonth)?.amount||0;
  const monthExpenses = expenses.filter(e=>e.month===selMonth);
  const totalSpent = monthExpenses.reduce((s,e)=>s+e.amount,0);
  const remaining = contractAmt - totalSpent;
  const spentRate = contractAmt > 0 ? Math.round((totalSpent/contractAmt)*100) : 0;

  const categoryStats = COST_CATEGORIES.map(cat => ({...cat, amount: monthExpenses.filter(e=>e.category===cat.id).reduce((s,e)=>s+e.amount,0)})).filter(c=>c.amount>0);
  const groupStats = ["마케팅","디자인","CS"].map(g => ({
    name:g, color:g==="마케팅"?hospital.color:g==="디자인"?C.yellow:C.orange,
    amount: monthExpenses.filter(e=>COST_CATEGORIES.find(c=>c.id===e.category)?.group===g).reduce((s,e)=>s+e.amount,0),
  }));
  const availMonths = [...new Set(contracts.map(c=>c.month))].sort().reverse();
  const trendData = [...new Set([...contracts.map(c=>c.month),...expenses.map(e=>e.month)])].sort().map(m=>({
    month:m.slice(5)+"월",
    계약금:contracts.find(c=>c.month===m)?.amount||0,
    소진:expenses.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0),
  }));

  const handleSaveContract = () => {
    if (!contractForm.month||!contractForm.amount) return;
    const exists = contracts.find(c=>c.month===contractForm.month);
    const newContracts = exists
      ? contracts.map(c=>c.month===contractForm.month?{...c,amount:+contractForm.amount}:c)
      : [...contracts,{month:contractForm.month,amount:+contractForm.amount}].sort((a,b)=>a.month>b.month?1:-1);
    setContracts(newContracts);
    saveToSupabase(newContracts, expenses);
    logActivity("계약금 저장", hospital.name, `${contractForm.month} ${contractForm.amount}만원`);
    setShowContractForm(false); toast("계약금 저장 완료!");
  };

  const handleSaveExpense = () => {
    if (!expenseForm.month||!expenseForm.amount||!expenseForm.category) return;
    let newExpenses;
    if (editExpId) {
      newExpenses = expenses.map(e=>e.id===editExpId?{...expenseForm,id:editExpId,amount:+expenseForm.amount}:e);
      setEditExpId(null); toast("수정 완료!");
    } else {
      newExpenses = [{...expenseForm,id:Date.now(),amount:+expenseForm.amount},...expenses];
      toast("저장 완료!");
    }
    setExpenses(newExpenses);
    saveToSupabase(contracts, newExpenses);
    setExpenseForm({month:selMonth,category:"marketing_blog",amount:"",memo:"",date:""}); setShowExpenseForm(false);
  };

  const handleEditExp = (e) => { setEditExpId(e.id); setExpenseForm({...e,amount:String(e.amount)}); setShowExpenseForm(true); };

  const handleDeleteExp = (id) => {
    const newExpenses = expenses.filter(e=>e.id!==id);
    setExpenses(newExpenses);
    saveToSupabase(contracts, newExpenses);
    setDeleteConfirm(null); toast("삭제 완료");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <Toast msg={savedMsg}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:C.muted,fontSize:13}}>조회 월:</span>
          <YearMonthSelector availMonths={availMonths} selMonth={selMonth} setSelMonth={setSelMonth} color={hospital.color} />
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowContractForm(!showContractForm)} style={{background:`${C.accent2}20`,border:`1px solid ${C.accent2}50`,color:C.accent2,borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>계약금 등록</button>
          <button onClick={()=>{setEditExpId(null);setExpenseForm({month:selMonth,category:"marketing_blog",amount:"",memo:"",date:""});setShowExpenseForm(!showExpenseForm);}} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 소진 내역 추가</button>
        </div>
      </div>

      {showContractForm && (
        <div style={{background:"#F8FAFC",border:`1px solid ${C.accent2}30`,borderRadius:14,padding:20}}>
          <div style={{color:C.accent2,fontSize:13,fontWeight:700,marginBottom:14}}>월 계약금 등록</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:140}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={contractForm.month} onChange={e=>setContractForm({...contractForm,month:e.target.value})} style={inputSt}/></div>
            <div style={{flex:2,minWidth:180}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>계약금 (만원) *</label><input type="number" placeholder="3500" value={contractForm.amount} onChange={e=>setContractForm({...contractForm,amount:e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={handleSaveContract} style={{background:`linear-gradient(135deg,${C.accent2},${C.accent})`,border:"none",color:"#0F172A",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>저장</button>
            <button onClick={()=>setShowContractForm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {showExpenseForm && (
        <div style={{background:"#F8FAFC",border:`1px solid ${hospital.color}30`,borderRadius:14,padding:20}}>
          <div style={{color:hospital.color,fontSize:13,fontWeight:700,marginBottom:14}}>{editExpId?"소진 내역 수정":"소진 내역 추가"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:14}}>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={expenseForm.month} onChange={e=>setExpenseForm({...expenseForm,month:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>날짜</label><input type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm,date:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>항목 *</label>
              <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})} style={{...inputSt,appearance:"none"}}>
                {COST_CATEGORIES.map(c=><option key={c.id} value={c.id} style={{background:"#F8FAFC"}}>{c.label}</option>)}
              </select>
            </div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>금액 (만원) *</label><input type="number" placeholder="500" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{marginBottom:14}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>메모</label><KInput type="text" placeholder="예: 6월 블로그 포스팅 8건" value={expenseForm.memo} onChange={e=>setExpenseForm({...expenseForm,memo:e.target.value})} style={inputSt}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSaveExpense} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>{editExpId?"수정 완료":"저장하기"}</button>
            <button onClick={()=>{setShowExpenseForm(false);setEditExpId(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <KPICard label="이번달 계약금" value={fmt(contractAmt)} unit="만원" color={C.accent2}/>
        <KPICard label="총 소진 금액" value={fmt(totalSpent)} unit="만원" sub={`${spentRate}% 소진`} color={hospital.color}/>
        <KPICard label="잔액" value={fmt(Math.max(remaining,0))} unit="만원" color={remaining>=0?C.green:C.red} sub={remaining<0?"초과 집행!":undefined}/>
        <KPICard label="소진율" value={spentRate} unit="%" color={spentRate>90?C.red:spentRate>70?C.yellow:C.green}/>
      </div>

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
        <SectionTitle sub={`${+selMonth.slice(5)}월 계약금 ${fmt(contractAmt)}만원 기준`}>소진 현황</SectionTitle>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{color:C.muted,fontSize:13}}>소진 금액</span>
          <span style={{color:hospital.color,fontWeight:800,fontSize:15}}>{fmt(totalSpent)}만원 / {fmt(contractAmt)}만원</span>
        </div>
        <div style={{background:C.dim,borderRadius:8,height:20,overflow:"hidden"}}>
          <div style={{width:`${Math.min(spentRate,100)}%`,height:"100%",background:`linear-gradient(90deg,${hospital.color},${C.accent2})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:10}}>
            {spentRate>15&&<span style={{color:"#0F172A",fontSize:11,fontWeight:700}}>{spentRate}%</span>}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{color:C.muted,fontSize:12}}>0만원</span>
          <span style={{color:remaining>=0?C.green:C.red,fontSize:12,fontWeight:700}}>잔액 {fmt(Math.abs(remaining))}만원 {remaining<0?"(초과)":"남음"}</span>
          <span style={{color:C.muted,fontSize:12}}>{fmt(contractAmt)}만원</span>
        </div>
        <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
          {groupStats.filter(g=>g.amount>0).map((g,i)=>{
            const r=contractAmt>0?Math.round((g.amount/contractAmt)*100):0;
            return (<div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:C.text,fontSize:12,fontWeight:600}}>{g.name}</span>
                <span style={{color:g.color,fontSize:12,fontWeight:700}}>{fmt(g.amount)}만원 ({r}%)</span>
              </div>
              <div style={{background:C.dim,borderRadius:4,height:7}}><div style={{width:`${Math.min(r,100)}%`,height:"100%",background:g.color,borderRadius:4}}/></div>
            </div>);
          })}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <SectionTitle>항목별 비용 비중</SectionTitle>
          {categoryStats.length>0 ? (
            <><ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={categoryStats} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="amount" paddingAngle={3}>
                {categoryStats.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Pie><TT formatter={(v)=>[`${fmt(v)}만원`]}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
              {categoryStats.map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:c.color}}/><span style={{color:C.muted,fontSize:11}}>{c.label}</span>
                </div>
              ))}
            </div></>
          ) : <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"40px 0"}}>소진 내역이 없어요</div>}
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <SectionTitle>월별 소진 추이</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} margin={{top:5,right:10,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
              <XAxis dataKey="month" stroke={C.muted} tick={{fill:"#64748B",fontSize:11}}/>
              <YAxis stroke={C.muted} tick={{fill:"#64748B",fontSize:11}}/>
              <TT formatter={(v)=>[`${fmt(v)}만원`]}/>
              <Legend wrapperStyle={{color:C.muted,fontSize:12}}/>
              <Bar dataKey="계약금" fill={C.dim} radius={[4,4,0,0]}/>
              <Bar dataKey="소진" fill={hospital.color} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:16}}>
          <SectionTitle>{selMonth.slice(5)}월 소진 내역</SectionTitle>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["전체","마케팅","디자인","CS"].map(g => (
              <button key={g} onClick={()=>setSelGroup(g)} style={{
                background: selGroup===g ? `${hospital.color}25` : "transparent",
                border: `1px solid ${selGroup===g ? hospital.color : C.border}`,
                color: selGroup===g ? hospital.color : C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{g}</button>
            ))}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["날짜","항목","그룹","금액(만원)","메모","관리"].map(h=>(
              <th key={h} style={{color:C.muted,fontWeight:600,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${C.dim}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {(() => {
                const filtered = [...monthExpenses]
                  .filter(e => selGroup === "전체" || (COST_CATEGORIES.find(c=>c.id===e.category)?.group === selGroup))
                  .sort((a,b)=>a.date>b.date?-1:1);
                if (filtered.length === 0) return <tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:C.muted}}>소진 내역이 없어요.</td></tr>;
                return filtered.map(e => {
                  const cat=COST_CATEGORIES.find(c=>c.id===e.category)||{label:e.category,color:C.muted,group:"-"};
                  return (<tr key={e.id} style={{borderBottom:`1px solid ${C.dim}`}}
                    onMouseEnter={ev=>ev.currentTarget.style.background=`${hospital.color}08`}
                    onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                    <td style={{padding:"9px 12px",color:C.muted,whiteSpace:"nowrap"}}>{e.date||"-"}</td>
                    <td style={{padding:"9px 12px",color:cat.color,fontWeight:700}}>{cat.label}</td>
                    <td style={{padding:"9px 12px"}}><Badge color={cat.group==="마케팅"?hospital.color:cat.group==="디자인"?C.yellow:C.orange}>{cat.group}</Badge></td>
                    <td style={{padding:"9px 12px",color:C.yellow,fontWeight:700}}>{fmt(e.amount)}</td>
                    <td style={{padding:"9px 12px",color:C.muted}}>{e.memo||"-"}</td>
                    <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>handleEditExp(e)} style={{background:`${hospital.color}20`,border:`1px solid ${hospital.color}40`,color:hospital.color,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>수정</button>
                        {deleteConfirm===e.id?(
                          <button onClick={()=>handleDeleteExp(e.id)} style={{background:`${C.red}20`,border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>확인</button>
                        ):(
                          <button onClick={()=>setDeleteConfirm(e.id)} style={{background:"transparent",border:`1px solid ${C.dim}`,color:C.muted,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>삭제</button>
                        )}
                      </div>
                    </td>
                  </tr>);
                });
              })()}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",gap:24,marginTop:16,paddingTop:16,borderTop:`1px solid ${C.dim}`,flexWrap:"wrap"}}>
          {groupStats.filter(g=>g.amount>0).map((g,i)=>(
            <div key={i}><span style={{color:C.muted,fontSize:11}}>{g.name} </span><span style={{color:g.color,fontSize:13,fontWeight:800}}>{fmt(g.amount)}만원</span></div>
          ))}
          <div style={{marginLeft:"auto"}}><span style={{color:C.muted,fontSize:11}}>합계 </span><span style={{color:hospital.color,fontSize:14,fontWeight:900}}>{fmt(totalSpent)}만원</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── 병원 대시보드 ────────────────────────────────────────────
function HospitalDashboard({ hospital, onBack, onUpdateHospital, isAdmin, adminRole, globalSchedules, saveGlobalSchedules }) {
  const isReadOnly = !isAdmin; // 병원 비밀번호 로그인 = 읽기 전용
  const isJunior = adminRole === "실무자"; // 실무자 탭 제한
  const enabledTabIds = hospital.tabs || DEFAULT_TABS;
  const [tab, setTab] = useState(() => {
    const firstEnabled = [
      "overview","performance","channel","funnel","patient",
      "marketing","keyword","schedule","cost","meeting"
    ].find(id => enabledTabIds.includes(id));
    return firstEnabled || "overview";
  });
  const [showPerfInput, setShowPerfInput] = useState(false);
  const [showChannelInput, setShowChannelInput] = useState(false);

  // 리포트용 공유 데이터 state
  const [sharedPatientData, setSharedPatientData] = useState([]);
  const [sharedCostData, setSharedCostData] = useState({ contracts:[], expenses:[] });
  const [sharedKeywordData, setSharedKeywordData] = useState([]);

  const hData = hospital.monthlyData || [];
  const _rawChData = hospital.channelData || [];

  // ─── 공통 월 선택 ─────────────────────────────────────────
  const availMonths = [...hData].reverse().map(d => d.month); // YYYY-MM 형식
  const availYears = [...new Set(availMonths.map(m => m.slice(0,4)))].sort().reverse();
  const [selMonth, setSelMonth] = useState(() => hData.length > 0 ? hData[hData.length-1].month : "");
  const [selYear, setSelYear] = useState(() => hData.length > 0 ? hData[hData.length-1].month.slice(0,4) : String(new Date().getFullYear()));

  // channelData가 월별 객체면 selMonth 기준으로, 배열이면 그대로
  const chData = !Array.isArray(_rawChData) && selMonth
    ? (_rawChData[selMonth] || [])
    : (Array.isArray(_rawChData) ? _rawChData : []);

  // 선택된 연도의 월 목록
  const monthsInYear = availMonths.filter(m => m.startsWith(selYear));

  // 선택된 월 데이터
  const last = (selMonth ? hData.find(d => d.month === selMonth) : hData[hData.length-1]) || {};
  // 이전 달 데이터 (비교용)
  const lastIdx = hData.findIndex(d => d.month === selMonth);
  const prev = lastIdx > 0 ? hData[lastIdx-1] : null;

  const roi = last.marketingCost ? Math.round(((last.revenue - last.marketingCost) / last.marketingCost) * 100) : 0;
  const cpaVal = last.marketingCost && last.newPatient ? Math.round(last.marketingCost / last.newPatient) : 0;
  const arpu = last.payment ? Math.round(last.revenue / last.payment) : 0;

  // 월 선택 UI 공통 컴포넌트 - 연도 드롭다운 + 월 버튼
  const MonthSelector = () => (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
      <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 월:</span>
      {availYears.length === 0
        ? <span style={{ color:C.muted, fontSize:12 }}>데이터 없음</span>
        : <>
            <select value={selYear} onChange={e => { setSelYear(e.target.value); setSelMonth(""); }}
              style={{ ...inputSt, width:90, padding:"4px 8px", fontSize:12, appearance:"none" }}>
              {availYears.map(y => <option key={y} value={y} style={{background:"#F8FAFC"}}>{y}년</option>)}
            </select>
            {monthsInYear.map(m => (
              <button key={m} onClick={() => setSelMonth(m)} style={{
                background: selMonth===m ? `${hospital.color}25` : "transparent",
                border: `1px solid ${selMonth===m ? hospital.color : C.border}`,
                color: selMonth===m ? hospital.color : C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap",
              }}>{+m.slice(5)}월</button>
            ))}
            {monthsInYear.length === 0 && <span style={{ color:C.muted, fontSize:12 }}>{selYear}년 데이터 없음</span>}
          </>
      }
    </div>
  );

  const tabs = [
    { id:"overview",    label:"통합 요약" },
    { id:"performance", label:"상세 성과" },
    { id:"channel",     label:"채널 분석" },
    { id:"funnel",      label:"전환 분석" },
    { id:"patient",     label:"환자 유입" },
    { id:"marketing",   label:"마케팅 현황" },
    { id:"keyword",     label:"키워드 현황" },
    { id:"schedule",    label:"일정 관리" },
    { id:"cost",        label:"비용 관리" },
    { id:"meeting",     label:"미팅 로그" },
  ].filter(t => {
    const enabledTabs = hospital.tabs || DEFAULT_TABS;
    if (!enabledTabs.includes(t.id)) return false;
    // 실무자는 hospital.juniorTabs에 허용된 탭만
    if (isJunior) {
      const juniorTabs = hospital.juniorTabs || [];
      return juniorTabs.includes(t.id);
    }
    return true;
  });

  const steps = [
    { name:"유입",   value:Math.round((last.inquiry||0)*3.2), color:C.accent,   prevValue:Math.round((prev?.inquiry||0)*3.2) },
    { name:"문의",   value:last.inquiry||0,      color:"#60A5FA", prevValue:prev?.inquiry||0 },
    { name:"상담",   value:last.consult||0,       color:C.accent2, prevValue:prev?.consult||0 },
    { name:"예약",   value:last.reservation||0,   color:C.green,   prevValue:prev?.reservation||0 },
    { name:"내원",   value:last.visit||0,         color:C.yellow,  prevValue:prev?.visit||0 },
    { name:"결제",   value:last.payment||0,       color:C.orange,  prevValue:prev?.payment||0 },
    { name:"재내원", value:Math.round((last.payment||0)*0.38), color:C.red, prevValue:Math.round((prev?.payment||0)*0.38) },
  ];

  // ─── 리포트 HTML 생성 & 다운로드 ───────────────────────────
  const exportReport = async () => {
    const today = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
    const reportData = last;
    const lastMonth = reportData.month || selMonth || "-";
    const fmtN = (n) => (n || 0).toLocaleString();
    const pctN = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "-";
    const roi2 = reportData.marketingCost ? Math.round(((reportData.revenue - reportData.marketingCost) / reportData.marketingCost) * 100) : 0;

    // Supabase에서 데이터 직접 가져오기
    let costContracts = [], costExpenses = [], patientRecords = [], kwKeywords = [];
    try {
      const [costRes, patientRes, kwRes] = await Promise.all([
        supabase.from('cost_data').select('*').eq('hospital_id', hospital.id).single(),
        supabase.from('patient_data').select('*').eq('hospital_id', hospital.id).single(),
        supabase.from('keyword_data').select('*').eq('hospital_id', hospital.id).single(),
      ]);
      if (costRes.data?.data) { costContracts = costRes.data.data.contracts||[]; costExpenses = costRes.data.data.expenses||[]; }
      if (patientRes.data?.data) patientRecords = patientRes.data.data;
      if (kwRes.data?.data) kwKeywords = kwRes.data.data;
    } catch(e) {}

    // 1. 통합 요약 KPI
    const kpiCards = [
      { label:"문의",     value:fmtN(reportData.inquiry),      unit:"건",  color:"#38BDF8" },
      { label:"상담",     value:fmtN(reportData.consult),       unit:"건",  color:"#818CF8" },
      { label:"예약",     value:fmtN(reportData.reservation),   unit:"건",  color:"#34D399" },
      { label:"초진내원", value:fmtN(reportData.firstVisit),    unit:"명",  color:"#FBBF24" },
      { label:"초진결제", value:fmtN(reportData.firstPayment),  unit:"건",  color:"#FB923C" },
      { label:"신환",     value:fmtN(reportData.newPatient),    unit:"명",  color:hospital.color },
      { label:"매출",     value:fmtN(reportData.revenue),       unit:"만원",color:"#FBBF24" },
      { label:"마케팅비", value:fmtN(reportData.marketingCost), unit:"만원",color:"#FB923C" },
    ].map(k => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value" style="color:${k.color}">${k.value}<span class="kpi-unit">${k.unit}</span></div>
      </div>`).join("");

    // 2. 상세 성과 - 월별 추이
    const trendRows = hData.map(d => `
      <tr>
        <td>${d.month}</td>
        <td class="num">${fmtN(d.inquiry)}</td>
        <td class="num">${fmtN(d.firstVisit||d.visit)}</td>
        <td class="num">${fmtN(d.firstPayment||d.payment)}</td>
        <td class="num">${fmtN(d.newPatient)}</td>
        <td class="num">${fmtN(d.revenue)}</td>
        <td class="num">${fmtN(d.marketingCost)}</td>
        <td class="num" style="color:${d.marketingCost?(((d.revenue-d.marketingCost)/d.marketingCost*100)|0)>200?"#34D399":"#FBBF24":"#64748B"}">
          ${d.marketingCost ? Math.round(((d.revenue - d.marketingCost) / d.marketingCost) * 100) + "%" : "-"}
        </td>
      </tr>`).join("");

    // 3. 전환 분석 - 퍼널
    const funnelStepsReport = [
      { name:"유입",     val:Math.round((reportData.inquiry||0)*3.2) },
      { name:"문의",     val:reportData.inquiry||0 },
      { name:"상담",     val:reportData.consult||0 },
      { name:"예약",     val:reportData.reservation||0 },
      { name:"초진내원", val:reportData.firstVisit||0 },
      { name:"초진결제", val:reportData.firstPayment||0 },
      { name:"재내원",   val:Math.max(0,(reportData.visit||0)-(reportData.firstVisit||0)) },
    ];
    const funnelRows = funnelStepsReport.map((r,i) => {
      const p = i > 0 ? funnelStepsReport[i-1].val : null;
      const conv = p && p > 0 ? pctN(r.val, p) : "-";
      return `<tr><td>${r.name}</td><td class="num">${fmtN(r.val)}명</td><td class="conv">${conv}</td></tr>`;
    }).join("");

    // 전환 KPI
    const convKpis = [
      { label:"유입→초진 전환율", val: reportData.firstVisit && reportData.inquiry ? pctN(reportData.firstVisit, Math.round(reportData.inquiry*3.2)) : "-" },
      { label:"상담→결제 전환율", val: reportData.firstPayment && reportData.consult ? pctN(reportData.firstPayment, reportData.consult) : "-" },
      { label:"예약→내원율",      val: reportData.firstVisit && reportData.reservation ? pctN(reportData.firstVisit, reportData.reservation) : "-" },
      { label:"광고비 대비 매출", val: reportData.revenue && reportData.marketingCost ? `${(reportData.revenue/reportData.marketingCost).toFixed(1)}배` : "-" },
      { label:"재방문율",          val: reportData.visit && reportData.firstVisit ? pctN(reportData.visit-reportData.firstVisit, reportData.visit) : "-" },
      { label:"환자당 매출",       val: reportData.revenue && reportData.firstPayment ? `${fmtN(Math.round(reportData.revenue/(reportData.firstPayment||1)))}만원` : "-" },
    ].map(i => `<div class="roi-item"><div class="val">${i.val}</div><div class="lbl">${i.label}</div></div>`).join("");

    // 4. 채널 분석
    const channelRows = chData.map(c => {
      const r = c.cost > 0 ? Math.round(((c.revenue - c.cost) / c.cost) * 100) : "-";
      const rColor = +r > 300 ? "#34D399" : +r > 100 ? "#FBBF24" : "#F87171";
      return `<tr>
        <td style="font-weight:700">${c.channel}</td>
        <td class="num">${fmtN(c.inflow)}</td>
        <td class="num">${fmtN(c.visit)}</td>
        <td class="num">${fmtN(c.payment)}</td>
        <td class="num">${fmtN(c.revenue)}</td>
        <td class="num">${fmtN(c.cost)}</td>
        <td class="num" style="color:${rColor};font-weight:700">${r}%</td>
      </tr>`;
    }).join("");

    // 5. 환자 유입
    const patientRec = patientRecords.find ? patientRecords.find(r => r.month === selMonth) : null;
    const patientRows = patientRec ? patientRec.channelData
      .filter(c => c.count > 0).sort((a,b) => b.count - a.count)
      .map(c => `<tr><td>${c.channel}</td><td class="num">${fmtN(c.count)}명</td></tr>`).join("") : "";

    // 6. 마케팅 현황
    const contents = hospital.contentData || [];
    const monthContents = Array.isArray(contents)
      ? contents.filter(c => c.date && c.date.startsWith(selMonth.slice(0,7))) : [];
    const contentRows = monthContents.slice(0,20).map(c => `
      <tr>
        <td style="font-weight:600;color:#38BDF8">${c.channel}</td>
        <td>${c.title}</td><td>${c.date}</td>
        <td>${c.topExposed ? '✓' : '-'}</td><td>${c.status||'-'}</td>
      </tr>`).join("");

    // 7. 비용 관리
    const monthContract = costContracts.find(c => c.month === selMonth)?.amount || 0;
    const monthExpenses = costExpenses.filter(e => e.month === selMonth);
    const totalExpense = monthExpenses.reduce((s,e) => s+e.amount, 0);
    const expenseRows = monthExpenses.map(e => `
      <tr>
        <td>${e.date||'-'}</td><td>${e.category||'-'}</td>
        <td>${e.memo||'-'}</td><td class="num">${fmtN(e.amount)}만원</td>
      </tr>`).join("");

    // 8. 키워드 현황
    const monthKw = kwKeywords.filter ? kwKeywords.filter(k => k.month === selMonth) : [];
    const kwRows = monthKw.slice(0,30).map(k => `
      <tr>
        <td style="font-weight:600">${k.keyword}</td>
        <td>${k.channel||'-'}</td>
        <td class="num" style="font-weight:700;color:#34D399">${k.rank||'-'}</td>
        <td class="num">${k.totalRank ? k.totalRank+'위' : '-'}</td>
        <td class="num">${k.searchVol ? fmtN(k.searchVol) : '-'}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${hospital.name} 마케팅 리포트 · ${today}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F1F5F9; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif; padding: 40px 32px; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid ${hospital.color}40; }
  .hospital-name { font-size: 28px; font-weight: 900; color: #1E293B; margin-bottom: 6px; }
  .hospital-meta { color: #64748B; font-size: 13px; }
  .report-date { color: #64748B; font-size: 12px; text-align: right; }
  .report-month { color: ${hospital.color}; font-size: 22px; font-weight: 800; }
  .accent-bar { display: inline-block; width: 4px; height: 18px; background: linear-gradient(180deg, ${hospital.color}, #818CF8); border-radius: 2px; margin-right: 8px; vertical-align: middle; }
  .section { margin-bottom: 36px; }
  .section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .kpi-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; }
  .kpi-label { font-size: 12px; color: #64748B; font-weight: 600; margin-bottom: 8px; }
  .kpi-value { font-size: 26px; font-weight: 900; line-height: 1; }
  .kpi-unit { font-size: 13px; margin-left: 4px; font-weight: 600; }
  .roi-box { background: #FFFFFF; border: 1px solid ${hospital.color}30; border-radius: 12px; padding: 20px 24px; display: flex; gap: 32px; margin-bottom: 24px; flex-wrap: wrap; }
  .roi-item { text-align: center; min-width: 100px; }
  .roi-item .val { font-size: 22px; font-weight: 900; color: ${hospital.color}; }
  .roi-item .lbl { font-size: 11px; color: #64748B; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { color: #64748B; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1E293B; white-space: nowrap; background: "#F8FAFC"; }
  td { padding: 10px 14px; border-bottom: 1px solid #1E293B; }
  tr:hover td { background: ${hospital.color}08; }
  .num { text-align: right; }
  .conv { text-align: center; color: #34D399; font-weight: 700; }
  .table-wrap { background: "#F8FAFC"; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; margin-bottom: 24px; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #1E293B; color: #64748B; font-size: 11px; display: flex; justify-content: space-between; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff !important; color: #111 !important; padding: 16px !important; font-size: 12px !important; }
    .kpi-card, .roi-box, .table-wrap { border: 1px solid #ddd !important; background: #f8f9fa !important; }
    .kpi-card { break-inside: avoid; }
    .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
    th { background: #f0f0f0 !important; color: #333 !important; }
    td { color: #222 !important; border-bottom: 1px solid #eee !important; }
    .hospital-name, .section-title { color: #111 !important; }
    .kpi-label, .report-date, .footer { color: #555 !important; }
    .kpi-value { font-size: 20px !important; }
    .section { page-break-inside: avoid; margin-bottom: 24px !important; }
    .footer { border-top: 1px solid #ddd !important; }
    @page { margin: 1.5cm; size: A4; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hospital-name">${hospital.name}</div>
      <div class="hospital-meta">${hospital.dept} &nbsp;·&nbsp; ${hospital.region} &nbsp;·&nbsp; 담당 ${hospital.manager || "-"}</div>
    </div>
    <div class="report-date">
      <div class="report-month">${lastMonth} 마케팅 리포트</div>
      <div style="margin-top:4px">생성일 ${today}</div>
      <div style="margin-top:4px">작성 다올 마케팅</div>
    </div>
  </div>

  <!-- 1. 통합 요약 -->
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>통합 요약</div>
    <div class="roi-box">
      ${[
        { label:"신환 수",    val:`${fmtN(reportData.newPatient)}명` },
        { label:"매출",       val:`${fmtN(reportData.revenue)}만원` },
        { label:"마케팅비",   val:`${fmtN(reportData.marketingCost)}만원` },
        { label:"ROI",        val:`${roi2}%` },
        { label:"CPA",        val:`${reportData.newPatient ? fmtN(Math.round((reportData.marketingCost||0)/reportData.newPatient)) : "-"}만원` },
        { label:"목표 달성률",val:`${hospital.target_patients ? Math.round((reportData.newPatient||0)/hospital.target_patients*100) : "-"}%` },
      ].map(i => `<div class="roi-item"><div class="val">${i.val}</div><div class="lbl">${i.label}</div></div>`).join("")}
    </div>
    <div class="kpi-grid">${kpiCards}</div>
  </div>

  <!-- 2. 상세 성과 -->
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>상세 성과 · 월별 추이</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>월</th><th>문의</th><th>초진내원</th><th>초진결제</th><th>신환</th><th>매출(만)</th><th>마케팅비(만)</th><th>ROI</th></tr></thead>
        <tbody>${trendRows}</tbody>
      </table>
    </div>
  </div>

  <!-- 3. 전환 분석 -->
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>전환 분석</div>
    <div class="roi-box">${convKpis}</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>단계</th><th>수치</th><th>전환율</th></tr></thead>
        <tbody>${funnelRows}</tbody>
      </table>
    </div>
  </div>

  <!-- 4. 채널 분석 -->
  ${chData.length > 0 ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>채널별 성과</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>채널</th><th>유입</th><th>내원</th><th>결제</th><th>매출(만)</th><th>광고비(만)</th><th>ROI</th></tr></thead>
        <tbody>${channelRows}</tbody>
      </table>
    </div>
  </div>` : ""}

  <!-- 5. 환자 유입 -->
  ${patientRec ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>환자 유입 현황</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div class="roi-box" style="margin-bottom:0">
        <div class="roi-item"><div class="val">${fmtN(patientRec.newPatient)}명</div><div class="lbl">신환</div></div>
        <div class="roi-item"><div class="val">${fmtN(patientRec.returnPatient)}명</div><div class="lbl">구환</div></div>
        <div class="roi-item"><div class="val">${patientRec.targetNew ? Math.round(patientRec.newPatient/patientRec.targetNew*100)+'%' : '-'}</div><div class="lbl">목표 달성률</div></div>
      </div>
    </div>
    ${patientRows ? `<div class="table-wrap"><table><thead><tr><th>유입 채널</th><th>환자 수</th></tr></thead><tbody>${patientRows}</tbody></table></div>` : ""}
  </div>` : ""}

  <!-- 6. 마케팅 현황 -->
  ${monthContents.length > 0 ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>마케팅 현황 · 콘텐츠 목록</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>채널</th><th>제목</th><th>발행일</th><th>상위노출</th><th>상태</th></tr></thead>
        <tbody>${contentRows}</tbody>
      </table>
    </div>
  </div>` : ""}

  <!-- 7. 비용 관리 -->
  ${(monthContract > 0 || monthExpenses.length > 0) ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>비용 관리</div>
    <div class="roi-box" style="margin-bottom:16px">
      <div class="roi-item"><div class="val">${fmtN(monthContract)}만원</div><div class="lbl">월 계약금</div></div>
      <div class="roi-item"><div class="val">${fmtN(totalExpense)}만원</div><div class="lbl">소진액</div></div>
      <div class="roi-item"><div class="val">${fmtN(monthContract-totalExpense)}만원</div><div class="lbl">잔액</div></div>
      <div class="roi-item"><div class="val">${monthContract > 0 ? Math.round(totalExpense/monthContract*100)+'%' : '-'}</div><div class="lbl">소진율</div></div>
    </div>
    ${expenseRows ? `<div class="table-wrap"><table><thead><tr><th>날짜</th><th>항목</th><th>메모</th><th>금액</th></tr></thead><tbody>${expenseRows}</tbody></table></div>` : ""}
  </div>` : ""}

  <!-- 8. 키워드 현황 -->
  ${monthKw.length > 0 ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>키워드 현황</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>키워드</th><th>채널</th><th>현재 위치</th><th>총 순위</th><th>검색량</th></tr></thead>
        <tbody>${kwRows}</tbody>
      </table>
    </div>
  </div>` : ""}

  <div class="footer">
    <span>${hospital.name} · 다올 마케팅 리포트</span>
    <span>${today} 생성</span>
  </div>
</body>
</html>`;

    // 새 창에서 열고 바로 인쇄창 띄우기 (PDF로 저장 가능)
    const printHtml = html.replace(
      '</body>',
      `<script>window.onload = function() { window.print(); }</script></body>`
    );
    const blob = new Blob([printHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // 팝업 차단된 경우 파일로 다운로드
      const a = document.createElement("a");
      a.href = url;
      a.download = `${hospital.name}_마케팅리포트_${lastMonth}.html`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // 입력 버튼 (탭마다 다르게)
  const inputBtn = (label, onClick, color) => isAdmin ? (
    <button onClick={onClick} style={{
      background:`${color||hospital.color}20`, border:`1px solid ${color||hospital.color}50`,
      color:color||hospital.color, borderRadius:9, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700,
    }}>{label}</button>
  ) : null;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background:"#F8FAFC", borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {onBack && (
            <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:9, padding:"7px 14px", fontSize:13, cursor:"pointer", fontWeight:600 }}>
              &larr; 병원 목록
            </button>
          )}
          <div style={{ width:1, height:24, background:C.border }} />
          <div>
            <div style={{ color:C.text, fontSize:16, fontWeight:800 }}>{hospital.name}</div>
            <div style={{ color:C.muted, fontSize:11 }}>{hospital.dept} · {hospital.region} · 담당 {hospital.manager}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={() => exportReport()} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:9, padding:"8px 16px", fontSize:12, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
            리포트 출력
          </button>
          <Badge color={hospital.color}>{hospital.dept}</Badge>
          <Badge color={roi > 200 ? C.green : roi > 100 ? C.yellow : C.red}>ROI {roi}%</Badge>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, paddingLeft:28, overflowX:"auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background:"transparent", border:"none", padding:"14px 16px", fontSize:13, cursor:"pointer", fontWeight:600,
            fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif",
            color:tab===t.id ? hospital.color : C.muted,
            borderBottom:tab===t.id ? `2px solid ${hospital.color}` : "2px solid transparent",
            transition:"all 0.15s", whiteSpace:"nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div style={{ padding:"28px" }}>

        {/* 통합 요약 */}
        {tab === "overview" && (() => {
          const topChannels = [...chData].sort((a,b)=>b.revenue-a.revenue).slice(0,3);
          const totalMktCost = last.marketingCost || 0;
          const revenueAchieve = hospital.target_revenue ? Math.round((last.revenue||0) / hospital.target_revenue * 100) : 0;
          const contents = hospital.contentData || [];
          const recentContents = [...contents].sort((a,b)=>b.date>a.date?1:-1).slice(0,3);
          const topExposedCount = contents.filter(c=>c.topExposed).length;

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                <MonthSelector />
                {inputBtn(showPerfInput ? "입력 닫기" : "데이터 입력", () => setShowPerfInput(!showPerfInput))}
              </div>
              {showPerfInput && (
                <PerformanceInputForm hospital={hospital} monthlyData={hData}
                  onSave={(d) => onUpdateHospital({...hospital, monthlyData:d})}
                  onClose={() => setShowPerfInput(false)} />
              )}

              {/* KPI 4개 */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
                <KPICard label="신환 수" value={fmt(last.newPatient)} unit="명"
                  sub={`목표 달성 ${Math.round((last.newPatient||0)/(hospital.target_patients||1)*100)}%`}
                  color={hospital.color}
                  trend={prev && prev.newPatient ? Math.round(((last.newPatient - prev.newPatient)/prev.newPatient)*100) : undefined} />
                <KPICard label="매출" value={fmt(last.revenue)} unit="만원"
                  sub={`객단가 ${fmt(arpu)}만원`} color={C.yellow}
                  trend={prev && prev.revenue ? Math.round(((last.revenue - prev.revenue)/prev.revenue)*100) : undefined} />
                <KPICard label="마케팅비" value={fmt(last.marketingCost)} unit="만원" color={C.orange}
                  trend={prev && prev.marketingCost ? Math.round(((last.marketingCost - prev.marketingCost)/prev.marketingCost)*100) : undefined} />
                <KPICard label="ROI" value={roi} unit="%" sub={`CPA ${cpaVal}만원/명`} color={roi > 200 ? C.green : C.red} />
              </div>

              {/* 추이 차트 + 채널별 성과 */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                {/* 추이 차트 - 이중 Y축 */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <SectionTitle>신환 & 매출 추이</SectionTitle>
                    <div style={{ display:"flex", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <div style={{ width:10, height:3, borderRadius:2, background:hospital.color }} />
                        <span style={{ color:C.muted, fontSize:10 }}>신환(명)</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <div style={{ width:10, height:3, borderRadius:2, background:C.yellow }} />
                        <span style={{ color:C.muted, fontSize:10 }}>매출(만원)</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={hData} margin={{ top:5, right:16, left:0, bottom:0 }}>
                      <defs>
                        <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hospital.color} stopOpacity={0.25}/><stop offset="100%" stopColor={hospital.color} stopOpacity={0}/></linearGradient>
                        <linearGradient id="gy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.yellow} stopOpacity={0.2}/><stop offset="100%" stopColor={C.yellow} stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke={C.muted} tick={{ fill:C.muted, fontSize:10 }} />
                      <YAxis yAxisId="left"  stroke={hospital.color} tick={{ fill:hospital.color, fontSize:10 }} width={32} tickFormatter={v => v} />
                      <YAxis yAxisId="right" orientation="right" stroke={C.yellow} tick={{ fill:C.yellow, fontSize:10 }} width={40} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                      <TT formatter={(val, name) => name === "신환(명)" ? [`${val}명`, name] : [`${val}만원`, name]} />
                      <Area yAxisId="left"  type="monotone" dataKey="newPatient" name="신환(명)"  stroke={hospital.color} fill="url(#gp)" strokeWidth={2.5} dot={{ r:3, fill:hospital.color }} />
                      <Area yAxisId="right" type="monotone" dataKey="revenue"    name="매출(만원)" stroke={C.yellow}       fill="url(#gy)" strokeWidth={2}   dot={{ r:3, fill:C.yellow }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* 채널별 성과 TOP3 */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <SectionTitle>채널 성과 TOP3</SectionTitle>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
                    {topChannels.length === 0
                      ? <div style={{ color:C.muted, fontSize:12, textAlign:"center", marginTop:20 }}>채널 데이터를 입력해 주세요</div>
                      : topChannels.map((ch, i) => {
                          const chRoi = ch.cost > 0 ? Math.round(((ch.revenue - ch.cost) / ch.cost) * 100) : 0;
                          const chColor = CHANNEL_META[ch.channel]?.color || CH_COLORS[i];
                          const maxRev = topChannels[0]?.revenue || 1;
                          return (
                            <div key={i}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <div style={{ width:6, height:6, borderRadius:"50%", background:chColor }} />
                                  <span style={{ color:C.text, fontSize:12, fontWeight:700 }}>{ch.channel}</span>
                                </div>
                                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                  <span style={{ color:C.muted, fontSize:11 }}>유입 {fmt(ch.inflow)}</span>
                                  <span style={{ color:chRoi>200?C.green:chRoi>100?C.yellow:C.red, fontSize:11, fontWeight:700 }}>ROI {chRoi}%</span>
                                </div>
                              </div>
                              <div style={{ background:C.dim, borderRadius:3, height:5, overflow:"hidden" }}>
                                <div style={{ width:`${Math.min((ch.revenue/maxRev)*100,100)}%`, height:"100%", background:`linear-gradient(90deg,${chColor},${chColor}88)`, borderRadius:3 }} />
                              </div>
                              <div style={{ textAlign:"right", color:C.yellow, fontSize:11, fontWeight:700, marginTop:2 }}>{fmt(ch.revenue)}만원</div>
                            </div>
                          );
                        })
                    }
                  </div>
                </div>
              </div>

              {/* 비용 소진 + 콘텐츠 현황 */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

                {/* 비용 소진 현황 */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <SectionTitle>비용 소진 현황</SectionTitle>
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ color:C.muted, fontSize:11 }}>이번달 마케팅비</span>
                      <span style={{ color:C.orange, fontSize:13, fontWeight:800 }}>{fmt(totalMktCost)}만원</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ color:C.muted, fontSize:11 }}>매출 목표 달성률</span>
                      <span style={{ color: revenueAchieve>=100 ? C.green : revenueAchieve>=70 ? C.yellow : C.red, fontSize:13, fontWeight:800 }}>
                        {revenueAchieve}%
                      </span>
                    </div>
                    {/* 퍼널 미니 요약 */}
                    <div style={{ background:"#F8FAFC", borderRadius:10, padding:"10px 14px" }}>
                      <div style={{ color:C.muted, fontSize:11, marginBottom:8 }}>이번달 전환 흐름</div>
                      {[
                        { label:"문의", val:last.inquiry, color:C.accent },
                        { label:"내원", val:last.visit,   color:C.green },
                        { label:"결제", val:last.payment, color:C.yellow },
                      ].map((s,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <span style={{ color:C.muted, fontSize:11 }}>{s.label}</span>
                          <span style={{ color:s.color, fontSize:13, fontWeight:700 }}>{fmt(s.val)}건</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 콘텐츠 현황 */}
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
                  <SectionTitle>마케팅 콘텐츠 현황</SectionTitle>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, margin:"10px 0 12px" }}>
                    {[
                      { label:"총 콘텐츠", val:`${contents.length}건`, color:hospital.color },
                      { label:"상위노출", val:`${topExposedCount}건`, color:C.green },
                      { label:"총 클릭", val:`${fmt(contents.reduce((s,c)=>s+(c.clicks||0),0))}`, color:C.yellow },
                      { label:"채널 수", val:`${new Set(contents.map(c=>c.channel)).size}개`, color:C.accent2 },
                    ].map((item,i) => (
                      <div key={i} style={{ background:"#F8FAFC", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ color:C.muted, fontSize:10, marginBottom:3 }}>{item.label}</div>
                        <div style={{ color:item.color, fontSize:15, fontWeight:800 }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color:C.muted, fontSize:11, marginBottom:6, fontWeight:600 }}>최근 발행</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {recentContents.length === 0
                      ? <div style={{ color:C.muted, fontSize:11 }}>콘텐츠 데이터 없음</div>
                      : recentContents.map((c,i) => {
                          const cColor = CHANNEL_META[c.channel]?.color || C.muted;
                          return (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ width:5, height:5, borderRadius:"50%", background:cColor, flexShrink:0 }} />
                              <span style={{ color:C.text, fontSize:11, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</span>
                              <span style={{ color:C.muted, fontSize:10, flexShrink:0 }}>{c.clicks||0}클릭</span>
                            </div>
                          );
                        })
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 상세 성과 */}
        {tab === "performance" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <MonthSelector />
              {inputBtn(showPerfInput ? "입력 닫기" : "데이터 입력", () => setShowPerfInput(!showPerfInput))}
            </div>
            {showPerfInput && (
              <PerformanceInputForm hospital={hospital} monthlyData={hData}
                onSave={(d) => onUpdateHospital({...hospital, monthlyData:d})}
                onClose={() => setShowPerfInput(false)} />
            )}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14 }}>
              <KPICard label="문의" value={fmt(last.inquiry)} unit="건" color={C.accent} />
              <KPICard label="상담" value={fmt(last.consult)} unit="건" sub={`전환 ${pct(last.consult, last.inquiry)}`} color={C.accent2} />
              <KPICard label="예약" value={fmt(last.reservation)} unit="건" sub={`전환 ${pct(last.reservation, last.consult)}`} color={C.green} />
              <KPICard label="내원" value={fmt(last.visit)} unit="명" sub={`전환 ${pct(last.visit, last.reservation)}`} color={C.yellow} />
              <KPICard label="결제" value={fmt(last.payment)} unit="건" sub={`전환 ${pct(last.payment, last.visit)}`} color={C.orange} />
              <KPICard label="신환" value={fmt(last.newPatient)} unit="명" color={hospital.color} />
              <KPICard label="매출" value={fmt(last.revenue)} unit="만원" color={C.yellow} />
              <KPICard label="ROI" value={roi} unit="%" color={roi > 200 ? C.green : C.red} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                <SectionTitle>월별 신환 & 결제 추이</SectionTitle>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={hData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <YAxis stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <TT /><Legend wrapperStyle={{ color:C.muted, fontSize:12 }} />
                    <Line type="monotone" dataKey="newPatient" name="신환" stroke={hospital.color} strokeWidth={2.5} dot={{ r:4, fill:hospital.color }} />
                    <Line type="monotone" dataKey="payment" name="결제" stroke={C.orange} strokeWidth={2} dot={{ r:3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                <SectionTitle>매출 vs 마케팅비</SectionTitle>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={hData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <YAxis stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
                    <TT /><Legend wrapperStyle={{ color:C.muted, fontSize:12 }} />
                    <Bar dataKey="revenue" name="매출" fill={C.yellow} radius={[4,4,0,0]} />
                    <Bar dataKey="marketingCost" name="마케팅비" fill={C.orange} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 환자 유입 */}
        {tab === "patient" && <PatientTab hospital={hospital} onDataLoad={setSharedPatientData} />}

        {/* 키워드/SEO */}
        {/* 마케팅 현황 */}
        {tab === "marketing" && (
          <MarketingTab hospital={hospital} chData={chData} initialContents={hospital.contentData || []} onUpdateHospital={onUpdateHospital} isAdmin={isAdmin} />
        )}

        {/* 채널 분석 */}
        {tab === "channel" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <MonthSelector />
              {inputBtn(showChannelInput ? "입력 닫기" : "채널 데이터 입력", () => setShowChannelInput(!showChannelInput))}
            </div>
            {showChannelInput && (
              <ChannelInputForm hospital={hospital}
                channelData={(() => {
                  const cd = hospital.channelData || [];
                  if (Array.isArray(cd)) return selMonth ? (cd.find ? cd : []) : cd;
                  return cd[selMonth] || [];
                })()}
                onSave={(d) => {
                  const existing = hospital.channelData || {};
                  const updated = Array.isArray(existing)
                    ? { [selMonth]: d }
                    : { ...existing, [selMonth]: d };
                  onUpdateHospital({...hospital, channelData: updated});
                }}
                onClose={() => setShowChannelInput(false)} />
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                <SectionTitle>채널별 ROI 순위</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:4 }}>
                  {[...chData].sort((a,b)=>(b.revenue-b.cost)/(b.cost||1)-(a.revenue-a.cost)/(a.cost||1)).map((c,i) => {
                    const r = c.cost > 0 ? Math.round(((c.revenue-c.cost)/c.cost)*100) : 999;
                    return (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ color:C.text, fontSize:12 }}><span style={{ color:CH_COLORS[i], marginRight:6, fontWeight:700 }}>#{i+1}</span>{c.channel}</span>
                          <span style={{ color:r>300?C.green:r>100?C.yellow:C.red, fontSize:12, fontWeight:700 }}>{r}%</span>
                        </div>
                        <div style={{ background:C.dim, borderRadius:3, height:5 }}>
                          <div style={{ width:`${Math.min((r/800)*100,100)}%`, height:"100%", background:r>300?C.green:C.yellow, borderRadius:3 }} />
                        </div>
                      </div>
                    );
                  })}
                  {chData.length===0 && <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:"20px 0" }}>채널 데이터를 입력해 주세요.</div>}
                </div>
              </div>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
                <SectionTitle>매출 기여 비중</SectionTitle>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chData} cx="50%" cy="50%" outerRadius={95} dataKey="revenue" paddingAngle={2}>
                      {chData.map((_,i) => <Cell key={i} fill={CH_COLORS[i%CH_COLORS.length]} />)}
                    </Pie>
                    <TT formatter={(v) => [`${fmt(v)}만원`]} />
                    <Legend wrapperStyle={{ color:C.muted, fontSize:11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
              <SectionTitle>채널별 상세 성과 테이블</SectionTitle>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>{["채널","유입","내원","결제","전환율","매출(만)","광고비(만)","CPA(만)","ROI"].map(h=>(
                      <th key={h} style={{ color:C.muted, fontWeight:600, padding:"8px 12px", textAlign:"left", borderBottom:`1px solid ${C.dim}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {chData.map((c,i) => {
                      const conv = c.inflow>0?((c.payment/c.inflow)*100).toFixed(2):0;
                      const cpa = c.cost>0&&c.payment>0?Math.round(c.cost/c.payment):"-";
                      const r = c.cost>0?Math.round(((c.revenue-c.cost)/c.cost)*100):"-";
                      return (
                        <tr key={i} style={{ borderBottom:`1px solid ${C.dim}` }}
                          onMouseEnter={e=>e.currentTarget.style.background=`${hospital.color}08`}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"9px 12px", color:CH_COLORS[i%CH_COLORS.length], fontWeight:700 }}>{c.channel}</td>
                          <td style={{ padding:"9px 12px", color:C.muted }}>{fmt(c.inflow)}</td>
                          <td style={{ padding:"9px 12px", color:C.text }}>{fmt(c.visit)}</td>
                          <td style={{ padding:"9px 12px", color:C.yellow, fontWeight:600 }}>{fmt(c.payment)}</td>
                          <td style={{ padding:"9px 12px", color:+conv>3?C.green:C.muted }}>{conv}%</td>
                          <td style={{ padding:"9px 12px", color:C.yellow }}>{fmt(c.revenue)}</td>
                          <td style={{ padding:"9px 12px", color:C.orange }}>{fmt(c.cost)}</td>
                          <td style={{ padding:"9px 12px" }}>{cpa}</td>
                          <td style={{ padding:"9px 12px", color:+r>300?C.green:+r>100?C.yellow:C.red, fontWeight:700 }}>{r}%</td>
                        </tr>
                      );
                    })}
                    {chData.length===0 && <tr><td colSpan={11} style={{ padding:"32px", textAlign:"center", color:C.muted }}>채널 데이터를 입력해 주세요.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 전환 분석 */}
        {tab === "funnel" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <MonthSelector />
              {inputBtn(showPerfInput ? "입력 닫기" : "데이터 입력", () => setShowPerfInput(!showPerfInput))}
            </div>
            {showPerfInput && (
              <PerformanceInputForm hospital={hospital} monthlyData={hData}
                onSave={(d) => onUpdateHospital({...hospital, monthlyData:d})}
                onClose={() => setShowPerfInput(false)} />
            )}

            {/* 🔷 1. 상단 결과 KPI */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {[
                { label:"총 매출",      value:`${fmt(last.revenue||0)}만원`,  color:C.yellow },
                { label:"총 환자수",    value:`${fmt((last.visit||0)+(last.newPatient||0))}명`, color:hospital.color },
                { label:"환자당 매출",  value: last.revenue && (last.visit||last.newPatient) ? `${fmt(Math.round(last.revenue/((last.visit||0)+(last.newPatient||0)||1)))}만원` : "-", color:C.green },
                { label:"재방문율",     value: last.visit && last.newPatient ? `${(((last.visit-last.newPatient)/last.visit)*100).toFixed(1)}%` : "-", color:C.accent2 },
              ].map((item,i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${item.color}25`, borderRadius:14, padding:"18px 20px" }}>
                  <div style={{ color:C.muted, fontSize:11, marginBottom:6 }}>{item.label}</div>
                  <div style={{ color:item.color, fontSize:24, fontWeight:900 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 🔷 2. 중앙 퍼널 */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
              <SectionTitle>전환 퍼널 현황</SectionTitle>
              {(() => {
                const funnelSteps = [
                  { name:"유입",     value:Math.round((last.inquiry||0)*3.2), color:C.accent,   prevValue:Math.round((prev?.inquiry||0)*3.2) },
                  { name:"문의",     value:last.inquiry||0,                   color:"#60A5FA",  prevValue:prev?.inquiry||0 },
                  { name:"상담",     value:last.consult||0,                   color:C.accent2,  prevValue:prev?.consult||0 },
                  { name:"예약",     value:last.reservation||0,               color:C.green,    prevValue:prev?.reservation||0 },
                  { name:"초진내원", value:last.firstVisit||0,                color:C.yellow,   prevValue:prev?.firstVisit||0 },
                  { name:"초진결제", value:last.firstPayment||0,              color:C.orange,   prevValue:prev?.firstPayment||0 },
                  { name:"재내원",   value:last.visit ? Math.max(0,(last.visit||0)-(last.firstVisit||0)) : 0, color:C.red, prevValue: prev?.visit ? Math.max(0,(prev.visit||0)-(prev.firstVisit||0)) : 0 },
                ];
                const maxVal = Math.max(...funnelSteps.map(s=>s.value), 1);
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, maxWidth:720, margin:"0 auto" }}>
                    {funnelSteps.map((step, i) => {
                      const width = Math.max((step.value/maxVal)*100, 3);
                      const pctOfPrev = i > 0 && funnelSteps[i-1].value > 0
                        ? Math.round((step.value/funnelSteps[i-1].value)*100) : null;
                      const diff = prev ? step.value - step.prevValue : null;
                      return (
                        <div key={i}>
                          {i > 0 && (
                            <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:68, marginBottom:2 }}>
                              <span style={{ color:C.dim, fontSize:11 }}>↓</span>
                            </div>
                          )}
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:56, color:step.color, fontSize:12, fontWeight:700, textAlign:"right", flexShrink:0 }}>{step.name}</div>
                            <div style={{ flex:1, height:36, background:C.dim, borderRadius:8, position:"relative" }}>
                              <div style={{ width:`${width}%`, height:"100%", background:`linear-gradient(90deg,${step.color}88,${step.color}44)`, borderRadius:8 }} />
                              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#0F172A", fontSize:13, fontWeight:800 }}>{fmt(step.value)}명</span>
                            </div>
                            <div style={{ width:90, flexShrink:0 }}>
                              {diff !== null
                                ? diff > 0 ? <span style={{ color:C.green, fontSize:11, fontWeight:700 }}>▲ {fmt(diff)}명</span>
                                : diff < 0 ? <span style={{ color:C.red, fontSize:11, fontWeight:700 }}>▼ {fmt(Math.abs(diff))}명</span>
                                : <span style={{ color:C.muted, fontSize:11 }}>— 동일</span>
                                : <span style={{ color:C.muted, fontSize:11 }}>전월 없음</span>
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* 🔷 3. 하단 핵심 KPI */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {[
                { label:"유입 → 초진 전환율",  value: last.firstVisit && last.inquiry ? `${((last.firstVisit/Math.round(last.inquiry*3.2))*100).toFixed(1)}%` : "-", color:hospital.color, tip:"유입 대비 초진 내원 비율" },
                { label:"상담 → 결제 전환율",  value: last.firstPayment && last.consult ? `${((last.firstPayment/last.consult)*100).toFixed(1)}%` : "-", color:C.accent2, tip:"상담 후 초진 결제 전환" },
                { label:"예약 → 내원율",       value: last.firstVisit && last.reservation ? `${((last.firstVisit/last.reservation)*100).toFixed(1)}%` : "-", color:C.green, tip:"예약 후 실제 초진 내원율" },
                { label:"신규 환자당 매출",     value: last.revenue && last.firstPayment ? `${fmt(Math.round(last.revenue/last.firstPayment))}만원` : "-", color:C.yellow, tip:"초진 결제 1건당 평균 매출" },
                { label:"광고비 대비 매출",     value: last.revenue && last.marketingCost ? `${(last.revenue/last.marketingCost).toFixed(1)}배` : "-", color:C.orange, tip:"마케팅비 1만원당 매출" },
                { label:"재방문율",             value: last.visit && last.firstVisit ? `${(((last.visit-last.firstVisit)/last.visit)*100).toFixed(1)}%` : "-", color:C.red, tip:"전체 내원 중 재내원 비율" },
              ].map((item,i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
                  <div style={{ color:C.muted, fontSize:11, marginBottom:8 }}>{item.label}</div>
                  <div style={{ color:item.color, fontSize:26, fontWeight:900 }}>{item.value}</div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:8, paddingTop:8, borderTop:`1px solid ${C.dim}` }}>💡 {item.tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 비용 관리 */}
        {tab === "cost" && <CostTab hospital={hospital} hData={hData} onDataLoad={setSharedCostData} isReadOnly={isReadOnly} />}
        {tab === "meeting" && <MeetingTab hospital={hospital} isReadOnly={isReadOnly} />}
        {tab === "keyword" && <KeywordRankTab hospital={hospital} isAdmin={isAdmin} onDataLoad={setSharedKeywordData} isReadOnly={isReadOnly} />}
        {tab === "schedule" && <HospitalScheduleTab hospital={hospital} globalSchedules={globalSchedules} saveGlobalSchedules={saveGlobalSchedules} isReadOnly={isReadOnly} />}

      </div>
    </div>
  );
}

// ─── 병원별 일정 관리 탭 ─────────────────────────────────────
// schedule_data(Supabase)를 단일 소스로 사용 - 내부/팀장/칸반 전부 동기화
function HospitalScheduleTab({ hospital, globalSchedules, saveGlobalSchedules, isReadOnly }) {
  const schedules = (globalSchedules||[]).filter(s => s.hospitalId === hospital.id || s.hospital === hospital.name);
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:"", title:"", memo:"", assignee:"" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ date:"", title:"", memo:"", assignee:"" });
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  const addSchedule = async () => {
    if (!form.date || !form.title) return;
    const color = getAssigneeColor(form.assignee) || hospital.color;
    const newItem = { id:Date.now(), ...form, color, hospital:hospital.name, hospitalId:hospital.id, hospitalColor:hospital.color, source:"hospital" };
    await saveGlobalSchedules([...(globalSchedules||[]), newItem]);
    setForm({ date:"", title:"", memo:"", assignee:"" });
    setShowForm(false); toast("일정 추가 완료! 내부 일정에도 즉시 반영됐어요.");
  };

  const updateSchedule = async () => {
    const color = getAssigneeColor(editForm.assignee) || hospital.color;
    const updated = (globalSchedules||[]).map(s => s.id === editId ? { ...s, ...editForm, color } : s);
    await saveGlobalSchedules(updated);
    setEditId(null); toast("수정 완료!");
  };

  const deleteSchedule = async (id) => {
    await saveGlobalSchedules((globalSchedules||[]).filter(s => s.id !== id));
    setDeleteConfirm(null); toast("삭제 완료!");
  };

  const [y, m] = selMonth.split('-').map(Number);
  const firstDay = new Date(y, m-1, 1).getDay();
  const lastDate = new Date(y, m, 0).getDate();
  const calDays = [];
  for (let i=0; i<firstDay; i++) calDays.push(null);
  for (let d=1; d<=lastDate; d++) calDays.push(d);
  const monthSchedules = schedules.filter(s => s.date?.startsWith(selMonth)).sort((a,b)=>a.date>b.date?1:-1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Toast msg={savedMsg} />

      {/* 월 네비게이션 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => { const [y,m]=selMonth.split('-').map(Number); setSelMonth(m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`); }}
            style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", color:C.muted, fontSize:13 }}>‹</button>
          <span style={{ color:C.text, fontWeight:700, fontSize:15 }}>{y}년 {m}월</span>
          <button onClick={() => { const [y,m]=selMonth.split('-').map(Number); setSelMonth(m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,'0')}`); }}
            style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", color:C.muted, fontSize:13 }}>›</button>
        </div>
        {!isReadOnly && (
          <button onClick={() => setShowForm(!showForm)} style={{
            background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none",
            color:"#0F172A", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700,
          }}>+ 일정 추가</button>
        )}
      </div>

      {/* 일정 추가 폼 */}
      {showForm && (
        <div style={{ background:C.surface, border:`1px solid ${hospital.color}30`, borderRadius:14, padding:18 }}>
          <div style={{ color:C.text, fontWeight:700, fontSize:13, marginBottom:12 }}>새 일정 추가</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>날짜 *</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>제목 *</label>
              <input type="text" value={form.title} placeholder="일정 제목" onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>담당자</label>
            <select value={form.assignee||""} onChange={e=>setForm(p=>({...p,assignee:e.target.value}))}
              style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
              <option value="">담당자 선택 (선택)</option>
              {["대표님","서보영","김혜지","박다은","홍동호"].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
            {form.assignee && <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:getAssigneeColor(form.assignee)||hospital.color }} />
              <span style={{ color:C.muted, fontSize:11 }}>색상 자동 적용</span>
            </div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label>
            <input type="text" value={form.memo} placeholder="메모 (선택)" onChange={e=>setForm(p=>({...p,memo:e.target.value}))}
              style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addSchedule} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 18px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
            <button onClick={() => setShowForm(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        {/* 캘린더 */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
            {["일","월","화","수","목","금","토"].map((d,i) => (
              <div key={d} style={{ textAlign:"center", color:i===0?C.red:i===6?C.accent:C.muted, fontSize:11, fontWeight:600, padding:"4px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {calDays.map((d, i) => {
              const dateStr = d ? `${selMonth}-${String(d).padStart(2,'0')}` : null;
              const dayScheds = dateStr ? schedules.filter(s => s.date === dateStr) : [];
              const isToday = dateStr === new Date().toISOString().slice(0,10);
              const dow = i % 7;
              return (
                <div key={i} style={{ minHeight:64, background:isToday?`${hospital.color}10`:"#F8FAFC", borderRadius:8, padding:4, border:isToday?`1px solid ${hospital.color}40`:`1px solid ${C.border}`, opacity:d?1:0 }}>
                  {d && <>
                    <div style={{ color:isToday?hospital.color:dow===0?C.red:dow===6?C.accent2:C.text, fontSize:11, fontWeight:isToday?800:500, marginBottom:2 }}>{d}</div>
                    {dayScheds.map((s,j) => (
                      <div key={j} style={{ background:s.color||hospital.color, borderRadius:3, padding:"1px 4px", fontSize:10, color:"#0F172A", fontWeight:600, marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{s.title}</div>
                    ))}
                  </>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 일정 목록 */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
          <div style={{ color:C.text, fontWeight:700, fontSize:13, marginBottom:12 }}>{m}월 일정 ({monthSchedules.length}건)</div>
          {monthSchedules.length === 0
            ? <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>일정이 없어요</div>
            : monthSchedules.map(s => (
              <div key={s.id} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                {editId === s.id ? (
                  <div style={{ background:"#F8FAFC", borderRadius:10, padding:10, border:`1px solid ${hospital.color}40` }}>
                    <div style={{ color:hospital.color, fontSize:11, fontWeight:700, marginBottom:8 }}>✏️ 수정</div>
                    <input type="date" value={editForm.date} onChange={e=>setEditForm(p=>({...p,date:e.target.value}))}
                      style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12 }} />
                    <input type="text" value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))}
                      placeholder="제목" style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12 }} />
                    <select value={editForm.assignee||""} onChange={e=>setEditForm(p=>({...p,assignee:e.target.value}))}
                      style={{ ...inputSt, marginBottom:6, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                      <option value="">담당자 선택</option>
                      {["대표님","서보영","김혜지","박다은","홍동호"].map(a=><option key={a} value={a}>{a}</option>)}
                    </select>
                    <input type="text" value={editForm.memo||""} onChange={e=>setEditForm(p=>({...p,memo:e.target.value}))}
                      placeholder="메모" style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12 }} />
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={updateSchedule} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                      <button onClick={() => setEditId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:4, minHeight:40, borderRadius:2, background:s.color||hospital.color, flexShrink:0, marginTop:2 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontWeight:700, fontSize:13 }}>{s.title}</div>
                      <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>📅 {s.date}</div>
                      {s.assignee && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>👤 {s.assignee}</div>}
                      {s.memo && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>💬 {s.memo}</div>}
                    </div>
                    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      <button onClick={() => { setEditId(s.id); setEditForm({ date:s.date, title:s.title, memo:s.memo||"", assignee:s.assignee||"" }); }}
                        style={{ background:`${hospital.color}10`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:600 }}>수정</button>
                      {deleteConfirm === s.id
                        ? <button onClick={() => deleteSchedule(s.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>확인</button>
                        : <button onClick={() => setDeleteConfirm(s.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                      }
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

const CONTENT_INIT = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[] };

// ─── 메인 앱 ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }`}</style>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [adminRole, setAdminRole] = useState(""); // "최고관리자" | "중간관리자" | "실무자"
  const [globalSchedules, setGlobalSchedules] = useState([]);

  const saveGlobalSchedules = async (updated) => {
    setGlobalSchedules(updated);
    try { await supabase.from('schedule_data').upsert({ id:1, data:updated }, { onConflict:'id' }); } catch(e) {}
  };

  // ─── Supabase에서 데이터 불러오기 ────────────────────────────
  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const { data: hospRows } = await supabase.from('hospitals').select('*');
      const { data: monthlyRows } = await supabase.from('monthly_data').select('*');
      const { data: channelRows } = await supabase.from('channel_data').select('*');
      const { data: contentRows } = await supabase.from('content_data').select('*');
      const { data: meetingRows } = await supabase.from('meeting_data').select('*');
      const schedRes = await supabase.from('schedule_data').select('*').eq('id', 1).single();
      if (schedRes.data?.data) setGlobalSchedules(schedRes.data.data);

      if (hospRows && hospRows.length > 0) {
        // DB에 데이터가 있으면 불러오기
        const loaded = hospRows.map(row => {
          const h = row.data;
          const hId = Number(h.id);
          const monthly = monthlyRows?.find(r => Number(r.hospital_id) === hId);
          const channel = channelRows?.find(r => Number(r.hospital_id) === hId);
          const content = contentRows?.find(r => Number(r.hospital_id) === hId);
          const meeting = meetingRows?.find(r => Number(r.hospital_id) === hId);
          return {
            ...h,
            monthlyData: monthly?.data || [],
            channelData: channel?.data || [],
            contentData: content?.data || [],
            meetingData: meeting?.data || [],
            // 기존 병원에 새 탭(schedule 등) 자동 추가
            tabs: h.tabs ? [...new Set([...h.tabs, 'schedule'])] : DEFAULT_TABS,
          };
        });
        setHospitals(loaded);
      } else {
        // DB가 비어있으면 초기 데이터로 시작 후 저장
        const initial = HOSPITALS_INIT.map(h => ({
          ...h,
          monthlyData: MONTHLY_INIT[h.id] || [],
          channelData: CHANNEL_INIT[h.id] || [],
          contentData: CONTENT_INIT[h.id] || [],
          meetingData: [],
        }));
        setHospitals(initial);
        await saveAllToSupabase(initial, supabase);
      }
    } catch (err) {
      console.error('DB 로드 실패, 로컬 데이터 사용:', err);
      setHospitals(HOSPITALS_INIT.map(h => ({
        ...h,
        monthlyData: MONTHLY_INIT[h.id] || [],
        channelData: CHANNEL_INIT[h.id] || [],
        contentData: CONTENT_INIT[h.id] || [],
        meetingData: [],
      })));
    } finally {
      setLoading(false);
    }
  };

  const saveAllToSupabase = async (hospitalList, supabase) => {
    for (const h of hospitalList) {
      const { monthlyData, channelData, contentData, meetingData, ...hospData } = h;
      await supabase.from('hospitals').upsert({ id: h.id, data: hospData });
      await supabase.from('monthly_data').upsert({ hospital_id: h.id, data: monthlyData }, { onConflict: 'hospital_id' });
      await supabase.from('channel_data').upsert({ hospital_id: h.id, data: channelData }, { onConflict: 'hospital_id' });
      await supabase.from('content_data').upsert({ hospital_id: h.id, data: contentData }, { onConflict: 'hospital_id' });
      await supabase.from('meeting_data').upsert({ hospital_id: h.id, data: meetingData || [] }, { onConflict: 'hospital_id' });
    }
  };

  const saveHospitalToSupabase = async (h) => {
    try {
      
      const { monthlyData, channelData, contentData, meetingData, ...hospData } = h;
      await supabase.from('hospitals').upsert({ id: h.id, data: hospData });
      await supabase.from('monthly_data').upsert({ hospital_id: h.id, data: monthlyData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('channel_data').upsert({ hospital_id: h.id, data: channelData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('content_data').upsert({ hospital_id: h.id, data: contentData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('meeting_data').upsert({ hospital_id: h.id, data: meetingData || [] }, { onConflict: 'hospital_id' });
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handleUpdateHospital = async (updated) => {
    setHospitals(prev => prev.map(h => h.id === updated.id ? updated : h));
    setSelectedId(updated.id);
    await saveHospitalToSupabase(updated);
    await logActivity("데이터 수정", updated.name, "병원 데이터 업데이트");
  };

  const handleAddHospital = async (form) => {
    const newId = Date.now();
    const newHospital = {
      ...form, id: newId,
      monthlyData: [], channelData: [], contentData: [], meetingData: [],
    };
    setHospitals(prev => [...prev, newHospital]);
    await saveHospitalToSupabase(newHospital);
    await logActivity("병원 추가", form.name, "새 병원 등록");
  };

  const handleEditHospital = async (updated) => {
    setHospitals(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated } : h));
    const full = hospitals.find(h => h.id === updated.id);
    if (full) await saveHospitalToSupabase({ ...full, ...updated });
    await logActivity("병원 정보 수정", updated.name, "병원 기본 정보 변경");
  };

  const handleDeleteHospital = async (id) => {
    const hospital = hospitals.find(h => h.id === id);
    setHospitals(prev => prev.filter(h => h.id !== id));
    try {
      await supabase.from('hospitals').delete().eq('id', id);
      await supabase.from('monthly_data').delete().eq('hospital_id', id);
      await supabase.from('channel_data').delete().eq('hospital_id', id);
      await supabase.from('content_data').delete().eq('hospital_id', id);
      await supabase.from('meeting_data').delete().eq('hospital_id', id);
      await logActivity("병원 삭제", hospital?.name || "", "병원 완전 삭제");
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  const selected = hospitals.find(h => h.id === selectedId);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <div style={{ color:"#38BDF8", fontSize:18, fontWeight:700 }}>다올 마케팅 대시보드</div>
      <div style={{ color:"#64748B", fontSize:13 }}>데이터를 불러오는 중이에요...</div>
    </div>
  );

  // 병원 공유 링크(/hospital/:id)로 직접 접속 시 로그인 스킵
  const isHospitalRoute = location.pathname.startsWith('/hospital/');

  // 로그인 화면 (메인 접속 시에만)
  if (!isLoggedIn && !isHospitalRoute) return (
    <LoginScreen onLogin={(name, isSuperAdminFlag, role) => {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setIsSuperAdmin(isSuperAdminFlag);
      setLoginName(name);
      setAdminRole(role || (isSuperAdminFlag ? "최고관리자" : "중간관리자"));
      sessionStorage.setItem("daall_actor", name);
    }} />
  );

  return (
    <Routes>
      <Route path="/" element={
        <HospitalSelectScreen
          hospitals={hospitals}
          onSelect={(h) => { setSelectedId(h.id); navigate(`/hospital/${h.id}`); }}
          onAddHospital={handleAddHospital}
          onEditHospital={handleEditHospital}
          onDeleteHospital={handleDeleteHospital}
          onUpdateHospital={handleUpdateHospital}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          adminRole={adminRole}
          loginName={loginName}
          globalSchedules={globalSchedules}
          saveGlobalSchedules={saveGlobalSchedules}
          onAdminLogout={() => { setIsAdmin(false); setIsLoggedIn(false); setIsSuperAdmin(false); setLoginName(""); setAdminRole(""); sessionStorage.removeItem("daall_actor"); }}
        />
      } />
      <Route path="/hospital/:hospitalId" element={
        <HospitalRoute
          hospitals={hospitals}
          onUpdateHospital={handleUpdateHospital}
          isAdmin={isAdmin}
          adminRole={adminRole}
          globalSchedules={globalSchedules}
          saveGlobalSchedules={saveGlobalSchedules}
        />
      } />
    </Routes>
  );
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const pwRef = useRef(null);
  const SUPER_ADMIN_PW = "Daall";

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('admin_accounts').select('*').eq('id', 1).single();
        if (data?.data?.length > 0) setAccounts(data.data);
        else setAccounts([{ id:1, name:"임지혜", password:"Daall" }]);
      } catch(e) { setAccounts([{ id:1, name:"임지혜", password:"Daall" }]); }
    };
    load();
  }, []);

  const handleLogin = () => {
    const matched = accounts.find(a => a.password === pw);
    if (matched) {
      const role = matched.role || (matched.password === SUPER_ADMIN_PW ? "최고관리자" : "중간관리자");
      onLogin(matched.name, matched.password === SUPER_ADMIN_PW, role);
    } else {
      setError(true); setPw("");
      setTimeout(() => pwRef.current?.focus(), 0);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <div style={{ background:"#F8FAFC", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 40px", width:360, textAlign:"center" }}>
        <div style={{ fontSize:28, fontWeight:900, color:"#0F172A", marginBottom:8 }}>다올 마케팅</div>
        <div style={{ color:"#64748B", fontSize:13, marginBottom:32 }}>대시보드에 접근하려면 로그인하세요</div>
        <input
          ref={pwRef}
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="비밀번호 입력"
          autoFocus
          style={{ width:"100%", background:"#F1F5F9", border:`1px solid ${error?"#F87171":"rgba(255,255,255,0.1)"}`, borderRadius:10, color:"#0F172A", padding:"12px 16px", fontSize:15, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif", outline:"none", letterSpacing:4, marginBottom:8, boxSizing:"border-box" }}
        />
        {error && <div style={{ color:"#F87171", fontSize:12, marginBottom:12 }}>비밀번호가 틀렸어요</div>}
        <button onClick={handleLogin} style={{ width:"100%", background:"linear-gradient(135deg,#38BDF8,#818CF8)", border:"none", color:"#0F172A", borderRadius:10, padding:"13px 0", fontSize:15, cursor:"pointer", fontWeight:700, marginTop:8 }}>
          로그인
        </button>
      </div>
    </div>
  );
}

function HospitalRoute({ hospitals, onUpdateHospital, isAdmin, adminRole, globalSchedules, saveGlobalSchedules }) {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const hospital = hospitals.find(h => String(h.id) === String(hospitalId));

  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const pwRef = useRef(null);

  // 관리자이거나 비밀번호 없는 병원은 바로 접근
  const needsPw = !isAdmin && hospital?.password;
  const canAccess = isAdmin || unlocked || !hospital?.password;

  const handleUnlock = () => {
    if (pwInput === hospital.password) {
      setUnlocked(true); setPwError(false);
    } else {
      setPwError(true); setPwInput("");
      setTimeout(() => pwRef.current?.focus(), 0);
    }
  };

  if (!hospital) return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <div style={{ color:"#38BDF8", fontSize:18, fontWeight:700 }}>병원을 찾을 수 없어요</div>
      <button onClick={() => navigate("/")} style={{ background:"transparent", border:"1px solid #334155", color:"#64748B", borderRadius:9, padding:"8px 20px", fontSize:13, cursor:"pointer" }}>← 목록으로</button>
    </div>
  );

  // 비밀번호 입력 화면
  if (!canAccess) return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <div style={{ background:"#F8FAFC", border:`1px solid ${hospital.color}30`, borderRadius:20, padding:40, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        {/* 병원 정보 */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, borderRadius:13, background:`linear-gradient(135deg,${hospital.color},${hospital.color}88)`, flexShrink:0 }} />
          <div>
            <div style={{ color:"#0F172A", fontSize:16, fontWeight:800 }}>{hospital.name}</div>
            <div style={{ color:"#64748B", fontSize:12, marginTop:2 }}>{hospital.dept} · {hospital.region}</div>
          </div>
        </div>
        <div style={{ color:"#0F172A", fontSize:14, fontWeight:700, marginBottom:6 }}>비밀번호를 입력해주세요</div>
        <div style={{ color:"#64748B", fontSize:12, marginBottom:20 }}>이 대시보드는 비밀번호로 보호되어 있어요</div>
        <input
          ref={pwRef}
          type="password"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={e => e.key === "Enter" && handleUnlock()}
          placeholder="비밀번호"
          autoFocus
          style={{ background:"#F1F5F9", border:`1px solid ${pwError ? "#F87171" : "#0F172A"}`, borderRadius:8, color:"#0F172A", padding:"10px 14px", fontSize:15, fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif", width:"100%", outline:"none", letterSpacing:4, marginBottom:8 }}
        />
        {pwError && <div style={{ color:"#F87171", fontSize:12, marginBottom:12 }}>비밀번호가 틀렸어요</div>}
        <button onClick={handleUnlock} style={{ width:"100%", background:`linear-gradient(135deg,${hospital.color},#818CF8)`, border:"none", color:"#0F172A", borderRadius:10, padding:"12px 0", fontSize:14, cursor:"pointer", fontWeight:700, marginTop:8 }}>
          입장하기
        </button>
      </div>
    </div>
  );

  return (
    <HospitalDashboard
      hospital={hospital}
      onBack={isAdmin ? () => navigate("/") : null}
      onUpdateHospital={onUpdateHospital}
      isAdmin={isAdmin}
      adminRole={adminRole}
      globalSchedules={globalSchedules}
      saveGlobalSchedules={saveGlobalSchedules}
    />
  );
}

