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
const MAIN_CONTRACT_ADDRESS = process.argv[9];
const SIDE_CONTRACT_ADDRESS = process.argv[10];

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

  const redeemEvents = allEvents.filter(event => event.eventName === 'SideTokenRedeemed');

  /* eslint-disable no-param-reassign */
  redeemEvents.forEach((event) => {
    event.status = 'failed';
    event.sideTokenId = '';
    event.owner = '';
    event.amount = '';
    event.confirmedBlockNumber = '';
    event.confirmedTxHash = '';
    event.confirmedRedeemId = '';
    event.duplicatedCount = 0;
    event.duplicatedRedeemId = '';
    event.timestamp = '';
  });
  /* eslint-enable no-param-reassign */

  allEvents.forEach((event) => {
    if (event.eventName === 'SideTokenRedeemConfirmed') {
      const confirmedRedeem = _.find(redeemEvents, { redeemId: event.redeemId });
      if (confirmedRedeem) {
        confirmedRedeem.status = 'Done';
        confirmedRedeem.sideTokenId = event.sideTokenId;
        confirmedRedeem.owner = event.owner;
        confirmedRedeem.amount = event.amount;
        confirmedRedeem.confirmedBlockNumber = event.blockNumber;
        confirmedRedeem.confirmedTxHash = event.txHash;
        confirmedRedeem.confirmedRedeemId = event.redeemId;
        confirmedRedeem.confirmedTimestamp = event.timestamp;
      }
    }
  });

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < redeemEvents.length - 1; i++) {
    // eslint-disable-next-line no-plusplus
    for (let j = i + 1; j < redeemEvents.length; j++) {
      if (redeemEvents[i].owner === redeemEvents[j].owner && redeemEvents[i].amount === redeemEvents[j].amount) {
        // eslint-disable-next-line operator-assignment
        redeemEvents[j].duplicatedCount = redeemEvents[j].duplicatedCount + 1;
        redeemEvents[j].duplicatedRedeemId = redeemEvents[i].redeemId;
      }
    }
  }

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
  console.log(FILENAME);
  const mainBridgeBalance = await txFinder.getBalance('http://main-rpc.luniverse.com:8545?key=luniverse', MAIN_CONTRACT_ADDRESS, MAIN_BRIDGE_ADDRESS);
  const sideBridgeBalance = await txFinder.getBalance(`http://baas-rpc.luniverse.io:8545?lChainId=${SIDE_CHAIN_ID}`, SIDE_CONTRACT_ADDRESS, SIDE_BRIDGE_ADDRESS);
  const sideTokenTotal = await txFinder.getTotalSupply(`http://baas-rpc.luniverse.io:8545?lChainId=${SIDE_CHAIN_ID}`, SIDE_CONTRACT_ADDRESS);

  console.log('mainBridgeBalance', mainBridgeBalance);
  console.log('sideBridgeBalance', sideBridgeBalance);
  console.log('sideTokenTotal', sideTokenTotal);
  console.log('차액', sideTokenTotal - mainBridgeBalance);

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


  const file = fs.writeFileSync(FILENAME, 'mainTxHash,' + 'redeemTxHash,' + 'confirmedRedeemHash,' + 'MainTokenWithdrawed,'
    + 'MainTokenWithdrawedBlockNumber,'
    + 'mainTimestamp,'
    + 'mainEedeemId,'
    + 'sideTokenId,'
    + 'beneficiary,'
    + 'amountMT,'
    + 'amountST,'
    + 'SideTokenRedeemed,'
    + 'SideTokenRedeemedBlockNumber,'
    + 'sideRedeemedTimestamp,'
    + 'SideTokenConfirmedBlockNumber,'
    + 'sideConfirmedTimestamp,'
    + 'redeemId,'
    + 'ConfirmedRedeemId,'
    + 'sideTokenId,'
    + 'owner,'
    + 'amount,'
    + 'duplicatedCount,'
    + 'duplicatedRedeemId,'
    + 'status\n', 'utf-8');

  redeemEvents.forEach((redeemEvent) => {
    const withdrawEvent = _.find(withdrawEvents, { redeemId: redeemEvent.redeemId });
    if (withdrawEvent) {
      fs.appendFileSync(FILENAME, `${withdrawEvent.txHash},${redeemEvent.txHash},${redeemEvent.confirmedTxHash},${withdrawEvent.eventName},${withdrawEvent.blockNumber},${withdrawEvent.timestamp},${withdrawEvent.redeemId},${withdrawEvent.sideTokenId},${withdrawEvent.beneficiary},${withdrawEvent.amountMT},${withdrawEvent.amountST},${redeemEvent.eventName},${redeemEvent.blockNumber},${redeemEvent.timestamp},${redeemEvent.confirmedBlockNumber},${redeemEvent.confirmedTimestamp},${redeemEvent.redeemId},${redeemEvent.confirmedRedeemId},${redeemEvent.sideTokenId},${redeemEvent.owner},${redeemEvent.amount},${redeemEvent.duplicatedCount},${redeemEvent.duplicatedRedeemId},${redeemEvent.status}\n`);
    } else {
      fs.appendFileSync(FILENAME, `,${redeemEvent.txHash},${redeemEvent.confirmedTxHash},,,,,,,,,${redeemEvent.eventName},${redeemEvent.blockNumber},${redeemEvent.timestamp},${redeemEvent.confirmedBlockNumber},${redeemEvent.confirmedTimestamp},${redeemEvent.redeemId},${redeemEvent.confirmedRedeemId},${redeemEvent.sideTokenId},${redeemEvent.owner},${redeemEvent.amount},${redeemEvent.duplicatedCount},${redeemEvent.duplicatedRedeemId},${redeemEvent.status}\n`);
    }
  });

  diffWithdrawEvents.forEach((withdrawEvent) => {
    fs.appendFileSync(FILENAME, `${withdrawEvent.txHash},,,${withdrawEvent.eventName},${withdrawEvent.blockNumber},${withdrawEvent.timestamp},${withdrawEvent.redeemId},${withdrawEvent.sideTokenId},${withdrawEvent.beneficiary},${withdrawEvent.amountMT},${withdrawEvent.amountST},,,,,,,,,,,\n`);
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
