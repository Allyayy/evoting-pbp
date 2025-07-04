require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // RPC Mainnet Infura
      accounts: [process.env.PRIVATE_KEY], // Private key wallet deployer
    },
  },
};
