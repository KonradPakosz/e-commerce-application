const User = require('../models/user')
const jwt = require('jsonwebtoken'); // to generate a signed token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.signup = (req, res) => {
    console.log("req.body", req.body)
    const user = new User(req.body)
    user.save((err, user) => {
        if(err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({
            user
        })
    })
};

exports.signin = (req, res) => {
    // find user based on email
    const {email, password} = req.body
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User with that e-mail does not exist'
            });
        }
        // if user is found, check against password match
        // authentication created in user model
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: 'E-mail and password do not match' 
            })
        }

        //generate a signed token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        //keep cookie with expiry date of 10,000 seconds
        res.cookie('t', token, {expire: new Date() + 10000})
        const {_id, name, email, role} = user
        return res.json({token, user: {_id, email, name, role}})
    }); 
};