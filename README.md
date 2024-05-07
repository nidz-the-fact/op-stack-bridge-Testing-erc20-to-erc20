# UI: OP Stack Bridge (ERC20 > ERC20)

The `op-Bridge` is a service for op-stack chains which provides a functional UI for the Bridging between L1 and L2.
cc.https://github.com/HyprNetwork/op-stack-bridge, from: https://www.hypr.network/

## Installation

Clone this repo

```
# Install [node](https://nodejs.org/en) v.18.18+
yarn
or
npm install
```

## Running the service

New file named `.env`, then set the environment variables listed there.

Once your environment variables or flags have been set, run the service via:

```
yarn start
or
npm run start
```

## How to set up deployment

# 1. Adjust the following address - .env
```
REACT_APP_OPTIMISM_PORTAL_PROXY=xxx

REACT_APP_LIB_ADDRESSMANAGER=xxx
REACT_APP_PROXY_OVM_L1CROSSDOMAINMESSENGER=xxx
REACT_APP_PROXY_OVM_L1STANDARDBRIDGE=xxx
REACT_APP_L2_OUTPUTORACLE_PROXY=xx

REACT_APP_L1_CHAIN_ID=88991
REACT_APP_L1_RPC_URL=https://rpc.testnet.jibchain.net
REACT_APP_L1_EXPLORER_URL=https://exp.testnet.jibchain.net

REACT_APP_L2_CHAIN_ID=7001
REACT_APP_L2_RPC_URL=https://rpc.hera.jbcha.in
REACT_APP_L2_EXPLORER_URL=https://www.hera.jbcha.in
REACT_APP_L2_CHAIN_ID_WITH_HEX=0x1b59
REACT_APP_L2_NETWORK_NAME=HeraTestnet
REACT_APP_L2_BRIDGE=0x4200000000000000000000000000000000000010

# Istance - erc20
REACT_APP_L1_USDT=xxx
REACT_APP_L2_USDT=xxx
```
Note: OptimismPortalProxy (REACT_APP_OPTIMISM_PORTAL_PROXY) is Key L1 to L2 bridging.

# 2. Adjust the network you want. - src\index.js
```
export const JibchainTestnet = {
  id: Number(process.env.REACT_APP_L1_CHAIN_ID),
  name: "JibchainTestnet",
  network: "tJBC",
  iconUrl: "https://",
  iconBackground: "#000000",
  nativeCurrency: {
    decimals: 18,
    name: "ETHEREUM",
    symbol: "tJBC",
  },
  rpcUrls: {
    default: {
      http: [process.env.REACT_APP_L1_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: process.env.REACT_APP_L1_EXPLORER_URL,
    },
  },
  testnet: true,
};
```
# 2.1
```
const { chains, publicClient } = configureChains(
  // currentChain, RACE],
  [JibchainTestnet, HeraTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ],
);
```

# 3. Adjust or change functions according to use. (OptimismPortalProxy) - src\components\Deposit.js
```
          if (sendToken === "ERC-20") { // USDT = ERC-20
            var assetValue = Web3.utils.toWei(ethValue, "ether");
            setLoader(true);

            const approve = await crossChainMessenger.approval(
              process.env.REACT_APP_L1_USDT,
              process.env.REACT_APP_L2_USDT,
            );
            if (approve < assetValue) {
              var depositTxn2 = await crossChainMessenger.approveERC20(
                process.env.REACT_APP_L1_USDT,
                process.env.REACT_APP_L2_USDT,
                assetValue,
              );
              await depositTxn2.wait();
            }

            var receiptUSDT = await crossChainMessenger.depositERC20(
              process.env.REACT_APP_L1_USDT,
              process.env.REACT_APP_L2_USDT,
              assetValue,
            );
            var getReceiptUSDT = await receiptUSDT.wait();
            if (getReceiptUSDT) {
              setLoader(false);
              setEthValue("");
            }
          }
```
Note: For example, you might change the function call ['function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'] (or function depositERC20Transaction...) from OptimismPortalProxy 👇
# 3.1
```
          if (sendToken === "ERC-20") { // USDT - L2Gas
            var assetValue = Web3.utils.toWei(ethValue, "ether");
            setLoader(true);
          
            // Connect Layer 1
            const l1Provider = new ethers.providers.Web3Provider(window.ethereum);
            const l1Signer = l1Provider.getSigner();
          
            // Contract instance ERC-20 token on Layer 1
            const usdtContract = new ethers.Contract(
              process.env.REACT_APP_L1_USDT, // ERC-20 Token contract address on Layer 1
              ['function approve(address spender, uint256 amount) returns (bool)'],
              l1Signer
            );
            
            // Token ERC-20 approve Layer 1 to contract on Layer 2
            const approvalTx = await usdtContract.approve(
              process.env.REACT_APP_OPTIMISM_PORTAL_PROXY, // L2 contract address for deposit
              assetValue
            );
            await approvalTx.wait();
          
            // Check if approval is less than assetValue
            if (approvalTx && approvalTx.value < assetValue) {
              // Contract instance on Layer 2
              const l2Contract = new ethers.Contract(
                process.env.REACT_APP_OPTIMISM_PORTAL_PROXY, // Contract address on Layer 2
                ['function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'], // Function signature for depositERC20Transaction
                l1Signer
             );
              // depositERC20Transaction
              const _l1Token = process.env.REACT_APP_L1_USDT; // address
              const _l2Token = process.env.REACT_APP_L2_USDT; // amount
              const _amount = assetValue; // amount
              const _minGasLimit = 3000000; // gas limit (fix - 3000000 (90% +))
              const _extraData = ethers.utils.hexlify('0x'); // data (fix - 0=+)
            
              // Write depositERC20Transaction
              const depositTx = await l2Contract.depositERC20(_l1Token, _l2Token, _amount, _minGasLimit, _extraData);
              await depositTx.wait();
            }
          
            // Loader & ethValue 
            setLoader(false);
            setEthValue("");
          }
```

# 4. Adjust or change functions according to use. (OptimismPortalProxy) - src\components\Withdraw.js
```
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
```
Note: For example, you might change the function call ['function withdraw(address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'] (or function other...) from OptimismPortalProxy 👇
```
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
```

# 5. Adjust the withdrawal page to display information by adjusting **if (chain.id !== 88991)** Chain ID L1 - src\components\account\WithdrawAccount.js
```
# ln 191, Col 24
  useEffect(() => {
    if (isConnected) { 
      if (chain.id !== 88991) { // edit
        switchNetwork(process.env.REACT_APP_L1_CHAIN_ID);
      } else {
        getWithdraw();
      }
    }
  }, [chain, address]);
```

# 6. Adjust the network you want. - src\components\common\Header.js
```
# Example
    } else if (chain?.id == 88991) {
      setNetwork("Jibchain Testnet");
```

# 7. Test and build
```
# Build: yarn build
You will get the build file and upload it to the website.
```


## Note: We have closed the deposit information page. because it is not yet available for ERC20 > Native (But you can still enable for ERC20 > ERC20.)
```
# src\components\account\Account.js
```


## What this service does

The `op-bridge` uses the @eth-optimism/sdk https://sdk.optimism.io/ to provide the bridgining functionality by using CrossChainMessenger. It provides the Deposit and withdraw functionality.
