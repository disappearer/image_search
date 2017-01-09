var imageSearch = require('node-google-image-search')

var express = require('express')
var app = express()

var mongourl = process.env.MONGOLAB_URI
var mongoose = require('mongoose')
var query_schema = new mongoose.Schema({term: String, when: { type: Date, default: Date.now }})

// static html showing info about the app
app.use(express.static('public'))

// search path handling
app.get('/imagesearch/:term', function(req, res){
  var query = req.params.term
  
  // save query history to database
  var connection = mongoose.createConnection(mongourl)
  var Query = connection.model('Query', query_schema, 'image_queries')
  Query.create({term: query}, function(err, img_query){
    if(err) return console.error(err)
  })
  
  // search for images
  var offset = req.query.offset
  if(!offset) offset = 1
  var results = imageSearch(query, function(results){
    var response = ''
    results.forEach(function(result){
      var imgObj = {
        url: result.link,
        snippet: result.snippet,
        thumbnail: result.image.thumbnailLink,
        context: result.image.contextLink
      }
      response += JSON.stringify(imgObj, null, 2) + '\n'
    })
    res.end(response)
  }, offset, 10)
})

// latest queries path
app.get('/latest/', function(req, res){
  
  // save query history to database
  var connection = mongoose.createConnection(mongourl)
  var Query = connection.model('Query', query_schema, 'image_queries')
  Query.find().limit(10).sort('-when').select('term when').
  exec(function(error,results){
    if(error) return console.error(error)
    var response = ''
    results.forEach(function(item){
      var retObj = {
        term: item.term,
        when: item.when
      }
      response += JSON.stringify(retObj,null,2) + '\n'
    })
    res.end(response)
  })
})

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Image search app listening on port ' + port + '!')
})
