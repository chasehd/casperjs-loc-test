/*global URI*/

var casper = require("casper").create();
var checked = [];
var currentLink = 0;
var fs = require('fs');
var upTo = ~~casper.cli.get('max-depth') || 100;
var seed = casper.cli.get('seed');
var record = casper.cli.get('record');
var links = [url];
var utils = require('utils');
var f = utils.format;

/**
 * @url  {[string]} the relative URI path that eeds to be appended
 * @base  {[string]} this is the seed to which the relative URI needs to be appended
 * @return {[string]} new concat'd URI
 */
function absPath(url, base) {
    return new URI(url).resolve(new URI(base)).toString();
}


function normalizeLinks(urls, base) {
    return utils.unique(urls).filter(function(url) {
        return url.indexOf(seed) === 0 || !new RegExp('^(#|mailto|javascript)').test(url);
    }).map(function(url) {
        return absPath(url, base);
    }).filter(function(url) {
        return checked.indexOf(url) === -1;
    });
}

// Opens the page, perform tests and fetch next links
function crawl(link) {
    this.start().then(function() {
        this.echo(link, 'COMMENT');
        this.open(link);
        checked.push(link);
    });
    this.then(function() {
        if (this.currentHTTPStatus === 404) {
            this.warn(link + ' is missing (HTTP 404)');
        } else if (this.currentHTTPStatus === 500) {
            this.warn(link + ' is broken (HTTP 500)');
        } else {
            this.echo(link + f(' is okay (HTTP %s)', this.currentHTTPStatus));
        }
    });
    this.then(function() {
        var newLinks = searchLinks.call(this);
        links = links.concat(newLinks).filter(function(url) {
            return checked.indexOf(url) === -1;
        });
        this.echo(newLinks.length + " new links found on " + link);
    });
}

// Fetch all <a> elements from the page and return
// the ones which contains a href starting with 'http://'
function searchLinks() {
    return normalizeLinks(this.evaluate(function _fetchInternalLinks() {
        return [].map.call(__utils__.findAll('a[href]'), function(node) {
            return node.getAttribute('href');
        });
    }), seed);
}

// As long as it has a next link, and is under the maximum limit, will keep running
function check() {
    if (links[currentLink] && currentLink < upTo) {
        crawl.call(this, links[currentLink]);
        currentLink++;
        this.run(check);
    } else {
        this.echo("All done, " + checked.length + " links checked.");
        this.exit();
    }
}

if (!url) {
    casper.warn('No url passed, aborting.').exit();
}

casper.start(seed);

casper.run(process);

function process() {
    casper.start().then(function() {
        this.echo("Starting");
    }).run(check);
}
