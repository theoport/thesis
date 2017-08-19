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
	showTokenForum: showTokenForum,
	showLogin: showLogin,
	showSignup: showSignup,
	logout: logout,
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
			res.render('pages/tokenSpace', {data: tokens, user: req.user});
		}
	});
}

function showTokenHome(req,res) {
	const _id = req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) {
			res.render('pages/tokenHome', {token: {error: err}});
		} else {
			res.render('pages/tokenHome', {token: token, user: req.user});
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

