const express = require('express'),
			router = express.Router(),
			path = require('path'),
			siteController = require('./controllers/site.controller.js'),
			tokenController = require('./controllers/token.controller.js'),
			auth = require('./middleware/auth.js')
			

module.exports = function(passport) {


//Site routes

router.get('/', 										siteController.showHome);
router.get('/about', 								siteController.showAbout);
router.get('/tokenFactory', 				siteController.showTokenFactory);
router.get('/tokenSpace', 					siteController.showTokenSpace);
router.get('/tokenHome/:id', auth.isLoggedIn,				siteController.showTokenHome);
router.get('/tokenHome/:id/forum', auth.isLoggedIn, 	siteController.showTokenForum);
router.get('/login', 								siteController.showLogin);
router.get('/signup', 							siteController.showSignup);
router.get('/logout', 							siteController.logout);

router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/tokenSpace',
	failureRedirect: '/signup',
	failreFlash: true
}));
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/tokenSpace',
	failureRedirect: '/tokenSpace',
	failureFlash: true
}));


//Api routes
router.get('/api/tokens', 								tokenController.getAllTokens);
router.get('/api/tokens/:id', 						tokenController.getToken);
router.get('/api/tokens/:id/sourceCode',	tokenController.getTokenSource);
router.post('/api/tokens', 								tokenController.addToken);
router.put('/api/tokens/:id', 						tokenController.notAllowed);
router.delete('/api/tokens/:id', 					tokenController.notAllowed);

return router;

}
