const { ethers } = require('hardhat');

describe('Allocated Delegation Contract', () => {
  it('Deployment should assign the total supply of tokens to the owner', async () => {
    const [owner] = await ethers.getSigners();

    const AllocatedDelegationContractFactory = await ethers.getContractFactory('AllocatedDelegationContract');

    const AllocatedDelegationContract = await AllocatedDelegationContractFactory.deploy();

    console.log(AllocatedDelegationContract);
    console.log(owner.address);
  });
});
