/*************************************************
 * 個人履歴取得
 *************************************************/
function getAbsenceHistory_(e) {

    const token = e.parameter.token;
    if (!token) {
      return { error: "token required" };
    }
  
    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName("absences");
  
    const values = sheet.getDataRange().getValues();
  
    const result = values
      .slice(1)
      .filter(r => r[0] === token)
      .map(r => ({
        date: r[2],
        type: r[3],
        updatedAt: r[4],
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  
    return {
      status: "ok",
      data: result
    };
  }
  
  /*************************************************
   * 管理者用 全件取得
   *************************************************/
  function getAllAbsences_(e) {
  
    const ADMIN_KEY = "YOUR_ADMIN_KEY";
  
    if (e.parameter.key !== ADMIN_KEY) {
      return { error: "unauthorized" };
    }
  
    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName("absences");
  
    const values = sheet.getDataRange().getValues();
  
    const result = values.slice(1).map(r => ({
      token: r[0],
      playerName: r[1],
      date: r[2],
      type: r[3],
      updatedAt: r[4],
    }));
  
    return result;
  }