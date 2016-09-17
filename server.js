var express = require('express');
var path = require('path');

var app = express();
var public = path.join(__dirname, 'public');

app.use(express.static(public));

app.listen(3000, function () {
  console.log('Server started, listening on port 3000!');
});
