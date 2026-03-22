const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/titas-approved-students (2).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const head = data[4];
console.log("Headers:", head);

let matchedRows = 0;
for (let i = 5; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    
    const employed = row[12] === 'Yes';
    const org = row[13];
    const title = row[14];
    
    if (employed || org || title) {
        matchedRows++;
        console.log(`Matched Row ${i}: Mobile: ${row[7]}, Org: ${org}, Title: ${title}`);
    }
}
console.log(`Total rows with job data: ${matchedRows}`);
