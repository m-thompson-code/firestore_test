const path = require('path');

// should be the root of project assuming <root>/pretasks/helpers.js
// Modify '..' if this changes
const ROOT = path.resolve(__dirname, '..');

const root = path.join.bind(path, ROOT);

exports.root = root;
