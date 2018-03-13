var config = {
	pulsesPerMM: 30.107995986938477,
	loadingOffset: 19304,

	// Correction factor = total filament requested / total filament used
	correction: 1.0069,

	// Example from msf: cu:1Black PLA;1Transparent PLA;0;0;
	// 0  = don't use frive / 1 = use drive
	// PLA = material
	// You don't have to have a named color
	drives: [
		'1White PLA',
		'1Transparent PLA',
		'0',
		'0'
	],

	// Pattern height is in mm. Right now only supports one height per drive
	pattern: [
		3,      // drive 1
		1.5     // drive 2
	]
};

module.exports = config;