import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./Voting.abi.json";

const VotingDApp = () => {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);

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
    setLoading(true);
    await contract.vote(candidateId);
    setLoading(false);
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
