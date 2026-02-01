// src/readers/txt.reader.ts
import fs from "fs";

export function readTxt(path: string): string {
  return fs.readFileSync(path, "utf-8");
}
