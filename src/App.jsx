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

const SCHED_TYPES = [
  { id:"design",    label:"디자인",    color:"#A78BFA", icon:"🎨" },
  { id:"marketing", label:"마케팅",    color:"#0EA5E9", icon:"📣" },
  { id:"cs",        label:"CS",        color:"#F97316", icon:"📞" },
  { id:"meeting",   label:"미팅일정",  color:"#10B981", icon:"🤝" },
  { id:"regular",   label:"상시일정",  color:"#0891B2", icon:"📅" },
];
const getSchedTypeColor = (typeId) => SCHED_TYPES.find(t=>t.id===typeId)?.color || "#64748B";
const CH_COLORS = ["#00C49F","#0088FE","#FFBB28","#FF8042","#A28DFF","#FF6B9D","#FF6B35","#4ECDC4","#45B7D1","#96CEB4"];

const CHANNEL_META = {
  "네이버블로그":  { color:"#03C75A" }, "인스타그램":   { color:"#E1306C" },
  "유튜브":        { color:"#FF0000" }, "네이버카페":   { color:"#0088FE" },
  "지식인":        { color:"#FFBB28" }, "홈페이지SEO":  { color:"#38BDF8" },
  "워드프레스":    { color:"#8B5CF6" }, "메타광고":     { color:"#4ECDC4" },
  "검색광고":      { color:"#A78BFA" }, "지도리뷰":     { color:"#EAB308" },
  "블로그":        { color:"#03C75A" }, "카페":          { color:"#0088FE" },
  "플레이스":      { color:"#FF6B35" }, "강남언니":     { color:"#FF4E8C" },
  "바비톡":        { color:"#F59E0B" },
};

const FIXED_CHANNELS = ["네이버블로그","인스타그램","유튜브","네이버카페","워드프레스","홈페이지SEO","메타광고","검색광고","지도리뷰","지식인","강남언니","바비톡","언론보도"];
const CHANNEL_OPTIONS = ["네이버블로그","인스타그램","유튜브","네이버카페","지식인","홈페이지SEO","워드프레스","메타광고","검색광고","지도리뷰","강남언니","바비톡","언론보도"];
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
// ─── 카테고리(대분류) 정의 ────────────────────────────────────
const CATEGORIES = [
  { id:"basic",     label:"기본",      icon:"📊", desc:"병원의 현재 상태를 한눈에" },
  { id:"marketing", label:"마케팅",    icon:"📈", desc:"환자를 유입시키는 영역" },
  { id:"branding",  label:"브랜딩",    icon:"⭐", desc:"왜 환자가 우리 병원을 선택하는가" },
  { id:"operation", label:"병원 운영", icon:"🏥", desc:"유입된 환자를 관리하고 성장시키는 영역" },
];

// ─── 탭(중분류) 정의 — 각 탭은 하나의 카테고리(대분류)에 속함 ──
const ALL_TABS = [
  // 📊 기본
  { id:"overview",   label:"통합 요약",    category:"basic",     required:false, defaultOn:true },
  { id:"growreport", label:"성장 리포트",  category:"basic",     required:false, defaultOn:true },
  { id:"schedule",   label:"일정 관리",    category:"basic",     required:false, defaultOn:true },
  { id:"meeting",    label:"미팅 로그",    category:"basic",     required:false, defaultOn:true },
  { id:"cost",       label:"비용 관리",    category:"basic",     required:false, defaultOn:true },
  // 📈 마케팅
  { id:"inflow",     label:"환자 유입",    category:"marketing", required:false, defaultOn:true },
  { id:"ads",        label:"광고 성과",    category:"marketing", required:false, defaultOn:true },
  { id:"keyword",    label:"검색 현황",    category:"marketing", required:false, defaultOn:true },
  { id:"marketing",  label:"콘텐츠 현황",  category:"marketing", required:false, defaultOn:true },
  // ⭐ 브랜딩
  { id:"branding",   label:"브랜드 분석",  category:"branding",  required:false, defaultOn:false },
  { id:"review",     label:"리뷰 관리",    category:"branding",  required:false, defaultOn:false },
  { id:"onlineasset",label:"온라인 자산",  category:"branding",  required:false, defaultOn:false },
  { id:"ai",         label:"AI 검색",     category:"branding",  required:false, defaultOn:false },
  // 🏥 병원 운영
  { id:"crm",        label:"CRM 관리",    category:"operation", required:false, defaultOn:false },
  { id:"consult",    label:"상담 관리",    category:"operation", required:false, defaultOn:false },
  { id:"patient",    label:"환자 관리",    category:"operation", required:false, defaultOn:false },
  { id:"cs",         label:"CS 관리",     category:"operation", required:false, defaultOn:false },
  { id:"sop",        label:"SOP 관리",    category:"operation", required:false, defaultOn:false },
  { id:"biz",        label:"경영 지표",    category:"operation", required:false, defaultOn:false },
];
const DEFAULT_TABS = ALL_TABS.filter(t => t.required || t.defaultOn).map(t => t.id);
// 카테고리별 산하 탭 id 목록
const TABS_BY_CATEGORY = (catId) => ALL_TABS.filter(t => t.category === catId).map(t => t.id);
const DEFAULT_CATEGORIES = ["basic","marketing"]; // 기본 활성 대분류

