var Metalsmith = require('metalsmith')
var markdown = require('metalsmith-markdown')
var permalinks = require('metalsmith-permalinks')
var collections = require('metalsmith-collections')
var watch = require('metalsmith-watch')
var layouts = require('metalsmith-layouts')
var Handlebars = require('handlebars')
var fs = require('fs');

var original_filename = function (files, metalsmith, done) {
  Object.keys(files).forEach(function (file) {
    var arr = file.split('/')
    var filename = arr[arr.length-1].split('.')[0]
    files[file].title = filename;
  });
  done();
};

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/_header.html').toString());
Handlebars.registerPartial('navigation', fs.readFileSync(__dirname + '/layouts/_navigation.html').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/_footer.html').toString());

Metalsmith(__dirname)
  .source('./src')
  .use(original_filename)
  .use(collections({
    games: {
      pattern: 'content/games/*.md'
    },
    painting: {
      pattern: 'content/painting/*.md'
    },
    frontend: {
      pattern: 'content/frontend/*.md'
    },
    ramble: {
      pattern: 'content/ramble/*.md'
    }
  }))
  .use(markdown())
  .use(permalinks(':collections'))
  .use(layouts('handlebars'))
  .destination('./dist')
  // .use(watch({
  //   paths: {
  //     "${source}/**/*": true,
  //     "layouts/**/*": "**/*",
  //   }
  // }))
  .build(function(err) {
     if (err) throw err;
   });
