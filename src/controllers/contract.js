const Contract = require('../models/Contract');
const { serializeResponse, collectionEntityIncludes } = require('../utils');

const relationships = [
  { relationship: 'deployments' },
  { relationship: 'subContracts' }
];


module.exports = {
  async store(req, res){
    const contract = new Contract(req.body.contract);
    await contract.save();
    res.json(contract);
  },

  async delete(req, res){
    const { id } = req.params;
    // console.log(id);
    await Contract.deleteOne({identifier:id});
    return res.json({});
  },

  async index(req, res) {
    const contracts = await Contract.find({});

    const data = contracts.map(contract => serializeResponse('contracts', contract, relationships));
    const included = collectionEntityIncludes(contracts, relationships);

    res.setHeader('Content-Type', 'application/vnd.api+json');
    res.json({data, included});
  },

  async show(req, res) {
    const { id } = req.params;
    const contract = await Contract.find({identifier:id});

    const data = serializeResponse('contracts', contract, relationships);

    res.setHeader('Content-Type', 'application/vnd.api+json');
    return res.json({data});
  },

  async deleteAll(req, res) {
    await Contract.deleteMany({});
    return res.json({success: true});
  },

  async delete(req, res) {
    const { id } = req.params;
    await Contract.deleteOne({_id: id});
    return res.json({success: `deleted contract ${id}`});
  }
}