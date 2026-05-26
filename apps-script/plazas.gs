/**
 * C.D. Alcotán Canarias — Contador de plazas por categoría
 *
 * INSTRUCCIONES DE DESPLIEGUE (5 minutos):
 * ──────────────────────────────────────────
 * 1. Abre la hoja de respuestas del formulario en Google Sheets
 * 2. Menú → Extensiones → Apps Script
 * 3. Borra el contenido que hay y pega todo este archivo
 * 4. Guarda (Ctrl+S)
 * 5. Clic en "Implementar" → "Nueva implementación"
 * 6. Tipo: Aplicación web
 * 7. Ejecutar como: Yo (tu cuenta Google)
 * 8. Quién tiene acceso: Cualquier persona
 * 9. Clic en "Implementar" → Autoriza los permisos
 * 10. Copia la URL que aparece ("URL de la aplicación web")
 * 11. Abre index.html del repositorio, busca la línea:
 *       const APPS_SCRIPT_URL = 'PENDIENTE_CONFIGURAR';
 *     y reemplaza 'PENDIENTE_CONFIGURAR' por la URL copiada
 * 12. Guarda y haz push al repositorio
 *
 * La web se actualizará automáticamente cada 5 minutos.
 * Solo se exponen CONTEOS, nunca datos personales de las familias.
 */

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data  = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return json({ ok: true, counts: conteoVacio(), total: 15, updated: ahora() });
  }

  const headers = data[0].map(h => String(h).trim());
  const col = headers.findIndex(h => h === 'Categoría' || h === 'Categoria');

  if (col === -1) {
    return json({ ok: false, error: 'Columna Categoría no encontrada en la hoja' });
  }

  const norm = s => String(s).trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, ''); // elimina acentos

  const counts = conteoVacio();

  for (let i = 1; i < data.length; i++) {
    const v = norm(data[i][col]);
    if (!v) continue;
    if      (v.includes('mini'))  counts.mini++;
    else if (v.includes('pre'))   counts.prebenjamin++;
    else if (v.includes('ben'))   counts.benjamin++;
    else if (v.includes('ale'))   counts.alevin++;
    else if (v.includes('inf'))   counts.infantil++;
  }

  return json({ ok: true, total: 15, counts, updated: ahora() });
}

function conteoVacio() {
  return { mini: 0, prebenjamin: 0, benjamin: 0, alevin: 0, infantil: 0 };
}

function ahora() {
  return Utilities.formatDate(new Date(), 'Atlantic/Canary', 'dd/MM/yyyy HH:mm');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
