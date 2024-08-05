const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3').Web3;
const { abi, evm } = require('../compile');

// Create an instance of Web3 connected to Ganache
const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async () => {
  // Fetch list of accounts from the local test blockchain
  accounts = await web3.eth.getAccounts();

  // Use one of the accounts to deploy contract
  lottery = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object
    })
    .send({
      from: accounts[0],
      gas: 1000000,
      gasPrice: web3.utils.toWei('10', 'gwei') // Set a reasonable gas price
    });
});

describe('Lottery', () => {
  it('should deploy contracts', () => {
    assert.ok(lottery.options.address);
  });

  it('should allow players to register', async () => {
    const value = web3.utils.toWei('0.01', 'ether');
    const transactionConfig = {
      to: lottery.options.address,
      value,
      gas: 100000,
      gasPrice: web3.utils.toWei('10', 'gwei')
    };

    // Register player 1
    await web3.eth.sendTransaction({
      from: accounts[1],
      ...transactionConfig
    });

    // Register player 2
    await web3.eth.sendTransaction({
      from: accounts[2],
      ...transactionConfig
    });

    // Register player 3
    await web3.eth.sendTransaction({
      from: accounts[3],
      ...transactionConfig
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    let contractBalance = await web3.eth.getBalance(lottery.options.address);
    contractBalance = web3.utils.fromWei(contractBalance, 'ether');

    assert.equal(players.length, 3);
    assert.strictEqual(contractBalance, '0.03');
  });

  it('should picks a winner and send the prize', async () => {
    // TODO
  });
});
