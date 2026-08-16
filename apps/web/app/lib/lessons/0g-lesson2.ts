import { LessonContent } from '@/app/types/lesson';

export const ogLesson2: LessonContent = {
  id: '0g-2',
  title: 'Deploy and Verify a Contract: The Cancun Trap',
  description: 'Ship a real contract to Galileo and get it verified. Along the way, meet the three traps that cost 0G newcomers an afternoon each: the evmVersion setting, the /open/api path, and the ethers v5 code sitting inside the official docs.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 2,
  language: 'typescript',
  prerequisiteLessons: ['0g-1'],

  narrative: {
    welcomeMessage: "0G Chain is EVM-identical, which is exactly why it is dangerous. Everything you know still works, so when something breaks you look everywhere except the one line that is actually wrong. This lesson walks you into three specific traps on purpose, so that when you hit them for real you recognise them in ten seconds instead of three hours.",
    quizTransition: "You know why a deploy can succeed and the very next call still fail with no revert reason. Let's make sure you can diagnose it cold.",
    practiceTransition: "Now build the config that avoids all three traps. You will assemble a Hardhat config from scratch, wire the verification endpoint to the correct path, and write a deploy script in ethers v6 rather than the v5 the docs still show.",
    celebrationMessage: "You have a verified contract with green source on the explorer and a broken twin that proves you understand why the setting matters. That second artefact is worth more than the first.",
    nextLessonTease: "Next: your first inference through the 0G Compute Router, with an OpenAI-compatible SDK and no crypto required to get started.",
  },

  teachingSections: [
    {
      sectionTitle: 'The One Setting That Is Not Optional',
      slides: [
        {
          title: 'Why evmVersion Fails at Runtime, Not Compile Time',
          content: 'Solidity compiles against a target EVM fork. If you do not name one, the compiler picks its own default, and that default moves forward with every release. 0G Chain supports Cancun-Deneb and Pectra. Compile against something newer and solc will happily emit opcodes 0G does not implement. Nothing complains, because the compiler has no idea which chain you are about to deploy to. The chain finds out later, and the way it tells you is brutal.',
          emoji: '💥',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why the compiler stays silent', content: 'solc targets a fork, not a network. It has no list of which chain implements what. If you ask for a newer target, it assumes you know what you are doing and emits the newer opcodes.' },
                { label: 'Why the deploy still succeeds', content: 'Deployment runs the constructor and stores the returned runtime bytecode. If the unsupported opcode sits in a function you did not call during construction, nothing touches it. The chain stores bytes it cannot execute and reports success.' },
                { label: 'What the failure looks like', content: 'The first call that reaches the unknown opcode halts execution as an invalid instruction. All the gas is consumed and no revert reason string comes back, because there is no revert, only an invalid opcode. Your error handler prints an empty reason and you start suspecting your ABI.' },
                { label: 'Why it burns an afternoon', content: 'Every signal points somewhere else. The compile was clean, the deploy succeeded, the address exists on the explorer, and the failure has no message. Almost nobody suspects a compiler setting on the first day.' },
                { label: 'The rule', content: 'Pin evmVersion to "cancun" in every 0G project, every time, in the config rather than on the command line. It costs one line and removes a whole class of mystery.' },
              ],
              explanation: 'The compiler targets a fork; the chain implements a fork; nothing checks that they agree.',
            },
          },
        },
        {
          title: 'Pinning the Compiler',
          content: 'Here is the setting in a Hardhat config. Two details matter beyond evmVersion itself. First, your verification settings must match your compile settings exactly, so the optimizer runs and viaIR flag are part of the contract identity, not preferences. Second, pinning the solc version protects you from a future release quietly changing its default target underneath you.',
          emoji: '📌',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// hardhat.config.ts
import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      evmVersion: 'cancun',
      optimizer: { enabled: true, runs: 200 },
      viaIR: false,
    },
  },
  networks: {
    galileo: {
      url: 'https://evmrpc-testnet.0g.ai',
      chainId: 16602,
      accounts: [process.env.PRIVATE_KEY!],
    },
    mainnet: {
      url: 'https://evmrpc.0g.ai',
      chainId: 16661,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;`,
              highlights: [
                { line: 8, explanation: 'Pin the solc version rather than using a caret range. Compiler releases have changed their default EVM target before, and a lockfile-free bump is how a working project starts emitting opcodes 0G rejects.' },
                { line: 10, explanation: 'The line the whole lesson is about. Without it you are trusting whatever default your solc version happens to ship with.' },
                { line: 11, explanation: 'Optimizer settings are part of the contract identity for verification. If you compile with runs 200 and verify claiming 999, the bytecode will not match and verification fails with an unhelpful message.' },
                { line: 12, explanation: 'viaIR only needs enabling for contracts with heavy inline assembly or stack-too-deep errors. Set it explicitly so you remember it must match at verification time.' },
                { line: 18, explanation: 'Galileo is 16602. Lesson 1 covered why 16601 will look fine here and then break the verify step.' },
                { line: 21, explanation: 'Keep mainnet configured from day one, but never deploy there before the same contract has been through the testnet cycle.' },
              ],
              explanation: 'A Hardhat config with the compiler pinned and both networks defined.',
            },
          },
        },
        {
          title: 'The Contract You Will Ship',
          content: 'Twenty lines is enough. Store a bytes32, emit an event when it changes, refuse an empty value. Small on purpose: verification failures are much easier to read when the contract is not the variable. The bytes32 is also useful later in the track, because a 0G Storage root hash is exactly 32 bytes and this contract becomes the on-chain pointer to it.',
          emoji: '📜',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// contracts/ProofBox.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract ProofBox {
    bytes32 public proof;
    address public immutable owner;

    event ProofSet(address indexed setter, bytes32 indexed proof, uint256 at);

    constructor() {
        owner = msg.sender;
    }

    function setProof(bytes32 newProof) external {
        require(newProof != bytes32(0), "empty proof");
        proof = newProof;
        emit ProofSet(msg.sender, newProof, block.timestamp);
    }
}`,
              highlights: [
                { line: 3, explanation: 'Exact pragma, no caret. It must agree with the version in your Hardhat config or verification will compile different bytecode than you deployed.' },
                { line: 6, explanation: 'A public state variable gives you a free getter called proof(), which is what you will call from the explorer to confirm the write landed.' },
                { line: 7, explanation: 'immutable is stored in the bytecode rather than storage, so reading it costs no SLOAD. It also means the value is baked in at construction and cannot change.' },
                { line: 9, explanation: 'Indexing setter and proof makes both filterable in event queries. Indexed parameters go into log topics; non-indexed ones go into the data blob and cannot be filtered on.' },
                { line: 16, explanation: 'A require with a reason string. Remember this: when you break the build on purpose in the practice step, the failure you see will have no reason string at all, and that absence is the diagnosis.' },
              ],
              explanation: 'A minimal contract with one storage write and one event.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Verification and the Path Nobody Gets Right',
      slides: [
        {
          title: 'What Verification Actually Proves',
          content: 'Deploying puts bytecode on chain. Nobody can read bytecode, so nobody can tell whether your contract does what your README claims. Verification uploads your source, the explorer recompiles it with the exact settings you declare, and checks that the result matches the deployed bytes. If it matches you get readable source and a working read/write UI on the explorer. This is why compile settings are identity, not taste.',
          emoji: '✅',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What must match exactly', content: 'Compiler version, evmVersion, optimizer enabled flag, optimizer runs, viaIR, and the constructor arguments. Any single mismatch produces a bytecode difference and the verification is rejected.' },
                { label: 'Why the metadata hash matters', content: 'solc appends a metadata hash of your source and settings to the end of the bytecode. Setting metadata bytecodeHash to "none" strips it, which some teams do for reproducible builds. Whatever you choose, verification must use the same choice.' },
                { label: 'The API key', content: '0G Chainscan does not require a real Etherscan-style key. Put a placeholder string in the config. Leaving the field out entirely makes the Hardhat verify plugin error before it ever reaches the network.' },
                { label: 'What green source buys you', content: 'Anyone can read what your contract does, call view functions from the explorer, and diff it against a repo. For this track, a verified address is the proof artefact. An unverified address proves only that you paid gas.' },
              ],
              explanation: 'Verification is a reproducible-build check, which is why every compiler setting is load-bearing.',
            },
          },
        },
        {
          title: 'The /open/api Trap',
          content: 'Here is a trap you can only hit if you are doing the right thing and reading the source material. The official 0G agent skill for deploying contracts points its verifier URL at chainscan-galileo.0g.ai/api. The official documentation points at chainscan-galileo.0g.ai/open/api. They disagree, and the docs are the correct one. If your verify silently fails with an unhelpful response, check this path before you check anything else.',
          emoji: '🧭',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// hardhat.config.ts, continued
etherscan: {
  apiKey: {
    galileo: 'PLACEHOLDER',
    mainnet: 'PLACEHOLDER',
  },
  customChains: [
    {
      network: 'galileo',
      chainId: 16602,
      urls: {
        apiURL: 'https://chainscan-galileo.0g.ai/open/api',  // correct
        browserURL: 'https://chainscan-galileo.0g.ai',
      },
    },
    {
      network: 'mainnet',
      chainId: 16661,
      urls: {
        apiURL: 'https://chainscan.0g.ai/open/api',
        browserURL: 'https://chainscan.0g.ai',
      },
    },
  ],
},

// Then: npx hardhat verify --network galileo <ADDRESS>
// WRONG, from skills/chain/deploy-contract/SKILL.md:
//   --verifier-url https://chainscan-galileo.0g.ai/api`,
              highlights: [
                { line: 3, explanation: 'The apiKey keys must match your network names exactly. A mismatch here produces a confusing "not configured" error that reads like the customChains block is missing.' },
                { line: 12, explanation: 'The correct verification endpoint is /open/api. The path is /open/api on both networks, and the browserURL keeps its bare domain.' },
                { line: 13, explanation: 'browserURL is only used to print the success link. It never has the /open/api suffix.' },
                { line: 20, explanation: 'Mainnet follows the identical pattern with the chainscan.0g.ai domain and chain ID 16661.' },
                { line: 29, explanation: 'This is the wrong path as published in the deploy-contract agent skill. When two sources of truth disagree, the documentation wins here. Verify the path yourself rather than believing either one.' },
              ],
              explanation: 'The verification endpoints, with the wrong path shown so you recognise it.',
            },
          },
        },
        {
          title: 'Which URL Does What',
          content: 'Three URLs, three jobs, and mixing them up is the fastest way to a verify command that hangs or 404s. Sort them out once and the config stops being a copy-paste ritual you cannot debug.',
          emoji: '🔗',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'rpc', label: 'https://evmrpc-testnet.0g.ai', emoji: '📡' },
                { id: 'apiurl', label: 'https://chainscan-galileo.0g.ai/open/api', emoji: '🔍' },
                { id: 'browser', label: 'https://chainscan-galileo.0g.ai', emoji: '🖥️' },
                { id: 'faucet', label: 'https://faucet.0g.ai', emoji: '🚰' },
              ],
              targets: [
                { id: 't-rpc', label: 'Where transactions are broadcast and state is read (networks.url)' },
                { id: 't-apiurl', label: 'Where source is submitted for verification (customChains apiURL)' },
                { id: 't-browser', label: 'Where a human opens the verified contract (customChains browserURL)' },
                { id: 't-faucet', label: 'Where the gas to deploy comes from, 0.1 0G per wallet per day' },
              ],
              correctPairs: [
                { itemId: 'rpc', targetId: 't-rpc' },
                { itemId: 'apiurl', targetId: 't-apiurl' },
                { itemId: 'browser', targetId: 't-browser' },
                { itemId: 'faucet', targetId: 't-faucet' },
              ],
              explanation: 'Four endpoints with four distinct roles in a single deploy-and-verify cycle.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The ethers v5 Landmine in the Docs',
      slides: [
        {
          title: 'Two Sources of Truth, Two Different APIs',
          content: 'The third trap is the meanest, because it punishes copy-pasting from the official integration guide. That guide is written in ethers v5: contract.deployed(), contract.address, ethers.utils.keccak256. The official 0G agent skills mandate ethers v6, where those three things are waitForDeployment(), await getAddress(), and ethers.keccak256. Paste the doc snippet into a v6 project and it throws at runtime with a message about a function that does not exist. The scaffold installs v6, so this will happen to you.',
          emoji: '⚠️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'v5-deployed', label: 'await contract.deployed()', emoji: '5️⃣' },
                { id: 'v5-address', label: 'contract.address', emoji: '5️⃣' },
                { id: 'v5-utils', label: 'ethers.utils.keccak256(x)', emoji: '5️⃣' },
                { id: 'v5-provider', label: 'new ethers.providers.JsonRpcProvider(url)', emoji: '5️⃣' },
              ],
              targets: [
                { id: 'v6-deployed', label: 'await contract.waitForDeployment()' },
                { id: 'v6-address', label: 'await contract.getAddress()' },
                { id: 'v6-utils', label: 'ethers.keccak256(x)' },
                { id: 'v6-provider', label: 'new ethers.JsonRpcProvider(url)' },
              ],
              correctPairs: [
                { itemId: 'v5-deployed', targetId: 'v6-deployed' },
                { itemId: 'v5-address', targetId: 'v6-address' },
                { itemId: 'v5-utils', targetId: 'v6-utils' },
                { itemId: 'v5-provider', targetId: 'v6-provider' },
              ],
              explanation: 'Match each ethers v5 pattern from the docs to its v6 replacement.',
            },
          },
        },
        {
          title: 'A Deploy Script That Actually Runs',
          content: 'This is the v6 version. Notice that it checks the chain before it spends anything, checks the balance before it deploys, and prints the explorer URL at the end. Those three habits turn a script you run once into a script you can hand to somebody else.',
          emoji: '🚀',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// scripts/deploy.ts
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  const net = await ethers.provider.getNetwork();
  if (net.chainId !== 16602n) {
    throw new Error('Expected Galileo 16602, got ' + net.chainId);
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(balance), '0G');

  const factory = await ethers.getContractFactory('ProofBox');
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('ProofBox:', address);
  console.log('https://chainscan-galileo.0g.ai/address/' + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`,
              highlights: [
                { line: 8, explanation: 'BigInt comparison with the n suffix. In ethers v6 chainId is a native BigInt, so comparing to the number 16602 is always unequal and the guard never fires.' },
                { line: 13, explanation: 'ethers.formatEther, not ethers.utils.formatEther. The utils namespace was flattened in v6 and is the single most common paste error from older tutorials.' },
                { line: 16, explanation: 'factory.deploy() returns as soon as the transaction is sent. The contract is not usable yet, which is why the next line exists.' },
                { line: 17, explanation: 'waitForDeployment replaces the v5 deployed() call. If you paste .deployed() from the 0G integration guide, this is exactly where it throws.' },
                { line: 19, explanation: 'getAddress() is asynchronous in v6. contract.address from v5 returns undefined here, and undefined then flows into your verify command as the address argument.' },
              ],
              explanation: 'A deploy script in ethers v6 with guards in front of every irreversible step.',
            },
          },
        },
        {
          title: 'Breaking It On Purpose',
          content: 'The last step is the one people skip, and it is the one that teaches. Remove evmVersion from the config, add a function that uses transient storage, redeploy, and call it. The deploy succeeds. The call dies with all gas consumed and no reason string. Once you have seen that specific signature with your own eyes, you will never spend three hours on it in a real project.',
          emoji: '🧪',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'The change', content: 'Delete the evmVersion line so solc falls back to its own default target, then add a function that writes to transient storage with tstore in inline assembly, or any feature from a fork newer than cancun.' },
                { label: 'What you observe', content: 'Compile: clean. Deploy: succeeds, real address, real receipt. Call: reverted, gas fully consumed, empty reason string. Some tooling reports it as "transaction ran out of gas" which sends you off optimising a function that never executed a single useful instruction.' },
                { label: 'Fix one, the compiler setting', content: 'Put evmVersion back to "cancun". This is the fix you should always reach for, because it states your intent explicitly and survives compiler upgrades.' },
                { label: 'Fix two, the version downgrade', content: 'Pin solc to a release whose default target is cancun or older rather than a newer fork. This works, but it is fragile: it depends on a default you did not write down, and the next person who bumps the version reintroduces the bug.' },
                { label: 'How to tell the two failures apart', content: 'A require failure carries your reason string and refunds unused gas. An invalid opcode carries no reason and consumes everything. Reason string present means your logic rejected the call; reason string absent with full gas burned means the chain could not execute your bytecode.' },
              ],
              explanation: 'Reproducing the failure deliberately is the only way to recognise it instantly later.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'Your deploy to Galileo succeeded and the contract address exists on the explorer, but the first call reverts with no revert reason and consumes all the gas. What is the most likely cause?',
      options: [
        'A require statement failed inside the function',
        'The contract was compiled for an EVM fork newer than 0G supports, so the call hit an invalid opcode',
        'The RPC endpoint is rate limiting you',
        'The contract ran out of storage',
      ],
      correctAnswer: 1,
      explanation: 'Deployment only stores the runtime bytecode; it never executes the functions inside it. If the compiler targeted a fork newer than Cancun-Deneb or Pectra, the unsupported opcode is only reached on the first call. An invalid instruction is not a revert, so no reason string comes back and all the gas is consumed.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Ask what actually runs at deploy time versus at call time.',
    },
    {
      question: 'What are the two documented fixes for that failure?',
      options: [
        'Increase the gas limit, or redeploy with more constructor arguments',
        'Set evmVersion to "cancun" in the compiler settings, or downgrade solc to a release whose default target is cancun or older',
        'Switch to the mainnet RPC, or use a third-party RPC provider',
        'Enable viaIR, or disable the optimizer',
      ],
      correctAnswer: 1,
      explanation: 'Explicitly pinning evmVersion to "cancun" is the fix you should prefer, because it states intent and survives compiler upgrades. Downgrading the compiler works too, but it relies on an implicit default rather than a written one, so the bug returns the next time somebody bumps the version.',
      weaknessTopic: '0g-chain',
      practiceHint: 'One fix names the target explicitly; the other relies on a default.',
    },
    {
      question: 'What is the correct verification apiURL for the Galileo testnet explorer?',
      options: [
        'https://chainscan-galileo.0g.ai/api',
        'https://chainscan-galileo.0g.ai/open/api',
        'https://evmrpc-testnet.0g.ai/api',
        'https://api.chainscan-galileo.0g.ai',
      ],
      correctAnswer: 1,
      explanation: 'The documented path is /open/api on both networks. The deploy-contract agent skill publishes /api, which is wrong. When two sources disagree, verify against a live call rather than picking the one you read most recently.',
      weaknessTopic: '0g-verification',
      practiceHint: 'The browserURL is the bare domain; the apiURL has an extra path segment on it.',
    },
    {
      question: 'You copy the deploy script from the 0G integration guide into a project scaffolded with ethers v6. What breaks first?',
      options: [
        'Nothing, the two versions are compatible',
        'await contract.deployed() throws, because v6 renamed it to waitForDeployment()',
        'The private key format changed between versions',
        'The RPC URL is rejected by v6',
      ],
      correctAnswer: 1,
      explanation: 'The guide is written in ethers v5 while the official skills mandate v6. The three landmines are deployed() to waitForDeployment(), contract.address to await contract.getAddress(), and the ethers.utils namespace being flattened onto ethers directly.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Look for the methods that no longer exist on the v6 contract object.',
    },
    {
      question: 'Your verify command fails even though the source is identical to what you deployed. Which of these will NOT cause a bytecode mismatch?',
      options: [
        'A different optimizer runs value',
        'A different evmVersion',
        'A different variable name in an internal function',
        'A different solc version',
      ],
      correctAnswer: 2,
      explanation: 'Local variable names never reach the bytecode, so renaming them is invisible to verification. Compiler version, evmVersion, optimizer enabled and runs, viaIR, metadata settings, and constructor arguments all change the output bytes and must match exactly.',
      weaknessTopic: '0g-verification',
      practiceHint: 'Which of these survives compilation into the actual bytes?',
    },
    {
      question: 'Why does 0G Chain need a specific evmVersion at all if it is EVM-identical?',
      options: [
        'Because 0G uses a custom virtual machine with different opcodes',
        'Because the execution layer implements Cancun-Deneb and Pectra, and the compiler will happily emit opcodes from forks beyond what any given chain implements',
        'Because 0G contracts must be written in a 0G dialect of Solidity',
        'Because the consensus layer rejects contracts larger than 24KB',
      ],
      correctAnswer: 1,
      explanation: '0G Chain runs a standard EVM on its execution layer, supporting Cancun-Deneb and Pectra. EVM-identical means your Solidity, ABIs and tooling port over unchanged. It does not mean the chain implements every fork that your compiler is willing to target, which is precisely why you name the target yourself.',
      weaknessTopic: '0g-chain',
      practiceHint: 'EVM compatibility is about the instruction set a chain implements, and instruction sets have versions.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Lesson 2: deploy and verify, avoiding all three traps
// Requires: npm install -D hardhat @nomicfoundation/hardhat-toolbox
//                          @nomicfoundation/hardhat-verify dotenv typescript tsx
//           npm install ethers@^6.13.0

import { ethers } from 'ethers';
import 'dotenv/config';

export const GALILEO = { name: 'galileo', chainId: 16602, rpc: 'https://evmrpc-testnet.0g.ai', explorer: 'https://chainscan-galileo.0g.ai' } as const;
export const MAINNET = { name: 'mainnet', chainId: 16661, rpc: 'https://evmrpc.0g.ai', explorer: 'https://chainscan.0g.ai' } as const;

// TODO 1: Return the solidity block for hardhat.config.ts.
// version pinned to '0.8.24', evmVersion 'cancun', optimizer enabled with
// 200 runs, viaIR false. Getting evmVersion wrong is the whole lesson.
export function makeSolidityConfig() {
  // Your code here
}

// TODO 2: Return the networks block, keyed by network name, each entry with
// url, chainId, and accounts read from process.env.PRIVATE_KEY.
export function makeNetworksConfig() {
  // Your code here
}

// TODO 3: Return the etherscan block with placeholder API keys and a
// customChains entry per network.
// The verification apiURL is the explorer origin plus '/open/api'.
// The browserURL is the bare explorer origin.
export function makeEtherscanConfig() {
  // Your code here
}

// TODO 4: Assemble the three blocks into one config object with keys
// solidity, networks, etherscan.
export function buildHardhatConfig() {
  // Your code here
}

// TODO 5: Refuse to run on ethers v5. ethers.version is '6.x.y' in v6 and
// 'ethers/5.x.y' in v5. Throw a message naming the v6 replacements if the
// major version is not 6.
export function assertEthersV6(): void {
  // Your code here
}

// TODO 6: Deploy with ethers v6 directly from an artifact.
// Guard the chain ID first (BigInt comparison), then ContractFactory,
// deploy(), waitForDeployment(), getAddress(). Return the address.
export async function deployProofBox(
  abi: ethers.InterfaceAbi,
  bytecode: string,
  privateKey: string,
): Promise<string> {
  // Your code here
}

// TODO 7: Classify a failed call. Given an error, return 'invalid-opcode'
// when the message mentions an invalid opcode or the reason is missing while
// all gas was consumed, 'reverted' when a reason string is present, and
// 'unknown' otherwise.
export function classifyCallFailure(err: unknown): 'invalid-opcode' | 'reverted' | 'unknown' {
  // Your code here
}`,

  solution: `// 0G Lesson 2: deploy and verify, avoiding all three traps
// Requires: npm install -D hardhat @nomicfoundation/hardhat-toolbox
//                          @nomicfoundation/hardhat-verify dotenv typescript tsx
//           npm install ethers@^6.13.0

import { ethers } from 'ethers';
import 'dotenv/config';

export const GALILEO = { name: 'galileo', chainId: 16602, rpc: 'https://evmrpc-testnet.0g.ai', explorer: 'https://chainscan-galileo.0g.ai' } as const;
export const MAINNET = { name: 'mainnet', chainId: 16661, rpc: 'https://evmrpc.0g.ai', explorer: 'https://chainscan.0g.ai' } as const;

const NETWORKS = [GALILEO, MAINNET];

// TODO 1: solidity block
export function makeSolidityConfig() {
  return {
    version: '0.8.24',
    settings: {
      evmVersion: 'cancun',
      optimizer: { enabled: true, runs: 200 },
      viaIR: false,
    },
  };
}

// TODO 2: networks block
export function makeNetworksConfig() {
  const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];
  return Object.fromEntries(
    NETWORKS.map((net) => [
      net.name,
      { url: net.rpc, chainId: net.chainId, accounts },
    ]),
  );
}

// TODO 3: etherscan block, with the /open/api path
export function makeEtherscanConfig() {
  return {
    apiKey: Object.fromEntries(NETWORKS.map((net) => [net.name, 'PLACEHOLDER'])),
    customChains: NETWORKS.map((net) => ({
      network: net.name,
      chainId: net.chainId,
      urls: {
        apiURL: net.explorer + '/open/api',
        browserURL: net.explorer,
      },
    })),
  };
}

// TODO 4: assemble
export function buildHardhatConfig() {
  return {
    solidity: makeSolidityConfig(),
    networks: makeNetworksConfig(),
    etherscan: makeEtherscanConfig(),
  };
}

// TODO 5: refuse to run on ethers v5
export function assertEthersV6(): void {
  const version = (ethers as unknown as { version: string }).version ?? '';
  const major = version.replace('ethers/', '').split('.')[0];
  if (major !== '6') {
    throw new Error(
      'ethers ' + version + ' detected, this project needs v6. ' +
      'v6 renames: deployed() to waitForDeployment(), contract.address to ' +
      'await contract.getAddress(), and ethers.utils.* to ethers.*.',
    );
  }
}

// TODO 6: deploy with ethers v6
export async function deployProofBox(
  abi: ethers.InterfaceAbi,
  bytecode: string,
  privateKey: string,
): Promise<string> {
  assertEthersV6();

  const provider = new ethers.JsonRpcProvider(GALILEO.rpc);
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(GALILEO.chainId)) {
    throw new Error(
      'Expected Galileo ' + GALILEO.chainId + ', node reports ' + network.chainId.toString(),
    );
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  if (balance === 0n) {
    throw new Error('No 0G to pay for gas. Claim some at https://faucet.0g.ai');
  }
  console.log('Balance:', ethers.formatEther(balance), '0G');

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('ProofBox:', address);
  console.log(GALILEO.explorer + '/address/' + address);
  return address;
}

// TODO 7: classify a failed call
export function classifyCallFailure(err: unknown): 'invalid-opcode' | 'reverted' | 'unknown' {
  const e = err as { message?: string; reason?: string | null; receipt?: { gasUsed?: bigint }; gasLimit?: bigint };
  const message = (e?.message ?? '').toLowerCase();

  if (message.includes('invalid opcode') || message.includes('invalid instruction')) {
    return 'invalid-opcode';
  }

  // An invalid opcode burns the entire gas limit and carries no reason string.
  const noReason = !e?.reason;
  const burnedEverything =
    typeof e?.receipt?.gasUsed === 'bigint' &&
    typeof e?.gasLimit === 'bigint' &&
    e.receipt.gasUsed === e.gasLimit;
  if (noReason && burnedEverything) {
    return 'invalid-opcode';
  }

  if (e?.reason) return 'reverted';
  return 'unknown';
}`,

  hints: [
    'makeSolidityConfig: the settings object holds evmVersion, optimizer and viaIR. Putting evmVersion next to version instead of inside settings is silently ignored by Hardhat, which is a nasty way to think you fixed the bug.',
    'makeEtherscanConfig: the keys in apiKey must match your network names exactly, otherwise the verify plugin reports the chain as unconfigured even though customChains is right there.',
    'The apiURL is the explorer origin with /open/api appended. The browserURL is the bare origin with no suffix. Mixing them up gives you a 404 on submit or a broken success link.',
    'assertEthersV6: ethers.version is "6.13.2" in v6 and "ethers/5.7.2" in v5, so strip a leading "ethers/" before splitting on the dot.',
    'deployProofBox: provider.getNetwork() resolves to a Network whose chainId is a BigInt. Use BigInt(16602) or the 16602n literal, never the plain number.',
    'ContractFactory.deploy() only sends the transaction. You must await waitForDeployment() before the address is usable, and getAddress() is async in v6.',
    'classifyCallFailure: the distinguishing signal is the absence of a reason string combined with gasUsed equal to the gas limit. A require failure gives you a reason and refunds the unused gas; an invalid opcode gives you neither.',
    'When you deliberately break the build, do not change the contract logic at the same time. Change only the evmVersion line so the failure has exactly one possible cause.',
  ],

  proof: {
    label: 'Verified contract address plus the failing tx hash from the broken build',
    hint: 'Deploy ProofBox to Galileo, run npx hardhat verify --network galileo <ADDRESS>, and open the address on chainscan-galileo.0g.ai until the source shows as verified. Then remove evmVersion, add a function using transient storage, redeploy, call it, and submit that failing transaction hash alongside the verified address. Two artefacts: one that works and one that proves you know why it did not.',
    verifyUrl: 'https://chainscan-galileo.0g.ai',
    pattern: '^0x[a-fA-F0-9]{40}$',
  },
};
