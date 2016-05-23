var middleware = require('ware')();
var dlnacasts = require('dlnacasts');
var format = require('util').format;
var EventEmitter = require('events').EventEmitter;

function setStatus (ctx) {
  var slice = Array.prototype.slice;
  var parts = slice.call(arguments, 1);
  ctx.status = format.apply(null, parts);
  ctx.emit('status', ctx.status);
}

function toSubtitle (track) {
  return track.trackContentId;
}

function extract (media, options) {
  var metadata = media.metadata || {};

  return {
    type: options.type || media.type,
    title: metadata.title || 'dlnanow',
    subtitles: (metadata.tracks || []).map(toSubtitle)
  };
}

function startPlayback (ctx, player, callback) {
  var media = ctx.options.playlist[0];
  var opts = extract(media, ctx.options);

  player.on('error', callback);
  player.play(media.path, opts, function (err) {
    if (err) return callback(err);
    setStatus(ctx, 'Playing %s on %s', opts.title, player.name);
    callback(null, player, ctx);
  });
}

middleware.enable = function (name) {
  middleware.use(require('castnow/plugins/' + name));
};

middleware.launch = function (options, callback) {
  var ctx = new EventEmitter();
  ctx.mode = 'launch';
  ctx.options = options;

  middleware.run(ctx, function (err, ctx) {
    if (err) return callback(err);
    setStatus(ctx, 'Searching for device');

    dlnacasts().on('update', function (player) {
      setStatus(ctx, 'Located %s', player.name);
      startPlayback(ctx, player, callback);
    });
  });
};

module.exports = middleware;
