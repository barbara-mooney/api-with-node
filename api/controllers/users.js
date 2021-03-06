const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

exports.user_signup = (req, res, next) => { 
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            //we check length because otherwise, it will give us an empty array and will continue executing the code.
            if (user.length >=1) {
                return res.status(409).json({
                    message: 'User already exists'
                });
            } else {
                //we will first hash the password and then salting it but adding additional strings. 10 rounds is 
                //considered safe. Dictionary tables cannot decrypt hash password with random strings. 
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(), 
                            email: req.body.email,
                            password: hash
                        });
                        console.log(user);
                        user.save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    };
                });
            };
        });
};

exports.user_login = (req, res, next) => {
    User
    .find({ email: req.body.email })
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if (result) {
                //jwt.sign(payload, secretOrPrivateKey, [options, callback])
                const token = jwt.sign(
                    {
                        email: user[0].email, 
                        userId: user[0]._id
                    }, 
                    process.env.JWT_KEY, 
                    {
                        expiresIn:'1h'
                    }
                );
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            }
            res.status(401).json({
                message: 'Auth failed'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.user_delete = (req, res, next) => {
    User
        .remove({ _id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};