const fs = require('node:fs');
fs.copyFileSync('db.seed.json', 'db.json');
console.log('Kezdoadatok visszaallitva.');