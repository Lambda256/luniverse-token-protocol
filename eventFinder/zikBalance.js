const fs = require('fs');
const converter = require('json-2-csv');
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `ZikTalkAddrBalance_${CURRENT_TIME.getFullYear()}${CURRENT_TIME.getMonth() + 1}${CURRENT_TIME.getDate()}${CURRENT_TIME.getHours()}${CURRENT_TIME.getMinutes()}.csv`;

const BERRY_CHAIN_ID = '6229593161289272142';
const mainContractAddress = '0x35def49e4C26AadD2A0734f38F07dc6C7993f764';
const sideContractAddress = '0xaf29f9efe818e403593a700cc44ca487a2c37d72';
const swapAdresses = [];

const userAdresses = ['0x7a4ec2cce4fe388fdc8634909ab53021fbe29239'];

async function main() {
  console.log(FILENAME);
  const output = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const swapAddr of swapAdresses) {
    let mainBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      mainBalance = await txFinder.getBalance(
        'http://main-rpc.luniverse.com:8545?key=luniverse',
        mainContractAddress,
        swapAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }

    let sideBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      sideBalance = await txFinder.getBalance(
        `http://baas-rpc.luniverse.io:8545?lChainId=${BERRY_CHAIN_ID}`,
        sideContractAddress,
        swapAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }
    output.push({
      type: 'swap',
      address: swapAddr,
      mainBalance,
      sideBalance,
    });
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const userAddr of userAdresses) {
    let mainBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      mainBalance = await txFinder.getBalance(
        'http://main-rpc.luniverse.com:8545?key=luniverse',
        mainContractAddress,
        userAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }

    let sideBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      sideBalance = await txFinder.getBalance(
        `http://baas-rpc.luniverse.io:8545?lChainId=${BERRY_CHAIN_ID}`,
        sideContractAddress,
        userAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }
    output.push({
      type: 'user',
      address: userAddr,
      mainBalance,
      sideBalance,
    });
  }
  const options = {
    keys: ['type', 'address', 'mainBalance', 'sideBalance'],
  };
  const csv = await converter.json2csvAsync(output, options);
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
