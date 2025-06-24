const db = require("../config/db");
const { PassThrough } = require("stream");
const { parse } = require("fast-csv");

const tableName = "event_logs";
exports.tableName = tableName;
exports.saveCSVTable = async (file) => {
  try {
    const con = db.connect();
    const rows = [];
    let columns = [];

    const passthrough = new PassThrough();
    file.pipe(passthrough);

    await new Promise((resolve, reject) => {
      const stream = parse({ headers: true })
        .on("data", (row) => {
          if (columns.length === 0) columns = Object.keys(row);
          rows.push(row);
        })
        .on("end", resolve)
        .on("error", reject);

      passthrough.pipe(stream);
    });

    if (rows.length === 0) throw new Error("CSV is empty");

    //Dropping all the tables before creating a new one !
    await new Promise((resolve, reject) => {
      con.all(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'",
        async (err, tables) => {
          if (err) return reject(err);

          const dropPromises = tables.map((t) => {
            const dropSQL = `DROP TABLE IF EXISTS "${t.table_name}"`;
            return new Promise((res, rej) => {
              con.run(dropSQL, (dropErr) => {
                if (dropErr) rej(dropErr);
                else res();
              });
            });
          });

          try {
            await Promise.all(dropPromises);
            resolve();
          } catch (dropErr) {
            reject(dropErr);
          }
        }
      );
    });

    const createSQL = `CREATE TABLE "${tableName}" (${columns
      .map((col) => `"${col}" TEXT`)
      .join(", ")})`;
    await new Promise((resolve, reject) => {
      con.run(createSQL, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    //insertion of data
    const insertPromises = rows.map((row) => {
      const values = columns.map(
        (col) => `'${(row[col] || "").replace(/'/g, "''")}'`
      );
      const sql = `INSERT INTO "${tableName}" VALUES (${values.join(", ")})`;
      return new Promise((resolve, reject) => {
        con.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    await Promise.all(insertPromises);

    return {
      message: "All old tables dropped, CSV stored as new table",
      tableName,
      rowCount: rows.length,
      colCount: columns.length,
    };
  } catch (err) {
    console.error("Error in saveCSVTable:", err);
    throw err;
  }
};

exports.records = async () => {
  const con = db.connect();
  const getSQL = `SELECT * FROM ${tableName}`;
  return new Promise((resolve, reject) => {
    con.all(getSQL, (err, rows) => {
      if (err) {
        console.error("DuckDB SELECT error:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};
