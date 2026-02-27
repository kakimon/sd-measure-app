function createPersonalUrl() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('members');
  const cell = sheet.getActiveCell();

  if (!cell || cell.getRow() === 1) {
    SpreadsheetApp.getUi().alert('選手名の行を選択してください');
    return;
  }

  const row = cell.getRow();
  const name = sheet.getRange(row, 1).getValue();

  if (!name) {
    SpreadsheetApp.getUi().alert('選手名が入力されていません');
    return;
  }

  const existingToken = sheet.getRange(row, 2).getValue();
  if (existingToken) {
    SpreadsheetApp.getUi().alert('すでにURLは発行されています');
    return;
  }

  const token = Utilities.getUuid().slice(0, 6);

  // フロント側URL
  const baseUrl =
    'https://kakimon.github.io/sd-measure-app/#/player';

  const personalUrl = `${baseUrl}/${token}`;

  sheet.getRange(row, 2).setValue(token);
  sheet.getRange(row, 3).setValue(personalUrl);

  SpreadsheetApp.getUi().alert(`${name} さんのURLを発行しました`);
}

function getPlayerStats_(e) {

  const token = e.parameter.token;
  if (!token) {
    return json_({ error: "token required" });
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("records");

  const values = sheet.getDataRange().getValues();

  const data = values
    .slice(1)
    .filter(r => r[0] === token)
    .map(r => ({
      token: r[0],
      name: r[1],
      date: r[2],
      event_id: r[3],
      value: Number(r[4]),
    }));

  return json_(data);
}


/*************************************************
 * 選手別記録取得（recordsシート最新版対応）
 *************************************************/
function getPlayerStats_(e) {

  const token = e.parameter.token;
  const event = e.parameter.event; // ← 追加

  if (!token) return [];

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("records");
  const values = sheet.getDataRange().getValues().slice(1);

  return values
    .filter(r =>
      r[0] === token &&
      (!event || String(r[3]) === String(event))
    )
    .map(r => ({
      date: Utilities.formatDate(
        new Date(r[2]),
        "Asia/Tokyo",
        "yyyy-MM-dd"
      ),
      event_id: r[3],
      value: Number(r[4]),
    }));
}

/*************************************************
 * JSON共通
 *************************************************/
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


