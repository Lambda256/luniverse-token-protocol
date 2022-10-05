
const txFinder = require('./transactionFinder');

const address = '0xf81ecd7816aa53540f86765db9fa73fb1bed94b3';

async function main() {
  let sideTotalSupply = 0;
  try {
    sideTotalSupply = await txFinder.getLukBalance(
      'http://baas-rpc.luniverse.dev:8545?lChainId=1664948397835402887',
      address,
    );
  } catch (error) {
    console.error(error);
  }
  console.log('luk: ', sideTotalSupply);
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
