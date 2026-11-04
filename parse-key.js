const fs = require('fs');

const fileContent = fs.readFileSync('serviceAccountKey.json', 'utf8');
const json = JSON.parse(fileContent);

console.log('--- COPY THE LINE BELOW ---');
console.log(JSON.stringify(json));
