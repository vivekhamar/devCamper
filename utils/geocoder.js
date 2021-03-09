const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: '2DKczD2HshNOG6YdGGsAGm0TvKBsrQRa',
    formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;