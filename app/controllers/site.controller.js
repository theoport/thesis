const mongoose = require('mongoose');
const Token = require('../models/Token.js');
const tokenController = require('./token.controller.js');
const express = require('express');

module.exports = {
	showHome: showHome,
	showAbout: showAbout,
	showTokenFactory: showTokenFactory,
	showTokenSpace: showTokenSpace,
	showTokenHome: showTokenHome,
	showTokenForum: showTokenForum
};

function showHome(req,res){
	res.render('pages/home');	
}

function showAbout(req,res){
	res.render('pages/about');
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
			res.render('pages/tokenSpace', {data: tokens});
		}
	});
}

function showTokenHome(req,res) {
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.render('pages/tokenHome', {token: {error: err}});
		} else {
			res.render('pages/tokenHome', {token: token});
		}
	});
}
	
function showTokenForum(req,res) {
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.render('pages/tokenForum', {token: {error: err}});
		} else {
			res.render('pages/tokenForum', {token: token});
		}
	});
}
/*
function returnTokens() {
	Token.find({}, (err, tokens) => {
		if (err){
			return [{message: err}];	
		}		
		return [{message: "SUCCESS"}];
	});
}


*/
