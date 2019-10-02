const xlsx = require('xlsx');
const wb = xlsx.readFile('./public/js/SampleExcel.xlsx');
const sheetNames = wb.SheetNames;


const readIntent = (intent) => {

    const utteranceArray = xlsx.utils.sheet_to_json(wb.Sheets[intent]);
    return utteranceArray;
}

module.exports = {
    readIntent: readIntent,
    sheetNames: sheetNames
}