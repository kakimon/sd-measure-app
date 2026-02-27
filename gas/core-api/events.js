/*************************************************
 * 種目一覧
 *************************************************/
function getEvents_() {

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("events");
  
    return sheet
      .getDataRange()
      .getValues()
      .slice(1)
      .map(r => ({
        id: r[0],
        name: r[1],
        unit: r[2],
        sort: r[3] || "asc",
      }));
  }