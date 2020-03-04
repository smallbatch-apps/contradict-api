const Web3 = require('Web3');

const Contract = require('../models/Contract');
const Trade = require('../models/Trade');

const {deployTrade} = require('../services/daml');

require('dotenv').config();

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.PROVIDER_URL)
);

const instances = {
  History: {},
  OrderBook: {},
}

const watchForEvents = async () => {
  const fromBlock = await web3.eth.getBlockNumber();
  let historyContract = await Contract.findOne({contractName: 'History'});

  historyContract.deployments.forEach(d => {
    const instance = new web3.eth.Contract(JSON.parse(historyContract.abi), d.address);
    instances['History'][d.identifier] = instance;
    instance.events.HistoryAdded({fromBlock}).on('data', function(event) {
      // console.log('History Added Event Triggered');
      // console.log(event);
      const trade = new Trade({
        fromAddress: event.from,
  toAddress: event.to,
  tradeIndex: event.from
      });


    })
  });

  let orderbookContract = await Contract.findOne({contractName: 'OrderBook'});

  orderbookContract.deployments.forEach(d => {
    const instance = new web3.eth.Contract(JSON.parse(orderbookContract.abi), d.address);

    instances['OrderBook'][d.identifier] = instance;
    instance.events.OrderAdded({fromBlock})
      .on('data', function(event) {
        // console.log('OrderBook Addition Triggered');
        // console.log(event);
      })
  });
}

module.exports = { watchForEvents, instances };