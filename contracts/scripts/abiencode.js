const { ethers } = require("hardhat");

async function main() {
  // Encode parameters
  const data = ethers.utils.defaultAbiCoder.encode(
    ["string", "address", "address", "address", "address"],
    [
      "initialize(address,address,address,address)",
      "0x0ee5d9ca18971c75ffb70427894de47778ae1706",
      "0x0ee5d9ca18971c75ffb70427894de47778ae1706",
      "0x0ee5d9ca18971c75ffb70427894de47778ae1706",
      "0x0ee5d9ca18971c75ffb70427894de47778ae1706",
    ],
  );

  console.log("Encoded data:", data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
