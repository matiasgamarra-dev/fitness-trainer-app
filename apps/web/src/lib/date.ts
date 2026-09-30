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