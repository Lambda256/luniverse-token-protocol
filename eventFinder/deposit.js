const fs = require('fs');
const json2csv = require('json-2-csv');
const _ = require('lodash');
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `BerryLog_${CURRENT_TIME.getFullYear()}${CURRENT_TIME.getMonth() + 1}${CURRENT_TIME.getDate()}${CURRENT_TIME.getHours()}${CURRENT_TIME.getMinutes()}.csv`;

const SIDE_CHAIN_ID = process.argv[2];
const SIDE_CHAIN_FROM_BLOCK = process.argv[3];
const SIDE_CHAIN_TO_BLOCK = process.argv[4];
const MAIN_CHAIN_FROM_BLOCK = process.argv[5];
const MAIN_CHAIN_TO_BLOCK = process.argv[6];
const SIDE_BRIDGE_ADDRESS = process.argv[7];
const MAIN_BRIDGE_ADDRESS = process.argv[8];
const MAIN_CONTRACT_ADDRESS = process.argv[9];
const SIDE_CONTRACT_ADDRESS = process.argv[10];

async function fetchMainChainDepositEvent({
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

  const depositedEvents = allEvents.filter(event => event.eventName === 'Deposited');

  /* eslint-disable no-param-reassign */
  depositedEvents.forEach((event) => {
    event.status = 'failed';
    event.sideTokenId = '';
    event.confirmedBlockNumber = '';
    event.confirmedTxHash = '';
    event.confirmedDepositId = '';
    event.duplicatedCount = 0;
    event.duplicatedDepositId = '';
    event.amountMT = '';
    event.amountST = '';
  });
  /* eslint-enable no-param-reassign */

  allEvents.forEach((event) => {
    if (event.eventName === 'DepositConfirmed') {
      const confirmedRedeem = _.find(depositedEvents, { depositId: event.depositId });
      if (confirmedRedeem) {
        confirmedRedeem.status = 'Done';
        confirmedRedeem.sideTokenId = event.sideTokenId;
        confirmedRedeem.confirmedBlockNumber = event.blockNumber;
        confirmedRedeem.confirmedTxHash = event.txHash;
        confirmedRedeem.confirmedDepositId = event.depositId;
        confirmedRedeem.confirmedTimestamp = event.timestamp;
        confirmedRedeem.amountMT = event.amountMT;
        confirmedRedeem.amountST = event.amountST;
      }
    }
  });

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < depositedEvents.length - 1; i++) {
    // eslint-disable-next-line no-plusplus
    for (let j = i + 1; j < depositedEvents.length; j++) {
      if (depositedEvents[i].owner === depositedEvents[j].owner && depositedEvents[i].amount === depositedEvents[j].amount) {
        // eslint-disable-next-line operator-assignment
        depositedEvents[j].duplicatedCount = depositedEvents[j].duplicatedCount + 1;
        depositedEvents[j].duplicatedDepositId = depositedEvents[i].depositId;
      }
    }
  }

  return depositedEvents;
}

