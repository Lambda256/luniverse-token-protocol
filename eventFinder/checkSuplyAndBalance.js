
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `BerrySuplyAndBalance_${CURRENT_TIME.getFullYear()}${CURRENT_TIME.getMonth() + 1}${CURRENT_TIME.getDate()}${CURRENT_TIME.getHours()}${CURRENT_TIME.getMinutes()}.csv`;

const BERRY_CHAIN_ID = '8555924898017198221';
const mainContractAddress = '0x5845D58ffD0b99D17eAa1DdE6B38bAf98a420982';
const mainBridgeAddress = '0x09abcfa1f6a3c6d6cd6a22d80937cdd81dc43db2';
const sideContractAddress = '0x05f2a13586B1AE81DAe07E451a0034E8ef1CB0ED';

async function main() {
  console.log(FILENAME);

  let mainBridgeBalance = 0;
  try {
    mainBridgeBalance = await txFinder.getBalance(
      'http://main-rpc.luniverse.com:8545?key=luniverse',
      mainContractAddress,
      mainBridgeAddress.toLowerCase(),
    );
  } catch (error) {
    console.error(error);
  }

  let sideTotalSupply = 0;
  try {
    sideTotalSupply = await txFinder.getTotalSupply(
      `http://baas-rpc.luniverse.io:8545?lChainId=${BERRY_CHAIN_ID}`,
      sideContractAddress,
    );
  } catch (error) {
    console.error(error);
  }

  console.log('mainBridgeBalance: ', mainBridgeBalance);
  console.log('sideTotalSupply: ', sideTotalSupply);
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
