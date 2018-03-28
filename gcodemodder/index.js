'use strict';

const LineByLineReader = require('line-by-line'),
	fs = require('fs'),
	config = require('./config.js');

let argv = require('minimist')(process.argv.slice(2)),
	writeLines = [],
	layerHeight = 0,
	currentLayer = 0,
	infile = '',
	outfile = '';

// Check our input variable, ensure at least an infile is specified
if (!argv.i) {
	console.log('\n\nError: You must specify an input file with -i\n\n');
	process.exit(1);
}

// Process any input / out variables
infile = argv.i;

if (argv.o) {
	outfile = argv.o;
} else {
	// Use a similiar name as the infile
	// TODO: parse out extension
	outfile = infile + '.striped.gcode';
}

let lineReader = new LineByLineReader(infile);

let stripeHeights = config.pattern,
	currentDrive = 0,
	currentStripeHeight = 0;

lineReader.on('line', function (line) {
	// Since we are manually controlling the hot end, any lines that are for a toolhead wes hould remove
	// Additionally, since we only expect T0, we can further limit our exclusion
	// TODO: regex it to support any number of toolheads
	if (line != 'T0') {
		// Put line in our lines array
		writeLines.push(line);
	}

	// Get layer height as soon as we can
	if (line.indexOf(';   layerHeight,') == 0) {
		layerHeight = parseFloat(line.substring(line.indexOf(',')+1));
		currentStripeHeight = layerHeight;
	}

	// We need to know what layer we are on
	if (line.indexOf('; layer ') == 0 && line != '; layer end') {
		let regex = /; layer ([0-9.]+), Z = ([0-9.]+)/g,
			regexResults = regex.exec(line);

		if (regexResults) {
			currentLayer = regexResults[1];
		}

		if (currentLayer > 0) {
			if (currentStripeHeight > stripeHeights[currentDrive]) {
				currentStripeHeight = layerHeight;
				currentDrive++;

				// Roll over if we exceed the array length
				if (currentDrive > stripeHeights.length - 1) {
					currentDrive = 0;
				}
			}

			// Insert tool change
			writeLines.push('T' + currentDrive);

			currentStripeHeight += layerHeight;
		}
	}
});

lineReader.on('end', function () {
	console.log('Writing File...');
	fs.writeFileSync(outfile, '');
	// Write modified G-code file
	writeLines.forEach((line) => {
		fs.appendFileSync(outfile, line + '\n');
	});
});