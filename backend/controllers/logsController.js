const logService = require("../services/logService");

exports.uploadCSV = async (request, h) => {
  try {
    const { file } = request.payload;
    const result = await logService.saveCSVTable(file);
    return h.response(result).code(200);
  } catch (err) {
    console.error(" Error in uploadCSV:", err)  // 👈 Logs real error
    return h.response({ error: err.message || "Internal server error" }).code(500);
  }
};
exports.getAllRecords = async (request, h) => {
  try{
    const result = await logService.records();
    return h.response(result).code(200);
  }
  catch(error){
    console.log("getAllRecords" , error);
    return h.response({message : err.message || "Internal server error"}).code(500);
  }
}

