const fs = require('fs');
const _ = require('lodash');
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `BerryLog-${CURRENT_TIME.getFullYear()}-${CURRENT_TIME.getMonth()}-${CURRENT_TIME.getDay()}|${CURRENT_TIME.getHours()}:${CURRENT_TIME.getMinutes()}.csv`;

const SIDE_CHAIN_ID = process.argv[2];
const SIDE_CHAIN_FROM_BLOCK = process.argv[3];
const SIDE_CHAIN_TO_BLOCK = process.argv[4];
const MAIN_CHAIN_FROM_BLOCK = process.argv[5];
const MAIN_CHAIN_TO_BLOCK = process.argv[6];
const SIDE_BRIDGE_ADDRESS = process.argv[7];
const MAIN_BRIDGE_ADDRESS = process.argv[8];

async function fetchSidechainRedeemEventStatus({
  rpcHttpEndpoint,
  contractAddress,
  abiPath,
  eventName,
  fromBlock,
  toBlock,
}) {
  const allEvents = await txFinder.getEventList({
    rpcHttpEndpoint,
    contractAddress,
    abiPath,
    eventName,
    fromBlock,
    toBlock,
  });

  const redeemEvents = allEvents.filter(event => event.name === 'SideTokenRedeemed');

  /* eslint-disable no-param-reassign */
  redeemEvents.forEach((event) => {
    event.status = 'failed';
    event.sideTokenId = '';
    event.owner = '';
    event.amount = '';
    event.confirmedBlockNumber = '';
  });
  /* eslint-enable no-param-reassign */

  allEvents.forEach((event) => {
    if (event.name === 'SideTokenRedeemConfirmed') {
      const confirmedRedeem = _.find(redeemEvents, { redeemId: event.redeemId });
      if (confirmedRedeem) {
        confirmedRedeem.status = 'Done';
        confirmedRedeem.sideTokenId = event.sideTokenId;
        confirmedRedeem.owner = event.owner;
        confirmedRedeem.amount = event.amount;
        confirmedRedeem.confirmedBlockNumber = event.blockNumber;
      }
    }
  });

  return redeemEvents;
}

async function fetchMainchainWithdrawEvents({
  rpcHttpEndpoint,
  contractAddress,
  abiPath,
  eventName,
  fromBlock,
  toBlock,
}) {
  const allEvents = await txFinder.getEventList({
    rpcHttpEndpoint,
    contractAddress,
    abiPath,
    eventName,
    fromBlock,
    toBlock,
  });

  return allEvents;
}

async function main() {
  const redeemEvents = await fetchSidechainRedeemEventStatus({
    rpcHttpEndpoint: `http://baas-rpc.luniverse.io:8545?lChainId=${SIDE_CHAIN_ID}`,
    contractAddress: SIDE_BRIDGE_ADDRESS,
    abiPath: `${__dirname}/abis/SideBridgeABI.json`,
    eventName: 'allEvents',
    fromBlock: SIDE_CHAIN_FROM_BLOCK,
    toBlock: SIDE_CHAIN_TO_BLOCK,
  });
  const withdrawEvents = await fetchMainchainWithdrawEvents({
    rpcHttpEndpoint: 'http://main-rpc.luniverse.com:8545?key=luniverse',
    contractAddress: MAIN_BRIDGE_ADDRESS,
    abiPath: `${__dirname}/abis/MainBridgeABI.json`,
    eventName: 'MainTokenWithdrawed',
    fromBlock: MAIN_CHAIN_FROM_BLOCK,
    toBlock: MAIN_CHAIN_TO_BLOCK,
  });

  const redeemEventIds = redeemEvents.map(redeemEvent => redeemEvent.id);

  const diffWithdrawEvents = withdrawEvents.filter(withdrawEvent => !redeemEventIds.includes(withdrawEvent.redeemId));


  const file = fs.writeFileSync(FILENAME, 'MainTokenWithdrawed, '
    + 'MainTokenWithdrawedBlockNumber, '
    + 'redeemId,'
    + 'sideTokenId,'
    + 'beneficiary, '
    + 'amountMT, '
    + 'amountST, '
    + 'SideTokenRedeemed, '
    + 'SideTokenRedeemedBlockNumber, '
    + 'SideTokenConfirmedBlockNumber, '
    + 'redeemId, '
    + 'sideTokenId, '
    + 'owner, '
    + 'amount, '
    + 'status\n', 'utf-8');

  redeemEvents.forEach((redeemEvent) => {
    const withdrawEvent = _.find(withdrawEvents, { redeemId: redeemEvent.redeemId });
    if (withdrawEvent) {
      fs.appendFileSync(FILENAME, `${withdrawEvent.eventName}, 
      ${withdrawEvent.blockNumber}, 
      ${withdrawEvent.redeemId}, 
      ${withdrawEvent.sideTokenId}, 
      ${withdrawEvent.beneficiary}, 
      ${withdrawEvent.amountMT}, 
      ${withdrawEvent.amountST}, 
      ${redeemEvent.eventName}, 
      ${redeemEvent.blockNumber}, 
      ${redeemEvent.confirmedBlockNumber}, 
      ${redeemEvent.redeemId}, 
      ${redeemEvent.sideTokenId}, 
      ${redeemEvent.owner},
      ${redeemEvent.amount}
      ${redeemEvent.status}\n`);
    } else {
      fs.appendFileSync(FILENAME, `, 
      , 
      , 
      , 
      , 
      , 
      , 
      ${redeemEvent.eventName}, 
      ${redeemEvent.blockNumber}, 
      ${redeemEvent.confirmedBlockNumber}, 
      ${redeemEvent.redeemId}, 
      ${redeemEvent.sideTokenId}, 
      ${redeemEvent.owner},
      ${redeemEvent.amount},
      ${redeemEvent.status}\n`);
    }
  });

  diffWithdrawEvents.forEach((withdrawEvent) => {
    fs.appendFileSync(FILENAME, `${withdrawEvent.eventName},
      ${withdrawEvent.blockNumber},
      ${withdrawEvent.redeemId},
      ${withdrawEvent.sideTokenId},
      ${withdrawEvent.beneficiary},
      ${withdrawEvent.amountMT},
      ${withdrawEvent.amountST},
      , 
      ,
      , 
      , 
      , 
      ,
      ,
      \n`);
  });
}

main()
  .then((result) => {
    if (result === 0) {
      // eslint-disable-next-line no-console
      console.log('[EXIT] SUCCESS');
    }

    process.exit(result);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[Error] ', error);
  });