const Web3 = require('web3');
const fs = require('fs');
const _ = require('lodash');

const getBalance = async (rpcHttpEndpoint, contractAddress, tokenOwner) => {
  const web3 = new Web3(rpcHttpEndpoint);
  const abi = JSON.parse(fs.readFileSync(`${__dirname}/abis/ERC20ABI.json`, 'utf8').toString());
  const myConstract = new web3.eth.Contract(abi, contractAddress.toLowerCase());

  const balance = await myConstract.methods.balanceOf(tokenOwner).call();

  return balance;
};

const getTotalSupply = async (rpcHttpEndpoint, contractAddress) => {
  const web3 = new Web3(rpcHttpEndpoint);
  const abi = JSON.parse(fs.readFileSync(`${__dirname}/abis/ERC20ABI.json`, 'utf8').toString());
  const myConstract = new web3.eth.Contract(abi, contractAddress.toLowerCase());

  const totalSupply = await myConstract.methods.totalSupply().call();

  return totalSupply;
};

const getEventList = async ({
  rpcHttpEndpoint, contractAddress, abiPath, eventName, fromBlock, toBlock,
}) => {
  const web3 = new Web3(rpcHttpEndpoint);
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8').toString());
  const myConstract = new web3.eth.Contract(abi, contractAddress.toLowerCase());
  let events = await myConstract.getPastEvents(eventName, {
    fromBlock,
    toBlock,
  });

  const transactions = await Promise.all(events.map(event => web3.eth.getTransactionReceipt(event.transactionHash)));

  events = events.map((event) => {
    const txReceipt = _.find(transactions, { transactionHash: event.transactionHash });
    let output = {
      txHash: event.transactionHash,
      eventName: event.event,
      txFrom: txReceipt.from,
      txTo: txReceipt.to,
      blockNumber: event.blockNumber,
    };
    if (event.returnValues) {
      const eventSpec = abi.filter(element => element.type === 'event' && element.name === event.event);
      const eventParams = eventSpec[0].inputs.map(param => param.name);

      const decodedLog = {};

      eventParams.forEach((param) => {
        decodedLog[param] = event.returnValues[param];
      });
      output = Object.assign(output, decodedLog);
    }

    return output;
  });

  return events;
};

module.exports = {
  getEventList,
  getBalance,
  getTotalSupply,
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
