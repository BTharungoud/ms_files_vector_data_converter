// src/readers/excel.reader.ts
import xlsx from "xlsx";

export function readExcel(path: string): string {
  const workbook = xlsx.readFile(path);
  let text = "";

  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    rows.forEach(row => {
      text += row.join(" ") + "\n";
    });
  });

  return text;
}
