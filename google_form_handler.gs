// Укажите ваш реальный ID таблицы
const SHEET_ID = '10m-N8Mt91tfLqbcM9k9B8C-v3v4rq-O-l2AhC14pn9o'; // ← замените

/**
 * Обработчик POST‑запросов от формы.
 * Читает параметры через e.parameter / e.parameters (поддерживает как
 * application/x-www-form-urlencoded, так и multipart/form-data).
 */
function doPost(e) {
  try {
    // ----- Чтение параметров -----
    const p = e.parameter || {};
    const multi = e.parameters || {};

    // ----- Honeypot: защита от спама -----
    // Если скрытое поле 'phone' заполнено — это бот, молча отклоняем
    if (p.phone && p.phone.trim() !== '') {
      Logger.log('Spam blocked (honeypot triggered): phone=%s', p.phone);
      return ContentService
        .createTextOutput('ok')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    const data = {
      name:       p.name || '',
      attendance: p.attendance || '',
      // drinks может быть массивом (чекбоксы) – получаем все значения
      drinks:     multi.drinks ? multi.drinks : (p.drinks ? [p.drinks] : []),
      comments:   p.comments || ''
    };

    // ----- Запись в таблицу -----
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Лист1'); // проверьте имя листа
    const row = [
      new Date(),
      data.name,
      data.attendance,
      (data.drinks || []).join(', '),
      data.comments
    ];
    sheet.appendRow(row);

    Logger.log('Row appended: %s', JSON.stringify(row));
    // Добавляем CORS‑заголовок, чтобы клиент мог получить ответ
    return ContentService
      .createTextOutput('ok')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (err) {
    Logger.log('Error in doPost: %s', err.toString());
    return ContentService
      .createTextOutput('error')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

/**
 * GET‑хэндлер – используется только для проверки доступности скрипта.
 */
function doGet(e) {
  return ContentService
    .createTextOutput('RSVP‑handler ready')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*');
}
