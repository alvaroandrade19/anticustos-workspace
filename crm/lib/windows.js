// Janelas de tempo do cockpit. A skill ajusta o fuso do "dia" se o negócio fecha em horário específico.
export const TZ = 'America/Sao_Paulo';
export const WINDOWS = [
  { key: 'hoje', label: 'Hoje', days: 1, today: true },
  { key: '7d', label: '7 dias', days: 7 },
  { key: '30d', label: '30 dias', days: 30 },
];
export function getWindow(key) {
  return WINDOWS.find((w) => w.key === key) || WINDOWS[0];
}
export const TODAY = `(now() at time zone '${TZ}')::date`;
// boundary timestamptz do início da janela (últimos N dias, inclusivo)
export function sinceTs(days) {
  return `((${TODAY} - ${Math.max(0, days - 1)})::timestamp at time zone '${TZ}')`;
}
