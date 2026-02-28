/*************************************************
 * 個人ページまとめ取得（高速化版）
 * ?type=playerDashboard&token=xxxx
 *************************************************/
function getPlayerDashboard_(e) {
    const token = e?.parameter?.token;
    if (!token) return { status: "error", message: "token required" };
  
    // ★ 1リクエストで openById は1回だけ
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
    // ① member（tokenで特定）
    const member = findMemberByToken_(ss, token);
    if (!member) return { status: "error", message: "member not found" };
  
    // ② events（全件：件数少・更新頻度低）
    const events = getEventsFromSheet_(ss);
  
    // ③ records（tokenで絞り込み）
    const recPack = getRecordsByToken_(ss, token);   // { records, recordsByEvent }
    const records = recPack.records;
    
    // ④ absences（tokenで絞り込み）
    const absences = getAbsencesByToken_(ss, token);
  
    // ⑤ フロントで扱いやすい形に（eventId別にまとめる）
    const recordsByEvent = recPack.recordsByEvent;
  
    return {
      status: "ok",
      member,          // {name, token, url}
      events,          // [{id,name,unit,sort}]
      records,         // 生データ（必要なら）
      recordsByEvent,  // eventごとにまとまった形（個人ページ向け）
      absences,        // [{date,type,updatedAt}]
      meta: {
        generatedAt: new Date().toISOString(),
        recordsCount: records.length,
        absencesCount: absences.length
      }
    };
  }
  
  /*************************************************
   * member取得（ss使い回し）
   *************************************************/
  function findMemberByToken_(ss, token) {
    const sheet = ss.getSheetByName("members");
    if (!sheet) return null;
  
    const values = sheet.getDataRange().getValues(); // [name, token, url]
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][1]) === String(token)) {
        return {
          name: values[i][0],
          token: values[i][1],
          url: values[i][2]
        };
      }
    }
    return null;
  }
  
  /*************************************************
   * events取得（ss使い回し）
   *************************************************/
  function getEventsFromSheet_(ss) {
    const sheet = ss.getSheetByName("events");
    if (!sheet) return [];
  
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
   * records: tokenで絞り込み
   * recordsシート想定: [token, name, date, event, value]
   *************************************************/
  function getRecordsByToken_(ss, token) {
    const sheet = ss.getSheetByName("records");
    if (!sheet) return { records: [], recordsByEvent: {} };
  
    const values = sheet.getDataRange().getValues(); // ★ forでi=1から
    const records = [];
    const recordsByEvent = {};
  
    for (let i = 1; i < values.length; i++) {
      const r = values[i];
      if (String(r[0]) !== String(token)) continue;
  
      const event = String(r[3]);
      const date = Utilities.formatDate(new Date(r[2]), "Asia/Tokyo", "yyyy-MM-dd");
      const value = Number(r[4]);
  
      records.push({ token: String(token), name: r[1], date, event, value });
  
      if (!recordsByEvent[event]) recordsByEvent[event] = [];
      recordsByEvent[event].push({ date, value });
    }
  
    // グラフ用に日付昇順へ
    for (const k of Object.keys(recordsByEvent)) {
      recordsByEvent[k].sort((a, b) => a.date.localeCompare(b.date));
    }
  
    return { records, recordsByEvent };
  }
  
  /*************************************************
 * absences: tokenで絞り込み（今日以降のみ）
 * absencesシート想定: [token, name, date, type, updatedAt]
 *************************************************/
function getAbsencesByToken_(ss, token) {
    const sheet = ss.getSheetByName("absences");
    if (!sheet) return [];
  
    const values = sheet.getDataRange().getValues(); // ★ sliceしない（forでi=1から）
  
    const todayStr = Utilities.formatDate(
      new Date(),
      "Asia/Tokyo",
      "yyyy-MM-dd"
    );
  
    const result = [];
  
    for (let i = 1; i < values.length; i++) {
      const r = values[i];
  
      if (String(r[0]) !== String(token)) continue;
  
        let dateStr = "";
        if (r[2] instanceof Date) {
        dateStr = Utilities.formatDate(r[2], "Asia/Tokyo", "yyyy-MM-dd");
        } else {
        dateStr = String(r[2]).slice(0, 10);
        }

        if (dateStr < todayStr) continue;

        result.push({
        date: dateStr,
        type: r[3],
        updatedAt: r[4],
        });
    }
  
    // 日付降順
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }
  
  /*************************************************
   * event別にまとめる（フロントの処理を軽くする）
   *************************************************/
  function groupRecordsByEvent_(records) {
    const map = {};
    for (const rec of records) {
      const key = String(rec.event);
      if (!map[key]) map[key] = [];
      map[key].push({ date: rec.date, value: rec.value });
    }
  
    // date順（昇順）に整える（グラフ用）
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.date.localeCompare(b.date));
    }
    return map;
  }