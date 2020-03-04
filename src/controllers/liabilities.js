const Trade = require('../models/Trade');
const {getLedgerRoot, deployTrade} = require('../services/daml');

module.exports = {
  async index(req, res){
    console.log(await getLedgerRoot());
    console.log('Index run');

    res.json({});
  },

  async store(req, res){
    const trade = new Trade(req.body);
    await trade.save();

    await deployTrade('Bob', 'Alice', trade._id, req.body.price, req.body.volume);

    res.json({});
  }

}