const Contract = require('../models/Contract');
const ethers = require('ethers');
const {Blockchain} = require('../services/blockchain');

module.exports = {

  async store(req, res) {
    const { contractName, identifier, subIdentifier, title, constructorParams = [] } = req.body.instance;

    let contract = await Contract.findOne({contractName});

    if (!contract) {
      res.status(404).json({ok:false, message:`No contract named ${contractName} found`});
      return;
    }

    const deploymentExists = contract.deployments.find(d => d.identifier === identifier);

    if(deploymentExists && !subIdentifier){
      res.status(409).json({ok: false, message:`Contract already deployed as ${identifier}. Provide a field marked 'subIdentifier' to deploy multiple of the same contract in a project.`});
      return;
    }

    let deployment = contract.deployments.create({identifier, title, subIdentifier});

    contract.deployments.push(deployment);

    const bcWrapper = new Blockchain(contract, constructorParams);
    const deployed = await bcWrapper.deployContract(req.body.instance);

    deployment.address = deployed.address;

    await contract.save();

    deployment = deployment.toObject();

    deployment.abi = contract.abi;
    deployment.bytcode = contract.bytcode;

    res.json({deployment});

  },

  async delete(req, res) {
    const { contractId, instanceId } = req.params;

    let contract = await Contract.findOne({identifier: contractId});

    contract.deployments.map(deploy => {
      if(deploy.identifier === instanceId) {
        deploy.remove();
      }
    });
    await contract.save();
    res.json({});
  },

  async index(req, res) {
    const { id } = req.params;
    const contract = await Contract.find({identifier:id});
    res.json({contract});
  },

  async show(req, res) {
    const { contractId, instanceId, subInstanceId = null } = req.params;

    let contract = await Contract.findOne({identifier: contractId});
    let instance = null;

    instances = contract.deployments.filter(d => d.identifier === instanceId);

    if(instances.length > 1){
      instance = instances.filter(d => d.subIdentifier === subInstanceId);
    }

    instance = instances[0].toObject();
    instance.abi = contract.abi;
    instance.bytecode = contract.bytecode;

    res.json({instance});
  },
}