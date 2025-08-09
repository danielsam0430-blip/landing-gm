import { useEffect, useMemo } from "react";

export default function App() {
  const CONFIG = {
    brand: {
      name: "Grupo Millenial",
      primary: "#270065",
      accent: "#FF3316",
      light: "#FFFFFF",
      slogan: "Contigo en cada metro, contigo en cada sueño",
      logoUrl: "/assets/logo-millenial.jpeg",
    },
    contact: {
      whatsapp: "+51 993 158 181",
      address: "Aucallama, Huaral",
      mapsUrl: "https://maps.google.com",
    },
    leadEndpoint: "https://script.google.com/macros/s/AKfycbw43QwQwIJcNXM1ZR2xWs16oeNQf8CsSUpTvo_sqoa26Cz8PankOzNNYVh6whxwMoeF/exec",
    tracking: { ga4Id: "G-XXXXXXXXXX", pixelId: "123456789012345" },
    projects: [
      { name: "Fincas del Sol", priceFrom: 50, size: "Desde 500 m²", benefits: ["Títulos en gestión","Agua y energía proyectada","Acceso vehicular"], image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop" },
      { name: "Campiñas de Palpa", priceFrom: 40, size: "Desde 400 m²", benefits: ["Zona campestre","Alta plusvalía","Facilidades de pago"], image: "https://images.unsplash.com/photo-1497800839469-bdbe4fd9f5f8?q=80&w=1600&auto=format&fit=crop" },
      { name: "Praderas del Sol", priceFrom: 60, size: "Desde 500 m²", benefits: ["Crecimiento urbano","Vías habilitadas","Financiamiento flexible"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop" },
    ],
    testimonials: [
      { name: "Maida Y.", role: "Compradora", text: "Proceso transparente, acompañamiento completo y cronograma de pagos claro. Recomendado." },
      { name: "Luis A.", role: "Inversionista", text: "Buena proyección de plusvalía. Visité el proyecto y cerré en la primera semana." },
    ],
  };

  const attribution = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid","wbraid","gbraid"];
    const found = {}; keys.forEach(k => { const v = params.get(k); if (v) found[k]=v; });
    const STORAGE_KEY = "gm_attribution";
    try {
      const prev = sessionStorage.getItem(STORAGE_KEY);
      if (Object.keys(found).length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...(prev ? JSON.parse(prev) : {}), ...found }));
      }
      const merged = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
      if (!merged.referrer && document.referrer) merged.referrer = document.referrer;
      return merged;
    } catch { return { ...found, referrer: document.referrer || "" }; }
  }, []);

  useEffect(() => {
    if (CONFIG.tracking.ga4Id && CONFIG.tracking.ga4Id !== "G-XXXXXXXXXX") {
      if (!window.dataLayer) window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      if (!window.gtag) window.gtag = gtag;
      if (!document.getElementById("ga4-sdk")) {
        const s = document.createElement("script"); s.async = true; s.id = "ga4-sdk";
        s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.tracking.ga4Id}`;
        document.head.appendChild(s);
      }
      window.gtag("js", new Date()); window.gtag("config", CONFIG.tracking.ga4Id);
    }

    if (CONFIG.tracking.pixelId && CONFIG.tracking.pixelId !== "123456789012345") {
      if (!window.fbq) {
        const fbq = function(){ (fbq.callMethod ? fbq.callMethod : fbq.queue.push).apply(fbq, arguments); };
        fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; window.fbq = fbq;
        if (!document.getElementById("fb-pixel-sdk")) {
          const t = document.createElement("script"); t.async = true; t.id = "fb-pixel-sdk";
          t.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(t);
        }
      }
      try { window.fbq && window.fbq("init", CONFIG.tracking.pixelId); window.fbq && window.fbq("track", "PageView"); } catch {}
    }

    // PageView on initial load with attribution
    track("PageView", { ...attribution, page_location: window.location.href });
  }, []);

  const track = (name, params = {}) => {
    const payload = { ...params };
    try {
      if (typeof window.gtag === "function" && CONFIG.tracking.ga4Id !== "G-XXXXXXXXXX") window.gtag("event", name, payload);
      if (typeof window.fbq === "function" && CONFIG.tracking.pixelId !== "123456789012345") {
        if (name === "PageView") window.fbq("track", name, payload);
        else window.fbq("trackCustom", name, payload);
      }
    } catch {}
  };

  const gotoWhatsApp = (prefill = "") => {
    const message = encodeURIComponent(prefill || `Hola, me interesa recibir información de ${CONFIG.brand.name}.`);
    const phone = CONFIG.contact.whatsapp.replace(/[^+0-9]/g, "");
    track("wa_click", { phone, prefill: Boolean(prefill), ...attribution });
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  async function submitLead(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (!payload.nombre || !payload.telefono) { alert("Por favor, completa nombre y teléfono."); return; }

    const enriched = { source: "landing-mvp", brand: CONFIG.brand.name, timestamp: new Date().toISOString(), ...payload, ...attribution, page_location: window.location.href };
    try {
      const res = await fetch(CONFIG.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(enriched) });
      if (!res.ok) throw new Error("Error de envío");
      (e.currentTarget).reset();
      track("lead_submit", { project: payload.proyecto || "N/A", ...attribution });
      alert("✅ Recibimos tus datos. Te contactaremos en breve.");
    } catch (err) {
      console.error(err);
      alert("⚠️ No pudimos enviar el formulario. Verifica tu conexión o intenta más tarde.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40" style={{ borderColor: CONFIG.brand.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {CONFIG.brand.logoUrl ? (<img src={CONFIG.brand.logoUrl} alt="logo" className="h-9 w-auto" />) : (<div className="text-xl font-bold" style={{ color: CONFIG.brand.primary }}>{CONFIG.brand.name}</div>)}
            <span className="hidden sm:block text-sm text-gray-500">{CONFIG.brand.slogan}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { track("visit_schedule", { placement: "header", ...attribution }); gotoWhatsApp("Hola, deseo agendar una visita guiada."); }} className="px-4 py-2 rounded-2xl font-semibold border transition active:scale-[.98]" style={{ background: CONFIG.brand.accent, color: CONFIG.brand.light, borderColor: CONFIG.brand.accent }}>Agenda tu visita</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: CONFIG.brand.primary }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">Últimas unidades a precio preventa</h1>
            <p className="mt-4 text-lg text-gray-600">Desde $40–$60/m². Agenda tu visita y bloquea descuento.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => gotoWhatsApp("Hola, quiero información de proyectos y precios.")} className="px-5 py-3 rounded-2xl font-semibold shadow-sm" style={{ background: CONFIG.brand.primary, color: CONFIG.brand.light }}>Quiero información</button>
              <a href={CONFIG.contact.mapsUrl} target="_blank" className="px-5 py-3 rounded-2xl font-semibold border" style={{ borderColor: CONFIG.brand.primary, color: CONFIG.brand.primary }} onClick={() => track("map_click", { url: CONFIG.contact.mapsUrl, ...attribution })}>Ver ubicación</a>
            </div>
            <div className="mt-5 text-sm text-gray-500"><span className="font-semibold">WhatsApp:</span> {CONFIG.contact.whatsapp}</div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border bg-white">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop" className="h-full w-full object-cover" alt="Proyecto inmobiliario" />
            </div>
            <div className="absolute -bottom-4 left-4 px-4 py-2 rounded-xl text-sm font-semibold shadow" style={{ background: CONFIG.brand.accent, color: CONFIG.brand.light }}>Desde $40–$60 por m²</div>
          </div>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Propuesta de valor</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Financiamiento flexible", d: "Planes de 12 a 60 meses con cuotas accesibles." },
              { t: "Acompañamiento 360°", d: "Desde la visita hasta la firma." },
              { t: "Plusvalía", d: "Zonas con crecimiento y acceso." },
              { t: "Transparencia", d: "Documentación y cronogramas claros." },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: CONFIG.brand.primary + "22" }}>
                <div className="text-lg font-semibold">{b.t}</div>
                <div className="mt-2 text-gray-600">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proyectos */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Proyectos disponibles</h2>
            <button onClick={() => { track("visit_schedule", { placement: "projects", ...attribution }); gotoWhatsApp("Hola, quiero agendar visita guiada este fin de semana."); }} className="px-4 py-2 rounded-2xl font-semibold border" style={{ borderColor: CONFIG.brand.primary, color: CONFIG.brand.primary }}>Agendar visita</button>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {CONFIG.projects.map((p, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border bg-white shadow">
                <div className="aspect-[4/3]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="text-lg font-bold">{p.name}</div>
                  <div className="mt-1 text-sm text-gray-500">{p.size}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-extrabold">${p.priceFrom}</span>
                    <span className="text-sm text-gray-500">/ m²</span>
                  </div>
                  <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                    {p.benefits.map((b, idx) => (<li key={idx}>{b}</li>))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { track("quote_click", { project: p.name, ...attribution }); gotoWhatsApp(`Hola, me interesa ${p.name}.`); }} className="px-4 py-2 rounded-xl font-semibold" style={{ background: CONFIG.brand.primary, color: CONFIG.brand.light }}>Cotizar</button>
                    <button onClick={() => { track("visit_schedule", { project: p.name, ...attribution }); gotoWhatsApp(`Hola, deseo visitar ${p.name}.`); }} className="px-4 py-2 rounded-xl font-semibold border" style={{ borderColor: CONFIG.brand.primary, color: CONFIG.brand.primary }}>Visitar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Lo que dicen nuestros clientes</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {CONFIG.testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border p-6 shadow-sm bg-white">
                <p className="text-gray-700">“{t.text}”</p>
                <div className="mt-4 text-sm font-semibold">{t.name} · <span className="text-gray-500">{t.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-white p-6 shadow">
            <h3 className="text-xl font-bold">Déjanos tus datos</h3>
            <p className="mt-1 text-gray-600 text-sm">Nuestro equipo te contactará para enviarte precios, planos y coordinar tu visita guiada.</p>
            <form className="mt-6 grid sm:grid-cols-2 gap-4" onSubmit={submitLead}>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Nombre y apellido</label>
                <input name="nombre" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none" placeholder="Tu nombre" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Teléfono</label>
                <input name="telefono" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none" placeholder="Ej. 999 999 999" />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Proyecto</label>
                <select name="proyecto" className="mt-1 w-full rounded-xl border px-3 py-2">
                  {CONFIG.projects.map((p, i) => (<option key={i} value={p.name}>{p.name}</option>))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Presupuesto (US$)</label>
                <input name="presupuesto" className="mt-1 w-full rounded-xl border px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Mensaje</label>
                <textarea name="mensaje" className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-3 items-center">
                <button type="submit" className="px-5 py-3 rounded-2xl font-semibold shadow-sm" style={{ background: CONFIG.brand.accent, color: CONFIG.brand.light }}>Enviar</button>
                <button type="button" onClick={() => gotoWhatsApp("Hola, ya envié mis datos desde la web.")} className="px-5 py-3 rounded-2xl font-semibold border" style={{ borderColor: CONFIG.brand.primary, color: CONFIG.brand.primary }}>Hablar por WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold">{CONFIG.brand.name}</div>
              <div className="text-sm text-gray-500">{CONFIG.brand.slogan}</div>
              <div className="text-sm text-gray-500 mt-2">{CONFIG.contact.address}</div>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} {CONFIG.brand.name}. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
