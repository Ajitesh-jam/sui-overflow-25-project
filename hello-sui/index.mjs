import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';




// Configure your Sui client
const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io' }); // Change network as needed

// Your account and package information
const myAddress = '0x3eb5225be65bce1b4db5df7ed209394084b86b5da61f71847592037fbfb082d4';
const packageId = '0x706fa8ed6223a73dd40c381b4221a59d365bbbeb37e053e53094a3017698e3c8';
const GLOBAL_CURRENCY_TYPE = `${packageId}::global_currency::GLOBAL_CURRENCY`;

// Load your keypair (NEVER hardcode in production)
// For this example, we'll use environment variables
// In a real app, use secure key management
const privateKeyBase64 = "suiprivkey1qpm9jtcf2kc63daxkkps3az8rzue5ntzfxz0sura5lrcddhfn0paxpq0j9n" ;
// Convert base64 to bytes (in real implementation, properly handle the encoding)
const privateKeyBytes = typeof privateKeyBase64 === 'string' 
  ? fromB64(privateKeyBase64) 
  : Uint8Array.from(Buffer.from(privateKeyBase64, 'base64'));

const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

// Function to get the CurrencyStore object ID
async function getCurrencyStoreId() {
    console.log("Looking for CurrencyStore object...");
    
    const objects = await client.getOwnedObjects({
        owner: myAddress,
        filter: {
            StructType: `${packageId}::global_currency::CurrencyStore`
        },
        options: { showContent: true }
    });
    
    if (objects.data.length === 0) {
        throw new Error("CurrencyStore not found");
    }
    
    const storeId = objects.data[0].data.objectId;
    console.log(`Found CurrencyStore: ${storeId}`);
    return storeId;
}

// 1. Buy currency function
async function buyCurrency(amountToSpend, recipientAddress) {
    console.log(`Buying GCOIN with ${amountToSpend} SUI for ${recipientAddress}`);
    
    const currencyStoreId = await getCurrencyStoreId();
    
    const tx = new Transaction();
    // Split coins from gas payment for the transaction
    const [paymentCoin] = tx.splitCoins(tx.gas, [amountToSpend]);
    
    // Call the buy_currency function
    tx.moveCall({
        target: `${packageId}::global_currency::buy_currency`,
        arguments: [
            tx.object(currencyStoreId),  // store
            paymentCoin,                 // payment
            tx.pure.address(recipientAddress) // recipient
        ]
    });
    
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true, showEvents: true }
    });
    
    console.log("Transaction executed:", result.digest);
    console.log("Status:", result.effects.status);
    
    return result;
}

// 2. Burn currency function
async function burnCurrency(coinObjectId) {
    console.log(`Burning GCOIN from object: ${coinObjectId}`);
    
    const tx = new Transaction();
    
    // Call the burn_currency function
    tx.moveCall({
        target: `${packageId}::global_currency::burn_currency`,
        arguments: [
            tx.object(coinObjectId)  // coin_to_burn
        ]
    });
    
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true }
    });
    
    console.log("Transaction executed:", result.digest);
    console.log("Status:", result.effects.status);
    
    return result;
}

// 3. Check balance function (client-side implementation)
async function checkBalance(coinObjectId) {
    console.log(`Checking balance of coin object: ${coinObjectId}`);
    
    // Get object details
    const objectData = await client.getObject({
        id: coinObjectId,
        options: { showContent: true }
    });
    
    if (!objectData || !objectData.data || !objectData.data.content) {
        throw new Error("Could not retrieve coin object");
    }
    
    // Extract balance
    const balance = objectData.data.content.fields.balance;
    console.log(`Balance: ${balance}`);
    
    return balance;
}

// 4. Withdraw profits function
async function withdrawProfits(amount, recipientAddress) {
    console.log(`Withdrawing ${amount} profits to: ${recipientAddress}`);
    
    const currencyStoreId = await getCurrencyStoreId();
    
    const tx = new Transaction();
    
    // Call the withdraw_profits function
    tx.moveCall({
        target: `${packageId}::global_currency::withdraw_profits`,
        arguments: [
            tx.object(currencyStoreId),        // store
            tx.pure.u64(amount),               // amount
            tx.pure.address(recipientAddress)  // recipient
        ]
    });
    
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true }
    });
    
    console.log("Transaction executed:", result.digest);
    console.log("Status:", result.effects.status);
    
    return result;
}

// 5. Get all GCOIN coins owned by an address
async function getAllOwnedGCoins(ownerAddress) {
    console.log(`Getting all GCOIN coins for address: ${ownerAddress}`);
    
    const coins = await client.getCoins({
        owner: ownerAddress,
        coinType: GLOBAL_CURRENCY_TYPE
    });
    
    console.log(`Found ${coins.data.length} GCOIN coins`);
    if (coins.data.length > 0) {
        console.log("Coins:", coins.data);
    }
    
    return coins.data;
}

// Main function to execute the examples
async function main() {
    try {
        const command = process.argv[2];
        
        switch(command) {
            case "buy":
                // Buy with 0.1 SUI (100,000,000 MIST)
                await buyCurrency(100000000, myAddress);
                break;
                
            case "burn":
                // Get coins and burn the first one
                const coinsForBurn = await getAllOwnedGCoins(myAddress);
                if (coinsForBurn && coinsForBurn.length > 0) {
                    await burnCurrency(coinsForBurn[0].coinObjectId);
                } else {
                    console.log("No GCOIN coins to burn.");
                }
                break;
                
            case "check":
                // Get coins and check balance of the first one
                const coinsForCheck = await getAllOwnedGCoins(myAddress);
                if (coinsForCheck && coinsForCheck.length > 0) {
                    await checkBalance(coinsForCheck[0].coinObjectId);
                } else {
                    console.log("No GCOIN coins to check.");
                }
                break;
                
            case "withdraw":
                // Withdraw 0.05 SUI profits
                await withdrawProfits(50000000, myAddress);
                break;
                
            default:
                console.log("Available commands: buy, burn, check, withdraw");
                // Show all GCOINs by default
                await getAllOwnedGCoins(myAddress);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the main function
main();