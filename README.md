# Voimo: voice-control your Wemo lights

## Requirements

* [Raspberry Pi 2 Model B](https://www.raspberrypi.org) or, technically, just any (Linux-based) computer
* [Node.js / npm](https://nodejs.org/en/)
* [PocketSphinx](https://github.com/cmusphinx/pocketsphinx)
* a (USB) microphone (tested with [Logitech C270 HD Webcam](https://www.amazon.ca/gp/product/B003SDDR74/))

## How it works

Node.js server spawns a PocketSphinx-based continuous recognition process which listens for an activation phrase.
Once it hears the phrase, the server starts listening to the commands from a list defined in advance. Once a command is
received, the server executes it or deactivates listening once a given amount of time elapsed.

## Install

### Install Node.js / npm

[Install Node.js](https://nodejs.org/en/download/) (comes with [npm](https://www.npmjs.com)). Most probably, your
OS has it packaged. Go to the root of this repository and run `npm i`.

### Install PocketSphinx

Depending on your platform, you may have different options, although for sake of a little adjustment we need to
perform next, you'd be better off installing from source, so check out https://github.com/cmusphinx/pocketsphinx.


### Adjust `pocketsphinx_continuous`

Edit `src/programs/continuous.c` and add the following line to the begining of the `recognize_from_microphone()` function:

```
setbuf(stdout, NULL);
```

Then compile / install it using
[the instructions from the repository](https://github.com/cmusphinx/pocketsphinx#linuxunix-installation).

This adjustment makes the program flush the output to `stdout` immediately, so we could spot the hypotheses in the
output stream of the spawned process.

## Configure

Open `config.json` and set the following parameters:

* wemo.linkUrl - local url of your Wemo Link device (if not set a discovery attempt will be made);
* pocketsphinx.options - command line options to be passed to `pocketsphinx_continuous` (run `man pocketsphinx_continuous`
for a complete list);
* commands - voice commands mapped to Wemo command descriptions, e.g.

```
...
"lights on": {
  "deviceName": "Salon",
  "capability": "10008",
  "value": "255:0"
},
...
```

See [the Wemo client repository](https://github.com/timonreinhard/wemo-client) for a list of possible values.

## Run

Run the server with `node index.js`.

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2016 [Ruslan Bredikhin](http://ruslanbredikhin.com/)
