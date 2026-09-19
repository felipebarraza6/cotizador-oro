/**
 * Cliente mínimo contra Yggdra públicos.
 * Contrato que cualquier landing de tenant puede reutilizar.
 *
 * POST /api/public/quote-preview/
 * POST /api/public/quotes/
 * GET  /api/public/landing-config/?slug=
 */

export const API_BASE =
  import.meta.env.VITE_YGGDRA_API_BASE?.replace(/\/$/, "") ||
  "https://api.yggdra.cl/api";

export const BRANCH_SLUG = import.meta.env.VITE_BRANCH_SLUG || "casa-oro";
export const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || "Casa de Oro";

export type Metal = "AU" | "AG" | "PT";

export const LOCAL_RATES: Record<Metal, { label: string; price: number; spread: number }> = {
  AU: { label: "Oro", price: 78_000, spread: 0.12 },
  AG: { label: "Plata", price: 980, spread: 0.18 },
  PT: { label: "Platino", price: 42_000, spread: 0.15 },
};

export interface QuotePreview {
  metal: string;
  purity_karat: number;
  weight_g: number;
  price_ref_clp_per_g: number;
  spread: number;
  purity_factor: number;
  total_clp: number;
  expires_at: string | null;
  source: "yggdra" | "local-fallback";
}

export interface QuoteSubmitResult {
  id: string | number;
  order_number?: string | null;
  total_clp: number;
  expires_at?: string | null;
  status: string;
}

function localPreview(metal: Metal, karat: number, weight: number): QuotePreview {
  const rate = LOCAL_RATES[metal];
  const purity = Math.min(24, Math.max(1, karat)) / 24;
  const total = weight * purity * rate.price * (1 - rate.spread);
  return {
    metal,
    purity_karat: karat,
    weight_g: weight,
    price_ref_clp_per_g: rate.price,
    spread: rate.spread,
    purity_factor: purity,
    total_clp: Math.round(total),
    expires_at: new Date(Date.now() + 48 * 3600_000).toISOString(),
    source: "local-fallback",
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* empty */
    }
    const err = new Error(detail) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function fetchQuotePreview(
  metal: Metal,
  purity_karat: number,
  weight_g: number,
): Promise<QuotePreview> {
  try {
    const remote = await postJson<QuotePreview>("/public/quote-preview/", {
      metal,
      purity_karat,
      weight_g,
      slug: BRANCH_SLUG,
    });
    return { ...remote, source: "yggdra" };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (!status || status === 404 || status === 405 || status === 501 || status >= 500) {
      return localPreview(metal, purity_karat, weight_g);
    }
    if (e instanceof TypeError) return localPreview(metal, purity_karat, weight_g);
    throw e;
  }
}

export async function submitQuote(payload: {
  metal: Metal;
  purity_karat: number;
  weight_g: number;
  contact_name: string;
  email?: string;
  phone?: string;
}): Promise<QuoteSubmitResult> {
  return postJson<QuoteSubmitResult>("/public/quotes/", {
    ...payload,
    slug: BRANCH_SLUG,
  });
}

export function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}
