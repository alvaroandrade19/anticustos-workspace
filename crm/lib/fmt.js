// Formatação pt-BR. Moeda SEMPRE 2 casas, número tabular.
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NUM = new Intl.NumberFormat('pt-BR');

export function brl(v) {
  if (v == null || isNaN(Number(v))) return '—';
  return BRL.format(Number(v));
}
export function num(v) {
  if (v == null || isNaN(Number(v))) return '—';
  return NUM.format(Number(v));
}
export function pct(v) {
  if (v == null || isNaN(Number(v))) return '—';
  return (Number(v) * 100).toFixed(1) + '%';
}
export function deltaPct(now, prev) {
  if (prev == null || prev === 0 || now == null) return null;
  return ((now - prev) / Math.abs(prev)) * 100;
}
