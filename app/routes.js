const express = require('express'),
			router = express.Router(),
			path = require('path'),
			siteController = require('./controllers/site.controller.js'),
			tokenController = require('./controllers/token.controller.js');
			

module.exports = router;


//Site routes

router.get('/', 						siteController.showHome);
router.get('/about', 				siteController.showAbout);
router.get('/tokenFactory', siteController.showTokenFactory);
router.get('/tokenSpace', 	siteController.showTokenSpace);

//Api routes
router.get('/api/tokens', 				tokenController.getAllTokens);
router.get('/api/tokens/:id', 		tokenController.getToken);
router.post('/api/tokens', 				tokenController.addToken);
router.put('/api/tokens/:id', 		tokenController.notAllowed);
router.delete('/api/tokens/:id', 	tokenController.notAllowed);
