import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./Voting.json";

const VotingDApp = () => {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [voters, setVoters] = useState([]);

  //Account test
  const accounts = [
    {
      address: "0x0162d27D2B11da01D59df10994D104e6B94FF5B0",
      privateKey:
        "0xb9c1fd6b4a7d758cf0dcf77295ab143088753c3e48da50737727d6c8aef104e3",
    },
    {
      address: "0x42451b374c89fd4250a1F5930687a86bAc532B3F",
      privateKey:
        "0x8237286e769c1e4ff006e42f20ddea79a335239302ddeba2f6beb75757ecb584",
    },
    {
      address: "0xc41eAEC4b744993782f67Bf0161BbDb23d5311E4",
      privateKey:
        "0xb6b598bd5ba68c25640f8b6702fc7c11aae38712366f04f38bb1f11e7fc772b6",
    },
    /*{ address: "0xAddress4...", privateKey: "0xPrivateKey4..." },
    { address: "0xAddress5...", privateKey: "0xPrivateKey5..." },*/
  ];

  const loadBlockchainData = async () => {
    // 连接到Ganache
    /*
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
    setContract(contractInstance);*/
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:7545"
      );
      setProvider(provider);

      // 从预设账户中随机选择一个
      const randomAccount = accounts[2];
      const wallet = new ethers.Wallet(randomAccount.privateKey, provider);
      setAccount(randomAccount.address);

      const network = await provider.getNetwork();
      const networkId = network.chainId;
      const deployedNetwork = Voting.networks[networkId];
      if (!deployedNetwork) {
        throw new Error(`No deployment found for network ID ${networkId}`);
      }

      const contractInstance = new ethers.Contract(
        deployedNetwork.address,
        Voting.abi,
        wallet
      );
      setContract(contractInstance);

      const candidatesCount = await contractInstance.candidatesCount();
      const candidatesArray = [];
      for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await contractInstance.candidates(i);
        candidatesArray.push({
          id: candidate.id.toNumber(), // 确保 id 是数字
          name: candidate.name,
          voteCount: candidate.voteCount.toString(), // 确保 voteCount 是字符串
        });
      }
      setCandidates(candidatesArray);

      setLoading(false);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setLoading(false);
    }
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
      await tx.wait(); // 等待交易确认
      setLoading(false);
      alert("投票成功");
      loadBlockchainData();
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

  useEffect(() => {
    loadBlockchainData();
  }, []);

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
                {candidate.name} - {candidate.voteCount} votes
                <button onClick={() => voteCandidate(candidate.id)}>
                  Vote
                </button>
              </li>
            ))}
          </ul>
          <button onClick={loadVotersData}>显示投票人信息</button>
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
