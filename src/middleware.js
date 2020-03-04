let jwt = require('jsonwebtoken');

const checkQueryParam = async (req, res, next) => {
  const requiredParam = process.env.SECRET_PARAM;
  let auth = false;
  let message = "Not allowed";

  if (!requiredParam) {
    message = 'Required environment variable not found';
  }

  res.status(401).json({auth, message});
}

const checkToken = async (req, res, next) => {
  let auth = false;
  let message = "Token is not valid";
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({auth, message: "No token provided"});
    return;
  }

  const [, authToken] = token.split(" ");

  const verify = await jwt.verify(authToken, process.env.JWT_SECRET);

  if (verify) {
    req.user = verify;
    next();
    return;
  }

  res.status(401).json({auth, message});
}

module.exports = {checkToken, checkQueryParam};