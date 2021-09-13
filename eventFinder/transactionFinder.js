const Web3 = require('web3');
const fs = require('fs');

const getEventList = async ({
  rpcHttpEndpoint, contractAddress, abiPath, eventName = 'allEvents', fromBlock, toBlock,
}) => {
  const web3 = new Web3(rpcHttpEndpoint);
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8').toString());
  const myConstract = new web3.eth.Contract(abi, contractAddress.toLowerCase());
  const events = await myConstract.getPastEvents(eventName, {
    fromBlock,
    toBlock,
  });

  return events;
};

module.exports = {
  getEventList,
  getErc20EventList: async ({
    rpcHttpEndpoint, contractAddress, eventName = 'allEvents', fromBlock, toBlock,
  }) => {
    const events = await getEventList({
      rpcHttpEndpoint,
      contractAddress,
      abiPath: `${__dirname}/abis/ERC20ABI.json`,
      eventName,
      fromBlock,
      toBlock,
    });

    return events;
  },
  getMainBridgeEventList: async ({
    rpcHttpEndpoint, contractAddress, eventName = 'allEvents', fromBlock, toBlock,
  }) => {
    const events = await getEventList({
      rpcHttpEndpoint,
      contractAddress,
      abiPath: `${__dirname}/abis/MainBridgeABI.json`,
      eventName,
      fromBlock,
      toBlock,
    });

    return events;
  },
  getSideBridgeEventList: async ({
    rpcHttpEndpoint, contractAddress, eventName = 'allEvents', fromBlock, toBlock,
  }) => {
    const events = await getEventList({
      rpcHttpEndpoint,
      contractAddress,
      abiPath: `${__dirname}/abis/SideBridgeABI.json`,
      eventName,
      fromBlock,
      toBlock,
    });

    return events;
  },
};
