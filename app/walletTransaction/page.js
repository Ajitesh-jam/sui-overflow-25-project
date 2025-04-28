"use client";
import { Transaction } from '@mysten/sui/transactions';
import {
    ConnectButton,
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
    useSuiClientQuery
} from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import '@mysten/dapp-kit/dist/index.css';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
    localnet: { url: getFullnodeUrl('localnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
    devnet: { url: getFullnodeUrl('devnet') },
    testnet: { url: getFullnodeUrl('testnet') },
});
const queryClient = new QueryClient();

// Contract information
const PACKAGE_ID = "0x706fa8ed6223a73dd40c381b4221a59d365bbbeb37e053e53094a3017698e3c8";
const CURRENCY_STORE_ID = "0x334d4bca1f1273b0682ca0f5c86b03053bab2fe1c2c85f6388a9489fdcee0301";
const GCOIN_TYPE = `${PACKAGE_ID}::global_currency::GLOBAL_CURRENCY`;

function GlobalCurrencyWallet() {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    
    const [transactionDigest, setTransactionDigest] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');
    const [buyAmount, setBuyAmount] = useState(100000000); // 0.1 SUI default
    const [withdrawAmount, setWithdrawAmount] = useState(50000000); // 0.05 SUI default
    const [selectedCoin, setSelectedCoin] = useState(null);

    // Fetch owned GCOIN coins
    const { data: coins, isPending: coinsLoading, refetch: refetchCoins } = useSuiClientQuery(
        'getCoins',
        {
            owner: currentAccount?.address || '',
            coinType: GCOIN_TYPE
        },
        {
            enabled: !!currentAccount?.address
        }
    );

    // Function to buy GCOIN
    const handleBuyGCoin = async () => {
        if (!currentAccount) return;
        
        try {
            setTransactionStatus('Processing...');
            
            const tx = new Transaction();
            // Split coins from gas payment for the transaction
            const [paymentCoin] = tx.splitCoins(tx.gas, [buyAmount]);
            
            // Call the buy_currency function
            tx.moveCall({
                target: `${PACKAGE_ID}::global_currency::buy_currency`,
                arguments: [
                    tx.object(CURRENCY_STORE_ID),  // store
                    paymentCoin,                   // payment
                    tx.pure.address(currentAccount.address) // recipient
                ]
            });
            
            await signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log('Buy transaction executed successfully', result);
                        setTransactionDigest(result.digest);
                        setTransactionStatus('Buy transaction executed successfully');
                        setTimeout(() => refetchCoins(), 2000);
                    },
                    onError: (error) => {
                        console.error('Buy transaction failed:', error);
                        setTransactionStatus(`Error: ${error.message}`);
                    }
                }
            );
        } catch (error) {
            console.error('Error during buy transaction:', error);
            setTransactionStatus(`Error: ${error.message}`);
        }
    };

    // Function to burn GCOIN
    const handleBurnGCoin = async () => {
        if (!currentAccount || !selectedCoin) return;
        
        try {
            setTransactionStatus('Processing burn...');
            
            const tx = new Transaction();
            
            // Call the burn_currency function
            tx.moveCall({
                target: `${PACKAGE_ID}::global_currency::burn_currency`,
                arguments: [
                    tx.object(selectedCoin.coinObjectId)  // coin_to_burn
                ]
            });
            
            await signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log('Burn transaction executed successfully', result);
                        setTransactionDigest(result.digest);
                        setTransactionStatus('Burn transaction executed successfully');
                        setSelectedCoin(null);
                        setTimeout(() => refetchCoins(), 2000);
                    },
                    onError: (error) => {
                        console.error('Burn transaction failed:', error);
                        setTransactionStatus(`Error: ${error.message}`);
                    }
                }
            );
        } catch (error) {
            console.error('Error during burn transaction:', error);
            setTransactionStatus(`Error: ${error.message}`);
        }
    };

    // Function to withdraw profits
    const handleWithdrawProfits = async () => {
        if (!currentAccount) return;
        
        try {
            setTransactionStatus('Processing withdrawal...');
            
            const tx = new Transaction();
            
            // Call the withdraw_profits function
            tx.moveCall({
                target: `${PACKAGE_ID}::global_currency::withdraw_profits`,
                arguments: [
                    tx.object(CURRENCY_STORE_ID),        // store
                    tx.pure.u64(withdrawAmount),         // amount
                    tx.pure.address(currentAccount.address)  // recipient
                ]
            });
            
            await signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log('Withdraw transaction executed successfully', result);
                        setTransactionDigest(result.digest);
                        setTransactionStatus('Withdraw transaction executed successfully');
                    },
                    onError: (error) => {
                        console.error('Withdraw transaction failed:', error);
                        setTransactionStatus(`Error: ${error.message}`);
                    }
                }
            );
        } catch (error) {
            console.error('Error during withdraw transaction:', error);
            setTransactionStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ 
            padding: 20, 
            maxWidth: '800px', 
            margin: '0 auto', 
            fontFamily: 'Arial, sans-serif' 
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Global Currency Manager</h1>
            
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '20px' 
            }}>
                <ConnectButton />
            </div>
            
            {currentAccount ? (
                <div>
                    <div style={{ 
                        background: '#f5f5f5', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h2>Buy GCOIN</h2>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>
                                Amount (in MIST, 1 SUI = 10^9 MIST):
                            </label>
                            <input 
                                type="number" 
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(Number(e.target.value))}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>
                        <button 
                            onClick={handleBuyGCoin}
                            style={{
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Buy GCOIN
                        </button>
                    </div>

                    <div style={{ 
                        background: '#f5f5f5', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h2>Your GCOIN Coins</h2>
                        {coinsLoading ? (
                            <div>Loading coins...</div>
                        ) : !coins || coins.data.length === 0 ? (
                            <div>No GCOIN coins found. Buy some first!</div>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        Select coin to burn:
                                    </label>
                                    <select 
                                        onChange={(e) => setSelectedCoin(coins.data.find(coin => coin.coinObjectId === e.target.value))}
                                        value={selectedCoin?.coinObjectId || ''}
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px', 
                                            borderRadius: '4px',
                                            border: '1px solid #ccc'
                                        }}
                                    >
                                        <option value="">-- Select a coin --</option>
                                        {coins.data.map((coin) => (
                                            <option key={coin.coinObjectId} value={coin.coinObjectId}>
                                                {coin.coinObjectId} - Balance: {coin.balance}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedCoin && (
                                    <button 
                                        onClick={handleBurnGCoin}
                                        style={{
                                            background: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 15px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            width: '100%'
                                        }}
                                    >
                                        Burn Selected Coin
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ 
                        background: '#f5f5f5', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h2>Withdraw Profits (Admin Only)</h2>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>
                                Amount (in MIST, 1 SUI = 10^9 MIST):
                            </label>
                            <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </div>
                        <button 
                            onClick={handleWithdrawProfits}
                            style={{
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Withdraw Profits
                        </button>
                        <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                            Note: This function can only be called by the contract owner.
                        </p>
                    </div>

                    {transactionDigest && (
                        <div style={{ 
                            background: '#e8f5e9', 
                            padding: '15px', 
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <h3>Transaction Details</h3>
                            <p><strong>Status:</strong> {transactionStatus}</p>
                            <p><strong>Digest:</strong> {transactionDigest}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    background: '#f5f5f5',
                    borderRadius: '8px' 
                }}>
                    <p>Please connect your wallet to interact with the Global Currency contract.</p>
                </div>
            )}
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
                <WalletProvider>
                    <GlobalCurrencyWallet />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}