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
										target: '0x3b2f64b59090447d0ace701d2bc5da7507a7d5b8ec5dce7c639750af661d3df4::my_coin::mint',
										arguments: [
											tx.object('0x6d70bd04dc5f2cb5c45e994392efe46b72686f85fed615606ac8427c16265adb'), // Treasury Cap ID (object)
											tx.pure.u64(69), // Coin Amount (pure value with u64 type)
											tx.pure.address('0xa88e4aa0090233c7485b4f2b12d1965e202b62eabd5b691e9820468d63f3ca40'), // Recipient Address (pure value with address type)
										],
									});

									// Sign transaction
									const { bytes, signature } = await signTransaction({
										transaction: tx,
										chain: 'sui:devnet',
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
					<MyComponent />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}

 