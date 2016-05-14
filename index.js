#!/usr/bin/env node

var chalk = require('chalk');
var logger = require('single-line-log');
var middleware = require('ware')();
var opts = require('minimist')(process.argv.slice(2));
var dlnacasts = require('dlnacasts')();

middleware.use(require('castnow/plugins/stdin'));
middleware.use(require('castnow/plugins/torrent'));
middleware.use(require('castnow/plugins/localfile'));
middleware.use(require('castnow/plugins/transcode'));
middleware.use(require('castnow/plugins/subtitles'));

if (opts.help) {
  console.log([
    '',
    'Usage: dlnanow <media> [OPTIONS]',
    '',
    'Option                   Meaning',
    '--tomp4                  Convert file to mp4 during playback',
    '--myip <ip>              Your local IP address',
    '--subtitles <path/url>   Path or URL to an SRT or VTT file',
    '--peerflix-* <value>     Pass options to peerflix',
    '--ffmpeg-* <value>       Pass options to ffmpeg',
    '--quiet                  No output',
    '--type <type>            Explicitly set the mime-type (e.g. "video/mp4")',
    '--help                   This help screen',
    ''
  ].join('\n'));

  process.exit(0);
}

if (opts._.length) {
  opts.playlist = opts._.map(function (item) {
    return {
      path: item
    };
  });
}

function log (color) {
  return function (msg) {
    if (opts.quiet) return;

    var i = 1;
    logger.stdout(chalk[color](
      msg.replace(/%s/g, function (words) {
        return words[i++];
      }.bind(null, arguments))
    ));
  }
}

function abort (msg) {
  log('red')(msg);
  process.exit(1);
}

function startPlayback (player, media) {
  var info = (media && media.media || {});
  var title = info.metadata && info.metadata.title || 'dlnanow';
  var subtitles = (info.tracks || []).map(function (track) {
    return track.trackContentId;
  });

  player.on('error', function (err) {
    abort('DLNA error', err.message);
  });

  player.play(media.path, {
    title: title,
    type: opts.type || media.type,
    subtitles: subtitles
  }, function (err) {
    if (err) abort('Failed to start', err);
    log('green')('Playing %s on %s...', title, player.name);
  });
}

process.on('SIGINT', function() {
  abort('Exiting...');
});

dlnacasts.on('update', function (player) {
  log('cyan')('Located %s...', player.name);

  middleware.run({
    mode: 'launch',
    options: opts
  }, function (err, ctx) {
    if (err) abort(err.message);
    log('magenta')('Starting stream on %s...', player.name);
    startPlayback(player, ctx.options.playlist[0]);
  });
});
