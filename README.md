# Voting DApp Front-End

This project is a front-end React application that interacts with a Solidity smart contract to facilitate a decentralized voting system. The app allows users to view candidates, cast votes, and view voting results.

## Features

1. **Connect to Blockchain**: Automatically connects to the Ethereum blockchain using a provider (e.g., Ganache or Sepolia Testnet).
2. **Display Candidates**: Fetches and displays a list of candidates from the smart contract.
3. **Vote**: Allows users to vote for their chosen candidate. Each user can only vote once.
4. **Display Voters**: Shows a list of voters and the candidates they voted for.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- A local Ethereum blockchain running (e.g., Ganache).
- A deployed instance of the `Voting.sol` smart contract.

## Getting Started

Follow these steps to set up and run the project locally.

### 1.Clone the Repository

```
git clone https://github.com/your-username/voting-dapp-frontend.git
cd voting-dapp-frontend
```

### 2. Install Dependencies

```
npm install
```

### 3. Configure the App

In src/vote.js, update the provider and contract information to match your local setup:

```
const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");
```

### 4.Start the App

```
npm start
```

The application will be available at http://localhost:3000.

## Main Components

### `vote.js`

This is the primary file where the React component for the Voting DApp is implemented. Key features include:

#### State Management:

- **`account`**: The current user's account address.
- **`candidates`**: The list of candidates retrieved from the blockchain.
- **`contract`**: The smart contract instance.
- **`provider`** : The ethers.js provider instance.
- **`votes`**: The list of voters and their votes.
- **`loading`**: A flag to manage the loading state.

#### Functions

- **`loadBloackchainData`**:Connects to the blockchain, retrieves candidates and initializes the state.
- **`voteCandidate`**: Allows a user to vote for a candidate.
- **`loadVotersData`**: Fetches and displays information about the voters.

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
- **Failed Transactions:** Ensure that your local blockchain is running and that the contract has sufficient gas to process transactions.
