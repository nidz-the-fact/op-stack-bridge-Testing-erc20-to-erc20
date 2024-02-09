import React, { useState, useEffect } from 'react';
import "../assets/style/deposit.scss";
import { Form, Spinner, Image } from "react-bootstrap"
import { Usdt, Usdc , Ethereum, Dai } from 'react-web3-icons';
import hyprIcn from "../assets/images/hypr.svg"
import flokiIcn from "../assets/images/floki.png"
import beamIcn from "../assets/images/beam.png"
import yggIcn from "../assets/images/ygg.svg"
import { IoMdWallet } from "react-icons/io"
import { FaEthereum } from "react-icons/fa"
import { useAccount, useConnect, useNetwork, useSwitchNetwork, useBalance, useToken, useContractRead } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import TabMenu from './TabMenu';
import { HiSwitchHorizontal } from "react-icons/hi"
import metamask from "../assets/images/metamask.svg"
import Web3 from 'web3';
const optimismSDK = require("@eth-optimism/sdk")
const ethers = require("ethers")

const readAllowance = (tokenAddr, holderAddr) => {
  const token = useContractRead({
    address: tokenAddr,
    abi: ["function allowance(address,address) view returns (uint256)"],
    functionName: "allowance",
    args: [holderAddr, "0x1bBde518ad01BaABFE30020407A7630FB17B545d"],
  })

  return token;
}

