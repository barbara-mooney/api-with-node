//Check-auth middleware checks if user is authorized to access certain routes. We will add it 
//to check if it makes sense to continue to the requested route.

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    //jwt.verify(token, secretOrPublicKey, [options, callback])
    try {
        //verify method will verify and also decode the token.
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};