import { useState } from "react";
import { Button, Input } from "@/components/ui/button";
import { useSuiWallet } from "@/hooks/useSuiWallet";

export default function GameTokenUI() {
  const { wallet, signAndExecuteTransaction } = useSuiWallet();
  const [lobbyCode, setLobbyCode] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [winnerIndex, setWinnerIndex] = useState("1");

  const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>";

  const executeTransaction = async (functionName, args) => {
    try {
      await signAndExecuteTransaction({
        packageObjectId: contractAddress,
        module: "gaming_token",
        function: functionName,
        arguments: args,
      });
      alert("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Gaming Token Interface</h2>
      <div className="my-2">
        <Input placeholder="Lobby Code" value={lobbyCode} onChange={(e) => setLobbyCode(e.target.value)} />
      </div>
      <div className="my-2">
        <Input placeholder="Stake Amount" type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
      </div>
      <Button onClick={() => executeTransaction("host_a_game", [lobbyCode, wallet.address, stakeAmount])}>Host Game</Button>
      <Button onClick={() => executeTransaction("join_a_game", [lobbyCode, wallet.address, stakeAmount])}>Join Game</Button>
      <div className="my-2">
        <Input placeholder="Winner Index (1 or 2)" value={winnerIndex} onChange={(e) => setWinnerIndex(e.target.value)} />
      </div>
      <Button onClick={() => executeTransaction("claim_reward", [lobbyCode, winnerIndex])}>Claim Reward</Button>
      <Button onClick={() => executeTransaction("delete_game", [lobbyCode])}>Delete Game</Button>
    </div>
  );
}
