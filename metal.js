var Metalsmith = require('metalsmith')
var markdown = require('metalsmith-markdown')
var images = require('metalsmith-scan-images');
var permalinks = require('metalsmith-permalinks')
var collections = require('metalsmith-collections')
var layouts = require('metalsmith-layouts')
var Handlebars = require('handlebars')
var fs = require('fs');

var original_filename = function (files, metalsmith, done) {
  Object.keys(files).forEach(function (file) {
    var arr = file.split('/')
    var filename = arr[arr.length-1].split('.')[0]
    files[file].filetitle = filename;
  });
  done();
};

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/_header.html').toString());
Handlebars.registerPartial('navigation', fs.readFileSync(__dirname + '/layouts/_navigation.html').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/_footer.html').toString());

var metalsmith = new Metalsmith(__dirname)
  .source('./src')
  .use(markdown())
  .use(original_filename)
  .use(layouts('handlebars'))
  .use(collections({
    games: {
      pattern: 'games/*.html'
    },
    painting: {
      pattern: 'painting/*.md'
    },
    frontend: {
      pattern: 'frontend/*.md'
    },
    ramble: {
      pattern: 'ramble/*.md'
    }
  }))
  .use(permalinks(':collections'))
  .destination('./dist')
  .build(function(err) {
     if (err) throw err;
   });
