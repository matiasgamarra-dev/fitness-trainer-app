/**
 * Utilidades de fecha para el frontend.
 *
 * Semana: lunes → domingo (ISO 8601).
 * Se calcula según la timezone local del navegador.
 * Se exporta en formato "YYYY-MM-DD" (lo que espera el backend).
 */

export interface WeekRange {
  week_start: string;
  week_end: string;
}

/**
 * Devuelve el rango lunes-domingo de la semana que contiene `date`.
 * Si no se pasa `date`, usa la fecha actual.
 *
 * No usa Date.UTC ni toISOString() porque esos devuelven UTC
 * y pueden cambiar el día según la timezone. Se calcula manualmente
 * con la fecha local.
 */
export function getWeekRange(date: Date = new Date()): WeekRange {
  // Copia local, sin horas/min/seg, para trabajar solo con la fecha
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // getDay(): 0 = domingo, 1 = lunes, ..., 6 = sábado
  // Queremos que lunes sea el inicio. Si es domingo, restamos 6 días.
  // Si es lunes, restamos 0. Etc.
  const dayOfWeek = local.getDay();
  const daysFromMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(local);
  monday.setDate(local.getDate() - daysFromMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    week_start: formatDate(monday),
    week_end: formatDate(sunday),
  };
}

/**
 * Formatea una Date como "YYYY-MM-DD" usando sus componentes LOCALES
 * (no UTC, para evitar el clásico bug de "un día menos").
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// ─── Helpers para workouts ───────────────────────────────────

/**
 * Formatea un ISO datetime como "18 oct 2026 · 10:00".
 * Usa la timezone local del navegador.
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hh}:${mm}`;
}

/**
 * Duración entre dos ISO datetimes, en formato "45 min" o "1h 20min".
 * Si alguno es null o inválido, devuelve "".
 */
export function formatDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return "";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "";
  const totalMin = Math.floor((end - start) / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/**
 * Nombre del día en español (1 = Lunes, 7 = Domingo).
 */
export function dayOfWeekName(day: number | null): string {
  if (day === null || day < 1 || day > 7) return "";
  const names = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  return names[day - 1];
}
