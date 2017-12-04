const mongoose =  require('mongoose');
const nl2br    =  require('nl2br');
const Token    =  require('../models/Token');

module.exports = {
  getAllTokens: getAllTokens,
  getToken: getToken,
  addToken: addToken,
  notAllowed: notAllowed,
  getTokenSource: getTokenSource
};

function getAllTokens(req,res){
  Token.find({}, (err, tokens) => {
    if (err) res.status(400).json(err);
    res.json(tokens);
  });
}

function getToken(req,res){
	const _id= req.params.id;
	Token.findOne({id: _id}, (err, token) => {
		if (err) res.status(400).json(err);
    else if (!token) res.status(404).json({message: "token not found."});
		else res.json(token);
	});
}



function addToken(req,res){
  const _id= req.body.id;
  Token.findOne({id: _id}, (err, token) => {
    if (err) res.status(400).json(err);
    else if (!token) {
      const token = new Token(req.body);
      token.save((err, token) => {
        if (err) res.status(400).json(err);
        else res.json(token);
      });
    }
    else res.json({message: "Token already exists with that ID"});
  });
}

function notAllowed(req, res) {
  res.json({message: "The action you requested is not permitted."});
}
/*
function updateToken(req,res){
	const _id = req.params.id;
	Token.findOneAndUpdate({_id},
		req.body,
		{ new: true },
		(err, token) => {
		if (err) {
			res.status(400).json(err);
		}
		if (!token) {
			res.status(404).json({message: "token not found."});
		}
		res.json(token);
	});
}

function deleteToken(req,res){
	const _id = req.params.id;
	Token.findOneAndRemove({_id}, (err, token) => {
		if (err) {
			res.status(400).json(err);
		}
		if (!token) {
			res.status(404).json({message: "token not found."});
		}
		res.json({message: "Token # ${token._id} deleted."});
	});
}
*/
		
function getTokenSource(req,res) {
  const _id = req.params.id;
  Token.findOne({id: _id}, (err, token) => {
    if (err) res.status(400).json(err);
    else if (!token) res.status(404).json({message: "token not found."});
    else res.send("<pre>" + nl2br(token.sourceCode, false) + "</pre>");
  });
}
