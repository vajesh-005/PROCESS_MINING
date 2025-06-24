const duckdb = require("duckdb");
const path = require("path");

const dbPath = path.join(__dirname, "../uploads/process.duckdb");
const db = new duckdb.Database(dbPath);

module.exports = db;
