/*========================================================
 * Module dependencies
 *========================================================
 */
var  express	= require('express')
	,stylus		= require('stylus')
	,nib		= require('nib')
	,http		= require('http')
	,path		= require('path')
	,model		= require('./models')
	,app		= express();

function compile(str, path){
	return stylus(str)
		.set('filename'. path)
		.use(nib());
}

/*========================================================
 * All environments
 *========================================================
 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine','jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('IwitnessedAGirraffePuke'));
app.use(express.session());
app.use(app.router);
app.use(stylus.middleware({
		 src: __dirname + '/public'
		,compile: compile
}));
app.use(express.static(path.join(__dirname + '/public')));
// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/*========================================================
 * Application routes
 *========================================================
 */
app.get('/', 				model.index);
app.post('/api/getSurvey', 	model.getAll);
/*
app.get('/api/addfriend/:name', model.addFriend);
app.get('/api/delfriend', 		model.delFriend);
*/
/*========================================================
 * Start server
 *========================================================
 */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port '+ app.get('port'));
});