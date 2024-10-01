import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./Voting.json";

const VotingDApp = () => {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [voters, setVoters] = useState([]);
  const [showInfo, setShowInfo] = useState(false); // control if the info is folded

  const loadBlockchainData = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${Number(1337).toString(16)}` }],
        });
      } catch (switchError) {
        // If cannot auto-switch
        console.error(switchError);
        alert("Please connect to the Ganache network in MetaMask.");
        return;
      }

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      // Get network information
      const networkId = (await provider.getNetwork()).chainId;

      // Ensure the network ID matches your Ganache instance
      if (networkId !== 1337) {
        // Default Ganache network ID
        alert("Please connect to the Ganache network in MetaMask.");
        return;
      }
      // Get contract instance
      const deployedNetwork = Voting.networks[networkId];
      if (deployedNetwork) {
        const contractInstance = new ethers.Contract(
          deployedNetwork.address,
          Voting.abi,
          provider.getSigner()
        );
        setContract(contractInstance);

        // Load candidates
        const candidatesCount = await contractInstance.candidatesCount();
        const candidatesArray = [];
        for (let i = 1; i <= candidatesCount; i++) {
          const candidate = await contractInstance.candidates(i);
          candidatesArray.push({
            id: candidate.id.toNumber(), // ensure id is number
            name: candidate.name,
            voteCount: candidate.voteCount.toString(), // ensure voteCount is string
          });
        }
        setCandidates(candidatesArray);
      } else {
        alert("Contract not deployed on the current network.");
      }
    } else {
      alert("Please install MetaMask.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadVotersData = async () => {
    try {
      const votersArray = await contract.getVoters();
      const votersData = votersArray.map((voter) => {
        const candidateId = voter.candidateId.toNumber();
        const candidateName =
          candidates.find((candidate) => candidate.id === candidateId)?.name ||
          "Unknown";
        return {
          voterAddress: voter.voterAddress,
          candidateId: candidateId,
          candidateName: candidateName,
        };
      });
      setVoters(votersData);
    } catch (error) {
      console.error("Error loading voters data:", error);
    }
  };

  const voteCandidate = async (candidateId) => {
    try {
      setLoading(true);
      const tx = await contract.vote(candidateId);
      await tx.wait(); // wait for confirmation
      setLoading(false);
      alert("Voted successfully!");
      loadBlockchainData();
    } catch (error) {
      console.error("Error voting for candidate:", error);

      // take error from contract
      let errorMessage = "Voting Failed!"; // default error

      // error has different structures, ensure to take correct one
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // print detailed errors
      console.error("Detailed error message:", errorMessage);

      // check if errors include specific reason
      if (errorMessage.includes("You have already voted")) {
        alert("Voting failed，Reason: One user can only vote once");
      } else {
        alert(`Voting failed: ${errorMessage}`);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <h1>Voting DApp</h1>
      <button onClick={() => setShowInfo(!showInfo)}>
        {showInfo ? "Hide Info" : "Read Me First!!!"}
      </button>
      {showInfo && (
        <div
          style={{
            textAlign: "justify",
            maxWidth: "700px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif", // font setting
            fontSize: "16px", // font size
            lineHeight: "1.6", // line height
            color: "#333", // font color
          }}
        >
          <p>
            This DApp allows users to vote for candidates in a decentralized way
            on a Testnet. <br />
            For using this DApp, you need to deploy the 《Voting》smart contract
            to Ganache Testnet and finish a series of settings. If it is not
            convenient for you, you can simply check the Demo Video on: [link]{" "}
            <br />I also finished a Sepolia version of this DApp. However, since
            I do not have so many accounts to test, the functions might be
            limited, so I did not uploaded it as a webpage. Anyway, if you would
            like to challenge the GANACHE settings, Please follow the steps
            below. <br />
            <strong>1.</strong> Install Ganache, create a workspace, pick up an
            account and memorize its private key. <br />
            <strong>2.</strong> Deploy the smart contract to Ganache testnet.
            You may have many approaches to finish this step. However, I am
            using Foundry for deploying. You can find my foundry project
            "foundry-voting" at https://github.com/monmon-sitdown/SimpleVoting.
            Initialize the foundry project, set the .env file of GANACHE_KEY to
            the private key you just picked up, and run "make deploy" in your
            terminal. You can deploy the smart contract to your own ganache
            network. <br />
            <strong>3.</strong> Find React App in
            https://github.com/monmon-sitdown/voting-dapp . Revise the
            src/Voting.json file. Change the "1337 address" to the contract
            address that you just deployed, and npm start to run the React App
            on localhost:3000.
            <br />
            <strong>4.</strong> You may need to set an account in your Web3
            wallet. After you connect your MetaMask wallet to the Ganache
            network, the current candidates will be displayed along with their
            respective vote counts. Ensure that you are connected to the correct
            network before proceeding! <br />
            <strong>5.</strong> You can vote for anyone you want. The candidates
            list was previously set onto the smart contract by node.js code.
            After you click the vote button, it will try to connect to your Web3
            wallet, and you can vote after you pay the gas fee. <br />
            <strong>6.</strong> Once you cast your vote, the system will prevent
            you from voting again to maintain fairness. <br />
            <strong>7.</strong> Click the "Show Voters Information" button, and
            you can check who voted for which candidate using their wallet
            address.
          </p>
        </div>
      )}

      <h3>Your account: {account}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul>
            {candidates.map((candidate, index) => (
              <li key={index}>
                {candidate.name} - {candidate.voteCount} votes
                <button onClick={() => voteCandidate(candidate.id)}>
                  Vote
                </button>
              </li>
            ))}
          </ul>
          <button onClick={loadVotersData}>Show Voters' Information</button>
          {voters.length > 0 && (
            <ul>
              {voters.map((voter, index) => (
                <li key={index}>
                  Address: {voter.voterAddress}, Voted for:{" "}
                  {voter.candidateName}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingDApp;
