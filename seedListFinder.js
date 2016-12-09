/**
 * The idea is to loop through each collection and capture the seed list.
 * It will be the a#seedsListLink.
 * Then we'll need to grab all the the seeds and their scopes, and loop through them,
 * unsurt the scopes, and pass each record with its unsurted scopes to the 404.js portion.
 *
 * Or this should be treated more like a Class Object.
 */
"use strict";
var seedListFinder = function (collection) {
	
	this.isValidCollection = function () {
		return this.getCollections().indexOf(collection) > -1;
	};

	this.getCurrentCollection = function () {
		if (this.isValidCollection()) {
			return collection;
		} else {
			return -1;
		};
	};

	this.getCollections = function () {
		return ['e16', 'monthly', 'weekly', 'special', 'quarterly'];
	};

	this.getBaseUrl = function () {
		return 'http://loc.archive.org/collections/';
	};

	this.getCollectionUrl = function () {
		return this.getBaseUrl() + this.getCurrentCollection();
	}
};

module.exports = seedListFinder;