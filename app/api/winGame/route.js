import { NextResponse } from "next/server";
import { fromHex } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';


// async function handleTransfer() {


//   //   txb.setGasBudget(100000000);
    
//   //   // Call smart contract function
//   //   // txb.moveCall({
//   //   //   target: `0x9229fd48ca1698e2e058b17f344b90b76a96be78ccdca6dbf0de351eb11c8a75::CGSCOIN::mint`,
//   //   //   arguments: [
//   //   //     txb.object("0x143e0dd84b5959da21f375b929427aedf5cbadc012e7ef8c357219493841b3e1"),
//   //   //     txb.pure.u8(33),
//   //   //     txb.pure.address("0xf8ad2061b08e7ce8ef247ecd09530903597c39e2f4a79d85dd7c6fd489b1f672")
//   //   //   ],
//   //   // });
//   //   txb.transferObjects(
//   //     [txb.object("0x52ad486993b8a257cc3bd49fdcafea4c032a16b4424194b761ebbb5359dc0f46")],
//   //     txb.pure.address("0xf8ad2061b08e7ce8ef247ecd09530903597c39e2f4a79d85dd7c6fd489b1f672")
//   //   )


//   console.log("Starting transaction execution...");
  
//   // Replace with the recipient's Sui address
//   const RECIPIENT = '0x88ff3daeca4f8fb67784ce1789db95a2ae5df910c91a1abbc919de536e382756';
  
//   // Amount to send (in MIST, where 1 SUI = 1_000_000_000 MIST)
//   const AMOUNT = 100000000; // 0.1 SUI
  
//   // Replace with your SUI coin object ID (from your wallet)
//   const SUI_OBJECT_ID = '0xd6452e745cc950f107542429d3c2093ac4aefd2734ac79b174dcf6c7d8f5e23a';
  
//   // Optional: set your gas budget
//   const GAS_BUDGET = 9000000000;

//   // 1. Create keypair from private key
//   console.log("Creating keypair from private key...");
//   const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));

//   const client = new SuiClient({ url: getFullnodeUrl('devnet') });

//   // Build the transaction
//   

//   tx.transferObjects([tx.object("0x19debe9078774e02ca699d05fe546be9f50059908bf5ef2180cc5a6e008c327f")], tx.pure.address(RECIPIENT));
//   tx.setSender(keypair.getPublicKey().toSuiAddress());
//   console.log("Setting sender address... : ", keypair.getPublicKey().toSuiAddress());
//   console.log("Setting gas budget...");
//   tx.setGasBudget(GAS_BUDGET);
//   console.log("Setting gas payment...");
  
//   // tx.setGasPayment([{
//   //   objectId: "0xd6452e745cc950f107542429d3c2093ac4aefd2734ac79b174dcf6c7d8f5e23a",
//   //   version: 44,
//   //   digest: "3mYMJFdktXkuFpXjuTQzunU4v89c6CNdms93yC7Ccgy2",
//   // }]);
//   console.log("Setting gas price...");
//   tx.setGasPrice(10000);


//   // Sign and execute the transaction
//   const result = await client.signAndExecuteTransaction({
//       signer: keypair,
//       transaction: await tx.build({ client }),
//   });

//   console.log('Transaction result:', result);


// }





async function handleTransfer(recipient, amount) {

  try{
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