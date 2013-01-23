var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://localhost/test'); //TODO Move to config file

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req,res){ res.redirect('/collections'); });
app.get('/collections', function(req, res){
    res.locals.menu = 'collections';
    mongoose.connection.db.collectionNames(function(err, names){
        res.locals.collections = [];
        names.map(function(name){
            var ns = name.name;
            var cs = ns.substr(ns.indexOf('.')+1, ns.length);
            mongoose.connection.db.collection(cs, function(err, collection){
                if(err) console.error(err);
                    collection.find().toArray(function(e,data){
                        console.log(data.length);
                        var coll = {name: cs,
                                    numDocs: data.length};
                        res.locals.collections.push(coll);
                        if(names.length == res.locals.collections.length)
                            res.render('collections');
                });
            });
        });
    });
});

app.get('/documents', function(req,res){ 
    res.locals.menu = 'documents';
    res.render('documents'); 
});
app.get('/stats', function(req,res){ 
    res.locals.menu = 'stats';
    res.render('stats'); 
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
