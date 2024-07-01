import React, { useEffect, useState } from "react";
import RevGif from "../assets/REV3MJ-ezgif1-ezgif.com-crop.gif" 
import { ReactComponent as TwitterLogo } from "../assets/twitterRev.svg";
import { ReactComponent as USDTLogo } from "../assets/usdt 1 (traced).svg";
import Countdown from "react-countdown";
import {
  BxlLinkedin,
  IcBaselineTelegram,
  MaterialSymbolsInfoOutline,
  MdiYoutube,
  MingcuteSocialXLine,
  RiInstagramFill,
  TelegramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "../assets/svg";
import {
  checkPaymentTokenAllowance,
  convertToEth,
  getStageInfo,
  approvePaymentToken,
  buyTokens,
  convertToWei,
  convertUsdtToNormalUnit,
  getPaymentTokenBalance,
} from "./utils/helper";
import { useAccount } from "wagmi";
import { Watch } from "react-loader-spinner";
import { toast } from "react-toastify";
import { ConnectBtn } from "./connectButton";
import { getContracts } from "./utils/contracts";

function Token() {
  const [stageInfo, setStageInfo] = useState();
  const [btnName, setBtnName] = useState("Proceed To Buy");
  const [amount, setAmount] = useState("0");
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoader, setDataLoader] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState(null);

  const [time, setTime] = useState(0);
  const [usdtFontSize, setUsdtFontSize] = useState(24);
  const [timeLabel, setTimeLabel] = useState("ends");
  const [convertedPrice, setConvertedPrice] = useState(null);
  let acc = useAccount();
  let contracts = getContracts();

  function removeTrailingZeros(num) {
    // Convert the number to a string
    let str = num.toString();
    // Use a regular expression to remove trailing zeros
    str = str.replace(/(\.\d*?[1-9])0+$/g, "$1"); // Removes trailing zeros
    // Use another regular expression to remove the decimal point if it's the last character
    str = str.replace(/\.0*$/, "");
    return Number(str);
  }

  const addTokenToWallet = async () => {
    if (isClicked) {
      return;
    }
    setIsClicked(true);
    const tokenAddress = contracts.platformToken.address;
    const tokenSymbol = "CXC";
    const tokenDecimals = 18;
    const tokenImage = "https://path-to-token-image.com/token.png";

    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        setIsClicked(false);
        console.log("Token added to wallet!");
      } else {
        setIsClicked(false);
        console.log("Token not added to wallet.");
      }
    } catch (error) {
      setIsClicked(false);
      console.error("Error adding token to wallet:", error);
    }
  };

  useEffect(() => {
    if (acc?.address != null) {
      setAddress(acc?.address);
    }
  }, [acc]);

  const getActiveStageInfo = async () => {
    let info = await getStageInfo();
    console.log("info", info, Date.now());
    setStageInfo(info);
    if (
      info?.stage === 0 ||
      (info?.startTime && info?.startTime > Date.now())
    ) {
      setBtnName("No Active Sale");
    }
    if (info?.startTime && info?.startTime > Date.now()) {
      setTime(info?.startTime);
      setTimeLabel("starts");
    } else {
      setTime(info?.endTime);
      setTimeLabel("ends");
    }

    let _convertedPrice = await convertUsdtToNormalUnit(info?.price);
    setConvertedPrice(_convertedPrice);
    return info;
  };

  // const getCorrespondingUsdt = async (amount, price) => {
  //   try {
  //     console.log("amount", amount);
  //     if (amount === 0) {
  //       setUsdtAmount(0);
  //     } else if (amount?.trim() === "" || amount === null) {
  //       setUsdtAmount("");
  //     } else {
  //       let usdt =
  //         parseFloat(amount?.toString()) *
  //         parseFloat(await convertUsdtToNormalUnit(price?.toString()));
  //       console.log("usdt", usdt);
  //       setUsdtAmount(usdt?.toString());
  //     }
  //   } catch (err) {
  //     console.log("error", err);
  //     return false;
  //   }
  // };

  const getCorrespondingCxc = (amount1, price) => {
    try {
      if (usdtAmount === 0) {
        setAmount("0");
      } else if (amount1?.trim() === "" || amount1 === undefined) {
        // Change null to undefined
        setAmount("0"); // Set amount to null when amount1 is empty or undefined
        return; // Return from the function after setting amount to null
      } else {
        let cxc =
          parseFloat(amount1?.toString()) /
          parseFloat(convertUsdtToNormalUnit(price?.toString()));
        if (isNaN(cxc)) {
          setAmount("0");
        } else {
          setAmount(cxc?.toString());
        }
      }
    } catch (err) {
      console.log("error", err);
      return false;
    }
  };

  const isEmpty = (value) => {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === "string") {
      return value.trim() === "";
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === "object" && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  };

  const formatNumberWithCommas = (value) => {
    if (isEmpty(value)) {
      return "";
    } else {
      let hasDecimal = "";
      if (typeof value === "number") {
        value = value.toString(); // Convert number to string
      }
      if (typeof value === "string") {
        const decimalIndex = value.indexOf(".");
        if (decimalIndex !== -1) {
          hasDecimal = value.substring(decimalIndex); // Save the decimal part
          value = value.substring(0, decimalIndex); // Remove the decimal part for processing
        }
        value = parseFloat(value.replace(/,/g, "")); // Remove existing commas and parse as float
      }
      if (isNaN(value)) {
        return "";
      }
      if (hasDecimal) {
        const decimalPart = hasDecimal.substring(1); // Remove the leading dot
        if (decimalPart.length > 3) {
          hasDecimal = "." + decimalPart.substring(0, 3);
        }
      }
      let returnValue =
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value) + hasDecimal;
      return returnValue;
    }
  };

  const handleBuyBtnClickAction = async () => {
    setLoading(true);
    if (amount === 0 || amount === null || amount === "0") {
      toast.error("Zero amount not allowed", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setLoading(false);
      return;
    }
    let { bal, requiredBal, balRes } = await getPaymentTokenBalance(
      address,
      amount,
      stageInfo?.price,
    );
    if (balRes === false) {
      toast.error(
        `Insufficient USDT, You have ${bal} balance but needed is ${requiredBal}`,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        },
      );
      setLoading(false);
      return;
    }
    let hasApproval = await checkPaymentTokenAllowance(
      address,
      amount,
      stageInfo?.price,
    );
    console.log("hasApproval", hasApproval);
    if (!hasApproval) {
      setBtnName("Approving...");
      let res = await approvePaymentToken(amount, stageInfo?.price);

      if (res === false) {
        setUsdtAmount("");
        setAmount("0");
        setBtnName("Proceed to Buy");
        setLoading(false);
        return;
      }
      setBtnName("Purchasing...");
      setTimeout(async () => {
        res = await buyTokens(amount);
        if (res === false) {
          setUsdtAmount("");
          setAmount("0");
          setBtnName("Proceed to Buy");
          setLoading(false);

          return;
        }
        setUsdtAmount("");
        setAmount("0");
        setBtnName("Proceed to Buy");
        await getActiveStageInfo();
        setLoading(false);
      }, 1000);
    } else {
      setBtnName("Purchasing..");
      let res = await buyTokens(amount);
      if (res === false) {
        setBtnName("Proceed to Buy");
        setLoading(false);
        setUsdtAmount("");
        setAmount("0");
        return;
      }

      await getActiveStageInfo();
      setAmount(0);
      setBtnName("Proceed to Buy");
      setUsdtAmount(0);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getActiveStageInfo();

      setLoading(false);
    };
    fetch();
  }, []);

  const Completionist = () => <span className="text-white">Sale Ended!</span>;

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    const addLeadingZero = (value) => {
      return value < 10 ? `0${value}` : value;
    };
    if (completed) {
      if (stageInfo?.startTime && stageInfo?.startTime > Date.now()) {
        setTime(stageInfo?.startTime);
        setTimeLabel("starts");
      } else if (stageInfo?.endTime && stageInfo?.endTime < Date.now()) {
        setBtnName("No Active Sale");
        return <Completionist />;
      } else {
        setTime(stageInfo?.endTime);
        setTimeLabel("ends");
      }
    } else {
      days = addLeadingZero(days);
      hours = addLeadingZero(hours);
      minutes = addLeadingZero(minutes);
      seconds = addLeadingZero(seconds);
      return (
        <>
          <div className="countdown">
            <div className="timeStamp">
              {days}:<span>Days</span>
            </div>
            <div className="timeStamp">
              {hours}:<span>Hours</span>
            </div>
            <div className="timeStamp">
              {minutes}:<span>Mins</span>
            </div>
            <div className="timeStamp">
              {seconds}
              <span>Secs</span>
            </div>
          </div>
        </>
      );
    }
  };

  useEffect(() => {
    if (
      usdtAmount &&
      usdtAmount.toString().length >= 6 &&
      usdtAmount.toString().length <= 10
    ) {
      let amountLength = usdtAmount.toString().length;
      setUsdtFontSize(26 - amountLength);
    } else if (usdtAmount && usdtAmount.toString().length >= 5) {
      setUsdtFontSize(22);
    }
  }, [usdtAmount]);

  return (
    <div
      className="customContainer tokenContainer"
      style={{ padding: "30px 0" }}
    >
      {loading && (
        <div className="loaderDiv">
          <Watch
            visible={true}
            height="80"
            width="80"
            radius="48"
            color="#49C3FB"
            ariaLabel="watch-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <p>{btnName !== "Proceed To Buy" && btnName}</p>
        </div>
      )}
      <div className="customFlex">
        <div className="tokenContentInfo">
          <div className="mainHeading">
            <h2>Token Presale</h2>
            <div className="headingShadow"><span>Token Presale</span></div>
          </div>
          <div className="d-flex flex-column align-items-start" style={{gap:'36px'}}>
            <p>Buy in before Token Price increases</p>
            <div className="socialIcons">
              <a href="/#" target="_blank"><TelegramIcon /></a>
              <a href="/#" target="_blank"><YoutubeIcon /></a>
              <a href="/#" target="_blank"><TwitterLogo /></a>
            </div>
          </div>
        </div>
        <div className="tokenCard">
          <div className="tokenBox ">
            <div className="tokenLogo">
              <div className="tokenLogoImg"></div>
              {/* <img src={RevGif} alt="REV" className="img-fluid" /> */}
            </div>
            <div className="tokenStage">
              <div className="tokenStageName">
                Stage{" "}
                {stageInfo && stageInfo.stage ? Number(stageInfo.stage) - 1 : "-"}
              </div>
              <div
                className="tokenBoxBg"
                style={{ padding: "0 10px 10px 15px", marginTop: "12px" }}
              >
                <div className="barBox">
                  <div className="text-start">
                    <h3 className="heading">Token Price</h3>
                    <div className="amount">
                      $
                      {stageInfo && convertedPrice
                        ? removeTrailingZeros(Number(convertedPrice).toFixed(3))
                        : "-"}
                    </div>
                  </div>
                  <div className="text-start">
                    <h3 className="heading">Amount Received</h3>
                    <div className="amount">
                      $
                      {stageInfo && convertToEth(stageInfo.amountReceived)
                        ? removeTrailingZeros(
                            Number(convertToEth(stageInfo.amountReceived)).toFixed(
                              2,
                            ),
                          )
                        : "-"}
                      /$
                      {stageInfo && convertToEth(stageInfo.totalAmountToBeReceived)
                        ? removeTrailingZeros(
                            Number(
                              convertToEth(stageInfo.totalAmountToBeReceived),
                            ).toFixed(2),
                          )
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="progressBar">
                  <div
                    className="progressAmount"
                    style={{
                      width: `${(parseFloat(convertToEth(stageInfo?.amountReceived ?? 0)) / parseFloat(convertToEth(stageInfo?.totalAmountToBeReceived ?? 1))) * 100}%`,
                    }}
                  >
                    <div
                      className="percentage"
                      style={{
                        left:
                          removeTrailingZeros(
                            Number(
                              (
                                (parseFloat(
                                  convertToEth(stageInfo?.amountReceived ?? 0),
                                ) /
                                  parseFloat(
                                    convertToEth(
                                      stageInfo?.totalAmountToBeReceived ?? 1,
                                    ),
                                  )) *
                                100
                              ).toFixed(3),
                            ),
                          ) < 85
                            ? "100%"
                            : "auto",
                        right:
                          removeTrailingZeros(
                            Number(
                              (
                                (parseFloat(
                                  convertToEth(stageInfo?.amountReceived ?? 0),
                                ) /
                                  parseFloat(
                                    convertToEth(
                                      stageInfo?.totalAmountToBeReceived ?? 1,
                                    ),
                                  )) *
                                100
                              ).toFixed(3),
                            ),
                          ) < 85
                            ? "auto"
                            : "0%",
                      }}
                    >
                      {removeTrailingZeros(
                        Number(
                          (parseFloat(
                            convertToEth(stageInfo?.amountReceived ?? 0),
                          ) /
                            parseFloat(
                              convertToEth(stageInfo?.totalAmountToBeReceived ?? 1),
                            )) *
                            100,
                        ).toFixed(3),
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="tokenBoxBg"
                style={{ padding: "22px 10px", marginTop: "20px" }}
              >
                <div className="countDownDiv">
                  {time ? (
                    <div>
                      <h3 className="heading">
                        {" "}
                        {stageInfo && stageInfo.stage
                          ? time > Date.now()
                            ? "Stage " + (Number(stageInfo.stage) - 1)
                            : ""
                          : "-"}{" "}
                        {time > Date.now() ? timeLabel + " in" : ""}{" "}
                      </h3>
                      <Countdown date={time} renderer={renderer} />
                    </div>
                  ) : (
                    <div className="text-white">No Active Sale</div>
                  )}
                </div>
              </div>
              <div
                className="d-flex flex-wrap align-items-center"
                style={{ gap: "7px", marginTop: "20px", marginBottom: "15px" }}
              >
                <span className="mobileAmount">
                  You will get{" "}
                  <b>
                    {formatNumberWithCommas(parseFloat(amount)?.toFixed(3))}
                    {/* {amount
                      ? removeTrailingZeros(Number(amount).toFixed(3))
                      : ""} */}
                  </b>{" "}
                  CXC{" "}
                </span>
                <div
                  className="tokenBoxBg w-100"
                  // style={{ maxWidth: "320px" }}
                >
                  <div className="tokenAmount">
                    <div className="tokenChainName barBox flex-nowrap">
                      <USDTLogo />
                      <div className="heading fw-bold" style={{ fontSize: "16px" }}>
                        {" "}
                        USDT
                      </div>
                    </div>
                    <div className="amountInputDiv">
                      <input
                        placeholder="Enter Amount"
                        type="text"
                        value={usdtAmount}
                        onChange={async (e) => {
                          let newValue = e.target.value;

                          // Remove any characters that are not digits or a single decimal point
                          newValue = newValue.replace(/[^0-9.]/g, "");
                          const decimalCount = (newValue.match(/\./g) || []).length;
                          if (decimalCount > 1) {
                            newValue = newValue.slice(0, -1);
                          } else if (decimalCount === 1) {
                            if (newValue.startsWith(".")) {
                              newValue = "0" + newValue;
                            }
                            // Split the newValue into integer and fractional parts
                            newValue = newValue.split(".");
                            let integerPart = newValue[0];
                            let fractionalPart = newValue[1];
                            // Limit the length of the integer part to 7 digits
                            if (integerPart.length > 7) {
                              integerPart = integerPart.slice(0, 7);
                            }

                            // Limit the length of the fractional part to 3 digits
                            if (fractionalPart.length > 3) {
                              fractionalPart = fractionalPart.slice(0, 3);
                            }
                            newValue = `${integerPart}.${fractionalPart}`;
                          } else if (decimalCount === 0) {
                            if (newValue.length > 7) {
                              newValue = newValue.slice(0, 7);
                            }
                          }

                          // Reconstruct the newValue

                          // Set the value and trigger the corresponding logic
                          if (
                            Number(newValue) <=
                            Number(
                              convertToEth(stageInfo?.totalAmountToBeReceived),
                            ) -
                              Number(convertToEth(stageInfo?.amountReceived))
                          ) {
                            setUsdtAmount(newValue);
                            getCorrespondingCxc(newValue, stageInfo?.price);
                          } else {
                            e.preventDefault();
                            toast.error(
                              `Tokens Left For Sale Are ${Number(convertToEth(stageInfo?.maxTokensForStage)) - Number(convertToEth(stageInfo?.totalTokensSold))}`,
                            );
                          }
                        }}
                        disabled={
                          btnName === null ||
                          address === null ||
                          loading === true ||
                          btnName === "No Active Sale" ||
                          Number(
                            convertToEth(stageInfo?.totalAmountToBeReceived),
                          ) === Number(convertToEth(stageInfo?.amountReceived))
                        }
                      />
                      <span>
                        You will get{" "}
                        <b>
                          {formatNumberWithCommas(
                            removeTrailingZeros(parseFloat(amount)?.toFixed(3)),
                          )}
                          {/* {amount
                            ? removeTrailingZeros(Number(amount).toFixed(3))
                            : ""} */}
                        </b>{" "}
                        CXC{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="addCXC" onClick={addTokenToWallet}>
                  <span>+</span>Add CXC to Wallet
                </p>
              </div>
            </div>
            <div
              className="tokenHeading d-flex flex-column align-items-center"
              style={{ gap: "16px" }}
            >
              {address !== null ? (
                <button
                  disabled={
                    btnName === null ||
                    address === null ||
                    Number(amount) === 0 ||
                    amount === null ||
                    amount === "0" ||
                    amount === "" ||
                    loading === true ||
                    btnName === "No Active Sale" ||
                    dataLoader === true
                  }
                  className="colorBtn w-100"
                  onClick={async () => {
                    handleBuyBtnClickAction();
                  }}
                >
                  {dataLoader ? "loading.." : btnName}
                </button>
              ) : (
                <ConnectBtn />
              )}
              <div style={{ display: "inline-block" }}>
                <a
                  className="linkClass"
                  target="blank"
                  href="https://global.transak.com/"
                >
                  Add Funds
                </a>
                <div className="customTooltip mx-1">
                  <MaterialSymbolsInfoOutline />
                  <span className="tooltipText">
                    Conveniently purchase ETH and USDT with a credit card via
                    Transak
                  </span>
                </div>
              </div>
            </div>
            <div className="tokenStage">
              <div className="tokenStageName" style={{fontSize:'14px',marginTop:'27px'}}>
                Disclaimer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Token;
