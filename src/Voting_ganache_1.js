import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./Voting.json";

const VotingDApp = () => {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

  const loadBlockchainData = async () => {
    // 连接到Ganache
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:7545"
    );
    const accounts = await provider.listAccounts();
    setAccount(accounts[1]);

    const networkId = (await provider.getNetwork()).chainId;
    const deployedNetwork = Voting.networks[networkId];
    const contractInstance = new ethers.Contract(
      deployedNetwork.address,
      Voting.abi,
      provider.getSigner()
    );
    setContract(contractInstance);

    const candidatesCount = await contractInstance.candidatesCount();
    const candidatesArray = [];
    for (let i = 1; i <= candidatesCount; i++) {
      const candidate = await contractInstance.candidates(i);
      candidatesArray.push(candidate);
    }
    setCandidates(candidatesArray);

    setLoading(false);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const voteCandidate = async (candidateId) => {
    try {
      setLoading(true);
      const tx = await contract.vote(candidateId);
      await tx.wait(); // 等待交易确认
      setLoading(false);
      alert("投票成功");
    } catch (error) {
      console.error("Error voting for candidate:", error);

      // 提取合约抛出的错误信息
      const errorMessage = error.message || "投票失败";

      // 检查错误信息是否包含特定的失败原因
      if (errorMessage.includes("You have already voted")) {
        alert("投票失败，原因：不能重复投票");
      } else {
        alert(`投票失败: ${errorMessage}`);
      }

      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Voting DApp</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul>
            {candidates.map((candidate, index) => (
              <li key={index}>
                {candidate.name} - {candidate.voteCount.toNumber()} votes
                <button onClick={() => voteCandidate(candidate.id)}>
                  Vote
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VotingDApp;
