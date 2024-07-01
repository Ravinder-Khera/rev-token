import tokenAbi from "./abis/token.json";
import tokenSaleAbi from "./abis/tokenSale.json";

const testnetContracts = {
  paymentToken: {
    address: "0x8E43892e41FffD48365971a0039dC4C7c27965CC",
    abi: tokenAbi,
    decimals: 6,
  },
  platformToken: {
    address: "0x9aC9fB784ceaF67f68f2F91739b42A9148254eC2",
    abi: tokenAbi,
    decimals: 18,
  },
  tokenSale: {
    address: "0x4dfd3Ee4c8040fD2Bfc6a0aBCfAF40914e640d48",
    abi: tokenSaleAbi,
  },
};

const mainnetContracts = {
  paymentToken: {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    abi: tokenAbi,
    decimals: 6,
  },
  platformToken: {
    address: "0xcAb314A94f3381fC645a4773636fa7f489e1f652",
    abi: tokenAbi,
    decimals: 18,
  },
  tokenSale: {
    address: "0x5Fa40e45c78eb2606640aaa292C51d6715760624",
    abi: tokenSaleAbi,
  },
};

export const getContracts = () => {
  if (process.env.REACT_APP_NETWORK === "MAINNET") {
    return mainnetContracts;
  } else {
    return testnetContracts;
  }
};
