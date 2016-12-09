"use strict";
var casper = require('casper').create({
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

var http = require('http');
var utils = require('utils');
var f = utils.format;
var fs = require('fs');
var seedListFinder = require('seedListFinder.js');
var seedListFinderInstance = new seedListFinder('e16');

var collectionUrl = seedListFinderInstance.getCollectionUrl();

var PATH = '/home/cdool/test_js/notebooks/qa/casperjs/';
var writeDir = '';

// Variables from CLI
var seed = casper.cli.raw.get('seed');
var record = casper.cli.raw.get('record');
var scope = casper.cli.raw.get('scope');
var maxDepth = casper.cli.get('max-depth') || 250;

var links = [seed];
var clientErrorLinks = [];
var serverErrorLinks = [];
var okayLinks = [];
var checked = [];
var currentLink = 0;
var urlSplit = /\/\d{14}\//;
var baseSeed = seed.split(/2/)[1];
var baseArchiveUri = seed.split(/2/)[0];



/**
 * @return {Array} Array of links
 */
function getLinks() {
    var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function (e) {
    	return e.getAttribute('href'); 
    });
}

/**
 * @param  {links}
 * @return {[Array]}
 */
function normalizeSeedLinks(links) {
    var relativeLinks = Array.prototype.map.call(links, function(url){
        if (!(/^https?:\/\/|^\/\/|^ftp:\/\//i.test(url)) &&
            !new RegExp('^(#|mailto:|javascript:)').test(url)) {
            url = seed + url;
        };
        return url;
    });
    links = links.concat(relativeLinks);

	return utils.unique(links).filter(function(url) {
		return !new RegExp('^(#|mailto:|javascript:)').test(url);
	}).filter(function(url) {
        return okayLinks.indexOf(url.split(urlSplit)[1]) === -1;
    }).filter(function(url) {
        return !new RegExp('webarchive\.loc\.gov').test(url);;
    }).filter(function(url) {
        return url.indexOf(scope) > -1;
    }).filter(function(url) {
		return checked.indexOf(url) === -1;
	});
}

/**
 * @param  {link}
 * @return {[type]}
 */
function crawl(link) {
    this.start().then(function() {
        this.echo('Crawling: ' + link);
        this.open(link);
        checked.push(link);
    });
    this.then(function() {
        if (/4\d\d/.test(this.currentHTTPStatus.toString())) {
            this.warn(link + f(' is broken (HTTP %s)', this.currentHTTPStatus));
            fs.write(writeDir+'/4xx.txt', link + f(' (HTTP %s)\n', this.currentHTTPStatus), 'a');
            clientErrorLinks.push(link);
        } else if (/5\d\d/.test(this.currentHTTPStatus.toString())) {
            this.warn(link + f(' is broken (HTTP %s)', this.currentHTTPStatus));
            fs.write(writeDir+'/5xx.txt', link + f(' (HTTP %s)\n', this.currentHTTPStatus), 'a');
            serverErrorLinks.push(link);
        } else {
            this.echo(link + f(' is okay (HTTP %s)', this.currentHTTPStatus));
            fs.write(writeDir+'/200.txt', link + f(' (HTTP %s)\n', this.currentHTTPStatus), 'a');
            if (link.split(urlSplit)[1]) {
                okayLinks.push(link.split(urlSplit)[1].trim());
            };
        }
    });
    this.then(function() {
        var newLinks = normalizeSeedLinks(this.evaluate(getLinks));
        links = links.concat(newLinks).filter(function(url) {
            return checked.indexOf(url) === -1;
        });
        this.echo(newLinks.length + " new links found on " + link);
    });
}

function getLinks() {
    var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function (e) {
    	return e.getAttribute('href'); 
    });
}

function check() {
    if (links[currentLink] && currentLink < maxDepth) {
        var link = links[currentLink];
        if (link.indexOf(baseArchiveUri) === -1) {
            this.warn('REDIRECTS TO LIVE SITE');
            fs.write(writeDir+'/live.txt', link + 'REDIRECTS TO LIVE SITE\n', 'a');
        };
        if (link.indexOf(baseArchiveUri) > -1 && okayLinks.indexOf(link.split(urlSplit)[1].trim()) === -1) {
            crawl.call(this, link);   
        };
        currentLink++;
        this.run(check);
    } else {
        this.echo("All done, " + checked.length + " links checked.");
        console.log("All done, " + checked.length + " links checked.");
        this.exit();
    }
}

if (!seed) {
    casper.warn('No seed passed, aborting.').exit();
}

if (!record) {
    casper.warn('No record passed, aborting.').exit();
}

if (!scope) {
    casper.warn('No scope passed, aborting.').exit();
}

casper.start(seed, function() {
	console.log('Starting');
    writeDir = PATH + record + '/';
    fs.makeDirectory(writeDir);
    writeDir += scope.replace('/', '_') + '/';
    fs.makeDirectory(writeDir);
}).run(check);