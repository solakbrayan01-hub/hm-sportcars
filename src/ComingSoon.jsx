import { useState } from "react";

export default function ComingSoon() {
  const [lang, setLang] = useState("it");

  const labels = {
    it: { soon: "In arrivo", sub: "Stiamo preparando qualcosa di nuovo. Torna presto.", days: "Giorni", hours: "Ore", minutes: "Minuti", seconds: "Secondi", contact: "Nel frattempo puoi contattarci:" },
    de: { soon: "Demnächst", sub: "Wir arbeiten an etwas Neuem. Schau bald wieder vorbei.", days: "Tage", hours: "Stunden", minutes: "Minuten", seconds: "Sekunden", contact: "In der Zwischenzeit erreichen Sie uns:" },
  };
  const l = labels[lang];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#F5F5F5", fontFamily: "Inter,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .fade1 { animation: fadeInUp .7s ease .1s both; }
        .fade2 { animation: fadeInUp .7s ease .3s both; }
        .fade3 { animation: fadeInUp .7s ease .5s both; }
        .fade4 { animation: fadeInUp .7s ease .7s both; }
        .fade5 { animation: fadeInUp .7s ease .9s both; }
        .colon { animation: pulse 1s ease-in-out infinite; }
      `}</style>

      {/* Lang switcher */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 4, background: "#1C1C1C", padding: 4, borderRadius: 6 }}>
        {["it","de"].map(l => (
          <button key={l} onClick={() => setLang(l)}
            style={{ background: lang === l ? "#C8102E" : "transparent", color: lang === l ? "#fff" : "#606060", border: "none", padding: "5px 10px", fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 4, letterSpacing: 1 }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div className="fade1" style={{ marginBottom: 48 }}>
        <img src="/logo.png" alt="HM Sportcars" style={{ height: 60, width: "auto", filter: "brightness(0) invert(1) drop-shadow(0 0 1px rgba(255,255,255,0.1))" }} />
      </div>

      {/* Titolo */}
      <div className="fade2" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 4, color: "#C8102E", textTransform: "uppercase", marginBottom: 14 }}>— {l.soon} —</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(32px,6vw,64px)", fontWeight: 700, letterSpacing: -2, color: "#fff", lineHeight: 1 }}>
          HM Sportcars
        </h1>
      </div>

      {/* Sottotitolo */}
      <p className="fade3" style={{ fontSize: 16, color: "#606060", maxWidth: 420, lineHeight: 1.7, marginBottom: 56 }}>{l.sub}</p>

      {/* Contatti */}
      <div className="fade5" style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#3a3a3a", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>{l.contact}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="tel:+390472869296" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.06)", color: "#A0A0A0", textDecoration: "none", padding: "10px 20px", borderRadius: 4, fontSize: 13, fontWeight: 500, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}>
            📞 +39 0472 869296
          </a>
          <a href="https://wa.me/393472607790" target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: 4, fontSize: 13, fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href="mailto:info@ghm-sportcars.com"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.06)", color: "#A0A0A0", textDecoration: "none", padding: "10px 20px", borderRadius: 4, fontSize: 13, fontWeight: 500, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#A0A0A0"; }}>
            ✉️ info@ghm-sportcars.com
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 20, fontSize: 11, color: "#2E2E2E" }}>
        © 2025 HM Sportcars OHG — Vandoies (BZ)
      </div>
    </div>
  );
}
