# Voting DApp Documentation

This project is a front-end React application that interacts with a Solidity smart contract, enabling a decentralized voting system. Users can view candidates, cast votes, and check voter information on the blockchain network.

## Features

1. **Decentralized Voting**: Allows users to vote for candidates in a decentralized manner on a Testnet.
2. **Multiple Networks**: The app can be deployed on both Ganache Testnet and Sepolia Testnet. Due to limited testing accounts, the Sepolia version is not deployed as a webpage.
3. **Voter Information Display**: Provides a list of voters and the candidates they supported.
4. **Fair Voting**: Ensures each user can only vote once per candidate.

## Prerequisites

Before you begin, ensure the following tools and services are set up before proceeding:

- **Node.js** and **npm** installed on your machine.
- A local Ethereum blockchain running (e.g., **Ganache**).
- A deployed instance of the `Voting.sol` smart contract.

## Getting Started

Follow these steps to set up and run the project locally.

### 1.Clone the Repository

```
git clone https://github.com/monmon-sitdown/voting-dapp.git
cd voting-dapp
```

### 2. Install Dependencies

```
npm install
```

### 3. Deploy Smart Contract

- Install **Ganache**, create a workspace, and select an account. Memorize its private key.
- Deploy the `Voting` smart contract using your preferred method. We recommend using **Foundry** for deployment.
- Set the .env file with the private key from Ganache and run the deployment command.

```
git clone https://github.com/monmon-sitdown/SimpleVoting.git
cd SimpleVoting
make deploy
```

### 4. Configure the App

In the src/Voting.json file, update the contract address to match the one you deployed to Ganache:

```
{
  "1337": {
    "address": "YOUR_DEPLOYED_CONTRACT_ADDRESS"
  }
}
```

### 5.Start the App

```
npm start
```

This will start the application at http://localhost:3000.

### 6.Connect to MetaMask

Connect your MetaMask wallet to the **Ganache Testnet**. The DApp will display the candidates and their respective vote counts.

### 7. Cast Your Vote

Users can vote for a candidate by clicking the "vote" button. Ensure you're connected to the correct network. Once a vote is cast, the system will prevent further votes to maintain fairness.

### 8. View Voter Information

Click "Show Voter Information" to see a list of voters and their selected candidates.

## Main Components

### `src/vote.js`

This is the primary file where the React component for the Voting DApp is implemented. Key features include:

- **`loadBlockchainData`**: Connects to the blockchain and retrieves candidate data.
- **`voteCandidate`**: Sends a transaction to the contract, allowing users to vote.
- **`loadVotersData`**: Fetches and displays voter information.

#### State Management:

- **`account`**: The current user's account address.
- **`candidates`**: The list of candidates retrieved from the blockchain.
- **`contract`**: The smart contract instance.
- **`provider`** : The ethers.js provider instance.
- **`votes`**: The list of voters and their votes.
- **`loading`**: A flag to manage the loading state.

#### Rendering

- The component renders a list of candidates, each with a "Vote" button.
- It also provides a button to show the list of voters.

### `Voting.json`

This file contains the ABI and network details for the smart contract. It's essential for interacting with the contract from the React app.

### Usage

**Voting:** Select a candidate and click the "Vote" button. The transaction will be sent to the Ethereum network, and the vote count will update upon success.
**View Voters**: Click "Show Voters" to see who has voted and which candidate they supported.

### Troubleshooting

- **Contract Not Found:** Ensure that the Voting.sol contract is deployed to the same network that your React app is connected to. Check the network ID and contract address in `Voting.json`.
- **Connection Issues:** Check that your local blockchain is running and your MetaMask wallet is connected to the correct network.
