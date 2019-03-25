// const helpers = require('./helpers');

const handleSvgFileArray = require('./handleSvgFileArray/handleSvgFileArray');

// Source: https://github.com/angular/angular-cli/issues/5759

// Changing colors in terminal for console.error
// source: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

// directors should be from the root of project <root>/src/app/assets/*, etc
const svgInputDirsFromRoot = [
    "./pretasks/handleSvgFileArray/test",
    "./src"
];

const svgOutputDirsFromRoot = [
    "./src/assets/lists"
];

console.log("Starting pretasks");

handleSvgFileArray.handleDirs(svgInputDirsFromRoot, svgOutputDirsFromRoot);

console.log("Completed pretasks");
