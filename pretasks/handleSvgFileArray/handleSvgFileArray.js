// helper includes way to get path
const helpers = require('../helpers');

const path = require('path');

const fs = require('fs');

// Changing colors in terminal for console.error
// source: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const error_color = '\x1b[31m%s\x1b[0m';// red
const success_color = '\x1b[32m%s\x1b[0m';// green
const warning_color =  '\x1b[33m%s\x1b[0m';// yellow

function handleDirs(inputPathsFromRoot, outputPathsFromRoot, outputSvgFilesFileName) {
	if (!inputPathsFromRoot || !inputPathsFromRoot.length) {
		console.log("Skipped generating svg files array");
		return;
	}

	if (!outputPathsFromRoot || !outputPathsFromRoot.length) {
		console.error(error_color, "No output paths found for the svg file array");
		return;
	}

	var svgFilesArray = [];

	for (var i = 0; i < inputPathsFromRoot.length; i++) {
		handleDir(inputPathsFromRoot[i], svgFilesArray);
	}

	for (var i = 0; i < outputPathsFromRoot.length; i++) {
		var outputPath = path.join(helpers.root(outputPathsFromRoot[i]), outputSvgFilesFileName || 'svg_files.json');

		fs.writeFileSync(outputPath, JSON.stringify(svgFilesArray));
		console.log("Wrote svg files array:", outputPath);
	}

	console.log("Completed generating svg files array");

	return svgFilesArray;
}

function handleDir(pathFromRoot, svgFilesArray) {
	var normalizedPath = helpers.root(pathFromRoot);

	console.log(normalizedPath,"- Preparing svg files array");

	try {
		var successful = 0;
		var skipped = 0;

		// Get all files in directory
		fs.readdirSync(normalizedPath).forEach(function(filename) {
		  	const periodCount = (filename.match(/\./g) || []).length;

		    // Verify filename includes .svg ext, doesn't contain multiple periods (.), and contains no spaces.
		    if (!periodCount) {
		      	console.warn(warning_color, "Skipped - File doesn't have an extention '*.*':", filename);
		      	skipped += 1;
		    } else if (filename.substr(filename.lastIndexOf(".") + 1, filename.length) !== 'svg') {
				console.warn(warning_color, "Skipped - File extention was not '*.svg':", filename);
				skipped += 1;
		    } else if (periodCount > 1) {
		      	console.error(error_color, "Skipped - File name cannot contain multiple periods (.) '*.*.*':", filename);
		      	skipped += 1;
		    } else if (filename.indexOf(' ') !== -1) {
		      	console.error(error_color, "Skipped - File name cannot contain spaces. Please use underscores '* *':", filename);
		      	skipped += 1;
		    } else {
		    	// console.log(success_color, filename);
		    	successful += 1;

		    	var file = filename.substr(0, filename.lastIndexOf("."));
		    	svgFilesArray.push(file);
		    }
		});

		console.log(success_color, `svg files listed: ${successful}`);

		if (skipped) {
			if (skipped <= 10) {
				console.warn(warning_color, `Skipped files: ${skipped}`);
			} else {
				console.error(error_color, `Skipped files: ${skipped}`);
			}
		}

		return svgFilesArray;

	}catch(error) {
		console.error(error_color, error);
		const errorMessage = error && error.message || error || 'Unknown error';
		throw errorMessage;
	}
}

exports.handleDirs = handleDirs
