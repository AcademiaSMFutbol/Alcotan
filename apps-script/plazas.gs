/**
 * C.D. Alcotán Canarias — Contador de plazas por categoría
 *
 * IMPORTANTE: Si ya tenías una versión anterior desplegada,
 * debes crear una NUEVA implementación (no editar la existente)
 * para que los cambios surtan efecto:
 *   Implementar → Nueva implementación → (mismos parámetros) → Implementar
 * Luego actualiza la URL en index.html si cambia.
 *
 * INSTRUCCIONES DE DESPLIEGUE (primera vez):
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
 * 10. Copia la URL y ponla en index.html en APPS_SCRIPT_URL
 */

function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) || null;
  const result   = buildResult();
  const jsonStr  = JSON.stringify(result);

  // JSONP: evita problemas de CORS desde páginas externas
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + jsonStr + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}

function buildResult() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data  = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return { ok: true, counts: conteoVacio(), total: 15, updated: ahora() };
  }

  var headers = data[0].map(function(h) { return String(h).trim(); });
  var col = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === 'Categoría' || headers[i] === 'Categoria') {
      col = i;
      break;
    }
  }

  if (col === -1) {
    return { ok: false, error: 'Columna Categoría no encontrada' };
  }

  var counts = conteoVacio();

  for (var r = 1; r < data.length; r++) {
    var v = norm(String(data[r][col]));
    if (!v) continue;
    if      (v.indexOf('mini') !== -1)  counts.mini++;
    else if (v.indexOf('pre')  !== -1)  counts.prebenjamin++;
    else if (v.indexOf('ben')  !== -1)  counts.benjamin++;
    else if (v.indexOf('ale')  !== -1)  counts.alevin++;
    else if (v.indexOf('inf')  !== -1)  counts.infantil++;
  }

  // Infantil juega F11: máximo reglamentario por convocatoria RFEF = 18
  var totales = { mini: 15, prebenjamin: 15, benjamin: 15, alevin: 15, infantil: 18 };
  return { ok: true, totales: totales, counts: counts, updated: ahora() };
}

function norm(s) {
  return s.trim().toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u');
}

function conteoVacio() {
  return { mini: 0, prebenjamin: 0, benjamin: 0, alevin: 0, infantil: 0 };
}

function ahora() {
  return Utilities.formatDate(new Date(), 'Atlantic/Canary', 'dd/MM/yyyy HH:mm');
}
