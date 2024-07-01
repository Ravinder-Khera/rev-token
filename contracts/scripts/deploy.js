const { ethers, upgrades } = require("hardhat");
let tokensToBeMinted = "1000000000000000000000000000000";
let name = "Centralis X";
let symbol = "CSX";

async function main() {
  // // DEPLOY CSX
  // const CSXToken = await ethers.getContractFactory("CentralisX");
  // const proxyCsx = await CSXToken.deploy(tokensToBeMinted, name, symbol);
  // await proxyCsx.deployed();
  // console.log("MyContract deployed to:", proxyCsx.address);
  // // const proxyCsx = await upgrades.deployProxy(CSXToken, [tokensToBeMinted, name, symbol], { initializer: 'initialize' });
  // // await proxyCsx.deployed();

  // // DEPLOY USDT
  // name = "USDT"
  // symbol = "USDT"
  // const UsdtToken = await ethers.getContractFactory("USDT");
  // // const proxyUsdt = await upgrades.deployProxy(UsdtToken, [tokensToBeMinted, name, symbol], { initializer: 'initialize' });
  // // await proxyUsdt.deployed();
  // const proxyUsdt = await UsdtToken.deploy(tokensToBeMinted);
  // await proxyUsdt.deployed();

  // console.log("MyContract deployed to:", proxyCsx.address);
  // // DEPLOY TOKENSALE
  // let _paymentToken = proxyUsdt.address
  // let _tokenBeingSold = proxyCsx.address
  let _admin = "0x2D86290D009f2ad72062d7C25aF1602c3bE18189";
  let _receiver = "0x2D86290D009f2ad72062d7C25aF1602c3bE18189";
  // const CXCTokenSale = await ethers.getContractFactory("CXCTokenSale");
  // const proxy = await CXCTokenSale.deploy(_paymentToken, _tokenBeingSold, _admin, _receiver);

  // // const proxy = await upgrades.deployProxy(CXCTokenSale, [_paymentToken, _tokenBeingSold, _admin, _receiver], { initializer: 'initialize' });
  // await proxy.deployed();

  // console.log(proxy.address);

  await hre.run("verify:verify", {
    address: "0x2DBc42084532228A1224Cb613242F78A19000c4a",
    constructorArguments: [tokensToBeMinted],
  });

  // await hre.run("verify:verify", {
  //     address: proxyUsdt.address,
  //     constructorArguments: [tokensToBeMinted],
  // });

  // await hre.run("verify:verify", {
  //     address: proxy.address,
  //     constructorArguments: [_paymentToken, _tokenBeingSold, _admin, _receiver],
  // });

  // console.table({ "csx": proxyCsx.address, "usdt": proxyUsdt.address, "tokensale": proxy.address })

  // // AFTER DEPLOYMENT TASKS
  // let amountToTransfer = "1000000000000000000000000"
  // await proxyCsx.transfer(proxy.address, amountToTransfer);
  // console.log(`Transferred ${amountToTransfer.toString()} CSX tokens to ${proxy.address}`);

  // await proxyUsdt.transfer(_admin, amountToTransfer);
  // console.log(`Transferred ${amountToTransfer.toString()} USDT tokens to ${_admin}`);
}

main();
