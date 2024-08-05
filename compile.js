const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.relative(__dirname, 'contracts/Lottery.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Export the contract ABI and bytecode
module.exports = output.contracts['Lottery.sol']['Lottery'];
