import { NextResponse } from "next/server";
import { fromHex } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

async function handleTransfer(recipient, amount) {

  try{
    const PRIVATE_KEY = "0x84648d893d66c2835cbc483a0c0f544308f5d0429ebd0c1fd07129f97ff7d091"; // Replace with your actual private key
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
    console.log('Transaction : ', tx);
    
    tx.setSender(keypair.getPublicKey().toSuiAddress());
    console.log("Setting sender address... : ", keypair.getPublicKey().toSuiAddress());
  
    console.log("Setting gas payment...");
    tx.setGasBudget(GAS_BUDGET);
    console.log("Setting gas price...");
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



export async function POST(req) {

  try {
    // Parse request body if needed (only use if the request contains relevant data)
    
    const body = await req.json();
    const { recipient, amount } = body;
    
    // Process the transaction
    const response = await handleTransfer(recipient, amount);
    
    // Return successful response
    return NextResponse.json({ 
      success: true,
      transactionData: response 
    }, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    
    // Return appropriate error message
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Internal Server Error" 
      },
      { status: 500 }
    );
  }
}