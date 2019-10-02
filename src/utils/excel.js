const xlsx = require('xlsx');
const wb = xlsx.readFile('D:/JS/NodeJS/alexa-client-pt/src/utils/SampleExcel.xlsx');
const sheetNames = wb.SheetNames;


const readIntent = (intent) => {

    const utteranceArray = xlsx.utils.sheet_to_json(wb.Sheets[intent]);
    return utteranceArray;
}

module.exports = {
    readIntent: readIntent,
    sheetNames: sheetNames
}