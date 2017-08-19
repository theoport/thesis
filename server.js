const mongoDB					= require('mongodb'),
			express 				= require('express'),
			expressLayouts 	= require('express-ejs-layouts'),
			bodyParser 			= require('body-parser'),
			mongoose 				= require('mongoose'),
			passport 				= require('passport'),
			cookieParser 		= require('cookie-parser'),
			session 				= require('express-session'),
			flash 					= require('connect-flash'),
			app 						= express(),
			path						= require('path'),
			uriUtil					= require('mongodb-uri'),
			hostname 				= process.env.HOST || "localhost",
			port 						= process.env.PORT || 8080;
			
			
require('./config/passport.js')(passport);                  
//configure

app.set('view engine', 'ejs');

//app.use(expressLayouts);

app.use(bodyParser.urlencoded({ extended: true}));

app.use(session({secret: 'mynameistheotheopolis'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// set routes

app.use(require(path.join(__dirname, './app/routes'))(passport));

//set static files

app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './client')));


//start the server
const mongooseURI = uriUtil.formatMongoose(process.env.MONGO_URI);
const dbOptions = {useMongoClient: true};

app.listen(port, function() {
	mongoose.connect(mongooseURI, dbOptions, (err) => {
		if (err) {
			console.log(err);
		}
		console.log("Xcoin server is running");
	});
});

