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
  describe('getEventList(Deposit, DepositConfirmed, SideTokenMinted)', () => {
    const SIDE_CHAIN_ID = 8555924898017198221;
    it('If the Deposited, DepositConfirmed event remains, it will be printed.', async () => {
      const targetEventNames = ['Deposited', 'DepositConfirmed'];
      const events = await subject.getEventList({
        rpcHttpEndpoint: 'http://main-rpc.luniverse.com:8545?key=luniverse',
        contractAddress: '0x09abcfa1f6a3c6d6cd6a22d80937cdd81dc43db2',
        eventName: 'allEvents',
        fromBlock: 70025600,
        toBlock: 70347100,
      });

      const filteredEvents = events.filter(event => targetEventNames.includes(event.eventName));

      console.log(JSON.stringify(filteredEvents));
      console.log();
    });


    it('If the  SideTokenMinted event remains, it will be printed.', async () => {
      const events = await subject.getEventList({
        rpcHttpEndpoint: `http://baas-rpc.luniverse.io:8545?lChainId=${SIDE_CHAIN_ID}`,
        contractAddress: '0xcc6b7c0dd3cceeb12ebf92f4715b5b2f0f52316d',
        eventName: 'SideTokenMinted',
        fromBlock: 32535800,
        toBlock: 32843220,
      });

      console.log(JSON.stringify(events));
      console.log();
    });
  });
});
