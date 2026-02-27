/*************************************************
 * 管理者：種目別データ
 *************************************************/
function getStats_(e) {

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("records");
    const values = sheet.getDataRange().getValues().slice(1);
  
    const event = e.parameter.event;
    const targetDate = e.parameter.date;
  
    const map = new Map();
  
    for (const r of values) {
  
      const name = r[1];
      const rowDate = r[2];
      const eventId = r[3];
      const value = r[4];
  
      if (!name || !rowDate || String(eventId) !== String(event)) continue;
  
      const dateStr = Utilities.formatDate(
        new Date(rowDate),
        "Asia/Tokyo",
        "yyyy-MM-dd"
      );
  
      // 指定日モード
      if (targetDate) {
        if (dateStr === targetDate) {
          map.set(name, Number(value));
        }
        continue;
      }
  
      // 最新記録モード
      const prev = map.get(name);
      if (!prev || dateStr > prev.date) {
        map.set(name, { date: dateStr, value: Number(value) });
      }
    }
  
    return [...map.entries()].map(([name, v]) => ({
      name,
      value: targetDate ? v : v.value,
    }));
  }
  
  /*************************************************
   * 個人：種目別データ
   * ?type=playerStats&token=xxx&event=10
   *************************************************/
  function getPlayerStats_(e) {
  
    const token = e.parameter.token;
    const event = e.parameter.event;
  
    if (!token || !event) {
      return [];
    }
  
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("records");
    const values = sheet.getDataRange().getValues().slice(1);
  
    const result = [];
  
    for (const r of values) {
  
      const rowToken = r[0];
      const name = r[1];
      const rowDate = r[2];
      const rowEvent = r[3];
      const value = r[4];
  
      if (
        String(rowToken) === String(token) &&
        String(rowEvent) === String(event)
      ) {
  
        const dateStr = Utilities.formatDate(
          new Date(rowDate),
          "Asia/Tokyo",
          "yyyy-MM-dd"
        );
  
        result.push({
          name,
          date: dateStr,
          value: Number(value),
        });
      }
    }
  
    return result;
  }