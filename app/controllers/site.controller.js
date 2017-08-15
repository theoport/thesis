const mongoose = require('mongoose');
const Token = require('../models/Token.js');
const tokenController = require('./token.controller.js');
const express = require('express');

module.exports = {
	showHome: showHome,
	showAbout: showAbout,
	showTokenFactory: showTokenFactory,
	showTokenSpace: showTokenSpace
};

function showHome(req,res){
	res.render('pages/home');	
}

function showAbout(req,res){
	res.render('pages/about');
}

function showTokenFactory(req,res){
	var data = returnTokens();
	res.render('pages/tokenFactory', {data: data});
}

function showTokenSpace(req,res){
	var data = returnTokens();
	res.render('pages/tokenSpace', {data: data});
}

function returnTokens() {
	Token.find({}, (err, tokens) => {
		var data;
		if (err){
			return {message: err};	
		}		
		return tokens;
	});
}



