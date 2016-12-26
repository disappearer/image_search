var imageSearch = require('node-google-image-search')
// console.log(results)

var express = require('express')
var app = express()

app.get('/imagesearch/:term', function(req, res){
  var query = req.params.term
  var offset = req.query.offset
  if(!offset) offset = 1
  console.log(offset)
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

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Image search app listening on port ' + port + '!')
})
