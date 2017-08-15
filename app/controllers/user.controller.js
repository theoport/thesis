const mongoose = require('mongoose');
const User = require('../models/User');


module.exports = {
	getUsers: getUsers,
	getUser: getUser,
	addUser: addUser,
	updateUser: updateUser,
	deleteUser: deleteUser
	}

function getUsers(req,res){
	User.find({}, (err, users) => {
		if (err){
			res.status(400).json(err);
		}
		res.json(users);
	});
}

function getUser(req,res){
	User.findOne({req.params.id}, (err, user) => {
		if (err){
			res.status(400).json(err);
		}
		if (!user) {
			res.status(404).json({message: "user not found."});
		}
		res.json(user);
	});
}

function addUser(req,res){
	const user = new User(req.body);
	user.save((err, user) => {
		if (err) {
			res.status(400).json(err);
		}
		res.json(user);
	});
}

function updateUser(req,res){
	User.findOneAndUpdate({req.params.id},
		req.body,
		{ new: true },
		(err, user) => {
		if (err) {
			res.status(400).json(err);
		}
		if (!user) {
			res.status(404).json({message: "user not found."});
		}
		res.json(user);
	});
}

function deleteUser(req,res){
	User.findOneAndRemove({req.params.id}, (err, user) => {
		if (err) {
			res.status(400).json(err);
		}
		if (!user) {
			res.status(404).json({message: "user not found."});
		}
		res.json({message: "User # ${user._id} deleted."});
	});
}

		
