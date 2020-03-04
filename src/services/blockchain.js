const { providers, Contract, Wallet, ContractFactory, utils } = require('ethers');
// const ContractModel = require('../models/Contract');
const {loadConstructor} = require('./abi');

require('dotenv').config();

let provider, wallet;

if (process.env.HOME !== '/Users/mattb') {
  provider = new providers.InfuraProvider('ropsten', process.env.WL_INFURA_PROJECT_ID);
  wallet = new Wallet(process.env.WL_PRIVATE_KEY, provider);
}
else {
  provider = new providers.JsonRpcProvider();
  wallet = provider.getSigner(0);
}

const baseNonce = provider.getTransactionCount(wallet.getAddress());

let nonceOffset = 0;
function getNonce() {
  return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
}

class Blockchain {

  constructor(contract, parameters = []) {
    this.contract = contract;
    this.parameters = parameters;
  }

  async deployContract(instance) {
    const mainFactory = new ContractFactory(this.contract.abi, this.contract.bytecode, wallet);
    const params = this.getTranslatedParameters(this.parameters, instance);

    let deployed = false;
    try{
      deployed = await mainFactory.deploy(...params);
    } catch(error) {
      console.log(error.message);
    }
    return deployed;
  }

  getTranslatedParameters(parameters) {
    return parameters.map((parameter, index) => {
      const cp = loadConstructor(JSON.parse(this.contract.abi));
      const currentType = cp.inputs[index].type;

      if(currentType === 'bytes32') {
        return utils.formatBytes32String(parameter);
      }

      return parameter;
    });
  }

  selectInstance(address) {
    return new Contract(address, this.contract.abi, wallet);
  }
}




module.exports = {Blockchain, wallet, provider};