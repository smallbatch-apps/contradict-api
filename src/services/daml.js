const axios = require('axios');

axios.defaults.baseURL = process.env.DAML_LEDGER_URL;
axios.defaults.headers.common['Authorization'] = process.env.WL_JWT_TOKEN;

const deployTrade = async (buyer, seller, uuid, price, volume) => {
  const requestData = {
    templateId: "Trade:TradeProposal",
    payload: {
      newTrade: {
        facilitator: 'WaterLedger',
        observers : [seller],
        trade: {
          buyer,
          seller,
          uuid: uuid.toString(),
          currency: 'AUD',
          amount: price * volume,
          volume
        }
      }
    }
  }

  console.log('Request Data: %o', JSON.stringify(requestData));
  const request = await axios.post('/v1/create', requestData);
  console.log(request);
}

const getLedgerRoot = async () => {
  const {data} = await axios.get('/v1/query');

  return data;
}

module.exports = {
  getLedgerRoot, deployTrade
}