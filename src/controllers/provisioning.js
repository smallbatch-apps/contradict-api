
const Contract = require('../models/Contract');
const {Blockchain} = require('../services/blockchain');
const { utils } = require('ethers');

module.exports = {
  async store(req, res){
    const { provisioningName, identifier } = req.body.provisioning;

    if (provisioningName === 'waterledger') {
      const orderBookContract = await Contract.findOne({contractName: 'OrderBook'});

      const orderBookDeployment = orderBookContract.deployments.find(dep => dep.identifier === identifier);
      const orderBookAddress = orderBookDeployment.address;
      const orderBookWrapper = new Blockchain(orderBookContract);
      const orderBookInstance = orderBookWrapper.selectInstance(orderBookAddress);

      const zoneContract = await Contract.findOne({contractName: 'Zone'});

      const zonePromises = zoneContract.deployments.filter(d => d.identifier === identifier)
        .map(tz => orderBookInstance.addZone(utils.formatBytes32String(tz.subIdentifier), tz.address))

      await Promise.all(zonePromises);

      const historyContract = await Contract.findOne({contractName: 'History'});
      const historyDeployment = historyContract.deployments.find(dep => dep.identifier === identifier);
      await orderBookInstance.addHistoryContract(historyDeployment.address);

      const usersContract = await Contract.findOne({contractName: 'Users'});
      const usersDeployment = usersContract.deployments.find(dep => dep.identifier === identifier);
      await orderBookInstance.addUsersContract(usersDeployment.address);

      res.json({message: 'WaterLedger Contracts successfully provisioned'});
    }
  }
}