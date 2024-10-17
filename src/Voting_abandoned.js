import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./Voting.json";
import ReactMarkdown from "react-markdown";

const VotingDApp = () => {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [voters, setVoters] = useState([]);
  const [showInfo, setShowInfo] = useState(false); // control if the info is folded
  const [markdownContent, setMarkdownContent] = useState("");

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

  useEffect(() => {
    if (showInfo) {
      fetch("/README.md") // loading Markdown file
        .then((response) => response.text())
        .then((text) => setMarkdownContent(text))
        .catch((error) => console.error("Error loading markdown file:", error));
    }
  }, [showInfo]);

  return (
    <div>
      <h1>Voting DApp</h1>
      <button onClick={() => setShowInfo(!showInfo)}>
        {showInfo ? "Hide Info" : "Read Me First!!!"}
      </button>
      {showInfo && (
        <div
          style={{
            textIndent: "2em",
            textAlign: "justify",
            maxWidth: "700px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif", // font setting
            fontSize: "16px", // font size
            lineHeight: "1.6", // line height
            color: "#333", // font color
          }}
        >
          <div>
            <p
              style={{
                textIndent: "2em", // 设置首行缩进为2个字符宽
                textAlign: "justify", // 使文本两端对齐
              }}
            >
              This DApp allows users to vote for candidates in a decentralized
              way on a Testnet.
            </p>
            <p
              style={{
                textIndent: "2em",
                textAlign: "justify",
              }}
            >
              For using this DApp, you need to deploy the 《Voting》smart
              contract to Ganache Testnet and finish a series of settings. (I
              also finished a Sepolia version of this DApp. However, since I do
              not have so many accounts to test, the functions might be limited,
              so I did not upload it.)
            </p>
            <p
              style={{
                textIndent: "2em",
                textAlign: "justify",
              }}
            >
              If it is not convenient for you, you can simply check the Demo
              Video on:{" "}
              <a
                href="YOUR_DEMO_VIDEO_URL"
                target="_blank"
                rel="noopener noreferrer"
              >
                Demo Video
              </a>
            </p>
            <p
              style={{
                textIndent: "2em",
                textAlign: "justify",
              }}
            >
              If you would like to challenge the GANACHE settings, Please check{" "}
              <a
                href="https://github.com/monmon-sitdown/voting-dapp/blob/master/README.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                README.md
              </a>{" "}
              or follow the steps below. You can also find my{" "}
              <a
                href="https://github.com/monmon-sitdown/voting-dapp/tree/master"
                target="_blank"
                rel="noopener noreferrer"
              >
                CODE
              </a>{" "}
              in github.
            </p>
          </div>

          <ReactMarkdown>{markdownContent}</ReactMarkdown>
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
