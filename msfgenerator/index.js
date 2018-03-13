const LineByLineReader = require('line-by-line'),
	ejs = require('ejs'),
	fs = require('fs'),
	ieee754 = require('ieee754'),
    config = require('./config.js');

let argv = require('minimist')(process.argv.slice(2));
    layers = [],
    layer = 0,
    previousExtrusion = 0,
    totalLength = 0,
    interimLayerLength = 0,
    layerHeight = 99999,
    currentLayer = 0,
    infile = '',
    outfile = '';

// Check our input variable, ensure at least an infile is specified
if (!argv.i) {
	console.log('\n\nError: You must specify an input file with -i\n\n');
	process.exit(1);
}

console.log(argv);

// Process any input / out variables
infile = argv.i;

if (argv.o) {
	outfile = argv.o;
} else {
	// Use asimiliar name as the infile
	outfile = infile + '.msf';
}

let lineReader = new LineByLineReader(infile);

layers[0] = {
	layer: 0,
	z: 0,
	lines: [],
	length: 0
}

lineReader.on('line', function (line) {
	if (line.indexOf(';   layerHeight,') == 0) {
		layerHeight = parseFloat(line.substring(line.indexOf(',')+1));
	}

	// We need to know what layer something is on
	if (line.indexOf('; layer ') == 0 || line == '; layer end') {
		layers[layer].length = interimLayerLength;
		interimLayerLength = 0;

		var regex = /; layer ([0-9.]+), Z = ([0-9.]+)/g,
			regexResults = regex.exec(line);

		if (regexResults) {
			layer = regexResults[1];
			layers[layer] = {
				layer: layer,
				z: regexResults[2],
				lines: [],
				length: 0
			};
		}
	}

	if (line != 'G92 E0') {
		var extrusionRegex = /E([\-0-9.]+)/g,
			extrusionRegexResults = extrusionRegex.exec(line);

		if (extrusionRegexResults) {
			previousExtrusion = parseFloat(extrusionRegexResults[1]);
		}
	}

	if (line == 'G92 E0') {
		interimLayerLength += previousExtrusion;
		totalLength += previousExtrusion;
	}

	layers[layer].lines.push(line);
});

lineReader.on('end', function () {
	// Generate msf

	var stripeHeights = config.pattern,
		spliceArray = [],
		splices = '',
		driveIndex = 0, // tracks which array element we are on
		currentDrive = 0,
		currentStripeheight = layerHeight,
		currentStripeLength = 0;

	layers.forEach(function(layer) {
		if (layer.layer > 0) {
			// Add the length
			currentStripeLength += layer.length;

			if (currentStripeheight > stripeHeights[currentDrive]) {
				currentStripeheight = layerHeight;
				driveIndex++;
				currentDrive++;

				// Roll over if we exceed the array length
				if (currentDrive > stripeHeights.length - 1) {
					currentDrive = 0;
				}
			}

			if (spliceArray[driveIndex]) {
				spliceArray[driveIndex].setLength(currentStripeLength);
			} else {
				spliceArray[driveIndex] = new Splice(currentDrive, currentStripeLength, config.correction);
			}

			spliceArray[driveIndex].addLayer(layer.layer);

			currentStripeheight += layerHeight;
		}
	});

	// Add 1000mm to the last splice as a safety buffer
	spliceArray[spliceArray.length-1].length = totalLength + 1000;

	spliceArray.forEach(function(splice) {
		splices += splice.getMsfString() + '\r\n';
	});

	var position = 0;
	spliceArray.forEach(function(splice) {
		// console.log(splice.getFriendlyString());

		spliceLength = splice.getLength() - position;
		position = splice.getLength();
		if (spliceLength < 140) {
			console.log();
			console.log('Splice Length of ' + spliceLength + ' is less than 140mm, aborting.');
			console.log();
			process.exit(0);
		}
	});

	ejs.renderFile('./templates/msf.ejs', {
		drives: config.drives.join(';'),
		numberSplices: toPaddedHexString(spliceArray.length, 4),
		splices: splices
	}, { }, function(err, msfString){
//    	console.log(msfString);

		fs.writeFile(outfile, msfString, (err) => {
			if (err) throw err;
			console.log('Wrote custom msf');
		});

    });
});


function toPaddedHexString(num, len) {
    let str = (num).toString(16);
    return '0'.repeat(len - str.length) + str;
}

class Splice {
	constructor(drive, length, correction) {
		this.drive = drive;
		this.length = length;
		this.correction = correction;
		this.layers = [];
	}

	addLayer(layerNo) {
		this.layers.push(layerNo);
	}

	setLength(length) {
		this.length = length;
	}

	getLength() {
		return this.length;
	}

	getFriendlyString() {
		return 'Layers: ' + this.layers[0] + '-' + this.layers[this.layers.length-1] + '\n - Count:  ' + this.layers.length + '\n - Drive:  ' + this.drive + '\n - Length: ' + this.correctedLength() + ' mm';
	}

	getMsfString() {
		return '(0' + this.drive + ',' + this.lengthToHexString(this.correctedLength()) + ')';
	}

	correctedLength() {
		return this.length * this.correction;
	}

	lengthToHexString(length) {
		let b = new Buffer(4);
		let hexString = '';
		ieee754.write(b, length, 0, false, 23, 4);
		for (let i = 0; i < b.length; i++) {
			hexString += ('00' + b[i].toString(16)).substr(-2);
		}
		return hexString;
	}
}
