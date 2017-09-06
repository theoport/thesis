
const mongoose = require('mongoose');
const Comment= require('../models/Comment');
const Topic= require('../models/Topic');
const Upvote = require('../models/Upvote');
const BountyDescription= require('../models/BountyDescription');
const Bug= require('../models/Bug');


module.exports = {
	getTopics: getTopics,
	addTopic: addTopic,
	getComments: getComments,
	addComment: addComment,
	addUpvote: addUpvote,
	getBountyDescription: getBountyDescription,
	addBountyDescription: addBountyDescription,
	getBounty: getBounty,
	getBug: getBug,
	addBug: addBug,
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
	const comment = new Comment(req.body);
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
			const newUpvote = new Upvote(req.body);
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
		
function getBountyDescription (req,res) {
	const $bountyId = req.params.bountyId;
	BountyDescription.findOne({bountyId: $bountyId}, (err, bounty) => {
		if (err) {
			res.status(400).json(err);
		} else if (!bounty) {
			res.status(404).json({message: "description not found"});
		} else {
			res.send(bounty.description);
		}
	});
}

function addBountyDescription (req,res) {
	const $bountyId = req.body.bountyId;
	BountyDescription.findOne({bountId: $bountyId}, (err, bounty) => {
		if (bounty) {
			res.status(400).json({message: "Already exists"});
		} else {
			const newBounty = new BountyDescription(req.body);	
			newBounty.save((err, _newBounty) => {
				if (err) {
					res.json(err);
				} else {
					res.json(_newBounty);
				}
			});
		}
	});
}
	
function getBug(req,res) {
	const $bugId= req.params.bugId;
	Bug.findOne({bugId: $bugId}, (err, bug) => {
		res.send(bug.description);
	});
}

function addBug(req,res) {
	const $bugId= req.body.bugId;
	Bug.findOne({bugId: $bugId}, (err, bug) => {
		if (bug) {
			res.status(400).json({message: "Already exists"});
		} else {
			const newBug= new Bug(req.body);	
			newBug.save((err, _newBug) => {
				if (err) {
					res.status(400).json({message: "Error"});
				} else {
					res.json(_newBug);
				}
			});
		}
	});
}

function getBounty(req,res) {
	const $bountyId = req.params.bountyId;
	BountyDescription.findOne({bountyId: $bountyId}, (err, bounty) => {
		if (err) {
			res.status(400).json(err);
		} else if (!bounty) {
			res.status(404).json({message: "description not found"});
		} else {
			res.send(bounty);
		}
	});
}
