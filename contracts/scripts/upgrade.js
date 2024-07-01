const { ethers, upgrades } = require("hardhat");

async function main() {
  // const proxyAddress = "0x13Bf193123892B9b1120C7Cda3972243976B08FD"; // Specify the address of your existing proxy contract
  // const newImplementation = await ethers.getContractFactory("DecubateMasterChefV4");

  // // Upgrade the proxy contract
  // const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, newImplementation);
  // console.log("Proxy contract upgraded:", upgradedProxy.address);

  await hre.run("verify:verify", {
    address: "0xec189aa2f2068f4a620d7f24f2c2c34a3165c17e",
    constructorArguments: [], // Since this is a proxy, there might not be any args to verify.
  });
  console.log("verified contract");
}

main();
