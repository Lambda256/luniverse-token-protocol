const subject = require('../eventFinder/transactionFinder');

describe('transactionFinder', () => {
  describe('getErc20EventList', () => {
    it('If the event remains, it will be printed.', async () => {
      const events = await subject.getErc20EventList({
        rpcHttpEndpoint: 'http://127.0.0.1:8545',
        contractAddress: '0x37dbfe6fbcff42aabb653469c5e889cc7faf7f9c',
        eventName: 'Transfer',
        fromBlock: 0,
        toBlock: 5,
      });

      console.log(JSON.stringify(events));
    });
  });
});
