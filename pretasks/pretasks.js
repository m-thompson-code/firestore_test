// const helpers = require('./helpers');

const handleSvgFileArray = require('./handleSvgFileArray/handleSvgFileArray');

// Source: https://github.com/angular/angular-cli/issues/5759

// Changing colors in terminal for console.error
// source: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

// directors should be from the root of project <root>/src/app/assets/*, etc
const svgInputDirsFromRoot = [
    // "./pretasks/handleSvgFileArray/test",
    "./src/assets/svg"
];

// Note that we should add the output file in git-ignore since it is auto generated and can lead to merge conflicts that don't really matter
const svgOutputDirsFromRoot = [
    "./src/app"
];

const outputSvgFilesFileName = 'svg_files.json';// defaults to svg_files.json if no file name is given

console.log("Starting pretasks");

handleSvgFileArray.handleDirs(svgInputDirsFromRoot, svgOutputDirsFromRoot, outputSvgFilesFileName);

console.log("Completed pretasks");
