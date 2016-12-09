/**
 * The idea is to loop through each collection and capture the seed list.
 * It will be the a#seedsListLink.
 * Then we'll need to grab all the the seeds and their scopes, and loop through them,
 * unsurt the scopes, and pass each record with its unsurted scopes to the 404.js portion.
 *
 * Or this should be treated more like a Class Object.
 */
"use strict";
var seedScraper = function (list) {
	
	this.sl = list;

	this.unsurt = function(scopes) {
		var seed = scopes.shift();
		var scopeRegex = /\((.+?)\)(\/.+?$)/;
		var altScopeRegex = /\((.+?$)/;
		for (var i in scopes) {
			if (!(/-http:\/\//.test(scopes[i]))) {
				
			} else{};
			scopes[i] = scopes[i].split('+http://')[1];
			var match = scopes[i].match(scopeRegex);
			if (match) {
				scopes[i] = match[1].split(',');
				scopes[i].reverse();
				scopes[i].shift();
				scopes[i] = scopes[i].join('.') + match[2];
				console.log(scopes[i]);
			} else {
				var match = scopes[i].match(altScopeRegex);
				if (match) {
					scopes[i] = match[1].split(',');
					scopes[i].reverse();
					scopes[i].shift();
					scopes[i] = scopes[i].join('.');
					console.log(scopes[i]);
				};
			}
		}
	}

	this.getRecords = function() {
		var recordRegex = /^(# Record ID (\d{4,5}).*[\S\s]*)/gm;
		var recordIdRegex = /^# Record ID (\d{4,5})/;
		var records = this.sl.match(recordRegex)[0].split('\n\n');
		var seeds = [];
		var seedMap = {};
		for (var i in records) {
			if (records[i].indexOf('Record ID') > -1) {
				seeds.push(records[i]);
			};
		}
		for (var i in seeds) {
			var scopes = seeds[i].split('\n').slice(1);
			var recordId = seeds[i].match(recordIdRegex)[1];
			console.log(recordId);
			this.unsurt(scopes);
			// seedMap[] = ;
		}
		return true;
	}
};

module.exports = seedScraper;