/*************************************************
 * 選手一覧
 *************************************************/
function getMembers_() {

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("members");
    const values = sheet.getDataRange().getValues();
  
    return values
      .slice(1)
      .filter(r => r[0] && r[1] && r[2])
      .map(r => ({
        name: r[0],
        token: r[1],
        url: r[2],
      }));
  }
  
  /*************************************************
   * token → member情報取得（記録ゼロでも名前取得用）
   * ?type=memberByToken&token=xxxx
   *************************************************/
  function getMemberByToken_(e) {
  
    const token = e.parameter.token;
    if (!token) return {};
  
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("members");
    const values = sheet.getDataRange().getValues();
  
    for (let i = 1; i < values.length; i++) {
      const rowName = values[i][0];
      const rowToken = values[i][1];
      const rowUrl = values[i][2];
  
      if (String(rowToken) === String(token)) {
        return {
          name: rowName,
          token: rowToken,
          url: rowUrl,
        };
      }
    }
  
    return {};
  }
  
  /*************************************************
   * token → 選手名取得
   *************************************************/
  function getPlayerName_(token) {
  
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("members");
    const values = sheet.getDataRange().getValues();
  
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === token) {
        return values[i][0];
      }
    }
  
    return "";
  }