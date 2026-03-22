const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/titas-approved-students (2).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log("Headers:", data[0]);

// Print first 5 rows to see what data looks like
for (let i = 1; i < 6; i++) {
    console.log(`Row ${i}:`, data[i]);
}
