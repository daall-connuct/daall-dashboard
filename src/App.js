/* eslint-disable */
import { useState, useMemo, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://jfausjwfxpturkkmmyrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYXVzandmeHB0dXJra21teXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDE1NzksImV4cCI6MjA4OTQ3NzU3OX0.PofOLAP6nT7NZ8pWM5xNaEq6T-yCNzNThz36IgynOfM'
);
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

// ─── 색상 ─────────────────────────────────────────────────────
const C = {
  bg: "#070D18", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)",
  accent: "#38BDF8", accent2: "#818CF8", green: "#34D399", yellow: "#FBBF24",
  red: "#F87171", orange: "#FB923C", text: "#E2E8F0", muted: "#64748B", dim: "#1E293B",
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
        style={{ background:"rgba(255,255,255,0.05)", border:`1px solid #1E293B`, borderRadius:8, color:"#E2E8F0", padding:"4px 10px", fontSize:12, fontFamily:"'Noto Sans KR', sans-serif", outline:"none", cursor:"pointer" }}>
        {years.map(y => <option key={y} value={y} style={{background:"#0F172A"}}>{y}년</option>)}
      </select>
      {monthsInYear.length === 0
        ? <span style={{ color:"#64748B", fontSize:12 }}>{selYear}년 데이터 없음</span>
        : monthsInYear.map(m => (
            <button key={m} onClick={() => setSelMonth(m)} style={{
              background: selMonth===m ? `${accentColor}25` : "transparent",
              border: `1px solid ${selMonth===m ? accentColor : "#1E293B"}`,
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
  <Tooltip contentStyle={{ background: "#0F172A", border: `1px solid ${C.dim}`, borderRadius: 10, color: C.text, fontSize: 12 }} {...props} />
);

const inputSt = { background: "rgba(255,255,255,0.05)", border: `1px solid ${C.dim}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", width: "100%", outline: "none" };

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

const DEFAULT_CHECKLIST_ITEMS = [
  { id:"blog",    group:"콘텐츠", label:"블로그 포스팅 발행",        icon:"📝", targetKey:"blogTarget" },
  { id:"insta",   group:"콘텐츠", label:"인스타그램 콘텐츠 발행",    icon:"📸", targetKey:"instaTarget" },
  { id:"youtube", group:"콘텐츠", label:"유튜브 업로드",              icon:"🎬", targetKey:"youtubeTarget" },
  { id:"place",   group:"운영",   label:"플레이스 리뷰 확인 및 답글", icon:"⭐", targetKey:null },
  { id:"ad",      group:"운영",   label:"광고비 정산 및 보고",        icon:"💰", targetKey:null },
  { id:"report",  group:"보고",   label:"월간 리포트 전달",           icon:"📊", targetKey:null },
  { id:"kakao",   group:"소통",   label:"카카오톡 상담 확인",         icon:"💬", targetKey:null },
  { id:"meeting", group:"소통",   label:"병원 담당자 미팅/통화",      icon:"📞", targetKey:null },
];
const CL_GROUPS = ["콘텐츠","운영","보고","소통"];
const CL_GROUP_COLORS = { "콘텐츠":"#38BDF8", "운영":"#34D399", "보고":"#A78BFA", "소통":"#FBBF24" };
const CL_CURRENT_MONTH = new Date().toISOString().slice(0,7);
const CL_MONTH_LABEL = (ym) => { const [,m] = ym.split("-"); return `${+m}월`; };

// ─── 관리자 전용 전체 병원 체크리스트 ────────────────────────
function AdminChecklist({ hospitals }) {
  const [selMonth, setSelMonth] = useState(CL_CURRENT_MONTH);
  const [allData, setAllData] = useState({});
  const [expandedHospital, setExpandedHospital] = useState(null);

  // 항목 관리 (편집 가능)
  const [items, setItems] = useState(DEFAULT_CHECKLIST_ITEMS);
  const [showItemEdit, setShowItemEdit] = useState(false);
  const [newItem, setNewItem] = useState({ label:"", group:"운영", icon:"✅", hasCount:false });
  const [editItemId, setEditItemId] = useState(null);
  const [editItemForm, setEditItemForm] = useState({});

  const handleAddItem = () => {
    if (!newItem.label.trim()) return;
    const id = "custom_" + Date.now();
    setItems(prev => [...prev, {
      id, group:newItem.group, label:newItem.label, icon:newItem.icon||"✅",
      targetKey: newItem.hasCount ? `${id}Target` : null
    }]);
    setNewItem({ label:"", group:"운영", icon:"✅", hasCount:false });
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleEditItem = (item) => {
    setEditItemId(item.id);
    setEditItemForm({ label:item.label, group:item.group, icon:item.icon, hasCount:item.targetKey!==null });
  };

  const handleSaveEditItem = () => {
    setItems(prev => prev.map(i => i.id === editItemId ? {
      ...i, label:editItemForm.label, group:editItemForm.group, icon:editItemForm.icon,
      targetKey: editItemForm.hasCount ? (i.targetKey || `${i.id}Target`) : null
    } : i));
    setEditItemId(null);
  };

  const monthList = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0,7);
  });

  const getHospitalData = (hId) => allData[`${hId}_${selMonth}`] || {
    checks: {}, counts: {}, targets: { blogTarget:8, instaTarget:12, youtubeTarget:2 }, memo:""
  };

  const updateHospital = (hId, patch) => {
    const key = `${hId}_${selMonth}`;
    setAllData(prev => ({ ...prev, [key]: { ...getHospitalData(hId), ...patch } }));
  };

  const toggleCheck = (hId, itemId) => {
    const d = getHospitalData(hId);
    updateHospital(hId, { checks: { ...d.checks, [itemId]: !d.checks[itemId] } });
  };

  const setCount = (hId, itemId, val) => {
    const d = getHospitalData(hId);
    updateHospital(hId, { counts: { ...d.counts, [itemId]: +val||0 } });
  };

  // 병원별 활성 항목 (기본: 전체 활성)
  const [hospitalActiveItems, setHospitalActiveItems] = useState({});
  const [showItemToggle, setShowItemToggle] = useState(null); // 항목 켜기/끄기 열린 병원 id

  const getActiveItems = (hId) => {
    const active = hospitalActiveItems[hId];
    if (!active) return items; // 설정 없으면 전체 활성
    return items.filter(item => active[item.id] !== false);
  };

  const toggleItemActive = (hId, itemId) => {
    setHospitalActiveItems(prev => {
      const current = prev[hId] || {};
      // 기본값이 없으면 true, 있으면 반전
      const currentVal = current[itemId] !== undefined ? current[itemId] : true;
      return { ...prev, [hId]: { ...current, [itemId]: !currentVal } };
    });
  };

  const isItemActive = (hId, itemId) => {
    const active = hospitalActiveItems[hId];
    if (!active || active[itemId] === undefined) return true;
    return active[itemId];
  };

  const hospitalStats = useMemo(() => hospitals.map(h => {
    const d = getHospitalData(h.id);
    const activeItems = getActiveItems(h.id);
    const done = activeItems.filter(item => d.checks[item.id]).length;
    return { ...h, done, activeCount: activeItems.length, rate: Math.round((done / (activeItems.length||1)) * 100) };
  }), [hospitals, allData, items, hospitalActiveItems, selMonth]);
  const overallRate = Math.round(hospitalStats.reduce((s,h) => s+h.rate, 0) / (hospitals.length||1));

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${C.accent}30`, borderRadius:20, padding:28 }}>
      {/* 헤더 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:3, height:20, background:`linear-gradient(180deg,${C.accent},${C.accent2})`, borderRadius:2 }} />
          <div>
            <div style={{ color:C.text, fontSize:16, fontWeight:800 }}>전체 병원 월간 체크리스트</div>
            <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{CL_MONTH_LABEL(selMonth)} 기준 · 전체 평균 완료율 <span style={{ color:overallRate>=80?C.green:overallRate>=50?C.yellow:C.red, fontWeight:700 }}>{overallRate}%</span></div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={() => setShowItemEdit(!showItemEdit)} style={{
            background: showItemEdit ? `${C.accent2}20` : "transparent",
            border: `1px solid ${showItemEdit ? C.accent2 : C.border}`,
            color: showItemEdit ? C.accent2 : C.muted,
            borderRadius:8, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:600,
          }}>⚙ 항목 관리</button>
          {monthList.map(ym => (
            <button key={ym} onClick={() => setSelMonth(ym)} style={{
              background: selMonth===ym ? `${C.accent}25` : "transparent",
              border: `1px solid ${selMonth===ym ? C.accent : C.border}`,
              color: selMonth===ym ? C.accent : C.muted,
              borderRadius:8, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:600,
            }}>{CL_MONTH_LABEL(ym)}</button>
          ))}
        </div>
      </div>

      {/* 항목 관리 패널 */}
      {showItemEdit && (
        <div style={{ background:`${C.accent2}08`, border:`1px solid ${C.accent2}30`, borderRadius:14, padding:20, marginBottom:20 }}>
          <div style={{ color:C.text, fontSize:13, fontWeight:700, marginBottom:14 }}>체크리스트 항목 관리</div>

          {/* 기존 항목 목록 */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {items.map(item => (
              <div key={item.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.dim}`, borderRadius:10, padding:"10px 14px" }}>
                {editItemId === item.id ? (
                  // 수정 모드
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <input value={editItemForm.icon} onChange={e => setEditItemForm({...editItemForm, icon:e.target.value})}
                      style={{ ...inputSt, width:52, padding:"5px 8px", fontSize:18, textAlign:"center" }} placeholder="아이콘" />
                    <input value={editItemForm.label} onChange={e => setEditItemForm({...editItemForm, label:e.target.value})}
                      style={{ ...inputSt, flex:1, minWidth:160, padding:"5px 10px", fontSize:12 }} placeholder="항목명" />
                    <select value={editItemForm.group} onChange={e => setEditItemForm({...editItemForm, group:e.target.value})}
                      style={{ ...inputSt, width:80, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                      {CL_GROUPS.map(g => <option key={g} style={{background:"#0F172A"}}>{g}</option>)}
                    </select>
                    <label style={{ display:"flex", alignItems:"center", gap:4, color:C.muted, fontSize:12, cursor:"pointer" }}>
                      <input type="checkbox" checked={editItemForm.hasCount} onChange={e => setEditItemForm({...editItemForm, hasCount:e.target.checked})} />
                      건수 입력
                    </label>
                    <button onClick={handleSaveEditItem} style={{ background:`${C.green}20`, border:`1px solid ${C.green}`, color:C.green, borderRadius:7, padding:"5px 12px", fontSize:11, cursor:"pointer", fontWeight:700 }}>저장</button>
                    <button onClick={() => setEditItemId(null)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>취소</button>
                  </div>
                ) : (
                  // 일반 모드
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:16 }}>{item.icon}</span>
                    <span style={{ color:C.text, fontSize:13, flex:1 }}>{item.label}</span>
                    <Badge color={CL_GROUP_COLORS[item.group]}>{item.group}</Badge>
                    {item.targetKey && <Badge color={C.muted}>건수</Badge>}
                    <button onClick={() => handleEditItem(item)} style={{ background:`${C.accent}15`, border:`1px solid ${C.accent}30`, color:C.accent, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>수정</button>
                    <button onClick={() => handleDeleteItem(item.id)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, color:C.red, borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>삭제</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 새 항목 추가 */}
          <div style={{ background:`${C.green}08`, border:`1px solid ${C.green}30`, borderRadius:10, padding:14 }}>
            <div style={{ color:C.muted, fontSize:11, marginBottom:10, fontWeight:600 }}>새 항목 추가</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <input value={newItem.icon} onChange={e => setNewItem({...newItem, icon:e.target.value})}
                style={{ ...inputSt, width:52, padding:"5px 8px", fontSize:18, textAlign:"center" }} placeholder="✅" />
              <input value={newItem.label} onChange={e => setNewItem({...newItem, label:e.target.value})}
                onKeyDown={e => e.key === "Enter" && handleAddItem()}
                style={{ ...inputSt, flex:1, minWidth:160, padding:"5px 10px", fontSize:12 }} placeholder="항목명을 입력하세요" />
              <select value={newItem.group} onChange={e => setNewItem({...newItem, group:e.target.value})}
                style={{ ...inputSt, width:80, padding:"5px 8px", fontSize:12, appearance:"none" }}>
                {CL_GROUPS.map(g => <option key={g} style={{background:"#0F172A"}}>{g}</option>)}
              </select>
              <label style={{ display:"flex", alignItems:"center", gap:4, color:C.muted, fontSize:12, cursor:"pointer", flexShrink:0 }}>
                <input type="checkbox" checked={newItem.hasCount} onChange={e => setNewItem({...newItem, hasCount:e.target.checked})} />
                건수 입력
              </label>
              <button onClick={handleAddItem} style={{ background:`${C.green}20`, border:`1px solid ${C.green}`, color:C.green, borderRadius:8, padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:700, flexShrink:0 }}>+ 추가</button>
            </div>
          </div>

          <div style={{ marginTop:12, display:"flex", justifyContent:"flex-end" }}>
            <button onClick={() => setItems(DEFAULT_CHECKLIST_ITEMS)} style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, color:C.red, borderRadius:7, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>기본값으로 초기화</button>
          </div>
        </div>
      )}

      {/* 전체 진행 바 */}
      <div style={{ background:C.dim, borderRadius:6, height:8, overflow:"hidden", marginBottom:24 }}>
        <div style={{ width:`${overallRate}%`, height:"100%", background:`linear-gradient(90deg,${C.accent},${C.accent2})`, borderRadius:6, transition:"width 0.4s" }} />
      </div>

      {/* 병원별 요약 카드 그리드 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:14 }}>
        {hospitalStats.map(h => {
          const d = getHospitalData(h.id);
          const isExpanded = expandedHospital === h.id;
          return (
            <div key={h.id} style={{ background:C.surface, border:`1px solid ${isExpanded ? h.color : h.color+"30"}`, borderRadius:14, overflow:"hidden", transition:"all 0.2s" }}>
              {/* 카드 헤더 */}
              <div onClick={() => { setExpandedHospital(isExpanded ? null : h.id); setShowItemToggle(null); }}
                style={{ padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${h.color},${h.color}88)`, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ color:C.text, fontSize:13, fontWeight:800 }}>{h.name}</div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{h.dept} · {h.manager}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:h.rate===100?C.green:h.rate>=70?C.yellow:h.color, fontSize:18, fontWeight:900 }}>{h.rate}%</div>
                  <div style={{ color:C.muted, fontSize:10 }}>{h.done}/{h.activeCount}항목</div>
                </div>
              </div>

              {/* 미니 진행 바 */}
              <div style={{ height:4, background:C.dim }}>
                <div style={{ width:`${h.rate}%`, height:"100%", background:h.color, transition:"width 0.4s" }} />
              </div>

              {/* 체크리스트 상세 (펼쳐진 경우) */}
              {isExpanded && (
                <div style={{ padding:"14px 18px", borderTop:`1px solid ${C.dim}` }}>

                  {/* 항목 켜기/끄기 토글 */}
                  <div style={{ marginBottom:12 }}>
                    <button onClick={e => { e.stopPropagation(); setShowItemToggle(showItemToggle===h.id ? null : h.id); }} style={{
                      background: showItemToggle===h.id ? `${h.color}20` : "transparent",
                      border: `1px solid ${showItemToggle===h.id ? h.color : C.dim}`,
                      color: showItemToggle===h.id ? h.color : C.muted,
                      borderRadius:7, padding:"4px 12px", fontSize:11, cursor:"pointer", fontWeight:600, width:"100%",
                    }}>⚙ 이 병원 적용 항목 설정 ({h.activeCount}/{items.length})</button>
                  </div>

                  {/* 항목 토글 패널 */}
                  {showItemToggle===h.id && (
                    <div style={{ background:`${h.color}08`, border:`1px solid ${h.color}20`, borderRadius:10, padding:12, marginBottom:12 }}>
                      <div style={{ color:C.muted, fontSize:11, marginBottom:8, fontWeight:600 }}>이 병원에 적용할 항목을 선택하세요</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {items.map(item => {
                          const active = isItemActive(h.id, item.id);
                          const groupColor = CL_GROUP_COLORS[item.group];
                          return (
                            <div key={item.id} onClick={() => toggleItemActive(h.id, item.id)}
                              style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 8px", borderRadius:7, background: active ? `${groupColor}12` : "transparent" }}>
                              <div style={{
                                width:18, height:18, borderRadius:5, flexShrink:0,
                                background: active ? groupColor : "transparent",
                                border: `2px solid ${active ? groupColor : C.dim}`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                              }}>
                                {active && <span style={{ color:"#fff", fontSize:11, fontWeight:900 }}>✓</span>}
                              </div>
                              <span style={{ fontSize:12 }}>{item.icon}</span>
                              <span style={{ color: active ? C.text : C.muted, fontSize:12 }}>{item.label}</span>
                              <Badge color={groupColor}>{item.group}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {getActiveItems(h.id).map(item => {
                      const done = !!d.checks[item.id];
                      const hasCount = item.targetKey !== null;
                      const count = d.counts[item.id] || 0;
                      const target = d.targets[item.targetKey] || 0;
                      const groupColor = CL_GROUP_COLORS[item.group];
                      return (
                        <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {/* 체크박스 */}
                          <div onClick={() => toggleCheck(h.id, item.id)} style={{
                            width:20, height:20, borderRadius:6, flexShrink:0, cursor:"pointer",
                            background: done ? groupColor : "transparent",
                            border: `2px solid ${done ? groupColor : C.dim}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.15s",
                          }}>
                            {done && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✓</span>}
                          </div>
                          <span style={{ color:done?C.text:C.muted, fontSize:12, flex:1, fontWeight:done?600:400 }}>
                            {item.icon} {item.label}
                          </span>
                          {/* 건수 입력 */}
                          {hasCount && (
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <input type="number" value={count||""} onChange={e => setCount(h.id, item.id, e.target.value)}
                                placeholder="0" style={{ ...inputSt, width:46, padding:"3px 6px", fontSize:11, textAlign:"center" }} />
                              <span style={{ color:C.muted, fontSize:10 }}>/{target}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* 메모 */}
                  <div style={{ marginTop:12 }}>
                    <KInput type="text" placeholder="메모" value={d.memo||""}
                      onChange={e => updateHospital(h.id, { memo: e.target.value })}
                      style={{ ...inputSt, fontSize:11, padding:"6px 10px" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 항목별 전체 현황 요약 */}
      <div style={{ marginTop:24, background:C.surface, borderRadius:14, padding:18 }}>
        <div style={{ color:C.muted, fontSize:12, fontWeight:700, marginBottom:12 }}>항목별 완료 현황 ({hospitals.length}개 병원 기준)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8 }}>
          {items.map(item => {
            const applicableHospitals = hospitals.filter(h => isItemActive(h.id, item.id));
            const doneCount = applicableHospitals.filter(h => getHospitalData(h.id).checks[item.id]).length;
            const rate = applicableHospitals.length > 0 ? Math.round((doneCount / applicableHospitals.length) * 100) : 0;
            const groupColor = CL_GROUP_COLORS[item.group];
            return (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ color:C.muted, fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</span>
                    <span style={{ color:rate===100?groupColor:C.muted, fontSize:11, fontWeight:700, flexShrink:0, marginLeft:4 }}>{doneCount}/{applicableHospitals.length}</span>
                  </div>
                  <div style={{ background:C.dim, borderRadius:3, height:4 }}>
                    <div style={{ width:`${rate}%`, height:"100%", background:groupColor, borderRadius:3, transition:"width 0.3s" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

function HospitalSelectScreen({ hospitals, onSelect, onAddHospital, onEditHospital, onDeleteHospital, isAdmin, onAdminLogin, onAdminLogout }) {
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_HOSPITAL_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedMsg, setSavedMsg]     = useState("");

  // 관리자 계정 관리 (이름 + 비밀번호)
  const [adminAccounts, setAdminAccounts] = useState([
    { id:1, name:"임지혜", password:"Daall" },
  ]);
  const [adminName, setAdminName]     = useState("");
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput]         = useState("");
  const [pwError, setPwError]         = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const pwInputRef = useRef(null);

  // 관리자 계정 관리 UI
  const [showAccountMgmt, setShowAccountMgmt] = useState(false);
  const [newAccount, setNewAccount]   = useState({ name:"", password:"" });
  const [resetConfirmId, setResetConfirmId] = useState(null);

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

  const handleAdminLogin = () => {
    const matched = adminAccounts.find(a => a.password === pwInput);
    if (matched) {
      setAdminName(matched.name);
      setShowPwModal(false); setPwInput(""); setPwError(false);
      onAdminLogin(matched.name);
      toast(`${matched.name}님, 관리자 모드 활성화!`);
    } else {
      setPwError(true); setPwInput("");
      setTimeout(() => pwInputRef.current?.focus(), 0);
    }
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
  const openEdit = (e, h) => { e.stopPropagation(); setForm({ name:h.name, region:h.region, dept:h.dept, manager:h.manager, target_patients:String(h.target_patients), target_revenue:String(h.target_revenue), color:h.color, password:h.password||"", tabs: h.tabs || DEFAULT_TABS }); setEditTarget(h); setShowForm(true); };

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
    <div style={{ minHeight:"100vh", background:C.bg, padding:"40px 32px", fontFamily:"'Noto Sans KR', sans-serif" }}>
      <Toast msg={savedMsg} />

      {/* 비밀번호 모달 */}
      {showPwModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => { setShowPwModal(false); setPwInput(""); setPwError(false); }}>
          <div style={{ background:"#0F172A", border:`1px solid ${C.border}`, borderRadius:20, padding:32, width:340, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ color:C.text, fontSize:17, fontWeight:800, marginBottom:6 }}>관리자 모드</div>
            <div style={{ color:C.muted, fontSize:13, marginBottom:24 }}>비밀번호를 입력해 주세요</div>
            <input
              ref={pwInputRef}
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              placeholder="비밀번호"
              autoFocus
              style={{ ...inputSt, marginBottom:8, fontSize:15, letterSpacing:4 }}
            />
            {pwError && <div style={{ color:C.red, fontSize:12, marginBottom:12 }}>비밀번호가 틀렸어요</div>}
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={handleAdminLogin} style={{ flex:1, background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#fff", borderRadius:10, padding:"11px 0", fontSize:14, cursor:"pointer", fontWeight:700 }}>확인</button>
              <button onClick={() => { setShowPwModal(false); setPwInput(""); setPwError(false); }} style={{ flex:1, background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"11px 0", fontSize:14, cursor:"pointer" }}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40, flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ color:C.text, fontSize:26, fontWeight:900, marginBottom:4 }}>다올 마케팅 대시보드</div>
            {isAdmin && <Badge color={C.accent}>관리자 · {adminName}</Badge>}
          </div>
          <div style={{ color:C.muted, fontSize:14 }}>병원을 선택하면 상세 대시보드로 이동해요</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {isAdmin ? (
            <>
              <button onClick={() => setShowChecklist(!showChecklist)} style={{
                background: showChecklist ? `${C.accent}20` : "transparent",
                border: `1px solid ${showChecklist ? C.accent : C.border}`,
                color: showChecklist ? C.accent : C.muted,
                borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
              }}>📋 월간 체크리스트</button>
              <button onClick={openAdd} style={{ background:`linear-gradient(135deg,${C.accent},${C.accent2})`, border:"none", color:"#fff", borderRadius:12, padding:"11px 22px", fontSize:14, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
                + 새 병원 추가
              </button>
              <button onClick={() => { onAdminLogout(); setAdminName(""); setShowChecklist(false); setShowAccountMgmt(false); toast("관리자 모드 해제"); }} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:10, padding:"9px 14px", fontSize:12, cursor:"pointer" }}>
                로그아웃
              </button>
              <button onClick={() => setShowAccountMgmt(!showAccountMgmt)} style={{
                background: showAccountMgmt ? `${C.accent2}20` : "transparent",
                border: `1px solid ${showAccountMgmt ? C.accent2 : C.dim}`,
                color: showAccountMgmt ? C.accent2 : C.muted,
                borderRadius:10, padding:"9px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
              }}>👤 계정 관리</button>
            </>
          ) : (
            <button onClick={() => setShowPwModal(true)} style={{
              background:"transparent", border:`1px solid ${C.border}`, color:C.muted,
              borderRadius:10, padding:"9px 16px", fontSize:13, cursor:"pointer", fontWeight:600,
            }}>🔒 관리자 모드</button>
          )}
        </div>
      </div>

      {/* 관리자 전용 - 계정 관리 */}
      {isAdmin && showAccountMgmt && (
        <div style={{ marginBottom:24, background:"rgba(255,255,255,0.02)", border:`1px solid ${C.accent2}30`, borderRadius:20, padding:24 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:18, background:`linear-gradient(180deg,${C.accent2},${C.accent})`, borderRadius:2 }} />
            관리자 계정 관리
          </div>

          {/* 현재 계정 목록 */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {adminAccounts.map(acc => (
              <div key={acc.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent2},${C.accent})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {acc.name[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:C.text, fontSize:13, fontWeight:700 }}>{acc.name}</div>
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
            ))}
          </div>

          {/* 새 계정 추가 */}
          <div style={{ background:`${C.accent2}08`, border:`1px solid ${C.accent2}25`, borderRadius:12, padding:16 }}>
            <div style={{ color:C.muted, fontSize:12, fontWeight:700, marginBottom:10 }}>새 관리자 계정 추가</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name:e.target.value})}
                placeholder="이름" style={{ ...inputSt, width:120, padding:"7px 10px", fontSize:12 }} />
              <input type="password" value={newAccount.password} onChange={e => setNewAccount({...newAccount, password:e.target.value})}
                onKeyDown={e => e.key === "Enter" && handleAddAccount()}
                placeholder="비밀번호" style={{ ...inputSt, width:140, padding:"7px 10px", fontSize:12 }} />
              <button onClick={handleAddAccount} disabled={!newAccount.name || !newAccount.password} style={{
                background: newAccount.name && newAccount.password ? `linear-gradient(135deg,${C.accent2},${C.accent})` : C.dim,
                border:"none", color:"#fff", borderRadius:9, padding:"7px 18px", fontSize:12, cursor: newAccount.name && newAccount.password ? "pointer" : "not-allowed", fontWeight:700,
              }}>+ 추가</button>
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>추가된 계정은 동일하게 모든 관리자 기능을 사용할 수 있어요.</div>
          </div>
        </div>
      )}

      {/* 관리자 전용 - 전체 병원 월간 체크리스트 */}
      {isAdmin && showChecklist && (
        <div style={{ marginBottom:40 }}>
          <AdminChecklist hospitals={hospitals} />
        </div>
      )}

      {/* 병원 추가 / 수정 폼 */}
      {showForm && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:`2px solid ${form.color}50`, borderRadius:20, padding:28, maxWidth:900, margin:"0 auto", marginBottom:32 }}>
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
              border:"none", color:"#fff", borderRadius:10, padding:"10px 26px", fontSize:13, cursor: form.name && form.dept ? "pointer" : "not-allowed", fontWeight:700,
            }}>{editTarget ? "수정 완료" : "병원 추가"}</button>
            <button onClick={() => { setShowForm(false); setEditTarget(null); setForm(EMPTY_HOSPITAL_FORM); }} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"10px 18px", fontSize:13, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

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
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 10px" }}>
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
    payment: existing.payment || 0,
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
    setForm({ month:key, inquiry:ex.inquiry||0, consult:ex.consult||0, reservation:ex.reservation||0, visit:ex.visit||0, payment:ex.payment||0, newPatient:ex.newPatient||0, revenue:ex.revenue||0, marketingCost:ex.marketingCost||0 });
  };

  const handleSave = () => {
    const updated = monthlyData.filter(d => d.month !== form.month);
    const newData = [...updated, {
      ...form,
      inquiry:+form.inquiry, consult:+form.consult, reservation:+form.reservation,
      visit:+form.visit, payment:+form.payment, newPatient:+form.newPatient,
      revenue:+form.revenue, marketingCost:+form.marketingCost
    }].sort((a,b) => a.month > b.month ? 1 : -1);
    onSave(newData);
    setSavedMsg("저장 완료!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const fields = [
    { key:"inquiry", label:"문의 수", unit:"건" },
    { key:"consult", label:"상담 수", unit:"건" },
    { key:"reservation", label:"예약 수", unit:"건" },
    { key:"visit", label:"내원 수", unit:"명" },
    { key:"payment", label:"결제 수", unit:"건" },
    { key:"newPatient", label:"신환 수", unit:"명" },
    { key:"revenue", label:"매출", unit:"만원" },
    { key:"marketingCost", label:"마케팅비", unit:"만원" },
  ];

  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24, marginBottom:20 }}>
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
          {YEARS.map(y => <option key={y} value={y} style={{background:"#0F172A"}}>{y}년</option>)}
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
      <button onClick={handleSave} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#fff", borderRadius:9, padding:"10px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>
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
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24, marginBottom:20 }}>
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
        <button onClick={handleSave} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#fff", borderRadius:9, padding:"10px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>
          저장하기
        </button>
      </div>
    </div>
  );
}

// ─── 월간 체크리스트 탭 ──────────────────────────────────────
function ChecklistTab({ hospital }) {
  const [selMonth, setSelMonth] = useState(CL_CURRENT_MONTH);
  const [allData, setAllData] = useState(() => ({
    [CL_CURRENT_MONTH]: {
      checks: { place:true, kakao:true, meeting:true },
      counts: { blog:0, insta:0, youtube:0 },
      targets: { blogTarget:8, instaTarget:12, youtubeTarget:2 },
      memo: "",
    }
  }));
  const [showMemo, setShowMemo] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [showTargetEdit, setShowTargetEdit] = useState(false);

  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 1500); };

  const monthData = allData[selMonth] || {
    checks: {}, counts: {}, targets: { blogTarget:8, instaTarget:12, youtubeTarget:2 }, memo:""
  };

  const update = (patch) => {
    setAllData(prev => ({ ...prev, [selMonth]: { ...monthData, ...patch } }));
  };

  const toggleCheck = (id) => {
    update({ checks: { ...monthData.checks, [id]: !monthData.checks[id] } });
    toast("저장됨!");
  };

  const setCount = (id, val) => {
    update({ counts: { ...monthData.counts, [id]: +val || 0 } });
  };

  const setTarget = (key, val) => {
    update({ targets: { ...monthData.targets, [key]: +val || 0 } });
  };

  const totalItems = DEFAULT_CHECKLIST_ITEMS.length;
  const doneItems = DEFAULT_CHECKLIST_ITEMS.filter(item => monthData.checks[item.id]).length;
  const doneRate = Math.round((doneItems / totalItems) * 100);

  const monthList = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0,7);
  });
  const prevMonthYm = monthList[1];
  const prevData = allData[prevMonthYm];
  const prevDone = prevData ? DEFAULT_CHECKLIST_ITEMS.filter(item => prevData.checks[item.id]).length : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 월 선택 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ color:C.muted, fontSize:13 }}>조회 월:</span>
          {monthList.map(ym => (
            <button key={ym} onClick={() => setSelMonth(ym)} style={{
              background: selMonth===ym ? `${hospital.color}25` : "transparent",
              border: `1px solid ${selMonth===ym ? hospital.color : C.border}`,
              color: selMonth===ym ? hospital.color : C.muted,
              borderRadius:8, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
            }}>{CL_MONTH_LABEL(ym)}</button>
          ))}
        </div>
        <button onClick={() => setShowTargetEdit(!showTargetEdit)} style={{
          background: showTargetEdit ? `${hospital.color}20` : "transparent",
          border: `1px solid ${showTargetEdit ? hospital.color : C.border}`,
          color: showTargetEdit ? hospital.color : C.muted,
          borderRadius:8, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
        }}>⚙ 목표 설정</button>
      </div>

      {/* 목표 설정 패널 */}
      {showTargetEdit && (
        <div style={{ background:`${hospital.color}06`, border:`1px solid ${hospital.color}25`, borderRadius:14, padding:18 }}>
          <div style={{ color:C.text, fontSize:13, fontWeight:700, marginBottom:12 }}>콘텐츠 월 목표 건수</div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[
              { label:"블로그 목표", key:"blogTarget" },
              { label:"인스타 목표", key:"instaTarget" },
              { label:"유튜브 목표", key:"youtubeTarget" },
            ].map(f => (
              <div key={f.key} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <label style={{ color:C.muted, fontSize:12, width:90 }}>{f.label}</label>
                <input type="number" value={monthData.targets[f.key]||""} onChange={e => setTarget(f.key, e.target.value)}
                  style={{ ...inputSt, width:70, padding:"5px 10px", fontSize:13 }} placeholder="8" />
                <span style={{ color:C.muted, fontSize:12 }}>건</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 진행률 카드 */}
      <div style={{ background:C.surface, border:`1px solid ${hospital.color}30`, borderRadius:16, padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div style={{ color:C.text, fontSize:15, fontWeight:800 }}>{CL_MONTH_LABEL(selMonth)} 업무 현황</div>
            <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>
              {doneItems}/{totalItems} 완료
              {prevDone !== null && (
                <span style={{ marginLeft:10, color:doneItems>=prevDone?C.green:C.muted, fontWeight:600 }}>
                  {doneItems>prevDone ? `▲ 전월보다 ${doneItems-prevDone}개 더 완료` : doneItems<prevDone ? `▼ 전월보다 ${prevDone-doneItems}개 덜 완료` : "전월과 동일"}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:doneRate===100?C.green:doneRate>=70?C.yellow:hospital.color, fontSize:36, fontWeight:900, lineHeight:1 }}>{doneRate}<span style={{ fontSize:18 }}>%</span></div>
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>완료율</div>
          </div>
        </div>
        <div style={{ background:C.dim, borderRadius:8, height:12, overflow:"hidden" }}>
          <div style={{ width:`${doneRate}%`, height:"100%", background:`linear-gradient(90deg,${hospital.color},${C.accent2})`, borderRadius:8, transition:"width 0.4s" }} />
        </div>
        {doneRate === 100 && (
          <div style={{ marginTop:12, color:C.green, fontSize:13, fontWeight:700, textAlign:"center" }}>
            이달 모든 업무 완료! 수고하셨어요 🎉
          </div>
        )}
      </div>

      {/* 체크리스트 그룹별 2x2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {CL_GROUPS.map(group => {
          const groupItems = DEFAULT_CHECKLIST_ITEMS.filter(i => i.group === group);
          const groupColor = CL_GROUP_COLORS[group];
          const groupDone = groupItems.filter(i => monthData.checks[i.id]).length;
          return (
            <div key={group} style={{ background:C.surface, border:`1px solid ${groupColor}25`, borderRadius:16, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:3, height:16, background:groupColor, borderRadius:2 }} />
                  <span style={{ color:groupColor, fontSize:13, fontWeight:800 }}>{group}</span>
                </div>
                <span style={{ color:groupDone===groupItems.length?groupColor:C.muted, fontSize:12, fontWeight:700 }}>
                  {groupDone}/{groupItems.length} {groupDone===groupItems.length?"✓":""}
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {groupItems.map(item => {
                  const done = !!monthData.checks[item.id];
                  const hasCount = item.targetKey !== null;
                  const count = monthData.counts[item.id] || 0;
                  const target = monthData.targets[item.targetKey] || 0;
                  const countRate = target > 0 ? Math.min(Math.round((count/target)*100), 100) : null;
                  return (
                    <div key={item.id} style={{
                      background: done ? `${groupColor}10` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${done ? groupColor+"40" : C.dim}`,
                      borderRadius:10, padding:"12px 14px", transition:"all 0.15s",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div onClick={() => toggleCheck(item.id)} style={{
                          width:24, height:24, borderRadius:7, flexShrink:0, cursor:"pointer",
                          background: done ? groupColor : "transparent",
                          border: `2px solid ${done ? groupColor : C.dim}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all 0.15s",
                        }}>
                          {done && <span style={{ color:"#fff", fontSize:14, fontWeight:900, lineHeight:1 }}>✓</span>}
                        </div>
                        <span style={{ fontSize:13, color:done?C.text:C.muted, fontWeight:done?700:400, flex:1 }}>
                          {item.icon} {item.label}
                        </span>
                        {done && <Badge color={groupColor}>완료</Badge>}
                      </div>
                      {hasCount && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.dim}` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ color:C.muted, fontSize:11, flexShrink:0 }}>발행 건수</span>
                            <input type="number" value={count||""} onChange={e => setCount(item.id, e.target.value)}
                              placeholder="0" style={{ ...inputSt, width:60, padding:"4px 8px", fontSize:12 }} />
                            <span style={{ color:C.muted, fontSize:11 }}>/ 목표 {target}건</span>
                            {countRate !== null && (
                              <span style={{ color:countRate>=100?groupColor:countRate>=50?C.yellow:C.muted, fontSize:12, fontWeight:700, marginLeft:"auto" }}>
                                {countRate}%
                              </span>
                            )}
                          </div>
                          {target > 0 && (
                            <div style={{ marginTop:6, background:C.dim, borderRadius:3, height:5 }}>
                              <div style={{ width:`${countRate||0}%`, height:"100%", background:groupColor, borderRadius:3, transition:"width 0.3s" }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 메모 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <SectionTitle>이달의 메모</SectionTitle>
          <button onClick={() => setShowMemo(!showMemo)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>
            {showMemo ? "닫기" : "편집"}
          </button>
        </div>
        {showMemo ? (
          <textarea value={monthData.memo||""} onChange={e => update({ memo: e.target.value })}
            placeholder="이달 특이사항, 다음달 계획 등 자유롭게 메모하세요"
            style={{ ...inputSt, height:90, resize:"vertical", lineHeight:1.7 }} />
        ) : (
          <div style={{ color:monthData.memo?C.text:C.muted, fontSize:13, lineHeight:1.7, minHeight:36 }}>
            {monthData.memo || "메모 없음 — 편집 버튼을 눌러 추가하세요"}
          </div>
        )}
      </div>

      {/* 월별 완료율 히스토리 바 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
        <SectionTitle>월별 완료율 히스토리</SectionTitle>
        <div style={{ display:"flex", gap:10, marginTop:8, alignItems:"flex-end" }}>
          {[...monthList].reverse().map(ym => {
            const d = allData[ym];
            const done = d ? DEFAULT_CHECKLIST_ITEMS.filter(item => d.checks[item.id]).length : 0;
            const rate = Math.round((done/totalItems)*100);
            const isSelected = ym === selMonth;
            return (
              <div key={ym} onClick={() => setSelMonth(ym)} style={{ flex:1, cursor:"pointer", textAlign:"center" }}>
                <div style={{ color:isSelected?hospital.color:C.muted, fontSize:12, fontWeight:isSelected?700:400, marginBottom:6 }}>
                  {rate > 0 ? `${rate}%` : "-"}
                </div>
                <div style={{ background:C.dim, borderRadius:6, height:80, position:"relative", overflow:"hidden" }}>
                  <div style={{
                    position:"absolute", bottom:0, left:0, right:0,
                    height:`${rate}%`,
                    background: isSelected
                      ? `linear-gradient(180deg,${hospital.color},${hospital.color}88)`
                      : `linear-gradient(180deg,${C.accent2}66,${C.accent2}33)`,
                    transition:"height 0.4s",
                  }} />
                </div>
                <div style={{ color:C.muted, fontSize:10, marginTop:6 }}>{CL_MONTH_LABEL(ym)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 마케팅 현황 탭 ───────────────────────────────────────────
function MarketingTab({ hospital, chData, initialContents }) {
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
  const [channelRevenue, setChannelRevenue] = useState({});
  const [showRevenueInput, setShowRevenueInput] = useState(false);

  // 월 목록 (콘텐츠에서 추출 + 전체)
  const monthList = useMemo(() => {
    const months = [...new Set(contents.map(c => c.date?.slice(0,7)).filter(Boolean))].sort().reverse();
    return ["전체", ...months];
  }, [contents]);

  // 월 필터 적용된 콘텐츠
  const monthFiltered = useMemo(() =>
    selMonth === "전체" ? contents : contents.filter(c => c.date?.startsWith(selMonth))
  , [contents, selMonth]);

  const allChannels = ["전체", ...Array.from(new Set(monthFiltered.map(c => c.channel)))];

  const saveAll = (newContents) => {
    setContents(newContents);
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
      const revenue = channelRevenue[ch] || 0;
      return { channel: ch, color: meta.color, posts: items.length, totalClicks: items.reduce((s,i) => s+(i.clicks||0), 0), inflow: perf.inflow || 0, revenue };
    });
  }, [monthFiltered, chData, channelRevenue]);

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

      {/* 채널별 요약 카드 */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ color:C.muted, fontSize:12 }}>
            {selMonth === "전체" ? "전체" : `${+selMonth.slice(5)}월`} · 콘텐츠가 등록된 채널 <span style={{ color:hospital.color, fontWeight:700 }}>{channelStats.length}개</span>
          </div>
          <button onClick={() => setShowRevenueInput(!showRevenueInput)} style={{
            background: showRevenueInput ? `${hospital.color}20` : "transparent",
            border:`1px solid ${showRevenueInput ? hospital.color : C.border}`,
            color: showRevenueInput ? hospital.color : C.muted,
            borderRadius:8, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600,
          }}>채널별 매출 입력</button>
        </div>

        {/* 매출 입력 패널 */}
        {showRevenueInput && (
          <div style={{ background:`${hospital.color}06`, border:`1px solid ${hospital.color}25`, borderRadius:14, padding:18, marginBottom:14 }}>
            <div style={{ color:C.text, fontSize:13, fontWeight:700, marginBottom:12 }}>채널별 이번달 매출 입력 (만원)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10 }}>
              {[...new Set(contents.map(c => c.channel))].map(ch => {
                const meta = CHANNEL_META[ch] || { color: C.muted };
                return (
                  <div key={ch} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:meta.color, flexShrink:0 }} />
                    <label style={{ color:C.muted, fontSize:12, width:90, flexShrink:0 }}>{ch}</label>
                    <input
                      type="number"
                      value={channelRevenue[ch] || ""}
                      onChange={e => setChannelRevenue(prev => ({ ...prev, [ch]: +e.target.value || 0 }))}
                      placeholder="0"
                      style={{ ...inputSt, width:80, padding:"5px 8px", fontSize:12 }}
                    />
                  </div>
                );
              })}
            </div>
            {contents.length === 0 && (
              <div style={{ color:C.muted, fontSize:12, marginTop:8 }}>콘텐츠를 먼저 등록하면 채널이 표시돼요.</div>
            )}
          </div>
        )}

        {/* 채널 카드 */}
        {channelStats.length === 0
          ? <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:14, padding:"32px", textAlign:"center", color:C.muted, fontSize:13 }}>
              아래 콘텐츠 관리에서 콘텐츠를 추가하면 채널 요약이 자동으로 나타나요
            </div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:14 }}>
              {channelStats.map((ch, i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${contentFilter===ch.channel ? ch.color : ch.color+"30"}`, borderRadius:14, padding:"16px 18px", cursor:"pointer", transition:"all 0.15s",
                  boxShadow: contentFilter===ch.channel ? `0 0 0 2px ${ch.color}40` : "none" }}
                  onClick={() => setContentFilter(prev => prev === ch.channel ? "전체" : ch.channel)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ color:ch.color, fontWeight:800, fontSize:13 }}>{ch.channel}</div>
                    {contentFilter === ch.channel && <div style={{ width:6, height:6, borderRadius:"50%", background:ch.color }} />}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {[
                      { label:"발행",  value:`${ch.posts}건` },
                      { label:"클릭",  value: ch.totalClicks >= 1000 ? `${(ch.totalClicks/1000).toFixed(1)}K` : String(ch.totalClicks) },
                      { label:"유입",  value: ch.inflow ? String(ch.inflow) : "-" },
                      { label:"매출",  value: ch.revenue > 0 ? `${ch.revenue}만` : "-" },
                    ].map((it,j) => (
                      <div key={j} style={{ background:"rgba(255,255,255,0.03)", borderRadius:7, padding:"6px 8px" }}>
                        <div style={{ color:C.muted, fontSize:10, marginBottom:2 }}>{it.label}</div>
                        <div style={{ color: it.label==="매출" && ch.revenue>0 ? C.yellow : C.text, fontSize:13, fontWeight:700 }}>{it.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* 차트 */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:22 }}>
        <SectionTitle>채널 성과 비교</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={channelStats} margin={{ top:5, right:20, left:0, bottom:20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.dim} />
            <XAxis dataKey="channel" stroke={C.muted} tick={{ fill:C.muted, fontSize:11, angle:-15, textAnchor:"end" }} />
            <YAxis stroke={C.muted} tick={{ fill:C.muted, fontSize:11 }} />
            <TT />
            <Legend wrapperStyle={{ color:C.muted, fontSize:12 }} />
            <Bar dataKey="totalClicks" name="총 클릭수" fill={hospital.color} radius={[4,4,0,0]} opacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
            color: showForm && !editId ? C.red : "#fff",
            borderRadius:10, padding:"9px 18px", fontSize:13, cursor:"pointer", fontWeight:700,
          }}>{showForm && !editId ? "닫기" : editId ? "취소" : "+ 콘텐츠 추가"}</button>
        </div>

        {showForm && (
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${hospital.color}30`, borderRadius:14, padding:20, marginBottom:20 }}>
            <div style={{ color:hospital.color, fontSize:13, fontWeight:700, marginBottom:14 }}>{editId ? "콘텐츠 수정" : "새 콘텐츠 추가"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))", gap:12, marginBottom:12 }}>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>채널 *</label>
                <select value={form.channel} onChange={e=>setForm(prev => ({...prev, channel:e.target.value}))} style={{...inputSt,appearance:"none"}}>
                  {CHANNEL_OPTIONS.map(o=><option key={o} style={{background:"#0F172A"}}>{o}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>발행일 *</label>
                <input type="date" value={form.date} onChange={e=>setForm(prev => ({...prev, date:e.target.value}))} style={inputSt}/>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>상태</label>
                <select value={form.status} onChange={e=>setForm(prev => ({...prev, status:e.target.value}))} style={{...inputSt,appearance:"none"}}>
                  {STATUS_OPTIONS.map(o=><option key={o} style={{background:"#0F172A"}}>{o}</option>)}
                </select>
              </div>
              <div><label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:5 }}>노출 순위</label>
                <input type="number" placeholder="2" value={form.rank} onChange={e=>setForm(prev => ({...prev, rank:e.target.value}))} style={inputSt}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
                <div onClick={()=>setForm(prev => ({...prev, topExposed:!form.topExposed}))} style={{ width:40, height:22, borderRadius:11, background:form.topExposed?C.green:C.dim, cursor:"pointer", position:"relative" }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:form.topExposed?20:2, transition:"left 0.2s" }}/>
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
              <button onClick={editId ? handleUpdate : handleAdd} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#fff", borderRadius:10, padding:"9px 24px", fontSize:13, cursor:"pointer", fontWeight:700 }}>{editId ? "수정 완료" : "저장하기"}</button>
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
          <button onClick={openAdd} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#fff",borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 월 데이터 추가</button>
        </div>
      </div>

      {showForm && formData && (
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${hospital.color}30`,borderRadius:16,padding:24}}>
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
            <button onClick={handleSave} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#fff",borderRadius:9,padding:"10px 24px",fontSize:13,cursor:"pointer",fontWeight:700}}>저장하기</button>
            <button onClick={()=>setShowForm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {!rec && !showForm && (
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:48,textAlign:"center"}}>
          <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:8}}>이 달의 환자 데이터가 없어요</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:20}}>월 데이터 추가 버튼을 눌러 입력해 보세요</div>
          <button onClick={openAdd} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#fff",borderRadius:10,padding:"10px 24px",fontSize:13,cursor:"pointer",fontWeight:700}}>데이터 입력하기</button>
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
              {achieveRate>10&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>{totalNew}명</span>}
            </div>
          </div>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
          <SectionTitle>환자 유입 추이</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.dim}/>
              <XAxis dataKey="month" stroke={C.muted} tick={{fill:C.muted,fontSize:11}}/>
              <YAxis stroke={C.muted} tick={{fill:C.muted,fontSize:11}}/>
              <TT/><Legend wrapperStyle={{color:C.muted,fontSize:12}}/>
              <Line type="monotone" dataKey="신환" stroke={hospital.color} strokeWidth={2.5} dot={{r:4,fill:hospital.color}}/>
              <Line type="monotone" dataKey="구환" stroke={C.accent2} strokeWidth={2} dot={{r:4,fill:C.accent2}}/>
              <Line type="monotone" dataKey="목표" stroke={C.dim} strokeWidth={1.5} strokeDasharray="5 5" dot={false}/>
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
                <CartesianGrid strokeDasharray="3 3" stroke={C.dim}/>
                <XAxis dataKey="item" stroke={C.muted} tick={{fill:C.muted,fontSize:11,angle:-15,textAnchor:"end"}}/>
                <YAxis stroke={C.muted} tick={{fill:C.muted,fontSize:11}}/>
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

// ─── 키워드 현황 탭 ──────────────────────────────────────────
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

      // 같은 월 데이터는 교체, 다른 월은 유지
      const uploadedMonths = [...new Set(parsed.map(r => r.month))];
      const kept = keywords.filter(k => !uploadedMonths.includes(k.month));
      const newData = [...kept, ...parsed];
      setKeywords(newData);
      saveKeywords(newData);
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
              background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#fff",
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
                <tr style={{ background:"rgba(255,255,255,0.04)", borderBottom:`1px solid ${C.border}` }}>
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

function MeetingTab({ hospital }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_MEETING);
  const [newAction, setNewAction] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toast = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  // 액션아이템 추가
  const addAction = () => {
    if (!newAction.trim()) return;
    setForm(prev => ({ ...prev, actions: [...prev.actions, { id: Date.now(), text: newAction.trim(), done: false }] }));
    setNewAction("");
  };

  // 액션아이템 삭제 (폼에서)
  const removeAction = (id) => {
    setForm(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));
  };

  // 액션아이템 체크 토글 (저장된 로그에서 직접)
  const toggleActionDone = (logId, actionId) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, actions: l.actions.map(a => a.id === actionId ? { ...a, done: !a.done } : a) }
      : l
    ));
  };

  const handleAdd = () => {
    if (!form.date || !form.summary) return;
    const newLog = { ...form, id: Date.now() };
    setLogs(prev => [newLog, ...prev].sort((a, b) => b.date > a.date ? 1 : -1));
    setForm(EMPTY_MEETING); setNewAction(""); setShowForm(false); toast("미팅 로그 저장 완료!");
  };

  const handleEdit = (log) => {
    setEditId(log.id); setForm({ ...log, actions: [...log.actions] }); setShowForm(true);
  };

  const handleUpdate = () => {
    setLogs(prev => prev.map(l => l.id === editId ? { ...form, id: editId } : l)
      .sort((a, b) => b.date > a.date ? 1 : -1));
    setEditId(null); setForm(EMPTY_MEETING); setNewAction(""); setShowForm(false); toast("수정 완료!");
  };

  const handleDelete = (id) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    setDeleteConfirm(null); toast("삭제 완료");
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_MEETING); setNewAction(""); };

  // 월 선택 필터
  const meetingMonthList = useMemo(() => {
    const months = [...new Set(logs.map(l => l.date?.slice(0,7)).filter(Boolean))].sort().reverse();
    return ["전체", ...months];
  }, [logs]);
  const [selMeetingMonth, setSelMeetingMonth] = useState("전체");

  const filteredLogs = useMemo(() =>
    selMeetingMonth === "전체" ? logs : logs.filter(l => l.date?.startsWith(selMeetingMonth))
  , [logs, selMeetingMonth]);

  // 최근 미팅 날짜
  const lastMeeting = logs[0];
  const daysSince = lastMeeting
    ? Math.floor((new Date() - new Date(lastMeeting.date)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Toast msg={savedMsg} />

      {/* 월 선택 + 추가 버튼 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ color:C.muted, fontSize:12, flexShrink:0 }}>조회 월:</span>
          <button onClick={() => setSelMeetingMonth("전체")} style={{
            background: selMeetingMonth==="전체" ? `${hospital.color}25` : "transparent",
            border: `1px solid ${selMeetingMonth==="전체" ? hospital.color : C.border}`,
            color: selMeetingMonth==="전체" ? hospital.color : C.muted,
            borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600,
          }}>전체</button>
          <YearMonthSelector
            availMonths={meetingMonthList.filter(m => m !== "전체")}
            selMonth={selMeetingMonth === "전체" ? "" : selMeetingMonth}
            setSelMonth={setSelMeetingMonth}
            color={hospital.color}
          />
        </div>
        <button onClick={() => { cancelForm(); setShowForm(!showForm); }} style={{
          background: showForm && !editId ? "rgba(248,113,113,0.15)" : `linear-gradient(135deg,${hospital.color},${C.accent2})`,
          border: showForm && !editId ? `1px solid ${C.red}` : "none",
          color: showForm && !editId ? C.red : "#fff",
          borderRadius:10, padding:"9px 20px", fontSize:13, cursor:"pointer", fontWeight:700,
        }}>{showForm && !editId ? "닫기" : "+ 미팅 로그 추가"}</button>
      </div>

      {/* 요약 카드 */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {[
          { label: selMeetingMonth==="전체" ? "총 미팅" : `${+selMeetingMonth.slice(5)}월 미팅`, value:`${filteredLogs.length}회`, color:hospital.color },
          { label:"최근 미팅", value: daysSince !== null ? `${daysSince}일 전` : "-", color: daysSince !== null && daysSince > 30 ? C.red : C.green },
          { label:"대면", value:`${filteredLogs.filter(l=>l.type==="대면").length}회`, color:MEETING_TYPE_COLORS["대면"] },
          { label:"전화", value:`${filteredLogs.filter(l=>l.type==="전화").length}회`, color:MEETING_TYPE_COLORS["전화"] },
          { label:"화상", value:`${filteredLogs.filter(l=>l.type==="화상").length}회`, color:MEETING_TYPE_COLORS["화상"] },
          { label:"메신저", value:`${filteredLogs.filter(l=>l.type==="메신저").length}회`, color:MEETING_TYPE_COLORS["메신저"] },
        ].map((item, i) => (
          <div key={i} style={{ background:C.surface, border:`1px solid ${item.color}25`, borderRadius:10, padding:"10px 16px", textAlign:"center" }}>
            <div style={{ color:C.muted, fontSize:10, marginBottom:3 }}>{item.label}</div>
            <div style={{ color:item.color, fontSize:15, fontWeight:800 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${hospital.color}30`, borderRadius:16, padding:24 }}>
          <div style={{ color:hospital.color, fontSize:14, fontWeight:700, marginBottom:16 }}>
            {editId ? "미팅 로그 수정" : "새 미팅 로그"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>날짜 *</label>
              <input type="date" value={form.date} onChange={e => setForm(prev => ({...prev, date:e.target.value}))} style={inputSt} />
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>미팅 방식</label>
              <div style={{ display:"flex", gap:6 }}>
                {MEETING_TYPES.map(t => (
                  <button key={t} onClick={() => setForm(prev => ({...prev, type:t}))} style={{
                    flex:1, background: form.type===t ? `${MEETING_TYPE_COLORS[t]}25` : "transparent",
                    border: `1px solid ${form.type===t ? MEETING_TYPE_COLORS[t] : C.dim}`,
                    color: form.type===t ? MEETING_TYPE_COLORS[t] : C.muted,
                    borderRadius:7, padding:"7px 0", fontSize:12, cursor:"pointer", fontWeight:600,
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>참석자</label>
              <KInput value={form.attendees} onChange={e => setForm(prev => ({...prev, attendees:e.target.value}))}
                placeholder="예: 임지혜, 원장님" style={inputSt} />
            </div>
            <div>
              <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>참고 링크</label>
              <input value={form.link} onChange={e => setForm(prev => ({...prev, link:e.target.value}))}
                placeholder="https://..." style={inputSt} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>주요 논의 내용 *</label>
            <textarea value={form.summary}
              onChange={e => setForm(prev => ({...prev, summary:e.target.value}))}
              placeholder="이번 미팅에서 논의한 주요 내용을 입력하세요"
              style={{ ...inputSt, height:90, resize:"vertical", lineHeight:1.7 }} />
          </div>

          {/* 이미지 첨부 */}
          <div style={{ marginBottom:12 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:6 }}>이미지 첨부 <span style={{ color:C.muted, fontWeight:400 }}>(최대 3장, 각 1MB 이하)</span></label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-start" }}>
              {(form.images||[]).map((img, idx) => (
                <div key={idx} style={{ position:"relative", width:80, height:80 }}>
                  <img src={img} alt="" style={{ width:80, height:80, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}` }} />
                  <div onClick={() => setForm(prev => ({...prev, images: prev.images.filter((_,i)=>i!==idx)}))}
                    style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:C.red, color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>×</div>
                </div>
              ))}
              {(form.images||[]).length < 3 && (
                <label style={{ width:80, height:80, border:`2px dashed ${C.border}`, borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:11, gap:4 }}>
                  <span style={{ fontSize:20 }}>+</span>
                  <span>사진 추가</span>
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 1024*1024) { alert("1MB 이하 이미지만 첨부 가능해요"); return; }
                    const reader = new FileReader();
                    reader.onload = ev => setForm(prev => ({...prev, images: [...(prev.images||[]), ev.target.result]}));
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
              )}
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:8 }}>결정사항 / 액션아이템</label>
            {/* 추가된 항목들 */}
            {form.actions.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:8 }}>
                {form.actions.map(action => (
                  <div key={action.id} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 12px" }}>
                    <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, background:action.done?C.green:"transparent", border:`2px solid ${action.done?C.green:C.dim}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {action.done && <span style={{ color:"#fff", fontSize:11, fontWeight:900 }}>✓</span>}
                    </div>
                    <span style={{ flex:1, color:C.text, fontSize:12 }}>{action.text}</span>
                    <span onClick={() => removeAction(action.id)} style={{ color:C.dim, cursor:"pointer", fontSize:16, fontWeight:700, lineHeight:1 }}>×</span>
                  </div>
                ))}
              </div>
            )}
            {/* 새 항목 입력 */}
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addAction()}
                placeholder="액션아이템 입력 후 Enter 또는 추가 버튼"
                style={{ ...inputSt, flex:1, padding:"7px 12px", fontSize:12 }}
              />
              <button onClick={addAction} style={{ background:`${hospital.color}20`, border:`1px solid ${hospital.color}`, color:hospital.color, borderRadius:8, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:700, flexShrink:0 }}>+ 추가</button>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:C.muted, fontSize:11, display:"block", marginBottom:4 }}>메모</label>
            <KInput value={form.memo} onChange={e => setForm(prev => ({...prev, memo:e.target.value}))}
              placeholder="기타 특이사항" style={inputSt} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={editId ? handleUpdate : handleAdd}
              disabled={!form.date || !form.summary}
              style={{
                background: form.date && form.summary ? `linear-gradient(135deg,${hospital.color},${C.accent2})` : C.dim,
                border:"none", color:"#fff", borderRadius:9, padding:"10px 24px",
                fontSize:13, cursor: form.date && form.summary ? "pointer" : "not-allowed", fontWeight:700,
              }}>{editId ? "수정 완료" : "저장하기"}</button>
            <button onClick={cancelForm} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:9, padding:"10px 16px", fontSize:13, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}

      {/* 로그 목록 */}
      {filteredLogs.length === 0 ? (
        <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:16, padding:48, textAlign:"center" }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:700, marginBottom:8 }}>
            {selMeetingMonth === "전체" ? "미팅 로그가 없어요" : `${+selMeetingMonth.slice(5)}월 미팅 로그가 없어요`}
          </div>
          <div style={{ color:C.muted, fontSize:13 }}>
            {selMeetingMonth === "전체" ? "위 버튼을 눌러 첫 미팅 로그를 추가해 보세요" : "다른 월을 선택하거나 새 로그를 추가해 보세요"}
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filteredLogs.map((log, i) => {
            const isExpanded = expandedId === log.id;
            const typeColor = MEETING_TYPE_COLORS[log.type] || C.muted;
            const isRecent = log.id === logs[0]?.id;
            return (
              <div key={log.id} style={{
                background: C.surface,
                border: `1px solid ${isExpanded ? hospital.color+"60" : C.border}`,
                borderRadius:14, overflow:"hidden", transition:"all 0.2s",
              }}>
                {/* 로그 헤더 - 클릭해서 펼치기 */}
                <div onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{ padding:"16px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                  {/* 날짜 */}
                  <div style={{ flexShrink:0, textAlign:"center", width:52 }}>
                    <div style={{ color:hospital.color, fontSize:18, fontWeight:900, lineHeight:1 }}>
                      {log.date.slice(8)}
                    </div>
                    <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>
                      {log.date.slice(0,7).replace("-",".")}
                    </div>
                  </div>
                  <div style={{ width:1, height:36, background:C.dim, flexShrink:0 }} />
                  {/* 방식 배지 */}
                  <Badge color={typeColor}>{log.type}</Badge>
                  {/* 요약 */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:C.text, fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {log.summary}
                    </div>
                    {log.attendees && (
                      <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>👥 {log.attendees}</div>
                    )}
                  </div>
                  {isRecent && <Badge color={C.green}>최신</Badge>}
                  {log.actions.length > 0 && (() => {
                    const done = log.actions.filter(a => a.done).length;
                    const total = log.actions.length;
                    const allDone = done === total;
                    return <Badge color={allDone ? C.green : C.yellow}>{done}/{total}</Badge>;
                  })()}
                  <span style={{ color:C.muted, fontSize:16, flexShrink:0 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* 펼쳐진 상세 내용 */}
                {isExpanded && (
                  <div style={{ padding:"0 20px 20px", borderTop:`1px solid ${C.dim}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:16 }}>
                      {/* 주요 논의 내용 */}
                      <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:14 }}>
                        <div style={{ color:C.muted, fontSize:11, fontWeight:700, marginBottom:8 }}>📋 주요 논의 내용</div>
                        <div style={{ color:C.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{log.summary}</div>
                        {log.images && log.images.length > 0 && (
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                            {log.images.map((img, idx) => (
                              <img key={idx} src={img} alt="" onClick={() => window.open(img, "_blank")}
                                style={{ width:72, height:72, objectFit:"cover", borderRadius:8, border:`1px solid ${C.border}`, cursor:"pointer" }} />
                            ))}
                          </div>
                        )}
                      </div>
                      {/* 결정사항 / 액션아이템 */}
                      <div style={{ background:`${hospital.color}08`, border:`1px solid ${hospital.color}20`, borderRadius:10, padding:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <div style={{ color:hospital.color, fontSize:11, fontWeight:700 }}>✅ 결정사항 / 액션아이템</div>
                          {log.actions.length > 0 && (
                            <div style={{ color:C.muted, fontSize:11 }}>
                              {log.actions.filter(a=>a.done).length}/{log.actions.length} 완료
                            </div>
                          )}
                        </div>
                        {log.actions.length === 0 ? (
                          <div style={{ color:C.muted, fontSize:12 }}>없음</div>
                        ) : (
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {log.actions.map(action => (
                              <div key={action.id}
                                onClick={() => toggleActionDone(log.id, action.id)}
                                style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                                  padding:"6px 8px", borderRadius:7,
                                  background: action.done ? `${C.green}10` : "transparent",
                                  transition:"background 0.15s",
                                }}>
                                <div style={{
                                  width:20, height:20, borderRadius:6, flexShrink:0,
                                  background: action.done ? C.green : "transparent",
                                  border: `2px solid ${action.done ? C.green : C.dim}`,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  transition:"all 0.15s",
                                }}>
                                  {action.done && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✓</span>}
                                </div>
                                <span style={{
                                  flex:1, fontSize:13, lineHeight:1.5,
                                  color: action.done ? C.muted : C.text,
                                  textDecoration: action.done ? "line-through" : "none",
                                  transition:"all 0.15s",
                                }}>{action.text}</span>
                              </div>
                            ))}
                            {/* 완료율 바 */}
                            {log.actions.length > 1 && (
                              <div style={{ marginTop:4, background:C.dim, borderRadius:3, height:4 }}>
                                <div style={{
                                  width:`${Math.round((log.actions.filter(a=>a.done).length / log.actions.length)*100)}%`,
                                  height:"100%", background:C.green, borderRadius:3, transition:"width 0.3s"
                                }}/>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 링크 / 메모 */}
                    {(log.link || log.memo) && (
                      <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
                        {log.link && (
                          <a href={log.link} target="_blank" rel="noreferrer"
                            style={{ color:C.accent, fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                            🔗 참고 링크
                          </a>
                        )}
                        {log.memo && (
                          <div style={{ color:C.muted, fontSize:12 }}>📝 {log.memo}</div>
                        )}
                      </div>
                    )}
                    {/* 수정 / 삭제 버튼 */}
                    <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.dim}` }}>
                      <button onClick={() => handleEdit(log)} style={{ background:`${hospital.color}20`, border:`1px solid ${hospital.color}40`, color:hospital.color, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>수정</button>
                      {deleteConfirm === log.id ? (
                        <>
                          <button onClick={() => handleDelete(log.id)} style={{ background:`${C.red}20`, border:`1px solid ${C.red}`, color:C.red, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:700 }}>삭제 확인</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>취소</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(log.id)} style={{ background:"transparent", border:`1px solid ${C.dim}`, color:C.muted, borderRadius:7, padding:"5px 14px", fontSize:12, cursor:"pointer" }}>삭제</button>
                      )}
                    </div>
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

// ─── 비용 관리 탭 ─────────────────────────────────────────────
const COST_CATEGORIES = [
  { id:"marketing_blog",   label:"마케팅 - 블로그",     group:"마케팅", color:"#03C75A" },
  { id:"marketing_insta",  label:"마케팅 - 인스타그램", group:"마케팅", color:"#E1306C" },
  { id:"marketing_youtube",label:"마케팅 - 유튜브",     group:"마케팅", color:"#FF0000" },
  { id:"marketing_cafe",   label:"마케팅 - 네이버카페", group:"마케팅", color:"#0088FE" },
  { id:"marketing_search", label:"마케팅 - 검색광고",   group:"마케팅", color:"#A78BFA" },
  { id:"marketing_meta",   label:"마케팅 - 메타광고",   group:"마케팅", color:"#4ECDC4" },
  { id:"design",           label:"디자인물",             group:"디자인", color:"#FBBF24" },
  { id:"cs",               label:"CS 경영지원",          group:"CS",     color:"#FB923C" },
];

function CostTab({ hospital, hData }) {
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

  const toast = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),2200); };

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
    if (exists) setContracts(contracts.map(c=>c.month===contractForm.month?{...c,amount:+contractForm.amount}:c));
    else setContracts([...contracts,{month:contractForm.month,amount:+contractForm.amount}].sort((a,b)=>a.month>b.month?1:-1));
    setShowContractForm(false); toast("계약금 저장 완료!");
  };

  const handleSaveExpense = () => {
    if (!expenseForm.month||!expenseForm.amount||!expenseForm.category) return;
    if (editExpId) { setExpenses(expenses.map(e=>e.id===editExpId?{...expenseForm,id:editExpId,amount:+expenseForm.amount}:e)); setEditExpId(null); toast("수정 완료!"); }
    else { setExpenses([{...expenseForm,id:Date.now(),amount:+expenseForm.amount},...expenses]); toast("저장 완료!"); }
    setExpenseForm({month:selMonth,category:"marketing_blog",amount:"",memo:"",date:""}); setShowExpenseForm(false);
  };

  const handleEditExp = (e) => { setEditExpId(e.id); setExpenseForm({...e,amount:String(e.amount)}); setShowExpenseForm(true); };
  const handleDeleteExp = (id) => { setExpenses(expenses.filter(e=>e.id!==id)); setDeleteConfirm(null); toast("삭제 완료"); };

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
          <button onClick={()=>{setEditExpId(null);setExpenseForm({month:selMonth,category:"marketing_blog",amount:"",memo:"",date:""});setShowExpenseForm(!showExpenseForm);}} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#fff",borderRadius:9,padding:"8px 16px",fontSize:12,cursor:"pointer",fontWeight:700}}>+ 소진 내역 추가</button>
        </div>
      </div>

      {showContractForm && (
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.accent2}30`,borderRadius:14,padding:20}}>
          <div style={{color:C.accent2,fontSize:13,fontWeight:700,marginBottom:14}}>월 계약금 등록</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:140}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={contractForm.month} onChange={e=>setContractForm({...contractForm,month:e.target.value})} style={inputSt}/></div>
            <div style={{flex:2,minWidth:180}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>계약금 (만원) *</label><input type="number" placeholder="3500" value={contractForm.amount} onChange={e=>setContractForm({...contractForm,amount:e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={handleSaveContract} style={{background:`linear-gradient(135deg,${C.accent2},${C.accent})`,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>저장</button>
            <button onClick={()=>setShowContractForm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer"}}>취소</button>
          </div>
        </div>
      )}

      {showExpenseForm && (
        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${hospital.color}30`,borderRadius:14,padding:20}}>
          <div style={{color:hospital.color,fontSize:13,fontWeight:700,marginBottom:14}}>{editExpId?"소진 내역 수정":"소진 내역 추가"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:14}}>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>월 *</label><input type="month" value={expenseForm.month} onChange={e=>setExpenseForm({...expenseForm,month:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>날짜</label><input type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm,date:e.target.value})} style={inputSt}/></div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>항목 *</label>
              <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})} style={{...inputSt,appearance:"none"}}>
                {COST_CATEGORIES.map(c=><option key={c.id} value={c.id} style={{background:"#0F172A"}}>{c.label}</option>)}
              </select>
            </div>
            <div><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>금액 (만원) *</label><input type="number" placeholder="500" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} style={inputSt}/></div>
          </div>
          <div style={{marginBottom:14}}><label style={{color:C.muted,fontSize:11,display:"block",marginBottom:5}}>메모</label><KInput type="text" placeholder="예: 6월 블로그 포스팅 8건" value={expenseForm.memo} onChange={e=>setExpenseForm({...expenseForm,memo:e.target.value})} style={inputSt}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSaveExpense} style={{background:`linear-gradient(135deg,${hospital.color},${C.accent2})`,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:13,cursor:"pointer",fontWeight:700}}>{editExpId?"수정 완료":"저장하기"}</button>
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
            {spentRate>15&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>{spentRate}%</span>}
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
              <CartesianGrid strokeDasharray="3 3" stroke={C.dim}/>
              <XAxis dataKey="month" stroke={C.muted} tick={{fill:C.muted,fontSize:11}}/>
              <YAxis stroke={C.muted} tick={{fill:C.muted,fontSize:11}}/>
              <TT formatter={(v)=>[`${fmt(v)}만원`]}/>
              <Legend wrapperStyle={{color:C.muted,fontSize:12}}/>
              <Bar dataKey="계약금" fill={C.dim} radius={[4,4,0,0]}/>
              <Bar dataKey="소진" fill={hospital.color} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
        <SectionTitle>{selMonth.slice(5)}월 소진 내역</SectionTitle>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["날짜","항목","그룹","금액(만원)","메모","관리"].map(h=>(
              <th key={h} style={{color:C.muted,fontWeight:600,padding:"8px 12px",textAlign:"left",borderBottom:`1px solid ${C.dim}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {monthExpenses.length===0&&<tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:C.muted}}>소진 내역이 없어요. 추가 버튼을 눌러 입력해 주세요.</td></tr>}
              {[...monthExpenses].sort((a,b)=>a.date>b.date?-1:1).map(e=>{
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
              })}
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
function HospitalDashboard({ hospital, onBack, onUpdateHospital, isAdmin }) {
  const [tab, setTab] = useState("overview");
  const [showPerfInput, setShowPerfInput] = useState(false);
  const [showChannelInput, setShowChannelInput] = useState(false);

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
              {availYears.map(y => <option key={y} value={y} style={{background:"#0F172A"}}>{y}년</option>)}
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
    { id:"cost",        label:"비용 관리" },
    { id:"meeting",     label:"미팅 로그" },
  ].filter(t => {
    const enabledTabs = hospital.tabs || DEFAULT_TABS;
    return enabledTabs.includes(t.id);
  });

  const steps = [
    { name:"유입",   value:Math.round((last.inquiry||0)*3.2), color:C.accent },
    { name:"문의",   value:last.inquiry||0,      color:"#60A5FA" },
    { name:"상담",   value:last.consult||0,       color:C.accent2 },
    { name:"예약",   value:last.reservation||0,   color:C.green },
    { name:"내원",   value:last.visit||0,         color:C.yellow },
    { name:"결제",   value:last.payment||0,       color:C.orange },
    { name:"재내원", value:Math.round((last.payment||0)*0.38), color:C.red },
  ];

  // ─── 리포트 HTML 생성 & 다운로드 ───────────────────────────
  const exportReport = () => {
    const today = new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
    const reportData = last; // selMonth 기준 데이터 (HospitalDashboard의 last는 이미 selMonth 기준)
    const lastMonth = reportData.month || selMonth || "-";
    const fmtN = (n) => (n || 0).toLocaleString();
    const pctN = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "-";
    const roi2 = reportData.marketingCost ? Math.round(((reportData.revenue - reportData.marketingCost) / reportData.marketingCost) * 100) : 0;

    const kpiCards = [
      { label:"문의",     value:fmtN(reportData.inquiry),     unit:"건",  color:"#38BDF8" },
      { label:"상담",     value:fmtN(reportData.consult),      unit:"건",  color:"#818CF8" },
      { label:"예약",     value:fmtN(reportData.reservation),  unit:"건",  color:"#34D399" },
      { label:"내원",     value:fmtN(reportData.visit),        unit:"명",  color:"#FBBF24" },
      { label:"결제",     value:fmtN(reportData.payment),      unit:"건",  color:"#FB923C" },
      { label:"신환",     value:fmtN(reportData.newPatient),   unit:"명",  color:hospital.color },
      { label:"매출",     value:fmtN(reportData.revenue),      unit:"만원",color:"#FBBF24" },
      { label:"마케팅비", value:fmtN(reportData.marketingCost),unit:"만원",color:"#FB923C" },
    ].map(k => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value" style="color:${k.color}">${k.value}<span class="kpi-unit">${k.unit}</span></div>
      </div>`).join("");

    const funnelRows = [
      { name:"문의",   val:reportData.inquiry,      prev:null },
      { name:"상담",   val:reportData.consult,      prev:reportData.inquiry },
      { name:"예약",   val:reportData.reservation,  prev:reportData.consult },
      { name:"내원",   val:reportData.visit,        prev:reportData.reservation },
      { name:"결제",   val:reportData.payment,      prev:reportData.visit },
      { name:"신환",   val:reportData.newPatient,   prev:reportData.payment },
    ].map(r => {
      const conv = r.prev ? pctN(r.val, r.prev) : "-";
      return `<tr><td>${r.name}</td><td class="num">${fmtN(r.val)}</td><td class="conv">${conv}</td></tr>`;
    }).join("");

    const channelRows = chData.map((c,i) => {
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


    const trendRows = hData.map(d => `
      <tr>
        <td>${d.month}</td>
        <td class="num">${fmtN(d.inquiry)}</td>
        <td class="num">${fmtN(d.newPatient)}</td>
        <td class="num">${fmtN(d.revenue)}</td>
        <td class="num">${fmtN(d.marketingCost)}</td>
        <td class="num" style="color:${d.marketingCost?(((d.revenue-d.marketingCost)/d.marketingCost*100)|0)>200?"#34D399":"#FBBF24":"#64748B"}">
          ${d.marketingCost ? Math.round(((d.revenue - d.marketingCost) / d.marketingCost) * 100) + "%" : "-"}
        </td>
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
  body { background: #070D18; color: #E2E8F0; font-family: 'Noto Sans KR', sans-serif; padding: 40px 32px; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid ${hospital.color}40; }
  .hospital-name { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 6px; }
  .hospital-meta { color: #64748B; font-size: 13px; }
  .report-date { color: #64748B; font-size: 12px; text-align: right; }
  .report-month { color: ${hospital.color}; font-size: 22px; font-weight: 800; }
  .accent-bar { display: inline-block; width: 4px; height: 18px; background: linear-gradient(180deg, ${hospital.color}, #818CF8); border-radius: 2px; margin-right: 8px; vertical-align: middle; }
  .section { margin-bottom: 36px; }
  .section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .kpi-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; }
  .kpi-label { font-size: 12px; color: #64748B; font-weight: 600; margin-bottom: 8px; }
  .kpi-value { font-size: 26px; font-weight: 900; line-height: 1; }
  .kpi-unit { font-size: 13px; margin-left: 4px; font-weight: 600; }
  .roi-box { background: rgba(255,255,255,0.04); border: 1px solid ${hospital.color}30; border-radius: 12px; padding: 20px 24px; display: flex; gap: 32px; margin-bottom: 24px; flex-wrap: wrap; }
  .roi-item { text-align: center; }
  .roi-item .val { font-size: 24px; font-weight: 900; color: ${hospital.color}; }
  .roi-item .lbl { font-size: 11px; color: #64748B; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { color: #64748B; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1E293B; white-space: nowrap; background: rgba(255,255,255,0.02); }
  td { padding: 10px 14px; border-bottom: 1px solid #1E293B; }
  tr:hover td { background: ${hospital.color}08; }
  .num { text-align: right; }
  .conv { text-align: center; color: #34D399; font-weight: 700; }
  .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; margin-bottom: 24px; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #1E293B; color: #64748B; font-size: 11px; display: flex; justify-content: space-between; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff !important; color: #111 !important; padding: 16px !important; font-size: 12px !important; }
    .kpi-card, .roi-box, .table-wrap { border: 1px solid #ddd !important; background: #f8f9fa !important; }
    .kpi-card { break-inside: avoid; }
    .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
    .roi-box { flex-wrap: wrap !important; }
    th { background: #f0f0f0 !important; color: #333 !important; }
    td { color: #222 !important; border-bottom: 1px solid #eee !important; }
    .hospital-name { color: #111 !important; }
    .section-title { color: #111 !important; border-left: 4px solid ${hospital.color} !important; padding-left: 8px; }
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

  <div class="roi-box">
    ${[
      { label:"신환 수",    val:`${fmtN(reportData.newPatient)}명`,  },
      { label:"매출",       val:`${fmtN(reportData.revenue)}만원`,   },
      { label:"마케팅비",   val:`${fmtN(reportData.marketingCost)}만원`, },
      { label:"ROI",        val:`${roi2}%`,                    },
      { label:"CPA",        val:`${reportData.newPatient ? fmtN(Math.round((reportData.marketingCost||0)/reportData.newPatient)) : "-"}만원/명`, },
      { label:"목표 달성률",val:`${hospital.target_patients ? Math.round((reportData.newPatient||0)/hospital.target_patients*100) : "-"}%`, },
    ].map(i => `<div class="roi-item"><div class="val">${i.val}</div><div class="lbl">${i.label}</div></div>`).join("")}
  </div>

  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>월별 성과 추이</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>월</th><th>문의</th><th>신환</th><th>매출(만)</th><th>마케팅비(만)</th><th>ROI</th></tr></thead>
        <tbody>${trendRows}</tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title"><span class="accent-bar"></span>${lastMonth} 퍼널 전환 현황</div>
    <div class="kpi-grid">${kpiCards}</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>단계</th><th>수치</th><th>전환율</th></tr></thead>
        <tbody>${funnelRows}</tbody>
      </table>
    </div>
  </div>

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
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background:"rgba(255,255,255,0.02)", borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
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
          <button onClick={exportReport} style={{ background:`linear-gradient(135deg,${hospital.color},${C.accent2})`, border:"none", color:"#fff", borderRadius:9, padding:"8px 16px", fontSize:12, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap" }}>
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
            fontFamily:"'Noto Sans KR', sans-serif",
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
                      <CartesianGrid strokeDasharray="3 3" stroke={C.dim} />
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
                    <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:"10px 14px" }}>
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
                      <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 10px" }}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke={C.dim} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke={C.dim} />
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
        {tab === "patient" && <PatientTab hospital={hospital} />}

        {/* 키워드/SEO */}
        {/* 마케팅 현황 */}
        {tab === "marketing" && (
          <MarketingTab hospital={hospital} chData={chData} initialContents={hospital.contentData || []} />
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
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
              <SectionTitle sub="유입 → 문의 → 상담 → 예약 → 내원 → 결제 → 재내원">전환 퍼널 현황</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:680, margin:"0 auto" }}>
                {steps.map((step,i) => {
                  const prevStep = i>0?steps[i-1].value:step.value;
                  const drop = i>0?(100-Math.round((step.value/prevStep)*100)):0;
                  const width = Math.max((step.value/steps[0].value)*100,6);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:56, color:step.color, fontSize:12, fontWeight:700, textAlign:"right" }}>{step.name}</div>
                      <div style={{ flex:1, height:40, background:C.dim, borderRadius:8, overflow:"hidden" }}>
                        <div style={{ width:`${width}%`, height:"100%", background:`linear-gradient(90deg,${step.color}88,${step.color}44)`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:12 }}>
                          <span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>{fmt(step.value)}명</span>
                        </div>
                      </div>
                      {i>0?(<div style={{ width:80 }}><span style={{ color:drop<30?C.green:drop<60?C.yellow:C.red, fontSize:11, fontWeight:700 }}>▼ {drop}% 이탈</span></div>):<div style={{ width:80 }}/>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
              {[
                { label:"문의→상담", a:last.consult, b:last.inquiry, tip:"낮으면 첫 응대 개선" },
                { label:"상담→예약", a:last.reservation, b:last.consult, tip:"낮으면 상담 스크립트 점검" },
                { label:"예약→내원", a:last.visit, b:last.reservation, tip:"낮으면 리마인드 강화" },
                { label:"내원→결제", a:last.payment, b:last.visit, tip:"낮으면 현장 상담 개선" },
                { label:"결제→재내원", a:Math.round((last.payment||0)*0.38), b:last.payment, tip:"낮으면 CRM 강화" },
                { label:"전체 전환율", a:last.payment, b:Math.round((last.inquiry||0)*3.2), tip:"전체 퍼널 효율" },
              ].map((item,i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
                  <div style={{ color:C.muted, fontSize:11, marginBottom:8 }}>{item.label} 전환율</div>
                  <div style={{ color:hospital.color, fontSize:26, fontWeight:900 }}>{pct(item.a, item.b)}</div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:8, paddingTop:8, borderTop:`1px solid ${C.dim}` }}>💡 {item.tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 비용 관리 */}
        {tab === "cost" && <CostTab hospital={hospital} hData={hData} />}
        {tab === "meeting" && <MeetingTab hospital={hospital} />}
        {tab === "keyword" && <KeywordRankTab hospital={hospital} isAdmin={isAdmin} />}

      </div>
    </div>
  );
}

// ─── 초기 콘텐츠 데이터 ───────────────────────────────────────
const CONTENT_INIT = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[] };

// ─── 메인 앱 ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }`}</style>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
  };

  const handleAddHospital = async (form) => {
    const newId = Date.now();
    const newHospital = {
      ...form, id: newId,
      monthlyData: [], channelData: [], contentData: [], meetingData: [],
    };
    setHospitals(prev => [...prev, newHospital]);
    await saveHospitalToSupabase(newHospital);
  };

  const handleEditHospital = async (updated) => {
    setHospitals(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated } : h));
    const full = hospitals.find(h => h.id === updated.id);
    if (full) await saveHospitalToSupabase({ ...full, ...updated });
  };

  const handleDeleteHospital = async (id) => {
    setHospitals(prev => prev.filter(h => h.id !== id));
    try {
      
      await supabase.from('hospitals').delete().eq('id', id);
      await supabase.from('monthly_data').delete().eq('hospital_id', id);
      await supabase.from('channel_data').delete().eq('hospital_id', id);
      await supabase.from('content_data').delete().eq('hospital_id', id);
      await supabase.from('meeting_data').delete().eq('hospital_id', id);
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const navigate = useNavigate();

  const selected = hospitals.find(h => h.id === selectedId);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#070D18", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, fontFamily:"'Noto Sans KR', sans-serif" }}>
      <div style={{ color:"#38BDF8", fontSize:18, fontWeight:700 }}>다올 마케팅 대시보드</div>
      <div style={{ color:"#64748B", fontSize:13 }}>데이터를 불러오는 중이에요...</div>
    </div>
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
          isAdmin={isAdmin}
          onAdminLogin={(name) => setIsAdmin(true)}
          onAdminLogout={() => setIsAdmin(false)}
        />
      } />
      <Route path="/hospital/:hospitalId" element={
        <HospitalRoute
          hospitals={hospitals}
          onUpdateHospital={handleUpdateHospital}
          isAdmin={isAdmin}
        />
      } />
    </Routes>
  );
}

function HospitalRoute({ hospitals, onUpdateHospital, isAdmin }) {
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
    <div style={{ minHeight:"100vh", background:"#070D18", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, fontFamily:"'Noto Sans KR', sans-serif" }}>
      <div style={{ color:"#38BDF8", fontSize:18, fontWeight:700 }}>병원을 찾을 수 없어요</div>
      <button onClick={() => navigate("/")} style={{ background:"transparent", border:"1px solid #334155", color:"#64748B", borderRadius:9, padding:"8px 20px", fontSize:13, cursor:"pointer" }}>← 목록으로</button>
    </div>
  );

  // 비밀번호 입력 화면
  if (!canAccess) return (
    <div style={{ minHeight:"100vh", background:"#070D18", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans KR', sans-serif" }}>
      <div style={{ background:"#0F172A", border:`1px solid ${hospital.color}30`, borderRadius:20, padding:40, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        {/* 병원 정보 */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ width:44, height:44, borderRadius:13, background:`linear-gradient(135deg,${hospital.color},${hospital.color}88)`, flexShrink:0 }} />
          <div>
            <div style={{ color:"#E2E8F0", fontSize:16, fontWeight:800 }}>{hospital.name}</div>
            <div style={{ color:"#64748B", fontSize:12, marginTop:2 }}>{hospital.dept} · {hospital.region}</div>
          </div>
        </div>
        <div style={{ color:"#E2E8F0", fontSize:14, fontWeight:700, marginBottom:6 }}>비밀번호를 입력해주세요</div>
        <div style={{ color:"#64748B", fontSize:12, marginBottom:20 }}>이 대시보드는 비밀번호로 보호되어 있어요</div>
        <input
          ref={pwRef}
          type="password"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={e => e.key === "Enter" && handleUnlock()}
          placeholder="비밀번호"
          autoFocus
          style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${pwError ? "#F87171" : "#1E293B"}`, borderRadius:8, color:"#E2E8F0", padding:"10px 14px", fontSize:15, fontFamily:"'Noto Sans KR', sans-serif", width:"100%", outline:"none", letterSpacing:4, marginBottom:8 }}
        />
        {pwError && <div style={{ color:"#F87171", fontSize:12, marginBottom:12 }}>비밀번호가 틀렸어요</div>}
        <button onClick={handleUnlock} style={{ width:"100%", background:`linear-gradient(135deg,${hospital.color},#818CF8)`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", fontSize:14, cursor:"pointer", fontWeight:700, marginTop:8 }}>
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
    />
  );
}