const Deposit = () => {
    const [ethValue, setEthValue] = useState("")
    const [sendToken, setSendToken] = useState("ETH")
    const { data: accountData, address, isConnected } = useAccount()
    const [errorInput, setErrorInput] = useState("")
    const [loader, setLoader] = useState(false)
    const { chain, chains } = useNetwork()
    const [checkMetaMask, setCheckMetaMask] = useState("");

    const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
        connector: new InjectedConnector({ chains }), onError(error) {
            console.log('Error', error)
        },
        onMutate(args) {
            console.log('Mutate', args)
            if (args.connector.ready === true) {
                setCheckMetaMask(false)
            } else {
                setCheckMetaMask(true)
            }
        },
        onSettled(data, error) {
            console.log('Settled', { data, error })
        },
        onSuccess(data) {
            console.log('Success', data)
        },
    })
    const { switchNetwork } = useSwitchNetwork({
        throwForSwitchChainNotSupported: true,
        onError(error) {
            console.log('Error', error)
        },
        onMutate(args) {
            console.log('Mutate', args)
        },
        onSettled(data, error) {
            console.log('Settled', { data, error })
        },
        onSuccess(data) {
            console.log('Success', data)
        },
    })


    const { data } = useBalance({ address: address, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)})


    const dataUSDT = useBalance({ address: address, token: process.env.REACT_APP_L1_USDT, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID) })
    const dataHYPR = useBalance({ address: address, token: process.env.REACT_APP_L1_HYPR, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })
    const dataUSDC = useBalance({ address: address, token: process.env.REACT_APP_L1_USDC, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })
    const dataDAI = useBalance({ address: address, token: process.env.REACT_APP_L1_DAI, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })
    const dataFLOKI = useBalance({ address: address, token: process.env.REACT_APP_L1_FLOKI, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })
    const dataYGG = useBalance({ address: address, token: process.env.REACT_APP_L1_YGG, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })
    const dataBEAM = useBalance({ address: address, token: process.env.REACT_APP_L1_BEAM, watch: true, chainId: Number(process.env.REACT_APP_L1_CHAIN_ID)  })

    const handleSwitch = () => {
        switchNetwork(process.env.REACT_APP_L1_CHAIN_ID)
    }


    const handleDeposit = async () => {
        try {
            if (!ethValue) {
                setErrorInput("Please enter the amount");
            }
            else {
                if (!parseFloat(ethValue) > 0) {
                    setErrorInput("Invalid Amount Entered!");
                } else {

                    const l2Url = process.env.REACT_APP_L2_RPC_URL;
                    const l1Provider = new ethers.providers.Web3Provider(window.ethereum);
                    const l2Provider = new ethers.providers.JsonRpcProvider(l2Url, 'any')
                    const l1Signer = l1Provider.getSigner(address)
                    const l2Signer = l2Provider.getSigner(address)
                    const zeroAddr = "0x".padEnd(42, "0");
                    const l1Contracts = {
                        StateCommitmentChain: zeroAddr,
                        CanonicalTransactionChain: zeroAddr,
                        BondManager: zeroAddr,
                        AddressManager: process.env.REACT_APP_LIB_ADDRESSMANAGER,
                        L1CrossDomainMessenger: process.env.REACT_APP_PROXY_OVM_L1CROSSDOMAINMESSENGER,
                        L1StandardBridge: process.env.REACT_APP_PROXY_OVM_L1STANDARDBRIDGE,
                        OptimismPortal: process.env.REACT_APP_OPTIMISM_PORTAL_PROXY,
                        L2OutputOracle: process.env.REACT_APP_L2_OUTPUTORACLE_PROXY,
                    }
                    const bridges = {
                        Standard: {
                            l1Bridge: l1Contracts.L1StandardBridge,
                            l2Bridge: process.env.REACT_APP_L2_BRIDGE,
                            Adapter: optimismSDK.StandardBridgeAdapter
                        },
                        ETH: {
                            l1Bridge: l1Contracts.L1StandardBridge,
                            l2Bridge: process.env.REACT_APP_L2_BRIDGE,
                            Adapter: optimismSDK.ETHBridgeAdapter
                        }
                    }
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
                    })
                    if (sendToken === "ETH") {
                        console.log(sendToken);
                        const weiValue = parseInt(ethers.utils.parseEther(ethValue)._hex, 16)
                        setLoader(true);
                        var depositETHEREUM = await crossChainMessenger.depositETH(weiValue.toString())
                        const receiptETH = await depositETHEREUM.wait()
                        if (receiptETH) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "USDT") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);


                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_USDT, process.env.REACT_APP_L2_USDT, assetValue)
                        await depositTxn2.wait()
                        var receiptUSDT = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_USDT, process.env.REACT_APP_L2_USDT, assetValue)
                        var getReceiptUSDT = await receiptUSDT.wait()
                        if (getReceiptUSDT) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "USDC") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_USDC, process.env.REACT_APP_L2_USDC, assetValue)
                        await depositTxn2.wait()
                        var receiptUSDC = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_USDC, process.env.REACT_APP_L2_USDC, assetValue)
                        var getReceiptUSDC = await receiptUSDC.wait()
                        if (getReceiptUSDC) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "DAI") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_DAI, process.env.REACT_APP_L2_DAI, assetValue)
                        await depositTxn2.wait()
                        var receiptDAI = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_DAI, process.env.REACT_APP_L2_DAI, assetValue)
                        var getReceiptDAI = await receiptDAI.wait()
                        if (getReceiptDAI) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "HYPR") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_HYPR, process.env.REACT_APP_L2_HYPR, assetValue)
                        await depositTxn2.wait()
                        var receiptHYPR = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_HYPR, process.env.REACT_APP_L2_HYPR, assetValue)
                        var getReceiptHYPR = await receiptHYPR.wait()
                        if (getReceiptHYPR) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "FLOKI") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_FLOKI, process.env.REACT_APP_L2_FLOKI, assetValue)
                        await depositTxn2.wait()
                        var receiptFLOKI = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_FLOKI, process.env.REACT_APP_L2_FLOKI, assetValue)
                        var getReceiptFLOKI = await receiptFLOKI.wait()
                        if (getReceiptFLOKI) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "YGG") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_YGG, process.env.REACT_APP_L2_YGG, assetValue)
                        await depositTxn2.wait()
                        var receiptYGG = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_YGG, process.env.REACT_APP_L2_YGG, assetValue)
                        var getReceiptYGG = await receiptYGG.wait()
                        if (getReceiptYGG) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "BEAM") {
                        var assetValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.REACT_APP_L1_BEAM, process.env.REACT_APP_L2_BEAM, assetValue)
                        await depositTxn2.wait()
                        var receiptBEAM = await crossChainMessenger.depositERC20( process.env.REACT_APP_L1_BEAM, process.env.REACT_APP_L2_BEAM, assetValue)
                        var getReceiptBEAM = await receiptBEAM.wait()
                        if (getReceiptBEAM) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error)
            setLoader(false);
        }
    }
    
    const handleChange = (e) => {
        if (sendToken == 'ETH') {
            if (data?.formatted < e.target.value) {
                setErrorInput("Insufficient ETH balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'HYPR') {
            if (dataHYPR.data?.formatted < e.target.value) {
                setErrorInput("Insufficient HYPR balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'FLOKI') {
            if (dataFLOKI.data?.formatted < e.target.value) {
                setErrorInput("Insufficient FLOKI balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'YGG') {
            if (dataYGG.data?.formatted < e.target.value) {
                setErrorInput("Insufficient YGG balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'BEAM') {
            if (dataBEAM.data?.formatted < e.target.value) {
                setErrorInput("Insufficient BEAM balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'USDT') {
            if (dataUSDT.data?.formatted < e.target.value) {
                setErrorInput("Insufficient USDT balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'USDC') {
            if (dataUSDC.data?.formatted < e.target.value) {
                setErrorInput("Insufficient USDC balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'DAI') {
            if (dataUSDC.data?.formatted < e.target.value) {
                setErrorInput("Insufficient DAI balance.")
            } else {
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }

    }

    return (
        <>
            <div className='bridge_wrap'>
                <TabMenu />
                <section className='deposit_wrap'>
                    <div className='deposit_price_wrap'>
                        <div className='deposit_price_title'>
                            <p>From</p>
                            <h5><FaEthereum /> Ethereum</h5>
                        </div>
                        <div className='deposit_input_wrap'>
                            <Form>
                                <div className='deposit_inner_input'>
                                    <Form.Control type='number' value={ethValue} onChange={handleChange} placeholder="0" min="0" step="any" />
                                    <Form.Select aria-label="Default select example" className='select_wrap' onChange={({ target }) => setSendToken(target.value)}>
                                        <option>ETH</option>
                                        <option>HYPR</option>
                                        <option>USDT</option>
                                        <option>USDC</option>
                                        <option>DAI</option>
                                        <option>FLOKI</option>
                                        <option>BEAM</option>
                                        <option>YGG</option>
                                    </Form.Select>
                                </div>
                                <div className='input_icn_wrap'>
                                    {sendToken == "ETH" ? <span className='input_icn'><Ethereum style={{ fontSize: '1.5rem' }}/></span> : 
                                    sendToken == "USDT" ? <span className='input_icn'><Usdt style={{ fontSize: '1.5rem' }}/></span> : 
                                    sendToken == "USDC" ? <span className='input_icn'><Usdc style={{ fontSize: '1.5rem' }}/></span> : 
                                    sendToken == "DAI" ? <span className='input_icn'><Dai style={{ fontSize: '1.5rem' }}/></span> : 
                                    sendToken == "HYPR" ? <span className='input_icn'><Image src={hyprIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                                    sendToken == "FLOKI" ? <span className='input_icn'><Image src={flokiIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                                    sendToken == "YGG" ? <span className='input_icn'><Image src={yggIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                                    sendToken == "BEAM" ? <span className='input_icn'><Image src={beamIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                                    <span className='input_icn'><Usdc style={{ fontSize: '1.5rem' }}/></span>}
                                </div>
                            </Form>
                        </div>
                        {errorInput && <small className='text-danger'>{errorInput}</small>}
                        {sendToken == 'ETH' ? address && <p className='wallet_bal mt-2'>Balance: {Number(data?.formatted).toFixed(5)} ETH</p> : 
                        sendToken == 'USDT' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDT.data?.formatted).toFixed(5)} USDT</p> : 
                        sendToken == 'USDC' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDC.data?.formatted).toFixed(5)} USDC</p> : 
                        sendToken == 'DAI' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataDAI.data?.formatted).toFixed(5)} DAI</p> : 
                        sendToken == 'FLOKI' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataFLOKI.data?.formatted).toFixed(5)} FLOKI</p> : 
                        sendToken == 'YGG' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataYGG.data?.formatted).toFixed(5)} YGG</p> : 
                        sendToken == 'BEAM' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataBEAM.data?.formatted).toFixed(5)} BEAM</p> : 
                        sendToken == 'HYPR' ?  address && <p className='wallet_bal mt-2'>Balance: {Number(dataHYPR.data?.formatted).toFixed(5)} HYPR</p> : 
                        address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDC.data?.formatted).toFixed(5)} USDC</p>}

                    </div>
                    <div className='deposit_details_wrap'>
                        <div className="deposit_details">
                            <p>To</p>
                            <h5><Image src={hyprIcn} alt="To icn" fluid /> Hypr</h5>
                        </div>
                        <div className='deposit_inner_details'>
                            {sendToken == "ETH" ? <span className='input_icn'> <Ethereum style={{ fontSize: '1.5rem' }}/></span> : 
                            sendToken == "USDT" ? <span className='input_icn'> <Usdt style={{ fontSize: '1.5rem' }}/></span> : 
                            sendToken == "USDC" ? <span className='input_icn'> <Usdc style={{ fontSize: '1.5rem' }}/></span> : 
                            sendToken == "DAI" ? <span className='input_icn'> <Dai style={{ fontSize: '1.5rem' }}/></span> : 
                            sendToken == "HYPR" ? <span className='input_icn'><Image src={hyprIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                            sendToken == "FLOKI" ? <span className='input_icn'><Image src={flokiIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                            sendToken == "YGG" ? <span className='input_icn'><Image src={yggIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                            sendToken == "BEAM" ? <span className='input_icn'><Image src={beamIcn} style={{ width: '20px' }} alt="To icn" fluid /></span> : 
                            <span className='input_icn'> <Usdc style={{ fontSize: '1.5rem' }}/></span> }  
                            <p> You’ll receive: {ethValue ? ethValue : "0"} {sendToken}</p>
                        </div>
                    </div>
                    <div className="deposit_btn_wrap">
                        {checkMetaMask === true ? <a className='btn deposit_btn' href='https://metamask.io/' target='_blank'><Image src={metamask} alt="metamask icn" fluid /> Please Install Metamask Wallet</a> : !isConnected ? <button className='btn deposit_btn' onClick={() => connect()}><IoMdWallet />Connect Wallet</button> : chain.id !== Number(process.env.REACT_APP_L1_CHAIN_ID) ? <button className='btn deposit_btn' onClick={handleSwitch}><HiSwitchHorizontal />Switch to Ethereum</button> :
                            <button className='btn deposit_btn' onClick={handleDeposit} disabled={loader ? true : false}> {loader ? <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner> : "Deposit"} </button>}
                    </div>
                </section>
            </div>
        </>
    )
}

export default Deposit
