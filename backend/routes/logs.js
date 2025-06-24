const logsController = require("../controllers/logsController");

module.exports = [
  {
    method: "POST",
    path: "/upload",
    options: {
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 50 * 1024 * 1024, 
        allow: "multipart/form-data"
      },
    },
    handler: logsController.uploadCSV
  },
  {
    method : 'GET',
    path : '/all-cases',
    handler: logsController.getAllRecords
  }
];

