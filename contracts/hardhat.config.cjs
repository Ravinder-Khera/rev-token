require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
PRIVATE_KEY = process.env.PRIVATE_KEY;
SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.25", // Specify the Solidity compiler version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the number of runs as needed
      },
    },
  },

  networks: {
    eth: {
      url: "https://eth.drpc.org",
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/rfCruuBJ6-ND7sPx8qfywX0PjKWcmIQq",
      accounts: [PRIVATE_KEY],
    },
    testnet: {
      url: "https://data-seed-prebsc-2-s2.binance.org:8545/",
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/jIGX7Mqs5libwXKzRJNWee7Y7OhIBTU6",
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: SEPOLIA_API_KEY,
  },
};
