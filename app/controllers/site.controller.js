const mongoose = require('mongoose');
const Token = require('../models/Token.js');
const tokenController = require('./token.controller.js');
const express = require('express');
const Comment = require('../models/Comment.js');
const Topic = require('../models/Topic.js');

module.exports = {
	showHome: showHome,
	showTokenFactory: showTokenFactory,
	showTokenSpace: showTokenSpace,
	showTokenHome: showTokenHome,
	showTokenForum: showTokenForum,
	showLogin: showLogin,
	showSignup: showSignup,
	logout: logout,
	showSubmit: showSubmit,
	showThread: showThread,
	showSetAttributes: showSetAttributes,
	showMethods: showMethods,
	showInfo: showInfo,
	showBidForBounty: showBidForBounty,
	showSubmitUpdate: showSubmitUpdate,
	showAuctionHouse: showAuctionHouse,
	showSubmitBug: showSubmitBug,
	showStartBounty: showStartBounty
	
};

function showHome(req,res){
	res.render('pages/home');	
}

function showTokenFactory(req,res){
	Token.find({}, (err, tokens) => {
		if (err){
			var data = [{message: err}];
			res.render('pages/tokenFactory', {data: data});
		}
		else {
			var data = tokens; 
			res.render('pages/tokenFactory', {data: data});
		}
	});
}

function showTokenSpace(req,res){
	Token.find({}, (err, tokens) => {
		if (err){
			res.render('pages/tokenSpace', {data: [{message: err}]});
		}
		else {
			res.render('pages/tokenSpace', {data: tokens, user: req.user});
		}
	});
}

function showTokenHome(req,res) {
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.json({message: "error"});
		} else {
			if (!token) { 
				res.json({message: "NO TOKEN"});
			} else {
				Topic.find({categoryId: '0', tokenId: _id}, (err,updateTopics) => {
					if (err) {
						res.status(400).json(err);
					} else if(!updateTopics) {
						res.render('pages/tokenHome', {updateTopics: [], token: token, user: req.user});
					} else {
						res.render('pages/tokenHome', {updateTopics: updateTopics, token: token, user: req.user});
					}
				});
			}
		}
	});
}
	
function showTokenForum(req,res) {
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.render('pages/tokenForum', {token: {error: err}});
		} else {
			res.render('pages/tokenForum', {token: token, user: req.user});
		}
	});
}

function showLogin(req,res){
	res.render('pages/login', {message: req.flash('loginMessage')});
}

function showSignup(req,res){
	res.render('pages/signup', {message: req.flash('signupMessage')});
}

function logout(req,res){
	req.logout();
	res.redirect('/');
}

function showSubmit(req,res){
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.json({error: "Token error"});
		} else if (!token) {
			res.json({error: "Token not found"});
		} else {
			res.render('pages/submitTopic', {user: req.user, token: token});
		}
	});
}

function showThread(req,res){
	const $tokenId = req.params.tokenId;
	const $topicId = req.params.topicId;	
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err) {
			res.json({error: "Token error"});
		} else if (!token) {
			res.json({error: "Token not found"});
		} else {
			Comment.find({topicId: $topicId}, (err, comments) => {
				if (err) {
					res.status(400).json(err);
				} else {
					Topic.findOne({_id: $topicId}, (err, topic) => {
						if (err) {
							res.status(400).json(err);
						}
						if (!topic) {
							res.status(404).json({message: "no topic found"});	
						}else if (topic.categoryId == '0') {
							res.render('pages/updateThread', {comments: comments, user: req.user, topic: topic, token: token});
						} else {
							res.render('pages/thread', {comments: comments, user: req.user, topic: topic,token: token});
						}
					});
				}
			});
		}
	});
}		 

function showMethods(req,res){
	const $tokenId = req.params.tokenId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			res.render('pages/tokenMethods', {token: token});
		}
	});

}

function showSetAttributes(req,res){
	const $tokenId = req.params.tokenId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			res.render('pages/setAttributes', {token: token});
		}
	});
}

function showInfo(req,res){
	const $tokenId = req.params.tokenId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			res.render('pages/tokenInfo', {token: token, user: req.user});
		}
	});
}

function showBidForBounty(req,res){
	const $tokenId = req.params.tokenId;
	const $topicId= req.params.updateId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			Topic.findOne({_id: $topicId}, (err, topic) => {
				if (err){
					res.status(400).json(err);
				} else if (!token) {
					res.status(404).json({message: "Topic Not found"});
				} else {
					res.render('pages/bidForBounty', {token: token, topic: topic});
				}
			});
		}
	});

}
function showSubmitUpdate(req,res){
	const $tokenId = req.params.tokenId;
	const $topicId= req.params.updateId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			Topic.findOne({_id: $topicId}, (err, topic) => {
				if (err){
					res.status(400).json(err);
				} else if (!token) {
					res.status(404).json({message: "Topic Not found"});
				} else {
					res.render('pages/submitUpdate', {token: token, topic: topic});
				}
			});
		}
	});

}
function showAuctionHouse(req,res){
	const $tokenId = req.params.tokenId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			res.render('pages/auctionHouse', {token: token});
		}
	});

}
function showSubmitBug(req,res){
	const $tokenId = req.params.tokenId;
	const $topicId= req.params.updateId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			Topic.findOne({_id: $topicId}, (err, topic) => {
				if (err){
					res.status(400).json(err);
				} else if (!token) {
					res.status(404).json({message: "Topic Not found"});
				} else {
					res.render('pages/submitBug', {token: token, topic: topic});
				}
			});
		}
	});
}

function showStartBounty(req,res){
	const $tokenId = req.params.tokenId;
	const $topicId= req.params.updateId;
	Token.findOne({id: $tokenId}, (err, token) => {
		if (err){
			res.status(400).json(err);
		} else if (!token) {
			res.status(404).json({message: "Token Not found"});
		} else {
			Topic.findOne({_id: $topicId}, (err, topic) => {
				if (err){
					res.status(400).json(err);
				} else if (!token) {
					res.status(404).json({message: "Topic Not found"});
				} else {
					res.render('pages/startBounty', {token: token, topic: topic});
				}
			});
		}
	});
}
