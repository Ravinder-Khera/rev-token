import tokenAbi from "./abis/token.json";
import tokenSaleAbi from "./abis/tokenSale.json";
 
const testnetContracts = {
  paymentToken: {
    address: "0x8E43892e41FffD48365971a0039dC4C7c27965CC",
    abi: tokenAbi,
    decimals: 6,
  },
  platformToken: {
    address: "0x68C673Bdaa4b3Bf4ABA5842B5c8e10c4C7c3a6b1",
    abi: tokenAbi,
    decimals: 18,
  },
  tokenSale: {
    address: "0xeE06f6ca8Ea7365f04B154c09fB3f86C42B30999",
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