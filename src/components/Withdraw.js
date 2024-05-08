import React, { useEffect, useState } from "react";
import "../assets/style/deposit.scss";
import "../assets/style/withdraw.scss";
import { Form, Image, Spinner } from "react-bootstrap";
import { Usdt, Usdc, Dai, Ethereum } from "react-web3-icons";
import { MdOutlineSecurity } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import Web3 from "web3";
import hyprIcn from "../assets/images/hypr.svg";

import jbc from "../assets/images/jbc.png";
import erc20 from "../assets/images/erc20.png";

import flokiIcn from "../assets/images/floki.png";
import beamIcn from "../assets/images/beam.png";
import yggIcn from "../assets/images/ygg.svg";
import {
  useAccount,
  useConnect,
  useNetwork,
  useSwitchNetwork,
  useBalance,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { IoMdWallet } from "react-icons/io";
import { HiSwitchHorizontal } from "react-icons/hi";
import metamask from "../assets/images/metamask.svg";
import TabMenu from "./TabMenu";
const optimismSDK = require("@eth-optimism/sdk");
const ethers = require("ethers");
const Withdraw = () => {
  const [ethValue, setEthValue] = useState("");
  const [sendToken, setSendToken] = useState("ETH");
  const [errorInput, setErrorInput] = useState("");
  const [checkMetaMask, setCheckMetaMask] = useState("");
  const [loader, setLoader] = useState(false);
  const { address, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
  const { connect } = useConnect({
    connector: new InjectedConnector({ chains }),
    onError(error) {
      console.log("Error", error);
    },
    onMutate(args) {
      console.log("Mutate", args);
      if (args.connector.ready === true) {
        setCheckMetaMask(false);
      } else {
        setCheckMetaMask(true);
      }
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
    onSuccess(data) {
      console.log("Success", data);
    },
  });
  const [metaMastError, setMetaMaskError] = useState("");
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
    // throwForSwitchChainNotSupported: true,
    chainId: process.env.REACT_APP_L2_CHAIN_ID,
    onError(error) {
      console.log("Error", error);
    },
    onMutate(args) {
      console.log("Mutate", args);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
      try {
        window.ethereum
          .request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: process.env.REACT_APP_L2_CHAIN_ID_WITH_HEX,
                rpcUrls: [process.env.REACT_APP_L2_RPC_URL],
                chainName: process.env.REACT_APP_L2_NETWORK_NAME,
                nativeCurrency: {
                  name: "ETHEREUM",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: [process.env.REACT_APP_L2_EXPLORER_URL],
              },
            ],
          })
          .then((data) => {
            setMetaMaskError("");
          })
          .catch((err) => {
            if (err.code === -32002) {
              setMetaMaskError("Request stuck in pending state");
            }
          });
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess(data) {
      console.log("Success", data);
    },
  });
  //========================================================== BALANCES =======================================================================

  const { data } = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    watch: true,
  });
  const dataUSDT = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_USDT,
    watch: true,
  });
  const dataHYPR = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_HYPR,
    watch: true,
  });
  const dataFLOKI = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_FLOKI,
    watch: true,
  });
  const dataYGG = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_YGG,
    watch: true,
  });
  const dataBEAM = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_BEAM,
    watch: true,
  });
  const dataUSDC = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_USDC,
    watch: true,
  });
  const dataDAI = useBalance({
    address: address,
    chainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
    token: process.env.REACT_APP_L2_DAI,
    watch: true,
  });

  ////========================================================== WITHDRAW =======================================================================

  const handleWithdraw = async () => {
    try {
      if (!ethValue) {
        setErrorInput("Please enter the amount");
      } else {
        if (!parseFloat(ethValue) > 0) {
          setErrorInput("Invalid Amount Entered!");
        } else {
          setErrorInput("");
          const l1Url = process.env.REACT_APP_L1_RPC_URL;
          const l1Provider = new ethers.providers.JsonRpcProvider(l1Url, "any");
          const l2Provider = new ethers.providers.Web3Provider(window.ethereum);
          const l1Signer = l1Provider.getSigner(address);
          const l2Signer = l2Provider.getSigner(address);
          const zeroAddr = "0x".padEnd(42, "0");
          const l1Contracts = {
            StateCommitmentChain: zeroAddr,
            CanonicalTransactionChain: zeroAddr,
            BondManager: zeroAddr,
            AddressManager: process.env.REACT_APP_LIB_ADDRESSMANAGER,
            L1CrossDomainMessenger:
              process.env.REACT_APP_PROXY_OVM_L1CROSSDOMAINMESSENGER,
            L1StandardBridge: process.env.REACT_APP_PROXY_OVM_L1STANDARDBRIDGE,
            OptimismPortal: process.env.REACT_APP_OPTIMISM_PORTAL_PROXY,
            L2OutputOracle: process.env.REACT_APP_L2_OUTPUTORACLE_PROXY,
          };
          const bridges = {
            Standard: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: "0x4200000000000000000000000000000000000010",
              Adapter: optimismSDK.StandardBridgeAdapter,
            },
            ETH: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: "0x4200000000000000000000000000000000000010",
              Adapter: optimismSDK.ETHBridgeAdapter,
            },
          };
          const crossChainMessenger = new optimismSDK.CrossChainMessenger({
            contracts: {
              l1: l1Contracts,
            },
            bridges: bridges,
            l1ChainId: Number(process.env.REACT_APP_L1_CHAIN_ID),
            l2ChainId: Number(process.env.REACT_APP_L2_CHAIN_ID),
            l1SignerOrProvider: l1Signer,
            l2SignerOrProvider: l2Signer,
            bedrock: true,
          });
          //-------------------------------------------------------- SEND TOKEN VALUE -----------------------------------------------------------------

          try {
            if (sendToken == "ETH") {
              const weiValue = parseInt(
                ethers.utils.parseEther(ethValue)._hex,
                16,
              );
              setLoader(true);
              
              // Withdraw ERC-20 token from L2 to L1
              const response = await crossChainMessenger.withdrawERC20(
                "0x110648bc41CC74229a296C77c10e48742D6Db6EE", // L1 token address
                "0xe8Cc4515799792E91EaE08184Cd33b45c6685Cc8", // L2 token address
                weiValue.toString(),
              );
              const logs = await response.wait();
              if (logs) {
                setLoader(false);
                setEthValue("");
              }
            }
            
            

            if (sendToken == "ERC-20") { // USDT = ERC-20
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);

            // Connect Layer 2
            const l2Provider = new ethers.providers.Web3Provider(window.ethereum);
            const l2Signer = l2Provider.getSigner();
          
            // Contract instance ERC-20 token on Layer 1
            const usdtContract = new ethers.Contract(
              process.env.REACT_APP_L2_USDT, // ERC-20 Token contract address on Layer 1
              ['function approve(address spender, uint256 amount) returns (bool)'],
              l2Signer
            );
            
            // Token ERC-20 approve Layer 1 to contract on Layer 2
            const approvalTx = await usdtContract.approve(
              process.env.REACT_APP_L2_BRIDGE, // L2 contract address for deposit
              assetValue
            );
            await approvalTx.wait();
          
            // Check if approval is less than assetValue
            if (approvalTx && approvalTx.value < assetValue) {
              // Contract instance on Layer 2
              const l2Contract = new ethers.Contract(
                process.env.REACT_APP_L2_BRIDGE, // Contract address on Layer 2
                ['function withdraw(address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'], // Function signature
                l2Signer
             );
              // withdraw
              const _l2Token = process.env.REACT_APP_L2_USDT; // amount
              const _amount = assetValue; // amount
              const _minGasLimit = 3000000; // gas limit (fix - 3000000 (90% +))
              const _extraData = ethers.utils.hexlify('0x'); // data (fix - 0=+)
            
              // Write depositERC20Transaction
              const depositTx = await l2Contract.withdraw(_l2Token, _amount, _minGasLimit, _extraData);
              await depositTx.wait();
            }
          
            // Loader & ethValue 
            setLoader(false);
            setEthValue("");
          }


            if (sendToken == "USDC") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_USDC,
                process.env.REACT_APP_L2_USDC,
                assetValue,
              );
              var receiptUSDC = await depositTxn2.wait();
              if (receiptUSDC) {
                setLoader(false);
                setEthValue("");
              }
            }
            if (sendToken == "DAI") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_DAI,
                process.env.REACT_APP_L2_DAI,
                assetValue,
              );
              var receiptDAI = await depositTxn2.wait();
              if (receiptDAI) {
                setLoader(false);
                setEthValue("");
              }
            }
            if (sendToken == "HYPR") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_HYPR,
                process.env.REACT_APP_L2_HYPR,
                assetValue,
              );
              var receiptHYPR = await depositTxn2.wait();
              if (receiptHYPR) {
                setLoader(false);
                setEthValue("");
              }
            }
            if (sendToken == "FLOKI") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_FLOKI,
                process.env.REACT_APP_L2_FLOKI,
                assetValue,
              );
              var receiptFLOKI = await depositTxn2.wait();
              if (receiptFLOKI) {
                setLoader(false);
                setEthValue("");
              }
            }
            if (sendToken == "YGG") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_YGG,
                process.env.REACT_APP_L2_YGG,
                assetValue,
              );
              var receiptYGG = await depositTxn2.wait();
              if (receiptYGG) {
                setLoader(false);
                setEthValue("");
              }
            }
            if (sendToken == "BEAM") {
              var assetValue = Web3.utils.toWei(ethValue, "ether");
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(
                process.env.REACT_APP_L1_BEAM,
                process.env.REACT_APP_L2_BEAM,
                assetValue,
              );
              var receiptBEAM = await depositTxn2.wait();
              if (receiptBEAM) {
                setLoader(false);
                setEthValue("");
              }
            }
            //-------------------------------------------------------- SEND TOKEN VALUE END-----------------------------------------------------------------
          } catch (error) {
            setLoader(false);
            console.log({ error }, 98);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitch = () => {
    try {
      switchNetwork(process.env.REACT_APP_L2_CHAIN_ID);
    } catch (error) {
      console.log(error);
    }
  };
  ////========================================================== HANDLE CHANGE =======================================================================

  const handleChange = (e) => {
    if (sendToken == "ETH") {
      if (data?.formatted < e.target.value) {
        setErrorInput("Insufficient ETH balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "ERC-20") {
      if (dataUSDT.data?.formatted < e.target.value) {
        setErrorInput("Insufficient HYPR balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "HYPR") {
      if (dataHYPR.data?.formatted < e.target.value) {
        setErrorInput("Insufficient HYPR balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "FLOKI") {
      if (dataFLOKI.data?.formatted < e.target.value) {
        setErrorInput("Insufficient FLOKI balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "YGG") {
      if (dataFLOKI.data?.formatted < e.target.value) {
        setErrorInput("Insufficient YGG balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "BEAM") {
      if (dataBEAM.data?.formatted < e.target.value) {
        setErrorInput("Insufficient BEAM balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "USDC") {
      if (dataUSDC.data?.formatted < e.target.value) {
        setErrorInput("Insufficient USDC balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "DAI") {
      if (dataUSDC.data?.formatted < e.target.value) {
        setErrorInput("Insufficient DAI balance.");
      } else {
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
  };
  return (
    <>
      <div className="bridge_wrap">
        <TabMenu />
        <section className="deposit_wrap">
          <div className="withdraw_title_wrap">
            <div className="withdraw_title_icn">
              <MdOutlineSecurity />
            </div>
            <div className="withdraw_title_content">
              <h3>Important instructions for Withdrawals</h3>
              <p>
                OP Stack withdrawals usually take <strong>7 days</strong> to
                complete.
              </p>
              <p>Please follow these instruction carefully:</p>
              <br />
              <p>1. Enter amount bellow and sign tx with Metamask</p>
              <p>
                2. Go to "View Withdrawals" and find your tx (Up to 30 minutes
                later)
              </p>
              <p>3. Once confirmed, press the "Prove" button</p>
              <p>4. Wait for 7-day challenge period</p>
              <p>5. After 7 days, press the "Claim" button to complete tx</p>
              <br />
              <p>
                Learn more about{" "}
                <a
                  href="https://community.optimism.io/docs/developers/bridge/messaging/#understanding-the-challenge-period"
                  target="_blank"
                  style={{ color: "white" }}
                >
                  OP Stack withdrawals
                </a>
              </p>
            </div>
          </div>
          <div className="deposit_price_wrap">
            <div className="deposit_price_title">
              <p>From</p>
              <h5>
                {/* <Image src={hyprIcn} alt="To icn" fluid /> Hypr */}
                <Image src={jbc} alt="To icn" fluid /> Hera testnet L2 #1
              </h5>
            </div>
            <div className="deposit_input_wrap">
              <Form>
                <div className="deposit_inner_input">
                  <Form.Control
                    type="number"
                    name="eth_value"
                    value={ethValue}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                  <Form.Select
                    aria-label="Default select example"
                    className="select_wrap"
                    onChange={({ target }) => setSendToken(target.value)}
                  >
                    <option>ETH</option>
                    {/* <option>HYPR</option> */}
                    <option>ERC-20</option>
                    {/* <option>USDC</option>
                    <option>DAI</option>
                    <option>FLOKI</option>
                    <option>BEAM</option>
                    <option>YGG</option> */}
                  </Form.Select>
                </div>
                <div className="input_icn_wrap">
                  {sendToken === "ETH" ? (
                    <span className="input_icn">
                      <Ethereum style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken === "ERC-20" ? (
                    <span className="input_icn">
                      {/* <Usdt style={{ fontSize: "1.5rem" }} /> */}
                      <Image
                        src={erc20}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  ) : sendToken === "USDC" ? (
                    <span className="input_icn">
                      <Usdc style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken === "DAI" ? (
                    <span className="input_icn">
                      <Dai style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken === "HYPR" ? (
                    <span className="input_icn">
                      <Image
                        src={hyprIcn}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  ) : sendToken === "FLOKI" ? (
                    <span className="input_icn">
                      <Image
                        src={flokiIcn}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  ) : sendToken === "YGG" ? (
                    <span className="input_icn">
                      <Image
                        src={yggIcn}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  ) : sendToken === "BEAM" ? (
                    <span className="input_icn">
                      <Image
                        src={beamIcn}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  ) : (
                    <span className="input_icn">
                      <Image
                        src={hyprIcn}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                    </span>
                  )}
                </div>
              </Form>
            </div>
            {errorInput && <small className="text-danger">{errorInput}</small>}
            {sendToken === "ETH" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(data?.formatted).toFixed(5)} ETH
                </p>
              )
            ) : sendToken == "ERC-20" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataUSDT.data?.formatted).toFixed(5)} ERC-20
                </p>
              )
            ) : sendToken == "USDC" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataUSDC.data?.formatted).toFixed(5)} USDC
                </p>
              )
            ) : sendToken == "DAI" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataDAI.data?.formatted).toFixed(5)} DAI
                </p>
              )
            ) : sendToken === "HYPR" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataHYPR.data?.formatted).toFixed(5)} HYPR
                </p>
              )
            ) : sendToken === "FLOKI" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataFLOKI.data?.formatted).toFixed(5)} FLOKI
                </p>
              )
            ) : sendToken === "YGG" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataYGG.data?.formatted).toFixed(5)} YGG
                </p>
              )
            ) : sendToken === "BEAM" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance: {Number(dataBEAM.data?.formatted).toFixed(5)} BEAM
                </p>
              )
            ) : (
              <p className="wallet_bal mt-2">
                Balance: {Number(dataUSDC.data?.formatted).toFixed(5)} USDC
              </p>
            )}
          </div>
          <div className="deposit_details_wrap">
            <div className="deposit_details">
              <p>To:</p>
              <h5>
                {/* <FaEthereum /> Ethereum */}
                <Image src={jbc} alt="To icn" fluid /> Jibchain Testnet
              </h5>
            </div>
            <div className="withdraw_bal_sum">
              {sendToken == "ETH" ? (
                <span className="input_icn">
                  <Ethereum style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "ERC-20" ? (
                <span className="input_icn">
                  {/* <Usdt style={{ fontSize: "1.5rem" }} /> */}
                  <Image
                        src={erc20}
                        style={{ width: "20px" }}
                        alt="To icn"
                        fluid
                      />
                </span>
              ) : sendToken == "USDC" ? (
                <span className="input_icn">
                  <Usdc style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "DAI" ? (
                <span className="input_icn">
                  <Dai style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "HYPR" ? (
                <span className="input_icn">
                  <Image src={hyprIcn} alt="To icn" width="20" fluid />
                </span>
              ) : sendToken == "FLOKI" ? (
                <span className="input_icn">
                  <Image src={flokiIcn} alt="To icn" width="20" fluid />
                </span>
              ) : sendToken == "YGG" ? (
                <span className="input_icn">
                  <Image src={yggIcn} alt="To icn" width="20" fluid />
                </span>
              ) : sendToken == "BEAM" ? (
                <span className="input_icn">
                  <Image src={beamIcn} alt="To icn" width="20" fluid />
                </span>
              ) : (
                <span className="input_icn">
                  <Usdc style={{ fontSize: "1.5rem" }} />
                </span>
              )}
              <p>
                You’ll receive: {ethValue ? ethValue : "0"} {sendToken}
              </p>
              <div></div>
              {/* <span className='input_title'>ETH</span> */}
            </div>
          </div>
          <div className="deposit_btn_wrap">
            {checkMetaMask === true ? (
              <a
                className="btn deposit_btn"
                href="https://metamask.io/"
                target="_blank"
              >
                <Image src={metamask} alt="metamask icn" fluid /> Please Install
                Metamask Wallet
              </a>
            ) : !isConnected ? (
              <button className="btn deposit_btn" onClick={() => connect()}>
                <IoMdWallet />
                Connect Wallet
              </button>
            ) : chain.id !== Number(process.env.REACT_APP_L2_CHAIN_ID) ? (
              <button className="btn deposit_btn" onClick={handleSwitch}>
                <HiSwitchHorizontal />
                Switch to Network
              </button>
            ) : (
              <button
                className="btn deposit_btn"
                onClick={handleWithdraw}
                disabled={loader ? true : false}
              >
                {loader ? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  "Withdraw"
                )}
              </button>
            )}
          </div>
          {metaMastError && (
            <small className="d-block text-danger text-center mt-2">
              {metaMastError}
            </small>
          )}
        </section>
      </div>
    </>
  );
};

export default Withdraw;
