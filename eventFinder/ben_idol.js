const fs = require('fs');
const converter = require('json-2-csv');
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `Ben_idol_${CURRENT_TIME.getFullYear()}${CURRENT_TIME.getMonth() + 1}${CURRENT_TIME.getDate()}${CURRENT_TIME.getHours()}${CURRENT_TIME.getMinutes()}.csv`;

const L_CHAIN_ID = '1634284028186342722';

const contractAddresses = ['0xf3cc0b10a10f4660be5b497b068df82871bb800b',
  '0xcbe8e426cdaccdc7896306dc102b0d982eadb1a8',
  '0x72deb09c1b1bba2e5a233d4f1dfa3539b060a1b1',
  '0x4ba77f35f32a5a2b6971316f66721133fede10fe',
];

const userAddresses = [
  '0x4ba77f35f32a5a2b6971316f66721133fede10fe',
];

async function main() {
  console.log(FILENAME);
  const output = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const contractAddress of contractAddresses) {
    // eslint-disable-next-line no-restricted-syntax
    for (const userAddress of userAddresses) {
      let sideBalance = -1;
      try {
        // eslint-disable-next-line no-await-in-loop
        sideBalance = await txFinder.getBalance(
          `http://baas-rpc.luniverse.io:8545?lChainId=${L_CHAIN_ID}`,
          contractAddress,
          userAddress.toLowerCase(),
        );
      } catch (error) {
        console.error(error);
      }
      output.push({
        address: userAddress,
        contractAddress,
        sideBalance,
      });
    }
  }

  const options = {
    keys: ['address', 'contractAddress', 'sideBalance'],
  };
  const csv = await converter.json2csvAsync(output, options);
  fs.writeFileSync(`${__dirname}/outputs/${FILENAME}`, csv);
}

main();
