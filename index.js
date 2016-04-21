'use strict';

var config = require('./config.json');
var Voimo = require('./lib/voimo');

Voimo.start(config);
