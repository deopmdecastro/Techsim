import { useEffect, useState } from "react";

export function AuthModal({ mode, onClose, onSubmit }) {
  const [tab, setTab] = useState(mode || "login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setTab(mode || "login"), [mode]);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (tab === "register" && !form.name.trim()) {
      setError("Informe seu nome.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(tab, form);
    } catch (err) {
      setError(err?.message || "Não foi possível concluir a autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%",
    background:"#071020",
    border:"1px solid #1e3a5f",
    color:"#e2e8f0",
    padding:"11px 12px",
    borderRadius:8,
    fontSize:11,
    fontFamily:"inherit",
    outline:"none",
    boxSizing:"border-box",
  };

  return (
    <div onClick={onClose} style={{position:"fixed", inset:0, zIndex:1000, display:"grid", placeItems:"center", background:"#0000009a", backdropFilter:"blur(6px)"}}>
      <div onClick={event => event.stopPropagation()} style={{width:420, maxWidth:"calc(100vw - 32px)", background:"linear-gradient(180deg,#040d18,#071020)", border:"1px solid #1e3a5f", borderRadius:18, padding:28, boxShadow:"0 24px 70px #000a"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20}}>
          <div>
            <div style={{fontSize:24, color:"#22d3ee", marginBottom:4}}>⚡</div>
            <div style={{fontSize:16, fontWeight:700, color:"#22d3ee", letterSpacing:3}}>TECHSIM PRO</div>
            <div style={{fontSize:9, color:"#475569", marginTop:4}}>Base pronta para autenticação local ou backend real</div>
          </div>
          <button onClick={onClose} style={{background:"transparent", border:"none", color:"#64748b", cursor:"pointer", fontSize:20}}>×</button>
        </div>

        <div style={{display:"flex", background:"#020b14", borderRadius:10, padding:4, marginBottom:20, border:"1px solid #1e3a5f"}}>
          {[
            { id:"login", label:"ENTRAR" },
            { id:"register", label:"CRIAR CONTA" },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{flex:1, border:"none", borderRadius:8, padding:"10px 12px", cursor:"pointer", fontFamily:"inherit", fontSize:10, fontWeight:700, letterSpacing:1.8, background:tab === item.id ? "#22d3ee" : "transparent", color:tab === item.id ? "#020b14" : "#64748b"}}>{item.label}</button>
          ))}
        </div>

        {error && <div style={{background:"#2a0910", border:"1px solid #f43f5e44", color:"#fda4af", borderRadius:10, padding:"10px 12px", fontSize:10, marginBottom:14}}>{error}</div>}

        {tab === "register" && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9, color:"#64748b", marginBottom:6, letterSpacing:2}}>NOME</div>
            <input value={form.name} onChange={event => setForm(current => ({ ...current, name:event.target.value }))} placeholder="Seu nome completo" style={inputStyle} />
          </div>
        )}

        <div style={{marginBottom:12}}>
          <div style={{fontSize:9, color:"#64748b", marginBottom:6, letterSpacing:2}}>E-MAIL</div>
          <input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email:event.target.value }))} placeholder="voce@empresa.com" style={inputStyle} />
        </div>

        <div style={{marginBottom:18}}>
          <div style={{fontSize:9, color:"#64748b", marginBottom:6, letterSpacing:2}}>SENHA</div>
          <input type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password:event.target.value }))} onKeyDown={event => event.key === "Enter" && handleSubmit()} placeholder="••••••••" style={inputStyle} />
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{width:"100%", border:"none", borderRadius:10, padding:"13px 16px", cursor:loading ? "wait" : "pointer", background:loading ? "#1e3a5f" : "linear-gradient(135deg,#22d3ee,#0ea5e9)", color:loading ? "#94a3b8" : "#020b14", fontWeight:700, letterSpacing:2, fontFamily:"inherit", boxShadow:loading ? "none" : "0 16px 38px #22d3ee22"}}>
          {loading ? "PROCESSANDO..." : tab === "login" ? "ENTRAR →" : "CRIAR CONTA →"}
        </button>

        <div style={{marginTop:14, fontSize:9, color:"#475569", textAlign:"center"}}>
          {tab === "login" ? "Ainda não tem conta? " : "Já possui acesso? "}
          <span onClick={() => setTab(tab === "login" ? "register" : "login")} style={{color:"#22d3ee", cursor:"pointer"}}>
            {tab === "login" ? "Criar conta" : "Entrar"}
          </span>
        </div>
      </div>
    </div>
  );
}
