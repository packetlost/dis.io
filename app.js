
/**
 * Module dependencies.
 */

var express = require('express')
  , properties = require('./properties')
  , mongoDelegate = require('dis.io-mongo-crud')
  , databaseAdaptor = mongoDelegate.database.createDatabaseAdaptor(properties.database)
  , CrudDelegate = require('dis.io-mongo-crud').crud
  , discovery = require('./lib/discovery')
  , Routes = require('./routes')
  , gzippo = require('gzippo')
  , stylus = require('stylus')
  , colors = require('colors')
  , app = express.createServer()
  ;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: "dis.troy" }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: __dirname + '/public/', compress: true }));
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  console.log('WARN: '.red + 'This application is running in development mode.'.yellow);
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

databaseAdaptor.createConnection(function(connection) {

  var crudDelegate = CrudDelegate.createCrudDelegate(connection)
    , routes = Routes.createRoutes(app, crudDelegate)
    ;

  crudDelegate.idFilter = CrudDelegate.objectIdFilter(connection);
  setUpRoutes(routes);
  app.listen(process.env.PORT || 3000);
  console.log('http://' + app.address().address + ':' + app.address().port );
});

function setUpRoutes(routes) {
  app.get('/', routes.get.index);

  app.get('/task', routes.get.task.manage);

  app.get('/task/create', routes.get.task.create);
  app.post('/task/create', routes.post.task.create);
}