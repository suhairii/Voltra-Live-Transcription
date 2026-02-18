"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Send, Key, Activity, AlertCircle, RefreshCw, Sparkles, FileText, CheckCircle2, User, ShieldCheck, XCircle, PlusCircle, Globe, Languages, ChevronDown, Check, Zap, Bell, Menu, X, LucideIcon } from "lucide-react";
import { useVexaWebSocket } from "@/hooks/useVexa";

// --- CUSTOM COMPONENT: LIQUID DROPDOWN ---
const LiquidDropdown = ({ 
  options, 
  value, 
  onChange, 
  icon: Icon, 
  placeholder 
}: { 
  options: { value: string; label: string }[]; 
  value: string; 
  onChange: (val: string) => void; 
  icon: LucideIcon; 
  placeholder?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative group w-full z-50">
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`ios-input w-full p-3 pl-10 pr-8 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-700 outline-none backdrop-blur-md ${isOpen ? 'bg-white/60 ring-2 ring-white/50' : ''}`}
      >
        <Icon className={`absolute left-3.5 top-3 w-4 h-4 transition-colors z-10 ${isOpen ? 'text-indigo-600' : 'text-slate-500'}`} />
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`absolute right-3 top-3 w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-2xl z-50 flex flex-col gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-between transition-all ${
                value === option.value 
                  ? 'bg-white/70 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-white/30'
              }`}
            >
              {option.label}
              {value === option.value && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
export default function Home() {
  // --- STATE SETUP ---
  const [apiKey, setApiKey] = useState("");
  const [apiHost, setApiHost] = useState("http://localhost:8056");
  const [adminToken, setAdminToken] = useState("");
  const [adminHost, setAdminHost] = useState("http://localhost:8057");
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("http://localhost:5678/webhook/vexa-ai-processor");

  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu Toggle
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        setApiHost(`http://${hostname}:8056`);
        setAdminHost(`http://${hostname}:8057`);
        setN8nWebhookUrl(`http://${hostname}:5678/webhook/vexa-ai-processor`);
      }
    }
  }, []);
  
  const [meetingId, setMeetingId] = useState("");
  const [platform, setPlatform] = useState("google_meet");
  const [language, setLanguage] = useState("id");
  const [botName, setBotName] = useState("Notulen");
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const wsHost = apiHost.replace("http", "ws") + "/ws";
  const { segments, isConnected, botStatus, logs, connect, disconnect, addLog, setSegments } = useVexaWebSocket(wsHost, apiKey);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [segments, aiResult]);

  // --- HELPER: SHOW NOTIFICATION ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message, type, isVisible: true });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification((prev) => prev ? { ...prev, isVisible: false } : null);
      setTimeout(() => setNotification(null), 300);
    }, 3000);
  };

  const handleSimulateInterview = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSegments([]);
    setAiResult(null);
    setShowAiResult(false);
    showToast("Starting simulated interview...", "info");

    const mockConversation = [
      { speaker: "Interviewer", text: "Selamat siang. Terima kasih sudah meluangkan waktu untuk interview hari ini. Bisa perkenalkan diri Anda?" },
      { speaker: "Candidate", text: "Selamat siang, Pak. Nama saya Budi. Saya memiliki pengalaman 3 tahun sebagai Fullstack Developer di perusahaan startup teknologi." },
      { speaker: "Interviewer", text: "Menarik. Bisa ceritakan tantangan teknis tersulit yang pernah Anda hadapi dan bagaimana Anda menyelesaikannya?" },
      { speaker: "Candidate", text: "Tentu. Salah satu tantangan terbesar adalah saat migrasi database dari monolitik ke microservices tanpa downtime. Saya merancang strategi CDC (Change Data Capture) untuk sinkronisasi data." },
      { speaker: "Interviewer", text: "Bagus sekali. Apa kelebihan dan kekurangan Anda dalam bekerja secara tim?" },
      { speaker: "Candidate", text: "Saya sangat komunikatif dan suka berbagi pengetahuan. Kekurangan saya mungkin kadang terlalu fokus pada detail, tapi saya belajar untuk lebih memprioritaskan impact." },
      { speaker: "Interviewer", text: "Oke, terima kasih Budi. Kami akan segera mengabari Anda dalam waktu dekat." },
      { speaker: "Candidate", text: "Terima kasih banyak, Pak. Saya sangat menantikan kabar baik dari Anda." },
    ];

    for (let i = 0; i < mockConversation.length; i++) {
      const msg = mockConversation[i];
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      setSegments(prev => [...prev, {
        id: `mock-${i}`,
        text: msg.text,
        speaker: msg.speaker,
        start_time: Date.now(),
        end_time: Date.now() + 1000,
        language: "id",
        is_final: true
      }]);
    }
    
    setIsSimulating(false);
    showToast("Simulation complete", "success");
  };

  const pollTranscripts = useCallback(async () => {
    if (!apiKey || !meetingId || !isPolling) return;
    try {
      const response = await fetch(`${apiHost}/transcripts/${platform}/${meetingId}`, { headers: { "X-API-Key": apiKey } });
      if (response.ok) {
        const data = await response.json();
        if (data.segments) {
          setSegments(data.segments.map((s: { id?: string | number; text: string; speaker?: string; start_time: number; end_time: number; language: string }) => ({
            id: String(s.id || `${s.start_time}-${s.speaker}`),
            text: s.text,
            speaker: s.speaker || "Speaker",
            start_time: s.start_time,
            end_time: s.end_time,
            language: s.language,
            is_final: true
          })));
        }
      }
    } catch (err) { console.error("Polling failed", err); }
  }, [apiKey, meetingId, platform, apiHost, isPolling, setSegments]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPolling) interval = setInterval(pollTranscripts, 2000);
    return () => clearInterval(interval);
  }, [isPolling, pollTranscripts]);

  const handleJoinMeeting = async () => {
    if (!apiKey || !meetingId) { showToast("API Key & ID required", "error"); return; }
    setLoading(true);
    addLog(`System: Requesting bot...`);
    try {
      const res = await fetch(`${apiHost}/bots`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({ platform, native_meeting_id: meetingId, bot_name: botName, language }),
      });
      if (!res.ok) throw new Error(await res.text());
      addLog("✅ Bot Accepted!");
      setIsPolling(true);
      connect(platform, meetingId);
      showToast("Bot Successfully Deployed", "success");
      setIsMobileMenuOpen(false); // Auto close menu on mobile
    } catch (err) { 
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`❌ Failed: ${errorMessage}`); 
      showToast(`Failed: ${errorMessage}`, "error");
    }
    finally { setLoading(false); }
  };

  const renderJoinButton = () => {
    if (botStatus === "ready") {
      return (
        <div className="flex flex-col gap-2">
          <button onClick={handleStopSession} className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] border border-rose-500/20 backdrop-blur-sm shadow-lg shadow-rose-500/10">
            <XCircle className="w-4 h-4" /> Stop Session
          </button>
          <button onClick={handleJoinNew} className="w-full py-2.5 bg-white/20 text-slate-500 hover:bg-white/40 font-bold rounded-2xl border border-white/40 transition-all flex items-center justify-center gap-2 text-[10px]">
            <PlusCircle className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      );
    }
    let buttonText = "Start Session";
    let Icon = Send;
    let isDisabled = loading;
    let btnClass = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-indigo-500/30";

    if (loading || botStatus === "joining") {
      buttonText = "Connecting...";
      Icon = RefreshCw;
      isDisabled = true;
    } else if (botStatus === "admission") {
      buttonText = "Waiting Admission...";
      Icon = ShieldCheck;
      isDisabled = true;
      btnClass = "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/30";
    }

    return (
      <button onClick={handleJoinMeeting} disabled={isDisabled} className={`w-full py-3.5 ${btnClass} disabled:opacity-70 disabled:grayscale font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 text-[11px] tracking-wide relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />
        <Icon className={`w-4 h-4 ${buttonText === "Connecting..." ? "animate-spin" : ""}`} />
        {buttonText}
      </button>
    );
  };

  const handleStopSession = () => { 
    setIsPolling(false); 
    disconnect(); 
    addLog("System: Monitoring stopped."); 
    showToast("Session Stopped", "info");
  };

  const handleJoinNew = () => { 
    handleStopSession(); 
    setMeetingId(""); 
    setSegments([]); 
    setAiResult(null); 
    setShowAiResult(false); 
    addLog("System: Workspace cleared."); 
  };

  const handleGenerateApiKey = async () => {
    if (!adminToken) { showToast("Admin Token Required", "error"); return; }
    setLoading(true);
    try {
      const ts = Date.now();
      const uRes = await fetch(`${adminHost}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-API-Key": adminToken },
        body: JSON.stringify({ email: `ui-${ts}@example.com`, name: `User ${ts}`, max_concurrent_bots: 5 }),
      });
      const userData = await uRes.json();
      const tRes = await fetch(`${adminHost}/admin/users/${userData.id}/tokens`, { method: "POST", headers: { "X-Admin-API-Key": adminToken } });
      const tData = await tRes.json();
      setApiKey(tData.token);
      showToast("New API Key Applied!", "success");
    } catch (err) { 
      const errorMessage = err instanceof Error ? err.message : String(err);
      showToast(errorMessage, "error"); 
    } 
    finally { setLoading(false); }
  };

  const handleAiAction = async (actionType: "correct" | "summarize") => {
    if (!n8nWebhookUrl) { showToast("Set Webhook URL First", "error"); return; }
    if (segments.length === 0) { showToast("No transcript data", "error"); return; }
    setAiLoading(true); setShowAiResult(true); setAiResult(null);
    try {
      const currentTranscript = segments.map(s => `[${s.speaker}]: ${s.text}`).join("\n");
      const res = await fetch("/api/n8n-proxy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n8nUrl: n8nWebhookUrl, action: actionType, meeting_id: meetingId, transcript: currentTranscript }),
      });
      if (!res.ok) throw new Error("Proxy failed");
      const data = await res.json();
      setAiResult(data.text || data.output || (typeof data === 'string' ? data : JSON.stringify(data, null, 2)));
      showToast("AI Processing Complete", "success");
    } catch (err) { 
      const errorMessage = err instanceof Error ? err.message : String(err);
      showToast(`AI Error: ${errorMessage}`, "error"); 
    } 
    finally { setAiLoading(false); }
  };

  const renderAiBubbles = (text: string) => {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    return lines.map((line, i) => {
      const match = line.match(/^\[(.*?)\]: (.*)/);
      if (match) {
        const [_, speaker, message] = match;
        return (
          <div key={i} className="flex gap-4 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-600 shadow-md border border-white/60 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-[9px] font-black text-slate-500/80 uppercase tracking-widest ml-1">{speaker}</p>
              <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl rounded-tl-none border border-white/60 shadow-lg text-[12px] text-slate-700 leading-relaxed font-medium">
                {message}
              </div>
            </div>
          </div>
        );
      }
      return <p key={i} className="text-[11px] text-slate-500/80 font-medium italic mb-3 ml-14">{line}</p>;
    });
  };

  return (
    <main className="h-screen w-full max-w-[100vw] flex flex-col md:flex-row overflow-hidden relative">
      {/* --- LIQUID BACKGROUND --- */}
      <div className="liquid-bg" />
      <div className="liquid-orb w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-purple-400/30 -top-20 -left-20 animate-pulse" />
      <div className="liquid-orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-400/30 bottom-0 right-0" />
      
      {/* --- DYNAMIC ISLAND NOTIFICATION (Fixed Top Center) --- */}
      {notification && (
        <div 
          className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-2xl border border-white/20 transition-all duration-300 w-auto max-w-[90vw]
          ${notification.isVisible ? 'dynamic-island-enter' : 'dynamic-island-exit'}
          ${notification.type === 'success' ? 'bg-emerald-950/80 text-emerald-400' : 
            notification.type === 'error' ? 'bg-rose-950/80 text-rose-400' : 
            'bg-slate-900/80 text-white'}`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 fill-current text-emerald-950 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 fill-current text-rose-950 shrink-0" />}
          {notification.type === 'info' && <Bell className="w-5 h-5 fill-current text-slate-950 shrink-0" />}
          
          <span className="text-[11px] font-bold tracking-wide truncate">{notification.message}</span>
        </div>
      )}

      {/* --- MOBILE NAVBAR --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20 z-40 shrink-0 h-16">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/50">
              <Zap className="text-white w-4 h-4 fill-white" />
            </div>
            <span className="text-sm font-black text-slate-800 tracking-tight">VOLTRA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/20 rounded-xl text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* --- RESPONSIVE SIDEBAR (Fixed Drawer on Mobile, Static on Desktop) --- */}
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] md:w-[300px] md:relative md:h-[96vh] md:my-auto md:ml-4 
        bg-white/40 md:ios-glass flex flex-col overflow-hidden shadow-2xl border-r md:border border-white/40 
        transition-transform duration-300 ease-out md:translate-x-0 md:rounded-[2rem] backdrop-blur-3xl md:backdrop-blur-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header (Desktop: Logo, Mobile: Close Button) */}
        <div className="p-7 border-b border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/50">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 leading-none">VOLTRA</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5 opacity-80">Sonic Core v1</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 bg-white/20 rounded-full text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
          
          {/* Auth */}
          <div className="space-y-4">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Authentication</h2>
            <div className="space-y-3">
              <div className="relative group">
                <input type="password" placeholder="API Key" className="ios-input w-full p-3 rounded-2xl outline-none text-[11px] text-slate-700 font-bold tracking-wide" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                {!apiKey && <button onClick={handleGenerateApiKey} className="absolute right-3 top-2.5 px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-500/20 transition-colors">Generate</button>}
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input type="password" placeholder="Admin Token" className="ios-input w-full p-3 pl-10 rounded-2xl text-[11px] outline-none text-slate-700 font-bold tracking-wide" value={adminToken} onChange={(e) => setAdminToken(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="space-y-4">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Session Control</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <LiquidDropdown icon={Languages} value={language} onChange={setLanguage} options={[{ value: "id", label: "ID" }, { value: "en", label: "EN" }]} />
                <LiquidDropdown icon={Globe} value={platform} onChange={setPlatform} options={[{ value: "google_meet", label: "Meet" }, { value: "zoom", label: "Zoom" }]} />
              </div>
              <input type="text" placeholder="Paste Meeting ID Here" className="ios-input w-full p-3.5 rounded-2xl text-[11px] font-bold text-slate-700 outline-none text-center tracking-wider" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} />
              {renderJoinButton()}
            </div>
          </div>

          {/* AI Actions */}
          <div className="space-y-4">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Intelligence</h2>
            <div className="space-y-3">
              <input type="text" placeholder="n8n Webhook URL" className="ios-input w-full p-3 rounded-2xl text-[10px] text-slate-500 outline-none font-mono" value={n8nWebhookUrl} onChange={(e) => setN8nWebhookUrl(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAiAction("correct")} disabled={aiLoading || segments.length === 0} className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 text-[10px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                </button>
                <button onClick={() => handleAiAction("summarize")} disabled={aiLoading || segments.length === 0} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 text-[10px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale">
                  <FileText className="w-3.5 h-3.5" /> Summary
                </button>
              </div>
            </div>
          </div>

          {/* Test Simulation */}
          <div className="space-y-4">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Testing & QA</h2>
            <button 
              onClick={handleSimulateInterview} 
              disabled={loading || isPolling || botStatus === "ready" || isSimulating}
              className="w-full py-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] border border-indigo-500/20 backdrop-blur-sm shadow-lg shadow-indigo-500/5 group"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isSimulating ? "SIMULATING..." : "RUN TEST INTERVIEW"}
            </button>
          </div>
        </div>

        {/* Connection Status Footer */}
        <div className="p-4 bg-white/20 backdrop-blur-md border-t border-white/20">
          <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black border ${isConnected ? 'bg-emerald-400/10 text-emerald-700 border-emerald-400/20' : 'bg-rose-400/10 text-rose-700 border-rose-400/20'}`}>
            <span className={`w-2 h-2 rounded-full shadow-sm ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </div>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <section className="flex-1 min-w-0 h-[calc(100vh-64px)] md:h-[96vh] md:my-auto md:mr-4 md:ml-4 rounded-none md:rounded-[2rem] ios-glass flex flex-col relative z-10 overflow-hidden shadow-none md:shadow-2xl border-t md:border border-white/40">
        
        {/* Dynamic Header */}
        <div className="px-5 md:px-8 py-4 md:py-5 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 shrink-0">
           <h2 className="text-[10px] md:text-[11px] font-black text-slate-700 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shadow-sm">
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="hidden md:inline">Live Transcription Feed</span>
              <span className="md:hidden">Live Feed</span>
           </h2>
           <div className="flex items-center gap-3 bg-white/30 px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-wider">{segments.length > 0 ? "Receiving" : "Standby"}</span>
           </div>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-white/5">
          <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-5 custom-scrollbar transition-all duration-700 ${showAiResult ? 'opacity-30 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
            {segments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/10 to-transparent border border-white/20 flex items-center justify-center mb-6 animate-pulse">
                  <Mic className="w-10 h-10 text-indigo-300" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-900/40 text-center">Awaiting Audio Stream</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full space-y-6 pb-20">
                {segments.map((s, idx) => (
                  <div key={s.id || idx} className="group relative pl-2 md:pl-4">
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-300/0 via-indigo-400/50 to-indigo-300/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                    <p className="text-[9px] font-black text-slate-400/80 uppercase mb-2 tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {s.speaker}
                    </p>
                    <div className="bg-white/40 hover:bg-white/60 backdrop-blur-md px-5 py-3.5 md:px-6 md:py-4 rounded-2xl md:rounded-3xl rounded-tl-none border border-white/50 shadow-sm hover:shadow-md text-[12px] md:text-[13px] text-slate-700 leading-relaxed transition-all duration-300">
                      {s.text}
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>

          {/* AI Drawer (Liquid Glass Style) - Adjusted for Mobile */}
          {showAiResult && (
            <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4 h-[75%] md:h-[65%] ios-glass-card rounded-[2rem] md:rounded-[2.5rem] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-[100px] duration-500 ease-out z-30 border border-white/60 ring-1 ring-white/40">
              <div className="px-6 py-4 md:px-8 md:py-5 border-b border-white/20 flex justify-between items-center bg-white/20 backdrop-blur-xl rounded-t-[2rem] md:rounded-t-[2.5rem] shrink-0">
                <h2 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> AI Insights
                </h2>
                <div className="flex items-center gap-4">
                  {aiLoading && (
                    <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                      <span className="text-[9px] font-black text-indigo-500 uppercase hidden md:inline">Processing</span>
                    </div>
                  )}
                  <button onClick={() => setShowAiResult(false)} className="w-8 h-8 rounded-full bg-white/40 hover:bg-rose-500/20 hover:text-rose-600 flex items-center justify-center transition-all border border-white/50">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white/5">
                <div className="max-w-4xl mx-auto w-full">
                  {aiResult ? renderAiBubbles(aiResult) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400/60">
                      <div className="relative">
                         <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 animate-pulse" />
                         <Sparkles className="w-16 h-16 relative text-indigo-300 mb-4 animate-bounce" />
                      </div>
                      <p className="font-black text-[10px] uppercase tracking-widest text-center mt-4">Synthesizing Intelligence...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
