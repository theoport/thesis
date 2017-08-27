
const mongoose = require('mongoose');
const Comment= require('../models/Comment');
const Topic= require('../models/Topic');
const Upvote = require('../models/Upvote');


module.exports = {
	getTopics: getTopics,
	addTopic: addTopic,
	getComments: getComments,
	addComment: addComment,
	addUpvote: addUpvote,
	getUpvoteCount: getUpvoteCount
};

function getTopics(req,res){
	var $tokenId = req.params.id;
	Topic.find({tokenId: $tokenId}, (err, topics) => {
		if (err){
			res.status(400).json(err);
		}
		res.json(topics);
	});
}

function addTopic(req,res){
	const $tokenId = req.body.tokenId;
	const topic = new Topic(req.body);
	topic.save((err, topic) => {
		if (err) {
			res.status(400).json(err);
		} else {
			res.redirect('/tokenHome/' + $tokenId + '/forum');
		}
	});
}	

function getComments(req,res){
	const $topicId = req.params.topicId; 
	Comment.find({topicId: $topicId}, (err,comments) => {
		if (err) {
			res.status(400).json(err);
		}else if (!comments) {
			res.status(404).json({message: "no comments found."});
		} else {
			res.json(comments);
		}
	});
}

function addComment(req,res) {
	comment = new Comment(req.body);
	comment.save((err, comment) => {
		if (err) {
			res.status(404).json(err);
		} else {
			res.json(comment);
		}
	});
}

function addUpvote(req,res) {
	const $userId = req.body.userId;
	const $topicId = req.body.topicId;
	Upvote.findOne({userId: $userId, topicId: $topicId}, (err, upvote) => {
		if (err) {
			res.status(400).json(err);
		}
		else if (upvote) {
			res.status(400).json({message: "You have already upvoted this topic"});
		} else {
			newUpvote = new Upvote(req.body);
			newUpvote.save((err, upvote) => {
				if (err) {
					res.status(400).json(err);
				} else {
					res.json(upvote);
				}
			});
		}
	});
}

function getUpvoteCount(req,res) {
	const $topicId = req.params.topicId;
	Upvote.count({topicId: $topicId}, (err,count) => {
		res.json(count);
	});
}
		
	


