const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3').Web3;
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
  'YOUR_MNEMONIC',
  'https://eth-sepolia.g.alchemy.com/v3/YOUR_ALCHEMY_PROJECT_ID'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Deploying from account: ', accounts[1]);

  // Check balance
  const balanceWei = await web3.eth.getBalance(accounts[1]);
  const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
  console.log(`Account balance: ${balanceEth} ETH`);

  // Define gas limit and price
  const gasLimitEstimate = await web3.eth.estimateGas(evm.bytecode.object);
  const gasPrice = await web3.eth.getGasPrice();

  // Calculate transaction cost
  const transactionFee = gasLimitEstimate * gasPrice
  const transactionCostEth = web3.utils.fromWei(transactionFee, 'ether');

  console.log(`Estimated transaction cost: ${transactionCostEth} ETH`);

  // Check if balance is sufficient
  if (balanceEth < transactionCostEth) {
    console.error('Insufficient funds for gas * price + value');
    provider.engine.stop();
    return;
  }

  try {
    const result = await new web3.eth.Contract(abi)
      .deploy({
        data: evm.bytecode.object,
      })
      .send({
        from: accounts[1],
        gas: 10000000,
        gasPrice
      });

    console.log('Contract deployed to:', result.options.address);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }

  provider.engine.stop();
};

deploy();
