'use strict';

exports.transform = function (station) {
  return {
    'id': station.Id,
    'name': station.NameNL,
    'location': JSON.stringify({
      'latitude': station.Latitude,
      'longitude': station.Longitude,
    })
  };
};