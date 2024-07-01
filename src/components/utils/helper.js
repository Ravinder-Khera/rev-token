import { ethers } from "ethers";
import { getContracts } from "./contracts";
import { config } from "../../App";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { toast } from "react-toastify";

let contracts = getContracts();

export const convertToEth = (amount) => {
  try {
    return ethers.formatEther(amount?.toString())?.toString();
  } catch (err) {
    console.log("error", err);
    return "0";
  }
};

export const usdtDecimals = async () => {
  try {
    let contract = await getContractInstance(
      contracts?.paymentToken?.address,
      contracts?.paymentToken?.abi,
    );
    console.log("contract", contract);
    let decimals = await contract.decimals();
    return decimals?.toString();
  } catch (err) {
    console.log("error", err);
    return "1";
  }
};

export const convertUsdtToSmallUnit = (amount) => {
  let decimals = contracts["paymentToken"].decimals;
  return (Number(amount) * 10 ** Number(decimals))?.toString();
};

export const convertUsdtToNormalUnit = (amount) => {
  let decimals = contracts["paymentToken"].decimals;
  return (Number(amount) / 10 ** Number(decimals))?.toString();
};

export const convertToWei = (amount) => {
  try {
    return ethers.parseEther(amount?.toString())?.toString();
  } catch (err) {
    console.log("error", err);
    return "0";
  }
};

export const getCurrentProvider = (web3Provider) => {
  if (localStorage.getItem("centralisX-connected-provider") === "walletConnect")
    return web3Provider?.provider;
  else if (localStorage.getItem("centralisX-connected-provider") === "metamask")
    return window.ethereum;
  else return null;
};

export const getContractInstance = async (contractAddress, abi) => {
  try {
    let instance = null;
    const rpc = getWorkingRpcUrl();
    let provider = new ethers.JsonRpcProvider(rpc);
    instance = new ethers.Contract(contractAddress, abi, provider);
    return instance;
  } catch (err) {
    console.log("error", err);
    return null;
  }
};

const getWorkingRpcUrl = () => {
  try {
    return process.env.REACT_APP_RPC_URL_1;
  } catch (err) {
    console.log("error", err);
    return null;
  }
};

export const getStageInfo = async () => {
  try {
    let contract = await getContractInstance(
      contracts?.tokenSale?.address,
      contracts?.tokenSale?.abi,
    );
    console.log("contract", contract);
    let result = {
      stage: 0,
      maxTokensForStage: "0",
      price: "0",
      totalTokensSold: "0",
      startTime: 0,
      endTime: 0,
    };
    let currentActiveStage = await contract.currentStage();
    if (currentActiveStage?.toString() !== "0") {
      let stageInfo = await contract.stageInfo(currentActiveStage?.toString());
      console.log("stageInfo", stageInfo);
      result["stage"] = Number(currentActiveStage);
      result["maxTokensForStage"] = stageInfo.maxTokensForStage?.toString();
      result["price"] = stageInfo.price?.toString();
      result["totalTokensSold"] = stageInfo.totalTokensSold?.toString();
      result["startTime"] = Number(stageInfo.startTime) * 1000;
      result["endTime"] = Number(stageInfo.endTime) * 1000;
      let decimals = await usdtDecimals();
      result["amountReceived"] = (
        (ethers.toBigInt(stageInfo.totalTokensSold?.toString()) *
          ethers.toBigInt(stageInfo.price?.toString())) /
        ethers.toBigInt((10 ** Number(decimals))?.toString())
      )?.toString();
      result["totalAmountToBeReceived"] =
        (ethers.toBigInt(stageInfo.maxTokensForStage?.toString()) *
          ethers.toBigInt(stageInfo.price?.toString())) /
        ethers.toBigInt((10 ** Number(decimals))?.toString());
    }
    console.log("stage", result);
    return result;
  } catch (err) {
    console.log("error", err);
    return null;
  }
};

