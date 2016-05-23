#!/usr/bin/env node

var chalk = require('chalk');
var log = require('single-line-log');
var dlnanow = require('./index');
var circulate = require('array-loop');
var throttle = require('lodash.throttle');
var dots = circulate(['.', '..', '...', '....']);
var nextColor = circulate(['yellow', 'magenta', 'cyan']);
var opts = require('minimist')(process.argv.slice(2));

if (!opts._.length || opts.help) {
  console.log([
    'Usage: dlnanow <media> [OPTIONS]',
    '',
    'Options:',
    '  --tomp4                  Convert file to mp4 during playback',
    '  --myip <ip>              Your local IP address',
    '  --subtitles <path/url>   Path or URL to an SRT or VTT file',
    '  --peerflix-* <value>     Pass options to peerflix',
    '  --ffmpeg-* <value>       Pass options to ffmpeg',
    '  --quiet                  No output',
    '  --type <type>            Explicitly set the mime-type (e.g. "video/mp4")',
    '  --help                   This help screen',
    ''
  ].join('\n'));

  process.exit(0);
}

opts.playlist = opts._.map(function (item) {
  return { path: item };
});

function abort (msg) {
  log.stderr(chalk.red(msg));
  process.exit(1);
}

function logStatus () {
  var inter;

  return throttle(function (status) {
    var color = nextColor();
    if (inter) clearInterval(inter);
    inter = setInterval(function () {
      log.stdout(chalk[color](status + dots()));
    }, 300);
  }, 1200);
}

process.on('SIGINT', function () {
  abort('Exiting...');
});

dlnanow.use(function (ctx, next) {
  ctx.on('status', logStatus());
  next();
});

dlnanow.enable('stdin');
dlnanow.enable('torrent');
dlnanow.enable('localfile');
dlnanow.enable('transcode');
dlnanow.enable('subtitles');

dlnanow.launch(opts, function (err) {
  if (err) abort(err.message);
});
