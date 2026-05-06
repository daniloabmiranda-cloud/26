import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const C = {
  bg: "#06090F", card: "#0E1320", card2: "#141C2E", border: "#1B2640",
  acc: "#3B82F6", grn: "#10B981", grnD: "#064E3B", red: "#EF4444", redD: "#7F1D1D",
  org: "#F59E0B", pur: "#8B5CF6", cyn: "#06B6D4", pnk: "#EC4899",
  txt: "#E2E8F0", dim: "#94A3B8", mut: "#64748B",
};
const PC = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#84CC16", "#F97316", "#14B8A6", "#E879F9", "#FB923C"];

function fmt(n) {
  if (n == null || isNaN(n)) return "–";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}
function fB(n) {
  if (n == null || isNaN(n)) return "–";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fP(n) {
  if (n == null || isNaN(n)) return "–";
  return n.toFixed(2) + "%";
}

function Badge({ s }) {
  const v = (s || "").toLowerCase();
  let bg, tx, lb;
  if (["active", "ativada", "enabled"].includes(v)) {
    bg = C.grnD; tx = C.grn; lb = "Ativa";
  } else if (v === "not_delivering") {
    bg = C.redD; tx = C.red; lb = "Sem veiculação";
  } else {
    bg = C.redD; tx = C.red; lb = "Inativa";
  }
  return (
    <span style={{ background: bg, color: tx, padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
      {lb}
    </span>
  );
}

function KPI({ t, v, s, c }) {
  return (
    <div style={{ background: "linear-gradient(135deg," + C.card + "," + C.card2 + ")", border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", flex: "1 1 180px", minWidth: 160, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -18, right: -18, width: 72, height: 72, borderRadius: "50%", background: c || C.acc, opacity: 0.06 }} />
      <div style={{ fontSize: 13, color: C.mut, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5, fontWeight: 700 }}>{t}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.txt, letterSpacing: -0.5 }}>{v}</div>
      {s ? <div style={{ fontSize: 14, color: C.dim, marginTop: 3 }}>{s}</div> : null}
    </div>
  );
}

function STitle({ children }) {
  return (
    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.txt, margin: "26px 0 12px", borderLeft: "3px solid " + C.acc, paddingLeft: 12 }}>
      {children}
    </h3>
  );
}

function CTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "10px 14px", fontSize: 14 }}>
      <div style={{ color: C.dim, marginBottom: 3 }}>{label}</div>
      {payload.map(function (p, i) {
        return (
          <div key={i} style={{ color: p.color || C.txt, fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value}
          </div>
        );
      })}
    </div>
  );
}

