import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BRANCH_SLUG,
  BRAND_NAME,
  LOCAL_RATES,
  fetchQuotePreview,
  formatCLP,
  submitQuote,
  type Metal,
  type QuotePreview,
} from "./api";

const METALS: Metal[] = ["AU", "AG", "PT"];
const KARATS = [24, 22, 18, 14, 10];

export default function App() {
  const [metal, setMetal] = useState<Metal>("AU");
  const [karat, setKarat] = useState(18);
  const [weight, setWeight] = useState(10);
  const [preview, setPreview] = useState<QuotePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const inputKey = useMemo(() => `${metal}-${karat}-${weight}`, [metal, karat, weight]);

  useEffect(() => {
    let cancelled = false;
    setLoadingPreview(true);
    const t = window.setTimeout(async () => {
      try {
        const p = await fetchQuotePreview(metal, karat, weight);
        if (!cancelled) setPreview(p);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    }, 160);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [inputKey, metal, karat, weight]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name.trim() || (!email.trim() && !phone.trim())) {
      setMsg({ type: "err", text: "Nombre y al menos email o teléfono." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuote({
        metal,
        purity_karat: karat,
        weight_g: weight,
        contact_name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setMsg({
        type: "ok",
        text: `Cotización ${res.order_number ?? res.id} enviada (${formatCLP(res.total_clp)}). Te contactamos para el retiro.`,
      });
    } catch (err) {
      const status = (err as { status?: number }).status;
      const text =
        status === 404 || status === 501
          ? "La API pública de cotis aún no está desplegada en este entorno. El preview local igual sirve para demo visual."
          : err instanceof Error
            ? err.message
            : "No se pudo enviar.";
      setMsg({ type: "err", text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">{BRAND_NAME}</div>
        <span className="badge">slug · {BRANCH_SLUG}</span>
      </header>

      <div className="hero">
        <div>
          <span className="badge">Precio del día · prototipo</span>
          <h1>Cotizá tu oro en 30 segundos</h1>
          <p className="lead">
            Oferta clara con ley, peso y spread. Esta landing es un proyecto aparte: solo
            consume la API pública de Yggdra (la misma que usaría cualquier tenant Gungir).
          </p>
          <ul className="points">
            <li>Sin instalar app</li>
            <li>Vigencia típica 48 h</li>
            <li>Pago en el local</li>
          </ul>
        </div>

        <form className="card" onSubmit={onSubmit}>
          <h2>Cotizador</h2>

          <fieldset className="fieldset">
            <span className="legend">Metal</span>
            <div className="chips">
              {METALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip${metal === m ? " active" : ""}`}
                  onClick={() => setMetal(m)}
                >
                  {LOCAL_RATES[m].label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <span className="legend">Ley (kilates)</span>
            <div className="chips">
              {KARATS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`chip${karat === k ? " active" : ""}`}
                  onClick={() => setKarat(k)}
                >
                  {k}k
                </button>
              ))}
            </div>
          </fieldset>

          <label className="fieldset">
            <span className="legend">Peso (gramos)</span>
            <input
              className="range"
              type="range"
              min={0.5}
              max={200}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            <input
              className="input"
              type="number"
              min={0.1}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(Math.max(0.1, Number(e.target.value) || 0.1))}
            />
          </label>

          <div className="offer">
            <div className="label">Oferta estimada</div>
            <div className="total">
              {loadingPreview && !preview ? "…" : formatCLP(preview?.total_clp ?? 0)}
            </div>
            {preview && (
              <div className="meta">
                Ref. {formatCLP(preview.price_ref_clp_per_g)}/g · ley{" "}
                {(preview.purity_factor * 100).toFixed(1)}% · spread{" "}
                {(preview.spread * 100).toFixed(0)}% ·{" "}
                {preview.source === "yggdra" ? "Yggdra" : "preview local"}
              </div>
            )}
          </div>

          <div className="grid-2" style={{ marginBottom: "0.75rem" }}>
            <label style={{ gridColumn: "1 / -1" }}>
              <span className="legend">Nombre</span>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              <span className="legend">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              <span className="legend">Teléfono</span>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar cotización"}
          </button>
        </form>
      </div>

      <footer className="footer">
        <span>
          Powered by Yggdra · producto general{" "}
          <a href="https://github.com/felipebarraza6/gungir" target="_blank" rel="noreferrer">
            Gungir
          </a>
        </span>
        <a href="https://github.com/felipebarraza6/cotizador-oro" target="_blank" rel="noreferrer">
          código de esta landing
        </a>
      </footer>
    </div>
  );
}
