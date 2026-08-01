const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint_errors.json', 'utf8'));
data.forEach(file => {
  const errors = file.messages.filter(m => m.severity === 2);
  if (errors.length > 0) {
    console.log(`\nFILE: ${file.filePath}`);
    errors.forEach(e => {
      console.log(`Line ${e.line}:${e.column} - ${e.message} (${e.ruleId || 'syntax'})`);
    });
  }
});
