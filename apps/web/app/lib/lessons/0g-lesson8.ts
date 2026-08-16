import { LessonContent } from '@/app/types/lesson';

export const ogLesson8: LessonContent = {
  id: '0g-8',
  title: 'First storage upload: the root hash is the only key',
  description:
    'Upload a file to 0G Storage and understand the structure nobody explains: 256-byte chunks, 256KB segments, an inner tree per segment feeding pre-hashed leaves into an outer tree, and a build() that rotates instead of duplicating. Plus why a 300-byte file costs the same as a 512-byte one.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 8,
  language: 'typescript',
  prerequisiteLessons: ['0g-7'],

  narrative: {
    welcomeMessage:
      "0G Storage has no filenames, no folders and no accounts. You hand it bytes and it hands you one 32-byte root hash. That hash is the whole API surface: it is the address, the integrity check and the only key. Lose it and your bytes are still on the network, still paid for, and completely unreachable. This lesson is about where that hash comes from, because once you can compute it yourself you stop trusting anyone else to tell you what you stored.",
    quizTransition:
      'You now know how bytes become a root hash and what the network charges you for. Time to check whether the parts that bite in production have landed.',
    practiceTransition:
      'Now build it. You will reimplement the padding and sector maths the SDK uses to price your upload, then run a real upload and handle the two response shapes that break naive code.',
    celebrationMessage:
      'You can price an upload before sending it, explain why two differently sized files cost the same, spot a deduplicated upload that looks like a failure, and name the one line of build() that makes off-the-shelf Merkle libraries disagree with 0G.',
    nextLessonTease:
      'Next: downloading, and a finding worth publishing. The TypeScript SDK accepts a proof flag on download, threads it all the way down, and then never reads it. Real verification is something you have to do yourself.',
  },

  teachingSections: [
    {
      sectionTitle: 'From bytes to a root hash',
      slides: [
        {
          title: 'The hash is the address',
          content:
            'Content addressing flips the normal relationship between a name and its data. There is no path to rename and no owner record to update, because the identifier is derived from the bytes themselves. Change one byte and you get a different root, which means a storage node physically cannot serve you altered data under the same key. That property is the entire reason 0G Storage is worth using instead of a bucket.',
          emoji: '🔑',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What the root hash is',
                  content:
                    'A 32-byte keccak256 value, printed as 0x plus 64 hex characters. It is the root of a Merkle tree built over the padded contents of your file. Two identical files anywhere on earth produce the same root.',
                },
                {
                  label: 'What it is not',
                  content:
                    'It is not a filename, a URL or a receipt. It carries no name, no MIME type and no owner. If you want any of that, you store it separately, which is exactly what the storage to chain seam is for.',
                },
                {
                  label: 'Why dedup is automatic',
                  content:
                    'Because the address is derived from the content, uploading the same bytes twice is a no-op by construction. The SDK notices the file is already finalized and skips the whole submit and push cycle. This is a feature that looks like a bug the first time you meet it.',
                },
                {
                  label: 'Why you should recompute it yourself',
                  content:
                    'The SDK prints a root hash before it uploads anything. If you can recompute that same root from bytes you downloaded later, you have proved integrity without trusting the indexer, the node or the SDK. That is lesson 9, and it starts here.',
                },
              ],
              explanation:
                'Content addressing means the identifier is a function of the bytes, so serving different bytes under the same key is impossible.',
            },
          },
        },
        {
          title: 'Chunks, segments, and two trees',
          content:
            'The file root is not a flat Merkle tree over your bytes. There are two layers. Your padded bytes are split into 256-byte chunks. Chunks are grouped 1024 at a time into 256KB segments. Each segment gets its own inner keccak256 tree whose root is the segment root. Those segment roots then become pre-hashed leaves of an outer tree, and the outer root is the file root. This is why one segment can be uploaded on its own with an O(log numSegments) proof.',
          emoji: '🌳',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'chunk', label: '256-byte chunk', emoji: '🧱' },
                { id: 'segment', label: '256KB segment', emoji: '📦' },
                { id: 'segroot', label: 'Segment root', emoji: '🌱' },
                { id: 'fileroot', label: 'File root', emoji: '🌳' },
              ],
              targets: [
                { id: 't-chunk', label: 'Smallest unit, added with tree.addLeaf(bytes)' },
                { id: 't-segment', label: 'Exactly 1024 chunks, the unit of upload and proof' },
                {
                  id: 't-segroot',
                  label: 'Root of the inner tree, added with tree.addLeafByHash(hash)',
                },
                { id: 't-fileroot', label: 'Root of the outer tree over all segment roots' },
              ],
              correctPairs: [
                { itemId: 'chunk', targetId: 't-chunk' },
                { itemId: 'segment', targetId: 't-segment' },
                { itemId: 'segroot', targetId: 't-segroot' },
                { itemId: 'fileroot', targetId: 't-fileroot' },
              ],
              explanation:
                'Two layers: chunks hash into a segment root, segment roots hash into the file root.',
            },
          },
        },
        {
          title: 'The same idea in SDK source',
          content:
            'The distinction between addLeaf and addLeafByHash is the whole two-layer design in two method names. addLeaf takes raw content and hashes it for you. addLeafByHash takes an already computed hash and uses it directly as a leaf. The inner tree uses the first, the outer tree uses the second.',
          emoji: '📜',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// AbstractFile.ts, condensed from the 0G storage SDK

static segmentRoot(segment: Uint8Array, emptyChunksPadded = 0): string {
  const tree = new MerkleTree();
  for (let o = 0; o < segment.length; o += DEFAULT_CHUNK_SIZE) {
    tree.addLeaf(segment.subarray(o, o + DEFAULT_CHUNK_SIZE));
  }
  for (let i = 0; i < emptyChunksPadded; i++) {
    tree.addLeafByHash(EMPTY_CHUNK_HASH);
  }
  tree.build();
  return tree.rootHash() as string;
}

async merkleTree(): Promise<[MerkleTree | null, Error | null]> {
  const iter = this.iterateWithOffsetAndBatch(0, DEFAULT_SEGMENT_SIZE, true);
  const tree = new MerkleTree();
  while (true) {
    const [ok, err] = await iter.next();
    if (err != null) return [null, err];
    if (!ok) break;
    tree.addLeafByHash(AbstractFile.segmentRoot(iter.current()));
  }
  return [tree.build(), null];
}`,
              highlights: [
                {
                  line: 6,
                  explanation:
                    'addLeaf hashes raw content for you: LeafNode.fromContent runs keccak256 over the 256 bytes. This is the inner tree, one per segment.',
                },
                {
                  line: 9,
                  explanation:
                    'EMPTY_CHUNK_HASH is keccak256 over 256 zero bytes, precomputed once. Padding is cheap because the padded chunks are all identical.',
                },
                {
                  line: 16,
                  explanation:
                    'The third argument to iterateWithOffsetAndBatch is flowPadding. It is true here, which is why the tree covers the padded size rather than your literal file size.',
                },
                {
                  line: 22,
                  explanation:
                    'addLeafByHash, not addLeaf. The segment root is already a hash. Hashing it again would produce a different and wrong file root.',
                },
                {
                  line: 24,
                  explanation:
                    'One build() at the end over all segment roots. Because segments are the leaves, a proof for one segment is O(log numSegments), not O(log numChunks).',
                },
              ],
              explanation:
                'addLeaf hashes content, addLeafByHash trusts a hash. Inner tree uses one, outer tree uses the other.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-801',
    },
    {
      sectionTitle: 'Why an off-the-shelf Merkle library gives the wrong root',
      slides: [
        {
          title: 'build() rotates, it does not duplicate',
          content:
            'Almost every Merkle implementation you have used handles an odd number of nodes by duplicating the last one and hashing it with itself. 0G does not. When a level has an odd node count, build() moves the leftover node to the back of the queue so it gets paired at a later level instead. This matches the zerog-rust reference implementation, and it means you cannot compute a valid 0G root with merkletreejs or the OpenZeppelin helpers no matter how you configure them.',
          emoji: '🔁',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// MerkleTree.ts build(), the part that matters
build(): MerkleTree | null {
  const numLeafNodes = this.leaves.length;
  if (numLeafNodes === 0) return null;

  let queue: LeafNode[] = [];
  for (let i = 0; i < numLeafNodes; i += 2) {
    if (i === numLeafNodes - 1) { queue.push(this.leaves[i]); continue; }
    queue.push(LeafNode.fromLeftAndRight(this.leaves[i], this.leaves[i + 1]));
  }

  while (queue.length > 1) {
    const numNodes = queue.length;
    for (let i = 0; i < Math.floor(numNodes / 2); i++) {
      const left = queue[0];
      const right = queue[1];
      queue.splice(0, 2);
      queue.push(LeafNode.fromLeftAndRight(left, right));
    }
    if (numNodes % 2 === 1) {
      const first = queue[0];
      queue.splice(0, 1);
      queue.push(first);   // rotate, do NOT duplicate
    }
  }

  this.root = queue[0];
  return this;
}`,
              highlights: [
                {
                  line: 8,
                  explanation:
                    'An odd trailing leaf is pushed alone into the queue rather than paired with a copy of itself. Already a departure from the common pattern.',
                },
                {
                  line: 17,
                  explanation:
                    'Pairs are taken from the front of the queue and pushed to the back, so after this loop the unpaired node is sitting at queue[0].',
                },
                {
                  line: 23,
                  explanation:
                    'This is the line. The leftover node is rotated to the back of the queue and carried into the next round. A library that duplicates the last node produces a different root for every input whose leaf count is not a power of two.',
                },
                {
                  line: 27,
                  explanation:
                    'The loop exits when a single node remains, and that node is the root. Note the tree can be unbalanced, which is fine because the proof carries an explicit path of left and right flags.',
                },
              ],
              explanation:
                'One line, queue.push(first), is the difference between a valid 0G root and a plausible-looking wrong one.',
            },
          },
        },
        {
          title: 'What a proof looks like when the tree is unbalanced',
          content:
            'Because levels can be uneven, a proof cannot rely on position arithmetic alone. 0G proofs carry a lemma, which is the leaf hash, then the sibling hashes bottom to top, then the root, plus a path of booleans saying whether each step went left. Verification folds the lemma using the path and separately recomputes the leaf position from the path to catch a node serving you the right bytes from the wrong place.',
          emoji: '🧾',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'lemma',
                  content:
                    'An array of hex strings in three parts, kept consistent with zerog-rust: the target content hash first, then each sibling hash from bottom to top, then the root last. Its length must equal path.length + 2, which is the first thing validateFormat checks.',
                },
                {
                  label: 'path',
                  content:
                    'One boolean per level: true when the current node is on the left side, so the sibling is concatenated on the right. All true for the leftmost leaf, all false for the rightmost.',
                },
                {
                  label: 'How the fold works',
                  content:
                    'Start at lemma[0] and walk the path. Left means keccak256(hash, sibling), right means keccak256(sibling, hash). If the final value equals the last lemma entry, the proof is internally consistent.',
                },
                {
                  label: 'Why position is checked separately',
                  content:
                    'calculateProofPosition replays the path against the leaf count to derive which index this proof can only belong to. Without that check, a node could hand you segment 7 bytes with segment 7 proof while you asked for segment 3, and the fold would happily pass. Lesson 9 makes that failure fire on purpose.',
                },
              ],
              explanation:
                'A proof is a lemma plus a path. The fold proves membership, the position check proves it is the membership you asked for.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-802',
    },
    {
      sectionTitle: 'Two-phase upload, padded sectors, and three surprises',
      slides: [
        {
          title: 'You pay for padding, in powers of two',
          content:
            'Upload is two phases. Phase one is an on-chain submit() to the FixedPriceFlow contract carrying a power-of-two decomposition of your file as SubmissionNode entries, each with a height and a root. Phase two is an off-chain shard-aware parallel push of segments with proofs, addressed by the txSeq the chain assigned you. The fee is fixed in phase one as sum(2^height) multiplied by pricePerSector, and because heights come from the padded chunk count, you pay for padded sectors rather than literal bytes.',
          emoji: '🧮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// utils.ts and AbstractFile.ts, the pricing path

function numSplits(total: number, unit: number): number {
  return Math.floor((total - 1) / unit) + 1;
}

function computePaddedSize(chunks: number): [number, number] {
  const chunksNextPow2 = nextPow2(chunks);
  if (chunksNextPow2 === chunks) return [chunksNextPow2, chunksNextPow2];
  const minChunk = chunksNextPow2 >= 16 ? Math.floor(chunksNextPow2 / 16) : 1;
  return [numSplits(chunks, minChunk) * minChunk, chunksNextPow2];
}

splitNodes(): number[] {
  let [paddedChunks, next] = computePaddedSize(this.numChunks());
  const nodes: number[] = [];
  while (paddedChunks > 0) {
    if (paddedChunks >= next) { paddedChunks -= next; nodes.push(next); }
    next /= 2;
  }
  return nodes;   // chunk counts; height = log2(count)
}

// transfer/utils.ts
export function calculatePrice(submission, pricePerSector: bigint): bigint {
  let sectors = 0;
  for (const node of submission.data.nodes) {
    sectors += 1 << Number(node.height.toString());
  }
  return BigInt(sectors) * pricePerSector;
}`,
              highlights: [
                {
                  line: 4,
                  explanation:
                    'Ceiling division. 300 bytes is 2 chunks of 256. So is 512. This single line is why two differently sized files can be priced identically.',
                },
                {
                  line: 9,
                  explanation:
                    'When the chunk count is already a power of two, nothing is padded. 2 chunks stays 2 chunks, so both a 300-byte and a 512-byte file decompose to one node of height 1.',
                },
                {
                  line: 10,
                  explanation:
                    'Otherwise padding rounds up to a multiple of one sixteenth of the next power of two. Large files pay at most about 6 percent overhead, small ones can pay much more proportionally.',
                },
                {
                  line: 18,
                  explanation:
                    'Greedy power-of-two decomposition, largest first. 18 padded chunks becomes 16 plus 2, which is two SubmissionNodes of heights 4 and 1.',
                },
                {
                  line: 28,
                  explanation:
                    '1 << height is 2^height sectors per node. A sector is one 256-byte chunk. Sum them and multiply by pricePerSector read from the market contract to get the exact msg.value of your submit().',
                },
              ],
              explanation:
                'Fee equals padded chunk count times pricePerSector. Bytes never enter the calculation directly.',
            },
          },
        },
        {
          title: 'Three responses that look like failures',
          content:
            'Three behaviours make correct uploads look broken. All three are documented in the SDK types, and all three have bitten people who only read the quickstart. Meet them here rather than at 2am.',
          emoji: '🚨',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'Empty txHash with a valid rootHash',
                  content:
                    'skipIfFinalized defaults to true. Upload the same bytes twice and the second call returns txHash of empty string, a correct rootHash, a real txSeq and a null error. Code that asserts on txHash being truthy reports a failure on a perfectly successful deduplication. Set skipIfFinalized false to force a re-upload, and expect to pay gas and storage fee again.',
                },
                {
                  label: 'The response becomes a union type',
                  content:
                    'fragmentSize defaults to 4GB. Below that you get { txHash, rootHash, txSeq }. Above it, or if you lower fragmentSize yourself, the file is split and you get { txHashes: string[], rootHashes: string[], txSeqs: number[] }. Any code reading tx.rootHash silently gets undefined. Always branch on whether rootHash is in tx.',
                },
                {
                  label: 'Turbo and Standard are different networks',
                  content:
                    'Not two speeds of one network. Turbo is faster with higher fees, Standard is slower and cheaper, and each has its own indexer URL and its own flow contract that the SDK auto-discovers. A root uploaded through the turbo indexer is not retrievable from the standard indexer. Testnet turbo is indexer-storage-testnet-turbo.0g.ai and standard is indexer-storage-testnet-standard.0g.ai.',
                },
                {
                  label: 'And one file handle',
                  content:
                    'ZgFile.fromFilePath opens a descriptor that is not closed for you. Wrap everything in try and finally and call await file.close(). A batch upload loop without this exhausts descriptors somewhere around the point where the job matters.',
                },
              ],
              explanation:
                'A successful dedup, a fragmented upload and a wrong indexer all present as something other than an error.',
            },
          },
        },
        {
          title: 'The numbers worth memorising',
          content:
            'Five constants explain most of the behaviour in this lesson. Learn them once and the fee arithmetic, the proof depth and the union-typed response all stop being surprising.',
          emoji: '📐',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'chunk', label: 'DEFAULT_CHUNK_SIZE', emoji: '🧱' },
                { id: 'maxchunks', label: 'DEFAULT_SEGMENT_MAX_CHUNKS', emoji: '🔢' },
                { id: 'segsize', label: 'DEFAULT_SEGMENT_SIZE', emoji: '📦' },
                { id: 'fragment', label: 'default fragmentSize', emoji: '✂️' },
                { id: 'skipflag', label: 'default skipIfFinalized', emoji: '♻️' },
              ],
              targets: [
                { id: 't-chunk', label: '256 bytes, and also one billable sector' },
                { id: 't-maxchunks', label: '1024 chunks grouped into one segment' },
                { id: 't-segsize', label: '262144 bytes, the unit of upload and proof' },
                { id: 't-fragment', label: '4GB, above which the response becomes arrays' },
                { id: 't-skipflag', label: 'true, so a repeat upload returns an empty txHash' },
              ],
              correctPairs: [
                { itemId: 'chunk', targetId: 't-chunk' },
                { itemId: 'maxchunks', targetId: 't-maxchunks' },
                { itemId: 'segsize', targetId: 't-segsize' },
                { itemId: 'fragment', targetId: 't-fragment' },
                { itemId: 'skipflag', targetId: 't-skipflag' },
              ],
              explanation:
                '256 bytes per chunk, 1024 chunks per segment, 256KB per segment, 4GB per fragment, dedup on by default.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-803',
    },
  ],

  quiz: [
    {
      question:
        'You upload a 300-byte file and a 512-byte file. The storage fee is identical. Why?',
      options: [
        'Storage is priced per file, not per byte',
        'Both round up to 2 chunks of 256 bytes, decompose to one node of height 1, and cost 2 sectors',
        'There is a minimum fee that both files fall under',
        'The 300-byte file was deduplicated against the 512-byte one',
      ],
      correctAnswer: 1,
      explanation:
        'numSplits(300, 256) and numSplits(512, 256) both equal 2. computePaddedSize(2) returns 2 because 2 is already a power of two, so splitNodes yields a single node of height log2(2) = 1, and calculatePrice charges 1 << 1 = 2 sectors in both cases. A 100-byte file is 1 chunk and costs half as much.',
      weaknessTopic: '0g-economics',
      practiceHint:
        'Bytes never enter the fee calculation. Convert to chunks, pad, decompose into powers of two, then count sectors.',
    },
    {
      question: 'How does a 256KB segment relate to the 256-byte chunks inside it?',
      options: [
        'A segment is one chunk, the names are interchangeable',
        'A segment holds 1024 chunks, each of which is a leaf of that segment inner Merkle tree',
        'A segment holds 256 chunks and is hashed as a flat blob',
        'Segments only exist for files above 4GB',
      ],
      correctAnswer: 1,
      explanation:
        'DEFAULT_CHUNK_SIZE is 256 bytes and DEFAULT_SEGMENT_MAX_CHUNKS is 1024, so DEFAULT_SEGMENT_SIZE is 262144 bytes. Each segment gets an inner keccak256 tree over its chunks, and the resulting segment root becomes a pre-hashed leaf of the outer tree whose root is the file root.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'Two layers. Chunks are leaves of the inner tree, segment roots are leaves of the outer tree.',
    },
    {
      question:
        'Why can merkletreejs or the OpenZeppelin helpers not reproduce a 0G file root?',
      options: [
        'They use sha256 rather than keccak256',
        'They sort leaf pairs before hashing',
        'On an odd level they duplicate the last node, while 0G rotates the leftover node to the back of the queue',
        'They cannot handle pre-hashed leaves at all',
      ],
      correctAnswer: 2,
      explanation:
        'MerkleTree.build() handles an odd node count with queue.push(first), carrying the leftover node into the next round rather than pairing it with a copy of itself. This matches zerog-rust. Any library that duplicates produces a different root for any leaf count that is not a power of two.',
      weaknessTopic: '0g-verification',
      practiceHint:
        'Find the odd-level branch in the source before assuming a Merkle implementation is interchangeable.',
    },
    {
      question:
        'You upload the same file a second time. The result has rootHash set, error null, and txHash equal to an empty string. What happened?',
      options: [
        'The upload failed and the error was swallowed',
        'skipIfFinalized defaults to true, so the SDK detected the finalized file and skipped submit entirely',
        'The transaction is still pending and txHash will populate later',
        'The file exceeded fragmentSize and was split',
      ],
      correctAnswer: 1,
      explanation:
        'With skipIfFinalized true, which is the default, the uploader looks up the root, sees a finalized file and returns immediately with an empty txHash, the correct rootHash and the existing txSeq. Nothing failed. Assertions on a truthy txHash misreport this as an error. Pass skipIfFinalized false to force a re-upload and pay again.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'Empty txHash plus valid rootHash plus null error means deduplicated, not failed.',
    },
    {
      question:
        'Your code reads tx.rootHash and it is suddenly undefined after you lowered fragmentSize. Why?',
      options: [
        'Lowering fragmentSize disables root hash computation',
        'The file was split into fragments, so the response is the union member with rootHashes and txHashes arrays',
        'Fragmented uploads return the root only after finalisation',
        'fragmentSize below 256 bytes is rejected and returns an empty object',
      ],
      correctAnswer: 1,
      explanation:
        "indexer.upload returns { txHash, rootHash, txSeq } for a single-fragment upload and { txHashes, rootHashes, txSeqs } when the file is split, which happens above fragmentSize (default 4GB) or whenever you lower it. Branch with 'rootHash' in tx before reading either shape.",
      weaknessTopic: '0g-storage',
      practiceHint:
        'Treat the upload result as a union from day one, even while your test files are tiny.',
    },
    {
      question:
        'You uploaded through the testnet turbo indexer and cannot retrieve the root from the standard indexer. What is going on?',
      options: [
        'Standard indexing lags turbo by several hours',
        'Turbo and Standard are two independent networks with separate indexers and flow contracts, so a turbo root is not retrievable from standard',
        'The root hash format differs between the two modes',
        'You need to pay an additional fee to replicate across both',
      ],
      correctAnswer: 1,
      explanation:
        'They are not two speeds of one network. Turbo is faster with higher fees, Standard is slower and cheaper, each has its own indexer URL, and the SDK auto-discovers a different flow contract from each. Record which mode you uploaded with alongside every root hash you store.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'A root hash without its network and mode is only two thirds of a retrievable reference.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Storage: price an upload before you send it, then send it.
// npm install @0gfoundation/0g-storage-ts-sdk ethers dotenv
import { ZgFile, Indexer } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';                       // Galileo, chainId 16602
const INDEXER_TURBO = 'https://indexer-storage-testnet-turbo.0g.ai';  // turbo network
const EXPLORER = 'https://chainscan-galileo.0g.ai';

const DEFAULT_CHUNK_SIZE = 256;
const DEFAULT_SEGMENT_MAX_CHUNKS = 1024;
const DEFAULT_SEGMENT_SIZE = DEFAULT_CHUNK_SIZE * DEFAULT_SEGMENT_MAX_CHUNKS; // 262144

// TODO 1: Ceiling division, the SDK helper everything else is built on.
// numSplits(300, 256) === 2, numSplits(512, 256) === 2, numSplits(100, 256) === 1.
function numSplits(total: number, unit: number): number {
  // Your code here
}

// TODO 2: Smallest power of two greater than or equal to input.
// nextPow2(0) === 1, nextPow2(1) === 1, nextPow2(3) === 4, nextPow2(17) === 32.
function nextPow2(input: number): number {
  // Your code here
}

// TODO 3: Return [paddedChunks, chunksNextPow2].
// If the chunk count is already a power of two, nothing is padded.
// Otherwise round up to a multiple of minChunk, where minChunk is
// floor(chunksNextPow2 / 16) when chunksNextPow2 >= 16, else 1.
function computePaddedSize(chunks: number): [number, number] {
  // Your code here
}

// TODO 4: Greedy power-of-two decomposition, largest first.
// Return the HEIGHT of each SubmissionNode (height = log2(chunkCount)).
// 300 bytes -> [1].  4400 bytes (18 chunks) -> [4, 1].  100 bytes -> [0].
function submissionNodeHeights(fileSizeBytes: number): number[] {
  // Your code here
}

// TODO 5: Total billable sectors. calculatePrice sums 1 << height per node.
function sectorsForFile(fileSizeBytes: number): number {
  // Your code here
}

// TODO 6: Exact msg.value of the submit() transaction.
function storageFee(fileSizeBytes: number, pricePerSector: bigint): bigint {
  // Your code here
}

// TODO 7: Normalise the union-typed upload response.
// Single fragment: { txHash, rootHash, txSeq }.
// Fragmented:      { txHashes[], rootHashes[], txSeqs[] }.
// deduped is true when every txHash is the empty string, which means
// skipIfFinalized skipped the submit because the file already exists.
function normaliseUploadResult(
  tx: any
): { rootHashes: string[]; txHashes: string[]; deduped: boolean } {
  // Your code here
}

// TODO 8: Upload one file and return the normalised result plus the root
// the SDK computed locally BEFORE any network call.
// Remember try/finally with await file.close(): the fd is not closed for you.
async function uploadOnce(
  filePath: string,
  privateKey: string
): Promise<{ localRoot: string; rootHashes: string[]; txHashes: string[]; deduped: boolean }> {
  // Your code here
}

async function main() {
  for (const size of [100, 300, 512, 4400]) {
    console.log(size + ' bytes ->', submissionNodeHeights(size), sectorsForFile(size) + ' sectors');
  }

  const result = await uploadOnce('./test-300.bin', process.env.PRIVATE_KEY!);
  console.log(result);
  if (!result.deduped) {
    console.log('Explorer:', EXPLORER + '/tx/' + result.txHashes[0]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  solution: `// 0G Storage: price an upload before you send it, then send it.
// npm install @0gfoundation/0g-storage-ts-sdk ethers dotenv
import { ZgFile, Indexer } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';                       // Galileo, chainId 16602
const INDEXER_TURBO = 'https://indexer-storage-testnet-turbo.0g.ai';  // turbo network
const EXPLORER = 'https://chainscan-galileo.0g.ai';

const DEFAULT_CHUNK_SIZE = 256;
const DEFAULT_SEGMENT_MAX_CHUNKS = 1024;
const DEFAULT_SEGMENT_SIZE = DEFAULT_CHUNK_SIZE * DEFAULT_SEGMENT_MAX_CHUNKS; // 262144

// TODO 1: ceiling division
function numSplits(total: number, unit: number): number {
  return Math.floor((total - 1) / unit) + 1;
}

// TODO 2: next power of two
function nextPow2(input: number): number {
  if (input <= 1) return 1;
  return Math.pow(2, Math.ceil(Math.log2(input)));
}

// TODO 3: [paddedChunks, chunksNextPow2]
function computePaddedSize(chunks: number): [number, number] {
  const chunksNextPow2 = nextPow2(chunks);
  if (chunksNextPow2 === chunks) {
    return [chunksNextPow2, chunksNextPow2];
  }
  const minChunk = chunksNextPow2 >= 16 ? Math.floor(chunksNextPow2 / 16) : 1;
  return [numSplits(chunks, minChunk) * minChunk, chunksNextPow2];
}

// TODO 4: greedy power-of-two decomposition, returned as node heights
function submissionNodeHeights(fileSizeBytes: number): number[] {
  const chunks = numSplits(fileSizeBytes, DEFAULT_CHUNK_SIZE);
  let [paddedChunks, nextChunkSize] = computePaddedSize(chunks);
  const heights: number[] = [];

  while (paddedChunks > 0 && nextChunkSize >= 1) {
    if (paddedChunks >= nextChunkSize) {
      paddedChunks -= nextChunkSize;
      heights.push(Math.log2(nextChunkSize));
    }
    nextChunkSize /= 2;
  }
  return heights;
}

// TODO 5: sectors = sum of 1 << height
function sectorsForFile(fileSizeBytes: number): number {
  return submissionNodeHeights(fileSizeBytes).reduce(
    (sum, height) => sum + (1 << height),
    0,
  );
}

// TODO 6: exact msg.value of submit()
function storageFee(fileSizeBytes: number, pricePerSector: bigint): bigint {
  return BigInt(sectorsForFile(fileSizeBytes)) * pricePerSector;
}

// TODO 7: normalise the union-typed response
function normaliseUploadResult(
  tx: any
): { rootHashes: string[]; txHashes: string[]; deduped: boolean } {
  const single = 'rootHash' in tx;
  const rootHashes = single ? [tx.rootHash] : tx.rootHashes;
  const txHashes = single ? [tx.txHash] : tx.txHashes;
  return {
    rootHashes,
    txHashes,
    // An empty txHash with a valid root means skipIfFinalized deduplicated it.
    deduped: txHashes.length > 0 && txHashes.every((h: string) => h === ''),
  };
}

// TODO 8: upload one file
async function uploadOnce(
  filePath: string,
  privateKey: string
): Promise<{ localRoot: string; rootHashes: string[]; txHashes: string[]; deduped: boolean }> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(privateKey, provider);
  const indexer = new Indexer(INDEXER_TURBO);

  const file = await ZgFile.fromFilePath(filePath);
  try {
    // merkleTree() must run before upload: it computes the root locally,
    // with no network involved. Keep this value to verify against later.
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      throw new Error('Merkle tree generation failed: ' + treeErr);
    }
    const localRoot = tree!.rootHash() as string;

    const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer as any);
    if (uploadErr !== null) {
      throw new Error('Upload failed: ' + uploadErr);
    }

    return { localRoot, ...normaliseUploadResult(tx) };
  } finally {
    // The file descriptor is not closed for you.
    await file.close();
  }
}

