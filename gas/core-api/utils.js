/*************************************************
 * JSON helper
 *************************************************/
function json_(obj) {
    return ContentService
      .createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }