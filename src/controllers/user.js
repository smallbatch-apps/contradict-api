const User = require('../models/User');
const Contract = require('../models/Contract');
const { Blockchain, wallet } = require('../services/blockchain');
const { utils } = require('ethers');

module.exports = {
  async index(req, res) {
    let search = {};

    if(req.query.licenceId){
      search['licences.licenceId'] = req.query.licenceId;
    }

    const users = await User.find(search);
    res.json({users});
  },

  async show(req, res){
    const user = await User.findById(req.params.id);
    res.json({user});
  },

  async store(req, res){
    const user = new User(req.body.user);
    const error = user.validateSync();

    if (error) {
      const errorMessages = Object.values(error.errors).map(error => ({
        field: error.properties.path,
        message: error.properties.message
      }));

      res.status(400).json(errorMessages);
      return;
    }

    await user.save();
    res.json({user});
  },

  async update(req, res){
    const user = await User.findById(req.params.id);
    const postUser = req.body.user;
    const { identifier } = req.body.user;

    const orderBookContract = await Contract.findOne({contractName: 'OrderBook'});
    // const orderBookDeployment = orderBookContract.deployments.find(filterToIdentifier);
    // const orderBookAddress = orderBookDeployment.address;
    // const orderBookWrapper = new Blockchain(orderBookContract);
    // const orderBookInstance = orderBookWrapper.selectInstance(orderBookAddress);

    let zoneInstance = null;

    const zoneContract = await Contract.findOne({contractName: 'Zone'});
    const zoneDeployments = zoneContract.deployments.filter(dep => dep.identifier === identifier);
    const zoneWrapper = new Blockchain(zoneContract);

    const userContract = await Contract.findOne({contractName: 'Users'});
    const userDeployment = userContract.deployments.find(dep => dep.identifier === identifier);
    const userWrapper = new Blockchain(userContract);
    const userInstance = userWrapper.selectInstance(userDeployment.address);

    if (!user.migrated && postUser.migrated) {
      const userIndex = await userInstance.usersLength();

      // migrating user
      await userInstance.addUser(utils.formatBytes32String(user.name));

      const userLicencePromises = user.licences.map(async licence => {
        const matchingLicence = postUser.licences.find(l => l.licenceId === licence.licenceId);
        licence.ethAccount = matchingLicence.ethAccount;

        const zoneDeployment = zoneDeployments.find(z => z.subIdentifier === licence.zoneString);
        zoneInstance = zoneWrapper.selectInstance(zoneDeployment.address);
        await zoneInstance.transfer(licence.ethAccount, licence.allocation);

        await userInstance.addUserLicence(
          Number(userIndex),
          utils.formatBytes32String(licence.licenceId),
          licence.ethAccount,
          +licence.zoneIndex,
          utils.formatBytes32String(licence.zoneString)
        );

        await wallet.sendTransaction({
          to: licence.ethAccount,
          value: utils.parseEther('0.05')
        });

      });

      await Promise.all(userLicencePromises);

      user.migrated = true;

    }
    await user.save();

    res.json({user});
  }
}