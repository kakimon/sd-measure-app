// test from local
/*************************************************
 * 設定
 *************************************************/
const SPREADSHEET_ID =
  "1HP4SPBByhvvVgWynGUUPtVR-4tZd6qmvdxwEWllNaR8";

/*************************************************
 * GET : API
 *************************************************/
function doGet(e) {

  const type = e?.parameter?.type;

  if (type === "members") {
    return json_(getMembers_());
  }

  if (type === "events") {
    return json_(getEvents_());
  }

  if (type === "stats") {
    return json_(getStats_(e));
  }

  if (type === "playerStats") {
    return json_(getPlayerStats_(e));
  }

  if (type === "memberByToken") {
    return json_(getMemberByToken_(e));
  }

  /*****************************************
   * ⑥ 休暇履歴取得（NEW）
   *****************************************/
  if (type === "getAbsenceHistory") {
    return json_(getAbsenceHistory_(e));
  }

  /*****************************************
   * ⑦ 管理者用 全件取得（NEW）
   *****************************************/
  if (type === "getAllAbsences") {
    return json_(getAllAbsences_(e));
  }

  return json_({ error: "invalid request" });
}

/*************************************************
 * POST : 測定データ登録 / 選手登録 / 選手削除
 *************************************************/
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    // ★ type が無い（旧フロント）場合でも、name があれば createMember として扱う
    const type = data.type || (data.name ? "createMember" : "");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    /*****************************************
     * ① 選手登録
     *****************************************/
    if (type === "createMember") {
      if (!data.name) {
        throw new Error("名前を入力してください");
      }

      const sheet = ss.getSheetByName("members");
      const values = sheet.getDataRange().getValues();

      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.name) {
          throw new Error("すでに登録済みです");
        }
      }

      const token = Utilities.getUuid().slice(0, 6);
      const baseUrl = "https://kakimon.github.io/sd-measure-app/#/player";
      const personalUrl = `${baseUrl}/${token}`;

      sheet.appendRow([data.name, token, personalUrl]);

      return json_({
        status: "ok",
        name: data.name,
        token,
        url: personalUrl,
      });
    }

    /*****************************************
     * ② 選手削除
     *****************************************/
    if (type === "deleteMember") {
      if (!data.token) {
        throw new Error("tokenが必要です");
      }

      const sheet = ss.getSheetByName("members");
      const values = sheet.getDataRange().getValues();

      for (let i = 1; i < values.length; i++) {
        if (values[i][1] === data.token) {
          sheet.deleteRow(i + 1);
          return json_({ status: "ok" });
        }
      }

      throw new Error("対象が見つかりません");
    }

    /*****************************************
     * ③ 測定登録
     *****************************************/
    if (type === "register") {
      if (!data.token || !data.date || !data.event) {
        throw new Error("必須項目が不足しています");
      }

      const sheet = ss.getSheetByName("records");
      const playerName = getPlayerName_(data.token);

      if (!playerName) {
        throw new Error("対象の選手が見つかりません");
      }

      sheet.appendRow([
        data.token,
        playerName,
        new Date(data.date),
        data.event,
        Number(data.value),
      ]);

      return json_({ status: "ok" });
    }

    /*****************************************
     * ④ 休暇登録（NEW）
     *****************************************/
    if (type === "registerAbsence") {

      if (!data.token || !data.date || !data.absenceType) {
        throw new Error("必須項目が不足しています");
      }

      const sheet = ss.getSheetByName("absences");
      if (!sheet) {
        throw new Error("absencesシートが存在しません");
      }
      const playerName = getPlayerName_(data.token);

      if (!playerName) {
        throw new Error("対象の選手が見つかりません");
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      const target = new Date(data.date + "T00:00:00");
      target.setHours(0,0,0,0);

      // 過去日禁止（今日より前は不可）
      if (target < today) {
        throw new Error("過去日は登録できません");
      }

      // 1ヶ月先まで
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      if (target > oneMonthLater) {
        throw new Error("1ヶ月以上先は登録できません");
      }

      const values = sheet.getDataRange().getValues();

      // 同日の既存データ削除（上書き方式）
      for (let i = values.length - 1; i > 0; i--) {
        if (values[i][0] === data.token && values[i][2] === data.date) {
          sheet.deleteRow(i + 1);
        }
      }

      sheet.appendRow([
        data.token,
        playerName,
        data.date,
        data.absenceType, // absent / continue
        new Date().toISOString(),
      ]);

      return json_({ status: "ok" });
    }

    /*****************************************
     * ⑤ 休暇削除（前日まで）
     *****************************************/
    if (type === "deleteAbsence") {

      if (!data.token || !data.date) {
        throw new Error("必須項目が不足しています");
      }

      const sheet = ss.getSheetByName("absences");
      if (!sheet) {
        throw new Error("absencesシートが存在しません");
      }
      const values = sheet.getDataRange().getValues();

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const target = new Date(data.date + "T00:00:00");
      target.setHours(0,0,0,0);

     // 当日削除不可（今日以前は不可）
      if (target <= today) {
        throw new Error("当日の変更はできません");
      }

      for (let i = values.length - 1; i > 0; i--) {
        if (values[i][0] === data.token && values[i][2] === data.date) {
          sheet.deleteRow(i + 1);
        }
      }

      return json_({ status: "ok" });
    }

    return json_({ status: "error", message: "invalid post request" });

  } catch (err) {
    return json_({
      status: "error",
      message: err.message,
    });
  }
}

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

/*************************************************
 * JSON helper
 *************************************************/
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

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