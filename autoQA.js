"use strict";
var casper = require('casper').create({
    // verbose: true,
    // logLevel: "debug",
    waitTimeout: 60000,
    stepTimeout: 60000,
    onStepTimeout: function() {
        this.warn(f('%s timed out. Moving on.', this.getCurrentUrl()));
        fs.write('/home/cdool/test_js/notebooks/qa/casperjs/error.txt', f('%s timed out. Moving on.\n', this.getCurrentUrl()), 'a');
        if (!(links.length > 1)) { this.exit();};
    },
    onWaitTimeout: function() {
        this.warn('timeout');
    }
});

var utils = require('utils');
var f = utils.format;
var fs = require('fs');
var seedListFinder = require('seedListFinder.js');
var seedListScraper = require('seedScraper.js');

var collection = casper.cli.raw.get('col');
var seedListFinderInstance = new seedListFinder(collection);
var collectionUrl = seedListFinderInstance.getCollectionUrl();

if (!collection) {
    casper.warn('No collection passed, aborting.').exit();
}

if (collectionUrl.indexOf('-1') > -1) {
	casper.warn('Not a valid collection. Please choose one of the following: '+ seedListFinderInstance.getCollections() +', aborting.').exit();
};

casper.start(collectionUrl, function(){
    this.wait(500);
});

casper.then(function() {
    this.click('a#seedsListLink');
});

casper.then(function(){
    var seedList = this.getHTML('pre');
    var seedListScraperInstance = new seedListScraper(seedList);
    var records = seedListScraperInstance.getRecords();
    console.log(records);
});

casper.run();
