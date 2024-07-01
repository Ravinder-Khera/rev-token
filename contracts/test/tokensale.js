import { expect, use } from "chai";

const runBeforeTest = async (mockCSX, mockUSDT, csxTokenSaleAddr, addr1) => {
  await mockCSX.transfer(
    csxTokenSaleAddr,
    ethers.utils.parseEther("100").toString(),
  );
  await mockUSDT.transfer(
    addr1.address,
    ethers.utils.parseEther("100").toString(),
  );
  let usdtCopyForAddr1 = await mockUSDT.connect(addr1);
  await usdtCopyForAddr1.approve(
    csxTokenSaleAddr,
    ethers.utils.parseEther("100"),
  );
};

const addStage = async (
  csxTokenSale,
  admin,
  maxToken,
  price,
  startTime,
  endTime,
  isActive,
) => {
  const csxTokenSaleMock = await csxTokenSale.connect(admin);
  await csxTokenSaleMock.addStage(
    maxToken?.toString(),
    price?.toString(),
    startTime,
    endTime,
    isActive,
  );
};

describe("MyUpgradeableContract", async function () {
  let csxTokenSale, mockCSX, mockUSDT, owner, admin, addr1;
  let startTime = Math.floor(Date.now() / 1000);
  let endTime = startTime + 120;
  beforeEach(async () => {
    [owner, admin, addr1] = await ethers.getSigners();
    const MockCSX = await ethers.getContractFactory("CentralisX");
    mockCSX = await MockCSX.deploy("1000000000000000000000", "CSX", "CSX");
    await mockCSX.deployed();
    // await mockCSX.initialize("1000000000000000000000", "CSX", "CSX")

    const MockUSDT = await ethers.getContractFactory("CentralisX");
    mockUSDT = await MockUSDT.deploy("1000000000000000000000", "USDT", "USDT");
    await mockUSDT.deployed();
    // await mockUSDT.initialize("1000000000000000000000", "USDT", "USDT")

    const CsxTokenSale = await ethers.getContractFactory("CXCTokenSale");
    csxTokenSale = await CsxTokenSale.deploy(
      mockUSDT.address,
      mockCSX.address,
      admin.address,
      admin.address,
    );
    await csxTokenSale.deployed();
    // await csxTokenSale.initialize(mockUSDT.address, mockCSX.address, admin.address, admin.address);
  });

  it("Should initialize contract correctly", async function () {
    await runBeforeTest(mockCSX, mockUSDT, csxTokenSale.address, addr1);
    expect((await mockCSX.balanceOf(csxTokenSale.address)).toString()).to.equal(
      ethers.utils.parseEther("100").toString(),
    );
    expect((await mockUSDT.balanceOf(addr1.address)).toString()).to.equal(
      ethers.utils.parseEther("100").toString(),
    );
    expect(await csxTokenSale.paymentToken()).to.equal(mockUSDT.address);
    expect(await csxTokenSale.tokenBeingSold()).to.equal(mockCSX.address);
    expect(await csxTokenSale.admin()).to.equal(admin.address);
  });

  describe("Adding Stages", function () {
    it("Should add a new stage correctly", async function () {
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );

      expect((await csxTokenSale.currentStage())?.toString()).to.equal("1");
      const stageInfo = await csxTokenSale.stageInfo(1);
      expect(stageInfo.maxTokensForStage?.toString()).to.equal(
        ethers.utils.parseEther("50").toString(),
      );
      expect(stageInfo.totalTokensSold?.toString()).to.equal("0");
      expect(stageInfo.price?.toString()).to.equal(
        ethers.utils.parseEther("0.2").toString(),
      );
      expect(stageInfo.startTime?.toString()).to.equal(startTime?.toString());
      expect(stageInfo.endTime?.toString()).to.equal(endTime?.toString());
    });

    it("Should allow user to buy token for stage 1", async function () {
      await runBeforeTest(mockCSX, mockUSDT, csxTokenSale.address, addr1);
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );
      let tokenPriceForStage = "0.2";
      let tokensToBePurchased = "0.5";

      let csxTokenSaleMock = await csxTokenSale.connect(addr1);
      let balanceCsxBefore = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtBefore = await mockUSDT.balanceOf(addr1.address);

      await csxTokenSaleMock.buyTokens(
        ethers.utils.parseEther(tokensToBePurchased),
      ); // buy 0.5 csx, need to pay 0.5*0.2 = 0.1 usdt

      let balanceCsxAfter = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtAfter = await mockUSDT.balanceOf(addr1.address);

      const stageInfo = await csxTokenSale.stageInfo(1);
      const userInfo = await csxTokenSale.userInfo(addr1.address);
      let usdtToBeSpent =
        (ethers.utils.parseEther(tokenPriceForStage) *
          ethers.utils.parseEther(tokensToBePurchased)) /
        ethers.utils.parseEther("1");
      let usdtDeducted = (
        ethers.BigNumber.from(balanceUsdtBefore?.toString()) -
        ethers.BigNumber.from(balanceUsdtAfter?.toString())
      )?.toString();

      console.log(
        "userInfo?.toString()",
        userInfo?.toString() ==
          ethers.utils.parseEther(tokensToBePurchased)?.toString(),
      );
      expect(userInfo?.toString()).to.equal(
        ethers.utils.parseEther(tokensToBePurchased)?.toString(),
      );
      expect(
        parseFloat(balanceCsxAfter) - parseFloat(balanceCsxBefore),
      ).to.equal(parseFloat(tokensToBePurchased));
      expect(parseFloat(usdtDeducted)).to.equal(parseFloat(usdtToBeSpent));
      expect(stageInfo.totalTokensSold?.toString()).to.equal(
        ethers.utils.parseEther(tokensToBePurchased)?.toString(),
      );
    });

    it("Should allow adding next stage without making it active and allow user to buy token from stage 1 price", async function () {
      await runBeforeTest(mockCSX, mockUSDT, csxTokenSale.address, addr1);
      let tokenPriceForStage = "0.6";
      let tokensToBePurchased = "0.5";
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther(tokenPriceForStage),
        startTime,
        endTime,
        false,
      );
      let currentStage = (await csxTokenSale.currentStage())?.toString();

      let csxTokenSaleMock = await csxTokenSale.connect(addr1);
      let balanceCsxBefore = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtBefore = await mockUSDT.balanceOf(addr1.address);

      await csxTokenSaleMock.buyTokens(
        ethers.utils.parseEther(tokensToBePurchased),
      ); // buy 0.5 csx, need to pay 0.5*0.2 = 0.1 usdt

      let balanceCsxAfter = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtAfter = await mockUSDT.balanceOf(addr1.address);

      const stageInfo = await csxTokenSale.stageInfo(1);

      let usdtToBeSpent =
        (stageInfo.price * ethers.utils.parseEther(tokensToBePurchased)) /
        ethers.utils.parseEther("1");
      let usdtDeducted = (
        ethers.BigNumber.from(balanceUsdtBefore?.toString()) -
        ethers.BigNumber.from(balanceUsdtAfter?.toString())
      )?.toString();
      expect(currentStage).to.equal("1");
      expect(
        parseFloat(balanceCsxAfter) - parseFloat(balanceCsxBefore),
      ).to.equal(parseFloat(tokensToBePurchased));
      expect(parseFloat(usdtDeducted)).to.equal(parseFloat(usdtToBeSpent));
      expect(ethers.utils.formatEther(stageInfo.totalTokensSold)).to.equal(
        tokensToBePurchased,
      );
    });

    it("Should allow adding next stage and making it active and allow user to buy token from next stage", async function () {
      await runBeforeTest(mockCSX, mockUSDT, csxTokenSale.address, addr1);
      let tokenPriceForStage = "0.6";
      let tokensToBePurchased = "0.5";
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther(tokenPriceForStage),
        startTime,
        endTime,
        true,
      );
      let currentStage = (await csxTokenSale.currentStage())?.toString();

      let csxTokenSaleMock = await csxTokenSale.connect(addr1);
      let balanceCsxBefore = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtBefore = await mockUSDT.balanceOf(addr1.address);

      await csxTokenSaleMock.buyTokens(
        ethers.utils.parseEther(tokensToBePurchased),
      ); // buy 0.5 csx, need to pay 0.5*0.2 = 0.1 usdt

      let balanceCsxAfter = ethers.utils.formatEther(
        await mockCSX.balanceOf(addr1.address),
      );
      let balanceUsdtAfter = await mockUSDT.balanceOf(addr1.address);

      const stageInfo = await csxTokenSale.stageInfo(2);

      let usdtToBeSpent =
        (stageInfo.price * ethers.utils.parseEther(tokensToBePurchased)) /
        ethers.utils.parseEther("1");
      let usdtDeducted = (
        ethers.BigNumber.from(balanceUsdtBefore?.toString()) -
        ethers.BigNumber.from(balanceUsdtAfter?.toString())
      )?.toString();
      expect(currentStage).to.equal("2");
      expect(
        parseFloat(balanceCsxAfter) - parseFloat(balanceCsxBefore),
      ).to.equal(parseFloat(tokensToBePurchased));
      expect(parseFloat(usdtDeducted)).to.equal(parseFloat(usdtToBeSpent));
      expect(ethers.utils.formatEther(stageInfo.totalTokensSold)).to.equal(
        tokensToBePurchased,
      );
    });

    it("Should allow changing stage", async function () {
      let mockCsxTokenSale = await csxTokenSale.connect(admin);
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.5"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.7"),
        startTime,
        endTime,
        true,
      );
      await mockCsxTokenSale.startStage(1);
      let currentStage = (await csxTokenSale.currentStage())?.toString();
      expect(currentStage).to.equal("1");
    });

    it("Should not allow activating already expired stage", async function () {
      let mockCsxTokenSale = await csxTokenSale.connect(admin);
      endTime = startTime;
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );

      endTime = startTime + 120;
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.6"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.8"),
        startTime,
        endTime,
        true,
      );
      try {
        await mockCsxTokenSale.startStage(1);
      } catch (err) {
        expect(err?.toString()?.includes("Stage has expired")).to.equal(true);
      }
    });

    it("Should allow disabling stage", async function () {
      let mockCsxTokenSale = await csxTokenSale.connect(admin);
      endTime = startTime + 1;
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );

      endTime = startTime + 120;
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.6"),
        startTime,
        endTime,
        true,
      );
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.8"),
        startTime,
        endTime,
        true,
      );
      await mockCsxTokenSale.disableSale();
      let currentStage = (await csxTokenSale.currentStage())?.toString();
      expect(currentStage).to.equal("0");
    });

    it("Should allow updating existing stage and should update expiry and allow starting the stage by admin", async function () {
      let mockCsxTokenSale = await csxTokenSale.connect(admin);
      endTime = startTime + 1;
      await addStage(
        csxTokenSale,
        admin,
        ethers.utils.parseEther("50"),
        ethers.utils.parseEther("0.2"),
        startTime,
        endTime,
        true,
      );
      let toggleRes;
      try {
        await mockCsxTokenSale.startStage(1);
        toggleRes = "Passed";
      } catch (err) {
        toggleRes = err?.toString();
      }
      expect(toggleRes?.includes("Stage has expired")).to.equal(true);
      endTime = startTime + 120;
      await mockCsxTokenSale.updateStage(
        1,
        ethers.utils.parseEther("60"),
        ethers.utils.parseEther("0.8"),
        startTime,
        endTime,
      );

      try {
        await mockCsxTokenSale.startStage(1);
        toggleRes = "Passed";
      } catch (err) {
        toggleRes = err?.toString();
      }
      expect(toggleRes?.includes("Passed")).to.equal(true);
      const stageInfo = await csxTokenSale.stageInfo(1);
      expect(stageInfo.price?.toString()).to.equal(
        ethers.utils.parseEther("0.8")?.toString(),
      );
      expect(stageInfo.maxTokensForStage?.toString()).to.equal(
        ethers.utils.parseEther("60")?.toString(),
      );
      expect(stageInfo.startTime?.toString()).to.equal(startTime?.toString());
      expect(stageInfo.endTime?.toString()).to.equal(endTime?.toString());
    });
  });
});
