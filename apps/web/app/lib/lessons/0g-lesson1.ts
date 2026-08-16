import { LessonContent } from '@/app/types/lesson';

export const ogLesson1: LessonContent = {
  id: '0g-1',
  title: 'Two Networks, One Wallet, First Transaction',
  description: 'Understand what 0G actually is (four services, not one product), wire both networks into a wallet by hand, and prove which chain you are talking to by asking the RPC directly.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'typescript',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Most 0G tutorials start by telling you to click a button that adds the network for you. We are not going to do that. By the end of this lesson you will have typed the chain ID yourself, claimed testnet tokens, sent a transaction to your own address, and asked the RPC node to tell you what chain it really is. That last step is the one that saves you an afternoon later.",
    quizTransition: "You now know what the four 0G services are, why every one of them has the same discover, pay, verify shape, and which chain ID is a trap. Let's check that it stuck.",
    practiceTransition: "Time to write the code. You will build the exact network config objects a wallet expects, convert chain IDs between hex and decimal, and query the RPC without any SDK in the way.",
    celebrationMessage: "You have a funded wallet on Galileo, a transaction hash you can open in a block explorer, and a raw JSON response proving the chain ID. That is a real artefact, not a checkbox.",
    nextLessonTease: "Next: deploy a contract and hit the cancun trap, the one compiler setting that separates a working deploy from a transaction that reverts with no reason string.",
  },

  teachingSections: [
    {
      sectionTitle: 'What 0G Actually Is',
      slides: [
        {
          title: 'Four Services, Not One Product',
          content: '0G is usually described as "the AI blockchain", which is not wrong but is useless when you sit down to build. Concretely it is four services you can use independently: Chain, Compute, Storage, and DA. You can call 0G Compute without ever deploying a contract. You can pin a file to 0G Storage without touching the Compute Network. Knowing they are separable is the difference between building something and copying a demo.',
          emoji: '🧩',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Chain', content: 'An EVM-compatible L1. Your Solidity, your ABIs, your ethers code all port over unchanged. Sub-second finality and roughly 11,000 TPS per shard. This is where state, payments, and settlement live.' },
                { label: 'Compute', content: 'Decentralized AI inference and fine-tuning running on GPUs supplied by DePIN networks. You reach it either through the Router (an OpenAI-compatible gateway) or directly through the broker SDK. Two very different payment models, covered later in the track.' },
                { label: 'Storage', content: 'Content-addressed file storage. You upload bytes, you get back a Merkle root hash, and anyone can recompute that root from the same bytes to confirm you did not swap the file. The root is the receipt.' },
                { label: 'DA', content: 'Data availability. A rollup or an app publishes a blob and gets a commitment that the data was genuinely made available to the network, not just claimed to be. Sampling proves it without anyone downloading everything.' },
                { label: 'Why the split matters', content: 'Each service has its own contracts, its own balances, and its own failure modes. Depositing funds for one does not fund another. Most beginner support questions in 0G are somebody who assumed the balances were shared.' },
              ],
              explanation: 'The four independently usable services that make up 0G.',
            },
          },
        },
        {
          title: 'DePIN Supply and the Repeating Shape',
          content: 'The GPUs behind 0G Compute are not owned by 0G. They come from DePIN networks like io.net and Aethir, plus independent storage, DA, and validator operators. Because the supply side is a crowd of strangers rather than one company, every layer must answer the same three questions: which provider am I using, how do I pay them, and how do I know they did the work. Once you notice that shape, every 0G API stops feeling arbitrary.',
          emoji: '🌐',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'discover', label: 'Discover', emoji: '🔎' },
                { id: 'pay', label: 'Pay', emoji: '💸' },
                { id: 'verify', label: 'Verify', emoji: '🔐' },
              ],
              targets: [
                { id: 't-discover', label: 'List the available providers and their prices before committing' },
                { id: 't-pay', label: 'Fund a balance or sign a transaction so the provider is compensated' },
                { id: 't-verify', label: 'Check an artefact (hash, signature, attestation) that proves the work happened' },
              ],
              correctPairs: [
                { itemId: 'discover', targetId: 't-discover' },
                { itemId: 'pay', targetId: 't-pay' },
                { itemId: 'verify', targetId: 't-verify' },
              ],
              explanation: 'Every 0G service repeats this three-step shape because the supply side is decentralized.',
            },
          },
        },
        {
          title: 'Consensus and Execution Are Separate Layers',
          content: 'Architecturally 0G Chain splits a heavily tuned CometBFT consensus layer from a standard EVM execution layer. That split is why two things are simultaneously true, and beginners usually only hear one of them: your Solidity is portable, but your throughput assumptions are not Ethereum\'s. The execution layer can adopt new EVM features without touching consensus, and consensus can be retuned for speed without breaking your contracts.',
          emoji: '🏗️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Consensus layer', content: 'Optimized CometBFT, formerly Tendermint. Handles validator coordination, block production, and finality. Tuned block intervals and timeouts are where the sub-second finality comes from.' },
                { label: 'Execution layer', content: 'A standard EVM. It processes transactions and maintains state. This is the layer your contracts live on, which is why the tooling you already know still works.' },
                { label: 'What ports over', content: 'Solidity, ABIs, ethers and viem, Hardhat and Foundry, MetaMask, event logs, the whole mental model of accounts and nonces.' },
                { label: 'What does not port over', content: 'Ethereum gas price intuition, block time assumptions in your polling loops, and the assumption that whatever your compiler emits by default will execute. That last one is the subject of the next lesson.' },
              ],
              explanation: 'The modular split explains both the compatibility and the performance differences.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The Two Networks (and One Wrong Number)',
      slides: [
        {
          title: 'Galileo Testnet and Mainnet',
          content: 'There are exactly two networks you care about right now. Galileo is the testnet where you will do everything in this track. Mainnet is where real value moves. Type these values by hand rather than importing them from a chain list site. The point of typing them is that you will recognise a wrong one later.',
          emoji: '📡',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// 0G Galileo Testnet
const GALILEO = {
  chainId: 16602,
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  explorer: 'https://chainscan-galileo.0g.ai',
  faucet: 'https://faucet.0g.ai',
  symbol: '0G',
};

// 0G Mainnet
const MAINNET = {
  chainId: 16661,
  rpcUrl: 'https://evmrpc.0g.ai',
  explorer: 'https://chainscan.0g.ai',
  symbol: '0G',
};

// Legacy testnet id. Still in stale blog posts. Do not use it.
const LEGACY_TESTNET_CHAIN_ID = 16601;`,
              highlights: [
                { line: 3, explanation: 'Galileo is chain ID 16602 in decimal, which is 0x40da in hex. Wallets and JSON-RPC speak hex, humans and docs usually speak decimal.' },
                { line: 4, explanation: 'The public testnet RPC. Fine for learning. For production traffic use a third-party provider such as QuickNode, Ankr, or dRPC.' },
                { line: 6, explanation: 'The faucet gives 0.1 0G per wallet per day. That is plenty for this lesson and the next one.' },
                { line: 12, explanation: 'Mainnet is 16661, which is 0x4115 in hex. Note it is not adjacent to the testnet number, so a typo does not silently land you on the other network.' },
                { line: 19, explanation: '16601 was the older testnet identifier. It survives in cached tutorials and even in some third-party chain listings. Using it is the single most common setup failure in 0G.' },
              ],
              explanation: 'The exact network parameters, typed out rather than imported.',
            },
          },
        },
        {
          title: 'Why 16601 Looks Like It Works',
          content: 'Here is the trap in full. If you add a network to MetaMask with chain ID 16601 and the correct Galileo RPC URL, MetaMask will accept it and the network will appear to function. You can see balances. You can send transactions. Nothing screams. The failure arrives later, in a completely different tool, and by then you have stopped suspecting your wallet config.',
          emoji: '🪤',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why MetaMask accepts it', content: 'The chain ID you type is a label MetaMask uses for its own bookkeeping and for signing. As long as it does not collide with another network you have configured, MetaMask stores it happily. It does not treat a mismatch with the node as fatal by default.' },
                { label: 'Why balances still show', content: 'Balance display is just an eth_getBalance call to whatever RPC URL you supplied. The RPC URL is correct, so the balance is correct. The wrong number is sitting in the wallet metadata, not in the request.' },
                { label: 'Where it explodes: signing', content: 'EIP-155 puts the chain ID inside the signed transaction to stop replay across chains. Sign with 16601 and send to a node that is 16602 and the node rejects it, often with a message about an invalid chain ID or an unmarshallable transaction that reads like a nonce problem.' },
                { label: 'Where it explodes: verification', content: 'Contract verification and explorer APIs are keyed by chain ID. A verify command configured for 16601 posts your source to a chain that does not exist on that explorer. The response is usually a generic failure, not "your chain ID is wrong".' },
                { label: 'The habit that saves you', content: 'Never trust the config. Ask the node: call eth_chainId against the RPC URL and compare the answer to what you typed. Two lines of code, zero lost afternoons.' },
              ],
              explanation: 'The 16601 trap fails late and quietly, which is what makes it expensive.',
            },
          },
        },
        {
          title: 'What a Wallet Actually Wants',
          content: 'When you click "Add network" in MetaMask you are filling in an EIP-3085 request. Knowing its shape is useful because you will eventually add the network from your own dapp with a single call rather than asking users to type it. Note that chainId here is a hex string, not a number.',
          emoji: '🦊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// EIP-3085: wallet_addEthereumChain
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x40da',                 // 16602 in hex, note the string
    chainName: '0G Galileo Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc-testnet.0g.ai'],
    blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
  }],
});`,
              highlights: [
                { line: 5, explanation: 'Hex string with a 0x prefix, no leading zeros, lowercase digits. 16602 becomes 0x40da. Passing the number 16602 here fails with an invalid params error.' },
                { line: 7, explanation: 'The native token is 0G with 18 decimals, exactly like ether. That is why ethers.parseEther and formatEther work unchanged.' },
                { line: 8, explanation: 'rpcUrls is an array because a wallet may fall back between endpoints. For production add more than one.' },
                { line: 9, explanation: 'blockExplorerUrls is what makes the "View on explorer" links inside the wallet point at chainscan instead of nowhere.' },
              ],
              explanation: 'The EIP-3085 payload behind the MetaMask add-network dialog.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Prove It With The RPC Itself',
      slides: [
        {
          title: 'Ask the Node, Do Not Trust the Config',
          content: 'An RPC endpoint is a plain HTTP server that speaks JSON-RPC 2.0. No SDK required. Sending a raw request once is worth more than reading three pages of documentation, because from then on you know exactly what the SDK is doing on your behalf and you can debug it when it lies to you.',
          emoji: '📮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `curl -s https://evmrpc-testnet.0g.ai \\
  -X POST \\
  -H 'content-type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'

# Response:
# {"jsonrpc":"2.0","id":1,"result":"0x40da"}

# 0x40da = (4 * 16^3) + (0 * 16^2) + (13 * 16) + 10
#        = 16384 + 0 + 208 + 10
#        = 16602`,
              highlights: [
                { line: 3, explanation: 'The content-type header is not optional. Without it most nodes return a 415 or an HTML error page and you will waste time thinking the endpoint is down.' },
                { line: 4, explanation: 'Four fields, always: jsonrpc version, an id you choose, the method name, and a params array. eth_chainId takes no params but the empty array is still required.' },
                { line: 7, explanation: 'The result is a hex string, never a number. Every quantity in Ethereum JSON-RPC is hex encoded, including balances, gas, and block numbers.' },
                { line: 9, explanation: 'Convert with parseInt(hex, 16) in JavaScript, or Number(hex) which understands the 0x prefix directly. If this does not equal 16602 you are not on Galileo.' },
              ],
              explanation: 'A raw eth_chainId call and how to read the hex answer.',
            },
          },
        },
        {
          title: 'Hex to Decimal, Both Directions',
          content: 'You will move between these two representations constantly. JSON-RPC and wallet config want hex strings. Docs, humans, and explorer URLs want decimals. Practice recognising the three numbers that matter in this track so a wrong one jumps out at you before you paste it anywhere.',
          emoji: '🔢',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'hex-galileo', label: '0x40da', emoji: '🧪' },
                { id: 'hex-mainnet', label: '0x4115', emoji: '🏛️' },
                { id: 'hex-legacy', label: '0x40d9', emoji: '☠️' },
              ],
              targets: [
                { id: 't-galileo', label: '16602, the Galileo testnet you should be on' },
                { id: 't-mainnet', label: '16661, 0G Mainnet where real value moves' },
                { id: 't-legacy', label: '16601, the legacy testnet id that breaks verification' },
              ],
              correctPairs: [
                { itemId: 'hex-galileo', targetId: 't-galileo' },
                { itemId: 'hex-mainnet', targetId: 't-mainnet' },
                { itemId: 'hex-legacy', targetId: 't-legacy' },
              ],
              explanation: 'Notice that the correct and legacy testnet IDs differ by one, which is why a typo is easy and quiet.',
            },
          },
        },
        {
          title: 'The Self-Transfer and Its Receipt',
          content: 'Sending 0.001 0G from your address to your own address looks pointless. It is not. It exercises the full path (sign with the right chain ID, broadcast, get mined, produce a receipt) while risking nothing, and it hands you the artefact that proves you did it: a transaction hash anybody can open on the explorer. This is the pattern for the whole track. A lesson is finished when something verifiable exists, not when the slides end.',
          emoji: '🔁',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Confirm the node agrees with you before signing anything
const network = await provider.getNetwork();
if (network.chainId !== 16602n) {
  throw new Error('Wrong chain: ' + network.chainId);
}

const tx = await wallet.sendTransaction({
  to: wallet.address,
  value: ethers.parseEther('0.001'),
});

const receipt = await tx.wait();
console.log('hash:', receipt!.hash);
console.log('https://chainscan-galileo.0g.ai/tx/' + receipt!.hash);`,
              highlights: [
                { line: 3, explanation: 'ethers v6 uses JsonRpcProvider directly. In v5 this was ethers.providers.JsonRpcProvider. Mixing the two is the second most common 0G setup error, and lesson 2 is largely about it.' },
                { line: 8, explanation: 'chainId is a native BigInt in ethers v6, so you compare against 16602n with the n suffix. Comparing to the plain number 16602 is always false and the guard silently never fires.' },
                { line: 13, explanation: 'Sending to your own address means the only thing you lose is gas. The transaction is otherwise identical to a real transfer.' },
                { line: 17, explanation: 'tx.wait() resolves once the transaction is mined. On 0G this returns fast because finality is sub-second, so you do not need the long polling timeouts Ethereum tutorials use.' },
                { line: 19, explanation: 'This URL is your proof artefact. Open it, screenshot it, keep the hash. That is what completes this lesson.' },
              ],
              explanation: 'The full sign, send, confirm loop with a chain ID guard in front of it.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'You call eth_chainId against https://evmrpc-testnet.0g.ai and the node returns "0x40da". What decimal chain ID is that, and what does it tell you?',
      options: [
        '16601, the Galileo testnet',
        '16602, the Galileo testnet',
        '16661, 0G Mainnet',
        '4058, an unrelated chain',
      ],
      correctAnswer: 1,
      explanation: '0x40da is 16384 + 208 + 10 = 16602, the Galileo testnet. Every JSON-RPC quantity comes back hex encoded, so you always have to convert. In JavaScript, parseInt("0x40da", 16) or Number("0x40da") both give 16602.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Break the hex into place values: 4 is 4 * 4096, d is 13 * 16, a is 10.',
    },
    {
      question: 'A tutorial tells you to add 0G testnet with chain ID 16601 and the correct RPC URL. Why does this appear to work in MetaMask at first?',
      options: [
        'MetaMask silently corrects the chain ID by querying the node',
        'The chain ID is only wallet-side metadata, so balance reads through the correct RPC URL still return correct values',
        '16601 and 16602 are aliases for the same network',
        'MetaMask ignores chain IDs entirely for testnets',
      ],
      correctAnswer: 1,
      explanation: 'Balance display is just eth_getBalance sent to the RPC URL you configured, and that URL is right. The wrong number sits in the wallet metadata. It only becomes fatal when the chain ID gets baked into something: an EIP-155 signature, or a verification request keyed by chain ID.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Ask yourself which requests actually carry the chain ID, and which just carry an address.',
    },
    {
      question: 'Where does the 16601 mistake actually surface as a hard failure?',
      options: [
        'Immediately, when you add the network',
        'When you check your token balance',
        'When you verify a contract on the explorer, or when a node rejects an EIP-155 signature signed for the wrong chain',
        'Only on mainnet',
      ],
      correctAnswer: 2,
      explanation: 'Contract verification is keyed by chain ID, so a verify configured for 16601 posts to a chain the explorer does not serve and returns a generic failure. Signing is the other failure point, because EIP-155 embeds the chain ID inside the signed payload specifically to prevent cross-chain replay.',
      weaknessTopic: '0g-verification',
      practiceHint: 'Think about which operations embed the chain ID rather than just using the RPC URL.',
    },
    {
      question: 'What is the relationship between 0G Compute and DePIN networks such as io.net and Aethir?',
      options: [
        '0G owns and operates its own GPU data centres; DePIN is a marketing partnership',
        'DePIN networks supply the GPUs that serve 0G Compute workloads, which is why providers must be discovered, paid, and verified individually',
        'DePIN is the name of 0G\'s storage layer',
        'DePIN providers run the consensus layer validators only',
      ],
      correctAnswer: 1,
      explanation: 'The GPU supply is decentralized and comes from networks like io.net and Aethir plus independent operators. Because you are buying from a crowd of strangers rather than one vendor, every 0G service repeats the same shape: discover a provider, pay it, verify the work.',
      weaknessTopic: '0g-economics',
      practiceHint: 'If nobody owns the hardware, what has to be true about every request you send?',
    },
    {
      question: '0G Chain separates an optimized CometBFT consensus layer from a standard EVM execution layer. What is the practical consequence for you as a developer?',
      options: [
        'You must rewrite Solidity contracts in a 0G-specific language',
        'Your Solidity and tooling port over unchanged, but throughput and finality behave differently from Ethereum',
        'Contracts run on the consensus layer, so gas is free',
        'You have to run your own validator to deploy contracts',
      ],
      correctAnswer: 1,
      explanation: 'The execution layer is a standard EVM, so Solidity, ABIs, ethers, Hardhat, and MetaMask all work as-is. The consensus layer is separately tuned CometBFT, which is where sub-second finality and roughly 11,000 TPS per shard come from. Portable code, different performance profile.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Which layer executes your contract, and which layer decides how fast blocks finalise?',
    },
    {
      question: 'You want to add 0G Mainnet from your own dapp with wallet_addEthereumChain. Which chainId value is correct?',
      options: [
        '16661 as a number',
        '"0x4115" as a hex string',
        '"16661" as a decimal string',
        '"0x40da" as a hex string',
      ],
      correctAnswer: 1,
      explanation: 'EIP-3085 requires chainId as a 0x-prefixed hex string. Mainnet is 16661 decimal, which is 0x4115. Passing a number or a decimal string returns an invalid params error, and 0x40da would be the Galileo testnet instead.',
      weaknessTopic: '0g-chain',
      practiceHint: 'Wallet RPC methods take hex strings for every quantity, including chain IDs.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Lesson 1: Two networks, one wallet, first transaction
// Run with: npx tsx src/lesson1.ts
// Requires: npm install ethers@^6.13.0 dotenv

import { ethers } from 'ethers';
import 'dotenv/config';

export const GALILEO = {
  chainId: 16602,
  chainName: '0G Galileo Testnet',
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  explorer: 'https://chainscan-galileo.0g.ai',
} as const;

export const MAINNET = {
  chainId: 16661,
  chainName: '0G Mainnet',
  rpcUrl: 'https://evmrpc.0g.ai',
  explorer: 'https://chainscan.0g.ai',
} as const;

// The legacy testnet id that still appears in stale tutorials.
export const LEGACY_TESTNET_CHAIN_ID = 16601;

// TODO 1: Convert a decimal chain ID to the 0x-prefixed lowercase hex string
// that wallet RPC methods expect.
// Example: 16602 -> '0x40da'
export function toHexChainId(chainId: number): string {
  // Your code here
}

// TODO 2: Convert a hex chain ID string back to a decimal number.
// Must handle both '0x40da' and '0X40DA'.
// Example: '0x40da' -> 16602
export function parseChainIdHex(hex: string): number {
  // Your code here
}

// TODO 3: Build the EIP-3085 params object for wallet_addEthereumChain.
// Shape: { chainId (hex string), chainName, nativeCurrency: { name, symbol,
// decimals }, rpcUrls (array), blockExplorerUrls (array) }.
// The native token is '0G' with 18 decimals.
export function buildAddChainParams(net: typeof GALILEO | typeof MAINNET) {
  // Your code here
}

// TODO 4: Ask the RPC node what chain it is, using raw JSON-RPC over fetch.
// POST {"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}
// with a content-type: application/json header.
// Return the decimal chain ID from the hex result.
export async function fetchChainId(rpcUrl: string): Promise<number> {
  // Your code here
}

// TODO 5: Guard against the 16601 trap. Fetch the real chain ID from the node
// and throw a clear Error if it does not match what the caller expected.
// Return the confirmed chain ID on success.
export async function assertChainId(rpcUrl: string, expected: number): Promise<number> {
  // Your code here
}

// TODO 6: Send 0.001 0G from the wallet to its own address and return the
// transaction hash. Use ethers v6: sendTransaction, then tx.wait().
// Remember chainId is a BigInt in v6.
export async function sendSelfTransfer(privateKey: string, rpcUrl: string): Promise<string> {
  // Your code here
}

async function main() {
  console.log('Galileo hex chainId:', toHexChainId(GALILEO.chainId));
  console.log('Node reports:', await fetchChainId(GALILEO.rpcUrl));

  await assertChainId(GALILEO.rpcUrl, GALILEO.chainId);

  if (process.env.PRIVATE_KEY) {
    const hash = await sendSelfTransfer(process.env.PRIVATE_KEY, GALILEO.rpcUrl);
    console.log('Proof:', GALILEO.explorer + '/tx/' + hash);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});`,

  solution: `// 0G Lesson 1: Two networks, one wallet, first transaction
// Run with: npx tsx src/lesson1.ts
// Requires: npm install ethers@^6.13.0 dotenv

import { ethers } from 'ethers';
import 'dotenv/config';

export const GALILEO = {
  chainId: 16602,
  chainName: '0G Galileo Testnet',
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  explorer: 'https://chainscan-galileo.0g.ai',
} as const;

export const MAINNET = {
  chainId: 16661,
  chainName: '0G Mainnet',
  rpcUrl: 'https://evmrpc.0g.ai',
  explorer: 'https://chainscan.0g.ai',
} as const;

export const LEGACY_TESTNET_CHAIN_ID = 16601;

// TODO 1: decimal chain ID to hex string
export function toHexChainId(chainId: number): string {
  return '0x' + chainId.toString(16).toLowerCase();
}

// TODO 2: hex chain ID string to decimal
export function parseChainIdHex(hex: string): number {
  const normalized = hex.trim().toLowerCase();
  if (!normalized.startsWith('0x')) {
    throw new Error('Expected a 0x-prefixed hex string, got: ' + hex);
  }
  return parseInt(normalized.slice(2), 16);
}

// TODO 3: EIP-3085 params for wallet_addEthereumChain
export function buildAddChainParams(net: typeof GALILEO | typeof MAINNET) {
  return {
    chainId: toHexChainId(net.chainId),
    chainName: net.chainName,
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: [net.rpcUrl],
    blockExplorerUrls: [net.explorer],
  };
}

// TODO 4: raw JSON-RPC eth_chainId
export async function fetchChainId(rpcUrl: string): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: [],
    }),
  });

  if (!res.ok) {
    throw new Error('RPC returned HTTP ' + res.status);
  }

  const json = (await res.json()) as { result?: string; error?: { message: string } };
  if (json.error) {
    throw new Error('RPC error: ' + json.error.message);
  }
  if (!json.result) {
    throw new Error('RPC returned no result');
  }

  return parseChainIdHex(json.result);
}

// TODO 5: guard against the 16601 trap
export async function assertChainId(rpcUrl: string, expected: number): Promise<number> {
  const actual = await fetchChainId(rpcUrl);
  if (actual !== expected) {
    throw new Error(
      'Chain ID mismatch. You configured ' + expected + ' but ' + rpcUrl +
      ' reports ' + actual + '. If you configured ' + LEGACY_TESTNET_CHAIN_ID +
      ', that is the legacy testnet id and it will break contract verification.'
    );
  }
  return actual;
}

// TODO 6: self-transfer of 0.001 0G
export async function sendSelfTransfer(privateKey: string, rpcUrl: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // chainId is a native BigInt in ethers v6
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(GALILEO.chainId)) {
    throw new Error('Not on Galileo. Node reports chain ' + network.chainId.toString());
  }

  const balance = await provider.getBalance(wallet.address);
  if (balance === 0n) {
    throw new Error('Wallet is empty. Claim testnet 0G from https://faucet.0g.ai');
  }

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: ethers.parseEther('0.001'),
  });

  const receipt = await tx.wait();
  if (!receipt) {
    throw new Error('Transaction was dropped before it was mined');
  }

  return receipt.hash;
}

async function main() {
  console.log('Galileo hex chainId:', toHexChainId(GALILEO.chainId));
  console.log('Mainnet hex chainId:', toHexChainId(MAINNET.chainId));
  console.log('Node reports:', await fetchChainId(GALILEO.rpcUrl));
  console.log('Add-network params:', buildAddChainParams(GALILEO));

  await assertChainId(GALILEO.rpcUrl, GALILEO.chainId);
  console.log('Chain ID confirmed by the node, not just by your config.');

  if (process.env.PRIVATE_KEY) {
    const hash = await sendSelfTransfer(process.env.PRIVATE_KEY, GALILEO.rpcUrl);
    console.log('Proof:', GALILEO.explorer + '/tx/' + hash);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});`,

  hints: [
    'toHexChainId: Number.prototype.toString(16) gives you the digits without a prefix, so prepend "0x" yourself. Do not zero-pad, wallets reject leading zeros in chain IDs.',
    'parseChainIdHex: parseInt only reads hex correctly when you either strip the 0x prefix and pass radix 16, or pass the whole string to Number(). Lowercase the input first so "0X40DA" also works.',
    'fetchChainId: the request body needs all four JSON-RPC fields (jsonrpc, id, method, params) and the content-type header is mandatory. Without it many nodes reply with an HTML error page and res.json() throws a confusing parse error.',
    'The JSON-RPC envelope can carry an error object with a 200 status, so check json.error before you touch json.result.',
    'In ethers v6, provider.getNetwork() resolves to a Network whose chainId is a BigInt. Compare with 16602n or BigInt(16602). Comparing to the plain number 16602 with !== is always true, so a naive guard never fires and gives you false confidence.',
    'ethers v6 renamed the v5 APIs you may have seen: ethers.providers.JsonRpcProvider became ethers.JsonRpcProvider, and ethers.utils.parseEther became ethers.parseEther.',
    'tx.wait() can resolve to null if the transaction is replaced or dropped, so TypeScript will make you handle that before reading receipt.hash.',
  ],

  proof: {
    label: 'Self-transfer transaction hash plus the raw eth_chainId response',
    hint: 'Add Galileo to your wallet by hand (type 16602, do not import it), claim testnet 0G from https://faucet.0g.ai, then send 0.001 0G from your address to your own address. Submit the transaction hash and open it on chainscan-galileo.0g.ai. Keep the raw JSON from your eth_chainId curl alongside it: the result must be "0x40da".',
    verifyUrl: 'https://chainscan-galileo.0g.ai',
    pattern: '^0x[a-fA-F0-9]{64}$',
  },
};