function Tbl({ data, cols }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid " + C.border, marginBottom: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {cols.map(function (c, i) {
              return (
                <th key={i} style={{ padding: "12px 14px", background: C.card2, color: C.mut, fontWeight: 700, textAlign: c.r ? "right" : "left", borderBottom: "1px solid " + C.border, whiteSpace: "nowrap", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {c.l}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: "24px 14px", color: C.dim, textAlign: "center", fontSize: 14, fontStyle: "italic" }}>
                Nenhuma campanha encontrada com este filtro.
              </td>
            </tr>
          ) : data.map(function (row, ri) {
            return (
              <tr key={ri} style={{ background: ri % 2 === 0 ? C.card : C.bg }}>
                {cols.map(function (c, ci) {
                  return (
                    <td key={ci} style={{ padding: "11px 14px", color: C.txt, borderBottom: "1px solid " + C.border, textAlign: c.r ? "right" : "left", whiteSpace: c.nw ? "nowrap" : "normal", maxWidth: c.mw || "none", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.fn ? c.fn(row) : row[c.k]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartBox({ title, children, h }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
      {title ? <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 12 }}>{title}</div> : null}
      <ResponsiveContainer width="100%" height={h || 240}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function StatusFilter({ value, onChange, activeCount, inactiveCount }) {
  var options = [
    { id: "active", label: "Ativas", count: activeCount, color: C.grn, bg: C.grnD },
    { id: "inactive", label: "Inativas", count: inactiveCount, color: C.red, bg: C.redD },
    { id: "all", label: "Todas", count: activeCount + inactiveCount, color: C.acc, bg: "rgba(59,130,246,0.15)" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {options.map(function (o) {
        var selected = value === o.id;
        return (
          <button
            key={o.id}
            onClick={function () { onChange(o.id); }}
            style={{
              padding: "8px 18px",
              border: selected ? "2px solid " + o.color : "2px solid " + C.border,
              borderRadius: 10,
              background: selected ? o.bg : "transparent",
              color: selected ? o.color : C.dim,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: selected ? 700 : 500,
              fontFamily: "inherit",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {o.label}
            <span style={{
              background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
            }}>
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function filterCamps(data, filter) {
  if (filter === "all") return data;
  if (filter === "active") return data.filter(function (c) { return c.s === "active"; });
  return data.filter(function (c) { return c.s !== "active"; });
}

/* ═══════════ DATA ═══════════ */

const planetaMetaCamps = [
  { n: "[RMKT]-[SITE]-[CARRINHO]-[26/03]", s: "inactive", sp: 1.68, rc: 124, imp: 126, res: null, ind: "–", cpr: null },
  { n: "[REC]-[FRETE+MATERIAL]-02/02", s: "active", sp: 362.22, rc: 207533, imp: 340683, res: 207533, ind: "Alcance", cpr: 1.75 },
  { n: "[CATALAGO]-[ADV+]-[DADOS CARRINHO]-[15/04]", s: "active", sp: 416.51, rc: 11511, imp: 28761, res: 128, ind: "Add to Cart", cpr: 3.25 },
  { n: "[CATALAGO]-[ADV+]-[COMPRA]-[15/04]", s: "inactive", sp: 107.12, rc: 3017, imp: 3717, res: null, ind: "–", cpr: null },
  { n: "[P1]-[CHEQUE MORADIA]-[IG/FB]-[20/02]", s: "active", sp: 582.04, rc: 24680, imp: 53674, res: 232, ind: "Conversas", cpr: 2.51 },
  { n: "[CATALAGO]-[ADV+]-[COMPRA]-[20/04]", s: "inactive", sp: 71.22, rc: 2242, imp: 2308, res: null, ind: "–", cpr: null },
  { n: "[TURBO]-[09/04] FRETE GRÁTIS", s: "inactive", sp: 48.03, rc: 3719, imp: 5157, res: 76, ind: "Link Click", cpr: 0.63 },
  { n: "[FRIO]-[DVR/CAMERAS]-[ADV]-[14/04]", s: "inactive", sp: 38.33, rc: 571, imp: 722, res: null, ind: "–", cpr: null },
  { n: "[MORNO]-[SITE]-[ENTREGA]-[17/04]", s: "inactive", sp: 165.07, rc: 14468, imp: 21819, res: 456, ind: "Landing Page", cpr: 0.36 },
  { n: "[CATALAGO]-[SEMELH.]-[ADV+]-[23/04]", s: "inactive", sp: 83.41, rc: 4213, imp: 7344, res: 12, ind: "Add to Cart", cpr: 6.95 },
  { n: "[P1]-[CHEQUE MORADIA]-[IG/FB]-[24/04]", s: "inactive", sp: 50.66, rc: 2873, imp: 4480, res: 4, ind: "Conversas", cpr: 12.67 },
  { n: "[MORNO]-[BRANDING]-[PROMOÇÃO]-[27/04]", s: "inactive", sp: 42.57, rc: 19848, imp: 28922, res: 19848, ind: "Alcance", cpr: 2.14 },
  { n: "[P1]-[CHEQUE MORADIA]-[IG/FB]-[30/04]", s: "active", sp: 28.17, rc: 1942, imp: 2299, res: 12, ind: "Conversas", cpr: 2.35 },
];

const planetaGoogle = {
  search: { sp: 7278.19, cl: 1779, imp: 30196, ctr: 5.89, conv: 569, cpaConv: 12.79, cr: 31.98 },
  pmax: { sp: 4560.37, cl: 2043, imp: 47502, ctr: 4.30, conv: 488, cpaConv: 9.35, cr: 12.73 },
  gmn: { sp: 1295.32, imp: 10400, cl: 996, calls: 23 },
  gmnOrganic: {
    interacoes: { abr: 1126, mar: 1212, var: -7.10 },
    chamadas: { abr: 192, mar: 232, var: -17.24 },
    rotas: { abr: 670, mar: 749, var: -10.55 },
    cliqSite: { abr: 164, mar: 149, var: 10.07 },
    avaliacoes: { abr: 494, mar: 485, var: 1.86 },
  },
};

const planetaKW = [
  { kw: "loja de eletrica perto de mim", cl: 401, imp: 6144, conv: 126, cost: 1581.97, ctr: 6.53, cr: 31.42 },
  { kw: "[comprar material elétrico]", cl: 309, imp: 3557, conv: 108, cost: 1236.85, ctr: 8.69, cr: 34.95 },
  { kw: "loja iluminação", cl: 308, imp: 6565, conv: 95, cost: 1230.82, ctr: 4.69, cr: 30.84 },
  { kw: "cabos eletricos", cl: 219, imp: 7699, conv: 81, cost: 983.41, ctr: 2.84, cr: 36.99 },
  { kw: "[material elétrico]", cl: 135, imp: 1767, conv: 47, cost: 576.38, ctr: 7.64, cr: 34.81 },
  { kw: "[loja de material elétrico]", cl: 141, imp: 1153, conv: 40, cost: 594.11, ctr: 12.23, cr: 28.37 },
  { kw: "distribuidora material elétrico", cl: 48, imp: 562, conv: 14, cost: 206.34, ctr: 8.54, cr: 29.17 },
  { kw: "loja material elétrico perto", cl: 56, imp: 544, conv: 16, cost: 232.97, ctr: 10.29, cr: 28.57 },
];

const havCamps = [
  { n: "[MORNO]-[HAV]-[WPP]-[MF]-[01/12]", s: "inactive", sp: 34.55, rc: 6935, imp: 7947, res: 30, ind: "Conversas", cpm: 4.35, lc: 79, ctr: 0.99 },
  { n: "[TURBO]-[20/01] Havaianas iFood", s: "active", sp: 310.13, rc: 39156, imp: 59737, res: 1667, ind: "Visitas perfil", cpm: 5.19, lc: 1615, ctr: 2.70 },
  { n: "[FRIO]-[REC LOCAL]-[FORMOSA]-[10/02]", s: "inactive", sp: 41.54, rc: 30626, imp: 40715, res: 30626, ind: "Alcance", cpm: 1.02, lc: 0, ctr: 0 },
  { n: "[MORNO]-[HAVABAZAR]-[TRAFEGO]-[24/03]", s: "inactive", sp: 115.55, rc: 15578, imp: 23198, res: 728, ind: "Landing Page", cpm: 4.98, lc: 1082, ctr: 4.66 },
  { n: "[MORNO]-[Vini Jr.]-[WPP]-[MF]-[01/04]", s: "active", sp: 891.27, rc: 63349, imp: 178336, res: 709, ind: "Conversas", cpm: 5.00, lc: 1789, ctr: 1.00 },
  { n: "[FRIO]-[REC]-[Vini.Jr]-[06/04]", s: "inactive", sp: 356.67, rc: 197629, imp: 324473, res: 197629, ind: "Alcance", cpm: 1.10, lc: 0, ctr: 0 },
  { n: "[MORNO]-[Vini Jr.]-[WPP]-[M]-[11/04]", s: "inactive", sp: 63.59, rc: 8088, imp: 11538, res: 24, ind: "Conversas", cpm: 5.51, lc: 67, ctr: 0.58 },
  { n: "[TURBO]-[27/04] Dia das Mães", s: "active", sp: 34.35, rc: 3968, imp: 4663, res: 125, ind: "Visitas perfil", cpm: 7.37, lc: 112, ctr: 2.40 },
  { n: "[MORNO]-[DIA DAS MAES]-[FM]-[30/04]", s: "active", sp: 18.54, rc: 2555, imp: 3101, res: 31, ind: "Conversas", cpm: 5.98, lc: 81, ctr: 2.61 },
];

const usaCamps = [
  { n: "[MORNO]-[WPP-VENDA]-[PQS]-[18/02]", s: "inactive", sp: 180.60, rc: 11064, imp: 19290, res: 62, ind: "Conversas", conv: 62 },
  { n: "[MORNO]-[WPP VENDA]-[P.VARGAS]-[14/03]", s: "inactive", sp: 12.50, rc: 857, imp: 1052, res: 8, ind: "Conversas", conv: 8 },
  { n: "[ABERTO]-[REC]-[F]-[PROMO]-[26/03]", s: "inactive", sp: 141.67, rc: 82500, imp: 137522, res: 82500, ind: "Alcance", conv: 0 },
  { n: "[VENDA]-[WPP-SEMELH.]-[IT.CENTER]", s: "active", sp: 669.84, rc: 25915, imp: 64987, res: 261, ind: "Conversas", conv: 261 },
  { n: "[MORNO]-[REC]-[FALTA 3 DIAS]-[12/04]", s: "inactive", sp: 29.75, rc: 23559, imp: 24635, res: 23559, ind: "Alcance", conv: 0 },
  { n: "[MORNO]-[TRAFEGO]-[BAZAR]-[11/04]", s: "inactive", sp: 447.78, rc: 57141, imp: 105996, res: 1948, ind: "Landing Page", conv: 0 },
  { n: "[RMKT]-[BAZAR]-[13/04]", s: "inactive", sp: 42.92, rc: 6005, imp: 6798, res: 393, ind: "Landing Page", conv: 0 },
  { n: "[FRIO]-[REC INVERNO]-[IG/FB]-[20/04]", s: "inactive", sp: 115.64, rc: 52394, imp: 86388, res: 52394, ind: "Alcance", conv: 0 },
  { n: "[MORNO]-[ENGAJ]-[WPP]-[20/04]", s: "inactive", sp: 40.99, rc: 1650, imp: 2476, res: null, ind: "–", conv: 0 },
  { n: "[MORNO]-[ENGAJ]-[WPP]-[23/04]", s: "inactive", sp: 7.07, rc: 463, imp: 596, res: 1, ind: "Conversas", conv: 1 },
  { n: "[MORNO]-[WPP]-[CASTANHEIRA]-[23/04]", s: "active", sp: 153.67, rc: 8070, imp: 12706, res: 67, ind: "Conversas", conv: 67 },
  { n: "[REC]-[ABERTO]-[TENIS]-[27/04]", s: "active", sp: 69.16, rc: 34669, imp: 43939, res: 34669, ind: "Alcance", conv: 0 },
  { n: "[VENDA]-[WPP-FRIO]-[IT.CENTER]-[28/04]", s: "active", sp: 53.77, rc: 3297, imp: 4261, res: 30, ind: "Conversas", conv: 30 },
];

const marcCamps = [
  { n: "[LEADS]-[TESTE PUBLICO]-[ELETROSTATICO]-[26/02]", s: "inactive", sp: 488.08, rc: 19360, imp: 34451, res: 31, ind: "Conversas", lc: 212, cpm: 14.17 },
  { n: "[WPP]-[MENSAGEM]-[PINTURA-ELETROSTÁTICA]-[14/03]", s: "inactive", sp: 29.90, rc: 2069, imp: 2316, res: 1, ind: "Conversas", lc: 12, cpm: 12.91 },
];

const marcSets = [
  { n: "Melhoria da Casa / DIY / Público Amplo", s: "not_delivering", sp: 488.08, res: 31, cpr: 15.74 },
  { n: "Casa / Marcenaria / Residencial", s: "not_delivering", sp: 29.90, res: 1, cpr: 29.90 },
];

const marcGMN = { sp: 732.61, imp: 51500, cl: 3850, calls: 20 };

/* ═══════════ MARCH DATA (COMPARATIVO) ═══════════ */

var marData = {
  planeta: {
    meta: { sp: 2751.66, reach: 393873, imp: 732046, conv: 487 },
    search: { sp: 7266.45, cl: 1815, imp: 26829, ctr: 6.77, conv: 585, cpa: 12.42, cr: 32.23 },
    pmax: { sp: 4555.89, cl: 2281, imp: 64451, ctr: 3.54, conv: 445, cpa: 10.24, cr: 13.26, convVal: 441 },
    gmn: { sp: 1299.06, imp: 16600, cl: 1570, calls: 14 },
    total: 15873.06,
  },
  havaianas: { meta: { sp: 2405.82, reach: 386316, imp: 1056921, conv: 991 }, total: 2405.82 },
  usaflex: { meta: { sp: 2393.73, reach: 268879, imp: 720789, conv: 655 }, total: 2393.73 },
  marcenaria: { meta: { sp: 1036.22, reach: 49179, imp: 79588, conv: 45 }, gmn: { sp: 772.49, imp: 21100, cl: 1120, calls: 17 }, total: 1808.71 },
};
var abrData = {
  planeta: {
    meta: { sp: 1997.03, reach: 296221, imp: 500013, conv: 248 },
    search: { sp: 7278.19, cl: 1779, imp: 30196, ctr: 5.89, conv: 569, cpa: 12.79, cr: 31.98 },
    pmax: { sp: 4560.37, cl: 2043, imp: 47502, ctr: 4.30, conv: 488, cpa: 9.35, cr: 12.73, convVal: 488 },
    gmn: { sp: 1295.32, imp: 10400, cl: 996, calls: 23 },
    total: 15130.91,
  },
  havaianas: { meta: { sp: 1866.19, reach: 367884, imp: 653708, conv: 794 }, total: 1866.19 },
  usaflex: { meta: { sp: 1965.36, reach: 308584, imp: 510646, conv: 429 }, total: 1965.36 },
  marcenaria: { meta: { sp: 517.98, reach: 21429, imp: 36767, conv: 32 }, gmn: { sp: 732.61, imp: 51500, cl: 3850, calls: 20 }, total: 1250.59 },
};

function pctVar(mar, abr) {
  if (!mar || mar === 0) return null;
  return ((abr - mar) / mar) * 100;
}

function fInt(n) {
  if (n == null || isNaN(n)) return "–";
  return Math.round(n).toLocaleString("pt-BR");
}

function CompareKPI({ title, marVal, abrVal, format, invert }) {
  var marF = format === "brl" ? fB(marVal) : format === "pct" ? fP(marVal) : format === "int" ? fInt(marVal) : fmt(marVal);
  var abrF = format === "brl" ? fB(abrVal) : format === "pct" ? fP(abrVal) : format === "int" ? fInt(abrVal) : fmt(abrVal);
  var v = pctVar(marVal, abrVal);
  var positive = invert ? v <= 0 : v >= 0;
  var color = v === null ? C.dim : positive ? C.grn : C.red;
  var arrow = v === null ? "" : v >= 0 ? "▲" : "▼";
  return (
    <div style={{ background: "linear-gradient(135deg," + C.card + "," + C.card2 + ")", border: "1px solid " + C.border, borderRadius: 14, padding: "16px 20px", flex: "1 1 200px", minWidth: 180 }}>
      <div style={{ fontSize: 12, color: C.mut, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 2 }}>Mar</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.dim }}>{marF}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.acc, marginBottom: 2 }}>Abr</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.txt }}>{abrF}</div>
        </div>
      </div>
      {v !== null ? (
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: color }}>
          {arrow} {Math.abs(v).toFixed(1)}%
        </div>
      ) : null}
    </div>
  );
}

/* ═══════════ VIEWS ═══════════ */

function OverviewView() {
  var dAbr = [
    { name: "Planeta Energia", meta: 1997, google: 11839, gmn: 1295, total: 15131, color: C.acc },
    { name: "Havaianas", meta: 1866, google: 0, gmn: 0, total: 1866, color: C.pnk },
    { name: "Usaflex", meta: 1965, google: 0, gmn: 0, total: 1965, color: C.pur },
    { name: "Masterplan Marc.", meta: 518, google: 0, gmn: 733, total: 1251, color: C.org },
  ];
  var dComp = [
    { name: "Planeta Energia", mar: 15873, abr: 15131, color: C.acc },
    { name: "Havaianas", mar: 2406, abr: 1866, color: C.pnk },
    { name: "Usaflex", mar: 2394, abr: 1965, color: C.pur },
    { name: "Masterplan Marc.", mar: 1809, abr: 1251, color: C.org },
  ];
  var gtMar = 15873 + 2406 + 2394 + 1809;
  var gtAbr = dAbr.reduce(function (a, b) { return a + b.total; }, 0);

  return (
    <div>
      <STitle>Comparativo Geral — Março vs Abril 2026</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <CompareKPI title="Investimento Total" marVal={gtMar} abrVal={gtAbr} format="brl" invert={true} />
        <CompareKPI title="Conversões Google" marVal={585 + 445} abrVal={569 + 488} format="int" />
        <CompareKPI title="Conversas Meta" marVal={487 + 991 + 655 + 45} abrVal={248 + 794 + 429 + 32} format="" />
        <CompareKPI title="Chamadas GMN" marVal={14 + 17} abrVal={23 + 20} format="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <ChartBox title="Investimento por Empresa — Março vs Abril">
          <BarChart data={dComp} barGap={6} barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 13 }} />
            <YAxis tick={{ fill: C.dim, fontSize: 13 }} tickFormatter={function (v) { return "R$" + (v / 1000).toFixed(0) + "K"; }} />
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="mar" name="Março" fill="#64748B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="abr" name="Abril" fill={C.acc} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartBox>
        <ChartBox title="Distribuição Abril">
          <PieChart>
            <Pie data={dAbr.map(function (e) { return { name: e.name, value: e.total }; })} dataKey="value" cx="50%" cy="50%" outerRadius={85} innerRadius={42} paddingAngle={3} strokeWidth={0}>
              {dAbr.map(function (e, i) { return <Cell key={i} fill={e.color} />; })}
            </Pie>
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
          </PieChart>
        </ChartBox>
      </div>
      <STitle>Canais por Empresa — Abril</STitle>
      <ChartBox title="">
        <BarChart data={dAbr} barGap={4} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 13 }} />
          <YAxis tick={{ fill: C.dim, fontSize: 13 }} tickFormatter={function (v) { return "R$" + (v / 1000).toFixed(0) + "K"; }} />
          <Tooltip content={<CTip />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="meta" name="Meta Ads" fill={C.acc} radius={[4, 4, 0, 0]} />
          <Bar dataKey="google" name="Google Ads" fill={C.grn} radius={[4, 4, 0, 0]} />
          <Bar dataKey="gmn" name="Google Maps" fill={C.org} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartBox>
    </div>
  );
}

function PlanetaView() {
  var tMeta = planetaMetaCamps.reduce(function (a, b) { return a + b.sp; }, 0);
  var tGoogle = planetaGoogle.search.sp + planetaGoogle.pmax.sp;
  var tGConv = planetaGoogle.search.conv + planetaGoogle.pmax.conv;
  var tAll = tMeta + tGoogle + planetaGoogle.gmn.sp;
  var ac = planetaMetaCamps.filter(function (c) { return c.s === "active"; }).length;
  var ic = planetaMetaCamps.length - ac;
  const [campFilter, setCampFilter] = useState("active");
  var spCh = [
    { name: "Meta Ads", value: Math.round(tMeta) },
    { name: "Google Pesquisa", value: Math.round(planetaGoogle.search.sp) },
    { name: "Google PMax", value: Math.round(planetaGoogle.pmax.sp) },
    { name: "Google Maps", value: Math.round(planetaGoogle.gmn.sp) },
  ];

  return (
    <div>
      <STitle>Comparativo Março vs Abril</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <CompareKPI title="Investimento Total" marVal={marData.planeta.total} abrVal={tAll} format="brl" invert={true} />
        <CompareKPI title="Conversões Google" marVal={marData.planeta.search.conv + marData.planeta.pmax.conv} abrVal={tGConv} format="int" />
        <CompareKPI title="Conversas Meta" marVal={marData.planeta.meta.conv} abrVal={248} format="" />
        <CompareKPI title="Chamadas GMN" marVal={marData.planeta.gmn.calls} abrVal={planetaGoogle.gmn.calls} format="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
        <ChartBox title="Distribuição de Investimento por Canal">
          <PieChart>
            <Pie data={spCh} dataKey="value" cx="50%" cy="50%" outerRadius={78} innerRadius={38} paddingAngle={3} strokeWidth={0}>
              {spCh.map(function (_, i) { return <Cell key={i} fill={PC[i]} />; })}
            </Pie>
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
          </PieChart>
        </ChartBox>
        <ChartBox title="Google Ads — Conversões por Campanha">
          <BarChart data={[{ name: "Pesquisa", conv: 569 }, { name: "PMax", conv: 488 }]} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 13 }} />
            <YAxis tick={{ fill: C.dim, fontSize: 13 }} />
            <Tooltip content={<CTip />} />
            <Bar dataKey="conv" name="Conversões" fill={C.acc} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartBox>
      </div>

      <STitle>Google Ads — Pesquisa (Mar vs Abr)</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <CompareKPI title="Conversões" marVal={585} abrVal={569} format="int" />
        <CompareKPI title="CPA" marVal={12.42} abrVal={12.79} format="brl" invert={true} />
        <CompareKPI title="Cliques" marVal={1815} abrVal={1779} format="int" />
        <CompareKPI title="Investimento" marVal={7266.45} abrVal={7278.19} format="brl" invert={true} />
      </div>

      <STitle>Top Palavras-chave (Google Pesquisa)</STitle>
      <Tbl data={planetaKW} cols={[
        { l: "Palavra-chave", k: "kw" },
        { l: "Cliques", r: true, fn: function (r) { return fmt(r.cl); } },
        { l: "Impr.", r: true, fn: function (r) { return fmt(r.imp); } },
        { l: "Conv.", r: true, fn: function (r) { return fmt(r.conv); } },
        { l: "Custo", r: true, nw: true, fn: function (r) { return fB(r.cost); } },
        { l: "CTR", r: true, fn: function (r) { return fP(r.ctr); } },
        { l: "Taxa Conv.", r: true, fn: function (r) { return fP(r.cr); } },
      ]} />

      <STitle>Google Ads — Performance Max (Mar vs Abr)</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <CompareKPI title="Conversões" marVal={445} abrVal={488} format="int" />
        <CompareKPI title="CPA" marVal={10.24} abrVal={9.35} format="brl" invert={true} />
        <CompareKPI title="Cliques" marVal={2281} abrVal={2043} format="int" />
        <CompareKPI title="Investimento" marVal={4555.89} abrVal={4560.37} format="brl" invert={true} />
      </div>

      <STitle>Google Maps — GMN Pago (Mar vs Abr)</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <CompareKPI title="Gasto GMN" marVal={1299.06} abrVal={1295.32} format="brl" invert={true} />
        <CompareKPI title="Impressões" marVal={16600} abrVal={10400} format="" />
        <CompareKPI title="Cliques" marVal={1570} abrVal={996} format="int" />
        <CompareKPI title="Chamadas" marVal={14} abrVal={23} format="" />
      </div>

      <STitle>Google Maps — Perfil Orgânico (Abril vs Março)</STitle>
      <Tbl data={[
        { m: "Interações no Perfil", abr: 1126, mar: 1212, v: -7.10 },
        { m: "Chamadas pelo Perfil", abr: 192, mar: 232, v: -17.24 },
        { m: "Solicitações de Rotas", abr: 670, mar: 749, v: -10.55 },
        { m: "Cliques para o Site", abr: 164, mar: 149, v: 10.07 },
        { m: "Avaliações no Mês", abr: 494, mar: 485, v: 1.86 },
      ]} cols={[
        { l: "Métrica", k: "m" },
        { l: "Mar/26", r: true, fn: function (r) { return fmt(r.mar); } },
        { l: "Abr/26", r: true, fn: function (r) { return fmt(r.abr); } },
        {
          l: "Variação", r: true, fn: function (r) {
            var color = r.v >= 0 ? C.grn : C.red;
            var arrow = r.v >= 0 ? "▲" : "▼";
            return <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{arrow} {Math.abs(r.v).toFixed(2)}%</span>;
          }
        },
      ]} />

      <STitle>{"Meta Ads — Campanhas (" + ac + " ativas / " + ic + " inativas)"}</STitle>
      <StatusFilter value={campFilter} onChange={setCampFilter} activeCount={ac} inactiveCount={ic} />
      <Tbl data={filterCamps(planetaMetaCamps, campFilter)} cols={[
        { l: "Campanha", fn: function (r) { return <span style={{ fontSize: 14 }}>{r.n}</span>; }, mw: 260 },
        { l: "Status", fn: function (r) { return <Badge s={r.s} />; }, nw: true },
        { l: "Invest.", r: true, nw: true, fn: function (r) { return fB(r.sp); } },
        { l: "Alcance", r: true, fn: function (r) { return fmt(r.rc); } },
        { l: "Impr.", r: true, fn: function (r) { return fmt(r.imp); } },
        { l: "Resultados", r: true, fn: function (r) { return r.res ? fmt(r.res) : "–"; } },
        { l: "Tipo", fn: function (r) { return <span style={{ fontSize: 13, color: C.dim }}>{r.ind}</span>; } },
        { l: "CPR", r: true, nw: true, fn: function (r) { return r.cpr ? fB(r.cpr) : "–"; } },
      ]} />
    </div>
  );
}

function HavaianasView() {
  var tSp = havCamps.reduce(function (a, b) { return a + b.sp; }, 0);
  var tLc = havCamps.reduce(function (a, b) { return a + (b.lc || 0); }, 0);
  var ac = havCamps.filter(function (c) { return c.s === "active"; }).length;
  var ic = havCamps.length - ac;
  const [campFilter, setCampFilter] = useState("active");
  var barData = havCamps.map(function (c) { return { name: c.n.length > 24 ? c.n.substring(0, 24) + "..." : c.n, spend: c.sp }; });

  return (
    <div>
      <STitle>Comparativo Março vs Abril</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <CompareKPI title="Investimento Meta" marVal={marData.havaianas.meta.sp} abrVal={tSp} format="brl" invert={true} />
        <CompareKPI title="Conversas WhatsApp" marVal={marData.havaianas.meta.conv} abrVal={794} format="" />
        <CompareKPI title="Alcance" marVal={marData.havaianas.meta.reach} abrVal={367884} format="" />
        <CompareKPI title="Cliques no Link" marVal={6330} abrVal={tLc} format="int" />
        <KPI t="Vis. Landing Page" v={fmt(728)} s="Campanha HavaBazar" c={C.pur} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 8 }}>
        <ChartBox title="Investimento por Campanha">
          <BarChart data={barData} barSize={22} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{ fill: C.dim, fontSize: 13 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: C.dim, fontSize: 12 }} width={150} />
            <Tooltip content={<CTip />} />
            <Bar dataKey="spend" name="Invest. (R$)" fill={C.pnk} radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartBox>
        <ChartBox title="Status das Campanhas">
          <PieChart>
            <Pie data={[{ name: "Ativas", value: ac }, { name: "Inativas", value: ic }]} dataKey="value" cx="50%" cy="50%" outerRadius={68} innerRadius={34} paddingAngle={5} strokeWidth={0}>
              <Cell fill={C.grn} />
              <Cell fill={C.red} />
            </Pie>
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
          </PieChart>
        </ChartBox>
      </div>
      <STitle>{"Campanhas Meta Ads (" + ac + " ativas / " + ic + " inativas)"}</STitle>
      <StatusFilter value={campFilter} onChange={setCampFilter} activeCount={ac} inactiveCount={ic} />
      <Tbl data={filterCamps(havCamps, campFilter)} cols={[
        { l: "Campanha", fn: function (r) { return <span style={{ fontSize: 14 }}>{r.n}</span>; }, mw: 260 },
        { l: "Status", fn: function (r) { return <Badge s={r.s} />; }, nw: true },
        { l: "Invest.", r: true, nw: true, fn: function (r) { return fB(r.sp); } },
        { l: "Alcance", r: true, fn: function (r) { return fmt(r.rc); } },
        { l: "Impr.", r: true, fn: function (r) { return fmt(r.imp); } },
        { l: "Resultados", r: true, fn: function (r) { return r.res ? fmt(r.res) : "–"; } },
        { l: "Tipo", fn: function (r) { return <span style={{ fontSize: 13, color: C.dim }}>{r.ind}</span>; } },
        { l: "CPM", r: true, nw: true, fn: function (r) { return r.cpm ? fB(r.cpm) : "–"; } },
        { l: "CTR", r: true, fn: function (r) { return r.ctr ? fP(r.ctr) : "–"; } },
      ]} />
    </div>
  );
}

function UsaflexView() {
  var tSp = usaCamps.reduce(function (a, b) { return a + b.sp; }, 0);
  var convC = usaCamps.filter(function (c) { return c.conv > 0 && c.ind === "Conversas"; });
  var tConvSp = convC.reduce(function (a, b) { return a + b.sp; }, 0);
  var tConvR = convC.reduce(function (a, b) { return a + b.conv; }, 0);
  var ac = usaCamps.filter(function (c) { return c.s === "active"; }).length;
  var ic = usaCamps.length - ac;
  const [campFilter, setCampFilter] = useState("active");
  var pieData = usaCamps.map(function (c) { return { name: c.n.length > 20 ? c.n.substring(0, 20) + "..." : c.n, value: Math.round(c.sp) }; });
  var convBarData = convC.map(function (c) { return { name: c.n.length > 18 ? c.n.substring(0, 18) + "..." : c.n, conversas: c.conv }; });

  return (
    <div>
      <STitle>Comparativo Março vs Abril</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <CompareKPI title="Investimento Meta" marVal={marData.usaflex.meta.sp} abrVal={tSp} format="brl" invert={true} />
        <CompareKPI title="Conversas WhatsApp" marVal={marData.usaflex.meta.conv} abrVal={tConvR} format="" />
        <CompareKPI title="Alcance" marVal={marData.usaflex.meta.reach} abrVal={308584} format="" />
        <KPI t="Campanhas Ativas" v={ac} s={ic + " inativas"} c={C.org} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
        <ChartBox title="Distribuição de Investimento">
          <PieChart>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={78} innerRadius={34} paddingAngle={2} strokeWidth={0}>
              {pieData.map(function (_, i) { return <Cell key={i} fill={PC[i % PC.length]} />; })}
            </Pie>
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartBox>
        <ChartBox title="Conversas por Campanha (WPP)">
          <BarChart data={convBarData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 12 }} angle={-15} textAnchor="end" height={55} />
            <YAxis tick={{ fill: C.dim, fontSize: 13 }} />
            <Tooltip content={<CTip />} />
            <Bar dataKey="conversas" name="Conversas" fill={C.grn} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartBox>
      </div>

      <STitle>Google Maps — Perfil Orgânico por Loja (Abril vs Março)</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <KPI t="Interações Total" v={fmt(442)} s={"Mar: 480 (▼ -7,92%)"} c={C.cyn} />
        <KPI t="Chamadas Total" v={fmt(35)} s={"Mar: 41 (▼ -14,63%)"} c={C.org} />
        <KPI t="Rotas Total" v={fmt(360)} s={"Mar: 392 (▼ -8,16%)"} c={C.pur} />
        <KPI t="Cliques Site Total" v={fmt(24)} s={"Mar: 15 (▲ +60,00%)"} c={C.grn} />
      </div>
      <Tbl data={[
        { loja: "Boulevard Shoppê", intM: 98, intA: 97, chamM: 8, chamA: 17, rotM: 80, rotA: 73, cliM: 10, cliA: 7 },
        { loja: "Castanhal", intM: 53, intA: 40, chamM: 1, chamA: 1, rotM: 52, rotA: 36, cliM: 0, cliA: 3 },
        { loja: "Parque Shopping", intM: 58, intA: 68, chamM: 5, chamA: 5, rotM: 42, rotA: 55, cliM: 2, cliA: 3 },
        { loja: "Presidente Vargas", intM: 45, intA: 32, chamM: 2, chamA: 1, rotM: 43, rotA: 31, cliM: 0, cliA: 0 },
        { loja: "It Center", intM: 55, intA: 51, chamM: 1, chamA: 2, rotM: 47, rotA: 38, cliM: 0, cliA: 1 },
        { loja: "Castanheira", intM: 56, intA: 51, chamM: 5, chamA: 0, rotM: 42, rotA: 49, cliM: 1, cliA: 1 },
        { loja: "Shopping Metrô", intM: 31, intA: 45, chamM: 11, chamA: 4, rotM: 14, rotA: 34, cliM: 1, cliA: 4 },
        { loja: "Pátio Belém", intM: 84, intA: 58, chamM: 8, chamA: 5, rotM: 72, rotA: 44, cliM: 1, cliA: 5 },
      ]} cols={[
        { l: "Loja", k: "loja" },
        { l: "Inter. Mar", r: true, fn: function (r) { return fmt(r.intM); } },
        {
          l: "Inter. Abr", r: true, fn: function (r) {
            var color = r.intA >= r.intM ? C.grn : C.red;
            return <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{fmt(r.intA)}</span>;
          }
        },
        { l: "Cham. Mar", r: true, fn: function (r) { return fmt(r.chamM); } },
        {
          l: "Cham. Abr", r: true, fn: function (r) {
            var color = r.chamA >= r.chamM ? C.grn : C.red;
            return <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{fmt(r.chamA)}</span>;
          }
        },
        { l: "Rotas Mar", r: true, fn: function (r) { return fmt(r.rotM); } },
        {
          l: "Rotas Abr", r: true, fn: function (r) {
            var color = r.rotA >= r.rotM ? C.grn : C.red;
            return <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{fmt(r.rotA)}</span>;
          }
        },
        { l: "Cliq. Mar", r: true, fn: function (r) { return fmt(r.cliM); } },
        {
          l: "Cliq. Abr", r: true, fn: function (r) {
            var color = r.cliA >= r.cliM ? C.grn : C.red;
            return <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{fmt(r.cliA)}</span>;
          }
        },
      ]} />

      <STitle>{"Meta Ads — Campanhas (" + ac + " ativas / " + ic + " inativas)"}</STitle>
      <StatusFilter value={campFilter} onChange={setCampFilter} activeCount={ac} inactiveCount={ic} />
      <Tbl data={filterCamps(usaCamps, campFilter)} cols={[
        { l: "Campanha", fn: function (r) { return <span style={{ fontSize: 14 }}>{r.n}</span>; }, mw: 260 },
        { l: "Status", fn: function (r) { return <Badge s={r.s} />; }, nw: true },
        { l: "Invest.", r: true, nw: true, fn: function (r) { return fB(r.sp); } },
        { l: "Alcance", r: true, fn: function (r) { return fmt(r.rc); } },
        { l: "Impr.", r: true, fn: function (r) { return fmt(r.imp); } },
        { l: "Resultados", r: true, fn: function (r) { return r.res ? fmt(r.res) : "–"; } },
        { l: "Tipo", fn: function (r) { return <span style={{ fontSize: 13, color: C.dim }}>{r.ind}</span>; } },
        { l: "Conversas", r: true, fn: function (r) { return fmt(r.conv); } },
      ]} />
    </div>
  );
}

function MarcenariaView() {
  var tMeta = marcCamps.reduce(function (a, b) { return a + b.sp; }, 0);
  var tAll = tMeta + marcGMN.sp;
  var ac = marcCamps.filter(function (c) { return c.s === "active"; }).length;
  var ic = marcCamps.length - ac;
  const [campFilter, setCampFilter] = useState("active");
  var acS = marcSets.filter(function (c) { return c.s === "active"; }).length;
  var icS = marcSets.length - acS;
  const [setFilter, setSetFilter] = useState("all");

  return (
    <div>
      <STitle>Comparativo Março vs Abril</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <CompareKPI title="Investimento Total" marVal={marData.marcenaria.total} abrVal={tAll} format="brl" invert={true} />
        <CompareKPI title="Conversas Meta" marVal={marData.marcenaria.meta.conv} abrVal={32} format="" />
        <CompareKPI title="Chamadas GMN" marVal={marData.marcenaria.gmn.calls} abrVal={marcGMN.calls} format="" />
        <CompareKPI title="Cliques GMN" marVal={marData.marcenaria.gmn.cl} abrVal={marcGMN.cl} format="int" />
      </div>

      <STitle>Google Maps — Comparativo Mar vs Abr</STitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <CompareKPI title="Gasto GMN" marVal={marData.marcenaria.gmn.sp} abrVal={732.61} format="brl" invert={true} />
        <CompareKPI title="Impressões" marVal={marData.marcenaria.gmn.imp} abrVal={51500} format="" />
        <CompareKPI title="Cliques" marVal={marData.marcenaria.gmn.cl} abrVal={3850} format="int" />
        <CompareKPI title="Chamadas" marVal={marData.marcenaria.gmn.calls} abrVal={20} format="" />
      </div>

      <STitle>{"Meta Ads — Campanhas (" + ac + " ativas / " + ic + " inativas)"}</STitle>
      <StatusFilter value={campFilter} onChange={setCampFilter} activeCount={ac} inactiveCount={ic} />
      <Tbl data={filterCamps(marcCamps, campFilter)} cols={[
        { l: "Campanha", fn: function (r) { return <span style={{ fontSize: 14 }}>{r.n}</span>; }, mw: 300 },
        { l: "Status", fn: function (r) { return <Badge s={r.s} />; }, nw: true },
        { l: "Invest.", r: true, nw: true, fn: function (r) { return fB(r.sp); } },
        { l: "Alcance", r: true, fn: function (r) { return fmt(r.rc); } },
        { l: "Impr.", r: true, fn: function (r) { return fmt(r.imp); } },
        { l: "Conversas", r: true, fn: function (r) { return fmt(r.res); } },
        { l: "Cliques Link", r: true, fn: function (r) { return fmt(r.lc); } },
        { l: "CPM", r: true, nw: true, fn: function (r) { return fB(r.cpm); } },
      ]} />

      <STitle>Conjuntos de Anúncios</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <ChartBox title="Resultados por Conjunto" h={180}>
          <BarChart data={marcSets.map(function (s) { return { name: s.n.length > 22 ? s.n.substring(0, 22) + "..." : s.n, res: s.res || 0 }; })} barSize={28} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis type="number" tick={{ fill: C.dim, fontSize: 13 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: C.dim, fontSize: 12 }} width={160} />
            <Tooltip content={<CTip />} />
            <Bar dataKey="res" name="Conversas" fill={C.org} radius={[0, 5, 5, 0]} />
          </BarChart>
        </ChartBox>
        <ChartBox title="Investimento por Conjunto" h={180}>
          <PieChart>
            <Pie data={marcSets.map(function (s) { return { name: s.n.length > 20 ? s.n.substring(0, 20) + "..." : s.n, value: Math.round(s.sp) }; })} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={28} paddingAngle={3} strokeWidth={0}>
              {marcSets.map(function (_, i) { return <Cell key={i} fill={PC[i]} />; })}
            </Pie>
            <Tooltip content={<CTip />} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
          </PieChart>
        </ChartBox>
      </div>
      <StatusFilter value={setFilter} onChange={setSetFilter} activeCount={acS} inactiveCount={icS} />
      <Tbl data={filterCamps(marcSets, setFilter)} cols={[
        { l: "Conjunto de Anúncios", k: "n" },
        { l: "Status", fn: function (r) { return <Badge s={r.s} />; }, nw: true },
        { l: "Invest.", r: true, nw: true, fn: function (r) { return fB(r.sp); } },
        { l: "Conversas", r: true, fn: function (r) { return fmt(r.res); } },
        { l: "CPR", r: true, nw: true, fn: function (r) { return fB(r.cpr); } },
      ]} />
    </div>
  );
}

/* ═══════════ LEGENDA ═══════════ */

function LegendTag({ label, color, bg }) {
  return (
    <span style={{ display: "inline-block", background: bg || "rgba(59,130,246,0.12)", color: color || C.acc, padding: "3px 10px", borderRadius: 6, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', monospace", marginRight: 6, marginBottom: 4 }}>
      {label}
    </span>
  );
}

function LegendSection({ title, icon, children }) {
  return (
    <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "22px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.txt }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function LegendRow({ tag, tagColor, tagBg, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid " + C.border }}>
      <div style={{ minWidth: 120, flexShrink: 0 }}>
        <LegendTag label={tag} color={tagColor} bg={tagBg} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

function LegendaView() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))", border: "1px solid " + C.border, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 6 }}>Legenda de Nomenclatura — Públicos-Alvo e Estratégias</div>
        <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.6 }}>
          Guia de referência rápida para interpretar os nomes das campanhas de tráfego pago. A nomenclatura segue o padrão: <span style={{ color: C.acc, fontWeight: 600 }}>[TEMPERATURA]-[SEGMENTAÇÃO]-[CANAL]-[LOJA]-[DATA]</span>
        </div>
      </div>

      <LegendSection title="Temperatura do Público" icon="🌡️">
        <LegendRow
          tag="FRIO" tagColor="#60A5FA" tagBg="rgba(59,130,246,0.12)"
          title="Público Frio — Topo de Funil"
          desc="Usuários que ainda não conhecem a marca ou nunca interagiram com os canais. Objetivo: gerar reconhecimento e primeira impressão. Campanhas de alcance, reconhecimento de marca ou vídeo views. Custo por resultado geralmente mais baixo, porém com menor intenção de compra."
        />
        <LegendRow
          tag="MORNO" tagColor="#FBBF24" tagBg="rgba(245,158,11,0.12)"
          title="Público Morno — Meio de Funil"
          desc="Usuários que já tiveram algum contato com a marca (visitaram perfil, interagiram com posts, assistiram vídeos). Objetivo: nutrir o relacionamento e gerar consideração. Campanhas de tráfego, engajamento, mensagens ou geração de leads. Principal estágio para conversas via WhatsApp."
        />
        <LegendRow
          tag="VENDA" tagColor="#EF4444" tagBg="rgba(239,68,68,0.10)"
          title="Público Quente — Fundo de Funil"
          desc="Usuários com alta intenção de compra: adicionaram ao carrinho, visitaram páginas de produto ou já são clientes. Objetivo: converter em venda direta. Campanhas de conversão, catálogo de produtos ou mensagens direcionadas. Maior custo por impressão, porém maior taxa de conversão."
        />
        <div style={{ padding: "12px 0 0" }}>
          <div style={{ fontSize: 13, color: C.mut, fontStyle: "italic" }}>
            Obs.: A tag [P1] indica campanha prioritária (nível 1 de investimento), podendo combinar públicos mornos e quentes no mesmo conjunto.
          </div>
        </div>
      </LegendSection>

      <LegendSection title="Tipos de Segmentação" icon="🎯">
        <LegendRow
          tag="RMKT" tagColor="#F472B6" tagBg="rgba(236,72,153,0.10)"
          title="Remarketing — Retargeting de Engajamento"
          desc="Impacta usuários que já interagiram com o site, app, catálogo ou perfis sociais. Públicos personalizados criados a partir de eventos (visualização de página, adição ao carrinho, compra). Estratégia de recuperação com alto ROAS potencial."
        />
        <LegendRow
          tag="SEMELH." tagColor="#A78BFA" tagBg="rgba(139,92,246,0.10)"
          title="Lookalike / Público Semelhante"
          desc="Expansão baseada em públicos-semente (clientes, leads, compradores). O algoritmo do Meta encontra novos usuários com perfil comportamental similar. Grau de semelhança tipicamente entre 1% e 5% da população local."
        />
        <LegendRow
          tag="ABERTO" tagColor="#34D399" tagBg="rgba(16,185,129,0.10)"
          title="Broad / Segmentação Aberta"
          desc="Sem restrição de interesses ou comportamentos — confia na inteligência do algoritmo para encontrar o público ideal. Utilizado em campanhas de reconhecimento de massa ou quando o pixel já possui dados suficientes para otimização automática."
        />
        <LegendRow
          tag="REC" tagColor="#22D3EE" tagBg="rgba(6,182,212,0.10)"
          title="Reconhecimento / Awareness"
          desc="Campanhas otimizadas para alcance e frequência. Foco em exibir a marca ao maior número de pessoas únicas no raio de atuação. Objetivo principal: construir memória de marca (top of mind) na região."
        />
        <LegendRow
          tag="ADV+" tagColor="#FB923C" tagBg="rgba(249,115,22,0.10)"
          title="Advantage+ / Segmentação Automática Meta"
          desc="Utiliza o sistema Advantage+ do Meta Ads, que automatiza a segmentação, criativos e posicionamentos. O algoritmo define autonomamente qual público e criativo performam melhor. Ideal para campanhas de catálogo e conversão com volume de dados."
        />
      </LegendSection>

      <LegendSection title="Canais e Origens de Conversão" icon="📱">
        <LegendRow
          tag="WPP" tagColor="#25D366" tagBg="rgba(37,211,102,0.10)"
          title="WhatsApp — Conversão via Mensagem"
          desc="Campanhas com objetivo de iniciar conversa no WhatsApp Business. O clique direciona para o chat com mensagem pré-definida. Métrica principal: custo por conversa iniciada (CPR). Canal prioritário para vendas consultivas e atendimento local."
        />
        <LegendRow
          tag="IG/FB" tagColor="#E1306C" tagBg="rgba(225,48,108,0.10)"
          title="Instagram / Facebook — Engajamento Social"
          desc="Campanhas veiculadas exclusivamente nos feeds e stories do Instagram e Facebook. Foco em engajamento, visitas ao perfil ou tráfego para o site. Podem combinar formatos de imagem única, carrossel e vídeo."
        />
        <LegendRow
          tag="SITE" tagColor="#60A5FA" tagBg="rgba(59,130,246,0.12)"
          title="Site / Landing Page — Conversão Web"
          desc="Campanhas que direcionam tráfego para o site ou landing page específica. Rastreamento via Pixel do Meta e/ou Google Analytics. Métricas-chave: visualizações de landing page, adição ao carrinho e compra no site."
        />
        <LegendRow
          tag="CATALAGO" tagColor="#FBBF24" tagBg="rgba(245,158,11,0.12)"
          title="Catálogo de Produtos — Dynamic Ads"
          desc="Campanhas que utilizam o catálogo de produtos do Meta (Commerce Manager). Exibem automaticamente os produtos mais relevantes para cada usuário. Formatos: carrossel dinâmico e coleção. Ideais para e-commerce com variedade de SKUs."
        />
      </LegendSection>

      <LegendSection title="Ações Específicas e Modificadores" icon="⚡">
        <LegendRow
          tag="CARRINHO" tagColor="#F472B6" tagBg="rgba(236,72,153,0.10)"
          title="Abandono de Carrinho"
          desc="Remarketing direcionado a usuários que adicionaram produtos ao carrinho mas não finalizaram a compra. Janela de retargeting tipicamente entre 1-7 dias. Uma das campanhas com maior taxa de conversão no funil."
        />
        <LegendRow
          tag="PROMO" tagColor="#34D399" tagBg="rgba(16,185,129,0.10)"
          title="Promoção / Oferta Especial"
          desc="Campanha promocional com oferta, desconto ou condição especial por tempo limitado. Utiliza gatilhos de urgência e escassez. Pode ser aplicada em qualquer temperatura de público. Criativos com apelo direto ao preço."
        />
        <LegendRow
          tag="TURBO" tagColor="#EF4444" tagBg="rgba(239,68,68,0.10)"
          title="Turbo — Impulsionamento de Alta Intensidade"
          desc="Campanha de curta duração (1-5 dias) com orçamento concentrado para gerar volume rápido de resultados. Utilizada em lançamentos, datas sazonais ou ações emergenciais. Foco em máximo alcance e engajamento em período curto."
        />
        <LegendRow
          tag="ENGAJ" tagColor="#A78BFA" tagBg="rgba(139,92,246,0.10)"
          title="Engajamento — Interação com Conteúdo"
          desc="Campanhas otimizadas para gerar curtidas, comentários, compartilhamentos e salvamentos. Alimentam o algoritmo com sinais de interesse e constroem a base de públicos personalizados para remarketing posterior."
        />
        <LegendRow
          tag="LEADS" tagColor="#22D3EE" tagBg="rgba(6,182,212,0.10)"
          title="Geração de Leads"
          desc="Campanhas focadas em capturar informações de contato (nome, telefone, e-mail). Podem utilizar formulários nativos do Meta (Lead Ads) ou direcionar para landing pages com formulário. Métrica principal: custo por lead (CPL)."
        />
      </LegendSection>

      <LegendSection title="Exemplo de Leitura" icon="📖">
        <div style={{ background: C.bg, borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.acc, fontFamily: "monospace", marginBottom: 10 }}>
            [MORNO]-[WPP-VENDA]-[CASTANHEIRA]-[23/04]
          </div>
          <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
            <span style={{ color: "#FBBF24", fontWeight: 600 }}>MORNO</span> → Público que já conhece a marca (meio de funil)<br />
            <span style={{ color: "#25D366", fontWeight: 600 }}>WPP</span> → Conversão direcionada ao WhatsApp<br />
            <span style={{ color: "#EF4444", fontWeight: 600 }}>VENDA</span> → Objetivo final de venda direta<br />
            <span style={{ color: "#60A5FA", fontWeight: 600 }}>CASTANHEIRA</span> → Loja alvo: Usaflex Castanheira<br />
            <span style={{ color: C.mut, fontWeight: 600 }}>23/04</span> → Data de ativação: 23 de abril de 2026
          </div>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.acc, fontFamily: "monospace", marginBottom: 10 }}>
            [CATALAGO]-[ADV+]-[COMPRA]-[15/04]
          </div>
          <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
            <span style={{ color: "#FBBF24", fontWeight: 600 }}>CATALAGO</span> → Campanha de catálogo dinâmico de produtos<br />
            <span style={{ color: "#FB923C", fontWeight: 600 }}>ADV+</span> → Segmentação Advantage+ (automática do Meta)<br />
            <span style={{ color: "#EF4444", fontWeight: 600 }}>COMPRA</span> → Otimizada para evento de compra no site<br />
            <span style={{ color: C.mut, fontWeight: 600 }}>15/04</span> → Data de ativação: 15 de abril de 2026
          </div>
        </div>
      </LegendSection>
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */

