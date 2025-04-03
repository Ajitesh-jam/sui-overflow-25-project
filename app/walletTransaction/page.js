"use client";
import { Transaction } from '@mysten/sui/transactions';
import {
	ConnectButton,
	useCurrentAccount,
	useSignTransaction,
	useSuiClient,
} from '@mysten/dapp-kit';
import { toBase64 } from '@mysten/sui/utils';
import { useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 
// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
	localnet: { url: getFullnodeUrl('localnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
});
const queryClient = new QueryClient();
 

import { useSuiClientQuery } from '@mysten/dapp-kit';
 
function MyComponentRPC() {
	const { data, isPending, error, refetch } = useSuiClientQuery('getOwnedObjects', {
		owner: '0x123',
	});
 
	if (isPending) {
		return <div>Loading...</div>;
	}
 
	return <pre>{JSON.stringify(data, null, 2)}</pre>;
}





import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';


function MyComponentSign() {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [digest, setDigest] = useState('');
    const currentAccount = useCurrentAccount();

    return (
        <div style={{ padding: 20 }}>
            <ConnectButton />
            {currentAccount && (
                <>
                    <div>
                        <button
                            onClick={async () => {
                                try {
                                    const tx = new Transaction();
                                    tx.moveCall({
                                        target: '0x9e6783a9822f30d293d5e622887663042690a792803a46d75664a569790afa89::my_coin::mint',
                                        arguments: [
                                            tx.object('0x3f0be8423b8ecb979e77aaff7cab52313d070df3797dfe11959c1c88abd508e7'), // Treasury Cap ID
                                            tx.pure.u64(300), // Coin Amount
                                            tx.pure.address('0xa88e4aa0090233c7485b4f2b12d1965e202b62eabd5b691e9820468d63f3ca40'), // Recipient Address
                                        ],
                                    });

                                    console.log('Transaction Block:', tx);

                                    const res = await signAndExecuteTransaction(
                                        {
                                            transaction: tx,
                                            chain: 'sui:devnet',
                                        },
                                        {
                                            onSuccess: (result) => {
                                                console.log('Transaction executed successfully');
                                                console.log('Executed transaction:', result);
                                                setDigest(result.digest);
                                            },
                                            onError: (error) => {
                                                console.error('Transaction execution failed:', error);
                                            },
                                        }
                                    );

                                    console.log('signAndExecuteTransaction result:', res);
                                } catch (error) {
                                    console.error('Error during transaction execution:', error);
                                }
                            }}
                        >
                            Sign and execute transaction
                        </button>
                    </div>
                    <div>Digest: {digest}</div>
                </>
            )}
        </div>
    );
}







function MyComponent() {
    const { mutateAsync: signTransaction } = useSignTransaction();
    const client = useSuiClient();
    const currentAccount = useCurrentAccount();
    const [signature, setSignature] = useState('');

    return (
        <div style={{ padding: 20 }}>
            <ConnectButton />
            {currentAccount && (
                <>
                    <div>
                        <button
                            onClick={async () => {
                                try {
                                    const tx = new Transaction();
                                    tx.moveCall({
                                        target: '0x9e6783a9822f30d293d5e622887663042690a792803a46d75664a569790afa89::my_coin::mint',
                                        arguments: [
                                            tx.object('0x3f0be8423b8ecb979e77aaff7cab52313d070df3797dfe11959c1c88abd508e7'), // Treasury Cap ID
                                            tx.pure.u64(30), // Coin Amount
                                            tx.pure.address('0xa88e4aa0090233c7485b4f2b12d1965e202b62eabd5b691e9820468d63f3ca40'), // Recipient Address
                                        ],
                                    });

                                    console.log('Transaction Block:', tx);

                                    // Sign transaction
                                    const { bytes, signature } = await signTransaction({
                                        transaction: tx,
                                    });
                                    console.log('Transaction Bytes:', bytes);
                                    console.log('Transaction Signature:', signature);

                                    setSignature(signature);

                                    // Execute transaction
                                    const executeResult = await client.executeTransactionBlock({
                                        transactionBlock: bytes,
                                        signature,
                                        options: {
                                            showEffects: true,
                                        },
                                    });

                                    console.log('Transaction Result:', executeResult);
                                } catch (error) {
                                    console.error('Transaction Failed:', error);
                                }
                            }}
                        >
                            Execute Mint Transaction
                        </button>
                    </div>
                    <div>Signature: {signature}</div>
                </>
            )}
        </div>
    );
}


export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
				<WalletProvider>
					{/* <MyComponent /> */}
                    <MyComponentSign />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}

 