async function waitForTransactionAndLogReceipt(transactionHash) {
  try {
    const provider = new ethers.JsonRpcProvider(getWorkingRpcUrl());

    // Wait for the transaction to be mined
    const transactionReceipt = await provider.waitForTransaction(
      transactionHash,
      1,
      60000,
    ); // 1 confirmation, 60 seconds timeout
    console.log("Transaction confirmed", transactionReceipt);
    return transactionReceipt;
  } catch (error) {
    console.error("Transaction failed", error);
  }
}

export const buyTokens = async (amount) => {
  try {
    console.log("buy");
    const data = await writeContract(config, {
      address: contracts?.tokenSale?.address,
      abi: contracts?.tokenSale?.abi,
      functionName: "buyTokens",
      args: [convertToWei(amount ?? 0)?.toString()],
    });
    console.log("res", data);
    let res = await waitForTransactionAndLogReceipt(data);
    // const res = await waitForTransactionReceipt(config, {
    //     hash: data,
    // });

    console.log("res", res);
    if (res.status === 1) {
      // alert("Token purchased Successfully");
      toast.info("Token purchased Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log("error", e);
    const detailsIndex = e?.message.indexOf("Details:");
    let detailsPart = e?.message.substring(detailsIndex);
    detailsPart = detailsPart.replace("Version: viem@2.10.2", "");
    detailsPart = detailsPart.replace("Details:", "");
    toast.error(detailsPart, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
    return false;
  }
};

export const checkPaymentTokenAllowance = async (account, amount, price) => {
  try {
    console.log("check allowance", account);
    let contract = await getContractInstance(
      contracts?.paymentToken?.address,
      contracts?.paymentToken?.abi,
    );
    console.log("contract", contract);
    let allowance = await contract.allowance(
      account,
      contracts?.tokenSale?.address,
    );
    console.log(
      "allowance",
      allowance?.toString(),
      (ethers.toBigInt(convertToWei(amount ?? 0)) * ethers.toBigInt(price)) /
        ethers.parseEther("1"),
    );
    if (
      ethers.toBigInt(allowance?.toString()) >=
      (ethers.toBigInt(convertToWei(amount ?? 0)) * ethers.toBigInt(price)) /
        ethers.parseEther("1")
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log("error", err);
    return false;
  }
};

export const getPaymentTokenBalance = async (account, amount, price) => {
  try {
    let contract = await getContractInstance(
      contracts?.paymentToken?.address,
      contracts?.paymentToken?.abi,
    );
    console.log("contract", contract);
    let balance = await contract.balanceOf(account);
    let am = (
      (ethers.toBigInt(convertToWei(amount ?? 0)) * ethers.toBigInt(price)) /
      ethers.parseEther("1")
    )?.toString();

    let requiredBal = convertUsdtToNormalUnit(am?.toString());
    let converted = convertUsdtToNormalUnit(balance?.toString());

    if (
      ethers?.toBigInt(am?.toString()) > ethers.toBigInt(balance?.toString())
    ) {
      return { bal: converted, requiredBal: requiredBal, balRes: false };
    }
    return true;
  } catch (err) {
    console.log("error", err);
    return false;
  }
};

export const approvePaymentToken = async (amount, price) => {
  try {
    console.log("approve token");
    const data = await writeContract(config, {
      address: contracts?.paymentToken?.address,
      abi: contracts?.paymentToken?.abi,
      functionName: "approve",
      args: [
        contracts?.tokenSale?.address,
        (
          (ethers.toBigInt(convertToWei(amount ?? 0)) *
            ethers.toBigInt(price)) /
          ethers.parseEther("1")
        )?.toString(),
      ],
    });
    console.log("data", data);

    // const res = await waitForTransactionReceipt(config, {
    //     hash: data,
    // });
    let res = await waitForTransactionAndLogReceipt(data);
    console.log("res", res);
    if (res.status === 1) {
      // alert("token buy Successfully");
      toast.info("Token Approved Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log("error", e);
    const detailsIndex = e?.message.indexOf("Details:");
    let detailsPart = e?.message.substring(detailsIndex);
    detailsPart = detailsPart.replace("Version: viem@2.10.2", "");
    detailsPart = detailsPart.replace("Details:", "");
    // alert(detailsPart)
    toast.error(detailsPart, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
    return false;
  }
};
