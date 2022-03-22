
const txFinder = require('./transactionFinder');

const CHAIN_ID = '1641349324562974539';
const contractAddress = '0xecf82a04f786b9e3ca6a693e84340cc2a7684c58';

async function main() {
  let sideTotalSupply = 0;
  try {
    sideTotalSupply = await txFinder.getTotalSupply(
      `http://baas-rpc.luniverse.io:8545?lChainId=${CHAIN_ID}`,
      contractAddress,
    );
  } catch (error) {
    console.error(error);
  }
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
