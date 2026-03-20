const fs = require('fs');
const path = '/Applications/XAMPP/xamppfiles/htdocs/Test 1/titas_unified/components/registration/StudentForm.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

let idx1 = lines.findIndex(l => l === '    return (');
let idx2 = lines.findIndex((l, i) => i > idx1 && l === '    return (');
if (idx2 !== -1) {
    lines.splice(idx2, 1);
}

let formIdx = lines.findIndex(l => l.includes('<form onSubmit={handleSubmit} className="space-y-12">'));
let animIdx = lines.findIndex((l, i) => i > formIdx && l.includes('<AnimatePresence>'));
if (formIdx !== -1 && animIdx !== -1) {
    lines.splice(formIdx + 1, animIdx - formIdx - 1);
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Fixed!");
