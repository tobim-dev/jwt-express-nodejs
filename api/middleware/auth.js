const jwt = require('jsonwebtoken');
const fs = require('fs');
var publicKEY  = fs.readFileSync('./public.key', 'utf8'); //<-- move to .env for advance security
var i  = 'Test';          // Issuer //<-- move to .env for advance security
var s  = 'some@user.com'; // Subject //<-- move to .env for advance security
var a  = 'http://test.in'; // Audience //<-- move to .env for advance security
var verifyOptions = { //<-- move to .env for advance security
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "1h",
    algorithm:  ["RS256"]
};
const authenticate = (req, res, next) => {
    try {
        const token = req.headers["x-access-token"] || req.headers["authorization"];
    
        //console.log("token" + token)
        if (!token) return res.status(401).json({
            error: "Sorry! You are not authorised"
        });
        if(token){
            console.log("token>>" + token)
            const tokenval = token.split(" ")[1];
            const decoded = jwt.verify(tokenval, publicKEY, verifyOptions);
            next();
        }
        
        
    } catch (ex) {
        //console.log(ex)
        res.status(400).json({
            error: "Access denied"
        });
    }
}
module.exports = authenticate;