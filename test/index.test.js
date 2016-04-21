'use strict';

var should = require('should');
var sinon = require('sinon');
var Voimo = require('../lib/voimo');
var config = require('./fixtures/config.json');
var ps;
var wemoClient;

describe('Voimo', function() {
  describe('start', function() {
    before(function(done) {
      Voimo.start(config, function(res) {
        ps = res.ps;
        wemoClient = res.wemoClient;

        done();
      });
    });

    it('spawns pocketsphinx', function(done) {
      ps.should.be.ok;

      done();
    });

    it('passes the right arguments to pocketsphinx', function(done) {
      var pocketsphinxArgs = config.pocketsphinx.options;
      pocketsphinxArgs.unshift('pocketsphinx_continuous');
      ps.spawnargs.should.be.eql(pocketsphinxArgs);

      done();
    });

    it('connects to wemo', function(done) {
      wemoClient.should.be.ok;

      done();
    });

    it('binds activation handler', function(done) {
      sinon.stub(console, 'log');
      ps.stdout.emit('data', config.activationCommand + '\n');
      console.log.calledOnce.should.be.true();
      console.log.calledWith('Now active!').should.be.true();
      console.log.restore();

      done();
    });

    it('binds command execution', function(done) {
      var commands = config.commands;
      var phrases = Object.keys(commands);
      for(var i = 0; i < phrases.length; i++) {
        sinon.stub(console, 'log');
        sinon.stub(console, 'info');
        ps.stdout.emit('data', config.activationCommand + '\n');
        console.log.restore();
        var phrase = phrases[i];
        var command = commands[phrase];
        ps.stdout.emit('data', phrase + '\n');
        console.info.calledWith(phrase + ': '
          + command.deviceName
          + ', ' + command.capability
          + ', ' + command.value).should.be.true();
        console.info.restore();
      }

      done();
    });
  });

  describe('stop', function() {
    it('calls exit on the main process', function(done) {
      sinon.stub(process, 'exit');
      process.exit.calledOnce.should.be.ok;
      process.exit.restore();

      done();
    });
  });
});
