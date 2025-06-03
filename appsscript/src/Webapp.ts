function doGet(e: GoogleAppsScript.Events.AppsScriptHttpRequestEvent) {
  switch (e.pathInfo) {
    case "upkeep":
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      const template = HtmlService.createTemplateFromFile('Upkeep');
      template.now = now.toISOString().slice(0, 16);
      template.siteId = e.parameter.siteId;
      return template
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    default:
      return ContentService.createTextOutput(JSON.stringify({ status: "Not Found", e })).setMimeType(ContentService.MimeType.JSON);
  }
}

type UpkeepFormData = {
  siteId: string;
  date: string;
  /// `form.work` may be undefined, a string value, or an array of string values.
  work?: string | string[];
  status: string;
  notes: string;
  inspector: string;
};

function submitUpkeep(form: UpkeepFormData) {
  const spreadsheet = SpreadsheetApp.openById('1jMJtNyq-rJRrdOE7jwW-GF5RnBwqSOhgN7oWia9iqsw');
  const upkeepSheet = spreadsheet.getSheetById(1616874745)!;
  const work = [form.work || []].flat().join('\n');
  upkeepSheet.appendRow([form.siteId, form.date, work, form.status, form.notes, form.inspector]);
  return 'Spreadsheet Updated';
}

