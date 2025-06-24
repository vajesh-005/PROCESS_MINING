import csv from "fast-csv";
import { Readable } from "stream";

function isDateLike(value) {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !isNaN(parsed);
}

function normalizeRow(row) {
  const newRow = {};

  for (const key in row) {
    const value = row[key];
    if (isDateLike(value)) {
      newRow[key] = new Date(value).toISOString();
    } else {
      newRow[key] = value;
    }
  }

  return newRow;
}

export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headers = [];

    const csvStream = csv
      .parse({ headers: true })
      .on("headers", (csvHeaders) => {
        headers = csvHeaders;
        console.log(" CSV Headers:", headers);
      })
      .on("data", (row) => {
        const completeRow = {};
        for (const header of headers) {
          const value = row[header];
          if (isDateLike(value)) {
            completeRow[header] = new Date(value).toISOString();
          } else {
            completeRow[header] = value ?? null;
          }
        }

        rows.push(completeRow);
      })
      .on("error", (err) => {
        console.error(" CSV parse error:", err);
        reject(err);
      })
      .on("end", (rowCount) => {
        console.log(`Parsed & normalized ${rowCount} rows`);
        resolve({ headers, rows });
      });

    if (file.pipe) {
      file.pipe(csvStream);
    } else {
      const bufferStream = new Readable();
      bufferStream.push(file);
      bufferStream.push(null);
      bufferStream.pipe(csvStream);
    }
  });
}
