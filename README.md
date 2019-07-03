# dlnanow

[![Greenkeeper badge](https://badges.greenkeeper.io/rzane/dlnanow.svg)](https://greenkeeper.io/)

This is a command-line utility that can be used to stream media files to your DLNA-capable devices (Smart TVs, Xbox One, etc). It supports playback of local video files, videos on the web, and torrents.

Internally, this script simply wraps [castnow](https://github.com/xat/castnow)'s middleware functions for serving content.

## Installation

```sh
$ npm install -g dlnanow
```

## Usage

```sh
# start playback of a local video file
$ dlnanow ./myvideo.mp4

# play a file from the web
$ dlnanow http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4

# start playback of a video over torrent
$ dlnanow <url-to-torrent-file OR magnet>

# start playback of a video with subtitles
$ dlnanow ./myvideo.mp4 --subtitles </local/path/to/subtitles.srt>

# transcode some other video format to mp4 while playback (requires ffmpeg)
$ dlnanow ./myvideo.avi --tomp4
```

## Or, as a module

```javascript
var dlnanow = require('dlnanow');

// Add some logging
dlnanow.use(function (ctx, next) {
  ctx.on('status', function (status) {
    console.log(status);
  });
  next();
});

// Enable some castnow plugins
dlnanow.enable('stdin');
dlnanow.enable('torrent');
dlnanow.enable('localfile');
dlnanow.enable('transcode');
dlnanow.enable('subtitles');

// Go!
dlnanow.launch(opts, function (err, player, ctx) {
});
```
