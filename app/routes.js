const express = require('express'),
			router = express.Router(),
			path = require('path'),
			siteController = require('./controllers/site.controller.js'),
			forumController = require('./controllers/forum.controller.js'),
			tokenController = require('./controllers/token.controller.js'),
			userController = require('./controllers/user.controller.js'),
			auth = require('./middleware/auth.js')
			

module.exports = function(passport) {


//Site routes

router.get('/', 										siteController.showHome);
router.get('/about', 								siteController.showAbout);
router.get('/tokenFactory', 				siteController.showTokenFactory);
router.get('/tokenSpace', 					siteController.showTokenSpace);
router.get('/tokenHome/:id', auth.isLoggedIn,			siteController.showTokenHome);
router.get('/tokenHome/:id/forum',  	siteController.showTokenForum);
router.get('/tokenHome/:id/forum/submitTopic', auth.isLoggedIn, siteController.showSubmit);
router.get('/login', 								siteController.showLogin);
router.get('/signup', 							siteController.showSignup);
router.get('/logout', 							siteController.logout);
router.get('/tokenHome/:tokenId/forum/:topicId', 	siteController.showThread);
router.get('/tokenHome/:tokenId/methos', siteController.showMethods);
router.get('/tokenHome/:tokenId/setAttributes', siteController.showSetAttributes);
router.get('/tokenHome/:tokenId/bidForBounty/:updateId', siteController.showBidForBounty);
router.get('/tokenHome/:tokenId/submitUpdate/:updateId', sitecontroller.showSubmitUpdate);
router.get('/tokenHome/:tokenid/auctionHouse/:auctionId', siteController.showAuctionHouse);
router.get('/tokenHome/:tokenId/submitBug/:updatId', siteController.showSubmitBug);

router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/tokenSpace',
	failureRedirect: '/signup',
	failureFlash: true
}));
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/tokenSpace',
	failureRedirect: '/tokenSpace',
	failureFlash: true
}));


//Api routes
router.get('/api/users', 									userController.getAllUsers);
router.get('/api/tokens', 								tokenController.getAllTokens);
router.get('/api/tokens/:id', 						tokenController.getToken);
router.get('/api/tokens/:id/sourceCode',	tokenController.getTokenSource);
router.post('/api/tokens', 								tokenController.addToken);
router.put('/api/tokens/:id', 						tokenController.notAllowed);
router.delete('/api/tokens/:id', 					tokenController.notAllowed);
router.get('/api/topics/:id', 						forumController.getTopics);
router.post('/api/topics', 								forumController.addTopic);
router.get('/api/topics/:tokenId/comments/:topicId', forumController.getComments);
router.post('/api/comments', forumController.addComment);
router.post('/api/upvotes', 							forumController.addUpvote);
router.get('/api/upvoteCount/:topicId', 							forumController.getUpvoteCount);

return router;

}
