#!/usr/bin/env node

'use strict';

var redis     = require('redis'),
    client    = redis.createClient(),
    request   = require('request'),
    slug      = require('slug'),
    map       = require('./map'),
    OAuth     = require('./lib/oauth');

// Check for environment variables
if (!process.env.RAILTIME_CONSUMER_KEY || !process.env.RAILTIME_CONSUMER_SECRET) {
  console.warn('One or more required environment variables are not set.');
  process.exit(0);
}

function getStations(callback) {
  request.get(new OAuth('RetrieveStationList', {}), function(err, resp, body) {
    if (err)
      callback(err);
    else
      callback(null, body);
  });
}

function storeStations(err, stations) {

  if (err || !stations) {
    console.error('Could not store stations:', err);
    return;
  }

  // populate stations by id
  stations.forEach(function(station, i) {
    // filter out non-belgian and non-commercial stations
    if (!station.IsBelgianStation
     || !station.IsCommercialStation
     || station.IsDeleted) return;

    client.hmset('station:' + parseInt(station.Id), map.transform(station)); // station:id namespace

    client.hmset('station:names', slug(station.NameEN.toLowerCase()), parseInt(station.Id));
    client.hmset('station:names', slug(station.NameNL.toLowerCase()), parseInt(station.Id));
    client.hmset('station:names', slug(station.NameFR.toLowerCase()), parseInt(station.Id));
    client.hmset('station:names', slug(station.NameDE.toLowerCase()), parseInt(station.Id));
  });

  client.quit();

  console.log('success.');
}

(function() {
  getStations(storeStations);
})();