// SUI Contract Usage Example
const { GameCurrencyClient, getSigner } = require('./sui_javascript_client');

// Replace this with your mnemonic
const MNEMONIC = 'your twelve word mnemonic phrase goes here ...';

async function runGameCurrencyExample() {
  console.log("Starting Game Currency Contract Demo...");
  
  // Initialize client with signer from mnemonic
  const signer = await getSigner(MNEMONIC);
  const client = new GameCurrencyClient(signer);
  
  // Get user address
  const address = await client.getAddress();
  console.log("\n👤 Using address:", address);
  
  try {
    // Step 1: Buy game coins
    console.log("\n💰 Step 1: Buying game coins...");
    await client.buyCoins(5000);
    
    // Step 2: Check balance
    console.log("\n💵 Step 2: Checking coin balance...");
    const balance = await client.getCoins();
    console.log(`Current balance: ${balance} coins`);
    
    // Step 3: Host a game room
    const roomCode = "GameRoom" + Math.floor(Math.random() * 1000); // Generate unique room code
    const stake = 500;
    console.log(`\n🎮 Step 3: Hosting game room "${roomCode}" with ${stake} coin stake...`);
    await client.hostGame(roomCode, stake);
    
    // Step 4: Get room details
    console.log(`\n📋 Step 4: Getting room details for "${roomCode}"...`);
    const roomDetails = await client.getRoomDetails(roomCode);
    console.log("Room details:", roomDetails);
    
    // Step 5: Join a game room (usually from another player)
    console.log(`\n🎯 Step 5: Joining game room "${roomCode}" as player 2...`);
    console.log("Note: In a real scenario, this would be done by another player");
    await client.joinGame(roomCode);
    
    // Step 6: Check updated room details
    console.log(`\n📋 Step 6: Getting updated room details for "${roomCode}"...`);
    const updatedRoomDetails = await client.getRoomDetails(roomCode);
    console.log("Updated room details:", updatedRoomDetails);
    
    // Step 7: Record a win
    console.log(`\n🏆 Step 7: Recording win for address ${address} in room "${roomCode}"...`);
    await client.winGame(roomCode, address);
    
    // Step 8: Check final balance after winning
    console.log("\n💵 Step 8: Checking final coin balance after winning...");
    const finalBalance = await client.getCoins();
    console.log(`Final balance: ${finalBalance} coins`);
    console.log(`Profit from game: ${finalBalance - balance} coins`);
    
    // Step 9: Try creating another room to cancel
    const cancelRoomCode = "CancelRoom" + Math.floor(Math.random() * 1000);
    console.log(`\n🎮 Step 9: Creating another room "${cancelRoomCode}" to demonstrate cancellation...`);
    await client.hostGame(cancelRoomCode, stake);
    
    // Step 10: Cancel the room
    console.log(`\n❌ Step 10: Cancelling room "${cancelRoomCode}"...`);
    await client.cancelRoom(cancelRoomCode);
    
    // Step 11: Check balance after cancellation
    console.log("\n💵 Step 11: Checking balance after cancellation...");
    const balanceAfterCancel = await client.getCoins();
    console.log(`Balance after cancellation: ${balanceAfterCancel} coins`);
    
    console.log("\n✅ Game Currency Contract Demo completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during demo:", error);
  }
}

// Run the example
runGameCurrencyExample().then(() => {
  console.log("Demo script execution finished");
}).catch(err => {
  console.error("Fatal error:", err);
});