async function fetchSideChainMintedEvent({
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

  const depositEvents = await fetchMainChainDepositEvent({
    rpcHttpEndpoint: 'http://main-rpc.luniverse.com:8545?key=luniverse',
    contractAddress: MAIN_BRIDGE_ADDRESS,
    abiPath: `${__dirname}/abis/MainBridgeABI.json`,
    eventName: 'allEvents',
    fromBlock: MAIN_CHAIN_FROM_BLOCK,
    toBlock: MAIN_CHAIN_TO_BLOCK,
  });
  const mintedEvents = await fetchSideChainMintedEvent({
    rpcHttpEndpoint: `http://baas-rpc.luniverse.io:8545?lChainId=${SIDE_CHAIN_ID}`,
    contractAddress: SIDE_BRIDGE_ADDRESS,
    abiPath: `${__dirname}/abis/SideBridgeABI.json`,
    eventName: 'SideTokenMinted',
    fromBlock: SIDE_CHAIN_FROM_BLOCK,
    toBlock: SIDE_CHAIN_TO_BLOCK,
  });

  const depositEventIds = depositEvents.map(depositEvent => depositEvent.depositId);

  const diffMintedEvents = mintedEvents.filter(mintedEvent => !depositEventIds.includes(mintedEvent.depositId));
  console.log('mintedEvents length: ', mintedEvents.length);
  console.log('depositEvents length: ', depositEvents.length);
  console.log('diffMintedEvents length: ', diffMintedEvents.length);

  const output = [];

  depositEvents.forEach((depositEvent) => {
    const mintedEvent = _.find(mintedEvents, { depositId: depositEvent.depositId });
    if (mintedEvent) {
      output.push({
        SideTxHash: mintedEvent.txHash,
        DepositTxHash: depositEvent.txHash,
        ConfirmedRedeemHash: depositEvent.confirmedTxHash,
        SideTokenMinted: mintedEvent.eventName,
        SideTokenMintedBlockNumber: mintedEvent.blockNumber,
        SideTimestamp: mintedEvent.timestamp,
        SideDepositId: mintedEvent.depositId,
        MintedEventSideTokenId: mintedEvent.sideTokenId,
        beneficiary: mintedEvent.beneficiary,
        amountMT: mintedEvent.amountMT,
        amountST: mintedEvent.amountST,
        Deposited: depositEvent.eventName,
        SideTokenDepositedBlockNumber: depositEvent.blockNumber,
        SideTokenDepositedTimestamp: depositEvent.timestamp,
        DepositConfirmedBlockNumber: depositEvent.confirmedBlockNumber,
        DepositConfirmedTimestamp: depositEvent.confirmedTimestamp,
        DepositId: depositEvent.depositId,
        ConfirmedDepositId: depositEvent.confirmedDepositId,
        DepositEventSideTokenId: depositEvent.sideTokenId,
        duplicatedCount: depositEvent.duplicatedCount,
        duplicatedDepositId: depositEvent.duplicatedDepositId,
        status: depositEvent.status,
      });
    } else {
      output.push({
        SideTxHash: '',
        DepositTxHash: depositEvent.txHash,
        ConfirmedRedeemHash: depositEvent.confirmedTxHash,
        SideTokenMinted: '',
        SideTokenMintedBlockNumber: '',
        SideTimestamp: '',
        SideDepositId: '',
        MintedEventSideTokenId: '',
        beneficiary: '',
        amountMT: '',
        amountST: '',
        Deposited: depositEvent.eventName,
        SideTokenDepositedBlockNumber: depositEvent.blockNumber,
        SideTokenDepositedTimestamp: depositEvent.timestamp,
        DepositConfirmedBlockNumber: depositEvent.confirmedBlockNumber,
        DepositConfirmedTimestamp: depositEvent.confirmedTimestamp,
        DepositId: depositEvent.depositId,
        ConfirmedDepositId: depositEvent.confirmedDepositId,
        DepositEventSideTokenId: depositEvent.sideTokenId,
        duplicatedCount: depositEvent.duplicatedCount,
        duplicatedDepositId: depositEvent.duplicatedDepositId,
        status: depositEvent.status,
      });
    }
  });

  diffMintedEvents.forEach((mintedEvent) => {
    output.push({
      SideTxHash: mintedEvent.txHash,
      DepositTxHash: '',
      ConfirmedRedeemHash: '',
      SideTokenMinted: mintedEvent.eventName,
      SideTokenMintedBlockNumber: mintedEvent.blockNumber,
      SideTimestamp: mintedEvent.timestamp,
      SideDepositId: mintedEvent.depositId,
      MintedEventSideTokenId: mintedEvent.sideTokenId,
      beneficiary: mintedEvent.beneficiary,
      amountMT: mintedEvent.amountMT,
      amountST: mintedEvent.amountST,
      Deposited: '',
      SideTokenDepositedBlockNumber: '',
      SideTokenDepositedTimestamp: '',
      DepositConfirmedBlockNumber: '',
      DepositConfirmedTimestamp: '',
      DepositId: '',
      ConfirmedDepositId: '',
      DepositEventSideTokenId: '',
      duplicatedCount: '',
      duplicatedDepositId: '',
      status: '',
    });
  });

  const options = {
    keys: [
      'SideTxHash',
      'DepositTxHash',
      'ConfirmedRedeemHash',
      'SideTokenMinted',
      'SideTokenMintedBlockNumber',
      'SideTimestamp',
      'SideDepositId',
      'MintedEventSideTokenId',
      'beneficiary',
      'amountMT',
      'amountST',
      'Deposited',
      'SideTokenDepositedBlockNumber',
      'SideTokenDepositedTimestamp',
      'DepositConfirmedBlockNumber',
      'DepositConfirmedTimestamp',
      'DepositId',
      'ConfirmedDepositId',
      'DepositEventSideTokenId',
      'duplicatedCount',
      'duplicatedDepositId',
      'status',
    ],
  };
  const csv = await json2csv.json2csvAsync(output, options);
  fs.writeFileSync(`${__dirname}/ouputs/${FILENAME}`, csv);
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
