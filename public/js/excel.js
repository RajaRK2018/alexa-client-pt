// const xlsx = require('xlsx');

// //For Server side excel file
// //const wb = xlsx.readFile('public/js/SampleExcel.xlsx');

// // const getUtteranceArray = (intent) => {
    
// //     const utteranceArray = xlsx.utils.sheet_to_json(wb.Sheets[intent]);

// //     return utteranceArray;
// // }

// //For Client side excel file

// const getIntentArray = (fileData, options) => {

//     const wb = xlsx.read(fileData, options);

//     const sheetNames = wb.SheetNames;

//     return sheetNames;

// }

const getUtteranceArray = (fileData, options, intent) => {

    const wb = xlsx.read(fileData, options);

     const utteranceArray = xlsx.utils.sheet_to_json(wb.Sheets[intent]);

     return utteranceArray;
}

module.exports = {
    getUtteranceArray: getUtteranceArray,
    // getIntentArray: getIntentArray
}