async function main() {
  for (const size of [100, 300, 512, 4400]) {
    console.log(size + ' bytes ->', submissionNodeHeights(size), sectorsForFile(size) + ' sectors');
  }
  // 100  -> [0]     1 sector
  // 300  -> [1]     2 sectors
  // 512  -> [1]     2 sectors   <- identical fee to the 300-byte file
  // 4400 -> [4, 1] 18 sectors

  const result = await uploadOnce('./test-300.bin', process.env.PRIVATE_KEY!);
  console.log(result);
  if (!result.deduped) {
    console.log('Explorer:', EXPLORER + '/tx/' + result.txHashes[0]);
  } else {
    console.log('Already stored. Root:', result.rootHashes[0]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  hints: [
    'numSplits is ceiling division written as Math.floor((total - 1) / unit) + 1. Verify it against 300 and 512 bytes immediately: both must give 2 chunks, and that single fact is the answer to the pricing question.',
    'In computePaddedSize, return early when the chunk count is already a power of two. Skipping that branch makes minChunk shrink the value and quietly produces wrong sector counts for the exact sizes you are testing with.',
    'The SDK splitNodes returns chunk counts and createSegmentNode converts them with height = log2(chunks). Returning heights directly is fine here, just remember calculatePrice then needs 1 << height rather than the raw count.',
    'For the greedy decomposition, start nextChunkSize at chunksNextPow2 and halve it each round, subtracting whenever paddedChunks is at least as large. 18 padded chunks becomes 16 plus 2, so heights [4, 1] and 18 sectors.',
    "In normaliseUploadResult, branch with 'rootHash' in tx rather than checking whether Array.isArray(tx.rootHashes). Both shapes are real return types, and reading the wrong one gives undefined instead of an error.",
    'uploadOnce must call merkleTree() before indexer.upload, and must close the file in a finally block. Keep the locally computed root: comparing it against a root you recompute after downloading is the whole verification story in the next lesson.',
  ],

  proof: {
    label: 'Two root hashes, two submit() transactions, two fees, and one dedup response',
    hint: 'Upload a 300-byte file and a 512-byte file to Galileo turbo and record both root hashes, both submit() transaction hashes opened on chainscan, and the storage fee charged for each (they should match, and your sectorsForFile should predict both). Then upload the 300-byte file a second time and capture the response showing an empty txHash alongside a valid rootHash and a null error. Submit all of it as one JSON artefact.',
    verifyUrl: 'https://chainscan-galileo.0g.ai',
    pattern: '^0x[a-fA-F0-9]{64}$',
  },
};
