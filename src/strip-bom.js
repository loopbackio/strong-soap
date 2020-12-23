// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
strip the BOM characters in the beginning of UTF-8 
or other unicode encoded strings
http://en.wikipedia.org/wiki/Byte_order_mark 
*/
'use strict';
module.exports = stripBom;

function stripBom(str){

	if (typeof str !== 'string') {
		throw new Error('Invalid input, only string allowed');
	}
	var chunk = Buffer.from(str);
	var transformed;
	var value = str;
	if (chunk[0] === 0xFE && chunk[1] === 0XFF) {
		transformed = chunk.slice(2);
	}
	if (chunk[0] == 0xEF && chunk[1] == 0xBB && chunk[2] == 0xBF) {
		transformed = chunk.slice(3);
	}
	if (transformed) {
		value = transformed.toString();
	}
	return value;
};
