const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  async authenticate(req, res){
    const {email, password} = req.body;

    let token = null;
    let ok = false;
    let message = "Username or password incorrect";

    const user = await User.findOne({email}).select('+password');

    if (!user) {
      res.status(401).json({ok, message, token});
      return;
    }

    ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      res.status(401).json({ok, message, token});
      return;
    }

    token = jwt.sign({ id: user._id, email, type: user.type, company: user.company }, process.env.JWT_SECRET);
    message = "Correct password has been provided";
    res.json({ok, message, token});
  },

}