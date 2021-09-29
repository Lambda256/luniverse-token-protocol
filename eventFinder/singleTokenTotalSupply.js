
const txFinder = require('./transactionFinder');

const CHAIN_ID = '9982245428912137590';
const contractAddress = '0xfBCDd0384fBC62a18B4Fd350E0628607D68F2c96';

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
