// SUI JavaScript Client for Game Currency Contract
const { Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } = require('@mysten/sui.js');
const { fromB64, toB64 } = require('@mysten/bcs');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');

// Contract Constants
const PACKAGE_ID = '0xab820275ce8a98c6c2ed500b02ef265d26b37ef6294a56d215c7044cc632fdcf';
const COIN_MANAGER = '0x47f2fa20f70225ac80ab8d3cb67bc1e90fa3db38d45312d24b55ae0d6daf8b69';
const ROOM_MANAGER = '0xa811e966a020fbe26a38f169d5f3546214fb14f33b6a774d405b0a281f9472e0';

// Network and Connection Settings
const NETWORK = 'devnet'; // Change to 'testnet' or 'mainnet' as needed
const provider = new JsonRpcProvider(NETWORK);

// Function to setup signer from mnemonic
async function getSigner(mnemonic) {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const derivationPath = "m/44'/784'/0'/0'/0'"; // SUI derivation path
  const { key } = derivePath(derivationPath, seed.toString('hex'));
  const keypair = Ed25519Keypair.fromSeed(key.slice(0, 32));
  return new RawSigner(keypair, provider);
}

// Helper function to convert string to UTF-8 byte array
function stringToUtf8Bytes(str) {
  return Array.from(new TextEncoder().encode(str));
}

class GameCurrencyClient {
  constructor(signer) {
    this.signer = signer;
  }

  async getAddress() {
    return await this.signer.getAddress();
  }

  // Get SUI coins for payment
  async getSuiCoins(minAmount) {
    const address = await this.getAddress();
    const coins = await provider.getCoins({
      owner: address,
      coinType: '0x2::sui::SUI'
    });
    
    // Find a coin with sufficient balance
    const coin = coins.data.find(c => BigInt(c.balance) >= minAmount);
    if (!coin) {
      throw new Error(`No SUI coin with sufficient balance (${minAmount}) found`);
    }
    return coin.coinObjectId;
  }

  // ==================== COIN MANAGEMENT FUNCTIONS ====================

