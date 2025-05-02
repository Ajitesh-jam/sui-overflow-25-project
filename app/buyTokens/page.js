"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import styles from "../styles/Home.module.css"
import { AllDefaultWallets, defineStashedWallet, WalletProvider } from "@suiet/wallet-kit"
import { fromHex } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import dotenv from "dotenv";
dotenv.config();

async function handleTransfer(recipient, amount) {
  
  try{
    console.log("env:", process.env.PVT_KEY);

    const PRIVATE_KEY = process.env.PVT_KEY ; // Replace with your actual private key
    if (!PRIVATE_KEY) {
      throw new Error("Private key is not set in environment variables.");
    }
    const GAS_BUDGET = 9000000000;

    const tx = new Transaction();
    const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));

   const client = new SuiClient({ url: getFullnodeUrl('devnet') });


    // Call smart contract function
    tx.moveCall({
      target: `0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::mint`,
      arguments: [
        tx.object("0x143e0dd84b5959da21f375b929427aedf5cbadc012e7ef8c357219493841b3e1"),
        tx.pure.u64(amount),
        tx.pure.address(recipient)
      ],
    });
    
    tx.setSender(keypair.getPublicKey().toSuiAddress());
    console.log("Setting sender address... : ", keypair.getPublicKey().toSuiAddress());
    tx.setGasBudget(GAS_BUDGET);
    tx.setGasPrice(1000000);


    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: await tx.build({ client }),
    });

    console.log('Transaction result:', result);
    return result;
  }
  catch (error) {
    console.error("Error in handleTransfer:", error);
    throw new Error("Transaction failed");
  }


}



export default function BuyTokens() {


  const CHAIN_NAME = 'sui';
  const SUI_RPC_URL = 'https://fullnode.devnet.sui.io:443';
  const [accounts, setAccounts] = useState(null);
  const [txHash, setTxHash] = useState(null);
  let [amt, setAmount] = useState(0);

  const request = async (method, params) => {
    const res = await fetch(SUI_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 0,
        jsonrpc: '2.0',
        method,
        params: params || [],
      }),
    });

    const { result } = await res.json();
    return result;
  };

  /*
    This is an example of a sui provider
    Production development should use JsonRpcProvider from @mysten/sui.js
    https://github.com/MystenLabs/sui/tree/main/sdk/typescript#writing-apis
  */
  const suiProvider = {
    provider: {
      getReferenceGasPrice: async () => {
        const result = await request('suix_getReferenceGasPrice', []);
        return result;
      },
      getCoins: async ({ owner, coinType }) => {
        const result = await request('suix_getCoins', [owner, coinType]);
        return result;
      },
      multiGetObjects: async ({ ids, options }) => {
        const result = await request('sui_multiGetObjects', [ids, options]);
        return result;
      },
      dryRunTransactionBlock: async ({ transactionBlock }) => {
        const result = await request('sui_dryRunTransactionBlock', [
          typeof transactionBlock === 'string'
            ? transactionBlock
            : Buffer.from(transactionBlock).toString('base64'),
        ]);
        return result;
      },
    },
  };

  const getSerializedTransaction = async () => {
    try {
      const coins = await request('suix_getCoins', [accounts.address]);

      const coinType = '0x2::sui::SUI';
      const filtered = coins.data.filter((item) => item.coinType === coinType);

      const txb = new Transaction();
      txb.setSender(accounts.address);

      txb.setGasPayment(
        filtered.map((item) => {
          return {
            objectId: item.coinObjectId,
            version: item.version,
            digest: item.digest,
          };
        }),
      );
      console.log('Payment: ', amt * 10000000);
      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amt * 10000000)]);
      console.log('Coin: ', coin);
      const client = new SuiClient({ url: getFullnodeUrl('devnet') });

      txb.transferObjects([coin], txb.pure.address('0xf8ad2061b08e7ce8ef247ecd09530903597c39e2f4a79d85dd7c6fd489b1f672'));
      const transactionBlock = await txb.build({ client });
      console.log('Transaction Block: ', transactionBlock);
      return `0x${Buffer.from(transactionBlock).toString('hex')}`;
    } catch (error) {
      alert(error.message);
    }
  };

  async function handleGetAccount() {
    try {
      const accounts = await dapp.request(CHAIN_NAME, {
        method: 'dapp:accounts',
      });
      if (Object.keys(accounts).length === 0) {
        throw new Error('There is no accounts.');
      }
      const chainId = await window.dapp.networks.sui.chain;

      if ((chainId === 'mainnet') | (chainId === 'testnet')) {
        throw new Error('Please chagne to SUI devnet in WELLDONE Wallet');
      }
      setAccounts(accounts[CHAIN_NAME]);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSendTransaction() {
    try {
      const HEX_STRING_TX_DATA = await getSerializedTransaction();
      const response = await dapp.request(CHAIN_NAME, {
        method: 'dapp:signAndSendTransaction',
        params: [`${HEX_STRING_TX_DATA}`],
      });
      const txHash = response[0];

      setTxHash(txHash);
      return true;
    } catch (error) {
      alert(`Error Message: ${error.message}\nError Code: ${error.code}`);
      return false;
    }
  }

  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userTokens, setUserTokens] = useState(0)
  

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
    setUserTokens(Math.floor(Math.random() * 500))
  }

  const handleBuyTokens = async () => {
    if (accounts) {
      setUserTokens((prev) => prev + amt)
      // const status= await handleSendTransaction();
      // if (!status) {
       
      //   return
      // }
      const statusForTransferSui= await handleTransfer(accounts.address, amt);
      if (!statusForTransferSui) {
     
        return
      }
      alert(`Successfully purchased ${amt}  CGS_COIN!`)
    } else {
      alert("Please connect your wallet first!")
    }
  }

  return (
   
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto py-16 px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gradient">
            Power Up Your Gaming Experience
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              
              <div className="benefits-list space-y-4">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Higher Stakes, Bigger Rewards</h4>
                    <p className="text-gray-300">Stake more tokens to enter high-reward game lobbies</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Exclusive Game Access</h4>
                    <p className="text-gray-300">Unlock premium games only available to token holders</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Instant Withdrawals</h4>
                    <p className="text-gray-300">Cash out your winnings instantly to your wallet</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-glow"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Buy Game Tokens</h2>

              <>
              {accounts ? (
                <>
                  0.01 SUI = 1 CGS_COIN
                  <br></br>
                  <br></br>
                  Enter the amount of CGS_COIN you want to buy:
                  <Input
                    type="number"
                    value={amt}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount of CGS_COIN ( MIST )"
                    className="border border-gray-700 rounded-lg p-2 mb-4 w-full"
                  />
                  <br></br>

                  Amount of CGS_COIN: {amt}
                  <br></br>
                  <br></br>
                    <b>Accounts: {accounts.address}</b>
                  


                  <Button onClick={handleBuyTokens} type="button">
                    Buy Token
                  </Button>
                  <br></br>
                </>
              ) : (
                <>
                  <Button onClick={handleGetAccount} type="button">
                    Get Account
                  </Button>
                  <div>You have to get account first!</div>
                </>
              )}
              {txHash && (
               
                  <b>Transaction Hash: {txHash}</b> 
              )}
            </>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <p className="text-sm text-gray-400">Secure transactions powered by SUI blockchain</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
  )
}
