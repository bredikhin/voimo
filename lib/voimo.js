'use strict';

var spawn = require('child_process').spawn;
var split = require('split');
var Wemo = require('wemo-client');
var wemo = new Wemo();
var PlaySound = require('play-sound');
var player = PlaySound({player: 'aplay'});
var ps = null; // PocketSphinx
var active = false;
var cleanExit = function() {
  process.exit();
};

module.exports = {
  start: function(config, cb) {
    // Spawned PocketSphinx process needs to be killed
    // whenever the main process gets terminated
    process.on('SIGINT', cleanExit); // catch ctrl-c
    process.on('SIGTERM', cleanExit); // catch kill
    process.on('exit', function() {
      if (ps) {
        ps.kill();
      }
    });

    // Wemo device handler
    var deviceHandler = function(deviceInfo) {
      // Get the client for the found device
      var client = wemo.client(deviceInfo);

      // Get the bulbs
      client.getEndDevices(function(err, endDevices) {
        if (err) {
          console.error(err);
        }

        // Index the bulbs by friendly name
        var bulbs = {};
        for(var i = 0; i < endDevices.length; i++) {
          bulbs[endDevices[i].friendlyName] = endDevices[i];
        }

        // Start Pocketsphinx for continuous recognition
        ps = spawn('pocketsphinx_continuous', config.pocketsphinx.options);

        // Commands go to child process' stdout
        ps.stdout.pipe(split()).on('data', function(command) {
          if (command === config.activationCommand) {
            player.play('./sounds/in.wav');
            active = true;
            console.log('Now active!');

            // Deactivate in 5 seconds
            setTimeout(function() {
              player.play('./sounds/out.wav');
              active = false;
            }, 5000);
          } else if ((active) && (config.commands[command])) {
            var params = config.commands[command];
            console.info(command + ': ' + params.deviceName + ', ' + params.capability + ', ' + params.value);
            if (bulbs[params.deviceName]) {
              client.setDeviceStatus(bulbs[params.deviceName].deviceId, params.capability, params.value);
            }
          }
        });

        // Log other output from Pocketsphinx if needed
        if (config.verbose) {
          ps.stderr.pipe(split()).on('data', function(data) {
            console.log(data);
          });
        }

        if (typeof(cb) == 'function') { // callback
          cb({
            ps: ps,
            wemoClient: client
          });
        }
      });
    };

    // Load the Wemo link or try to discover
    if ((config)&&(config.wemo)&&(config.wemo.linkUrl)) {
      wemo.load(config.wemo.linkUrl, deviceHandler);
    } else {
      wemo.discover(deviceHandler);
    }
  },
  stop: cleanExit
};
