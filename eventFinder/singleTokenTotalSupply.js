
const txFinder = require('./transactionFinder');

const CHAIN_ID = '1347141705302352981';
const contractAddress = '0x22Ca2A0c26c39dc425579798326f45119466eC14';

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