var tabs = [
  { id: "overview", label: "Visão Geral", icon: "📊" },
  { id: "planeta", label: "Planeta Energia", icon: "⚡" },
  { id: "havaianas", label: "Havaianas", icon: "🩴" },
  { id: "usaflex", label: "Usaflex", icon: "👟" },
  { id: "marcenaria", label: "Masterplan Marcenaria", icon: "🪵" },
  { id: "legenda", label: "Legenda de Públicos", icon: "📋" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", background: C.bg, color: C.txt, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg," + C.card + ",#080C16)", borderBottom: "1px solid " + C.border, padding: "18px 24px 0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg," + C.acc + "," + C.pur + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>M</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>Masterplan — Dashboard de Mídia</div>
            <div style={{ fontSize: 14, color: C.mut }}>Comparativo: Março vs Abril 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {tabs.map(function (t) {
            return (
              <button
                key={t.id}
                onClick={function () { setTab(t.id); }}
                style={{
                  padding: "9px 16px",
                  border: "none",
                  borderBottom: tab === t.id ? "2px solid " + C.acc : "2px solid transparent",
                  background: tab === t.id ? "rgba(59,130,246,0.08)" : "transparent",
                  color: tab === t.id ? C.acc : C.dim,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: tab === t.id ? 700 : 500,
                  whiteSpace: "nowrap",
                  borderRadius: "7px 7px 0 0",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ marginRight: 5 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "22px 24px 36px" }}>
        {tab === "overview" ? <OverviewView /> : null}
        {tab === "planeta" ? <PlanetaView /> : null}
        {tab === "havaianas" ? <HavaianasView /> : null}
        {tab === "usaflex" ? <UsaflexView /> : null}
        {tab === "marcenaria" ? <MarcenariaView /> : null}
        {tab === "legenda" ? <LegendaView /> : null}
      </div>
    </div>
  );
}
