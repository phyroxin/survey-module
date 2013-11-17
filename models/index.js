/*========================================================
 * Connect to DB
 *========================================================
 */
var mongo 	= require('mongodb');
var monk 	= require('monk');
var db 		= monk('localhost:27017/surveydb');

/*========================================================
 * Check DB exists, if not create
 *========================================================
 */
var collection = db.get('surveycollection');
collection.find({}, function(err, docs){
	if(JSON.stringify(docs) !== '[]'){
		console.log('Connected to surveydb database...');
		console.log(docs);
	}
	else{
		console.log('Couldn\'t find surveydb collection, creating with sample data...');
		populateDB();
	}
});

/*========================================================
 * Route Models
 *========================================================
 */
exports.index = function(req, res){
	console.log('Home page');
	res.render('index', {
		title:'Node.js'
	});
};

exports.getAll = function(req, res){
	
	var collection = db.get('surveycollection');
	collection.find({},{},function(err, doc){
		if(err){
			console.log('No results found');
			res.send('No results found');
		}
		else{
			res.send(doc);
		}
	});
};

exports.addData = function(req, res){
	// Get our form values
	var data = req.body;
	for (var key in data) {
		var obj = data[key];
		console.log(key + " = " + data[key]);
	}
	// Set our collection
	var collection = db.get('answercollection');

	// Submit to the DB
	collection.insert(data, function(err, doc){
		if(err){
			// If it failed, return error
			res.send('There was a problem adding the information to the database.');
		}
		else{
			console.log('Data inserted successfully!');
			// If it worked, forward to success page
			//res.send({'name':friend});
		}
	});
};
/*
exports.newuser = function(req, res){
	console.log('Add user page');
	res.render('newuser', {
		title: 'Add New User'
	});
};


exports.delFriend = function(req, res){

	// Set our collection
	var collection = db.get('friendcollection');
	
	// Submit to the DB
	collection.drop(function(err){
		if(err){
			// If it failed, return error
			res.send('There was a problem deleting the information to the database.');
		}
		else{
			console.log('All friends deleted!');
		}
	});
};

exports.updateuser = function(req, res){
	// Get our update id
	var id 			= req.params.id;
	var userName	= req.body.data;
	
	console.log(id);
	console.log(userName);
	
	// Set our collection
	var collection = db.get('usercollection');
	
	// Submit to the DB
	collection.updateById(id, {
		 'username'	:userName
	}, function(err, doc){
		if(err){
			// If it failed, return error
			res.send('There was a problem updating.');
		}
		else{
			console.log('Name: '+userName+' updated successfully!');
			// If it worked, forward to success page
			res.redirect('about');
		}
	});
};

exports.deluser = function(req, res){
	// Get id
	var id = req.params.id;
	
	// Set our collection
	var collection = db.get('usercollection');
	
	// Submit to the DB
	collection.remove({_id: id}, function(err, doc){
		if(err){
			// If it failed, return error
			res.send('There was a problem deleting this item.');
		}
		else{
			console.log('Item id: '+id+' deleted!');
			res.send({'test':'test'});
		}
	});
};

exports.delall = function(req, res){
	
	// Set our collection
	var collection = db.get('usercollection');
	
	// Submit to the DB
	collection.drop(function(err){
		if(!err){
			console.log('All users deleted!');	
			res.send({'test':'test'});
		}
	});
};
*/
/*========================================================
 * Populate db with data if none found
 *========================================================
 */
var populateDB = function() {

    var questions = [{
						"page1":[
							{
								 "ref":		"q1"
								,"order":	1
								,"type":	"text"
								,"question":"What's my name?"
								,"answer":	"Snoop Dogg"
							}
							,{
								 "ref":			"q2"
								,"order":		2
								,"type":		"dropdown"
								,"question":	"Which one do you like?"
								,"options":{
									 "option1": "This one"
									,"option2": "No this one"
									,"option3": "Hang on...this one!"
								}
								,"answer":	"Any"
							}
							,{
								 "ref":			"q3"
								,"order":		3
								,"type":		"slider"
								,"question":	"How do you rate this?"
								,"range":		10
								,"answer":		"Above average"
							}
							,{
								 "ref":			"q4"
								,"order":		4
								,"type":		"dropdown"
								,"question":	"Cameron?"
								,"options":{
									 "option1": "Great director!"
									,"option2": "Thief"
									,"option3": "Which one?"
								}
								,"answer":	"Option 3 again!"
							}
						]
						,"page2":[
							{
								 "ref":			"q5"
								,"order":		5
								,"type":		"text"
								,"question":	"How long is a piece of string?"
								,"answer":		"Very, probably!?"
							}
							,{
								 "ref":			"q6"
								,"order":		6
								,"type":		"dropdown"
								,"question":	"Select another option"
								,"options":{
									 "option1": "Option 1"
									,"option2": "Option 2"
									,"option3": "Option 3"
								}
								,"answer":	"Option 3 believe it or not!"
							}
							,{
								 "ref":			"q7"
								,"order":		7
								,"type":		"slider"
								,"question":	"And where prey tell will you place this slider?"
								,"range":		10
								,"answer":		"Up a chimney"
							}
						]
						,"page3":[
							{
								 "ref":			"q8"
								,"order":		8
								,"type":		"text"
								,"question":	"How long is a piece of string?"
								,"answer":		"Very, probably!?"
							}
							,{
								 "ref":			"q9"
								,"order":		9
								,"type":		"dropdown"
								,"question":	"Select another option"
								,"options":{
									 "option1": "Option 1"
									,"option2": "Option 2"
									,"option3": "Option 3"
								}
								,"answer":	"Option 3 believe it or not!"
							}
							,{
								 "ref":			"q10"
								,"order":		10
								,"type":		"slider"
								,"question":	"And where prey tell will you place this slider?"
								,"range":		10
								,"answer":		"Up a chimney"
							}
						]
						,"length":		3
						,"url":			"http://www.redtangle.com"
						,"redirect": 	"false"
					}];

	collection.insert(questions, function(err, result) {
		if(!err)
			console.log('...collection creation complete!');
		else
			console.log('...database error!');
	});
};