const EMPTY_HOSPITAL_FORM = { name:"", region:"", dept:"", manager:"", target_patients:"", target_revenue:"", color:"#38BDF8", password:"", categories: DEFAULT_CATEGORIES, tabs: DEFAULT_TABS };

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
  const [mainTab, setMainTab]       = useState("hospitals");
  const [searchQ, setSearchQ]       = useState("");

  const [adminAccounts, setAdminAccounts] = useState([{ id:1, name:"임지혜", password:"Daall" }]);
  const [showAccountMgmt, setShowAccountMgmt] = useState(false);
  const [newAccount, setNewAccount] = useState({ name:"", password:"", role:"중간관리자" });
  const [resetConfirmId, setResetConfirmId] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

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
    try { await supabase.from('admin_accounts').upsert({ id:1, data:accounts }, { onConflict:'id' }); }
    catch(e) {}
  };

  const handleAddAccount = () => {
    if (!newAccount.name.trim() || !newAccount.password.trim()) return;
    const newAccounts = [...adminAccounts, { id:Date.now(), ...newAccount }];
    setAdminAccounts(newAccounts); saveAdminAccounts(newAccounts);
    setNewAccount({ name:"", password:"", role:"중간관리자" }); toast("계정 추가 완료!");
  };
  const handleDeleteAccount = (id) => {
    const updated = adminAccounts.filter(a=>a.id!==id);
    setAdminAccounts(updated); saveAdminAccounts(updated);
  };
  const handleResetPassword = (id, newPw) => {
    const updated = adminAccounts.map(a=>a.id===id?{...a,password:newPw}:a);
    setAdminAccounts(updated); saveAdminAccounts(updated); setResetConfirmId(null); toast("비밀번호 변경 완료!");
  };

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };
  const openAdd  = () => { setEditTarget(null); setForm(EMPTY_HOSPITAL_FORM); setShowForm(true); };
  const openEdit = (e, h) => {
    e.stopPropagation();
    // 기존 데이터(categories 없음)는 보유한 tabs로부터 대분류를 역산해서 채워줌
    const inferredCategories = h.categories || [...new Set(
      (h.tabs||DEFAULT_TABS).map(id => ALL_TABS.find(t=>t.id===id)?.category).filter(Boolean)
    )];
    setForm({ name:h.name, region:h.region, dept:h.dept, manager:h.manager,
      target_patients:String(h.target_patients), target_revenue:String(h.target_revenue),
      color:h.color, password:h.password||"",
      categories: inferredCategories.length ? inferredCategories : DEFAULT_CATEGORIES,
      tabs:h.tabs||DEFAULT_TABS, juniorTabs:h.juniorTabs||[] });
    setEditTarget(h); setShowForm(true);
  };
  const handleDelete = (e, id) => { e.stopPropagation(); setDeleteConfirm(id); };
  const confirmDelete = (e, id) => { e.stopPropagation(); onDeleteHospital(id); setDeleteConfirm(null); toast("삭제 완료"); };

  const handleSubmitForm = () => {
    if (!form.name.trim()) return;
    // 사용자가 직접 선택한 카테고리/중분류를 그대로 사용 (강제로 전체 ON 하지 않음)
    const selectedCategories = form.categories || [];
    const userTabs = form.tabs || [];
    // 안전장치: 선택 해제된 카테고리에 속한 탭은 제외
    const computedTabs = userTabs.filter(id => {
      const t = ALL_TABS.find(t=>t.id===id);
      return t && selectedCategories.includes(t.category);
    });
    // 실무자 허용 탭도 현재 켜진 탭 범위 내로만 유지
    const computedJuniorTabs = (form.juniorTabs||[]).filter(id => computedTabs.includes(id));
    const finalForm = { ...form, categories: selectedCategories, tabs: computedTabs, juniorTabs: computedJuniorTabs };
    if (editTarget) {
      onEditHospital({ ...editTarget, ...finalForm, target_patients:+finalForm.target_patients, target_revenue:+finalForm.target_revenue });
    } else {
      onAddHospital({ ...finalForm, target_patients:+finalForm.target_patients, target_revenue:+finalForm.target_revenue });
    }
    setShowForm(false);
  };

  // 전체 KPI 집계 (최신 월 기준)
  const allKpi = useMemo(() => {
    let inquiry=0, newPatient=0, revenue=0, mktCost=0, count=0;
    hospitals.forEach(h => {
      const hData = h.monthlyData || [];
      if (hData.length > 0) {
        const last = hData[hData.length-1];
        inquiry    += last.inquiry     || 0;
        newPatient += last.newPatient  || 0;
        revenue    += last.revenue     || 0;
        mktCost    += last.marketingCost || 0;
        count++;
      }
    });
    const cpl = inquiry > 0 ? Math.round(mktCost/inquiry) : 0;
    const roi = mktCost > 0 ? Math.round((revenue-mktCost)/mktCost*100) : 0;
    return { inquiry, newPatient, revenue, mktCost, cpl, roi, count };
  }, [hospitals]);

  const filteredHospitals = hospitals.filter(h =>
    !searchQ || h.name.includes(searchQ) || h.dept?.includes(searchQ) || h.region?.includes(searchQ)
  );

  const fmt = (n) => (n||0).toLocaleString();

  const NavBtn = ({ icon, label, active, onClick, danger }) => (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
      background: active ? `${C.accent}15` : "transparent",
      border: "none",
      borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
      color: danger ? C.red : active ? C.accent : C.muted,
      fontSize:13, fontWeight: active ? 700 : 500, cursor:"pointer",
      width:"100%", textAlign:"left", transition:"all 0.15s",
    }}
      onMouseEnter={e => { if(!active) e.currentTarget.style.background = "#F1F5F9"; }}
      onMouseLeave={e => { if(!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize:16 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"-apple-system,BlinkMacSystemFont,'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',sans-serif" }}>
      <Toast msg={savedMsg} />

      {/* ── 좌측 사이드바 ── */}
      <div style={{ width:220, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* 로고 */}
        <div style={{ padding:"24px 20px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:18, fontWeight:900, color:C.text, letterSpacing:"-0.5px" }}>DAALL</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>병원 마케팅 대시보드</div>
        </div>

        {/* 로그인 사용자 */}
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${C.accent},${C.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800, flexShrink:0 }}>
            {loginName?.[0]||"A"}
          </div>
          <div>
            <div style={{ color:C.text, fontSize:12, fontWeight:700 }}>{loginName||"관리자"}</div>
            <div style={{ color:C.muted, fontSize:10 }}>{adminRole||"관리자"}</div>
          </div>
        </div>

        {/* 메뉴 */}
        <div style={{ flex:1, padding:"12px 0", display:"flex", flexDirection:"column", gap:2 }}>
          <div style={{ padding:"6px 16px 4px", color:C.muted, fontSize:10, fontWeight:700, letterSpacing:1 }}>메뉴</div>
          <NavBtn icon="🏥" label="병원 목록" active={mainTab==="hospitals"} onClick={()=>setMainTab("hospitals")} />
          <NavBtn icon="⚡" label="내부 작업" active={mainTab==="internal"} onClick={()=>setMainTab("internal")} />

          {isSuperAdmin && (
            <>
              <div style={{ padding:"12px 16px 4px", color:C.muted, fontSize:10, fontWeight:700, letterSpacing:1, marginTop:4 }}>관리</div>
              <NavBtn icon="👥" label="계정 관리" active={showAccountMgmt} onClick={()=>{ setShowAccountMgmt(!showAccountMgmt); setShowActivityLog(false); }} />
              <NavBtn icon="📋" label="활동 로그" active={showActivityLog} onClick={()=>{ setShowActivityLog(!showActivityLog); setShowAccountMgmt(false); }} />
            </>
          )}
        </div>

        {/* 로그아웃 */}
        <div style={{ padding:"12px 0", borderTop:`1px solid ${C.border}` }}>
          <NavBtn icon="🚪" label="로그아웃" onClick={onAdminLogout} danger />
        </div>
      </div>

      {/* ── 우측 메인 컨텐츠 ── */}
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>

        {/* 계정 관리 모달 */}
        {showAccountMgmt && (
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:24 }}>
            <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:16 }}>👥 계정 관리</div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <input value={newAccount.name} onChange={e=>setNewAccount({...newAccount,name:e.target.value})} placeholder="이름" style={{ ...inputSt, padding:"7px 10px", fontSize:12, width:120 }} />
              <input type="password" value={newAccount.password} onChange={e=>setNewAccount({...newAccount,password:e.target.value})} placeholder="비밀번호" style={{ ...inputSt, padding:"7px 10px", fontSize:12, width:120 }} />
              <select value={newAccount.role} onChange={e=>setNewAccount({...newAccount,role:e.target.value})} style={{ ...inputSt, padding:"7px 10px", fontSize:12 }}>
                <option>중간관리자</option><option>실무자</option><option>최고관리자</option>
              </select>
              <button onClick={handleAddAccount} style={{ background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>추가</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {adminAccounts.map(acc => (
                <div key={acc.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:"#F8FAFC", borderRadius:10, border:`1px solid ${C.border}` }}>
                  <span style={{ color:C.text, fontSize:13, fontWeight:700, flex:1 }}>{acc.name}</span>
                  <span style={{ color:C.muted, fontSize:11 }}>{acc.role||"중간관리자"}</span>
                  {resetConfirmId===acc.id ? (
                    <div style={{ display:"flex", gap:6 }}>
                      <input id={`pw_${acc.id}`} placeholder="새 비밀번호" style={{ ...inputSt, padding:"4px 8px", fontSize:11, width:100 }} />
                      <button onClick={()=>handleResetPassword(acc.id, document.getElementById(`pw_${acc.id}`).value)} style={{ background:`${C.green}20`, border:`1px solid ${C.green}`, color:C.green, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>확인</button>
                    </div>
                  ) : (
                    <button onClick={()=>setResetConfirmId(acc.id)} style={{ background:`${C.accent}15`, border:`1px solid ${C.accent}30`, color:C.accent, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>비번변경</button>
                  )}
                  <button onClick={()=>handleDeleteAccount(acc.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, color:C.red, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 활동 로그 모달 */}
        {showActivityLog && (
          <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:24, maxHeight:320, overflowY:"auto" }}>
            <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:16 }}>📋 활동 로그</div>
            {activityLogs.length===0
              ? <div style={{ color:C.muted, fontSize:13 }}>기록된 활동이 없어요</div>
              : activityLogs.slice().reverse().map((log,i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:`1px solid ${C.dim}`, fontSize:12 }}>
                  <span style={{ color:C.muted, flexShrink:0 }}>{log.time}</span>
                  <span style={{ color:C.accent, fontWeight:700, flexShrink:0 }}>{log.actor}</span>
                  <span style={{ color:C.text }}>{log.action}</span>
                  <span style={{ color:C.muted }}>{log.target}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* 병원 목록 화면 */}
        {mainTab === "hospitals" && (
          <div style={{ flex:1, padding:28 }}>
            {/* 헤더 */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:C.text, fontSize:22, fontWeight:900 }}>병원 목록</div>
                <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>총 {hospitals.length}개 병원 관리 중</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="병원명, 진료과, 지역 검색..."
                  style={{ ...inputSt, padding:"8px 14px", fontSize:13, width:220 }} />
                {isAdmin && adminRole !== "실무자" && (
                  <button onClick={openAdd} style={{ background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700 }}>+ 병원 추가</button>
                )}
              </div>
            </div>

            {/* 전체 KPI 요약 */}
            {allKpi.count > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12, marginBottom:24 }}>
                {[
                  { label:"총 문의", value:fmt(allKpi.inquiry)+"건", color:C.accent },
                  { label:"총 신환", value:fmt(allKpi.newPatient)+"명", color:hospital_color_fallback },
                  { label:"총 매출", value:fmt(allKpi.revenue)+"만", color:C.green },
                  { label:"총 광고비", value:fmt(allKpi.mktCost)+"만", color:C.orange },
                  { label:"평균 CPL", value:allKpi.cpl>0?fmt(allKpi.cpl)+"만":"-", color:C.accent2 },
                  { label:"평균 ROI", value:allKpi.roi>0?allKpi.roi+"%":"-", color:allKpi.roi>=200?C.green:allKpi.roi>=100?C.yellow:C.red },
                ].map((k,i) => (
                  <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px" }}>
                    <div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:6 }}>{k.label}</div>
                    <div style={{ color:k.color, fontSize:18, fontWeight:900 }}>{k.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 병원 카드 그리드 */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
              {filteredHospitals.map(h => {
                const hData = h.monthlyData || [];
                const last = hData.length > 0 ? hData[hData.length-1] : {};
                const cpl = last.inquiry > 0 ? Math.round((last.marketingCost||0)/last.inquiry) : 0;
                return (
                  <div key={h.id} onClick={()=>onSelect(h)} style={{
                    background:C.surface, border:`1px solid ${C.border}`, borderRadius:18,
                    padding:20, cursor:"pointer", position:"relative", overflow:"hidden",
                    transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${h.color}20`; e.currentTarget.style.borderColor=`${h.color}60`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor=C.border; }}
                  >
                    {/* 컬러 악센트 바 */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${h.color},${h.color}60)`, borderRadius:"18px 18px 0 0" }} />

                    {/* 수정/삭제 */}
                    {isAdmin && adminRole !== "실무자" && (
                      <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:5 }} onClick={e=>e.stopPropagation()}>
                        <button onClick={e=>openEdit(e,h)} style={{ background:`${h.color}15`, border:`1px solid ${h.color}30`, color:h.color, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:700 }}>수정</button>
                        {deleteConfirm===h.id
                          ? <button onClick={e=>confirmDelete(e,h.id)} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:700 }}>확인</button>
                          : <button onClick={e=>handleDelete(e,h.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                        }
                      </div>
                    )}

                    {/* 병원 정보 */}
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, paddingTop:4 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${h.color},${h.color}80)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:16, fontWeight:900 }}>
                        {h.name[0]}
                      </div>
                      <div>
                        <div style={{ color:C.text, fontSize:15, fontWeight:800 }}>{h.name}</div>
                        <div style={{ display:"flex", gap:5, marginTop:3 }}>
                          <span style={{ background:`${h.color}15`, color:h.color, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{h.dept}</span>
                          <span style={{ background:`${C.muted}15`, color:C.muted, borderRadius:5, padding:"1px 7px", fontSize:10 }}>{h.region}</span>
                        </div>
                      </div>
                    </div>

                    {/* KPI 미니 */}
                    {hData.length > 0 ? (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        {[
                          { label:"문의", value:fmt(last.inquiry)+"건", color:C.accent },
                          { label:"신환", value:fmt(last.newPatient)+"명", color:h.color },
                          { label:"CPL", value:cpl>0?fmt(cpl)+"만":"-", color:C.accent2 },
                        ].map((k,i) => (
                          <div key={i} style={{ background:`${k.color}08`, borderRadius:8, padding:"7px 8px", textAlign:"center" }}>
                            <div style={{ color:k.color, fontSize:14, fontWeight:800 }}>{k.value}</div>
                            <div style={{ color:C.muted, fontSize:9, marginTop:1 }}>{k.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color:C.muted, fontSize:11, textAlign:"center", padding:"8px 0" }}>데이터 없음</div>
                    )}

                    {/* 담당자 */}
                    {h.manager && (
                      <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ color:C.muted, fontSize:10 }}>담당</span>
                        <span style={{ color:C.text, fontSize:11, fontWeight:600 }}>{h.manager}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 병원 추가 카드 */}
              {isAdmin && adminRole !== "실무자" && (
                <div onClick={openAdd} style={{
                  background:"transparent", border:`2px dashed ${C.border}`, borderRadius:18,
                  padding:20, cursor:"pointer", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:10, minHeight:160,
                }}
                  onMouseEnter={e=>{e.currentTarget.style.border=`2px dashed ${C.accent}60`;e.currentTarget.style.background=`${C.accent}05`;}}
                  onMouseLeave={e=>{e.currentTarget.style.border=`2px dashed ${C.border}`;e.currentTarget.style.background="transparent";}}>
                  <div style={{ width:40, height:40, borderRadius:12, border:`2px dashed ${C.muted}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:C.muted }}>+</div>
                  <div style={{ color:C.muted, fontSize:12, fontWeight:600 }}>새 병원 추가</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 내부 작업 */}
        {mainTab === "internal" && (
          <div style={{ flex:1 }}>
            <InternalDashboard hospitals={hospitals} loginName={loginName} onUpdateHospital={onUpdateHospital} globalSchedules={globalSchedules} saveGlobalSchedules={saveGlobalSchedules} />
          </div>
        )}
      </div>

      {/* 병원 추가/수정 폼 모달 */}
      {showForm && (
        <div onClick={()=>setShowForm(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:28, width:580, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:20 }}>{editTarget?"병원 정보 수정":"새 병원 추가"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
              {[["병원명 *","name","text"],["지역","region","text"],["진료과","dept","text"],["담당자","manager","text"],["신환 목표 (명)","target_patients","number"],["매출 목표 (만원)","target_revenue","number"]].map(([label,field,type])=>(
                <div key={field}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>{label}</label>
                  <input type={type} value={form[field]||""} onChange={e=>setForm({...form,[field]:e.target.value})} style={inputSt} />
                </div>
              ))}
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>대표 컬러</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["#0EA5E9","#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#F97316"].map(color=>(
                    <div key={color} onClick={()=>setForm({...form,color})} style={{ width:28, height:28, borderRadius:8, background:color, cursor:"pointer", border:`3px solid ${form.color===color?"#0F172A":"transparent"}`, transition:"transform 0.1s" }} />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>병원 비밀번호</label>
                <input type="text" value={form.password||""} onChange={e=>setForm({...form,password:e.target.value})} placeholder="병원 공유용" style={inputSt} />
              </div>
            </div>
            {/* 카테고리(대분류) + 중분류 설정 */}
            <div style={{ marginBottom:16 }}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>사용할 카테고리 선택</label>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {CATEGORIES.map(cat => {
                  const curCats = form.categories||[];
                  const isOn = curCats.includes(cat.id);
                  const curTabs = form.tabs||[];
                  const catTabs = ALL_TABS.filter(t=>t.category===cat.id);
                  const onCount = catTabs.filter(t=>curTabs.includes(t.id)).length;
                  return (
                    <div key={cat.id} style={{ border:`1px solid ${isOn?C.accent+"40":C.dim}`, borderRadius:10, overflow:"hidden" }}>
                      <div onClick={()=>{
                        if (isOn) {
                          // 카테고리 끄기: categories에서 제거 + 산하 중분류 전부 tabs/juniorTabs에서 제거
                          const nextCats = curCats.filter(id=>id!==cat.id);
                          const catTabIds = catTabs.map(t=>t.id);
                          const nextTabs = curTabs.filter(id=>!catTabIds.includes(id));
                          const nextJunior = (form.juniorTabs||[]).filter(id=>!catTabIds.includes(id));
                          setForm({...form, categories: nextCats, tabs: nextTabs, juniorTabs: nextJunior});
                        } else {
                          // 카테고리 켜기: categories에만 추가, 산하 중분류는 전부 빈 상태로 시작 (직접 골라서 켜야 함)
                          setForm({...form, categories: [...curCats, cat.id]});
                        }
                      }} style={{ display:"flex", alignItems:"center", gap:8, background:isOn?`${C.accent}10`:"transparent", padding:"9px 14px", cursor:"pointer" }}>
                        <span style={{ color:isOn?C.accent:C.muted }}>{isOn?"✓":"○"}</span>
                        <span style={{ color:isOn?C.accent:C.muted, fontWeight:700, fontSize:13 }}>{cat.icon} {cat.label}</span>
                        {isOn && (
                          <span style={{ marginLeft:"auto", fontSize:11, color:onCount>0?C.green:C.muted, fontWeight:600 }}>
                            {onCount}/{catTabs.length}개 항목 선택됨
                          </span>
                        )}
                      </div>
                      {isOn && (
                        <div style={{ padding:"10px 14px 12px", borderTop:`1px solid ${C.dim}`, display:"flex", flexWrap:"wrap", gap:6 }}>
                          {catTabs.map(t => {
                            const tabOn = curTabs.includes(t.id);
                            return (
                              <div key={t.id} onClick={()=>{
                                const nextTabs = tabOn ? curTabs.filter(id=>id!==t.id) : [...curTabs, t.id];
                                const nextJunior = tabOn ? (form.juniorTabs||[]).filter(id=>id!==t.id) : (form.juniorTabs||[]);
                                setForm({...form, tabs: nextTabs, juniorTabs: nextJunior});
                              }} style={{ display:"flex", alignItems:"center", gap:5, background:tabOn?`${C.green}15`:"#F8FAFC", border:`1px solid ${tabOn?C.green:C.dim}`, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", color:tabOn?C.green:C.muted }}>
                                <span>{tabOn?"✓":"○"}</span><span>{t.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ color:C.muted, fontSize:10, marginTop:6 }}>카테고리를 켜면 하단에 세부 항목이 나타나요. 사용할 항목만 선택해주세요.</div>
            </div>
            {/* 실무자 탭 (선택된 중분류만, 카테고리별로 그룹화) */}
            <div style={{ marginBottom:20 }}>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>실무자 허용 탭</label>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {CATEGORIES.filter(cat => (form.categories||[]).includes(cat.id) && ALL_TABS.some(t=>t.category===cat.id && (form.tabs||[]).includes(t.id))).map(cat => (
                  <div key={cat.id}>
                    <div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:5 }}>{cat.icon} {cat.label}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {ALL_TABS.filter(t=>t.category===cat.id && (form.tabs||[]).includes(t.id)).map(t => {
                        const isAllowed=(form.juniorTabs||[]).includes(t.id);
                        return (
                          <div key={t.id} onClick={()=>{
                            const cur=form.juniorTabs||[];
                            setForm(prev=>({...prev,juniorTabs:isAllowed?cur.filter(id=>id!==t.id):[...cur,t.id]}));
                          }} style={{ display:"flex", alignItems:"center", gap:5, background:isAllowed?`${C.green}20`:"transparent", border:`1px solid ${isAllowed?C.green:C.dim}`, borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", color:isAllowed?C.green:C.muted }}>
                            <span>{isAllowed?"✓":"○"}</span><span>{t.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {(form.categories||[]).length === 0 && (
                  <div style={{ color:C.muted, fontSize:11 }}>카테고리와 세부 항목을 먼저 선택해주세요.</div>
                )}
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={handleSubmitForm} style={{ flex:1, background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:10, padding:"11px 0", fontSize:13, cursor:"pointer", fontWeight:700 }}>{editTarget?"수정 완료":"병원 추가"}</button>
              <button onClick={()=>setShowForm(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"11px 18px", fontSize:13, cursor:"pointer" }}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const hospital_color_fallback = "#0EA5E9";

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

  // 미팅 탭 진입 시 전체 병원 미팅 로그 취합 (병렬 처리 + 캐시)
  const [meetingsLoaded, setMeetingsLoaded] = useState(false);
  useEffect(() => {
    if (internalTab !== "meetings") return;
    if (meetingsLoaded && meetingLogs.length > 0) return; // 캐시 있으면 재로드 안 함
    const loadMeetings = async () => {
      try {
        // 병렬로 전체 병원 동시 쿼리
        const results = await Promise.all(
          hospitals.map(h => supabase.from('meeting_data').select('*').eq('hospital_id', h.id).single())
        );
        const allMeets = [];
        results.forEach((res, i) => {
          const h = hospitals[i];
          if (res.data?.data) {
            res.data.data.forEach(log => allMeets.push({ ...log, hospitalName:h.name, hospitalColor:h.color, hospitalId:h.id }));
          }
        });
        setMeetingLogs(allMeets.sort((a,b) => (b.date||"") > (a.date||"") ? 1 : -1));
        setMeetingsLoaded(true);
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

  // 내부 미팅 요약에서 액션아이템 체크 (병원별 meeting_data에 반영)
  const toggleInternalActionDone = async (log, actionId) => {
    const updatedActions = (log.actions||[]).map(a => a.id === actionId ? { ...a, done: !a.done } : a);

    // meetingLogs state 즉시 업데이트
    const updatedLogs = meetingLogs.map(l =>
      l.id === log.id && l.hospitalName === log.hospitalName
        ? { ...l, actions: updatedActions }
        : l
    );
    setMeetingLogs(updatedLogs);

    // 같은 병원의 모든 로그를 모아서 한번에 저장 (추가 읽기 없이)
    try {
      const h = hospitals.find(h => h.id === log.hospitalId || h.name === log.hospitalName);
      if (!h) return;
      const hospitalLogs = updatedLogs
        .filter(l => l.hospitalId === h.id || l.hospitalName === h.name)
        .map(({ hospitalName, hospitalColor, hospitalId, ...rest }) => rest); // 내부 필드 제거
      await supabase.from('meeting_data').upsert({ hospital_id: h.id, data: hospitalLogs }, { onConflict: 'hospital_id' });
    } catch(e) { console.error('액션 저장 실패:', e); }
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
  const [editSchedForm, setEditSchedForm] = useState({ date:"", title:"", hospital:"", memo:"", schedType:"regular", color:"" });

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
    const color = editSchedForm.schedType ? getSchedTypeColor(editSchedForm.schedType) : C.accent;
    const updated = schedules.map(s => s.id === editSchedId ? { ...s, ...editSchedForm, color } : s);
    saveGlobalSchedules(updated);
    const sched = updated.find(s => s.id === editSchedId);
    const updatedKanban = kanbanCards.map(c =>
      c.fromSchedule && c.schedDate === sched?.date
        ? { ...c, text:`[${editSchedForm.date}] ${editSchedForm.title}`, hospital:editSchedForm.hospital, schedDate:editSchedForm.date }
        : c
    );
    setKanbanCards(updatedKanban); saveKanban(updatedKanban);
    setEditSchedId(null); toast("일정 수정 완료!");
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
                                <div key={j} onClick={() => toggleInternalActionDone(log, a.id)}
                                  style={{ display:"flex", alignItems:"center", gap:6, background: a.done ? `${C.green}10` : "#F8FAFC", border:`1px solid ${a.done ? C.green : C.dim}`, borderRadius:7, padding:"5px 10px", cursor:"pointer", transition:"all 0.15s" }}>
                                  <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, background:a.done?C.green:"transparent", border:`2px solid ${a.done?C.green:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    {a.done && <span style={{ color:"#0F172A", fontSize:10, fontWeight:900 }}>✓</span>}
                                  </div>
                                  {a.team && <span style={{ background:`${tm?.color||C.accent2}20`, color:tm?.color||C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{a.team}</span>}
                                  <span style={{ color: a.done ? C.muted : C.text, fontSize:12, textDecoration:a.done?"line-through":"none" }}>{a.text}</span>
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
                  <div key={i} style={{ height:80, background: isToday ? `${C.accent}10` : "#F8FAFC", borderRadius:8, padding:4, border: isToday ? `1px solid ${C.accent}40` : `1px solid ${C.border}`, opacity: d ? 1 : 0, overflow:"hidden" }}>
                    {d && <>
                      <div style={{ color: isToday ? C.accent : dayOfWeek===0 ? C.red : dayOfWeek===6 ? C.accent2 : C.text, fontSize:11, fontWeight: isToday ? 800 : 500, marginBottom:2 }}>{d}</div>
                      {daySchedules.map((s,j) => (
                        <div key={j} style={{ background:s.schedType?getSchedTypeColor(s.schedType):s.color||C.accent, borderRadius:3, padding:"1px 4px", fontSize:10, color:"#0F172A", fontWeight:600, marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{s.title}</div>
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
                {/* 유형 선택 */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>일정 유형</label>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    {SCHED_TYPES.map(t => {
                      const isOn = (schedForm.schedType || "regular") === t.id;
                      return (
                        <button key={t.id} onClick={()=>setSchedForm(p=>({...p, schedType:t.id, color:t.color}))} style={{
                          background: isOn ? `${t.color}20` : "transparent",
                          border: `2px solid ${isOn ? t.color : C.dim}`,
                          color: isOn ? t.color : C.muted,
                          borderRadius:8, padding:"5px 12px", fontSize:11, cursor:"pointer", fontWeight: isOn?700:400,
                          display:"flex", alignItems:"center", gap:4,
                        }}>{t.icon} {t.label}</button>
                      );
                    })}
                  </div>
                </div>
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
                      <div style={{ background:"#F8FAFC", borderRadius:10, padding:14, border:`1px solid ${C.accent2}40` }}>
                        <div style={{ color:C.accent2, fontSize:11, fontWeight:700, marginBottom:10 }}>✏️ 일정 수정</div>
                        {/* 유형 선택 */}
                        <div style={{ marginBottom:10 }}>
                          <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:5 }}>일정 유형</label>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {SCHED_TYPES.map(t => {
                              const isOn = (editSchedForm.schedType||"regular") === t.id;
                              return (
                                <button key={t.id} onClick={()=>setEditSchedForm(p=>({...p,schedType:t.id,color:t.color}))} style={{
                                  background:isOn?`${t.color}20`:"transparent",
                                  border:`2px solid ${isOn?t.color:C.dim}`,
                                  color:isOn?t.color:C.muted,
                                  borderRadius:7, padding:"4px 10px", fontSize:10, cursor:"pointer", fontWeight:isOn?700:400,
                                  display:"flex", alignItems:"center", gap:3,
                                }}>{t.icon} {t.label}</button>
                              );
                            })}
                          </div>
                        </div>
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
                          style={{ ...inputSt, marginBottom:8, padding:"5px 8px", fontSize:12, appearance:"none", width:"100%" }}>
                          <option value="">병원 선택 (선택)</option>
                          {hospitals.map(h=><option key={h.id} value={h.name}>{h.name}</option>)}
                        </select>
                        <input type="text" value={editSchedForm.memo||""} onChange={e=>setEditSchedForm(p=>({...p,memo:e.target.value}))}
                          placeholder="메모 (선택)" style={{ ...inputSt, marginBottom:10, padding:"5px 8px", fontSize:12, width:"100%" }} />
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={updateInternalSchedule} style={{ background:`linear-gradient(135deg,${C.accent2},${C.accent})`, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                          <button onClick={() => setEditSchedId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                        </div>
                      </div>
                    ) : (
                      /* 보기 */
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:4, minHeight:50, borderRadius:2, background:s.schedType?getSchedTypeColor(s.schedType):s.color||C.accent, flexShrink:0, marginTop:2 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                            <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{s.title}</span>
                            {s.schedType && (() => {
                              const t = SCHED_TYPES.find(t=>t.id===s.schedType);
                              return t ? <span style={{ background:`${t.color}15`, color:t.color, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{t.icon} {t.label}</span> : null;
                            })()}
                            {s.source === "hospital" && s.hospital
                              ? <span style={{ background:`${C.accent}15`, color:C.accent, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>🏥 {s.hospital}</span>
                              : <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:600 }}>🏢 내부</span>
                            }
                          </div>
                          <div style={{ color:C.muted, fontSize:11, marginBottom:s.memo?3:0 }}>📅 {s.date}</div>
                          {s.memo && <div style={{ color:C.text, fontSize:12, lineHeight:1.6, background:"#F8FAFC", borderRadius:6, padding:"6px 8px", marginTop:4 }}>💬 {s.memo}</div>}
                        </div>
                        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                          <button onClick={() => { setEditSchedId(s.id); setEditSchedForm({ date:s.date, title:s.title, hospital:s.hospital||"", memo:s.memo||"", schedType:s.schedType||"regular", color:s.color||"" }); }}
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
function MarketingTab({ hospital, chData, initialContents, onUpdateHospital, isAdmin, isReadOnly }) {
  const [contents, setContents] = useState(() => initialContents || []);
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
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

  // hospital.contentData가 외부에서 바뀌면 동기화
  useEffect(() => {
    setContents(hospital.contentData || []);
  }, [hospital.contentData]);

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
    contents.filter(c => c.date?.startsWith(selMonth))
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
        <YearMonthSelector
          availMonths={monthList.filter(m => m !== "전체")}
          selMonth={selMonth}
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
        const displayMonth = inflowMonth || selMonth;
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
          const curMonth = inflowMonth || (selMonth);
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
              {!isReadOnly && (
                <button onClick={() => {
                  const m = selMonth;
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
                  <input type="month" value={inflowMonth || (selMonth)}
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
              콘텐츠 관리 ({filtered.length}건 · {+selMonth.slice(5)}월)
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>API 연동 시 클릭수·순위 자동 업데이트 예정</div>
          </div>
          {!isReadOnly && <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(!showForm); }} style={{
            background: showForm && !editId ? "rgba(248,113,113,0.15)" : `linear-gradient(135deg,${hospital.color},${C.accent2})`,
            border: showForm && !editId ? `1px solid ${C.red}` : "none",
            color: showForm && !editId ? C.red : "#0F172A",
            borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
          }}>{showForm && !editId ? "닫기" : editId ? "취소" : "+ 콘텐츠 추가"}</button>}
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
                      {!isReadOnly && <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>handleEdit(item)} style={{ background:`${hospital.color}20`, border:`1px solid ${hospital.color}40`, color:hospital.color, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:600 }}>수정</button>
                        {deleteConfirm === item.id ? (
                          <button onClick={()=>{saveAll(contents.filter(c=>c.id!==item.id));setDeleteConfirm(null);}} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>확인</button>
                        ) : (
                          <button onClick={()=>setDeleteConfirm(item.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
                        )}
                      </div>}
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

function KeywordRankTab({ hospital, isAdmin, onDataLoad, onSelMonthChange, isReadOnly }) {
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

  // selMonth 변경 시 부모에 현재 월 전체 키워드 전달 (리포트용 - 채널 필터 무관)
  useEffect(() => {
    const allMonthKw = keywords.filter(k => k.month === selMonth);
    if (onDataLoad) onDataLoad(allMonthKw.length > 0 ? allMonthKw : keywords);
    if (onSelMonthChange) onSelMonthChange(selMonth);
  }, [selMonth, keywords]);

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
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {availMonths.length === 0
            ? <span style={{ color:C.muted, fontSize:12 }}>데이터 없음 — CSV를 업로드해주세요</span>
            : (() => {
                // month 값에서 YYYY-MM 추출 (형식이 다양할 수 있으므로)
                const getYM = (m) => {
                  if (!m) return "";
                  const match = m.match(/(\d{4})[.\-/](\d{1,2})/);
                  if (match) return `${match[1]}-${match[2].padStart(2,'0')}`;
                  return m.slice(0,7);
                };
                const ymGroups = [...new Set(availMonths.map(getYM))].sort().reverse();
                const selYM = getYM(selMonth);
                const weeksInSelYM = availMonths.filter(w => getYM(w) === selYM);
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {/* 월 그룹 */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>월:</span>
                      {ymGroups.map(ym => (
                        <button key={ym} onClick={() => {
                          const weeksInYM = availMonths.filter(w => getYM(w) === ym);
                          setSelMonth(weeksInYM[0] || ym);
                        }} style={{
                          background: selYM===ym ? `${hospital.color}25` : "transparent",
                          border: `1px solid ${selYM===ym ? hospital.color : C.border}`,
                          color: selYM===ym ? hospital.color : C.muted,
                          borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
                        }}>{ym.slice(0,4)}년 {parseInt(ym.slice(5))}월</button>
                      ))}
                    </div>
                    {/* 주차 (같은 월 내 여러 주차 있을 때만) */}
                    {weeksInSelYM.length > 1 && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>주차:</span>
                        {weeksInSelYM.map(w => (
                          <button key={w} onClick={() => setSelMonth(w)} style={{
                            background: selMonth===w ? `${hospital.color}20` : "transparent",
                            border: `1px solid ${selMonth===w ? hospital.color : C.border}`,
                            color: selMonth===w ? hospital.color : C.muted,
                            borderRadius:7, padding:"3px 10px", fontSize:11, cursor:"pointer", fontWeight:600,
                          }}>{w}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()
          }
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
                              <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                                {!isReadOnly && (
                                  <button onClick={() => handleEdit(child)} style={{ background:`${C.accent2}15`, border:`1px solid ${C.accent2}30`, color:C.accent2, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", fontWeight:600 }}>수정</button>
                                )}
                                {!isReadOnly && (
                                  <button onClick={() => handleDelete(child.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                                )}
                              </div>
                            </div>
                            <div style={{ color:C.text, fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{child.summary}</div>
                            {child.actions?.length > 0 && (
                              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
                                {child.actions.map((a,j) => {
                                  const tm = TEAM_LEADERS_META.find(t=>t.team===a.team);
                                  return (
                                    <div key={j} onClick={() => !isReadOnly && toggleActionDone(child.id, a.id)}
                                      style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7,
                                        background:a.done?`${C.green}10`:"transparent",
                                        border:`1px solid ${a.done?C.green:C.dim}`,
                                        cursor: isReadOnly ? "default" : "pointer" }}>
                                      <div style={{ width:16, height:16, borderRadius:4, flexShrink:0,
                                        background:a.done?C.green:"transparent",
                                        border:`2px solid ${a.done?C.green:C.dim}`,
                                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        {a.done && <span style={{ color:"#0F172A", fontSize:10, fontWeight:900 }}>✓</span>}
                                      </div>
                                      {a.team && <span style={{ background:`${tm?.color||C.accent2}20`, color:tm?.color||C.accent2, borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:700, flexShrink:0 }}>{a.team}</span>}
                                      <span style={{ fontSize:11, color:a.done?C.muted:C.text, textDecoration:a.done?"line-through":"none" }}>{a.text}</span>
                                    </div>
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
  { id:"marketing_press",   label:"마케팅 - 언론보도",   group:"마케팅", color:"#6366F1" },
  { id:"marketing_wp",      label:"마케팅 - 워드프레스", group:"마케팅", color:"#8B5CF6" },
  { id:"marketing_review",  label:"마케팅 - 리뷰",       group:"마케팅", color:"#F59E0B" },
  { id:"design",            label:"디자인물",             group:"디자인", color:"#FBBF24" },
  { id:"cs",                label:"CS 경영지원",          group:"CS",     color:"#FB923C" },
];

function CostTab({ hospital, hData, onDataLoad, isReadOnly }) {
  const [contracts, setContracts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [contractItemsMap, setContractItemsMap] = useState({}); // { [month]: [{id, category, count, memo}] }
  const currentYm = new Date().toISOString().slice(0,7);
  const [selMonth, setSelMonth] = useState(currentYm);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({month:selMonth,category:"marketing_blog",memo:"",date:"",url:"",keyword:""});
  const [contractForm, setContractForm] = useState({month:selMonth,amount:"",deferred:""});
  const [extraForm, setExtraForm] = useState({month:selMonth,date:"",category:"marketing_blog",memo:"",amount:""});
  const [editExpId, setEditExpId] = useState(null);
  const [editExtraId, setEditExtraId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteExtraConfirm, setDeleteExtraConfirm] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [selGroup, setSelGroup] = useState("전체");

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2200); };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('cost_data').select('*').eq('hospital_id', hospital.id).single();
        if (data?.data) {
          if (data.data.contracts) setContracts(data.data.contracts);
          if (data.data.expenses) setExpenses(data.data.expenses);
          // 구버전 contractItems(배열) → 월별 맵으로 자동 변환 (현재 월에 넣어줌)
          if (data.data.contractItemsMap) {
            setContractItemsMap(data.data.contractItemsMap);
          } else if (Array.isArray(data.data.contractItems) && data.data.contractItems.length > 0) {
            setContractItemsMap({ [currentYm]: data.data.contractItems });
          } else if (data.data.contractNote) {
            setContractItemsMap({ [currentYm]: [{ id: Date.now(), category: "marketing", count: "", memo: data.data.contractNote }] });
          }
          if (data.data.extraExpenses) setExtraExpenses(data.data.extraExpenses);
          if (onDataLoad) onDataLoad({ contracts: data.data.contracts||[], expenses: data.data.expenses||[] });
        }
      } catch(e) {}
    };
    load();
  }, [hospital.id]);

  const saveToSupabase = async (newContracts, newExpenses, newItemsMap, newExtra) => {
    try {
      await supabase.from('cost_data').upsert(
        { hospital_id: hospital.id, data: {
          contracts: newContracts,
          expenses: newExpenses,
          contractItemsMap: newItemsMap !== undefined ? newItemsMap : contractItemsMap,
          extraExpenses: newExtra !== undefined ? newExtra : extraExpenses,
        }},
        { onConflict: 'hospital_id' }
      );
    } catch(e) { console.error('비용관리 저장 실패:', e); }
  };

  // 현재 월의 계약 항목
  const contractItems = contractItemsMap[selMonth] || [];
  const setContractItems = (items) => setContractItemsMap(prev => ({ ...prev, [selMonth]: items }));
  const saveContractItems = (items, contracts_, expenses_) => {
    const newMap = { ...contractItemsMap, [selMonth]: items };
    setContractItemsMap(newMap);
    saveToSupabase(contracts_ ?? contracts, expenses_ ?? expenses, newMap, undefined);
  };

  const contractRec = contracts.find(c=>c.month===selMonth);
  const contractAmt = contractRec?.amount||0;
  const deferredAmt = contractRec?.deferred||0;
  const monthExpenses = expenses.filter(e=>e.month===selMonth);
  const monthExtra = extraExpenses.filter(e=>e.month===selMonth);
  const availMonths = [...new Set(contracts.map(c=>c.month))].sort().reverse();
  const totalExtra = monthExtra.reduce((s,e)=>s+(+e.amount||0),0);

  const handleSaveContract = () => {
    if (!contractForm.month||!contractForm.amount) return;
    const exists = contracts.find(c=>c.month===contractForm.month);
    const newEntry = { month:contractForm.month, amount:+contractForm.amount, deferred:+contractForm.deferred||0 };
    const newContracts = exists
      ? contracts.map(c=>c.month===contractForm.month ? newEntry : c)
      : [...contracts, newEntry].sort((a,b)=>a.month>b.month?1:-1);
    setContracts(newContracts);
    saveToSupabase(newContracts, expenses, undefined, undefined);
    setShowContractForm(false); toast("계약금 저장 완료!");
  };

  const handleSaveExpense = () => {
    if (!expenseForm.month||!expenseForm.category) return;
    let newExpenses;
    if (editExpId) {
      newExpenses = expenses.map(e=>e.id===editExpId?{...expenseForm,id:editExpId}:e);
      setEditExpId(null); toast("수정 완료!");
    } else {
      newExpenses = [{...expenseForm,id:Date.now()},...expenses];
      toast("저장 완료!");
    }
    setExpenses(newExpenses);
    saveToSupabase(contracts, newExpenses, undefined, undefined);
    setExpenseForm({month:selMonth,category:"marketing_blog",memo:"",date:"",url:"",keyword:""}); setShowExpenseForm(false);
  };

  const handleSaveExtra = () => {
    if (!extraForm.month||!extraForm.category) return;
    let newExtra;
    if (editExtraId) {
      newExtra = extraExpenses.map(e=>e.id===editExtraId?{...extraForm,id:editExtraId,amount:+extraForm.amount||0}:e);
      setEditExtraId(null); toast("수정 완료!");
    } else {
      newExtra = [{...extraForm,id:Date.now(),amount:+extraForm.amount||0},...extraExpenses];
      toast("저장 완료!");
    }
    setExtraExpenses(newExtra);
    saveToSupabase(contracts, expenses, undefined, newExtra);
    setExtraForm({month:selMonth,date:"",category:"marketing_blog",memo:"",amount:""}); setShowExtraForm(false);
  };

  const handleEditExp = (e) => { setEditExpId(e.id); setExpenseForm({...e}); setShowExpenseForm(true); };
  const handleEditExtra = (e) => { setEditExtraId(e.id); setExtraForm({...e,amount:String(e.amount||"")}); setShowExtraForm(true); };

  const handleDeleteExp = (id) => {
    const newExpenses = expenses.filter(e=>e.id!==id);
    setExpenses(newExpenses);
    saveToSupabase(contracts, newExpenses, undefined, undefined);
    setDeleteConfirm(null); toast("삭제 완료");
  };

  const handleDeleteExtra = (id) => {
    const newExtra = extraExpenses.filter(e=>e.id!==id);
    setExtraExpenses(newExtra);
    saveToSupabase(contracts, expenses, undefined, newExtra);
    setDeleteExtraConfirm(null); toast("삭제 완료");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <Toast msg={savedMsg}/>

      {/* 상단 컨트롤 */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:C.muted,fontSize:13}}>조회 월:</span>
          <YearMonthSelector availMonths={availMonths} selMonth={selMonth} setSelMonth={setSelMonth} color={hospital.color} />
        </div>
        <div style={{display:"flex",gap:8}}>
          {!isReadOnly && <button onClick={()=>setShowContractForm(!showContractForm)} style={{background:`${C.accent2}20`,border:`1px solid ${C.accent2}50`,color:C.accent2,borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>계약금 등록</button>}
        </div>
      </div>

      {/* 계약금 등록 폼 */}
      {showContractForm && (
        <div style={{background:"#F8FAFC",border:`1px solid ${C.accent2}30`,borderRadius:14,padding:20}}>
          <div style={{color:C.accent2,fontSize:13,fontWeight:700,marginBottom:14}}>월 금액 등록</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:140}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={contractForm.month} onChange={e=>setContractForm({...contractForm,month:e.target.value})} style={inputSt}/></div>
            <div style={{flex:2,minWidth:180}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>계약금 (만원)</label><input type="number" placeholder="0" value={contractForm.amount} onChange={e=>setContractForm({...contractForm,amount:e.target.value})} style={inputSt}/></div>
            <div style={{flex:2,minWidth:180}}><label style={{color:C.orange,fontSize:11,display:"block",marginBottom:5,fontWeight:700}}>후불 금액 (만원)</label><input type="number" placeholder="0" value={contractForm.deferred} onChange={e=>setContractForm({...contractForm,deferred:e.target.value})} style={{...inputSt,borderColor:C.orange}}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={handleSaveContract} style={{background:`linear-gradient(135deg,${C.accent2},${C.accent})`,border:"none",color:"#0F172A",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>저장</button>
            <button onClick={()=>setShowContractForm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {/* 작업 내역 추가/수정 폼 */}
      {showExpenseForm && (
        <div style={{background:"#F8FAFC",border:`1px solid ${hospital.color}30`,borderRadius:14,padding:20}}>
          <div style={{color:hospital.color,fontSize:13,fontWeight:700,marginBottom:14}}>{editExpId?"작업 내역 수정":"작업 내역 추가"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:14}}>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={expenseForm.month} onChange={e=>setExpenseForm({...expenseForm,month:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>날짜</label><input type="date" value={expenseForm.date||""} onChange={e=>setExpenseForm({...expenseForm,date:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>항목 *</label>
              <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})} style={{...inputSt,appearance:"none"}}>
                {COST_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>작업 내용</label><KInput type="text" placeholder="예: 6월 블로그 포스팅 8건" value={expenseForm.memo||""} onChange={e=>setExpenseForm({...expenseForm,memo:e.target.value})} style={inputSt}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>링크 URL</label><input type="text" placeholder="https://..." value={expenseForm.url||""} onChange={e=>setExpenseForm({...expenseForm,url:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>키워드</label><input type="text" placeholder="예: 광주 면역치료" value={expenseForm.keyword||""} onChange={e=>setExpenseForm({...expenseForm,keyword:e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSaveExpense} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>{editExpId?"수정 완료":"저장하기"}</button>
            <button onClick={()=>{setShowExpenseForm(false);setEditExpId(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {/* KPI — 계약금/후불 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        <KPICard label="계약금" value={fmt(contractAmt)} unit="만원" color={C.accent2}/>
        <KPICard label="후불 금액" value={fmt(deferredAmt)} unit="만원" color={C.orange} sub={deferredAmt>0?"별도 청구":"미등록"}/>
      </div>

      {/* ─── 계약 내용 (채널+건수 표 형식) ──────────────── */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{color:C.text,fontWeight:800,fontSize:14}}>📋 계약 내용</div>
          {!isReadOnly && <button onClick={()=>{
            saveContractItems([...contractItems, {id:Date.now(), category:"marketing_blog", count:"", memo:""}]);
          }} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 항목 추가</button>}
        </div>

        {contractItems.length === 0 ? (
          <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>+ 항목 추가 버튼을 눌러 계약 내용을 등록하세요.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:0,border:`1px solid ${C.dim}`,borderRadius:10,overflow:"hidden"}}>
            {/* 헤더 */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 80px 2fr 40px",background:"#F1F5F9",padding:"8px 14px",gap:12}}>
              {["채널 / 항목","건수","메모",""].map((h,i)=>(
                <div key={i} style={{color:C.muted,fontSize:11,fontWeight:700}}>{h}</div>
              ))}
            </div>
            {/* 행 */}
            {contractItems.map((item, idx) => {
              const cat = COST_CATEGORIES.find(c=>c.id===item.category) || COST_CATEGORIES[0];
              return (
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"2fr 80px 2fr 40px",padding:"8px 14px",gap:12,borderTop:`1px solid ${C.dim}`,alignItems:"center",background:idx%2===0?"#fff":"#FAFAFA"}}>
                  <select value={item.category}
                    disabled={isReadOnly}
                    onChange={e=>{
                      saveContractItems(contractItems.map(it=>it.id===item.id?{...it,category:e.target.value}:it));
                    }}
                    style={{...inputSt,padding:"5px 8px",fontSize:12,appearance:"none",color:cat.color,fontWeight:700,opacity:isReadOnly?0.7:1}}>
                    {COST_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input type="number" value={item.count} placeholder="0"
                    disabled={isReadOnly}
                    onChange={e=>{
                      setContractItems(contractItems.map(it=>it.id===item.id?{...it,count:e.target.value}:it));
                    }}
                    onBlur={e=>{
                      if(isReadOnly) return;
                      saveContractItems(contractItems.map(it=>it.id===item.id?{...it,count:e.target.value}:it));
                    }}
                    style={{...inputSt,padding:"5px 8px",fontSize:12,textAlign:"right",opacity:isReadOnly?0.7:1}} />
                  <input type="text" value={item.memo||""} placeholder="메모 (선택)"
                    disabled={isReadOnly}
                    onChange={e=>{
                      setContractItems(contractItems.map(it=>it.id===item.id?{...it,memo:e.target.value}:it));
                    }}
                    onBlur={e=>{
                      if(isReadOnly) return;
                      saveContractItems(contractItems.map(it=>it.id===item.id?{...it,memo:e.target.value}:it));
                    }}
                    style={{...inputSt,padding:"5px 8px",fontSize:12,opacity:isReadOnly?0.7:1}} />
                  {!isReadOnly && <button onClick={()=>{
                    saveContractItems(contractItems.filter(it=>it.id!==item.id));
                  }} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:0,textAlign:"center"}}>×</button>}
                  {isReadOnly && <div/>}
                </div>
              );
            })}
            {/* 합계 */}
            {contractItems.some(it=>it.count) && (
              <div style={{display:"grid",gridTemplateColumns:"2fr 80px 2fr 40px",padding:"8px 14px",gap:12,borderTop:`1px solid ${C.border}`,background:"#F8FAFC"}}>
                <div style={{color:C.muted,fontSize:11,fontWeight:700}}>합계</div>
                <div style={{color:hospital.color,fontSize:13,fontWeight:900,textAlign:"right"}}>
                  {contractItems.reduce((s,it)=>s+(+it.count||0),0)}건
                </div>
                <div/><div/>
              </div>
            )}
          </div>
        )}

        {/* 작업 진행률 */}
        {contractItems.length > 0 && contractItems.some(it=>+it.count>0) && (
          <div style={{marginTop:20}}>
            <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:10}}>📊 작업 진행률 ({selMonth.slice(5)}월)</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {contractItems.filter(it=>+it.count>0).map(it=>{
                const cat = COST_CATEGORIES.find(c=>c.id===it.category) || COST_CATEGORIES[0];
                const contracted = +it.count || 0;
                const done = monthExpenses.filter(e=>e.category===it.category).length;
                const pct = contracted > 0 ? Math.min(Math.round(done/contracted*100), 100) : 0;
                const isOver = done > contracted;
                return (
                  <div key={it.id}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{color:cat.color,fontSize:12,fontWeight:700}}>{cat.label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:isOver?C.orange:pct>=100?C.green:C.muted}}>
                        {done}/{contracted}건 ({pct}%){isOver?" 초과!":""}
                      </span>
                    </div>
                    <div style={{background:C.dim,borderRadius:6,height:8,overflow:"hidden"}}>
                      <div style={{
                        width:`${pct}%`, height:"100%",
                        background:isOver?C.orange:pct>=100?C.green:`linear-gradient(90deg,${cat.color},${cat.color}aa)`,
                        borderRadius:6, transition:"width 0.3s"
                      }}/>
                    </div>
                  </div>
                );
              })}
              {/* 전체 합산 */}
              <div style={{marginTop:4,paddingTop:10,borderTop:`1px solid ${C.dim}`}}>
                {(()=>{
                  const totalContracted = contractItems.reduce((s,it)=>s+(+it.count||0),0);
                  const totalDone = contractItems.filter(it=>+it.count>0).reduce((s,it)=>s+monthExpenses.filter(e=>e.category===it.category).length,0);
                  const totalPct = totalContracted>0?Math.round(totalDone/totalContracted*100):0;
                  return (
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:C.text,fontSize:12,fontWeight:700}}>전체 합산</span>
                      <span style={{fontSize:13,fontWeight:900,color:totalPct>=100?C.green:hospital.color}}>
                        {totalDone}/{totalContracted}건 ({totalPct}%)
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 작업 내역 테이블 ──────────────────────────── */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:16}}>
          <SectionTitle>{selMonth.slice(5)}월 작업 내역</SectionTitle>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
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
            {!isReadOnly && <button onClick={()=>{setEditExpId(null);setExpenseForm({month:selMonth,category:"marketing_blog",memo:"",date:"",url:"",keyword:""});setShowExpenseForm(!showExpenseForm);}} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#0F172A",borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 작업 내역 추가</button>}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["날짜","항목","그룹","작업 내용","관리"].map(h=>(
              <th key={h} style={{color:C.muted,fontWeight:600,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${C.dim}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {(() => {
                const filtered = [...monthExpenses]
                  .filter(e => selGroup === "전체" || (COST_CATEGORIES.find(c=>c.id===e.category)?.group === selGroup))
                  .sort((a,b)=>a.date>b.date?-1:1);
                if (filtered.length === 0) return <tr><td colSpan={5} style={{padding:"32px",textAlign:"center",color:C.muted}}>작업 내역이 없어요.</td></tr>;
                return filtered.map(e => {
                  const cat=COST_CATEGORIES.find(c=>c.id===e.category)||{label:e.category,color:C.muted,group:"-"};
                  return (
                    <tr key={e.id} style={{borderBottom:`1px solid ${C.dim}`}}
                      onMouseEnter={ev=>ev.currentTarget.style.background=`${hospital.color}08`}
                      onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                      <td style={{padding:"9px 12px",color:C.muted,whiteSpace:"nowrap"}}>{e.date||"-"}</td>
                      <td style={{padding:"9px 12px",color:cat.color,fontWeight:700}}>{cat.label}</td>
                      <td style={{padding:"9px 12px"}}><Badge color={cat.group==="마케팅"?hospital.color:cat.group==="디자인"?C.yellow:C.orange}>{cat.group}</Badge></td>
                      <td style={{padding:"9px 12px",maxWidth:300}}>
                        {e.memo && <div style={{color:C.text,fontWeight:600,fontSize:12}}>{e.memo}</div>}
                        {e.url && <a href={e.url} target="_blank" rel="noreferrer" style={{color:C.accent,fontSize:10,display:"block",marginTop:2}}>링크</a>}
                        {e.keyword && <div style={{color:C.muted,fontSize:10,marginTop:2}}>{e.keyword}</div>}
                        {!e.memo && !e.url && !e.keyword && <span style={{color:C.muted}}>-</span>}
                      </td>
                      <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}>
                        {!isReadOnly && <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>handleEditExp(e)} style={{background:`${hospital.color}20`,border:`1px solid ${hospital.color}40`,color:hospital.color,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>수정</button>
                          {deleteConfirm===e.id
                            ? <button onClick={()=>handleDeleteExp(e.id)} style={{background:`${C.red}20`,border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>확인</button>
                            : <button onClick={()=>setDeleteConfirm(e.id)} style={{background:"transparent",border:`1px solid ${C.dim}`,color:C.muted,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>삭제</button>
                          }
                        </div>}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.dim}`,color:C.muted,fontSize:12}}>
          총 {monthExpenses.filter(e=>selGroup==="전체"||(COST_CATEGORIES.find(c=>c.id===e.category)?.group===selGroup)).length}건
        </div>
      </div>

      {/* ─── 추가 작업 내역 (금액 포함) ───────────────── */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionTitle>{selMonth.slice(5)}월 추가 작업 내역</SectionTitle>
          {!isReadOnly && <button onClick={()=>{setEditExtraId(null);setExtraForm({month:selMonth,date:"",category:"marketing_blog",memo:"",amount:""});setShowExtraForm(!showExtraForm);}}
            style={{background:`linear-gradient(135deg,${C.green},${C.accent})`,border:"none",color:"#fff",borderRadius:9,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>
            + 추가 작업 내역 추가
          </button>}
        </div>

        {showExtraForm && (
          <div style={{background:"#F8FAFC",border:`1px solid ${C.green}30`,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{color:C.green,fontSize:13,fontWeight:700,marginBottom:12}}>{editExtraId?"추가 작업 수정":"추가 작업 추가"}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:12}}>
              <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>월 *</label><input type="month" value={extraForm.month} onChange={e=>setExtraForm({...extraForm,month:e.target.value})} style={inputSt}/></div>
              <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>날짜</label><input type="date" value={extraForm.date||""} onChange={e=>setExtraForm({...extraForm,date:e.target.value})} style={inputSt}/></div>
              <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>항목 *</label>
                <select value={extraForm.category} onChange={e=>setExtraForm({...extraForm,category:e.target.value})} style={{...inputSt,appearance:"none"}}>
                  {COST_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>금액 (만원)</label><input type="number" placeholder="0" value={extraForm.amount} onChange={e=>setExtraForm({...extraForm,amount:e.target.value})} style={inputSt}/></div>
            </div>
            <div style={{marginBottom:12}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:4}}>작업 내용</label><input type="text" placeholder="예: 추가 이벤트 배너 제작 2건" value={extraForm.memo||""} onChange={e=>setExtraForm({...extraForm,memo:e.target.value})} style={inputSt}/></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={handleSaveExtra} style={{background:`linear-gradient(135deg,${C.green},${C.accent})`,border:"none",color:"#fff",borderRadius:8,padding:"8px 20px",fontSize:12,cursor:"pointer",fontWeight:700}}>{editExtraId?"수정 완료":"저장하기"}</button>
              <button onClick={()=>{setShowExtraForm(false);setEditExtraId(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>취소</button>
            </div>
          </div>
        )}

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["날짜","항목","그룹","작업 내용","금액(만원)","관리"].map(h=>(
              <th key={h} style={{color:C.muted,fontWeight:600,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${C.dim}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {monthExtra.length === 0
                ? <tr><td colSpan={6} style={{padding:"28px",textAlign:"center",color:C.muted}}>추가 작업 내역이 없어요.</td></tr>
                : [...monthExtra].sort((a,b)=>a.date>b.date?-1:1).map(e=>{
                    const cat=COST_CATEGORIES.find(c=>c.id===e.category)||{label:e.category,color:C.muted,group:"-"};
                    return (
                      <tr key={e.id} style={{borderBottom:`1px solid ${C.dim}`}}
                        onMouseEnter={ev=>ev.currentTarget.style.background=`${C.green}06`}
                        onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                        <td style={{padding:"9px 12px",color:C.muted,whiteSpace:"nowrap"}}>{e.date||"-"}</td>
                        <td style={{padding:"9px 12px",color:cat.color,fontWeight:700}}>{cat.label}</td>
                        <td style={{padding:"9px 12px"}}><Badge color={cat.group==="마케팅"?hospital.color:cat.group==="디자인"?C.yellow:C.orange}>{cat.group}</Badge></td>
                        <td style={{padding:"9px 12px",color:C.muted}}>{e.memo||"-"}</td>
                        <td style={{padding:"9px 12px",color:C.green,fontWeight:700}}>{e.amount?fmt(+e.amount):"-"}</td>
                        <td style={{padding:"9px 12px",whiteSpace:"nowrap"}}>
                          {!isReadOnly && <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>handleEditExtra(e)} style={{background:`${C.green}15`,border:`1px solid ${C.green}40`,color:C.green,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>수정</button>
                            {deleteExtraConfirm===e.id
                              ? <button onClick={()=>handleDeleteExtra(e.id)} style={{background:`${C.red}20`,border:`1px solid ${C.red}`,color:C.red,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>확인</button>
                              : <button onClick={()=>setDeleteExtraConfirm(e.id)} style={{background:"transparent",border:`1px solid ${C.dim}`,color:C.muted,borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>삭제</button>
                            }
                          </div>}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
        {monthExtra.length > 0 && (
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.dim}`}}>
            <span style={{color:C.muted,fontSize:12}}>추가 작업 합계</span>
            <span style={{color:C.green,fontSize:14,fontWeight:900}}>{fmt(totalExtra)}만원</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 병원 대시보드 ────────────────────────────────────────────
function HospitalDashboard({ hospital, onBack, onUpdateHospital, isAdmin, adminRole, globalSchedules, saveGlobalSchedules }) {
  const isReadOnly = !isAdmin; // 병원 비밀번호 로그인 = 읽기 전용
  const isJunior = adminRole === "실무자"; // 실무자 탭 제한
  // hospital.categories가 있으면 신규 구조 → tabs 그대로 사용 (사용자가 직접 고른 탭만)
  // hospital.categories가 없으면 구버전 데이터 → 카테고리 역산해서 산하 탭 전부 보강
  const rawTabIds = hospital.tabs || DEFAULT_TABS;
  const enabledTabIds = hospital.categories
    ? rawTabIds
    : (() => {
        const touchedCategories = [...new Set(rawTabIds.map(id => ALL_TABS.find(t=>t.id===id)?.category).filter(Boolean))];
        return [...new Set([...rawTabIds, ...ALL_TABS.filter(t=>touchedCategories.includes(t.category)).map(t=>t.id)])];
      })();
  const enabledCategories = CATEGORIES.filter(c => TABS_BY_CATEGORY(c.id).some(id => enabledTabIds.includes(id)));
  const [tab, setTab] = useState(() => {
    const firstEnabled = ALL_TABS.map(t => t.id).find(id => enabledTabIds.includes(id));
    return firstEnabled || enabledTabIds[0] || "overview";
  });
  const [activeCategory, setActiveCategory] = useState(() => {
    const t = ALL_TABS.find(t => t.id === tab);
    return t?.category || enabledCategories[0]?.id || "basic";
  });
  // 대분류를 바꾸면 그 산하 첫 번째로 켜진 중분류로 자동 이동
  const switchCategory = (catId) => {
    setActiveCategory(catId);
    const firstTabInCat = ALL_TABS.find(t => t.category === catId && enabledTabIds.includes(t.id));
    if (firstTabInCat) setTab(firstTabInCat.id);
  };
  const [showPerfInput, setShowPerfInput] = useState(false);
  const [showChannelInput, setShowChannelInput] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSections, setReportSections] = useState([
    { id:"overview",  label:"통합 요약",    checked:true },
    { id:"ads",       label:"광고 성과",    checked:true },
    { id:"inflow",    label:"환자 유입",    checked:true },
    { id:"branding",  label:"브랜드 분석",  checked:false },
    { id:"crm",       label:"병원 운영",    checked:false },
    { id:"keyword",   label:"검색 현황",    checked:true },
    { id:"marketing", label:"콘텐츠 현황",  checked:true },
    { id:"cost",      label:"비용 관리",    checked:true },
  ]);
  const [reportMonth, setReportMonth] = useState("");

  // 리포트용 공유 데이터 state
  const [sharedPatientData, setSharedPatientData] = useState([]);
  const [sharedCostData, setSharedCostData] = useState({ contracts:[], expenses:[] });
  const [sharedKeywordData, setSharedKeywordData] = useState([]);
  const [sharedKeywordSelMonth, setSharedKeywordSelMonth] = useState("");

  // hospital.monthlyData를 직접 사용 (항상 최신)
  const hData = hospital.monthlyData || [];
  const _rawChData = hospital.channelData || [];

  // ─── 공통 월 선택 ─────────────────────────────────────────
  const availMonths = useMemo(() =>
    [...new Set(hData.map(d => d.month).filter(Boolean))].sort().reverse()
  , [hData]);
  const availYears = useMemo(() =>
    [...new Set(availMonths.map(m => m.slice(0,4)))].sort().reverse()
  , [availMonths]);
  const [selMonth, setSelMonth] = useState("");
  const [selYear, setSelYear] = useState(String(new Date().getFullYear()));

  // availMonths가 로드되면 selMonth 초기화
  useEffect(() => {
    if (availMonths.length > 0) {
      setSelMonth(prev => prev || availMonths[0]);
      setSelYear(prev => prev || availMonths[0].slice(0,4));
    }
  }, [availMonths]);

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

  const TAB_LABELS = {
    overview:"📊 통합 요약", growreport:"📈 성장 리포트", schedule:"📅 일정 관리", meeting:"📝 미팅 로그",
    inflow:"👥 환자 유입", ads:"📣 광고 성과", keyword:"🔍 검색 현황", marketing:"📋 콘텐츠 현황", cost:"💰 비용 관리",
    branding:"⭐ 브랜드 분석", review:"💬 리뷰 관리", onlineasset:"🌐 온라인 자산", ai:"🤖 AI 검색",
    crm:"📇 CRM 관리", consult:"📞 상담 관리", patient:"🧑‍⚕️ 환자 관리", cs:"🛟 CS 관리", sop:"📋 SOP 관리", biz:"💹 경영 지표",
  };
  const tabs = ALL_TABS.map(t => ({ id:t.id, label: TAB_LABELS[t.id] || t.label, category:t.category })).filter(t => {
    if (!enabledTabIds.includes(t.id)) return false;
    if (isJunior) {
      const juniorTabs = hospital.juniorTabs || [];
      return juniorTabs.includes(t.id);
    }
    return true;
  });
  // 현재 선택된 대분류 산하의 중분류 탭만
  const visibleTabs = tabs.filter(t => t.category === activeCategory);
  // 실제로 화면에 보여줄 대분류 목록(실무자 권한으로 전부 막힌 카테고리는 숨김)
  const visibleCategories = CATEGORIES.filter(cat => tabs.some(t => t.category === cat.id));


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
  const exportReport = async (sections, month) => {
    const today = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
    const targetMonth = month || selMonth;
    const hDataAll = hData.length > 0 ? hData : (hospital.monthlyData || []);
    const targetData = hDataAll.find(d => d.month === targetMonth) || hDataAll[0] || {};
    const reportData = targetData;
    const lastMonth = targetData.month || targetMonth || "-";
    const fmtN = (n) => (n || 0).toLocaleString();
    const pctN = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "-";
    const roi2 = reportData.marketingCost ? Math.round(((reportData.revenue - reportData.marketingCost) / reportData.marketingCost) * 100) : 0;
    const hasTab = (id) => {
      const list = sections || reportSections;
      const found = list.find(s => s.id === id);
      return found ? found.checked === true : true; // 기본값 true
    };

    // Supabase에서 데이터 직접 가져오기
    let costContracts = [], costExpenses = [], patientRecords = [], kwKeywords = [], reportContents = [];

    // 이미 로드된 데이터 우선 사용 → Supabase 쿼리 최소화
    const hasCostData = sharedCostData && (sharedCostData.contracts?.length > 0 || sharedCostData.expenses?.length > 0);
    const hasPatientData = sharedPatientData?.length > 0;
    const hasKwData = sharedKeywordData?.length > 0;
    const hasContentData = (hospital.contentData||[]).length > 0;

    if (hasCostData && hasPatientData && hasKwData && hasContentData) {
      // 모두 캐시에 있으면 Supabase 쿼리 스킵
      costContracts = sharedCostData.contracts || [];
      costExpenses = sharedCostData.expenses || [];
      patientRecords = sharedPatientData;
      kwKeywords = sharedKeywordData;
      reportContents = hospital.contentData || [];
    } else {
      // 없는 것만 Supabase에서 로드
      try {
        const queries = [];
        if (!hasCostData) queries.push(supabase.from('cost_data').select('*').eq('hospital_id', hospital.id).single());
        else queries.push(Promise.resolve({ data: null }));
        if (!hasPatientData) queries.push(supabase.from('patient_data').select('*').eq('hospital_id', hospital.id).single());
        else queries.push(Promise.resolve({ data: null }));
        if (!hasKwData) queries.push(supabase.from('keyword_data').select('*').eq('hospital_id', hospital.id).single());
        else queries.push(Promise.resolve({ data: null }));
        if (!hasContentData) queries.push(supabase.from('content_data').select('*').eq('hospital_id', hospital.id).single());
        else queries.push(Promise.resolve({ data: null }));

        const [costRes, patientRes, kwRes, contentRes] = await Promise.all(queries);

        costContracts = costRes.data?.data?.contracts || sharedCostData?.contracts || [];
        costExpenses = costRes.data?.data?.expenses || sharedCostData?.expenses || [];
        patientRecords = patientRes.data?.data || sharedPatientData || [];
        kwKeywords = sharedKeywordData.length > 0 ? sharedKeywordData : (kwRes.data?.data || []);
        reportContents = contentRes.data?.data || hospital.contentData || [];
      } catch(e) {
        costContracts = sharedCostData?.contracts || [];
        costExpenses = sharedCostData?.expenses || [];
        patientRecords = sharedPatientData || [];
        kwKeywords = sharedKeywordData || [];
        reportContents = hospital.contentData || [];
      }
    }

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

    // 4. 채널 분석 - targetMonth 기준으로 직접 계산
    const rawChDataAll = hospital.channelData || [];
    const reportChData = !Array.isArray(rawChDataAll) && targetMonth
      ? (rawChDataAll[targetMonth] || rawChDataAll[targetMonth.slice(0,7)] || [])
      : (Array.isArray(rawChDataAll) ? rawChDataAll : []);
    const channelRows = reportChData.map(c => {
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
    const patientRec = Array.isArray(patientRecords) ? patientRecords.find(r => r.month === targetMonth) : null;
    const patientRows = patientRec?.channelData
      ? patientRec.channelData.filter(c => c.count > 0).sort((a,b) => b.count - a.count)
        .map(c => `<tr><td>${c.channel}</td><td class="num">${fmtN(c.count)}명</td></tr>`).join("") : "";

    // 6. 마케팅 현황
    const monthContents = Array.isArray(reportContents)
      ? reportContents
          .filter(c => c.date && c.date.startsWith(targetMonth.slice(0,7)))
          .sort((a,b) => (a.date||"") > (b.date||"") ? 1 : -1)
      : [];
    const contentRows = monthContents.map(c => `
      <tr>
        <td style="font-weight:600;color:#38BDF8">${c.channel}</td>
        <td>${c.title}</td><td>${c.date}</td>
        <td>${c.topExposed ? '✓' : '-'}</td><td>${c.status||'-'}</td>
      </tr>`).join("");

    // 7. 비용 관리
    const monthContract = costContracts.find(c => c.month === targetMonth)?.amount || 0;
    const monthExpenses = costExpenses
      .filter(e => e.month === targetMonth)
      .sort((a,b) => (a.date||"") > (b.date||"") ? 1 : -1);
    const totalExpense = monthExpenses.reduce((s,e) => s+e.amount, 0);
    const expenseRows = monthExpenses.map(e => `
      <tr>
        <td style="text-align:center">${e.date||'-'}</td>
        <td style="text-align:center">${e.category||'-'}</td>
        <td style="text-align:center">${e.memo||'-'}</td>
        <td class="num">${fmtN(e.amount)}만원</td>
      </tr>`).join("");

    // 8. 키워드 현황 - sharedKeywordData는 이미 현재 선택 월 기준
    const CHANNEL_ORDER = ["블로그", "카페", "웹사이트", "플레이스", "지식인", "유튜브", "인스타그램"];
    const monthKw = Array.isArray(kwKeywords) ? kwKeywords : [];

    // 채널별 그룹화
    const kwByChannel = {};
    monthKw.forEach(k => {
      const ch = k.channel || "기타";
      if (!kwByChannel[ch]) kwByChannel[ch] = [];
      kwByChannel[ch].push(k);
    });

    // 채널 순서대로 정렬된 채널 목록
    const orderedChannels = [
      ...CHANNEL_ORDER.filter(c => kwByChannel[c]),
      ...Object.keys(kwByChannel).filter(c => !CHANNEL_ORDER.includes(c))
    ];

    // 채널별 요약 카드
    const kwSummaryCards = orderedChannels.map(ch => {
      const items = kwByChannel[ch];
      const total = items.length;
      const parseKwRank = (rank) => {
        if (!rank) return { page:99, pos:99 };
        const s = rank.toString();
        if (s.includes('-')) {
          const [p, r] = s.split('-').map(Number);
          return { page:p||99, pos:r||99 };
        }
        const n = parseInt(s);
        if (!isNaN(n)) return { page: Math.ceil(n/10), pos: n };
        return { page:99, pos:99 };
      };
      const page1 = items.filter(k => parseKwRank(k.rank).page === 1).length;
      const page2 = items.filter(k => parseKwRank(k.rank).page <= 2).length; // 2페이지 이내 (1+2페이지 합산)
      const top3 = items.filter(k => {
        const r = parseKwRank(k.rank);
        return r.page === 1 && r.pos <= 3;
      }).length;
      return `
        <div style="background:#1E293B;border-radius:12px;padding:18px;border:1px solid #334155;">
          <div style="color:#38BDF8;font-weight:800;font-size:14px;margin-bottom:14px;">📌 ${ch}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
            <div style="background:#0F172A;border-radius:8px;padding:10px;text-align:center;">
              <div style="color:#94A3B8;font-size:10px;margin-bottom:4px;">총 키워드</div>
              <div style="color:#F1F5F9;font-size:22px;font-weight:800;">${total}<span style="font-size:12px;font-weight:400;margin-left:2px;">개</span></div>
            </div>
            <div style="background:#0F172A;border-radius:8px;padding:10px;text-align:center;">
              <div style="color:#94A3B8;font-size:10px;margin-bottom:4px;">1페이지</div>
              <div style="color:#34D399;font-size:22px;font-weight:800;">${page1}<span style="font-size:12px;font-weight:400;margin-left:2px;">개</span></div>
            </div>
            <div style="background:#0F172A;border-radius:8px;padding:10px;text-align:center;">
              <div style="color:#94A3B8;font-size:10px;margin-bottom:4px;">2페이지 이내</div>
              <div style="color:#60A5FA;font-size:22px;font-weight:800;">${page2}<span style="font-size:12px;font-weight:400;margin-left:2px;">개</span></div>
            </div>
          </div>
          ${top3 > 0 ? `<div style="margin-top:10px;background:#0F172A;border-radius:8px;padding:8px 12px;color:#34D399;font-size:12px;font-weight:700;">🏆 TOP 3 이내: ${top3}개</div>` : ""}
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${hospital.name} 마케팅 리포트 · ${lastMonth}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#F1F5F9; color:#1E293B; font-family:'Noto Sans KR',-apple-system,sans-serif; padding:32px; line-height:1.6; }
  .header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid ${hospital.color}; }
  .hospital-name { font-size:26px; font-weight:900; color:#0F172A; }
  .hospital-meta { color:#64748B; font-size:13px; margin-top:4px; }
  .report-month { font-size:15px; font-weight:700; color:${hospital.color}; }
  .report-date { color:#94A3B8; font-size:12px; margin-top:4px; text-align:right; }
  .section { background:#fff; border-radius:16px; padding:24px; margin-bottom:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06); break-inside:avoid; }
  .section-title { font-size:16px; font-weight:800; color:#0F172A; margin-bottom:20px; display:flex; align-items:center; gap:10px; }
  .accent-bar { width:4px; height:20px; border-radius:2px; background:${hospital.color}; display:inline-block; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:0; }
  .kpi-card { background:#F8FAFC; border-radius:12px; padding:16px; text-align:center; border:1px solid #E2E8F0; }
  .kpi-label { font-size:11px; color:#64748B; margin-bottom:6px; font-weight:600; }
  .kpi-value { font-size:22px; font-weight:900; }
  .kpi-unit { font-size:12px; font-weight:400; margin-left:2px; color:#94A3B8; }
  .chart-wrap { position:relative; height:280px; margin-top:16px; }
  .chart-wrap-sm { position:relative; height:220px; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .three-col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .stat-box { background:#F8FAFC; border-radius:12px; padding:16px; text-align:center; border:1px solid #E2E8F0; }
  .stat-val { font-size:24px; font-weight:900; color:${hospital.color}; }
  .stat-lbl { font-size:11px; color:#94A3B8; margin-top:4px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { background:#F1F5F9; color:#64748B; font-weight:700; padding:10px 12px; text-align:center; border-bottom:2px solid #E2E8F0; }
  td { padding:9px 12px; text-align:center; border-bottom:1px solid #F1F5F9; }
  td:first-child { text-align:left; font-weight:600; }
  tr:hover td { background:#F8FAFC; }
  .num { text-align:right; font-weight:600; }
  .no-data { color:#94A3B8; font-size:13px; padding:24px; text-align:center; background:#F8FAFC; border-radius:8px; }
  .no-print { display:none !important; }
  .footer { display:flex; justify-content:space-between; color:#94A3B8; font-size:11px; margin-top:32px; padding-top:16px; border-top:1px solid #E2E8F0; }
  @media print {
    body { background:#fff; padding:0; }
    .section { box-shadow:none; border:1px solid #E2E8F0; }
    @page { size:A4 landscape; margin:1.5cm; }
  }
</style>
</head>
<body>

  <!-- 안내 버튼 -->
  <div class="no-print" style="background:${hospital.color};color:#0F172A;padding:12px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px;border-radius:10px;font-size:13px;">
    <span style="font-weight:700">📄 리포트 저장 방법</span>
    <span>① 아래 인쇄 버튼 → ② 대상 프린터 <b>"PDF로 저장"</b> 선택 → ③ 저장</span>
    <button onclick="window.print()" style="background:#0F172A;color:#fff;border:none;border-radius:7px;padding:7px 18px;font-size:13px;cursor:pointer;font-weight:700;margin-left:auto;">🖨️ 인쇄 / PDF 저장</button>
    <a href="https://pdf2ppt.com" target="_blank" style="background:#6366F1;color:#fff;text-decoration:none;border-radius:7px;padding:7px 18px;font-size:13px;font-weight:700;">📊 PDF → PPT 변환</a>
  </div>

  <!-- 헤더 -->
  <div class="header">
    <div>
      <div class="hospital-name">${hospital.name}</div>
      <div class="hospital-meta">${hospital.dept||''} · ${hospital.region||''} · 담당 ${hospital.manager||'-'}</div>
    </div>
    <div style="text-align:right">
      <div class="report-month">${lastMonth} 마케팅 리포트</div>
      <div class="report-date">작성일 ${today}</div>
    </div>
  </div>

  <!-- 1. 통합 요약 -->
  ${hasTab("overview") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>통합 요약</div>
    <div class="kpi-grid" style="margin-bottom:24px;">
      ${[
        { label:"신환 수",     val:`${fmtN(reportData.newPatient)}명`,    color:"#0EA5E9" },
        { label:"매출",        val:`${fmtN(reportData.revenue)}만원`,      color:"#10B981" },
        { label:"마케팅비",    val:`${fmtN(reportData.marketingCost)}만원`,color:"#F59E0B" },
        { label:"ROI",         val:`${roi2}%`,                             color: roi2>=0?"#10B981":"#EF4444" },
        { label:"문의",        val:`${fmtN(reportData.inquiry)}건`,         color:"#6366F1" },
        { label:"초진내원",    val:`${fmtN(reportData.firstVisit)}명`,      color:"#8B5CF6" },
        { label:"초진결제",    val:`${fmtN(reportData.firstPayment)}건`,    color:"#EC4899" },
        { label:"CPA",         val:`${reportData.newPatient ? fmtN(Math.round((reportData.marketingCost||0)/reportData.newPatient))+'만원' : '-'}`, color:"#F97316" },
      ].map(k=>`<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value" style="color:${k.color}">${k.val}</div></div>`).join("")}
    </div>
    ${hData.length > 1 ? `
    <div class="section-title" style="font-size:13px;margin-bottom:12px;"><span class="accent-bar"></span>최근 6개월 추이</div>
    <div class="chart-wrap">
      <canvas id="overviewChart"></canvas>
    </div>` : ""}
  </div>` : ""}

  <!-- 2. 상세 성과 -->
  ${hasTab("performance") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>상세 성과 · 월별 추이</div>
    <div class="two-col">
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">📊 신환 · 매출 추이</div>
        <div class="chart-wrap-sm"><canvas id="perfChart1"></canvas></div>
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">📋 문의 · 내원 · 결제 추이</div>
        <div class="chart-wrap-sm"><canvas id="perfChart2"></canvas></div>
      </div>
    </div>
    <div style="margin-top:20px;overflow-x:auto;">
      <table>
        <thead><tr><th>월</th><th>문의</th><th>초진내원</th><th>초진결제</th><th>신환</th><th>매출(만)</th><th>마케팅비(만)</th><th>ROI</th></tr></thead>
        <tbody>${trendRows}</tbody>
      </table>
    </div>
  </div>` : ""}

  <!-- 3. 전환 분석 -->
  ${hasTab("funnel") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>전환 분석</div>
    <div class="two-col">
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">🔽 전환 퍼널</div>
        <div class="chart-wrap-sm"><canvas id="funnelChart"></canvas></div>
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">📈 전환율 지표</div>
        <div class="three-col" style="margin-top:8px;">
          ${[
            { label:"유입→초진 전환율", val: reportData.firstVisit && reportData.inquiry ? pctN(reportData.firstVisit, Math.round(reportData.inquiry*3.2)) : "-" },
            { label:"상담→결제 전환율", val: reportData.firstPayment && reportData.consult ? pctN(reportData.firstPayment, reportData.consult) : "-" },
            { label:"예약→내원율",      val: reportData.firstVisit && reportData.reservation ? pctN(reportData.firstVisit, reportData.reservation) : "-" },
            { label:"광고비 대비 매출", val: reportData.revenue && reportData.marketingCost ? `${(reportData.revenue/reportData.marketingCost).toFixed(1)}배` : "-" },
            { label:"재방문율",          val: reportData.visit && reportData.firstVisit ? pctN(reportData.visit-reportData.firstVisit, reportData.visit) : "-" },
            { label:"환자당 매출",       val: reportData.revenue && reportData.firstPayment ? `${fmtN(Math.round(reportData.revenue/(reportData.firstPayment||1)))}만원` : "-" },
          ].map(i=>`<div class="stat-box"><div class="stat-val" style="font-size:18px">${i.val}</div><div class="stat-lbl">${i.label}</div></div>`).join("")}
        </div>
      </div>
    </div>
  </div>` : ""}

  <!-- 4. 채널 분석 -->
  ${hasTab("channel") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>채널별 성과</div>
    ${reportChData.length > 0 ? `
    <div class="two-col">
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">📊 채널별 유입</div>
        <div class="chart-wrap-sm"><canvas id="channelChart1"></canvas></div>
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">💰 채널별 ROI</div>
        <div class="chart-wrap-sm"><canvas id="channelChart2"></canvas></div>
      </div>
    </div>
    <div style="margin-top:16px;overflow-x:auto;">
      <table>
        <thead><tr><th>채널</th><th>유입</th><th>내원</th><th>결제</th><th>매출(만)</th><th>광고비(만)</th><th>ROI</th></tr></thead>
        <tbody>${channelRows}</tbody>
      </table>
    </div>` : `<div class="no-data">해당 월 채널 데이터가 없어요</div>`}
  </div>` : ""}

  <!-- 5. 환자 유입 -->
  ${hasTab("patient") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>환자 유입 현황</div>
    ${patientRec ? `
    <div class="two-col">
      <div>
        <div class="three-col">
          <div class="stat-box"><div class="stat-val">${fmtN(patientRec.newPatient)}명</div><div class="stat-lbl">신환</div></div>
          <div class="stat-box"><div class="stat-val">${fmtN(patientRec.returnPatient)}명</div><div class="stat-lbl">구환</div></div>
          <div class="stat-box"><div class="stat-val" style="font-size:18px">${patientRec.targetNew ? Math.round(patientRec.newPatient/patientRec.targetNew*100)+'%' : '-'}</div><div class="stat-lbl">목표 달성률</div></div>
        </div>
        ${patientRows ? `<div style="margin-top:16px;overflow-x:auto;"><table><thead><tr><th>유입 채널</th><th>환자 수</th></tr></thead><tbody>${patientRows}</tbody></table></div>` : ""}
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">🥧 채널별 유입 비율</div>
        <div class="chart-wrap-sm"><canvas id="patientChart"></canvas></div>
      </div>
    </div>` : `<div class="no-data">해당 월 환자 유입 데이터가 없어요</div>`}
  </div>` : ""}

  <!-- 6. 마케팅 현황 -->
  ${hasTab("marketing") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>마케팅 현황</div>
    ${(() => {
      // 채널별 유입 데이터 (channelData에서 targetMonth 기준)
      const rawCh = hospital.channelData || {};
      const chForMonth = !Array.isArray(rawCh) ? (rawCh[targetMonth] || rawCh[targetMonth.slice(0,7)] || []) : rawCh;
      const prevMonthKey = (() => { const [y,m] = targetMonth.split('-').map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; })();
      const lastYearMonthKey = (() => { const [y,m] = targetMonth.split('-'); return `${+y-1}-${m}`; })();
      const prevChData = !Array.isArray(rawCh) ? (rawCh[prevMonthKey] || []) : [];
      const lastYearChData = !Array.isArray(rawCh) ? (rawCh[lastYearMonthKey] || []) : [];
      const INFLOW_CHANNELS = [
        { key:"네이버블로그",  label:"블로그",   color:"#03C75A" },
        { key:"네이버카페",    label:"카페",     color:"#0088FE" },
        { key:"네이버플레이스",label:"플레이스", color:"#FF6B35" },
        { key:"인스타그램",    label:"인스타",   color:"#E1306C" },
        { key:"유튜브",        label:"유튜브",   color:"#FF0000" },
        { key:"검색광고",      label:"검색광고", color:"#A78BFA" },
      ];
      const inflowCards = INFLOW_CHANNELS.map(ch => {
        const cur = chForMonth.find(c => c.channel === ch.key)?.inflow || 0;
        const prev = prevChData.find(c => c.channel === ch.key)?.inflow || 0;
        const lastYear = lastYearChData.find(c => c.channel === ch.key)?.inflow || 0;
        const diff = cur - prev;
        const diffYear = cur - lastYear;
        const diffColor = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#94A3B8';
        const diffYearColor = diffYear > 0 ? '#10B981' : diffYear < 0 ? '#EF4444' : '#94A3B8';
        return `<div class="kpi-card">
          <div class="kpi-label">${ch.label}</div>
          <div class="kpi-value" style="color:${ch.color};font-size:20px">${cur.toLocaleString()}</div>
          ${prev > 0 ? `<div style="color:${diffColor};font-size:10px;font-weight:700;margin-top:3px;">전월 ${diff >= 0 ? '+' : ''}${diff}</div>` : ''}
          ${lastYear > 0 ? `<div style="color:${diffYearColor};font-size:10px;font-weight:600;">전년동월 ${diffYear >= 0 ? '+' : ''}${diffYear}</div>` : ''}
        </div>`;
      }).join("");
      const hasInflowData = chForMonth.some(c => (c.inflow||0) > 0);
      return `
      ${hasInflowData ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:10px;">📊 채널별 유입 현황 (${targetMonth})</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px;">${inflowCards}</div>
        <div class="chart-wrap-sm"><canvas id="marketingInflowChart"></canvas></div>
      </div>` : ""}
      ${monthContents.length > 0 ? `
      <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:10px;">📋 콘텐츠 목록</div>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>채널</th><th>제목</th><th>발행일</th><th>상위노출</th><th>상태</th></tr></thead>
          <tbody>${contentRows}</tbody>
        </table>
      </div>` : `<div class="no-data">해당 월 콘텐츠 데이터가 없어요</div>`}`;
    })()}
  </div>` : ""}

  <!-- 7. 비용 관리 -->
  ${hasTab("cost") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>비용 관리</div>
    ${(monthContract > 0 || monthExpenses.length > 0) ? `
    <div class="two-col" style="margin-bottom:16px;">
      <div>
        <div class="three-col">
          <div class="stat-box"><div class="stat-val">${fmtN(monthContract)}만원</div><div class="stat-lbl">월 계약금</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#EF4444">${fmtN(totalExpense)}만원</div><div class="stat-lbl">소진액</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#10B981">${fmtN(monthContract-totalExpense)}만원</div><div class="stat-lbl">잔액</div></div>
        </div>
        ${expenseRows ? `<div style="margin-top:16px;overflow-x:auto;"><table><thead><tr><th>날짜</th><th>항목</th><th>메모</th><th>금액</th></tr></thead><tbody>${expenseRows}</tbody></table></div>` : ""}
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:8px;">📊 항목별 비중</div>
        <div class="chart-wrap-sm"><canvas id="costChart"></canvas></div>
      </div>
    </div>` : `<div class="no-data">해당 월 비용 데이터가 없어요</div>`}
  </div>` : ""}

  <!-- 8. 키워드 현황 -->
  ${hasTab("keyword") ? `
  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>키워드 현황</div>
    ${monthKw.length > 0 ? `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px;">
      ${kwSummaryCards}
    </div>
    <div style="color:#94A3B8;font-size:11px;text-align:right;">총 ${monthKw.length}개 키워드 · ${targetMonth} 기준</div>
    ` : `<div class="no-data">해당 월 키워드 데이터가 없어요</div>`}
  </div>` : ""}

  <div class="footer">
    <span>${hospital.name} · ${hospital.dept||''} · ${hospital.region||''}</span>
    <span>${lastMonth} 마케팅 리포트 · 작성일 ${today}</span>
  </div>

<script>
// 공통 옵션
const fontFamily = "'Noto Sans KR', sans-serif";
Chart.defaults.font.family = fontFamily;
Chart.defaults.color = '#64748B';

const months6 = ${JSON.stringify(hData.slice(-6).map(d=>d.month))};
const newPat6  = ${JSON.stringify(hData.slice(-6).map(d=>d.newPatient||0))};
const revenue6 = ${JSON.stringify(hData.slice(-6).map(d=>d.revenue||0))};
const inquiry6 = ${JSON.stringify(hData.slice(-6).map(d=>d.inquiry||0))};
const firstVisit6 = ${JSON.stringify(hData.slice(-6).map(d=>d.firstVisit||0))};
const firstPayment6 = ${JSON.stringify(hData.slice(-6).map(d=>d.firstPayment||0))};
const color1 = '${hospital.color}';

${hasTab("overview") && hData.length > 1 ? `
// 통합 요약 차트
new Chart(document.getElementById('overviewChart'), {
  type: 'bar',
  data: {
    labels: months6,
    datasets: [
      { label: '신환', data: newPat6, backgroundColor: color1+'99', borderColor: color1, borderWidth:2, borderRadius:6, yAxisID:'y' },
      { label: '매출(만원)', data: revenue6, type:'line', borderColor:'#10B981', backgroundColor:'#10B98120', borderWidth:2.5, pointRadius:4, tension:0.4, fill:true, yAxisID:'y1' },
    ]
  },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } }, y1:{ position:'right', beginAtZero:true, grid:{ drawOnChartArea:false } } } }
});` : ""}

${hasTab("performance") && hData.length > 0 ? `
// 상세 성과 차트1 - 신환/매출
new Chart(document.getElementById('perfChart1'), {
  type: 'bar',
  data: {
    labels: months6,
    datasets: [
      { label:'신환', data: newPat6, backgroundColor: color1+'88', borderColor: color1, borderWidth:2, borderRadius:5, yAxisID:'y' },
      { label:'매출(만)', data: revenue6, type:'line', borderColor:'#10B981', borderWidth:2, pointRadius:3, tension:0.4, yAxisID:'y1' }
    ]
  },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top', labels:{ boxWidth:12 } } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } }, y1:{ position:'right', beginAtZero:true, grid:{ drawOnChartArea:false } } } }
});
// 상세 성과 차트2 - 문의/내원/결제
new Chart(document.getElementById('perfChart2'), {
  type: 'line',
  data: {
    labels: months6,
    datasets: [
      { label:'문의', data: inquiry6, borderColor:'#6366F1', backgroundColor:'#6366F120', borderWidth:2, pointRadius:3, tension:0.4, fill:true },
      { label:'초진내원', data: firstVisit6, borderColor:'#F59E0B', backgroundColor:'#F59E0B20', borderWidth:2, pointRadius:3, tension:0.4, fill:true },
      { label:'초진결제', data: firstPayment6, borderColor:'#EC4899', backgroundColor:'#EC489920', borderWidth:2, pointRadius:3, tension:0.4, fill:true },
    ]
  },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top', labels:{ boxWidth:12 } } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } } } }
});` : ""}

${hasTab("funnel") ? `
// 전환 퍼널 차트
new Chart(document.getElementById('funnelChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(funnelStepsReport.map(s=>s.name))},
    datasets: [{ label:'인원', data: ${JSON.stringify(funnelStepsReport.map(s=>s.val))}, backgroundColor: ['#0EA5E9','#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981'].slice(0,${funnelStepsReport.length}), borderRadius:6 }]
  },
  options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ beginAtZero:true, grid:{ color:'#F1F5F9' } } } }
});` : ""}

${hasTab("marketing") ? `
// 마케팅 채널별 유입 차트 (전월 비교)
(function() {
  const el = document.getElementById('marketingInflowChart');
  if (!el) return;
  const rawCh = ${JSON.stringify(!Array.isArray(hospital.channelData||{}) ? hospital.channelData : {})};
  const targetM = '${targetMonth}';
  const [y,m] = targetM.split('-').map(Number);
  const prevM = m===1 ? \`\${y-1}-12\` : \`\${y}-\${String(m-1).padStart(2,'0')}\`;
  const curData = rawCh[targetM] || [];
  const prevData = rawCh[prevM] || [];
  const lastYearM = targetM.split('-')[0] - 1 + '-' + targetM.split('-')[1];
  const lastYearData = rawCh[lastYearM] || [];
  const INFLOW_CHANNELS = [
    { key:"네이버블로그",  label:"블로그",   color:"#03C75A" },
    { key:"네이버카페",    label:"카페",     color:"#0088FE" },
    { key:"네이버플레이스",label:"플레이스", color:"#FF6B35" },
    { key:"인스타그램",    label:"인스타",   color:"#E1306C" },
    { key:"유튜브",        label:"유튜브",   color:"#FF0000" },
    { key:"검색광고",      label:"검색광고", color:"#A78BFA" },
  ];
  const labels = INFLOW_CHANNELS.map(c => c.label);
  const curVals = INFLOW_CHANNELS.map(c => curData.find(r=>r.channel===c.key)?.inflow||0);
  const prevVals = INFLOW_CHANNELS.map(c => prevData.find(r=>r.channel===c.key)?.inflow||0);
  const lastYearVals = INFLOW_CHANNELS.map(c => lastYearData.find(r=>r.channel===c.key)?.inflow||0);
  if (curVals.every(v=>v===0) && prevVals.every(v=>v===0)) { el.parentElement.style.display='none'; return; }
  new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: targetM+' (당월)', data: curVals, backgroundColor: INFLOW_CHANNELS.map(c=>c.color+'99'), borderColor: INFLOW_CHANNELS.map(c=>c.color), borderWidth:2, borderRadius:6 },
        { label: prevM+' (전월)', data: prevVals, backgroundColor: '#94A3B833', borderColor: '#94A3B8', borderWidth:2, borderRadius:6 },
        { label: lastYearM+' (전년동월)', data: lastYearVals, backgroundColor: '#F59E0B33', borderColor: '#F59E0B', borderWidth:2, borderRadius:6 },
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top', labels:{ boxWidth:12 } } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } } } }
  });
})();` : ""}

${hasTab("channel") && reportChData.length > 0 ? `// 채널 유입 차트
const chLabels = ${JSON.stringify(reportChData.map(c=>c.channel))};
new Chart(document.getElementById('channelChart1'), {
  type: 'bar',
  data: { labels: chLabels, datasets: [{ label:'유입', data: ${JSON.stringify(reportChData.map(c=>c.inflow||0))}, backgroundColor: color1+'88', borderColor: color1, borderWidth:2, borderRadius:6 }] },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } } } }
});
// 채널 ROI 차트
new Chart(document.getElementById('channelChart2'), {
  type: 'bar',
  data: { labels: chLabels, datasets: [{ label:'ROI(%)', data: ${JSON.stringify(reportChData.map(c=>c.cost>0?Math.round((c.revenue-c.cost)/c.cost*100):0))}, backgroundColor: ${JSON.stringify(reportChData.map(c=>{const r=c.cost>0?Math.round((c.revenue-c.cost)/c.cost*100):0;return r>300?'#10B98199':r>100?'#F59E0B99':'#EF444499'}))}, borderRadius:6 }] },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#F1F5F9' } } } }
});` : ""}

${hasTab("patient") && patientRec && patientRec.channelData && patientRec.channelData.filter(c=>c.count>0).length > 0 ? `
// 환자 유입 도넛 차트
const patData = ${JSON.stringify(patientRec.channelData.filter(c=>c.count>0).map(c=>({ label:c.channel, val:c.count })))};
new Chart(document.getElementById('patientChart'), {
  type: 'doughnut',
  data: { labels: patData.map(d=>d.label), datasets: [{ data: patData.map(d=>d.val), backgroundColor: ['#0EA5E9','#6366F1','#10B981','#F59E0B','#EC4899','#8B5CF6','#F97316','#14B8A6'], borderWidth:2, borderColor:'#fff' }] },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ boxWidth:12, font:{ size:11 } } } } }
});` : ""}

${hasTab("cost") && monthExpenses.length > 0 ? `
// 비용 항목별 비중 도넛 차트
const costByCategory = {};
${JSON.stringify(monthExpenses)}.forEach(e => {
  const cat = e.category || '기타';
  costByCategory[cat] = (costByCategory[cat] || 0) + e.amount;
});
const costLabels = Object.keys(costByCategory);
const costData = Object.values(costByCategory);
new Chart(document.getElementById('costChart'), {
  type: 'doughnut',
  data: { 
    labels: costLabels, 
    datasets:[{ 
      data: costData, 
      backgroundColor: ['#0EA5E9AA','#6366F1AA','#10B981AA','#F59E0BAA','#EC4899AA','#8B5CF6AA','#F97316AA','#14B8A6AA','#EF4444AA','#FBBF24AA'], 
      borderWidth:2, borderColor:'#fff' 
    }] 
  },
  options: { 
    responsive:true, maintainAspectRatio:false, 
    plugins:{ 
      legend:{ position:'right', labels:{ boxWidth:12, font:{ size:11 } } }, 
      tooltip:{ callbacks:{ label: ctx => ctx.label+': '+ctx.raw.toLocaleString()+'만원 ('+Math.round(ctx.raw/costData.reduce((a,b)=>a+b,0)*100)+'%)' } } 
    } 
  }
});` : ""}
</script>
</body>
</html>`
    // 새 창에서 열기
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
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
          <button onClick={() => {
            setReportMonth(availMonths[0] || "");
            setShowReportModal(true);
          }} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:9, padding:"8px 16px", fontSize:12, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
            리포트 출력
          </button>

          {/* 리포트 섹션 선택 모달 */}
          {showReportModal && (
            <div onClick={() => setShowReportModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:16, padding:28, width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }}>
                <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:6 }}>📄 리포트 출력 설정</div>
                <div style={{ color:C.muted, fontSize:12, marginBottom:18 }}>출력할 월과 섹션을 선택해주세요</div>

                {/* 월 선택 */}
                <div style={{ marginBottom:18 }}>
                  <label style={{ color:C.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:8 }}>📅 기준 월</label>
                  {(() => {
                    const months = availMonths;
                    const contentMonths = [...new Set((hospital.contentData||[]).map(c=>c.date?.slice(0,7)).filter(Boolean))].sort().reverse();
                    const kwMonths = [...new Set(sharedKeywordData.map(k=>k.month).filter(Boolean))].sort().reverse();
                    const allMonths = [...new Set([...months, ...contentMonths, ...kwMonths])].sort().reverse();
                    if (allMonths.length === 0) return (
                      <div style={{ background:`${C.yellow}15`, border:`1px solid ${C.yellow}30`, borderRadius:10, padding:14 }}>
                        <div style={{ color:C.yellow, fontWeight:700, fontSize:13, marginBottom:4 }}>⚠️ 출력할 데이터가 없어요</div>
                        <div style={{ color:C.muted, fontSize:12 }}>마케팅 현황, 비용관리 등 데이터를 먼저 입력해주세요.</div>
                      </div>
                    );
                    // reportMonth가 allMonths에 없으면 첫 번째로 초기화
                    if (reportMonth === "" || !allMonths.includes(reportMonth)) {
                      setTimeout(() => setReportMonth(allMonths[0]), 0);
                    }
                    return (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {allMonths.map(m => (
                          <button key={m} onClick={() => setReportMonth(m)} style={{
                            background: reportMonth===m ? hospital.color : "#F1F5F9",
                            border: `1px solid ${reportMonth===m ? hospital.color : C.border}`,
                            color: reportMonth===m ? "#0F172A" : C.muted,
                            borderRadius:8, padding:"6px 14px", fontSize:12,
                            cursor:"pointer", fontWeight: reportMonth===m ? 700 : 400,
                          }}>{m}</button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 섹션 선택 */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <label style={{ color:C.muted, fontSize:11, fontWeight:700 }}>📋 포함할 섹션</label>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={() => setReportSections(prev => prev.map(r=>({...r,checked:true})))} style={{ background:"transparent", border:"none", color:C.accent, fontSize:11, cursor:"pointer", fontWeight:600 }}>전체 선택</button>
                      <button onClick={() => setReportSections(prev => prev.map(r=>({...r,checked:false})))} style={{ background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer" }}>전체 해제</button>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {reportSections.map(s => (
                      <div key={s.id} onClick={() => setReportSections(prev => prev.map(r => r.id===s.id ? {...r, checked:!r.checked} : r))}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:s.checked?`${hospital.color}10`:"#F8FAFC", border:`1px solid ${s.checked?hospital.color:C.border}`, borderRadius:10, cursor:"pointer" }}>
                        <div style={{ width:18, height:18, borderRadius:5, background:s.checked?hospital.color:C.surface, border:`2px solid ${s.checked?hospital.color:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {s.checked && <span style={{ color:"#0F172A", fontSize:11, fontWeight:900 }}>✓</span>}
                        </div>
                        <span style={{ color:s.checked?C.text:C.muted, fontSize:13, fontWeight:s.checked?600:400 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => {
                    setShowReportModal(false);
                    exportReport([...reportSections], reportMonth);
                  }} disabled={!reportMonth} style={{ flex:1, background: !reportMonth ? C.dim : `linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:9, padding:"11px 0", fontSize:13, cursor: !reportMonth ? "not-allowed" : "pointer", fontWeight:700 }}>출력하기</button>
                  <button onClick={() => setShowReportModal(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:9, padding:"11px 16px", fontSize:13, cursor:"pointer" }}>취소</button>
                </div>
              </div>
            </div>
          )}
          <Badge color={hospital.color}>{hospital.dept}</Badge>
          <Badge color={roi > 200 ? C.green : roi > 100 ? C.yellow : C.red}>ROI {roi}%</Badge>
        </div>
      </div>

      {/* 대분류 탭 */}
      <div style={{ display:"flex", gap:6, background:"#F8FAFC", borderBottom:`1px solid ${C.border}`, padding:"10px 28px 0", overflowX:"auto" }}>
        {visibleCategories.map(cat => (
          <button key={cat.id} onClick={() => switchCategory(cat.id)} style={{
            background: activeCategory===cat.id ? C.surface : "transparent",
            border: `1px solid ${activeCategory===cat.id ? C.border : "transparent"}`,
            borderBottom: activeCategory===cat.id ? `1px solid ${C.surface}` : "1px solid transparent",
            color: activeCategory===cat.id ? hospital.color : C.muted,
            borderRadius:"10px 10px 0 0", padding:"9px 18px", fontSize:13, cursor:"pointer",
            fontWeight: activeCategory===cat.id ? 800 : 600,
            fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif",
            position:"relative", top:1, whiteSpace:"nowrap",
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>

      {/* 중분류 탭 */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, paddingLeft:28, overflowX:"auto", background:C.surface }}>
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background:"transparent", border:"none", padding:"14px 16px", fontSize:13, cursor:"pointer", fontWeight:600,
            fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif",
            color:tab===t.id ? hospital.color : C.muted,
            borderBottom:tab===t.id ? `2px solid ${hospital.color}` : "2px solid transparent",
            transition:"all 0.15s", whiteSpace:"nowrap",
          }}>{t.label}</button>
        ))}
        {visibleTabs.length === 0 && (
          <div style={{ padding:"14px 0", fontSize:12, color:C.muted }}>이 카테고리에 표시할 항목이 없어요</div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div style={{ padding:"28px" }}>

        {/* 통합 요약 */}
        {tab === "overview" && (() => {
          // ── 데이터 계산 ─────────────────────────────────
          const totalMktCost = last.marketingCost || 0;
          const cpl = (last.inquiry||0) > 0 ? Math.round(totalMktCost / last.inquiry) : 0;
          const roi = totalMktCost > 0 ? Math.round(((last.revenue||0) - totalMktCost) / totalMktCost * 100) : 0;
          const revenueAchieve = hospital.target_revenue ? Math.round((last.revenue||0)/hospital.target_revenue*100) : null;
          const patientAchieve = hospital.target_patients ? Math.round((last.newPatient||0)/hospital.target_patients*100) : null;

          const diff = (cur, prv) => prv > 0 ? Math.round(((cur-prv)/prv)*100) : null;
          const dInquiry  = diff(last.inquiry||0,     prev?.inquiry||0);
          const dPatient  = diff(last.newPatient||0,  prev?.newPatient||0);
          const dRevenue  = diff(last.revenue||0,     prev?.revenue||0);
          const dCost     = diff(last.marketingCost||0, prev?.marketingCost||0);
          const dCpl      = prev?.inquiry>0 && prev?.marketingCost>0
            ? diff(cpl, Math.round((prev.marketingCost||0)/(prev.inquiry||1))) : null;

          const rawCh = hospital.channelData || {};
          const curCh = !Array.isArray(rawCh) ? (rawCh[selMonth]||[]) : rawCh;
          const topChannels = [...curCh].sort((a,b)=>(b.inflow||0)-(a.inflow||0)).slice(0,4);
          const totalInflow = curCh.reduce((s,c)=>s+(c.inflow||0),0);

          const contents = hospital.contentData || [];
          const monthContents = contents.filter(c=>c.date?.startsWith(selMonth?.slice(0,7)||""));

          const DiffBadge = ({d}) => d===null?null:(
            <span style={{color:d>0?C.green:d<0?C.red:C.muted,fontSize:11,fontWeight:700}}>
              {d>0?'▲':'▼'} {Math.abs(d)}%
            </span>
          );

          const KpiBox = ({label,value,unit,d,color,achieve,sub}) => (
            <div style={{background:"#F8FAFC",borderRadius:12,padding:14,border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:color||hospital.color,borderRadius:"12px 0 0 12px"}}/>
              <div style={{paddingLeft:8}}>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,marginBottom:4}}>{label}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{color:C.text,fontSize:20,fontWeight:900}}>{value}</span>
                  <span style={{color:C.muted,fontSize:11}}>{unit}</span>
                </div>
                {sub && <div style={{color:C.muted,fontSize:10,marginTop:2}}>{sub}</div>}
                {achieve!==null&&achieve!==undefined&&(
                  <div style={{marginTop:5}}>
                    <div style={{background:C.dim,borderRadius:4,height:3}}>
                      <div style={{width:`${Math.min(achieve,100)}%`,height:"100%",background:color||hospital.color,borderRadius:4}}/>
                    </div>
                    <div style={{color:color||hospital.color,fontSize:9,marginTop:2,fontWeight:700}}>목표 {achieve}%</div>
                  </div>
                )}
                {d!==null&&d!==undefined&&<div style={{marginTop:4}}><DiffBadge d={d}/><span style={{color:C.muted,fontSize:10,marginLeft:4}}>전월</span></div>}
              </div>
            </div>
          );

          return (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* 월 선택 + 입력 버튼 */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <MonthSelector />
                {isAdmin && inputBtn(showPerfInput?"입력 닫기":"데이터 입력",()=>setShowPerfInput(!showPerfInput))}
              </div>
              {showPerfInput && (
                <PerformanceInputForm hospital={hospital} monthlyData={hData}
                  onSave={(d)=>onUpdateHospital({...hospital,monthlyData:d})}
                  onClose={()=>setShowPerfInput(false)} />
              )}

              {/* 2열 그리드 메인 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

                {/* 좌: KPI + 성장요약 */}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* KPI 4+4 */}
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
                    <div style={{color:C.text,fontWeight:800,fontSize:13,marginBottom:12}}>📊 핵심 성과 지표</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <KpiBox label="총 문의수" value={fmt(last.inquiry)} unit="건" d={dInquiry} color={C.accent}/>
                      <KpiBox label="신환 수" value={fmt(last.newPatient)} unit="명" d={dPatient} color={hospital.color} achieve={patientAchieve}/>
                      <KpiBox label="매출" value={fmt(last.revenue)} unit="만원" d={dRevenue} color={C.green} achieve={revenueAchieve}/>
                      <KpiBox label="광고비" value={fmt(totalMktCost)} unit="만원" d={dCost} color={C.orange}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <KpiBox label="CPL (문의당 비용)" value={fmt(cpl)} unit="만원" d={dCpl} color={C.accent2} sub={`문의 ${fmt(last.inquiry)}건`}/>
                      <KpiBox label="ROI" value={roi} unit="%" color={roi>=200?C.green:roi>=100?C.yellow:C.red} sub="광고비 대비 수익"/>
                      <KpiBox label="예약" value={fmt(last.reservation)} unit="건" color="#8B5CF6" sub={`내원 ${fmt(last.visit)}명`}/>
                      <KpiBox label="초진 결제" value={fmt(last.firstPayment)} unit="건" color="#EC4899"
                        sub={`객단가 ${fmt(last.firstPayment>0?Math.round((last.revenue||0)/(last.firstPayment)):0)}만원`}/>
                    </div>
                  </div>

                  {/* 병원 성장 요약 */}
                  {last.inquiry > 0 && (
                    <div style={{background:`linear-gradient(135deg,${hospital.color}12,${C.accent2}08)`,border:`1px solid ${hospital.color}25`,borderRadius:14,padding:16}}>
                      <div style={{color:C.text,fontWeight:800,fontSize:13,marginBottom:10}}>🤖 병원 성장 요약</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {[
                          dInquiry!==null&&{icon:"📞",text:`문의 전월 대비 ${dInquiry>0?`+${dInquiry}% 증가`:`${dInquiry}% 감소`}`,color:dInquiry>0?C.green:C.red},
                          dPatient!==null&&{icon:"👤",text:`신환 전월 대비 ${dPatient>0?`+${dPatient}% 증가`:`${dPatient}% 감소`}`,color:dPatient>0?C.green:C.red},
                          cpl>0&&{icon:"💰",text:`CPL ${fmt(cpl)}만원`,color:C.muted},
                          roi>0&&{icon:"📈",text:`ROI ${roi}% · ${roi>=300?"우수 🎉":roi>=100?"양호":"개선 필요"}`,color:roi>=300?C.green:roi>=100?C.yellow:C.red},
                          topChannels[0]&&{icon:"🔝",text:`주요 유입: ${topChannels[0].channel}`,color:C.muted},
                        ].filter(Boolean).map((item,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6}}>
                            <span style={{fontSize:12}}>{item.icon}</span>
                            <span style={{color:item.color,fontSize:12,lineHeight:1.6,fontWeight:item.color===C.muted?400:600}}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 우: 채널 유입 + 콘텐츠 */}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* 주요 유입 채널 */}
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
                    <div style={{color:C.text,fontWeight:800,fontSize:13,marginBottom:12}}>🔝 주요 유입 채널</div>
                    {topChannels.length===0?(
                      <div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"16px 0"}}>채널 유입 데이터를 입력해주세요</div>
                    ):(
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {topChannels.map((ch,i)=>{
                          const pct=totalInflow>0?Math.round((ch.inflow||0)/totalInflow*100):0;
                          const colors=[hospital.color,C.accent,C.green,C.accent2];
                          return (
                            <div key={i}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                <span style={{color:C.text,fontSize:12,fontWeight:600}}>{ch.channel}</span>
                                <span style={{color:colors[i],fontSize:12,fontWeight:800}}>{fmt(ch.inflow)} <span style={{color:C.muted,fontWeight:400,fontSize:10}}>({pct}%)</span></span>
                              </div>
                              <div style={{background:C.dim,borderRadius:4,height:5}}>
                                <div style={{width:`${pct}%`,height:"100%",background:colors[i],borderRadius:4}}/>
                              </div>
                            </div>
                          );
                        })}
                        <div style={{color:C.muted,fontSize:10,textAlign:"right",marginTop:2}}>총 {fmt(totalInflow)}건</div>
                      </div>
                    )}
                  </div>

                  {/* 콘텐츠 현황 */}
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
                    <div style={{color:C.text,fontWeight:800,fontSize:13,marginBottom:12}}>📝 이번달 콘텐츠</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      {[
                        {label:"등록 콘텐츠",value:monthContents.length,unit:"건",color:hospital.color},
                        {label:"상위 노출",value:monthContents.filter(c=>c.topExposed).length,unit:"건",color:C.green},
                      ].map((s,i)=>(
                        <div key={i} style={{background:`${s.color}10`,borderRadius:10,padding:10,textAlign:"center"}}>
                          <div style={{color:s.color,fontSize:20,fontWeight:900}}>{s.value}</div>
                          <div style={{color:C.muted,fontSize:10,marginTop:2}}>{s.label} ({s.unit})</div>
                        </div>
                      ))}
                    </div>
                    {monthContents.slice(0,3).map((c,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 0",borderBottom:`1px solid ${C.dim}`}}>
                        <span style={{background:`${hospital.color}20`,color:hospital.color,borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700,flexShrink:0}}>{c.channel}</span>
                        <span style={{color:C.text,fontSize:11,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</span>
                        {c.topExposed&&<span style={{color:C.green,fontSize:9,fontWeight:700,flexShrink:0}}>상위✓</span>}
                      </div>
                    ))}
                    {monthContents.length===0&&<div style={{color:C.muted,fontSize:11,textAlign:"center",padding:"8px 0"}}>콘텐츠 없음</div>}
                  </div>
                </div>
              </div>

              {/* 월별 추이 테이블 */}
              {hData.length > 1 && (
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
                  <div style={{color:C.text,fontWeight:800,fontSize:13,marginBottom:12}}>📈 월별 성과 추이 (최근 6개월)</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead>
                        <tr>{["월","문의","신환","매출(만)","광고비(만)","CPL(만)","ROI"].map(h=>(
                          <th key={h} style={{color:C.muted,fontWeight:700,padding:"7px 10px",textAlign:"center",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...hData].slice(-6).reverse().map((d,i)=>{
                          const dCpl=d.inquiry>0?Math.round((d.marketingCost||0)/d.inquiry):0;
                          const dRoi=d.marketingCost>0?Math.round(((d.revenue||0)-d.marketingCost)/d.marketingCost*100):0;
                          const isSel=d.month===selMonth;
                          return (
                            <tr key={i} style={{background:isSel?`${hospital.color}08`:"transparent"}}>
                              <td style={{padding:"7px 10px",textAlign:"center",fontWeight:isSel?800:600,color:isSel?hospital.color:C.text,borderBottom:`1px solid ${C.dim}`}}>{d.month}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`}}>{fmt(d.inquiry)}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`}}>{fmt(d.newPatient)}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`}}>{fmt(d.revenue)}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`}}>{fmt(d.marketingCost)}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`,color:dCpl>0?C.accent2:C.muted}}>{dCpl>0?fmt(dCpl):'-'}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",borderBottom:`1px solid ${C.dim}`,color:dRoi>=200?C.green:dRoi>=100?C.yellow:C.red,fontWeight:700}}>{dRoi>0?dRoi+'%':'-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {tab === "schedule" && <HospitalScheduleTab hospital={hospital} globalSchedules={globalSchedules} saveGlobalSchedules={saveGlobalSchedules} isReadOnly={isReadOnly} />}
        {tab === "cost" && <CostTab hospital={hospital} hData={hData} onDataLoad={setSharedCostData} isReadOnly={isReadOnly} />}
        {tab === "meeting" && <MeetingTab hospital={hospital} isReadOnly={isReadOnly} />}
        {tab === "keyword" && <KeywordRankTab hospital={hospital} isAdmin={isAdmin} onDataLoad={setSharedKeywordData} onSelMonthChange={setSharedKeywordSelMonth} isReadOnly={isReadOnly} />}
        {tab === "marketing" && <MarketingTab hospital={hospital} chData={chData} initialContents={hospital.contentData || []} onUpdateHospital={onUpdateHospital} isAdmin={isAdmin} isReadOnly={isReadOnly} />}

        {/* 새 탭 - 순차적으로 구현 예정 */}
        {tab === "ads" && <AdsTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "inflow" && <InflowTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "branding" && <BrandingTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "review" && <ReviewManageTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "onlineasset" && <OnlineAssetTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "crm" && <CrmManageTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "consult" && <ConsultManageTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "patient" && <PatientManageTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "cs" && <CsManageTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "sop" && <SopTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "biz" && <BizTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "ai" && <AiSearchTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}
        {tab === "growreport" && <GrowReportTab hospital={hospital} isAdmin={isAdmin} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} />}

      </div>
    </div>
  );
}

// ─── 새 탭 플레이스홀더 ─────────────────────────────────────────
function ComingSoonTab({ title, icon, desc }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:60, gap:16 }}>
      <div style={{ fontSize:48 }}>{icon}</div>
      <div style={{ color:"#1E293B", fontSize:20, fontWeight:800 }}>{title}</div>
      <div style={{ color:"#64748B", fontSize:14, textAlign:"center", maxWidth:360, lineHeight:1.8 }}>{desc}</div>
      <div style={{ background:"#F1F5F9", borderRadius:10, padding:"8px 20px", color:"#94A3B8", fontSize:12, fontWeight:600 }}>준비 중 🔧</div>
    </div>
  );
}

function AdsTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const AD_CHANNELS = [
    { id:"meta",    label:"메타",    color:"#1877F2", icon:"📘" },
    { id:"naver",   label:"네이버",  color:"#03C75A", icon:"🟢" },
    { id:"google",  label:"구글",    color:"#EA4335", icon:"🔴" },
    { id:"kakao",   label:"카카오",  color:"#FEE500", icon:"🟡" },
    { id:"youtube", label:"유튜브",  color:"#FF0000", icon:"▶️" },
  ];

  const initData = () => ({
    channels: AD_CHANNELS.map(ch => ({
      id: ch.id, label: ch.label,
      budget:0, spend:0, impressions:0, clicks:0,
      inquiry:0, reservation:0, ctr:0, cpl:0, roas:0
    })),
    campaigns: [],
    creatives: [],
  });

  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [savedMsg, setSavedMsg] = useState("");
  const [activeSection, setActiveSection] = useState("channels"); // channels | campaigns | creatives
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  // adsData: { [YYYY-MM]: { channels, campaigns, creatives } }
  const adsData = hospital.adsData || {};
  const monthData = adsData[selMonth] || initData();

  const saveMonth = (updated) => {
    const newAdsData = { ...adsData, [selMonth]: updated };
    onUpdateHospital({ ...hospital, adsData: newAdsData });
    toast("저장 완료!");
  };

  // 채널 데이터 업데이트
  const updateChannel = (id, field, val) => {
    const updated = { ...monthData, channels: monthData.channels.map(c => c.id===id ? {...c, [field]: Number(val)||0} : c) };
    saveMonth(updated);
  };

  // 캠페인 CRUD
  const EMPTY_CAMP = { name:"", channel:"meta", budget:0, spend:0, inquiry:0, reservation:0, cpl:0, ctr:0, roas:0, memo:"" };
  const [campForm, setCampForm] = useState(EMPTY_CAMP);

  const saveCampaign = () => {
    const camps = [...(monthData.campaigns||[])];
    if (editIdx !== null) camps[editIdx] = { ...campForm, id: camps[editIdx].id };
    else camps.push({ ...campForm, id: Date.now() });
    saveMonth({ ...monthData, campaigns: camps });
    setCampForm(EMPTY_CAMP); setShowForm(false); setEditIdx(null);
  };

  const deleteCampaign = (idx) => {
    const camps = (monthData.campaigns||[]).filter((_,i)=>i!==idx);
    saveMonth({ ...monthData, campaigns: camps });
  };

  // 소재 CRUD
  const EMPTY_CREATIVE = { name:"", channel:"meta", type:"이미지", impressions:0, clicks:0, saves:0, shares:0, ctr:0, inquiry:0, hook:"", memo:"" };
  const [creativeForm, setCreativeForm] = useState(EMPTY_CREATIVE);

  const saveCreative = () => {
    const items = [...(monthData.creatives||[])];
    if (editIdx !== null) items[editIdx] = { ...creativeForm, id: items[editIdx].id };
    else items.push({ ...creativeForm, id: Date.now() });
    saveMonth({ ...monthData, creatives: items });
    setCreativeForm(EMPTY_CREATIVE); setShowForm(false); setEditIdx(null);
  };

  const deleteCreative = (idx) => {
    const items = (monthData.creatives||[]).filter((_,i)=>i!==idx);
    saveMonth({ ...monthData, creatives: items });
  };

  const fmtN = (n) => (n||0).toLocaleString();
  const months = [...Array(12)].map((_,i) => { const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });

  // 채널 합계
  const totalSpend = monthData.channels.reduce((s,c)=>s+(c.spend||0),0);
  const totalInquiry = monthData.channels.reduce((s,c)=>s+(c.inquiry||0),0);
  const totalReservation = monthData.channels.reduce((s,c)=>s+(c.reservation||0),0);
  const avgCpl = totalInquiry > 0 ? Math.round(totalSpend/totalInquiry) : 0;

  const SectionBtn = ({ id, label }) => (
    <button onClick={()=>{setActiveSection(id);setShowForm(false);setEditIdx(null);}} style={{
      background: activeSection===id ? hospital.color : "transparent",
      border: `1px solid ${activeSection===id ? hospital.color : C.border}`,
      color: activeSection===id ? "#0F172A" : C.muted,
      borderRadius:8, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700,
    }}>{label}</button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 헤더 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:6 }}>
          {months.slice(0,6).map(m => (
            <button key={m} onClick={()=>setSelMonth(m)} style={{
              background: selMonth===m ? `${hospital.color}20` : "transparent",
              border: `1px solid ${selMonth===m ? hospital.color : C.border}`,
              color: selMonth===m ? hospital.color : C.muted,
              borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{m.slice(5)}월</button>
          ))}
        </div>
      </div>

      {/* 채널 합계 KPI */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"총 광고비", value:`${fmtN(totalSpend)}만원`, color:C.orange },
          { label:"총 문의", value:`${fmtN(totalInquiry)}건`, color:C.accent },
          { label:"총 예약", value:`${fmtN(totalReservation)}건`, color:C.green },
          { label:"평균 CPL", value: avgCpl > 0 ? `${fmtN(avgCpl)}만원` : "-", color:C.accent2 },
        ].map((k,i) => (
          <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, textAlign:"center" }}>
            <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:6 }}>{k.label}</div>
            <div style={{ color:k.color, fontSize:22, fontWeight:900 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* 섹션 탭 */}
      <div style={{ display:"flex", gap:8 }}>
        <SectionBtn id="channels" label="📣 채널별 성과" />
        <SectionBtn id="campaigns" label="🎯 캠페인별 성과" />
        <SectionBtn id="creatives" label="🎨 소재 분석" />
      </div>

      {/* 채널별 성과 */}
      {activeSection === "channels" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>채널별 광고 성과 · {selMonth}</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  {["채널","예산(만)","소진(만)","소진율","노출","클릭","CTR","문의","CPL(만)","예약","ROAS"].map(h=>(
                    <th key={h} style={{ color:C.muted, fontWeight:700, padding:"8px 10px", textAlign:"center", borderBottom:`2px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                  {!isReadOnly && <th style={{ color:C.muted, fontWeight:700, padding:"8px 10px", borderBottom:`2px solid ${C.border}` }}>입력</th>}
                </tr>
              </thead>
              <tbody>
                {monthData.channels.map((ch,i) => {
                  const info = AD_CHANNELS.find(a=>a.id===ch.id);
                  const spendPct = ch.budget > 0 ? Math.round((ch.spend||0)/ch.budget*100) : 0;
                  const ctr = ch.impressions > 0 ? ((ch.clicks||0)/ch.impressions*100).toFixed(2) : (ch.ctr||0);
                  const cpl = ch.inquiry > 0 ? Math.round((ch.spend||0)/ch.inquiry) : (ch.cpl||0);
                  return (
                    <EditableChannelRow key={i} ch={ch} info={info} spendPct={spendPct} ctr={ctr} cpl={cpl}
                      isReadOnly={isReadOnly} onUpdate={(field,val)=>updateChannel(ch.id, field, val)} C={C} inputSt={inputSt} />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 캠페인별 성과 */}
      {activeSection === "campaigns" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>캠페인별 성과 · {selMonth}</div>
            {!isReadOnly && <button onClick={()=>{setShowForm(!showForm);setEditIdx(null);setCampForm(EMPTY_CAMP);}} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>+ 캠페인 추가</button>}
          </div>

          {showForm && (
            <div style={{ background:"#F8FAFC", borderRadius:12, padding:16, marginBottom:16, border:`1px solid ${hospital.color}30` }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>캠페인명</label>
                  <input value={campForm.name} onChange={e=>setCampForm(p=>({...p,name:e.target.value}))} placeholder="캠페인명" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>채널</label>
                  <select value={campForm.channel} onChange={e=>setCampForm(p=>({...p,channel:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                    {AD_CHANNELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예산(만원)</label>
                  <input type="number" value={campForm.budget||""} onChange={e=>setCampForm(p=>({...p,budget:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>소진(만원)</label>
                  <input type="number" value={campForm.spend||""} onChange={e=>setCampForm(p=>({...p,spend:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label>
                  <input type="number" value={campForm.inquiry||""} onChange={e=>setCampForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예약수</label>
                  <input type="number" value={campForm.reservation||""} onChange={e=>setCampForm(p=>({...p,reservation:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>CTR(%)</label>
                  <input type="number" step="0.01" value={campForm.ctr||""} onChange={e=>setCampForm(p=>({...p,ctr:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>ROAS(%)</label>
                  <input type="number" value={campForm.roas||""} onChange={e=>setCampForm(p=>({...p,roas:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
                <div>
                  <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label>
                  <input value={campForm.memo||""} onChange={e=>setCampForm(p=>({...p,memo:e.target.value}))} placeholder="메모" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={saveCampaign} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 18px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                <button onClick={()=>{setShowForm(false);setEditIdx(null);}} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
              </div>
            </div>
          )}

          {(monthData.campaigns||[]).length === 0 ? (
            <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>캠페인 데이터를 추가해주세요</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr>{["캠페인명","채널","예산(만)","소진(만)","문의","예약","CPL(만)","CTR(%)","ROAS(%)","메모",""].map(h=>(
                    <th key={h} style={{ color:C.muted, fontWeight:700, padding:"8px 10px", textAlign:"center", borderBottom:`2px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {(monthData.campaigns||[]).map((camp,i) => {
                    const chInfo = AD_CHANNELS.find(a=>a.id===camp.channel);
                    const cpl = camp.inquiry > 0 ? Math.round((camp.spend||0)/camp.inquiry) : (camp.cpl||0);
                    return (
                      <tr key={i}>
                        <td style={{ padding:"8px 10px", fontWeight:700, color:C.text, borderBottom:`1px solid ${C.dim}` }}>{camp.name}</td>
                        <td style={{ padding:"8px 10px", textAlign:"center", borderBottom:`1px solid ${C.dim}` }}>
                          <span style={{ background:`${chInfo?.color||C.accent}20`, color:chInfo?.color||C.accent, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{chInfo?.label||camp.channel}</span>
                        </td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{fmtN(camp.budget)}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{fmtN(camp.spend)}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.accent, fontWeight:700 }}>{fmtN(camp.inquiry)}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.green, fontWeight:700 }}>{fmtN(camp.reservation)}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.accent2 }}>{cpl > 0 ? fmtN(cpl) : "-"}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{camp.ctr > 0 ? camp.ctr+"%" : "-"}</td>
                        <td style={{ padding:"8px 10px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.green }}>{camp.roas > 0 ? camp.roas+"%" : "-"}</td>
                        <td style={{ padding:"8px 10px", color:C.muted, fontSize:11, borderBottom:`1px solid ${C.dim}` }}>{camp.memo}</td>
                        {!isReadOnly && <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.dim}`, textAlign:"center" }}>
                          <button onClick={()=>{setCampForm(camp);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", marginRight:4 }}>수정</button>
                          <button onClick={()=>deleteCampaign(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 소재 분석 */}
      {activeSection === "creatives" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>소재 분석 · {selMonth}</div>
            {!isReadOnly && <button onClick={()=>{setShowForm(!showForm);setEditIdx(null);setCreativeForm(EMPTY_CREATIVE);}} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>+ 소재 추가</button>}
          </div>

          {showForm && (
            <div style={{ background:"#F8FAFC", borderRadius:12, padding:16, marginBottom:16, border:`1px solid ${hospital.color}30` }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                {[
                  { label:"소재명", field:"name", type:"text", ph:"소재명" },
                  { label:"채널", field:"channel", type:"select" },
                  { label:"유형", field:"type", type:"select2" },
                  { label:"노출수", field:"impressions", type:"number" },
                  { label:"클릭수", field:"clicks", type:"number" },
                  { label:"저장수", field:"saves", type:"number" },
                  { label:"공유수", field:"shares", type:"number" },
                  { label:"문의전환", field:"inquiry", type:"number" },
                  { label:"성과 Hook", field:"hook", type:"text", ph:"성과 좋은 Hook 문구" },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>{f.label}</label>
                    {f.type === "select" ? (
                      <select value={creativeForm[f.field]||""} onChange={e=>setCreativeForm(p=>({...p,[f.field]:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                        {AD_CHANNELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    ) : f.type === "select2" ? (
                      <select value={creativeForm[f.field]||""} onChange={e=>setCreativeForm(p=>({...p,[f.field]:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                        {["이미지","영상","릴스","카드뉴스","텍스트"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={creativeForm[f.field]||""} onChange={e=>setCreativeForm(p=>({...p,[f.field]:f.type==="number"?+e.target.value:e.target.value}))} placeholder={f.ph||""} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={saveCreative} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 18px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                <button onClick={()=>{setShowForm(false);setEditIdx(null);}} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
              </div>
            </div>
          )}

          {(monthData.creatives||[]).length === 0 ? (
            <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>소재 데이터를 추가해주세요</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {(monthData.creatives||[]).sort((a,b)=>(b.inquiry||0)-(a.inquiry||0)).map((cr,i) => {
                const chInfo = AD_CHANNELS.find(a=>a.id===cr.channel);
                const ctr = cr.impressions > 0 ? ((cr.clicks||0)/cr.impressions*100).toFixed(2) : 0;
                return (
                  <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ background:`${chInfo?.color||C.accent}20`, color:chInfo?.color||C.accent, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{chInfo?.label}</span>
                        <span style={{ background:`${C.accent2}15`, color:C.accent2, borderRadius:5, padding:"2px 8px", fontSize:11 }}>{cr.type}</span>
                        <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{cr.name}</span>
                      </div>
                      {!isReadOnly && (
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>{setCreativeForm(cr);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>수정</button>
                          <button onClick={()=>deleteCreative(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                        </div>
                      )}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
                      {[
                        { label:"노출", value:fmtN(cr.impressions), color:C.muted },
                        { label:"클릭", value:fmtN(cr.clicks), color:C.accent },
                        { label:"CTR", value:ctr+"%", color:C.yellow },
                        { label:"저장", value:fmtN(cr.saves), color:C.green },
                        { label:"공유", value:fmtN(cr.shares), color:C.accent2 },
                        { label:"문의전환", value:fmtN(cr.inquiry), color:C.orange },
                      ].map((s,j) => (
                        <div key={j} style={{ background:C.surface, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                          <div style={{ color:s.color, fontSize:16, fontWeight:800 }}>{s.value}</div>
                          <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {cr.hook && (
                      <div style={{ marginTop:10, background:`${hospital.color}10`, borderRadius:8, padding:"8px 12px" }}>
                        <span style={{ color:C.muted, fontSize:11 }}>💡 성과 Hook: </span>
                        <span style={{ color:hospital.color, fontSize:12, fontWeight:700 }}>{cr.hook}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 채널별 인라인 편집 행
function EditableChannelRow({ ch, info, spendPct, ctr, cpl, isReadOnly, onUpdate, C, inputSt }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ budget:ch.budget||0, spend:ch.spend||0, impressions:ch.impressions||0, clicks:ch.clicks||0, inquiry:ch.inquiry||0, reservation:ch.reservation||0, roas:ch.roas||0 });

  const save = () => {
    Object.entries(form).forEach(([k,v]) => onUpdate(k, v));
    setEditing(false);
  };

  return (
    <tr style={{ background: editing ? `${info?.color||"#0EA5E9"}08` : "transparent" }}>
      <td style={{ padding:"10px 12px", fontWeight:700, borderBottom:`1px solid ${C.dim}`, whiteSpace:"nowrap" }}>
        <span style={{ marginRight:6 }}>{info?.icon}</span>
        <span style={{ color:info?.color||C.text }}>{info?.label||ch.label}</span>
      </td>
      {editing ? (
        <>
          {["budget","spend","impressions","clicks","inquiry","reservation","roas"].map(f => (
            <td key={f} style={{ padding:"6px 8px", borderBottom:`1px solid ${C.dim}` }}>
              <input type="number" value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:+e.target.value}))}
                style={{ ...inputSt, padding:"4px 6px", fontSize:11, width:70, textAlign:"right" }} />
            </td>
          ))}
          <td style={{ padding:"6px 8px", borderBottom:`1px solid ${C.dim}` }}>-</td>
          <td style={{ padding:"6px 8px", borderBottom:`1px solid ${C.dim}` }}>-</td>
          <td style={{ padding:"6px 8px", borderBottom:`1px solid ${C.dim}`, textAlign:"center" }}>
            <button onClick={save} style={{ background:`${info?.color||"#0EA5E9"}`, border:"none", color:"#fff", borderRadius:5, padding:"3px 10px", fontSize:11, cursor:"pointer", marginRight:4 }}>저장</button>
            <button onClick={()=>setEditing(false)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>취소</button>
          </td>
        </>
      ) : (
        <>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{(ch.budget||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{(ch.spend||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}` }}>
            <div style={{ background:C.dim, borderRadius:4, height:6, width:60, margin:"0 auto 3px" }}>
              <div style={{ width:`${Math.min(spendPct,100)}%`, height:"100%", background:info?.color||C.accent, borderRadius:4 }} />
            </div>
            <span style={{ fontSize:10, color:C.muted }}>{spendPct}%</span>
          </td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{(ch.impressions||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}` }}>{(ch.clicks||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.yellow }}>{ctr}%</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.accent, fontWeight:700 }}>{(ch.inquiry||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.accent2 }}>{cpl > 0 ? cpl.toLocaleString() : "-"}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.green }}>{(ch.reservation||0).toLocaleString()}</td>
          <td style={{ padding:"10px 12px", textAlign:"right", borderBottom:`1px solid ${C.dim}`, color:C.green, fontWeight:700 }}>{ch.roas > 0 ? ch.roas+"%" : "-"}</td>
          {!isReadOnly && <td style={{ padding:"10px 12px", borderBottom:`1px solid ${C.dim}`, textAlign:"center" }}>
            <button onClick={()=>setEditing(true)} style={{ background:`${info?.color||C.accent}15`, border:`1px solid ${info?.color||C.accent}30`, color:info?.color||C.accent, borderRadius:5, padding:"3px 10px", fontSize:10, cursor:"pointer" }}>입력</button>
          </td>}
        </>
      )}
    </tr>
  );
}

function InflowTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const INFLOW_CHANNELS = ["블로그","플레이스","홈페이지","메타광고","검색광고","소개환자","직접검색","기타"];
  const TIME_SLOTS = ["09-11시","11-13시","13-15시","15-17시","17-19시","19-21시","21시이후"];
  const DAYS = ["월","화","수","목","금","토","일"];

  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [activeSection, setActiveSection] = useState("channel");
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  const inflowData = hospital.inflowData || {};
  const monthData = inflowData[selMonth] || { channels:[], regions:[], procedures:[], timeSlots:[], doctors:[] };

  const saveMonth = (updated) => {
    onUpdateHospital({ ...hospital, inflowData: { ...inflowData, [selMonth]: updated } });
    toast("저장 완료!");
  };

  const months = [...Array(6)].map((_,i) => { const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });
  const fmtN = (n) => (n||0).toLocaleString();

  // 각 섹션 폼 상태
  const EMPTY_CH = { channel:"블로그", inquiry:0, reservation:0, visit:0, memo:"" };
  const EMPTY_RG = { region:"", inquiry:0, distance:"", lifezone:"", memo:"" };
  const EMPTY_PR = { name:"", inquiry:0, reservation:0, visit:0, unitPrice:0, memo:"" };
  const EMPTY_TS = { slot:"09-11시", day:"월", inquiry:0, reservation:0, memo:"" };
  const EMPTY_DR = { name:"", inquiry:0, reservation:0, review:0, searchVol:0, specialty:"", memo:"" };

  const [form, setForm] = useState({});

  const getEmptyForm = () => {
    if (activeSection === "channel")   return EMPTY_CH;
    if (activeSection === "region")    return EMPTY_RG;
    if (activeSection === "procedure") return EMPTY_PR;
    if (activeSection === "timeslot")  return EMPTY_TS;
    if (activeSection === "doctor")    return EMPTY_DR;
    return {};
  };

  const getKey = () => {
    if (activeSection === "channel")   return "channels";
    if (activeSection === "region")    return "regions";
    if (activeSection === "procedure") return "procedures";
    if (activeSection === "timeslot")  return "timeSlots";
    if (activeSection === "doctor")    return "doctors";
    return "channels";
  };

  const saveItem = () => {
    const key = getKey();
    const items = [...(monthData[key]||[])];
    if (editIdx !== null) items[editIdx] = { ...form, id: items[editIdx]?.id || Date.now() };
    else items.push({ ...form, id: Date.now() });
    saveMonth({ ...monthData, [key]: items });
    setForm(getEmptyForm()); setShowForm(false); setEditIdx(null);
  };

  const deleteItem = (idx) => {
    const key = getKey();
    const items = (monthData[key]||[]).filter((_,i)=>i!==idx);
    saveMonth({ ...monthData, [key]: items });
  };

  const SectionBtn = ({ id, label }) => (
    <button onClick={()=>{setActiveSection(id);setShowForm(false);setEditIdx(null);setForm({});}} style={{
      background: activeSection===id ? hospital.color : "transparent",
      border: `1px solid ${activeSection===id ? hospital.color : C.border}`,
      color: activeSection===id ? "#0F172A" : C.muted,
      borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700,
    }}>{label}</button>
  );

  // 합계
  const totalInquiry = (monthData.channels||[]).reduce((s,c)=>s+(c.inquiry||0),0);
  const totalVisit   = (monthData.channels||[]).reduce((s,c)=>s+(c.visit||0),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 월 선택 */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {months.map(m => (
          <button key={m} onClick={()=>setSelMonth(m)} style={{
            background: selMonth===m ? `${hospital.color}20` : "transparent",
            border: `1px solid ${selMonth===m ? hospital.color : C.border}`,
            color: selMonth===m ? hospital.color : C.muted,
            borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
          }}>{m.slice(5)}월</button>
        ))}
      </div>

      {/* KPI 요약 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"총 문의", value:fmtN(totalInquiry)+"건", color:C.accent },
          { label:"내원", value:fmtN(totalVisit)+"명", color:hospital.color },
          { label:"채널 수", value:(monthData.channels||[]).length+"개", color:C.accent2 },
          { label:"주요 시술", value:(monthData.procedures||[]).length+"개", color:C.green },
        ].map((k,i) => (
          <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, textAlign:"center" }}>
            <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:6 }}>{k.label}</div>
            <div style={{ color:k.color, fontSize:22, fontWeight:900 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* 섹션 탭 */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <SectionBtn id="channel"   label="📡 채널별 유입" />
        <SectionBtn id="region"    label="🗺 지역별 유입" />
        <SectionBtn id="procedure" label="💉 시술별 유입" />
        <SectionBtn id="timeslot"  label="⏰ 시간대별 분석" />
        <SectionBtn id="doctor"    label="👨‍⚕️ 원장별 분석" />
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div style={{ background:"#F8FAFC", borderRadius:14, padding:18, border:`1px solid ${hospital.color}30` }}>
          <div style={{ color:hospital.color, fontWeight:700, fontSize:13, marginBottom:12 }}>
            {editIdx !== null ? "✏️ 수정" : "+ 추가"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>

            {/* 채널별 */}
            {activeSection === "channel" && <>
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>유입 채널</label>
                <select value={form.channel||""} onChange={e=>setForm(p=>({...p,channel:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                  {INFLOW_CHANNELS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label><input type="number" value={form.inquiry||""} onChange={e=>setForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예약수</label><input type="number" value={form.reservation||""} onChange={e=>setForm(p=>({...p,reservation:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>내원수</label><input type="number" value={form.visit||""} onChange={e=>setForm(p=>({...p,visit:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label><input value={form.memo||""} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
            </>}

            {/* 지역별 */}
            {activeSection === "region" && <>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>지역명</label><input value={form.region||""} onChange={e=>setForm(p=>({...p,region:e.target.value}))} placeholder="예: 강남구" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label><input type="number" value={form.inquiry||""} onChange={e=>setForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>거리 기반</label><input value={form.distance||""} onChange={e=>setForm(p=>({...p,distance:e.target.value}))} placeholder="예: 2km 이내" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>생활권</label><input value={form.lifezone||""} onChange={e=>setForm(p=>({...p,lifezone:e.target.value}))} placeholder="예: 강남 직장인" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label><input value={form.memo||""} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
            </>}

            {/* 시술별 */}
            {activeSection === "procedure" && <>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>시술명</label><input value={form.name||""} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="예: 보톡스" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label><input type="number" value={form.inquiry||""} onChange={e=>setForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예약수</label><input type="number" value={form.reservation||""} onChange={e=>setForm(p=>({...p,reservation:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>내원수</label><input type="number" value={form.visit||""} onChange={e=>setForm(p=>({...p,visit:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>객단가(만원)</label><input type="number" value={form.unitPrice||""} onChange={e=>setForm(p=>({...p,unitPrice:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label><input value={form.memo||""} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
            </>}

            {/* 시간대별 */}
            {activeSection === "timeslot" && <>
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>시간대</label>
                <select value={form.slot||""} onChange={e=>setForm(p=>({...p,slot:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                  {TIME_SLOTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>요일</label>
                <select value={form.day||""} onChange={e=>setForm(p=>({...p,day:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, appearance:"none" }}>
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label><input type="number" value={form.inquiry||""} onChange={e=>setForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예약수</label><input type="number" value={form.reservation||""} onChange={e=>setForm(p=>({...p,reservation:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>메모</label><input value={form.memo||""} onChange={e=>setForm(p=>({...p,memo:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
            </>}

            {/* 원장별 */}
            {activeSection === "doctor" && <>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>원장명</label><input value={form.name||""} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="예: 홍길동 원장" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>문의수</label><input type="number" value={form.inquiry||""} onChange={e=>setForm(p=>({...p,inquiry:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>예약수</label><input type="number" value={form.reservation||""} onChange={e=>setForm(p=>({...p,reservation:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>후기수</label><input type="number" value={form.review||""} onChange={e=>setForm(p=>({...p,review:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>검색량</label><input type="number" value={form.searchVol||""} onChange={e=>setForm(p=>({...p,searchVol:+e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:3 }}>전문 시술</label><input value={form.specialty||""} onChange={e=>setForm(p=>({...p,specialty:e.target.value}))} placeholder="예: 보톡스, 필러" style={{ ...inputSt, padding:"6px 10px", fontSize:12 }} /></div>
            </>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveItem} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 18px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
            <button onClick={()=>{setShowForm(false);setEditIdx(null);}} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

      {/* 데이터 표시 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>
            {activeSection === "channel" && "📡 채널별 유입 분석"}
            {activeSection === "region" && "🗺 지역별 유입 분석"}
            {activeSection === "procedure" && "💉 시술별 유입 분석"}
            {activeSection === "timeslot" && "⏰ 시간대별 문의 분석"}
            {activeSection === "doctor" && "👨‍⚕️ 원장별 분석"}
          </div>
          {!isReadOnly && (
            <button onClick={()=>{setShowForm(!showForm);setEditIdx(null);setForm(getEmptyForm());}} style={{
              background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none",
              color:"#0F172A", borderRadius:8, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700,
            }}>+ 추가</button>
          )}
        </div>

        {/* 채널별 */}
        {activeSection === "channel" && (
          (monthData.channels||[]).length === 0 ? <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>채널 유입 데이터를 추가해주세요</div> :
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[...(monthData.channels||[])].sort((a,b)=>(b.inquiry||0)-(a.inquiry||0)).map((ch,i) => {
              const pct = totalInquiry > 0 ? Math.round((ch.inquiry||0)/totalInquiry*100) : 0;
              const visitRate = ch.inquiry > 0 ? Math.round((ch.visit||0)/(ch.inquiry||1)*100) : 0;
              const colors = [hospital.color, C.accent, C.green, C.accent2, C.orange, C.yellow, "#8B5CF6", "#EC4899"];
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.dim}` }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:colors[i%colors.length], flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{ch.channel}</span>
                      <span style={{ color:colors[i%colors.length], fontWeight:800, fontSize:13 }}>{fmtN(ch.inquiry)}건 <span style={{ color:C.muted, fontSize:11, fontWeight:400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ background:C.dim, borderRadius:4, height:6, marginBottom:4 }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:colors[i%colors.length], borderRadius:4 }} />
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      <span style={{ color:C.muted, fontSize:11 }}>예약 {fmtN(ch.reservation)}건</span>
                      <span style={{ color:C.muted, fontSize:11 }}>내원 {fmtN(ch.visit)}명</span>
                      <span style={{ color:visitRate>=50?C.green:C.muted, fontSize:11, fontWeight:visitRate>=50?700:400 }}>내원율 {visitRate}%</span>
                      {ch.memo && <span style={{ color:C.muted, fontSize:11 }}>💬 {ch.memo}</span>}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>{setForm(ch);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>수정</button>
                      <button onClick={()=>deleteItem(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 지역별 */}
        {activeSection === "region" && (
          (monthData.regions||[]).length === 0 ? <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>지역 유입 데이터를 추가해주세요</div> :
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr>{["지역","문의","거리 기반","생활권","메모",""].map(h=><th key={h} style={{ color:C.muted, fontWeight:700, padding:"8px 12px", textAlign:"center", borderBottom:`2px solid ${C.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[...(monthData.regions||[])].sort((a,b)=>(b.inquiry||0)-(a.inquiry||0)).map((r,i) => (
                  <tr key={i}>
                    <td style={{ padding:"9px 12px", fontWeight:700, color:C.text, borderBottom:`1px solid ${C.dim}` }}>{r.region}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:C.accent, fontWeight:700 }}>{fmtN(r.inquiry)}건</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:C.muted }}>{r.distance||"-"}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:C.muted }}>{r.lifezone||"-"}</td>
                    <td style={{ padding:"9px 12px", color:C.muted, fontSize:11, borderBottom:`1px solid ${C.dim}` }}>{r.memo}</td>
                    {!isReadOnly && <td style={{ padding:"9px 12px", borderBottom:`1px solid ${C.dim}`, textAlign:"center" }}>
                      <button onClick={()=>{setForm(r);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", marginRight:4 }}>수정</button>
                      <button onClick={()=>deleteItem(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 시술별 */}
        {activeSection === "procedure" && (
          (monthData.procedures||[]).length === 0 ? <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>시술 유입 데이터를 추가해주세요</div> :
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            {[...(monthData.procedures||[])].sort((a,b)=>(b.inquiry||0)-(a.inquiry||0)).map((pr,i) => {
              const reserveRate = pr.inquiry > 0 ? Math.round((pr.reservation||0)/pr.inquiry*100) : 0;
              const visitRate = pr.reservation > 0 ? Math.round((pr.visit||0)/pr.reservation*100) : 0;
              return (
                <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>{pr.name}</span>
                    {!isReadOnly && (
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>{setForm(pr);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>수정</button>
                        <button onClick={()=>deleteItem(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                    {[
                      { label:"문의", value:fmtN(pr.inquiry)+"건", color:C.accent },
                      { label:"예약률", value:reserveRate+"%", color:C.green },
                      { label:"내원률", value:visitRate+"%", color:hospital.color },
                      { label:"객단가", value:pr.unitPrice>0?fmtN(pr.unitPrice)+"만":"-", color:C.yellow },
                    ].map((s,j) => (
                      <div key={j} style={{ background:C.surface, borderRadius:8, padding:"8px", textAlign:"center" }}>
                        <div style={{ color:s.color, fontSize:15, fontWeight:800 }}>{s.value}</div>
                        <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {pr.memo && <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>💬 {pr.memo}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* 시간대별 */}
        {activeSection === "timeslot" && (
          (monthData.timeSlots||[]).length === 0 ? <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>시간대별 데이터를 추가해주세요</div> :
          <div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr>{["시간대","요일","문의","예약","메모",""].map(h=><th key={h} style={{ color:C.muted, fontWeight:700, padding:"8px 12px", textAlign:"center", borderBottom:`2px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...(monthData.timeSlots||[])].sort((a,b)=>(b.inquiry||0)-(a.inquiry||0)).map((ts,i) => (
                    <tr key={i}>
                      <td style={{ padding:"9px 12px", fontWeight:700, textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:hospital.color }}>{ts.slot}</td>
                      <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}` }}>{ts.day}요일</td>
                      <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:C.accent, fontWeight:700 }}>{fmtN(ts.inquiry)}건</td>
                      <td style={{ padding:"9px 12px", textAlign:"center", borderBottom:`1px solid ${C.dim}`, color:C.green }}>{fmtN(ts.reservation)}건</td>
                      <td style={{ padding:"9px 12px", color:C.muted, fontSize:11, borderBottom:`1px solid ${C.dim}` }}>{ts.memo}</td>
                      {!isReadOnly && <td style={{ padding:"9px 12px", borderBottom:`1px solid ${C.dim}`, textAlign:"center" }}>
                        <button onClick={()=>{setForm(ts);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer", marginRight:4 }}>수정</button>
                        <button onClick={()=>deleteItem(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 원장별 */}
        {activeSection === "doctor" && (
          (monthData.doctors||[]).length === 0 ? <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>원장별 데이터를 추가해주세요</div> :
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            {(monthData.doctors||[]).map((dr,i) => {
              const reserveRate = dr.inquiry > 0 ? Math.round((dr.reservation||0)/dr.inquiry*100) : 0;
              return (
                <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div>
                      <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>{dr.name}</span>
                      {dr.specialty && <span style={{ background:`${hospital.color}15`, color:hospital.color, borderRadius:5, padding:"1px 8px", fontSize:11, marginLeft:8 }}>{dr.specialty}</span>}
                    </div>
                    {!isReadOnly && (
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>{setForm(dr);setEditIdx(i);setShowForm(true);}} style={{ background:`${hospital.color}15`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>수정</button>
                        <button onClick={()=>deleteItem(i)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                    {[
                      { label:"문의", value:fmtN(dr.inquiry)+"건", color:C.accent },
                      { label:"예약률", value:reserveRate+"%", color:C.green },
                      { label:"후기", value:fmtN(dr.review)+"건", color:C.yellow },
                      { label:"검색량", value:fmtN(dr.searchVol), color:C.accent2 },
                    ].map((s,j) => (
                      <div key={j} style={{ background:C.surface, borderRadius:8, padding:"8px", textAlign:"center" }}>
                        <div style={{ color:s.color, fontSize:15, fontWeight:800 }}>{s.value}</div>
                        <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {dr.memo && <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>💬 {dr.memo}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BrandingTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };
  const months = [...Array(6)].map((_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });
  const fmtN = (n) => (n||0).toLocaleString();

  const brandingData = hospital.brandingData || {};
  const emptyMonth = { search:{hospital:0,doctor:0,procedures:[],relatedKeywords:[]}, sns:{instaFollowers:0,instaLikes:0,instaComments:0,instaSaves:0,reelsViews:0}, content:{blogAvgTime:0,topContents:[],inflowKeywords:[]}, trust:{reviewCount:0,reviewRate:0,avgRating:0,directSearchChange:0,reVisitRate:0} };
  const monthData = { ...emptyMonth, ...brandingData[selMonth] };

  // 전달 데이터
  const prevMonthKey = (() => { const [y,m] = selMonth.split('-').map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; })();
  const prevData = { ...emptyMonth, ...brandingData[prevMonthKey] };

  const saveMonth = (updated) => {
    onUpdateHospital({ ...hospital, brandingData: { ...brandingData, [selMonth]: updated } });
    toast("저장 완료!");
  };

  const updateField = (section, field, val) => {
    const parsed = isNaN(+val) ? val : +val;
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: parsed } });
  };

  const addItem = (section, field, item) => {
    const arr = [...(monthData[section][field]||[]), { id:Date.now(), ...item }];
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: arr } });
  };
  const removeItem = (section, field, id) => {
    const arr = (monthData[section][field]||[]).filter(i=>i.id!==id);
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: arr } });
  };

  const [procForm, setProcForm] = useState({ name:"", searchVol:0 });
  const [kwForm, setKwForm] = useState({ keyword:"", vol:0, rank:"" });
  const [topForm, setTopForm] = useState({ title:"", views:0, channel:"" });
  const [inflowKwForm, setInflowKwForm] = useState({ keyword:"", pct:0 });

  const [localSearch, setLocalSearch] = useState({ hospital:0, doctor:0 });
  const [localSns, setLocalSns] = useState({ instaFollowers:0, instaLikes:0, instaComments:0, instaSaves:0, reelsViews:0 });
  const [localContent, setLocalContent] = useState({ blogAvgTime:0 });
  const [localTrust, setLocalTrust] = useState({ reviewCount:0, reviewRate:0, avgRating:0, directSearchChange:0, reVisitRate:0 });

  useEffect(() => {
    setLocalSearch({ hospital:monthData.search.hospital||0, doctor:monthData.search.doctor||0 });
    setLocalSns({ instaFollowers:monthData.sns.instaFollowers||0, instaLikes:monthData.sns.instaLikes||0, instaComments:monthData.sns.instaComments||0, instaSaves:monthData.sns.instaSaves||0, reelsViews:monthData.sns.reelsViews||0 });
    setLocalContent({ blogAvgTime:monthData.content.blogAvgTime||0 });
    setLocalTrust({ reviewCount:monthData.trust.reviewCount||0, reviewRate:monthData.trust.reviewRate||0, avgRating:monthData.trust.avgRating||0, directSearchChange:monthData.trust.directSearchChange||0, reVisitRate:monthData.trust.reVisitRate||0 });
  }, [selMonth]);

  // 전달 비교 뱃지
  const Diff = ({ cur, prev, unit="", inverse=false }) => {
    if (!prev || prev===0) return null;
    const d = cur - prev;
    const pct = Math.round(Math.abs(d)/prev*100);
    const up = inverse ? d<0 : d>0;
    if (d===0) return <span style={{color:C.muted,fontSize:9,marginLeft:4}}>→ 유지</span>;
    return (
      <span style={{color:up?C.green:C.red,fontSize:9,marginLeft:4,fontWeight:700}}>
        {d>0?'▲':'▼'}{unit==='%'?Math.abs(d).toFixed(1):fmtN(Math.abs(d))}{unit} ({pct}%)
      </span>
    );
  };

  const NI = ({ label, localKey, localState, setLocalState, section, field, unit="", prevVal }) => (
    <div style={{ background:"#F8FAFC", borderRadius:10, padding:12 }}>
      <label style={{ color:C.muted, fontSize:10, fontWeight:700, display:"block", marginBottom:5 }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <input type="number" value={localState[localKey]??""} disabled={isReadOnly}
          onChange={e => setLocalState(p => ({...p, [localKey]: e.target.value}))}
          onBlur={e => updateField(section, field, e.target.value)}
          style={{ ...inputSt, padding:"5px 8px", fontSize:13, fontWeight:700, width:"100%", textAlign:"right" }} />
        {unit && <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>{unit}</span>}
      </div>
      {prevVal!==undefined && <Diff cur={+(localState[localKey]||0)} prev={prevVal} unit={unit} />}
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
      <div style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Toast msg={savedMsg} />
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {months.map(m => (
            <button key={m} onClick={()=>setSelMonth(m)} style={{
              background: selMonth===m?`${hospital.color}20`:"transparent",
              border:`1px solid ${selMonth===m?hospital.color:C.border}`,
              color: selMonth===m?hospital.color:C.muted,
              borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{m.slice(5)}월</button>
          ))}
        </div>
        {brandingData[prevMonthKey] && (
          <span style={{ color:C.muted, fontSize:11, background:`${C.green}10`, border:`1px solid ${C.green}20`, borderRadius:7, padding:"3px 10px" }}>
            ↕ {prevMonthKey.slice(5)}월 대비 비교 중
          </span>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* 🔍 브랜드 검색량 */}
        <SectionCard title="🔍 브랜드 검색량">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <NI label="병원명 검색량" localKey="hospital" localState={localSearch} setLocalState={setLocalSearch} section="search" field="hospital" unit="회" prevVal={prevData.search.hospital} />
            <NI label="원장명 검색량" localKey="doctor" localState={localSearch} setLocalState={setLocalSearch} section="search" field="doctor" unit="회" prevVal={prevData.search.doctor} />
          </div>
          <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:8 }}>시술 연관 검색량</div>
          {!isReadOnly && (
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              <input value={procForm.name} onChange={e=>setProcForm(p=>({...p,name:e.target.value}))} placeholder="시술명" style={{ ...inputSt, padding:"5px 8px", fontSize:11, flex:2 }} />
              <input type="number" value={procForm.searchVol||""} onChange={e=>setProcForm(p=>({...p,searchVol:+e.target.value}))} placeholder="검색량" style={{ ...inputSt, padding:"5px 8px", fontSize:11, width:80 }} />
              <button onClick={()=>{ if(procForm.name){ addItem("search","procedures",procForm); setProcForm({name:"",searchVol:0}); }}} style={{ background:hospital.color, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
          )}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {(monthData.search.procedures||[]).map((p,i) => {
              const prev = (prevData.search.procedures||[]).find(pp=>pp.name===p.name);
              return (
                <div key={p.id||i} style={{ background:`${hospital.color}10`, border:`1px solid ${hospital.color}30`, borderRadius:7, padding:"4px 10px", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ color:C.text, fontSize:11, fontWeight:600 }}>{p.name}</span>
                  <span style={{ color:hospital.color, fontSize:11, fontWeight:800 }}>{fmtN(p.searchVol)}회</span>
                  {prev && <Diff cur={p.searchVol} prev={prev.searchVol} unit="회" />}
                  {!isReadOnly && <button onClick={()=>removeItem("search","procedures",p.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:11 }}>×</button>}
                </div>
              );
            })}
            {(monthData.search.procedures||[]).length===0 && <span style={{ color:C.muted, fontSize:11 }}>추가해주세요</span>}
          </div>
          <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:8 }}>연관 키워드</div>
          {!isReadOnly && (
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              <input value={kwForm.keyword} onChange={e=>setKwForm(p=>({...p,keyword:e.target.value}))} placeholder="키워드" style={{ ...inputSt, padding:"5px 8px", fontSize:11, flex:2 }} />
              <input type="number" value={kwForm.vol||""} onChange={e=>setKwForm(p=>({...p,vol:+e.target.value}))} placeholder="검색량" style={{ ...inputSt, padding:"5px 8px", fontSize:11, flex:1 }} />
              <input value={kwForm.rank} onChange={e=>setKwForm(p=>({...p,rank:e.target.value}))} placeholder="순위" style={{ ...inputSt, padding:"5px 8px", fontSize:11, width:60 }} />
              <button onClick={()=>{ if(kwForm.keyword){ addItem("search","relatedKeywords",kwForm); setKwForm({keyword:"",vol:0,rank:""}); }}} style={{ background:hospital.color, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {(monthData.search.relatedKeywords||[]).map((kw,i) => {
              const prev = (prevData.search.relatedKeywords||[]).find(p=>p.keyword===kw.keyword);
              return (
                <div key={kw.id||i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", background:"#F8FAFC", borderRadius:7 }}>
                  <span style={{ color:C.text, fontSize:11, flex:1, fontWeight:600 }}>{kw.keyword}</span>
                  <span style={{ color:C.accent, fontSize:11 }}>{fmtN(kw.vol)}회</span>
                  {prev && <Diff cur={kw.vol} prev={prev.vol} unit="회" />}
                  {kw.rank && <span style={{ color:C.green, fontSize:11, fontWeight:700 }}>{kw.rank}</span>}
                  {!isReadOnly && <button onClick={()=>removeItem("search","relatedKeywords",kw.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:11 }}>×</button>}
                </div>
              );
            })}
            {(monthData.search.relatedKeywords||[]).length===0 && <span style={{ color:C.muted, fontSize:11 }}>추가해주세요</span>}
          </div>
        </SectionCard>

        {/* 📱 SNS 반응 */}
        <SectionCard title="📱 SNS 반응">
          <div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:8 }}>📸 인스타그램 (월 평균)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            <NI label="팔로워" localKey="instaFollowers" localState={localSns} setLocalState={setLocalSns} section="sns" field="instaFollowers" unit="명" prevVal={prevData.sns.instaFollowers} />
            <NI label="좋아요 (평균)" localKey="instaLikes" localState={localSns} setLocalState={setLocalSns} section="sns" field="instaLikes" prevVal={prevData.sns.instaLikes} />
            <NI label="댓글 (평균)" localKey="instaComments" localState={localSns} setLocalState={setLocalSns} section="sns" field="instaComments" prevVal={prevData.sns.instaComments} />
            <NI label="저장 (평균)" localKey="instaSaves" localState={localSns} setLocalState={setLocalSns} section="sns" field="instaSaves" prevVal={prevData.sns.instaSaves} />
          </div>
          <div style={{ color:C.muted, fontSize:10, fontWeight:700, marginBottom:8 }}>▶️ 릴스</div>
          <div style={{ marginBottom:14 }}>
            <NI label="릴스 조회수" localKey="reelsViews" localState={localSns} setLocalState={setLocalSns} section="sns" field="reelsViews" unit="회" prevVal={prevData.sns.reelsViews} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[
              { label:"팔로워", cur:monthData.sns.instaFollowers||0, prev:prevData.sns.instaFollowers||0, color:"#E1306C" },
              { label:"평균 좋아요", cur:monthData.sns.instaLikes||0, prev:prevData.sns.instaLikes||0, color:C.accent },
              { label:"릴스 조회", cur:monthData.sns.reelsViews||0, prev:prevData.sns.reelsViews||0, color:"#FF0000" },
            ].map((k,i) => (
              <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}20`, borderRadius:10, padding:"10px", textAlign:"center" }}>
                <div style={{ color:k.color, fontSize:16, fontWeight:900 }}>{fmtN(k.cur)}</div>
                <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{k.label}</div>
                {k.prev>0 && <Diff cur={k.cur} prev={k.prev} />}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 📝 콘텐츠 반응 */}
        <SectionCard title="📝 콘텐츠 반응">
          <div style={{ marginBottom:14 }}>
            <NI label="블로그 평균 체류시간 (초)" localKey="blogAvgTime" localState={localContent} setLocalState={setLocalContent} section="content" field="blogAvgTime" unit="초" prevVal={prevData.content.blogAvgTime} />
          </div>
          <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:8 }}>🏆 인기 콘텐츠</div>
          {!isReadOnly && (
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              <input value={topForm.title} onChange={e=>setTopForm(p=>({...p,title:e.target.value}))} placeholder="콘텐츠 제목" style={{ ...inputSt, padding:"5px 8px", fontSize:11, flex:3, minWidth:100 }} />
              <input value={topForm.channel} onChange={e=>setTopForm(p=>({...p,channel:e.target.value}))} placeholder="채널" style={{ ...inputSt, padding:"5px 8px", fontSize:11, width:70 }} />
              <input type="number" value={topForm.views||""} onChange={e=>setTopForm(p=>({...p,views:+e.target.value}))} placeholder="조회수" style={{ ...inputSt, padding:"5px 8px", fontSize:11, width:70 }} />
              <button onClick={()=>{ if(topForm.title){ addItem("content","topContents",topForm); setTopForm({title:"",views:0,channel:""}); }}} style={{ background:hospital.color, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
            {(monthData.content.topContents||[]).map((tc,i) => (
              <div key={tc.id||i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#F8FAFC", borderRadius:8 }}>
                <span style={{ color:hospital.color, fontWeight:800, fontSize:12 }}>#{i+1}</span>
                {tc.channel && <span style={{ background:`${hospital.color}15`, color:hospital.color, borderRadius:4, padding:"1px 6px", fontSize:10 }}>{tc.channel}</span>}
                <span style={{ color:C.text, fontSize:11, flex:1 }}>{tc.title}</span>
                {tc.views>0 && <span style={{ color:C.accent, fontSize:11, fontWeight:700 }}>{fmtN(tc.views)}회</span>}
                {!isReadOnly && <button onClick={()=>removeItem("content","topContents",tc.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:11 }}>×</button>}
              </div>
            ))}
            {(monthData.content.topContents||[]).length===0 && <span style={{ color:C.muted, fontSize:11 }}>추가해주세요</span>}
          </div>
          <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:8 }}>🔑 유입 키워드</div>
          {!isReadOnly && (
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              <input value={inflowKwForm.keyword} onChange={e=>setInflowKwForm(p=>({...p,keyword:e.target.value}))} placeholder="키워드" style={{ ...inputSt, padding:"5px 8px", fontSize:11, flex:2 }} />
              <div style={{ display:"flex", alignItems:"center", gap:3, flex:1 }}>
                <input type="number" min="0" max="100" step="0.1" value={inflowKwForm.pct||""} onChange={e=>setInflowKwForm(p=>({...p,pct:+e.target.value}))} placeholder="0.0" style={{ ...inputSt, padding:"5px 8px", fontSize:11, width:"100%" }} />
                <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>%</span>
              </div>
              <button onClick={()=>{ if(inflowKwForm.keyword){ addItem("content","inflowKeywords",inflowKwForm); setInflowKwForm({keyword:"",pct:0}); }}} style={{ background:hospital.color, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>+</button>
            </div>
          )}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {(monthData.content.inflowKeywords||[]).map((kw,i) => {
              const prev = (prevData.content.inflowKeywords||[]).find(p=>p.keyword===kw.keyword);
              return (
                <div key={kw.id||i} style={{ background:`${C.accent2}10`, border:`1px solid ${C.accent2}30`, borderRadius:7, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:C.text, fontSize:11 }}>{kw.keyword}</span>
                  {kw.pct!==undefined && <span style={{ color:C.accent2, fontSize:11, fontWeight:700 }}>{kw.pct}%</span>}
                  {prev && kw.pct!==undefined && <Diff cur={kw.pct} prev={prev.pct||0} unit="%" />}
                  {!isReadOnly && <button onClick={()=>removeItem("content","inflowKeywords",kw.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:11 }}>×</button>}
                </div>
              );
            })}
            {(monthData.content.inflowKeywords||[]).length===0 && <span style={{ color:C.muted, fontSize:11 }}>추가해주세요</span>}
          </div>
        </SectionCard>

        {/* ⭐ 브랜드 신뢰도 */}
        <SectionCard title="⭐ 브랜드 신뢰도">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            <NI label="신규 리뷰 수" localKey="reviewCount" localState={localTrust} setLocalState={setLocalTrust} section="trust" field="reviewCount" unit="건" prevVal={prevData.trust.reviewCount} />
            <NI label="리뷰 증가율" localKey="reviewRate" localState={localTrust} setLocalState={setLocalTrust} section="trust" field="reviewRate" unit="%" prevVal={prevData.trust.reviewRate} />
            <NI label="평균 평점" localKey="avgRating" localState={localTrust} setLocalState={setLocalTrust} section="trust" field="avgRating" unit="점" prevVal={prevData.trust.avgRating} />
            <NI label="직접검색 증가율" localKey="directSearchChange" localState={localTrust} setLocalState={setLocalTrust} section="trust" field="directSearchChange" unit="%" prevVal={prevData.trust.directSearchChange} />
            <NI label="재방문 증가율" localKey="reVisitRate" localState={localTrust} setLocalState={setLocalTrust} section="trust" field="reVisitRate" unit="%" prevVal={prevData.trust.reVisitRate} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[
              { label:"리뷰 증가율", cur:monthData.trust.reviewRate||0, prev:prevData.trust.reviewRate||0, unit:"%", color:(monthData.trust.reviewRate||0)>0?C.green:C.muted },
              { label:"평균 평점", cur:monthData.trust.avgRating||0, prev:prevData.trust.avgRating||0, unit:"점", color:(monthData.trust.avgRating||0)>=4?C.green:(monthData.trust.avgRating||0)>=3?C.yellow:C.muted },
              { label:"직접검색", cur:monthData.trust.directSearchChange||0, prev:prevData.trust.directSearchChange||0, unit:"%", color:(monthData.trust.directSearchChange||0)>=0?C.green:C.red },
            ].map((k,i) => (
              <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}20`, borderRadius:10, padding:"10px", textAlign:"center" }}>
                <div style={{ color:k.color, fontSize:18, fontWeight:900 }}>{k.cur}{k.unit}</div>
                <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{k.label}</div>
                {k.prev>0 && <Diff cur={k.cur} prev={k.prev} unit={k.unit} />}
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

// ─── 리뷰 관리 (네이버/구글 리뷰, 증가 추이) — 기존 crmData.review 재활용
function ReviewManageTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, updateField } = useCrmMonth(hospital, onUpdateHospital);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>⭐ 리뷰 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          <CrmNumInput label="후기 작성률 (%)" section="review" field="writeRate" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="네이버 리뷰" section="review" field="naverCount" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="구글 리뷰" section="review" field="googleCount" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="카카오 리뷰" section="review" field="kakaoCount" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="블로그 후기" section="review" field="blogCount" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="후기 유입 영향도 (%)" section="review" field="inflowImpact" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
          {[
            { label:"작성률", val:monthData.review.writeRate||0, unit:"%", color:C.green },
            { label:"네이버", val:fmtN(monthData.review.naverCount), unit:"건", color:"#03C75A" },
            { label:"구글", val:fmtN(monthData.review.googleCount), unit:"건", color:"#EA4335" },
            { label:"카카오", val:fmtN(monthData.review.kakaoCount), unit:"건", color:"#FEE500" },
            { label:"유입 영향도", val:monthData.review.inflowImpact||0, unit:"%", color:C.accent2 },
          ].map((k,i) => (
            <div key={i} style={{ background:`${k.color}10`, border:`1px solid ${k.color}30`, borderRadius:12, padding:14, textAlign:"center" }}>
              <div style={{ color:k.color, fontSize:20, fontWeight:900 }}>{k.val}<span style={{ fontSize:11, fontWeight:400 }}>{k.unit}</span></div>
              <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:10 }}>📈 리뷰 증가 추이</div>
        <div style={{ color:C.muted, fontSize:12 }}>월별 리뷰 입력을 누적하면 다음 업데이트에서 추이 그래프를 추가해드릴게요.</div>
      </div>
    </div>
  );
}

// ─── 온라인 자산 (홈페이지/SNS/유튜브/블로그/언론기사) — 신규, 빈 입력 폼
function OnlineAssetTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };
  const months = [...Array(6)].map((_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });
  const assetData = hospital.onlineAssetData || {};
  const EMPTY = { homepage:{ visitors:0, pageviews:0 }, sns:{ followers:0, posts:0 }, youtube:{ subscribers:0, views:0 }, blog:{ posts:0, visitors:0 }, press:{ count:0, items:[] } };
  const monthData = { ...EMPTY, ...assetData[selMonth] };
  const saveMonth = (updated) => {
    onUpdateHospital({ ...hospital, onlineAssetData: { ...assetData, [selMonth]: updated } });
    toast("저장 완료!");
  };
  const updateField = (section, field, val) => {
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: isNaN(+val)?val:+val } });
  };
  const [pressForm, setPressForm] = useState({ title:"", url:"" });
  const addPress = () => {
    if (!pressForm.title) return;
    const items = [...(monthData.press.items||[]), { id:Date.now(), ...pressForm }];
    saveMonth({ ...monthData, press: { ...monthData.press, items, count: items.length } });
    setPressForm({ title:"", url:"" });
  };
  const removePress = (id) => {
    const items = (monthData.press.items||[]).filter(i=>i.id!==id);
    saveMonth({ ...monthData, press: { ...monthData.press, items, count: items.length } });
  };
  const Card = ({ title, children }) => (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
      <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="🌐 홈페이지">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <CrmNumInput label="방문자 수" section="homepage" field="visitors" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
            <CrmNumInput label="페이지뷰" section="homepage" field="pageviews" unit="회" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          </div>
        </Card>
        <Card title="📱 SNS">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <CrmNumInput label="팔로워 수" section="sns" field="followers" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
            <CrmNumInput label="게시물 수" section="sns" field="posts" unit="개" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          </div>
        </Card>
        <Card title="▶️ 유튜브">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <CrmNumInput label="구독자 수" section="youtube" field="subscribers" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
            <CrmNumInput label="조회수" section="youtube" field="views" unit="회" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          </div>
        </Card>
        <Card title="✍️ 블로그">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <CrmNumInput label="게시물 수" section="blog" field="posts" unit="개" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
            <CrmNumInput label="방문자 수" section="blog" field="visitors" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          </div>
        </Card>
      </div>
      <Card title="📰 언론기사">
        {!isReadOnly && (
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input value={pressForm.title} onChange={e=>setPressForm(p=>({...p,title:e.target.value}))} placeholder="기사 제목" style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:2 }} />
            <input value={pressForm.url} onChange={e=>setPressForm(p=>({...p,url:e.target.value}))} placeholder="URL" style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:2 }} />
            <button onClick={addPress} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>추가</button>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {(monthData.press.items||[]).length === 0 && <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:12 }}>등록된 언론기사가 없어요</div>}
          {(monthData.press.items||[]).map(item => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#F8FAFC", border:`1px solid ${C.dim}`, borderRadius:9 }}>
              <span style={{ color:C.text, fontSize:12, flex:1 }}>{item.title}</span>
              {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ color:C.accent, fontSize:11 }}>링크</a>}
              {!isReadOnly && <button onClick={()=>removePress(item.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>×</button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


const CRM_EMPTY_MONTH = {
  consult: { totalCalls:0, connected:0, missed:0, avgResponseSec:0, convertRate:0 },
  reservation: { total:0, noShow:0, sameCancel:0, reBook:0 },
  retention: { reVisit:0, cycleKeep:0, vipRatio:0, longTermRatio:0, newCount:0, returnCount:0, dormantCount:0 },
  review: { writeRate:0, naverCount:0, kakaoCount:0, googleCount:0, blogCount:0, inflowImpact:0 },
  ops: { issues:[], complaints:[], sopItems:[], satisfaction:0 },
};
function useCrmMonth(hospital, onUpdateHospital) {
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };
  const months = [...Array(6)].map((_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });
  const crmData = hospital.crmData || {};
  const rawMonth = crmData[selMonth] || {};
  // 섹션 단위 깊은 병합: 저장된 값이 일부 필드만 가진 부분 객체여도 누락 필드가 undefined로 남지 않도록 보강
  const monthData = {
    consult: { ...CRM_EMPTY_MONTH.consult, ...rawMonth.consult },
    reservation: { ...CRM_EMPTY_MONTH.reservation, ...rawMonth.reservation },
    retention: { ...CRM_EMPTY_MONTH.retention, ...rawMonth.retention },
    review: { ...CRM_EMPTY_MONTH.review, ...rawMonth.review },
    ops: { ...CRM_EMPTY_MONTH.ops, ...rawMonth.ops },
  };
  const saveMonth = (updated) => {
    onUpdateHospital({ ...hospital, crmData: { ...crmData, [selMonth]: updated } });
    toast("저장 완료!");
  };
  const updateField = (section, field, val) => {
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: isNaN(+val)?val:+val } });
  };
  return { selMonth, setSelMonth, months, savedMsg, monthData, saveMonth, updateField };
}
const fmtN = (n) => (n||0).toLocaleString();
const pctCalc = (a,b) => b>0 ? Math.round(a/b*100) : 0;
const CrmNumCard = ({ label, value, unit="", color, sub="" }) => (
  <div style={{ background:"#F8FAFC", borderRadius:12, padding:14, textAlign:"center", border:`1px solid ${C.border}` }}>
    <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:6 }}>{label}</div>
    <div style={{ color:color||C.text, fontSize:22, fontWeight:900 }}>{value}<span style={{ fontSize:12, fontWeight:400, marginLeft:2, color:C.muted }}>{unit}</span></div>
    {sub && <div style={{ color:C.muted, fontSize:10, marginTop:3 }}>{sub}</div>}
  </div>
);
function CrmNumInput({ label, section, field, unit="", monthData, updateField, isReadOnly }) {
  const savedVal = monthData[section][field];
  const [localVal, setLocalVal] = useState(savedVal??"");
  useEffect(() => { setLocalVal(savedVal??""); }, [savedVal, section, field]);
  return (
    <div style={{ background:"#F8FAFC", borderRadius:10, padding:12 }}>
      <label style={{ color:C.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <input type="number" value={localVal} disabled={isReadOnly}
          onChange={e=>setLocalVal(e.target.value)}
          onBlur={e=>{ if(e.target.value !== String(savedVal??"")) updateField(section,field,e.target.value); }}
          style={{ ...inputSt, padding:"5px 8px", fontSize:14, fontWeight:700, width:90, textAlign:"right" }} />
        {unit && <span style={{ color:C.muted, fontSize:12 }}>{unit}</span>}
      </div>
    </div>
  );
}
const CrmMonthSelector = ({ months, selMonth, setSelMonth, hospital }) => (
  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
    {months.map(m => (
      <button key={m} onClick={()=>setSelMonth(m)} style={{
        background: selMonth===m?`${hospital.color}20`:"transparent",
        border:`1px solid ${selMonth===m?hospital.color:C.border}`,
        color: selMonth===m?hospital.color:C.muted,
        borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
      }}>{m.slice(5)}월</button>
    ))}
  </div>
);

// ─── CRM 관리 (문의/예약/내원 현황) ────────────────────────────
function CrmManageTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, updateField } = useCrmMonth(hospital, onUpdateHospital);
  const noShowRate  = pctCalc(monthData.reservation.noShow||0, monthData.reservation.total||0);
  const cancelRate  = pctCalc(monthData.reservation.sameCancel||0, monthData.reservation.total||0);
  const reBookRate  = pctCalc(monthData.reservation.reBook||0, monthData.reservation.total||0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>📞 문의 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <CrmNumCard label="총 문의(인입)" value={fmtN(monthData.consult.totalCalls)} unit="건" color={C.accent} />
          <CrmNumCard label="연결 건수" value={fmtN(monthData.consult.connected)} unit="건" color={C.green} />
          <CrmNumCard label="부재중 건수" value={fmtN(monthData.consult.missed)} unit="건" color={C.red} />
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>📅 예약 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
          <CrmNumInput label="총 예약 수" section="reservation" field="total" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="예약 후 미내원 수" section="reservation" field="noShow" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="당일 취소 수" section="reservation" field="sameCancel" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="재예약 수" section="reservation" field="reBook" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          <CrmNumCard label="총 예약" value={fmtN(monthData.reservation.total)} unit="건" color={C.accent} />
          <CrmNumCard label="노쇼율" value={noShowRate} unit="%" color={noShowRate<=10?C.green:noShowRate<=20?C.yellow:C.red} sub={`${fmtN(monthData.reservation.noShow)}건`} />
          <CrmNumCard label="당일 취소율" value={cancelRate} unit="%" color={cancelRate<=10?C.green:cancelRate<=20?C.yellow:C.red} sub={`${fmtN(monthData.reservation.sameCancel)}건`} />
          <CrmNumCard label="재예약률" value={reBookRate} unit="%" color={reBookRate>=30?C.green:C.yellow} sub={`${fmtN(monthData.reservation.reBook)}건`} />
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>🚶 내원 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <CrmNumCard label="예약 대비 내원율" value={100-noShowRate} unit="%" color={(100-noShowRate)>=80?C.green:C.yellow} sub="예약-노쇼 기준" />
          <CrmNumCard label="총 내원" value={fmtN((monthData.reservation.total||0)-(monthData.reservation.noShow||0))} unit="건" color={C.accent2} />
          <CrmNumCard label="재예약률" value={reBookRate} unit="%" color={reBookRate>=30?C.green:C.yellow} />
        </div>
      </div>
    </div>
  );
}

// ─── 상담 관리 (상담성공률/유입별전환율) ────────────────────────
function ConsultManageTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, updateField } = useCrmMonth(hospital, onUpdateHospital);
  const connectRate = pctCalc(monthData.consult.connected||0, monthData.consult.totalCalls||0);
  const missedRate  = pctCalc(monthData.consult.missed||0,    monthData.consult.totalCalls||0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>📞 상담 운영 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          <CrmNumInput label="총 인입 건수" section="consult" field="totalCalls" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="연결 건수" section="consult" field="connected" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="부재중 건수" section="consult" field="missed" unit="건" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="평균 응답 시간 (초)" section="consult" field="avgResponseSec" unit="초" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="상담 전환율 (%)" section="consult" field="convertRate" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
        </div>
        <div style={{ color:C.text, fontWeight:700, fontSize:13, margin:"4px 0 10px" }}>📊 상담 성공률</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          <CrmNumCard label="총 인입" value={fmtN(monthData.consult.totalCalls)} unit="건" color={C.accent} />
          <CrmNumCard label="상담 연결률" value={connectRate} unit="%" color={connectRate>=80?C.green:connectRate>=60?C.yellow:C.red} sub={`연결 ${fmtN(monthData.consult.connected)}건`} />
          <CrmNumCard label="부재중 비율" value={missedRate} unit="%" color={missedRate<=20?C.green:missedRate<=40?C.yellow:C.red} sub={`부재 ${fmtN(monthData.consult.missed)}건`} />
          <CrmNumCard label="상담 전환율" value={monthData.consult.convertRate||0} unit="%" color={(monthData.consult.convertRate||0)>=30?C.green:C.yellow} />
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:10 }}>👥 유입별 전환율</div>
        <div style={{ color:C.muted, fontSize:12 }}>채널별 상담 전환율은 마케팅 &gt; 환자 유입 탭의 채널별 데이터와 함께 확인해보세요.</div>
      </div>
    </div>
  );
}

// ─── 환자 관리 (신규/재진/휴면) ─────────────────────────────────
function PatientManageTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, updateField } = useCrmMonth(hospital, onUpdateHospital);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>🧑‍⚕️ 환자 구성 현황</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          <CrmNumInput label="신규 환자 수" section="retention" field="newCount" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="재진 환자 수" section="retention" field="returnCount" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="휴면 환자 수" section="retention" field="dormantCount" unit="명" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <CrmNumCard label="신규" value={fmtN(monthData.retention.newCount)} unit="명" color={C.accent} />
          <CrmNumCard label="재진" value={fmtN(monthData.retention.returnCount)} unit="명" color={C.green} />
          <CrmNumCard label="휴면" value={fmtN(monthData.retention.dormantCount)} unit="명" color={C.muted} />
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>🔄 환자 유지율</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
          <CrmNumInput label="재내원률 (%)" section="retention" field="reVisit" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="시술 주기 유지율 (%)" section="retention" field="cycleKeep" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="VIP 환자 비율 (%)" section="retention" field="vipRatio" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumInput label="장기 환자 비율 (%)" section="retention" field="longTermRatio" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"재내원률", val:monthData.retention.reVisit||0, good:50 },
            { label:"주기 유지율", val:monthData.retention.cycleKeep||0, good:60 },
            { label:"VIP 비율", val:monthData.retention.vipRatio||0, good:20 },
            { label:"장기 환자", val:monthData.retention.longTermRatio||0, good:30 },
          ].map((k,i) => (
            <CrmNumCard key={i} label={k.label} value={k.val} unit="%" color={k.val>=k.good?C.green:k.val>=k.good*0.7?C.yellow:C.muted} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CS 관리 (VOC/불만접수/만족도) ──────────────────────────────
function CsManageTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, updateField, saveMonth } = useCrmMonth(hospital, onUpdateHospital);
  const [issueForm, setIssueForm] = useState({ text:"", severity:"보통" });
  const addOpsItem = (field, item) => {
    const arr = [...(monthData.ops[field]||[]), { id:Date.now(), ...item }];
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  const toggleOpsItem = (field, id) => {
    const arr = (monthData.ops[field]||[]).map(i => i.id===id ? {...i, done:!i.done} : i);
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  const removeOpsItem = (field, id) => {
    const arr = (monthData.ops[field]||[]).filter(i=>i.id!==id);
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>😊 만족도</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <CrmNumInput label="고객 만족도 (%)" section="ops" field="satisfaction" unit="%" monthData={monthData} updateField={updateField} isReadOnly={isReadOnly} />
          <CrmNumCard label="만족도" value={monthData.ops.satisfaction||0} unit="%" color={(monthData.ops.satisfaction||0)>=80?C.green:C.yellow} />
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>🚨 VOC / 불만 접수</div>
        </div>
        {!isReadOnly && (
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input value={issueForm.text} onChange={e=>setIssueForm(p=>({...p,text:e.target.value}))} placeholder="이슈 내용" style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:3 }} />
            <select value={issueForm.severity} onChange={e=>setIssueForm(p=>({...p,severity:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:1, appearance:"none" }}>
              {["낮음","보통","높음","긴급"].map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>{ if(issueForm.text){ addOpsItem("issues",{...issueForm,done:false}); setIssueForm({text:"",severity:"보통"}); }}} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>추가</button>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {(monthData.ops.issues||[]).length === 0 && <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:12 }}>등록된 이슈가 없어요 👍</div>}
          {(monthData.ops.issues||[]).map((issue,i) => {
            const sevColor = issue.severity==="긴급"?C.red:issue.severity==="높음"?C.orange:issue.severity==="보통"?C.yellow:C.green;
            return (
              <div key={issue.id||i} onClick={()=>!isReadOnly&&toggleOpsItem("issues",issue.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:issue.done?`${C.green}08`:"#FFF8F8", border:`1px solid ${issue.done?C.green:sevColor}30`, borderRadius:10, cursor:"pointer" }}>
                <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, background:issue.done?C.green:"transparent", border:`2px solid ${issue.done?C.green:sevColor}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {issue.done && <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>}
                </div>
                <span style={{ background:`${sevColor}15`, color:sevColor, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{issue.severity}</span>
                <span style={{ color:issue.done?C.muted:C.text, fontSize:12, textDecoration:issue.done?"line-through":"none", flex:1 }}>{issue.text}</span>
                {!isReadOnly && <button onClick={e=>{e.stopPropagation();removeOpsItem("issues",issue.id);}} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>×</button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SOP 관리 (매뉴얼/교육/점검) ────────────────────────────────
function SopTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const { selMonth, setSelMonth, months, savedMsg, monthData, saveMonth } = useCrmMonth(hospital, onUpdateHospital);
  const [sopForm, setSopForm] = useState({ text:"", category:"매뉴얼" });
  const addOpsItem = (field, item) => {
    const arr = [...(monthData.ops[field]||[]), { id:Date.now(), ...item }];
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  const toggleOpsItem = (field, id) => {
    const arr = (monthData.ops[field]||[]).map(i => i.id===id ? {...i, done:!i.done} : i);
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  const removeOpsItem = (field, id) => {
    const arr = (monthData.ops[field]||[]).filter(i=>i.id!==id);
    saveMonth({ ...monthData, ops: { ...monthData.ops, [field]: arr } });
  };
  const sopItems = monthData.ops.sopItems||[];
  const SOP_CATS = ["매뉴얼","교육","점검"];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />
      <CrmMonthSelector months={months} selMonth={selMonth} setSelMonth={setSelMonth} hospital={hospital} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {SOP_CATS.map(cat => {
          const items = sopItems.filter(s=>(s.category||"매뉴얼")===cat);
          const done = items.filter(s=>s.done).length;
          return (
            <CrmNumCard key={cat} label={cat+" 현황"} value={`${done}/${items.length}`} unit="완료" color={items.length>0 && done===items.length?C.green:C.accent} />
          );
        })}
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>📋 SOP 체크 현황</div>
          {sopItems.length > 0 && (
            <span style={{ color:C.green, fontSize:12, fontWeight:700 }}>
              {sopItems.filter(s=>s.done).length}/{sopItems.length} 완료
            </span>
          )}
        </div>
        {!isReadOnly && (
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <select value={sopForm.category} onChange={e=>setSopForm(p=>({...p,category:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, width:100, appearance:"none" }}>
              {SOP_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <input value={sopForm.text} onChange={e=>setSopForm(p=>({...p,text:e.target.value}))} placeholder="SOP 항목 입력" style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:1 }}
              onKeyDown={e=>{ if(e.key==="Enter" && sopForm.text){ addOpsItem("sopItems",{...sopForm,done:false}); setSopForm({text:"",category:sopForm.category}); }}} />
            <button onClick={()=>{ if(sopForm.text){ addOpsItem("sopItems",{...sopForm,done:false}); setSopForm({text:"",category:sopForm.category}); }}} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>추가</button>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {sopItems.length === 0 && <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:12 }}>SOP 항목을 추가해주세요</div>}
          {sopItems.map((sop,i) => (
            <div key={sop.id||i} onClick={()=>!isReadOnly&&toggleOpsItem("sopItems",sop.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:sop.done?`${C.green}08`:"#F8FAFC", border:`1px solid ${sop.done?C.green:C.dim}`, borderRadius:9, cursor:"pointer" }}>
              <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, background:sop.done?C.green:"transparent", border:`2px solid ${sop.done?C.green:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {sop.done && <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>}
              </div>
              <span style={{ background:`${C.accent}12`, color:C.accent, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700, flexShrink:0 }}>{sop.category||"매뉴얼"}</span>
              <span style={{ color:sop.done?C.muted:C.text, fontSize:12, textDecoration:sop.done?"line-through":"none", flex:1 }}>{sop.text}</span>
              {!isReadOnly && <button onClick={e=>{e.stopPropagation();removeOpsItem("sopItems",sop.id);}} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>×</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 경영 지표 (매출/객단가/시술별매출/성장률) ───────────────────
function BizTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const hData = hospital.monthlyData || [];
  const availMonths = [...new Set(hData.map(d => d.month).filter(Boolean))].sort().reverse();
  const [selMonth, setSelMonth] = useState(availMonths[0] || "");
  useEffect(()=>{ if(!selMonth && availMonths.length) setSelMonth(availMonths[0]); }, [availMonths.length]);
  const last = hData.find(d => d.month === selMonth) || {};
  const lastIdx = hData.findIndex(d => d.month === selMonth);
  const prev = lastIdx > 0 ? hData[lastIdx-1] : null;
  const arpu = last.payment ? Math.round((last.revenue||0) / last.payment) : 0;
  const growth = prev && prev.revenue > 0 ? Math.round(((last.revenue||0)-prev.revenue)/prev.revenue*100) : null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {availMonths.length === 0 ? (
        <div style={{ background:`${C.yellow}10`, border:`1px solid ${C.yellow}30`, borderRadius:14, padding:20, color:C.muted, fontSize:13 }}>
          통합 요약 탭에서 월간 매출 데이터를 먼저 입력하면 여기에 경영 지표가 표시돼요.
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {availMonths.map(m => (
              <button key={m} onClick={()=>setSelMonth(m)} style={{
                background: selMonth===m?`${hospital.color}20`:"transparent",
                border:`1px solid ${selMonth===m?hospital.color:C.border}`,
                color: selMonth===m?hospital.color:C.muted,
                borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>{m}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            <CrmNumCard label="매출" value={fmtN(last.revenue)} unit="만원" color={C.accent} />
            <CrmNumCard label="객단가" value={fmtN(arpu)} unit="만원" color={C.accent2} />
            <CrmNumCard label="결제 건수" value={fmtN(last.payment)} unit="건" color={C.green} />
            <CrmNumCard label="전월 대비 성장률" value={growth===null?"-":growth} unit={growth===null?"":"%"} color={growth>0?C.green:growth<0?C.red:C.muted} />
          </div>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:10 }}>💉 시술별 매출</div>
            <div style={{ color:C.muted, fontSize:12 }}>시술별 매출 데이터는 아직 별도 입력 항목이 없어요. 필요하면 알려주시면 추가해드릴게요.</div>
          </div>
        </>
      )}
    </div>
  );
}

function AiSearchTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  const AI_PLATFORMS = [
    { key:"chatgpt",    label:"ChatGPT",        color:"#10A37F", icon:"🤖" },
    { key:"googleAi",   label:"Google AI",      color:"#4285F4", icon:"🔍" },
    { key:"perplexity", label:"Perplexity",     color:"#6366F1", icon:"🟣" },
    { key:"naverAi",    label:"네이버 AI",       color:"#03C75A", icon:"🟢" },
  ];

  const aiData = hospital.aiData || {};

  // 최근 6개월 목록
  const months6 = [...Array(6)].map((_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); }).reverse();

  const getExposure = (month, key) => aiData[month]?.exposure?.[key] || false;
  const getNote = (month, key) => aiData[month]?.notes?.[key] || "";

  const toggleExposure = (month, key) => {
    if (isReadOnly) return;
    const cur = aiData[month] || {};
    const updated = { ...cur, exposure: { ...cur.exposure, [key]: !getExposure(month, key) } };
    onUpdateHospital({ ...hospital, aiData: { ...aiData, [month]: updated } });
    toast("저장 완료!");
  };

  const updateNote = (month, key, val) => {
    if (isReadOnly) return;
    const cur = aiData[month] || {};
    const updated = { ...cur, notes: { ...cur.notes, [key]: val } };
    onUpdateHospital({ ...hospital, aiData: { ...aiData, [month]: updated } });
  };

  const Cell = ({ on, onClick, color="#0EA5E9" }) => (
    <td onClick={onClick} style={{ padding:"10px 12px", textAlign:"center", cursor:isReadOnly?"default":"pointer", borderBottom:`1px solid ${C.dim}` }}>
      <div style={{
        width:28, height:28, borderRadius:8, margin:"0 auto",
        background: on?color:`${color}15`,
        border: `2px solid ${on?color:`${color}40`}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.15s",
      }}>
        <span style={{ fontSize:14 }}>{on?"✓":"·"}</span>
      </div>
    </td>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Toast msg={savedMsg} />

      {/* 안내 */}
      <div style={{ background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.muted }}>
        💡 각 플랫폼에서 병원명/원장명으로 직접 검색 후 AI 답변에 언급 여부를 월별로 체크해주세요
      </div>

      {/* AI 검색 노출 추이 표 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:16 }}>🤖 AI 검색 플랫폼별 월별 노출 현황</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"#F1F5F9" }}>
                <th style={{ padding:"10px 12px", textAlign:"left", borderBottom:`2px solid ${C.border}`, color:C.muted, fontWeight:700, minWidth:100 }}>플랫폼</th>
                {months6.map(m => (
                  <th key={m} style={{ padding:"10px 12px", textAlign:"center", borderBottom:`2px solid ${C.border}`, color:C.muted, fontWeight:700, minWidth:70 }}>{m.slice(5)}월</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AI_PLATFORMS.map(p => (
                <tr key={p.key}>
                  <td style={{ padding:"10px 12px", borderBottom:`1px solid ${C.dim}`, fontWeight:700 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span>{p.icon}</span>
                      <span style={{ color:p.color }}>{p.label}</span>
                    </div>
                  </td>
                  {months6.map(m => (
                    <Cell key={m} on={getExposure(m, p.key)} onClick={()=>toggleExposure(m, p.key)} color={p.color} />
                  ))}
                </tr>
              ))}
              {/* 합계 행 */}
              <tr style={{ background:"#F1F5F9" }}>
                <td style={{ padding:"8px 12px", color:C.muted, fontSize:11, fontWeight:700 }}>노출 수</td>
                {months6.map(m => {
                  const cnt = AI_PLATFORMS.filter(p=>getExposure(m,p.key)).length;
                  return (
                    <td key={m} style={{ padding:"8px 12px", textAlign:"center", fontSize:13, fontWeight:800, color:cnt>=3?C.green:cnt>=1?C.yellow:C.muted }}>
                      {cnt}/4
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI 질문/답변 모니터링 (플랫폼별 노출 메모 통합) */}
      <AiQaSection hospital={hospital} isReadOnly={isReadOnly} onUpdateHospital={onUpdateHospital} AI_PLATFORMS={AI_PLATFORMS} toast={toast} aiData={aiData} months6={months6} />
    </div>
  );
}

// ─── 간단한 word 단위 diff (외부 라이브러리 없이 LCS 기반) ───────
function wordDiff(oldText, newText) {
  const oldWords = (oldText||"").split(/(\s+)/).filter(w=>w!=="");
  const newWords = (newText||"").split(/(\s+)/).filter(w=>w!=="");
  const m = oldWords.length, n = newWords.length;
  const dp = Array.from({length:m+1}, ()=>new Array(n+1).fill(0));
  for (let i=m-1;i>=0;i--) {
    for (let j=n-1;j>=0;j--) {
      dp[i][j] = oldWords[i]===newWords[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
    }
  }
  const result = [];
  let i=0, j=0;
  while (i<m && j<n) {
    if (oldWords[i]===newWords[j]) { result.push({type:"same", text:newWords[j]}); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]) { result.push({type:"del", text:oldWords[i]}); i++; }
    else { result.push({type:"add", text:newWords[j]}); j++; }
  }
  while (i<m) { result.push({type:"del", text:oldWords[i]}); i++; }
  while (j<n) { result.push({type:"add", text:newWords[j]}); j++; }
  return result;
}

const DiffView = ({ oldText, newText }) => {
  const parts = wordDiff(oldText, newText);
  const hasChange = parts.some(p=>p.type!=="same");
  if (!hasChange) return <span style={{ color:C.muted, fontSize:12 }}>이전 답변과 동일해요</span>;
  return (
    <div style={{ fontSize:12, lineHeight:1.8 }}>
      {parts.map((p,i) => {
        if (p.type==="del") return null; // 삭제된 텍스트는 표시하지 않음
        if (p.type==="add") return <span key={i} style={{ background:`${C.green}30`, color:"#15803d", fontWeight:700, borderRadius:3, padding:"0 2px" }}>{p.text}</span>;
        return <span key={i} style={{ color:C.text }}>{p.text}</span>;
      })}
    </div>
  );
};

// ─── AI 질문/답변 모니터링 섹션 ──────────────────────────────────
function AiQaSection({ hospital, isReadOnly, onUpdateHospital, AI_PLATFORMS, toast, aiData, months6 }) {
  const qaData = hospital.aiQaData || { questions: [], answers: {}, records: {} };
  const questions = qaData.questions || [];
  const records   = qaData.records  || {};

  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState({ platform:"chatgpt", question:"" });
  const [expandedQ, setExpandedQ] = useState(null);

  const saveQaData = (updated) => {
    onUpdateHospital({ ...hospital, aiQaData: updated });
    toast("저장 완료!");
  };

  const migratingRef = useRef(false);
  useEffect(() => {
    if (migratingRef.current || isReadOnly || !aiData) return;
    const migratedPlatforms = qaData.migratedPlatforms || [];
    const toMigrate = AI_PLATFORMS.filter(p => !migratedPlatforms.includes(p.key));
    if (toMigrate.length === 0) return;
    migratingRef.current = true;
    const newQuestions = toMigrate.map(p => ({ id: Date.now()+Math.random(), platform:p.key, question:`${p.label} - 병원명/원장명 검색 결과`, isDefault:true }));
    const newRecords = { ...records };
    const oldAnswers = qaData.answers || {};
    newQuestions.forEach(q => {
      const recs = [];
      months6.forEach(m => {
        const note = aiData[m]?.notes?.[q.platform];
        if (note && note.trim()) recs.push({ id: Date.now()+Math.random(), date: m+"-01", text: note });
      });
      Object.entries(oldAnswers[q.id]||{}).forEach(([month, text]) => {
        if (text && text.trim()) recs.push({ id: Date.now()+Math.random(), date: month+"-01", text });
      });
      if (recs.length > 0) newRecords[q.id] = recs.sort((a,b)=>a.date.localeCompare(b.date));
    });
    saveQaData({
      ...qaData,
      questions: [...questions, ...newQuestions],
      records: newRecords,
      migratedPlatforms: [...migratedPlatforms, ...toMigrate.map(p=>p.key)],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addQuestion = () => {
    if (!newQ.question.trim()) return;
    const q = { id: Date.now(), platform: newQ.platform, question: newQ.question.trim() };
    saveQaData({ ...qaData, questions: [...questions, q] });
    setNewQ({ platform:newQ.platform, question:"" });
    setShowAddQ(false);
  };

  const removeQuestion = (id) => {
    const nextRecords = { ...records };
    delete nextRecords[id];
    saveQaData({ ...qaData, questions: questions.filter(q=>q.id!==id), records: nextRecords });
  };

  const addRecord = (qId, date, text) => {
    const qRecs = [...(records[qId]||[]), { id: Date.now(), date, text }]
      .sort((a,b) => a.date.localeCompare(b.date));
    saveQaData({ ...qaData, records: { ...records, [qId]: qRecs } });
  };

  const updateRecord = (qId, recId, text) => {
    const qRecs = (records[qId]||[]).map(r => r.id===recId ? {...r, text} : r);
    saveQaData({ ...qaData, records: { ...records, [qId]: qRecs } });
  };

  const removeRecord = (qId, recId) => {
    const qRecs = (records[qId]||[]).filter(r => r.id!==recId);
    saveQaData({ ...qaData, records: { ...records, [qId]: qRecs } });
  };

  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>💬 AI 질문 / 답변 모니터링</div>
      </div>

      {!isReadOnly && (
        <div style={{ marginBottom:16 }}>
          {!showAddQ ? (
            <button onClick={()=>setShowAddQ(true)} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"7px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>+ 새 질문 등록</button>
          ) : (
            <div style={{ background:"#F8FAFC", borderRadius:12, padding:14, display:"flex", gap:8, flexWrap:"wrap" }}>
              <select value={newQ.platform} onChange={e=>setNewQ(p=>({...p,platform:e.target.value}))} style={{ ...inputSt, padding:"6px 10px", fontSize:12, width:130, appearance:"none" }}>
                {AI_PLATFORMS.map(p=><option key={p.key} value={p.key}>{p.icon} {p.label}</option>)}
              </select>
              <input value={newQ.question} onChange={e=>setNewQ(p=>({...p,question:e.target.value}))}
                onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addQuestion(); } }}
                autoFocus placeholder="예: 광주 피부과 추천해줘" style={{ ...inputSt, padding:"6px 10px", fontSize:12, flex:1, minWidth:200 }} />
              <button onClick={addQuestion} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>등록</button>
              <button onClick={()=>setShowAddQ(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>취소</button>
            </div>
          )}
        </div>
      )}

      {questions.length === 0 && (
        <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:20 }}>등록된 질문이 없어요. 모니터링할 질문을 추가해주세요.</div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {questions.map(q => {
          const platformInfo = AI_PLATFORMS.find(p=>p.key===q.platform) || AI_PLATFORMS[0];
          const qRecs = (records[q.id]||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
          const isOpen = expandedQ === q.id;
          return (
            <AiQaCard key={q.id} q={q} platformInfo={platformInfo} qRecs={qRecs}
              isOpen={isOpen} isReadOnly={isReadOnly} hospital={hospital}
              onToggleOpen={()=>setExpandedQ(isOpen?null:q.id)}
              onRemove={()=>removeQuestion(q.id)}
              onAddRecord={(date,text)=>addRecord(q.id,date,text)}
              onUpdateRecord={(recId,text)=>updateRecord(q.id,recId,text)}
              onRemoveRecord={(recId)=>removeRecord(q.id,recId)} />
          );
        })}
      </div>
    </div>
  );
}

// [[텍스트]] 마크업을 초록 하이라이트로 렌더링
const MarkupText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const inner = part.slice(2, -2);
          return <mark key={i} style={{ background:"#bbf7d0", color:"#15803d", fontWeight:700, borderRadius:3, padding:"0 2px" }}>{inner}</mark>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

function AiQaCard({ q, platformInfo, qRecs, isOpen, isReadOnly, hospital, onToggleOpen, onRemove, onAddRecord, onUpdateRecord, onRemoveRecord }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddRec, setShowAddRec] = useState(false);
  const [newRec, setNewRec] = useState({ date: new Date().toISOString().slice(0,10), text:"" });
  const [editRecId, setEditRecId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => { setConfirmDelete(false); setShowAddRec(false); setEditRecId(null); }, [isOpen]);

  const latest = qRecs[0] || null;
  const prev   = qRecs[1] || null;

  const handleAddRec = () => {
    if (!newRec.text.trim()) return;
    onAddRecord(newRec.date, newRec.text.trim());
    setNewRec({ date: new Date().toISOString().slice(0,10), text:"" });
    setShowAddRec(false);
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d+"T00:00:00");
    return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,"0")}.${String(dt.getDate()).padStart(2,"0")}`;
  };

  // [[텍스트]] 포함 여부로 "하이라이트 있음" 표시
  const hasMarkup = latest && /\[\[.*?\]\]/.test(latest.text);

  return (
    <div style={{ border:`1px solid ${isOpen?`${hospital.color}40`:C.dim}`, borderRadius:14, overflow:"hidden" }}>
      {/* 헤더 */}
      <div onClick={onToggleOpen} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", background:isOpen?`${hospital.color}08`:"#F8FAFC", cursor:"pointer" }}>
        <span style={{ background:`${platformInfo.color}15`, color:platformInfo.color, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, flexShrink:0 }}>{platformInfo.icon} {platformInfo.label}</span>
        <span style={{ color:C.text, fontSize:13, fontWeight:700, flex:1 }}>{q.question}</span>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          {qRecs.length > 0 && <span style={{ color:C.muted, fontSize:10 }}>기록 {qRecs.length}건</span>}
          {hasMarkup && <span style={{ background:"#bbf7d0", color:"#15803d", borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>하이라이트</span>}
          {!isReadOnly && (
            confirmDelete
              ? <button onClick={e=>{ e.stopPropagation(); onRemove(); }} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"2px 10px", fontSize:11, cursor:"pointer", fontWeight:700 }}>삭제 확인</button>
              : <button onClick={e=>{ e.stopPropagation(); setConfirmDelete(true); }} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:14, lineHeight:1 }}>×</button>
          )}
          <span style={{ color:C.muted, fontSize:10 }}>{isOpen?"▲":"▼"}</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>

          {/* 최근 2개 비교 */}
          {latest && prev && (
            <div style={{ background:"#F8FAFC", borderRadius:12, padding:14, border:`1px solid ${C.dim}` }}>
              <div style={{ color:C.text, fontWeight:700, fontSize:12, marginBottom:10 }}>📊 최근 2개 기록 비교</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{rec:prev, label:"직전"}, {rec:latest, label:"최신"}].map(({rec, label}) => (
                  <div key={rec.id}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <span style={{ color:C.muted, fontSize:10, fontWeight:700 }}>{label} · {fmtDate(rec.date)}</span>
                      {!isReadOnly && (
                        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                          <button onClick={()=>{ setEditRecId(editRecId===rec.id?null:rec.id); setEditText(rec.text); setShowAddRec(false); }}
                            style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:4, padding:"1px 7px", fontSize:10, cursor:"pointer" }}>수정</button>
                          <button onClick={()=>onRemoveRecord(rec.id)}
                            style={{ background:"transparent", border:`1px solid ${C.red}30`, color:C.red, borderRadius:4, padding:"1px 7px", fontSize:10, cursor:"pointer" }}>삭제</button>
                        </div>
                      )}
                    </div>
                    {editRecId === rec.id ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <textarea value={editText} onChange={e=>setEditText(e.target.value)}
                          rows={5} style={{ ...inputSt, padding:"8px 10px", fontSize:12, resize:"vertical" }} />
                        <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                          <button onClick={()=>setEditRecId(null)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                          <button onClick={()=>{ onUpdateRecord(rec.id, editText); setEditRecId(null); }}
                            style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:6, padding:"3px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color:C.text, fontSize:12, lineHeight:1.8, background:"#fff", borderRadius:8, padding:"8px 10px", border:`1px solid ${C.dim}`, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                        <MarkupText text={rec.text} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 기록이 1개일 때 단독 표시 */}
          {latest && !prev && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <span style={{ color:C.muted, fontSize:10, fontWeight:700 }}>{fmtDate(latest.date)}</span>
                {!isReadOnly && (
                  <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                    <button onClick={()=>{ setEditRecId(editRecId===latest.id?null:latest.id); setEditText(latest.text); setShowAddRec(false); }}
                      style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:4, padding:"1px 7px", fontSize:10, cursor:"pointer" }}>수정</button>
                    <button onClick={()=>onRemoveRecord(latest.id)}
                      style={{ background:"transparent", border:`1px solid ${C.red}30`, color:C.red, borderRadius:4, padding:"1px 7px", fontSize:10, cursor:"pointer" }}>삭제</button>
                  </div>
                )}
              </div>
              {editRecId === latest.id ? (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)}
                    rows={5} style={{ ...inputSt, padding:"8px 10px", fontSize:12, resize:"vertical" }} />
                  <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                    <button onClick={()=>setEditRecId(null)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                    <button onClick={()=>{ onUpdateRecord(latest.id, editText); setEditRecId(null); }}
                      style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:6, padding:"3px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                  </div>
                </div>
              ) : (
                <div style={{ color:C.text, fontSize:12, lineHeight:1.8, background:"#F8FAFC", borderRadius:8, padding:"10px 12px", border:`1px solid ${C.dim}`, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                  <MarkupText text={latest.text} />
                </div>
              )}
            </div>
          )}

          {/* 새 기록 추가 */}
          {!isReadOnly && (
            <div>
              {!showAddRec ? (
                <button onClick={()=>{ setShowAddRec(true); setEditRecId(null); }}
                  style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:7, padding:"5px 14px", fontSize:11, cursor:"pointer", fontWeight:700 }}>
                  + 새 기록 추가
                </button>
              ) : (
                <div style={{ background:"#F8FAFC", borderRadius:10, padding:12, display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <label style={{ color:C.muted, fontSize:11, fontWeight:700, flexShrink:0 }}>날짜</label>
                    <input type="date" value={newRec.date} onChange={e=>setNewRec(p=>({...p,date:e.target.value}))}
                      style={{ ...inputSt, padding:"5px 8px", fontSize:12, width:150 }} />
                  </div>
                  <textarea value={newRec.text} onChange={e=>setNewRec(p=>({...p,text:e.target.value}))}
                    placeholder={"AI 답변 내용을 붙여넣어주세요.\n강조할 부분은 [[이렇게]] 감싸면 하이라이트돼요."}
                    rows={5} style={{ ...inputSt, padding:"8px 10px", fontSize:12, resize:"vertical" }} />
                  <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                    <button onClick={()=>setShowAddRec(false)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>취소</button>
                    <button onClick={handleAddRec} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:7, padding:"4px 16px", fontSize:12, cursor:"pointer", fontWeight:700 }}>저장</button>
                  </div>
                  <div style={{ color:C.muted, fontSize:10 }}>💡 [[병원명]] 처럼 감싸면 초록 하이라이트로 표시됩니다.</div>
                </div>
              )}
            </div>
          )}

          {/* 기록이 없을 때 */}
          {qRecs.length === 0 && (
            <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:12 }}>아직 등록된 기록이 없어요.</div>
          )}
        </div>
      )}
    </div>
  );
}

function GrowReportTab({ hospital, isAdmin, isReadOnly, onUpdateHospital }) {
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [activeSection, setActiveSection] = useState("status");
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  const months = [...Array(6)].map((_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-i); return d.toISOString().slice(0,7); });

  const growData = hospital.growData || {};
  const emptyMonth = {
    status: { stage:"", kpiSummary:"", strength:"", weakness:"" },
    problems: { inflow:"", reservation:"", crm:"", branding:"", ops:"" },
    improvements: { ads:"", content:"", crm:"", ops:"", branding:"" },
    strategy: {
      focusProcedure:"", seasonStrategy:"", newCampaign:"",
      geoAeo:"", brandingDirection:"", opsActionPlan:"",
    },
  };
  const monthData = growData[selMonth] || emptyMonth;

  const saveMonth = (updated) => {
    onUpdateHospital({ ...hospital, growData: { ...growData, [selMonth]: updated } });
    toast("저장 완료!");
  };

  const updateField = (section, field, val) => {
    saveMonth({ ...monthData, [section]: { ...monthData[section], [field]: val } });
  };

  const SectionBtn = ({ id, label }) => (
    <button onClick={()=>setActiveSection(id)} style={{
      background: activeSection===id ? hospital.color : "transparent",
      border: `1px solid ${activeSection===id ? hospital.color : C.border}`,
      color: activeSection===id ? "#0F172A" : C.muted,
      borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:700,
    }}>{label}</button>
  );

  const TextArea = ({ label, section, field, placeholder, rows=3, color }) => {
    const savedVal = monthData[section][field]||"";
    const [localVal, setLocalVal] = useState(savedVal);
    useEffect(() => { setLocalVal(savedVal); }, [savedVal, selMonth, section, field]);
    return (
      <div style={{ background:"#F8FAFC", borderRadius:12, padding:14, border:`1px solid ${color?color+"30":C.border}` }}>
        <label style={{ color:color||C.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:6 }}>{label}</label>
        <textarea
          value={localVal}
          disabled={isReadOnly}
          onChange={e=>setLocalVal(e.target.value)}
          onBlur={e=>{ if(e.target.value !== savedVal) updateField(section,field,e.target.value); }}
          placeholder={placeholder}
          rows={rows}
          style={{ ...inputSt, padding:"8px 10px", fontSize:12, width:"100%", resize:"vertical", lineHeight:1.7, minHeight:rows*24 }}
        />
      </div>
    );
  };

  const STAGES = ["인지 단계","성장 단계","도약 단계","안정 단계","확장 단계"];
  const STAGE_COLORS = [C.muted, C.accent, C.yellow, C.green, hospital.color];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 월 선택 */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {months.map(m => (
          <button key={m} onClick={()=>setSelMonth(m)} style={{
            background: selMonth===m?`${hospital.color}20`:"transparent",
            border:`1px solid ${selMonth===m?hospital.color:C.border}`,
            color: selMonth===m?hospital.color:C.muted,
            borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
          }}>{m.slice(5)}월</button>
        ))}
      </div>

      {/* 섹션 탭 */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <SectionBtn id="status"       label="🏥 현재 병원 상태" />
        <SectionBtn id="problems"     label="⚠️ 문제 지점" />
        <SectionBtn id="improvements" label="🔧 개선 방향" />
        <SectionBtn id="strategy"     label="🎯 다음달 전략" />
      </div>

      {/* 현재 병원 상태 */}
      {activeSection === "status" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* 성장 단계 선택 */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:14 }}>📍 현재 성장 단계</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
              {STAGES.map((stage,i) => {
                const isSelected = monthData.status.stage === stage;
                return (
                  <button key={stage} onClick={()=>!isReadOnly&&updateField("status","stage",stage)} style={{
                    background: isSelected?STAGE_COLORS[i]:C.surface,
                    border:`2px solid ${isSelected?STAGE_COLORS[i]:C.border}`,
                    color: isSelected?"#0F172A":C.muted,
                    borderRadius:10, padding:"8px 18px", fontSize:13, cursor:isReadOnly?"default":"pointer", fontWeight:700,
                  }}>{i+1}단계 · {stage}</button>
                );
              })}
            </div>
            {monthData.status.stage && (
              <div style={{ background:`${hospital.color}10`, borderRadius:10, padding:"10px 14px", border:`1px solid ${hospital.color}30` }}>
                <span style={{ color:hospital.color, fontWeight:700, fontSize:13 }}>현재: {monthData.status.stage}</span>
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <TextArea label="📊 핵심 성장 지표 요약" section="status" field="kpiSummary" rows={4}
              placeholder="예: 이번 달 신환 32명 달성, 전월 대비 15% 증가. CPL 8만원으로 안정화. 블로그 유입 1위 키워드 3개 확보." />
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <TextArea label="💪 강점 분석" section="status" field="strength" rows={2} color={C.green}
                placeholder="예: 네이버 플레이스 상위 유지, 원장 브랜딩 강함, 재내원률 높음" />
              <TextArea label="⚡ 약점 분석" section="status" field="weakness" rows={2} color={C.red}
                placeholder="예: 메타광고 전환율 낮음, 상담 연결률 60% 미달, 유튜브 콘텐츠 부재" />
            </div>
          </div>
        </div>
      )}

      {/* 문제 지점 */}
      {activeSection === "problems" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}20`, borderRadius:12, padding:"10px 16px" }}>
            <span style={{ color:C.red, fontSize:12 }}>⚠️ 이번 달 발견된 문제 지점을 영역별로 기록해주세요</span>
          </div>
          {[
            { field:"inflow",      label:"📡 유입 문제",      color:C.accent,  ph:"예: 블로그 유입 감소, 플레이스 순위 하락, 특정 채널 문의 급감" },
            { field:"reservation", label:"📅 예약 전환 문제", color:C.orange,  ph:"예: 노쇼율 25% 이상, 상담 전환률 저조, 예약 후 취소 증가" },
            { field:"crm",         label:"💬 CRM 문제",       color:C.yellow,  ph:"예: 재내원 관리 미흡, VIP 환자 이탈, 후기 작성 유도 부족" },
            { field:"branding",    label:"✨ 브랜딩 문제",    color:C.accent2, ph:"예: 직접검색 정체, SNS 반응 저조, 경쟁 병원 대비 인지도 낮음" },
            { field:"ops",         label:"🛡 운영 문제",      color:C.red,     ph:"예: 부재중 비율 40% 초과, CS 이슈 반복, 응대 품질 불균일" },
          ].map(item => (
            <TextArea key={item.field} label={item.label} section="problems" field={item.field}
              rows={3} color={item.color} placeholder={item.ph} />
          ))}
        </div>
      )}

      {/* 개선 방향 */}
      {activeSection === "improvements" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:`${C.green}08`, border:`1px solid ${C.green}20`, borderRadius:12, padding:"10px 16px" }}>
            <span style={{ color:C.green, fontSize:12 }}>🔧 문제 지점에 대한 구체적인 개선 방향을 작성해주세요</span>
          </div>
          {[
            { field:"ads",      label:"📣 광고 개선",         color:C.accent,  ph:"예: 메타 광고 소재 교체, 네이버 키워드 입찰 최적화, 구글 캠페인 신규 세팅" },
            { field:"content",  label:"📝 콘텐츠 개선",       color:"#03C75A", ph:"예: 블로그 포스팅 주 3회, 인스타 릴스 2회, 시술 FAQ 페이지 5개 추가" },
            { field:"crm",      label:"💬 CRM 개선",          color:C.yellow,  ph:"예: 부재중 콜백 시스템 도입, 재예약 문자 발송 자동화, VIP 관리 DB 구축" },
            { field:"ops",      label:"🛡 원내 운영 개선",    color:C.orange,  ph:"예: 상담 스크립트 재정비, 직원 응대 교육, CS 이슈 처리 매뉴얼 업데이트" },
            { field:"branding", label:"✨ 브랜딩 강화",       color:C.accent2, ph:"예: 원장 유튜브 채널 개설, 네이버 블로그 전문성 콘텐츠 강화, 구글 리뷰 증가 캠페인" },
          ].map(item => (
            <TextArea key={item.field} label={item.label} section="improvements" field={item.field}
              rows={3} color={item.color} placeholder={item.ph} />
          ))}
        </div>
      )}

      {/* 다음달 전략 */}
      {activeSection === "strategy" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:`${hospital.color}08`, border:`1px solid ${hospital.color}20`, borderRadius:12, padding:"10px 16px" }}>
            <span style={{ color:hospital.color, fontSize:12 }}>🎯 다음 달 집중 전략을 수립해주세요</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TextArea label="💉 집중 시술 전략" section="strategy" field="focusProcedure" rows={3} color={hospital.color}
              ph="예: 6월 집중 시술 - 보톡스/필러 패키지. 신환 타겟 30대 여성. 목표 문의 50건." />
            <TextArea label="🌸 시즌 전략" section="strategy" field="seasonStrategy" rows={3} color={C.accent}
              ph="예: 여름 시즌 대비 제모/색소 강화. 6월 15일부터 여름 프로모션 진행." />
            <TextArea label="🚀 신규 캠페인" section="strategy" field="newCampaign" rows={3} color={C.green}
              ph="예: 메타 신규 캠페인 2개 런칭. 영상 소재 3종 제작. 일예산 10만원 테스트." />
            <TextArea label="🤖 GEO / AEO 전략" section="strategy" field="geoAeo" rows={3} color={C.accent2}
              ph="예: FAQ 10개 추가 작성. ChatGPT 노출 위한 전문 칼럼 3편. 구글 색인 페이지 20개 확대." />
            <TextArea label="✨ 브랜딩 방향" section="strategy" field="brandingDirection" rows={3} color="#8B5CF6"
              ph="예: 원장 인스타 팔로워 1천 돌파 목표. 릴스 4편 제작. 네이버 인플루언서 콜라보 1건." />
            <TextArea label="📋 운영 개선 액션플랜" section="strategy" field="opsActionPlan" rows={3} color={C.orange}
              ph="예: 1주차: 상담 스크립트 개편. 2주차: 직원 교육. 3주차: 부재중 콜백 시스템 도입." />
          </div>

          {/* 전략 미리보기 카드 */}
          {Object.values(monthData.strategy).some(v=>v) && (
            <div style={{ background:C.surface, border:`2px solid ${hospital.color}`, borderRadius:16, padding:20, marginTop:4 }}>
              <div style={{ color:hospital.color, fontWeight:900, fontSize:15, marginBottom:14 }}>📋 {selMonth} 다음달 전략 요약</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { label:"집중 시술", val:monthData.strategy.focusProcedure, icon:"💉" },
                  { label:"시즌 전략", val:monthData.strategy.seasonStrategy, icon:"🌸" },
                  { label:"신규 캠페인", val:monthData.strategy.newCampaign, icon:"🚀" },
                  { label:"GEO/AEO", val:monthData.strategy.geoAeo, icon:"🤖" },
                  { label:"브랜딩", val:monthData.strategy.brandingDirection, icon:"✨" },
                  { label:"운영 액션플랜", val:monthData.strategy.opsActionPlan, icon:"📋" },
                ].filter(i=>i.val).map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.dim}` }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <span style={{ color:C.muted, fontSize:11, fontWeight:700 }}>{item.label} · </span>
                      <span style={{ color:C.text, fontSize:12 }}>{item.val.slice(0,80)}{item.val.length>80?"...":""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HospitalScheduleTab({ hospital, globalSchedules, saveGlobalSchedules, isReadOnly }) {
  const schedules = (globalSchedules||[]).filter(s => s.hospitalId === hospital.id || s.hospital === hospital.name);
  const [selMonth, setSelMonth] = useState(new Date().toISOString().slice(0,7));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:"", title:"", memo:"", assignee:"" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ date:"", title:"", memo:"", schedType:"regular", color:"" });
  const [savedMsg, setSavedMsg] = useState("");
  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2000); };

  const addSchedule = async () => {
    if (!form.date || !form.title) return;
    const color = getSchedTypeColor(form.schedType||"regular");
    const newItem = { id:Date.now(), ...form, color, hospital:hospital.name, hospitalId:hospital.id, hospitalColor:hospital.color, source:"hospital" };
    await saveGlobalSchedules([...(globalSchedules||[]), newItem]);
    setForm({ date:"", title:"", memo:"", schedType:"regular" });
    setShowForm(false); toast("일정 추가 완료! 내부 일정에도 즉시 반영됐어요.");
  };

  const updateSchedule = async () => {
    const color = getSchedTypeColor(editForm.schedType||"regular");
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
          {/* 유형 선택 */}
          <div style={{ marginBottom:12 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>일정 유형</label>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {SCHED_TYPES.map(t => {
                const isOn = (form.schedType || "regular") === t.id;
                return (
                  <button key={t.id} onClick={()=>setForm(p=>({...p, schedType:t.id, color:t.color}))} style={{
                    background: isOn ? `${t.color}20` : "transparent",
                    border: `2px solid ${isOn ? t.color : C.dim}`,
                    color: isOn ? t.color : C.muted,
                    borderRadius:8, padding:"5px 12px", fontSize:11, cursor:"pointer", fontWeight:isOn?700:400,
                    display:"flex", alignItems:"center", gap:4,
                  }}>{t.icon} {t.label}</button>
                );
              })}
            </div>
          </div>
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
                <div key={i} style={{ height:80, background:isToday?`${hospital.color}10`:"#F8FAFC", borderRadius:8, padding:4, border:isToday?`1px solid ${hospital.color}40`:`1px solid ${C.border}`, opacity:d?1:0, overflow:"hidden" }}>
                  {d && <>
                    <div style={{ color:isToday?hospital.color:dow===0?C.red:dow===6?C.accent2:C.text, fontSize:11, fontWeight:isToday?800:500, marginBottom:2 }}>{d}</div>
                    {dayScheds.map((s,j) => (
                      <div key={j} style={{ background:s.schedType?getSchedTypeColor(s.schedType):s.color||hospital.color, borderRadius:3, padding:"1px 4px", fontSize:10, color:"#0F172A", fontWeight:600, marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{s.title}</div>
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
                  <div style={{ background:"#F8FAFC", borderRadius:10, padding:14, border:`1px solid ${hospital.color}40` }}>
                    <div style={{ color:hospital.color, fontSize:11, fontWeight:700, marginBottom:10 }}>✏️ 일정 수정</div>
                    {/* 유형 선택 */}
                    <div style={{ marginBottom:10 }}>
                      <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:5 }}>일정 유형</label>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {SCHED_TYPES.map(t => {
                          const isOn = (editForm.schedType||"regular") === t.id;
                          return (
                            <button key={t.id} onClick={()=>setEditForm(p=>({...p,schedType:t.id,color:t.color}))} style={{
                              background:isOn?`${t.color}20`:"transparent",
                              border:`2px solid ${isOn?t.color:C.dim}`,
                              color:isOn?t.color:C.muted,
                              borderRadius:7, padding:"4px 10px", fontSize:10, cursor:"pointer", fontWeight:isOn?700:400,
                              display:"flex", alignItems:"center", gap:3,
                            }}>{t.icon} {t.label}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      <div>
                        <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>날짜</label>
                        <input type="date" value={editForm.date} onChange={e=>setEditForm(p=>({...p,date:e.target.value}))}
                          style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                      </div>
                      <div>
                        <label style={{ color:C.muted, fontSize:10, display:"block", marginBottom:2 }}>제목</label>
                        <input type="text" value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))}
                          placeholder="제목" style={{ ...inputSt, padding:"5px 8px", fontSize:12 }} />
                      </div>
                    </div>
                    <input type="text" value={editForm.memo||""} onChange={e=>setEditForm(p=>({...p,memo:e.target.value}))}
                      placeholder="메모 (선택)" style={{ ...inputSt, marginBottom:10, padding:"5px 8px", fontSize:12, width:"100%" }} />
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={updateSchedule} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#0F172A", borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                      <button onClick={() => setEditId(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:4, minHeight:40, borderRadius:2, background:s.schedType?getSchedTypeColor(s.schedType):s.color||hospital.color, flexShrink:0, marginTop:2 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
                        <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{s.title}</span>
                        {s.schedType && (() => {
                          const t = SCHED_TYPES.find(t=>t.id===s.schedType);
                          return t ? <span style={{ background:`${t.color}15`, color:t.color, borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{t.icon} {t.label}</span> : null;
                        })()}
                      </div>
                      <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>📅 {s.date}</div>
                      {s.memo && <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>💬 {s.memo}</div>}
                    </div>
                    {!isReadOnly && <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      <button onClick={() => { setEditId(s.id); setEditForm({ date:s.date, title:s.title, memo:s.memo||"", schedType:s.schedType||"regular", color:s.color||"" }); }}
                        style={{ background:`${hospital.color}10`, border:`1px solid ${hospital.color}30`, color:hospital.color, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer", fontWeight:600 }}>수정</button>
                      {deleteConfirm === s.id
                        ? <button onClick={() => deleteSchedule(s.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}`, color:C.red, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>확인</button>
                        : <button onClick={() => setDeleteConfirm(s.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:6, padding:"3px 8px", fontSize:10, cursor:"pointer" }}>삭제</button>
                      }
                    </div>}
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
      // 모든 테이블 병렬 로드
      const [hospRes, monthlyRes, channelRes, contentRes, meetingRes, schedRes] = await Promise.all([
        supabase.from('hospitals').select('*'),
        supabase.from('monthly_data').select('*'),
        supabase.from('channel_data').select('*'),
        supabase.from('content_data').select('*'),
        supabase.from('meeting_data').select('*'),
        supabase.from('schedule_data').select('*').eq('id', 1).single(),
      ]);

      const hospRows = hospRes.data;
      const monthlyRows = monthlyRes.data;
      const channelRows = channelRes.data;
      const contentRows = contentRes.data;
      const meetingRows = meetingRes.data;
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
            // 신규 탭은 아직 한번도 설정 안한 병원에만 추가 (기존 tabs가 있으면 유지)
            tabs: h.tabs ? h.tabs : DEFAULT_TABS,
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
      await supabase.from('hospitals').upsert({ id: h.id, data: hospData }, { onConflict: 'id' });
      await supabase.from('monthly_data').upsert({ hospital_id: h.id, data: monthlyData }, { onConflict: 'hospital_id' });
      await supabase.from('channel_data').upsert({ hospital_id: h.id, data: channelData }, { onConflict: 'hospital_id' });
      await supabase.from('content_data').upsert({ hospital_id: h.id, data: contentData }, { onConflict: 'hospital_id' });
      await supabase.from('meeting_data').upsert({ hospital_id: h.id, data: meetingData || [] }, { onConflict: 'hospital_id' });
    }
  };

  const saveHospitalToSupabase = async (h) => {
    try {
      const { monthlyData, channelData, contentData, meetingData, adsData, inflowData, brandingData, crmData, aiData, growData, aiQaData, onlineAssetData, ...hospData } = h;
      await supabase.from('hospitals').upsert(
        { id: h.id, data: { ...hospData, adsData:adsData||{}, inflowData:inflowData||{}, brandingData:brandingData||{}, crmData:crmData||{}, aiData:aiData||{}, growData:growData||{}, aiQaData:aiQaData||{questions:[],records:{}}, onlineAssetData:onlineAssetData||{} } },
        { onConflict: 'id' }
      );
      await supabase.from('monthly_data').upsert({ hospital_id: h.id, data: monthlyData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('channel_data').upsert({ hospital_id: h.id, data: channelData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('content_data').upsert({ hospital_id: h.id, data: contentData || [] }, { onConflict: 'hospital_id' });
      await supabase.from('meeting_data').upsert({ hospital_id: h.id, data: meetingData || [] }, { onConflict: 'hospital_id' });
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  // 동시 다중 저장 방지: 병원별로 마지막 요청만 실행 (debounce 300ms)
  const saveTimers = useRef({});
  const handleUpdateHospital = (updated) => {
    // 로컬 state는 즉시 반영 (UI 끊김 없음)
    setHospitals(prev => prev.map(h => h.id === updated.id ? updated : h));
    setSelectedId(updated.id);
    // 같은 병원에 연속 저장 요청이 오면 마지막 것만 실제 저장
    if (saveTimers.current[updated.id]) clearTimeout(saveTimers.current[updated.id]);
    saveTimers.current[updated.id] = setTimeout(async () => {
      await saveHospitalToSupabase(updated);
      await logActivity("데이터 수정", updated.name, "병원 데이터 업데이트");
      delete saveTimers.current[updated.id];
    }, 300);
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
    // setHospitals의 콜백에서 최신 h를 가져와 stale closure 버그 방지
    let fullUpdated = null;
    setHospitals(prev => {
      const next = prev.map(h => {
        if (h.id !== updated.id) return h;
        fullUpdated = { ...h, ...updated };
        return fullUpdated;
      });
      return next;
    });
    // setTimeout으로 state 업데이트 후 저장 (fullUpdated가 세팅된 시점)
    setTimeout(async () => {
      if (fullUpdated) {
        await saveHospitalToSupabase(fullUpdated);
        await logActivity("병원 정보 수정", updated.name, "병원 기본 정보 변경");
      }
    }, 0);
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
      const isSuperAdminFlag = matched.password === SUPER_ADMIN_PW || role === "최고관리자";
      onLogin(matched.name, isSuperAdminFlag, role);
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

  if (hospitals.length === 0) return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"-apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Nanum Gothic', sans-serif" }}>
      <div style={{ color:"#64748B", fontSize:14 }}>불러오는 중...</div>
    </div>
  );

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