  // Buy coins
  async buyCoins(amount) {
    try {
      const tx = new TransactionBlock();
      const address = await this.getAddress();
      
      // Get a SUI coin for payment
      const paymentCoin = await this.getSuiCoins(BigInt(amount));
      
      // Split the coin to get exactly the amount we need
      const [paymentCoinSplit] = tx.splitCoins(tx.object(paymentCoin), [tx.pure(amount)]);
      
      // Call the buy_coins function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::buy_coins`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.pure(address),
          tx.pure(amount),
          paymentCoinSplit
        ],
      });
      
      const result = await this.signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true, showObjectChanges: true }
      });
      
      console.log("Buy Coins Result:", result);
      return result;
    } catch (error) {
      console.error("Error buying coins:", error);
      throw error;
    }
  }

  // Get coins balance
  async getCoins(address) {
    if (!address) {
      address = await this.getAddress();
    }
    
    try {
      const tx = new TransactionBlock();
      
      // Call the get_coins function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::get_coins`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.pure(address)
        ],
      });
      
      const result = await this.signer.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: await this.getAddress()
      });
      
      if (result && result.results && result.results[0] && result.results[0].returnValues) {
        // Parse the returned coin amount
        const coinAmount = result.results[0].returnValues[0][0];
        console.log(`Address ${address} has ${coinAmount} game coins`);
        return coinAmount;
      } else {
        console.log("No coins found or error in result format");
        return 0;
      }
    } catch (error) {
      console.error("Error getting coins:", error);
      throw error;
    }
  }

  // ==================== GAME ROOM MANAGEMENT FUNCTIONS ====================

  // Host a new game room
  async hostGame(roomCode, stake) {
    try {
      const tx = new TransactionBlock();
      const roomCodeBytes = stringToUtf8Bytes(roomCode);
      
      // Call the host_game function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::host_game`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.object(ROOM_MANAGER),
          tx.pure(roomCodeBytes),
          tx.pure(stake)
        ],
      });
      
      const result = await this.signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      });
      
      console.log(`Hosted game room '${roomCode}' with stake ${stake}:`, result);
      return result;
    } catch (error) {
      console.error(`Error hosting game room '${roomCode}':`, error);
      throw error;
    }
  }

  // Join an existing game room
  async joinGame(roomCode) {
    try {
      const tx = new TransactionBlock();
      const roomCodeBytes = stringToUtf8Bytes(roomCode);
      
      // Call the join_game function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::join_game`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.object(ROOM_MANAGER),
          tx.pure(roomCodeBytes)
        ],
      });
      
      const result = await this.signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      });
      
      console.log(`Joined game room '${roomCode}':`, result);
      return result;
    } catch (error) {
      console.error(`Error joining game room '${roomCode}':`, error);
      throw error;
    }
  }

  // Record game result
  async winGame(roomCode, winnerAddress) {
    try {
      const tx = new TransactionBlock();
      const roomCodeBytes = stringToUtf8Bytes(roomCode);
      
      // Call the win_game function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::win_game`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.object(ROOM_MANAGER),
          tx.pure(roomCodeBytes),
          tx.pure(winnerAddress)
        ],
      });
      
      const result = await this.signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      });
      
      console.log(`Recorded win for address ${winnerAddress} in room '${roomCode}':`, result);
      return result;
    } catch (error) {
      console.error(`Error recording win for room '${roomCode}':`, error);
      throw error;
    }
  }

  // Get room details
  async getRoomDetails(roomCode) {
    try {
      const tx = new TransactionBlock();
      const roomCodeBytes = stringToUtf8Bytes(roomCode);
      
      // Call the get_room_details function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::get_room_details`,
        arguments: [
          tx.object(ROOM_MANAGER),
          tx.pure(roomCodeBytes)
        ],
      });
      
      const result = await this.signer.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: await this.getAddress()
      });
      
      if (result && result.results && result.results[0] && result.results[0].returnValues) {
        // Parse the returned room details
        const hostAddress = result.results[0].returnValues[0][0];
        const stake = result.results[0].returnValues[1][0];
        const player2Address = result.results[0].returnValues[2]; // This is an Option<address>
        const isActive = result.results[0].returnValues[3][0] === '1'; // Convert to boolean
        
        const roomDetails = {
          hostAddress,
          stake,
          player2Address: player2Address && player2Address[0] ? player2Address[0] : null,
          isActive
        };
        
        console.log(`Room '${roomCode}' details:`, roomDetails);
        return roomDetails;
      } else {
        console.log(`Room '${roomCode}' not found or error in result format`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting details for room '${roomCode}':`, error);
      throw error;
    }
  }

  // Cancel a room
  async cancelRoom(roomCode) {
    try {
      const tx = new TransactionBlock();
      const roomCodeBytes = stringToUtf8Bytes(roomCode);
      
      // Call the cancel_room function
      tx.moveCall({
        target: `${PACKAGE_ID}::game_currency::cancel_room`,
        arguments: [
          tx.object(COIN_MANAGER),
          tx.object(ROOM_MANAGER),
          tx.pure(roomCodeBytes)
        ],
      });
      
      const result = await this.signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true }
      });
      
      console.log(`Cancelled game room '${roomCode}':`, result);
      return result;
    } catch (error) {
      console.error(`Error cancelling game room '${roomCode}':`, error);
      throw error;
    }
  }
}

// Example usage
async function main() {
  try {
    // Replace with your own mnemonic phrase
    const mnemonic = 'your twelve word mnemonic phrase goes here ...';
    const signer = await getSigner(mnemonic);
    const client = new GameCurrencyClient(signer);
    
    const address = await client.getAddress();
    console.log("Using address:", address);
    
    // Example workflow
    // 1. Buy coins
    await client.buyCoins(1000);
    
    // 2. Check balance
    await client.getCoins();
    
    // 3. Host a game
    await client.hostGame("Room123", 100);
    
    // 4. Get room details
    await client.getRoomDetails("Room123");
    
    // 5. Join a game (would typically be from another address)
    // await client.joinGame("Room123");
    
    // 6. Record a win
    // await client.winGame("Room123", address);
    
    // 7. Cancel a room (if no one joined)
    // await client.cancelRoom("Room123");
    
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the example
// main();

// Export for module use
module.exports = {
  GameCurrencyClient,
  getSigner
};