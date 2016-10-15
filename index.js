var Handlebars = require('handlebars')
var fs = require('fs')

var Metalsmith = require('metalsmith')
var browserSync = require('metalsmith-browser-sync')
var collections = require('metalsmith-collections')
var markdown = require('metalsmith-markdown')
var permalinks = require('metalsmith-permalinks')
var layouts = require('metalsmith-layouts')

var original_filename = function (files, metalsmith, done) {
  Object.keys(files).forEach(function (file) {
    var arr = file.split('/')
    var filename = arr[arr.length-1].split('.')[0]
    if (filename) {
      files[file].title = filename
      if (filename == 'index' && arr[arr.length-2]) {
        filename = arr[arr.length-2]
      }
      files[file].display_title = filename.replace(/^.|-[a-z]/g, function (g) { return " "+g.toUpperCase() }).replace(/-/g,'')
    }
  })
  done()
}

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/layouts/_header.html').toString())
Handlebars.registerPartial('navigation', fs.readFileSync(__dirname + '/layouts/_navigation.html').toString())
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/layouts/_footer.html').toString())

Metalsmith(__dirname)
  .source('./src')
  .use(original_filename)
  .use(browserSync({
    server: "dist",
    files: ["src/**/*.md", "layouts/**/*.html"]
  }))
  .use(collections({
    games: {
      pattern: 'content/games/**/*.md',
      sortBy: "date",
      reverse: true
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
  .build(function(err) {
     if (err) throw err
   })
