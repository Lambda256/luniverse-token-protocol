const txFinder = require('./transactionFinder');

async function main() {
  const contractAddress = '0x7558a89478ee18e19d800c5e6c17b362b1c8a6ea';
  const address = '0x7a4ec2cce4fe388fdc8634909ab53021fbe29239';
  const httpProvider = 'http://main-rpc.luniverse.com:8545?key=luniverse';

  const contractResult = await txFinder.getCode(httpProvider, contractAddress);
  console.log('contractResult:', contractResult);
  const addressResult = await txFinder.getCode(httpProvider, address);
  console.log('addressResult:', addressResult);
}

main();
