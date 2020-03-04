const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
});

const DeploymentSchema = new Schema({
  address: String,
  title: String,
  identifier: { type: String, required: true },
  subIdentifier: String,
  accounts: [AccountSchema]
});

const ContractSchema = new Schema({
  contractName: { type: String, required: true },
  identifier: { type: String, required: true },
  description: { type: String, required: true },
  abi: { type: String, required: true },
  bytecode: { type: String, required: true },
  deployments: [DeploymentSchema]
});

const Contract = mongoose.model('contract', ContractSchema);

module.exports = Contract;