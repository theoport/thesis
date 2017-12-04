const mongoose =  require('mongoose');
const User     =  require('../models/User');

module.exports = {
  getAllUsers: getAllUsers
}

function getAllUsers(req,res){
  User.find({}, (err, users) => {
    if (err) res.status(400).json(err);
    else res.json(users);
  });
}
