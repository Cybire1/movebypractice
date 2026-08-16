import { LessonContent } from '@/app/types/lesson';

export const ogLesson10: LessonContent = {
  id: '0g-10',
  title: 'The Storage to Chain Seam',
  description:
    'A contract stores a 32-byte root hash and never the data. Learn the ordering rule that keeps that pointer honest, why nothing on-chain can enforce it, and how to build a reader that proves the bytes it fetched.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 10,
  language: 'typescript',
  prerequisiteLessons: ['0g-9'],

  narrative: {
    welcomeMessage:
      'You can put bytes in storage (lesson 8) and prove the bytes that come back are the right ones (lesson 9). This lesson joins those to the chain. The join is one line of Solidity holding one bytes32 value, and it is the single most reused pattern in the whole 0G stack. Get the ordering wrong and you create a pointer to nothing that no smart contract on earth can detect.',
    quizTransition:
      'You have the contract, the ordering, and the read path. The quiz is mostly about one uncomfortable idea: the chain cannot check the thing you most want it to check.',
    practiceTransition:
      'Time to build both halves. A writer that uploads first and registers second, a reader that pulls the hash from chain and proves the bytes, and a dangling-pointer test that demonstrates exactly where the failure surfaces.',
    celebrationMessage:
      'You have shipped a working cross-layer pointer with a verified read path and a test that proves the failure mode is real. That is the seam every 0G product is built on, and you now own it end to end.',
    nextLessonTease:
      'Next up, the same seam restacked: ERC-7857 iNFTs wrap it in an encrypted payload plus a TEE re-encryption oracle, and 0G DA turns it into blob commitments that a rollup derivation pipeline consumes instead of a user contract.',
  },

  teachingSections: [
    {
      sectionTitle: 'Hash On-Chain, Bytes Off-Chain',
      slides: [
        {
          title: 'Why the Data Cannot Live on the Chain',
          content:
            'Every validator on 0G Chain executes and stores every byte your contract writes, forever. That is what makes chain state trustworthy and also what makes it the most expensive storage humanity has ever built. Storage networks invert the tradeoff: cheap, replicated, and not executed by anyone. The seam takes the one property you need from the chain, an agreed and permanent commitment, and leaves the bulk where bulk is cheap. Thirty two bytes on-chain, gigabytes off it.',
          emoji: '⚖️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What goes on-chain',
                  content:
                    'The 32-byte root hash as bytes32, the uploader address, a timestamp, and a short metadata string. That is the entire record. It is small enough to be cheap and complete enough to be a claim anyone can check later.',
                },
                {
                  label: 'What stays off-chain',
                  content:
                    'The bytes. Model weights, images, JSON documents, agent memory, training sets. None of it touches consensus and none of it is replicated by validators.',
                },
                {
                  label: 'What the chain guarantees',
                  content:
                    'That this address registered this exact 32-byte value at this block, and that the value has not changed since. Ordering, attribution, and immutability. Nothing else.',
                },
                {
                  label: 'What the chain does not guarantee',
                  content:
                    'That any data matching the hash exists anywhere. The EVM cannot make an HTTP request, cannot read a storage node, and cannot be woken by a callback when an upload fails. The pointer is a claim, not a fact.',
                },
              ],
              explanation:
                'Splitting the guarantee precisely. Learners usually assume registering a hash implies the data exists. Naming what is and is not guaranteed sets up the ordering rule.',
            },
          },
        },
        {
          title: 'The Registry Contract',
          content:
            'This is the whole contract. A struct with four fields, a mapping, a counter, and an event. It is deliberately boring, because the interesting behavior is not in the Solidity. Note what registerFile does not do: it does not check that the hash is nonzero, it does not check that the data exists, and it cannot. Its only job is to make a claim permanent and attributable.',
          emoji: '📜',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// contracts/StorageRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StorageRegistry {
    struct FileRecord {
        bytes32 rootHash;
        address uploader;
        uint256 timestamp;
        string metadata;
    }

    mapping(uint256 => FileRecord) public files;
    uint256 public fileCount;

    event FileRegistered(uint256 indexed id, bytes32 rootHash, address uploader);

    function registerFile(bytes32 rootHash, string calldata metadata) external returns (uint256) {
        uint256 id = fileCount++;
        files[id] = FileRecord({
            rootHash: rootHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            metadata: metadata
        });
        emit FileRegistered(id, rootHash, msg.sender);
        return id;
    }

    function getFile(uint256 id) external view returns (FileRecord memory) {
        return files[id];
    }
}`,
              highlights: [
                {
                  line: 7,
                  explanation:
                    'bytes32, not string and not bytes. A 0G root hash is exactly 32 bytes, so it fits one storage slot. Storing it as a string would cost several times more gas for zero benefit.',
                },
                {
                  line: 22,
                  explanation:
                    'msg.sender is captured by the contract, not passed in, so the uploader claim cannot be forged in the record. block.timestamp on the next line gives you ordering you can prove later.',
                },
                {
                  line: 16,
                  explanation:
                    'The event is how your reader finds the id. registerFile returns uint256, but a return value from a state-changing call is not available to an off-chain caller. You parse FileRegistered from the receipt logs instead.',
                },
                {
                  line: 18,
                  explanation:
                    'No validation of rootHash beyond its type. There is nothing to validate against. This function accepts any 32 bytes with the same enthusiasm.',
                },
                {
                  line: 30,
                  explanation:
                    'A view function, so reads are free and need only a provider, no wallet and no gas.',
                },
              ],
              explanation:
                'The reference StorageRegistry from the cross-layer skill, annotated for gas shape and for the id-via-event detail that trips up first integrations.',
            },
          },
        },
        {
          title: 'The Pointer Convention',
          content:
            'Once a root hash lives on-chain you need a way to say "this field is a 0G Storage pointer" to every other system that reads it. The convention that has emerged is a URI scheme: 0g:// followed by the root hash. It is used in production iNFT metadata today, where the token description carries fields like metadata and memory, each holding a 0g:// pointer. The scheme is not magic, it is a label. What makes it dependable is that the thing after the slashes is a content commitment, so the same pointer always resolves to the same bytes or to nothing at all.',
          emoji: '🔗',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'Content addressed, not location addressed',
                  content:
                    'https://cdn.example.com/file.json names a place, and the bytes at that place can change tomorrow. 0g://0xabc... names the bytes themselves. A silent swap is impossible: change one byte and the pointer no longer resolves to it.',
                },
                {
                  label: 'Two pointers, one token',
                  content:
                    'A real agent NFT commonly carries two roots: one for static metadata and one for accumulated memory. The memory pointer is replaced as the agent learns, and every replacement is an on-chain event with a timestamp, which gives you a free audit trail.',
                },
                {
                  label: 'Why not store the JSON on-chain',
                  content:
                    'A 2KB metadata blob costs roughly sixty times the gas of one bytes32 slot, and it can never be updated cheaply. Store the root and put the JSON in storage where rewriting it costs a fraction of a token.',
                },
                {
                  label: 'The dangling pointer',
                  content:
                    'A 0g:// URI whose bytes were never uploaded looks exactly like a working one. It is 66 characters of valid hex either way. This is the failure the rest of the lesson is about.',
                },
              ],
              explanation:
                'The 0g:// convention grounded in real iNFT usage, leading into the dangling pointer problem.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-010-a',
    },
    {
      sectionTitle: 'Ordering Is the Safety Property',
      slides: [
        {
          title: 'Upload First. Always.',
          content:
            'You must complete the upload before you register the hash. Not because a rule says so, but because of what happens if you do not. Register first and the contract now holds a permanent, attributable, timestamped pointer to data that does not exist. There is no oracle watching, no callback the storage layer can fire, and no failure mode the EVM can observe. The transaction succeeded. The event emitted. Your indexer picked it up. Everything looks correct at every layer that can see anything, and the file is simply not there.',
          emoji: '⏱️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// BAD: the ordering that creates a pointer to nothing
const [tree] = await file.merkleTree();
const rootHash = tree.rootHash();
await registry.registerFile(rootHash, metadata);   // committed forever
await indexer.upload(file, RPC_URL, wallet);       // may fail. nothing rolls back.

// GOOD: upload, confirm, then register
const [tree, treeErr] = await file.merkleTree();
if (treeErr !== null) throw treeErr;
const rootHash = tree.rootHash();

const [tx, uploadErr] = await indexer.upload(file, RPC_URL, wallet);
if (uploadErr !== null) throw uploadErr;           // stop here. register nothing.

const registerTx = await registry.registerFile(rootHash, metadata);
await registerTx.wait();                            // now the pointer is true`,
              highlights: [
                {
                  line: 4,
                  explanation:
                    'The root hash is computable from local bytes alone, which is exactly why this mistake is so easy. You can register a hash for a file you never intend to upload.',
                },
                {
                  line: 5,
                  explanation:
                    'If this rejects, throws, runs out of gas on submit(), or the process is killed midway, line 4 is already permanent. There is no transaction spanning both layers.',
                },
                {
                  line: 13,
                  explanation:
                    'The early return is the whole safety mechanism. An upload error must abort before any chain write, because the chain write is the irreversible half.',
                },
                {
                  line: 16,
                  explanation:
                    'Wait for the receipt. An unmined register is not a registration, and reading fileCount before the receipt gives you a stale id.',
                },
              ],
              explanation:
                'The anti-pattern and the fix side by side, emphasising that the two layers share no transaction.',
            },
          },
        },
        {
          title: 'The Six Step Ordering',
          content:
            'Write the full sequence down once and it stops being something you have to remember. Six steps, three before any chain write and three after. Notice that verification appears twice: once before you register, so you never commit a hash you have not confirmed is retrievable, and once on read, because a reader has no reason to trust either layer on its word.',
          emoji: '🪜',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 's1', label: 'Step 1', emoji: '🧮' },
                { id: 's2', label: 'Step 2', emoji: '📤' },
                { id: 's3', label: 'Step 3', emoji: '🔍' },
                { id: 's4', label: 'Step 4', emoji: '⛓️' },
                { id: 's5', label: 'Step 5', emoji: '🧾' },
                { id: 's6', label: 'Step 6', emoji: '📥' },
              ],
              targets: [
                { id: 't1', label: 'Compute the root locally with ZgFile.merkleTree()' },
                { id: 't2', label: 'Upload the bytes and wait for the submit() receipt' },
                { id: 't3', label: 'Download once and recompute the root to confirm retrievability' },
                { id: 't4', label: 'Call registerFile(rootHash, metadata) on 0G Chain' },
                { id: 't5', label: 'Wait for the receipt and parse FileRegistered for the id' },
                { id: 't6', label: 'Reader: getFile(id), then verified download and recompute' },
              ],
              correctPairs: [
                { itemId: 's1', targetId: 't1' },
                { itemId: 's2', targetId: 't2' },
                { itemId: 's3', targetId: 't3' },
                { itemId: 's4', targetId: 't4' },
                { itemId: 's5', targetId: 't5' },
                { itemId: 's6', targetId: 't6' },
              ],
              explanation:
                'Steps 1 to 3 are reversible: if anything fails you have written nothing permanent. Step 4 is the point of no return. Step 6 is where a dangling pointer finally announces itself.',
            },
          },
        },
        {
          title: 'The Contract Cannot Save You',
          content:
            'It is worth sitting with why no amount of Solidity fixes this. A require statement can only read chain state. There is no opcode that reaches a storage node, no precompile that resolves a root hash, and no scheduled execution that could check later. You could add an oracle that attests to retrievability, but then the guarantee is the oracle honesty assumption, not the chain, and you have moved the trust rather than removed it. The correct engineering answer is to make the client ordering right and to make readers verify, which is exactly what the six steps do.',
          emoji: '🛑',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'Why not require(dataExists(hash))',
                  content:
                    'There is nothing to call. The EVM is deterministic and closed: every node must reach the same result from chain state alone. A network lookup would make execution nondeterministic and consensus would break.',
                },
                {
                  label: 'Why an event does not help',
                  content:
                    'FileRegistered proves a registration happened. It says nothing about the bytes. An indexer consuming that event inherits the same blindness the contract has.',
                },
                {
                  label: 'What an oracle would actually buy',
                  content:
                    'A retrievability attestation signed by someone who did check. Useful, and it is roughly what ERC-7857 does with a TEE for the re-encryption step. But it is an added trust assumption, not a property of the chain.',
                },
                {
                  label: 'Where the check really belongs',
                  content:
                    'In the reader. The reader is the only party that both wants the bytes and is able to fetch them, which makes it the only place where recomputing the root is both possible and meaningful.',
                },
              ],
              explanation:
                'Closing the door on the fix learners reach for first, and relocating the check to the reader.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-010-b',
    },
    {
      sectionTitle: 'The Read Path and What It Restacks Into',
      slides: [
        {
          title: 'Reading Inverts the Write',
          content:
            'The write path went bytes then hash. The read path goes hash then bytes. Pull the record from the chain with a plain provider, no wallet needed, because getFile is a view function. Then hand the on-chain root to storage and download. Then, and this is the part most integrations skip, recompute the root over what arrived and compare it to the bytes32 you read from the chain. Lesson 9 explained why that last step cannot be delegated to the proof flag.',
          emoji: '📥',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { Indexer } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';
import { recomputeRoot } from './verify';   // from lesson 9

const RPC_URL = 'https://evmrpc-testnet.0g.ai';   // Galileo testnet, chainId 16602
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

export async function readAndVerify(registryAddress: string, fileId: number, outputPath: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 16602);
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);

  const record = await registry.getFile(fileId);
  const onChainRoot: string = record.rootHash;

  const indexer = new Indexer(INDEXER_URL);
  const err = await indexer.download(onChainRoot, outputPath, true);
  if (err !== null) throw new Error('storage layer: ' + err.message);

  const recomputed = await recomputeRoot(outputPath);
  return recomputed.toLowerCase() === onChainRoot.toLowerCase();
}`,
              highlights: [
                {
                  line: 9,
                  explanation:
                    'Pinning chainId 16602 in the provider makes a misconfigured RPC fail immediately instead of silently reading a different network. 16601 is the legacy testnet id and will not work.',
                },
                {
                  line: 12,
                  explanation:
                    'A view call. No wallet, no gas, no transaction. Anyone can perform this half of the read.',
                },
                {
                  line: 16,
                  explanation:
                    'This is where a dangling pointer finally announces itself, as a storage-layer error such as no locations found for root hash. Notice it took a network round trip to a third system to discover a problem created by a chain write.',
                },
                {
                  line: 19,
                  explanation:
                    'The step that makes the whole seam trustworthy. The chain gave you a commitment, storage gave you bytes, and only this comparison connects the two.',
                },
              ],
              explanation:
                'The complete reader, with the discovery point of the dangling pointer marked explicitly.',
            },
          },
        },
        {
          title: 'Where the Failure Actually Surfaces',
          content:
            'Trace the dangling pointer through the reader and the asymmetry becomes obvious. getFile succeeds. The record is well formed, the uploader address is real, the timestamp is real, the hash is 32 valid bytes. Every chain-layer check passes because every chain-layer check is about the record, not the data. The error appears one system later, when the indexer reports it has no locations for that root. Your test for this should assert on that specific failure, at the storage layer, not on a contract revert that will never come.',
          emoji: '🕳️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'c1', label: 'registry.getFile(id)', emoji: '⛓️' },
                { id: 'c2', label: 'record.rootHash is 32 bytes', emoji: '✅' },
                { id: 'c3', label: 'indexer.getFileLocations(root)', emoji: '📡' },
                { id: 'c4', label: 'recomputeRoot(downloaded)', emoji: '🌳' },
              ],
              targets: [
                { id: 'r1', label: 'Succeeds. The record exists and is well formed.' },
                { id: 'r2', label: 'Passes. Any 32 bytes pass, including bytes nobody uploaded.' },
                { id: 'r3', label: 'Returns empty. This is the exact point of discovery.' },
                { id: 'r4', label: 'Never runs. There are no bytes to hash.' },
              ],
              correctPairs: [
                { itemId: 'c1', targetId: 'r1' },
                { itemId: 'c2', targetId: 'r2' },
                { itemId: 'c3', targetId: 'r3' },
                { itemId: 'c4', targetId: 'r4' },
              ],
              explanation:
                'Three of the four steps in a reader are incapable of detecting a dangling pointer. Only the storage lookup can, and it does so as a lookup miss rather than as an error about the registration.',
            },
          },
        },
        {
          title: 'One Seam, Restacked',
          content:
            'This pattern is not a beginner exercise you graduate from. It is the primitive that the rest of 0G is assembled out of. Every advanced product is this same seam with something added on top, and recognising that turns a long list of features into one idea with variations. When you meet iNFTs or the data availability layer later, look for the hash, look for the bytes, and look for who is responsible for checking that they match.',
          emoji: '🧱',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'ERC-7857 iNFTs',
                  content:
                    'Storage plus chain, with the payload encrypted and a TEE acting as a re-encryption oracle on transfer. The token holds the pointer, the storage layer holds the ciphertext, and the TEE re-seals the key for the new owner. Same seam, plus confidentiality and a transfer protocol.',
                },
                {
                  label: '0G DA',
                  content:
                    'Storage-shaped blob commitments, except the consumer is a rollup derivation pipeline rather than a user contract. The commitment goes on-chain, the blob lives off-chain, and the rollup reconstructs its state by fetching and checking the blob. Same seam, different reader.',
                },
                {
                  label: 'Compute plus storage',
                  content:
                    'An inference job reads its input by root hash and writes its output back as a new root hash. The chain records which input root produced which output root, giving you a reproducible audit trail without ever putting a model or a dataset on-chain.',
                },
                {
                  label: 'The invariant across all three',
                  content:
                    'The hash is committed on-chain, the bytes live off it, and the party that needs the bytes is the party that must verify them. No variation of this pattern moves the verification responsibility onto the chain, because no variation can.',
                },
              ],
              explanation:
                'Generalising the seam so the advanced track reads as variations rather than as unrelated products.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-010-c',
    },
  ],

  quiz: [
    {
      question:
        'You called registerFile first, then the upload failed. A reader later fetches the file. At exactly which call does it discover the problem?',
      options: [
        'At registry.getFile(id), which reverts because the record is invalid',
        'At the storage lookup, when the indexer reports no locations for that root hash',
        'At recomputeRoot, when the computed root differs from the on-chain hash',
        'It never discovers it, the reader gets zero-filled bytes',
      ],
      correctAnswer: 1,
      explanation:
        'getFile succeeds because the record is perfectly well formed: real uploader, real timestamp, 32 valid bytes. The failure appears one system later, when the indexer has no locations for the root and the download errors. recomputeRoot never runs because there are no bytes to hash. The failure surfaces at the storage layer even though it was created by a chain write.',
      weaknessTopic: '0g-chain',
      practiceHint:
        'Walk the reader call by call and ask of each one: does this call have any way to observe the storage layer?',
    },
    {
      question:
        'Why can the registry contract not simply reject a root hash whose data was never uploaded?',
      options: [
        'It could, but the gas cost would be prohibitive',
        'The EVM is deterministic and closed: no opcode reaches a storage node, no callback exists, and a network lookup would break consensus',
        'Because the root hash is bytes32 rather than a string',
        'Because registerFile is external rather than public',
      ],
      correctAnswer: 1,
      explanation:
        'Every validator must reach the same result from chain state alone. A lookup against a storage node would make execution nondeterministic and consensus would fail. There is no oracle, no callback and no scheduled re-check. An external attestation oracle could vouch for retrievability, but that adds a trust assumption rather than giving the chain a capability it lacks.',
      weaknessTopic: '0g-chain',
      practiceHint:
        'Ask what information an EVM opcode is allowed to depend on. If the answer is not chain state, the check cannot exist.',
    },
    {
      question: 'What belongs in the FileRecord on-chain?',
      options: [
        'The full file bytes, so readers never need the storage layer',
        'A base64 string of the file, which is cheaper than raw bytes',
        'The 32-byte root hash as bytes32, plus uploader, timestamp and a short metadata string',
        'The indexer URL where the file can be downloaded',
      ],
      correctAnswer: 2,
      explanation:
        'bytes32 is exactly one storage slot and a 0G root hash is exactly 32 bytes, so it is the natural encoding. Storing the file itself, in any encoding, is orders of magnitude more expensive. Storing an indexer URL would make the record location addressed and therefore breakable, whereas the root hash names the bytes themselves.',
      weaknessTopic: '0g-storage',
    },
    {
      question: 'Which sequence is correct and safe?',
      options: [
        'Compute root, register on-chain, upload bytes, verify download',
        'Upload bytes, compute root, register on-chain, never verify',
        'Compute root, upload bytes, verify retrievability, register on-chain, wait for receipt, then read via getFile plus verified download',
        'Register a placeholder hash, upload, then update the record with the real hash',
      ],
      correctAnswer: 2,
      explanation:
        'Steps one through three are reversible: nothing permanent has been written, so an upload failure costs you nothing. Step four is the point of no return. Registering before uploading creates an undetectable dangling pointer, and the placeholder approach commits a hash that is wrong by construction and leaves anyone who read it in between holding a bad pointer.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'Sort the six steps by reversibility. Everything reversible must happen before the first irreversible write.',
    },
    {
      question:
        'A reader downloads the file referenced on-chain with indexer.download(root, path, true). What must it still do?',
      options: [
        'Nothing, the true flag verified the bytes against the root',
        'Recompute the root over the downloaded bytes and compare it to the on-chain bytes32, because the proof flag is not implemented in the TypeScript SDK',
        'Call registry.verifyUploader to confirm the uploader address',
        'Re-download from a second indexer and diff the two files',
      ],
      correctAnswer: 1,
      explanation:
        'The proof flag is threaded down to Downloader.downloadTask where it becomes _proof, is never read, and sits under a TODO comment. So the only real integrity check is the one you write: recompute the root and compare it to the value read from the chain. Checking the uploader answers who registered it, not whether the bytes are right, and diffing two nodes only proves they agree.',
      weaknessTopic: '0g-verification',
      practiceHint:
        'The chain gives a commitment and storage gives bytes. Only a recomputed root connects the two.',
    },
    {
      question: 'What does an ERC-7857 iNFT add on top of this storage plus chain seam?',
      options: [
        'Nothing, it is the same contract with a different name',
        'An encrypted payload plus a TEE that acts as a re-encryption oracle when the token transfers',
        'On-chain storage of the data, removing the storage layer entirely',
        'A requirement that the root hash be registered before the upload',
      ],
      correctAnswer: 1,
      explanation:
        'ERC-7857 keeps the pointer on-chain and the bytes off it, then encrypts the payload so ownership means key access rather than mere reference. On transfer, a TEE re-seals the key for the new owner and publishes the sealed key. It is the same seam with confidentiality and a transfer protocol layered on, not a different architecture.',
      weaknessTopic: '0g-identity',
    },
    {
      question: 'How is 0G DA a restacking of the same seam?',
      options: [
        'It stores blobs directly in contract storage for cheaper access',
        'It replaces Merkle roots with signatures from the sequencer',
        'A blob commitment goes on-chain while the blob stays off-chain, and a rollup derivation pipeline is the reader that fetches and checks it',
        'It removes the need for verification because the DA layer is trusted',
      ],
      correctAnswer: 2,
      explanation:
        'DA is the same shape with a different consumer. The commitment is the on-chain half, the blob is the off-chain half, and the rollup derivation pipeline plays the role your reader played: fetch the data referenced by the commitment and check it before acting on it. The verification responsibility still sits with the party that needs the bytes.',
      weaknessTopic: '0g-da',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// registry.ts - the storage to chain seam, both directions
import { ZgFile, Indexer } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';
import 'dotenv/config';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';        // Galileo testnet
const CHAIN_ID = 16602;                                 // 16601 is the LEGACY id
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';
const EXPLORER = 'https://chainscan-galileo.0g.ai';

export const REGISTRY_ABI = [
  'function registerFile(bytes32 rootHash, string calldata metadata) external returns (uint256)',
  'function getFile(uint256 id) external view returns (tuple(bytes32 rootHash, address uploader, uint256 timestamp, string metadata))',
  'function fileCount() external view returns (uint256)',
  'event FileRegistered(uint256 indexed id, bytes32 rootHash, address uploader)',
];

// Reused from lesson 9. Recompute the 0G file root of a local file.
export async function recomputeRoot(filePath: string): Promise<string> {
  const file = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, err] = await file.merkleTree();
    if (err !== null || tree === null) throw new Error('merkle: ' + String(err));
    return tree.rootHash() as string;
  } finally {
    await file.close();
  }
}

// TODO 1: Upload the bytes, THEN register the hash.
// Order matters:
//   a. ZgFile.fromFilePath + merkleTree() to get the root (close in finally)
//   b. indexer.upload(file, RPC_URL, wallet) and abort on any error
//   c. only then registry.registerFile(rootHash, metadata)
//   d. await tx.wait() and parse FileRegistered from receipt.logs for the id
//      (the uint256 return value of registerFile is NOT visible off-chain)
export async function uploadThenRegister(
  filePath: string,
  metadata: string,
  registryAddress: string
): Promise<{ rootHash: string; fileId: number; txHash: string }> {
  // Your code here
}

// TODO 2: Read the hash from chain, download, and prove the bytes.
// getFile is a view function, so a provider is enough (no wallet, no gas).
// indexer.download's third argument does not verify anything: recompute
// the root yourself and compare against the on-chain bytes32.
export async function readAndVerify(
  registryAddress: string,
  fileId: number,
  outputPath: string
): Promise<boolean> {
  // Your code here
}

// TODO 3: Prove the contract cannot detect a dangling pointer.
// Register a root hash you never uploaded, then run readAndVerify on it.
// Assert that the chain write SUCCEEDS and the failure appears at the
// storage layer. Return the message of the error you caught.
export async function danglingPointerTest(
  registryAddress: string
): Promise<{ fileId: number; chainWriteSucceeded: boolean; failedAt: string }> {
  // Your code here
}`,

  solution: `// registry.ts - the storage to chain seam, both directions
import { ZgFile, Indexer } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';
import 'dotenv/config';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';        // Galileo testnet
const CHAIN_ID = 16602;                                 // 16601 is the LEGACY id
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';
const EXPLORER = 'https://chainscan-galileo.0g.ai';

export const REGISTRY_ABI = [
  'function registerFile(bytes32 rootHash, string calldata metadata) external returns (uint256)',
  'function getFile(uint256 id) external view returns (tuple(bytes32 rootHash, address uploader, uint256 timestamp, string metadata))',
  'function fileCount() external view returns (uint256)',
  'event FileRegistered(uint256 indexed id, bytes32 rootHash, address uploader)',
];

export async function recomputeRoot(filePath: string): Promise<string> {
  const file = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, err] = await file.merkleTree();
    if (err !== null || tree === null) throw new Error('merkle: ' + String(err));
    return tree.rootHash() as string;
  } finally {
    await file.close();
  }
}

function getWallet(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
  return new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
}

function parseFileId(
  registry: ethers.Contract,
  receipt: ethers.TransactionReceipt
): number {
  for (const log of receipt.logs) {
    try {
      const parsed = registry.interface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (parsed && parsed.name === 'FileRegistered') {
        return Number(parsed.args[0]);
      }
    } catch {
      // not one of ours, keep scanning
    }
  }
  throw new Error('FileRegistered event not found in receipt');
}

// TODO 1: upload first, register second
export async function uploadThenRegister(
  filePath: string,
  metadata: string,
  registryAddress: string
): Promise<{ rootHash: string; fileId: number; txHash: string }> {
  const wallet = getWallet();
  const indexer = new Indexer(INDEXER_URL);

  // Step 1 + 2: root, then bytes. Nothing permanent has been written yet.
  const file = await ZgFile.fromFilePath(filePath);
  let rootHash: string;
  try {
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null || tree === null) {
      throw new Error('merkle tree failed: ' + String(treeErr));
    }
    rootHash = tree.rootHash() as string;

    const [, uploadErr] = await indexer.upload(
      file,
      RPC_URL,
      wallet as never // ethers ESM/CJS type mismatch, runtime compatible
    );
    if (uploadErr !== null) {
      // Abort BEFORE any chain write. This early return is the safety rule.
      throw new Error('upload failed, registering nothing: ' + String(uploadErr));
    }
  } finally {
    await file.close();
  }

  console.log('uploaded, root:', rootHash);

  // Step 4 + 5: the irreversible half
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, wallet);
  const tx = await registry.registerFile(rootHash, metadata);
  const receipt = await tx.wait();
  const fileId = parseFileId(registry, receipt);

  console.log('registered id:', fileId);
  console.log('tx:', EXPLORER + '/tx/' + receipt.hash);
  return { rootHash, fileId, txHash: receipt.hash };
}

// TODO 2: read the hash from chain, download, prove the bytes
export async function readAndVerify(
  registryAddress: string,
  fileId: number,
  outputPath: string
): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);

  const record = await registry.getFile(fileId);
  const onChainRoot: string = record.rootHash;
  console.log('root from chain:', onChainRoot);
  console.log('uploader       :', record.uploader);

  const indexer = new Indexer(INDEXER_URL);
  let err: Error | null = null;
  try {
    err = await indexer.download(onChainRoot, outputPath, true);
  } catch (e) {
    throw new Error('storage layer: ' + (e as Error).message);
  }
  if (err !== null) throw new Error('storage layer: ' + err.message);

  // The flag above verified nothing. This is the real check.
  const recomputed = await recomputeRoot(outputPath);
  const match = recomputed.toLowerCase() === onChainRoot.toLowerCase();

  console.log('recomputed     :', recomputed);
  console.log('match          :', match);
  return match;
}

// TODO 3: prove the contract cannot detect a dangling pointer
export async function danglingPointerTest(
  registryAddress: string
): Promise<{ fileId: number; chainWriteSucceeded: boolean; failedAt: string }> {
  const wallet = getWallet();
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, wallet);

  // 32 valid bytes that no storage node has ever seen.
  const fakeRoot = ethers.keccak256(
    ethers.toUtf8Bytes('never-uploaded-' + Date.now())
  );

  const tx = await registry.registerFile(fakeRoot, 'dangling-pointer-test');
  const receipt = await tx.wait();
  const fileId = parseFileId(registry, receipt);

  // The chain accepted it without complaint.
  console.log('chain write succeeded for a root nobody uploaded:', fakeRoot);
  console.log('tx:', EXPLORER + '/tx/' + receipt.hash);

  // The record reads back perfectly. Nothing on-chain is wrong.
  const record = await registry.getFile(fileId);
  console.log('record.rootHash:', record.rootHash);
  console.log('record.uploader:', record.uploader);

  // The failure lives one system away.
  let failedAt = 'nothing failed, which would mean the test is broken';
  try {
    await readAndVerify(registryAddress, fileId, './downloads/dangling.bin');
  } catch (e) {
    failedAt = (e as Error).message;
  }
  console.log('failed at      :', failedAt);

  return { fileId, chainWriteSucceeded: true, failedAt };
}

async function main() {
  const registryAddress = process.env.REGISTRY_ADDRESS as string;

  const { fileId } = await uploadThenRegister(
    './data/lesson8.txt',
    'lesson-10 demo',
    registryAddress
  );
  const ok = await readAndVerify(registryAddress, fileId, './downloads/read-back.bin');
  console.log('verified round trip:', ok);

  await danglingPointerTest(registryAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  hints: [
    'Compile the registry with evmVersion set to cancun in hardhat.config.ts. Without it you get an invalid opcode revert at deploy time on 0G Chain, which is the same trap lesson 2 covered.',
    'registerFile returns uint256, but a return value from a state-changing call is not visible to an off-chain caller. Parse FileRegistered out of receipt.logs with registry.interface.parseLog, and wrap it in try/catch because logs from other contracts in the same block will not decode.',
    'The root hash the SDK gives you is already a 0x-prefixed 64-character hex string, so it passes straight into a bytes32 parameter with no conversion. If you built it yourself, ethers.zeroPadValue can normalise a short value.',
    'Pin the chainId in the provider: new ethers.JsonRpcProvider(RPC_URL, 16602). A wrong or missing chainId is the most common cause of a transaction that succeeds against nothing. 16601 is the legacy testnet id and will not work.',
    'indexer.download refuses to overwrite an existing path and returns "Wrong path, provide a file path which does not exist." Use a fresh output name each run, or unlink first.',
    'Your dangling-pointer test must assert on the STORAGE error, not on a contract revert. registerFile will never revert for a bad hash, so a test expecting a revert will fail for the wrong reason and teach you nothing.',
    'Keep the upload and the register in the same function with an early throw between them. Splitting them across services or across a queue is how the ordering rule gets violated in production.',
  ],

  proof: {
    label: 'Verified StorageRegistry address, registerFile tx hash, and matching roots',
    hint: 'Deploy StorageRegistry to Galileo and verify it on the explorer. Register your lesson 8 root hash and capture the registerFile tx hash. Then submit reader output showing the recomputed root equals the on-chain bytes32, plus the dangling-pointer test showing the chain write succeeding and the failure landing at the storage layer rather than the chain layer.',
    verifyUrl: 'https://chainscan-galileo.0g.ai',
    pattern: '0x[a-fA-F0-9]{40}',
  },
};
