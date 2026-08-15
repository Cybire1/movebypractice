import { LessonContent } from '../types/lesson';

export const ogLesson9: LessonContent = {
  id: '0g-9',
  title: 'Download and Actually Verify',
  description:
    'The third argument to indexer.download() is named proof, and in the TypeScript SDK it verifies nothing. Learn to prove integrity yourself by recomputing the Merkle root and validating segment proofs.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 9,
  language: 'typescript',
  prerequisiteLessons: ['0g-8'],

  narrative: {
    welcomeMessage:
      "In lesson 8 you uploaded a file and got back a root hash. Now you want it back. The official docs and the official skill files both say the same thing: always use verified downloads in production, pass true as the third argument. In this lesson you will open the SDK source and find that the flag is accepted, threaded through four function calls, renamed with a leading underscore, and then never read. Then you will build the verification that actually works.",
    quizTransition:
      'You have traced the flag, recomputed a root, and walked the four checks inside Proof.validate. Time to see whether the details stuck, because these are the details that decide whether your data is trusted or merely downloaded.',
    practiceTransition:
      'Now write the verifier. Four functions: recompute a file root, compare it to the expected root, rebuild a segment root from raw chunks, and validate a real Merkle proof fetched from a storage node.',
    celebrationMessage:
      'You now have something most 0G developers do not: a download path where integrity is checked by code you can point at. A root hash you recomputed yourself is worth more than a boolean returned by a function that never looked.',
    nextLessonTease:
      'Next: the seam where storage meets the chain. A contract stores 32 bytes of hash and never the data, which means the ordering of your calls becomes a safety property that nothing on-chain can enforce for you.',
  },

  teachingSections: [
    {
      sectionTitle: 'The Flag That Promises Verification',
      slides: [
        {
          title: 'Why a Download Needs Proving',
          content:
            'A storage node is not your server. It is an independent operator that gets paid to hold bytes and serve them back. Nothing about that arrangement forces it to serve the right bytes. The root hash you saved in lesson 8 is a commitment: it names exactly one byte sequence out of all possible byte sequences. Verification is the act of checking that what arrived hashes back to that commitment. Skip it and you have downloaded something, not retrieved your file.',
          emoji: '🔍',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'Silent truncation',
                  content:
                    'A node returns fewer segments than the file has, or a segment short by one chunk. Your file opens, your JSON parses up to the cut, and nothing errors. Only a root recomputation catches it.',
                },
                {
                  label: 'Wrong segment served',
                  content:
                    'You ask for segment 3 and the node hands you segment 7. Both are real segments of a real file, both hash to something valid, and the assembled file is silently scrambled. Only a position check catches this one.',
                },
                {
                  label: 'Stale replica',
                  content:
                    'A node that fell behind serves an older version of a stream. The bytes are internally consistent but they are not the bytes your root hash commits to.',
                },
                {
                  label: 'The honest failure mode',
                  content:
                    'Most of the time nothing malicious happens. Disks flip bits, proxies truncate responses, and retry logic writes a partial body twice. Verification is mostly a bug detector, and occasionally an attack detector.',
                },
              ],
              explanation:
                'Framing verification as integrity rather than paranoia. The threat model includes ordinary infrastructure failure, not just malice.',
            },
          },
        },
        {
          title: 'Follow the Flag Through the SDK',
          content:
            'Here is the actual call chain in @0gfoundation/0g-ts-sdk. Indexer.download() takes proof, hands it to downloadSingle, which hands it to Downloader.download, which hands it to downloadFileHelper, which hands it to downloadTask. In downloadTask the parameter is spelled _proof. The leading underscore is the TypeScript convention for "declared but deliberately unused", and directly above the function sits a comment the maintainers left in place.',
          emoji: '🧵',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// 0g-ts-sdk/src.ts/indexer/Indexer.ts
await indexer.download(rootHash, filePath, true)  // the "verified" download
  -> downloadSingle(rootHash, filePath, proof)
  -> downloader.download(rootHash, filePath, proof)
  -> downloadFileHelper(filePath, info, proof)

// 0g-ts-sdk/src.ts/transfer/Downloader.ts line 458
// TODO: add proof check
async downloadTask(
    info: FileInfo,
    segmentOffset: number,
    taskInd: number,
    numChunks: number,
    _proof: boolean            // renamed. never read. not one reference.
): Promise<[Uint8Array, Error | null]> {
    // fetches segment bytes by txSeq, trims chunk padding, returns them
    // there is no Proof.validate() call anywhere in this function
}`,
              highlights: [
                {
                  line: 2,
                  explanation:
                    'This is the line every tutorial shows you. It returns null on success and you conclude the bytes were verified. It only means the bytes arrived.',
                },
                {
                  line: 8,
                  explanation:
                    'The literal comment in the shipped SDK at Downloader.ts:458. This is your one-line evidence when someone insists the flag works.',
                },
                {
                  line: 14,
                  explanation:
                    'The underscore prefix is the tell. TypeScript and most lint configs treat _param as intentionally unused, so no warning ever fires and the dead flag survives review.',
                },
                {
                  line: 17,
                  explanation:
                    'The function does do real work: shard selection, base64 decode, and padding trim on the last segment. It just never compares anything to the root you asked for.',
                },
              ],
              explanation:
                'Tracing an unimplemented feature through four layers of call forwarding. The lesson generalizes: read the leaf function, not the entry point.',
            },
          },
        },
        {
          title: 'Docs Say One Thing, Code Does Another',
          content:
            'This is not a rumor. The official storage skill file lists "use verified downloads in production (third param = true)" under ALWAYS, and its anti-pattern block flags passing false. The docs repeat it. The Go client actually honors its --proof flag. The TypeScript SDK does not, and it fails open: no throw, no warning, no error return. That combination, advice that sounds right plus code that quietly does nothing, is worse than no advice at all, because it stops you from writing the check yourself.',
          emoji: '📄',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What the skill file says',
                  content:
                    'skills/storage/download-file/SKILL.md, under ALWAYS: "Use verified downloads in production (third param = true)". Under NEVER: "Use unverified downloads for critical data". Both true as intent, neither enforced by the TS runtime.',
                },
                {
                  label: 'What the Go client does',
                  content:
                    'The Go implementation validates segment proofs when --proof is set. If you need verification handled for you today, the Go client is the path that delivers it.',
                },
                {
                  label: 'Fails open, not closed',
                  content:
                    'A security control that fails closed breaks loudly and gets fixed. This one fails open: download(root, path, true) returns null, your test passes, and the gap ships. Assume nothing you did not compute.',
                },
                {
                  label: 'Two ways to get real integrity today',
                  content:
                    'One: download the file, then recompute its root with ZgFile.fromFilePath + merkleTree() and compare. Two: pull segments with downloadSegmentWithProofByTxSeq and run Proof.validate() yourself. The first proves the whole file. The second proves a piece without fetching the rest.',
                },
              ],
              explanation:
                'Separating documented intent from runtime behavior, and naming the two workable alternatives before teaching either.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-009-a',
    },
    {
      sectionTitle: 'Recompute the Root Yourself',
      slides: [
        {
          title: 'The Root Is the Only Thing Worth Comparing',
          content:
            'Comparing file sizes proves nothing. Comparing a SHA-256 you invented proves nothing, because the network never committed to it. The only value the network committed to is the 0G file root, built the way lesson 8 described: chunks into segments, segment roots as pre-hashed leaves of the outer tree. So recompute that exact root over the downloaded bytes. ZgFile.fromFilePath opens a file descriptor, and merkleTree() gives you the tree. The descriptor is not closed for you, which is why close() belongs in a finally block, not on the happy path.',
          emoji: '🌳',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { ZgFile } from '@0gfoundation/0g-ts-sdk';

export async function recomputeRoot(filePath: string): Promise<string> {
  const file = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, err] = await file.merkleTree();
    if (err !== null || tree === null) {
      throw new Error('merkle tree failed: ' + String(err));
    }
    return tree.rootHash() as string;
  } finally {
    await file.close();
  }
}

// usage after any download
const recomputed = await recomputeRoot('./downloads/lesson8.txt');
console.log('match:', recomputed.toLowerCase() === expectedRoot.toLowerCase());`,
              highlights: [
                {
                  line: 4,
                  explanation:
                    'fromFilePath opens a real fd. Every early return, every throw, every await that rejects between here and close() leaks it. Long-running services die of this.',
                },
                {
                  line: 6,
                  explanation:
                    'The SDK uses Go-style tuple returns: [value, error]. err is null on success. Check err before touching tree, because tree is null when err is set.',
                },
                {
                  line: 11,
                  explanation:
                    'finally, not a trailing close(). This is the only placement that survives the throw on line 8.',
                },
                {
                  line: 18,
                  explanation:
                    'Lowercase both sides before comparing. Root hashes travel through JSON, CLIs, and contract ABIs, and casing is not preserved everywhere.',
                },
              ],
              explanation:
                'The full-file integrity check, with the resource-leak trap that the official skill file also calls out.',
            },
          },
        },
        {
          title: 'Trim the Padding or Never Match',
          content:
            'Storage speaks in whole 256-byte chunks. A 300-byte file occupies two chunks, so the final chunk carries 212 bytes of zero padding that were never part of your file. When you let indexer.download() write the file, the SDK trims that padding for you in downloadTask. When you pull raw segments yourself, nothing trims anything, and a root recomputed over the padded bytes will never match. The formula the SDK uses is DEFAULT_CHUNK_SIZE - (fileSize % DEFAULT_CHUNK_SIZE), applied only when the remainder is greater than zero and only to the last segment.',
          emoji: '✂️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'f100', label: '100-byte file', emoji: '📄' },
                { id: 'f300', label: '300-byte file', emoji: '📄' },
                { id: 'f1000', label: '1000-byte file', emoji: '📃' },
                { id: 'f5000', label: '5000-byte file', emoji: '📃' },
              ],
              targets: [
                { id: 'p156', label: 'slice off 156 trailing bytes' },
                { id: 'p212', label: 'slice off 212 trailing bytes' },
                { id: 'p24', label: 'slice off 24 trailing bytes' },
                { id: 'p120', label: 'slice off 120 trailing bytes' },
              ],
              correctPairs: [
                { itemId: 'f100', targetId: 'p156' },
                { itemId: 'f300', targetId: 'p212' },
                { itemId: 'f1000', targetId: 'p24' },
                { itemId: 'f5000', targetId: 'p120' },
              ],
              explanation:
                'padding = 256 - (fileSize % 256) when the remainder is nonzero. 100 gives 156, 300 gives 212, 1000 gives 24, 5000 gives 120. An exact multiple of 256 gives zero and the trim is skipped entirely.',
            },
          },
        },
        {
          title: 'Break It on Purpose',
          content:
            'A verifier you have never seen fail is not a verifier, it is a function that returns true. Prove yours works by corrupting the input. Truncate one byte off the downloaded file and rerun: the final chunk hashes differently, its segment root changes, the outer tree changes, and the file root diverges. One byte at the end of a multi-gigabyte file moves the root just as loudly as one byte at the start, which is the entire point of hashing over a tree.',
          emoji: '💥',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import fs from 'fs';

// take one byte off the end and watch the root move
const original = fs.readFileSync('./downloads/lesson8.txt');
fs.writeFileSync('./downloads/lesson8.truncated.txt', original.subarray(0, original.length - 1));

const good = await recomputeRoot('./downloads/lesson8.txt');
const bad  = await recomputeRoot('./downloads/lesson8.truncated.txt');

console.log('expected :', expectedRoot);
console.log('good     :', good, good === expectedRoot);   // true
console.log('truncated:', bad,  bad  === expectedRoot);   // false

// a size check would NOT have caught a same-length byte flip:
const flipped = Buffer.from(original);
flipped[0] = flipped[0] ^ 0xff;
fs.writeFileSync('./downloads/lesson8.flipped.txt', flipped);`,
              highlights: [
                {
                  line: 5,
                  explanation:
                    'Truncation is the easiest corruption to simulate and the most common one in the wild, because it is what a dropped connection produces.',
                },
                {
                  line: 11,
                  explanation:
                    'The passing case. Run it first so you know the harness itself works before you trust a failure.',
                },
                {
                  line: 12,
                  explanation:
                    'The failing case. If this prints true, your comparison is broken, not the file. Check casing and check that you compared against the root from lesson 8 rather than the one you just computed.',
                },
                {
                  line: 15,
                  explanation:
                    'Same byte count, different content. Length checks and stat() comparisons pass happily here. Only the root moves.',
                },
              ],
              explanation:
                'Negative testing the verifier. Two corruption shapes, one that changes size and one that does not.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-009-b',
    },
    {
      sectionTitle: 'Segment Proofs and the Four Checks',
      slides: [
        {
          title: 'Proof.validate Runs Four Checks in Order',
          content:
            'Recomputing the full root needs the full file. A Merkle proof does not: it verifies one segment against the root using about log2(numSegments) sibling hashes. The SDK ships the verifier already, in MerkleTree.ts. Proof.validate hashes your content and hands off to validateHash, which runs format, content, root, position, then the fold. Order matters, because the first check that fails is the error you get back, and each one tells you something different about who lied to you.',
          emoji: '🧮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// 0g-ts-sdk/src.ts/file/MerkleTree.ts
validateHash(rootHash, contentHash, position, numLeafNodes): ProofErrors | null {
  const formatError = this.validateFormat();          // 1. path.length + 2 === lemma.length
  if (formatError !== null) return formatError;

  if (contentHash !== this.lemma[0]) {                // 2. CONTENT_MISMATCH
    return ProofErrors.CONTENT_MISMATCH;
  }

  if (this.lemma.length > 1 &&                        // 3. ROOT_MISMATCH
      rootHash !== this.lemma[this.lemma.length - 1]) {
    return ProofErrors.ROOT_MISMATCH;
  }

  const proofPosition = this.calculateProofPosition(numLeafNodes);
  if (proofPosition !== position) {                   // 4. POSITION_MISMATCH
    return ProofErrors.POSITION_MISMATCH;
  }

  if (!this.validateRoot()) {                         // 5. the fold
    return ProofErrors.VALIDATION_FAILURE;
  }
  return null;                                        // null means valid
}`,
              highlights: [
                {
                  line: 3,
                  explanation:
                    'The lemma is leaf hash, then one sibling per level, then the root. So it is always exactly two longer than the path of left/right flags. A malformed proof is rejected before any hashing happens.',
                },
                {
                  line: 6,
                  explanation:
                    'lemma[0] is the leaf. For a 0G file tree the leaf is the segment root, not keccak256 of the raw segment bytes. Get this wrong and you will chase a CONTENT_MISMATCH that is your bug rather than a bad response from the node.',
                },
                {
                  line: 10,
                  explanation:
                    'The last lemma entry must equal the root you asked about. This catches a node that hands you a perfectly valid proof for a different file.',
                },
                {
                  line: 16,
                  explanation:
                    'The check that stops segment substitution. Position is not sent by the node, it is decoded from the left/right path flags, so a node cannot claim an index it does not have a proof for.',
                },
                {
                  line: 20,
                  explanation:
                    'Only now does it fold the lemma upward, keccak256(left, right) at each level, and compare to the root. Everything before this is cheap rejection.',
                },
              ],
              explanation:
                'The real source of validateHash with the ordering that determines which error surfaces first.',
            },
          },
        },
        {
          title: 'Which Error Means What',
          content:
            'ProofErrors is a five-value enum and each value points at a different failure. Learning to read them saves hours, because four of the five usually mean your code is wrong and only one usually means the node is wrong. Match each error to the condition that produces it.',
          emoji: '🚨',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'wrong-format', label: 'WRONG_FORMAT', emoji: '📐' },
                { id: 'content', label: 'CONTENT_MISMATCH', emoji: '🧩' },
                { id: 'root', label: 'ROOT_MISMATCH', emoji: '🌲' },
                { id: 'position', label: 'POSITION_MISMATCH', emoji: '📍' },
                { id: 'validation', label: 'VALIDATION_FAILURE', emoji: '⛓️' },
              ],
              targets: [
                { id: 't-format', label: 'path.length + 2 does not equal lemma.length' },
                { id: 't-content', label: 'the leaf hash you computed is not lemma[0]' },
                { id: 't-root', label: 'the final lemma entry is a different file root' },
                { id: 't-position', label: 'the path flags decode to a different segment index' },
                { id: 't-validation', label: 'the lemma folds to a hash that is not the root' },
              ],
              correctPairs: [
                { itemId: 'wrong-format', targetId: 't-format' },
                { itemId: 'content', targetId: 't-content' },
                { itemId: 'root', targetId: 't-root' },
                { itemId: 'position', targetId: 't-position' },
                { itemId: 'validation', targetId: 't-validation' },
              ],
              explanation:
                'A node serving segment 7 as segment 3 passes content and root, then trips POSITION_MISMATCH at check four via calculateProofPosition.',
            },
          },
        },
        {
          title: 'Position Is Decoded, Not Trusted',
          content:
            'calculateProofPosition walks the path flags from the top down. At each level it computes how many leaves sit on the left subtree, then either descends left, keeping the position, or descends right, adding the left subtree size to the position. The number that falls out is where this leaf must live in a tree of numLeafNodes leaves. Compare it to the index you asked for. That single comparison is what turns a proof of "this segment belongs to this file" into a proof of "this segment is segment 3 of this file".',
          emoji: '📍',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What numLeafNodes must be',
                  content:
                    'The leaf count of the outer file tree, which is the number of padded segments, not the number of chunks and not the number of bytes. Derive it: numSplits(size, 256) gives chunks, computePaddedSize(chunks) gives padded chunks, then numSplits(paddedChunks * 256, 262144) gives segments.',
                },
                {
                  label: 'Why the node cannot forge it',
                  content:
                    'The path flags are not metadata the node attaches, they are the shape of the proof itself. Changing a flag changes which side each sibling folds on, which changes the computed root, which fails the final fold. Position and validity are welded together.',
                },
                {
                  label: 'The single-segment case',
                  content:
                    'For a file under 256KB the tree has one leaf, so proofAt returns lemma [root] and an empty path. Every check still runs: content equals root, position computes 0. Ask it to validate as index 1 and you still get POSITION_MISMATCH, which is the cheapest way to see the error fire.',
                },
                {
                  label: 'The leaf is a segment root',
                  content:
                    'Rebuild it the way AbstractFile.segmentRoot does: addLeaf for each 256-byte chunk of the segment, then addLeafByHash(EMPTY_CHUNK_HASH) once per flow-padding chunk, then build(). Feed that hash to validateHash. Feeding raw bytes to validate() instead hashes the whole segment once and mismatches immediately.',
                },
              ],
              explanation:
                'The position check explained as a decode rather than an assertion, plus the two shapes learners get wrong: numLeafNodes and the leaf hash.',
            },
          },
        },
      ],
      exerciseId: 'mc-0g-009-c',
    },
  ],

  quiz: [
    {
      question:
        'A storage node serves you segment 7 (real data, real proof) when you asked for segment 3. Which ProofError fires?',
      options: [
        'CONTENT_MISMATCH, because the bytes are not the bytes of segment 3',
        'ROOT_MISMATCH, because the proof belongs to a different subtree',
        'POSITION_MISMATCH, because calculateProofPosition decodes 7 and you passed 3',
        'None of them, a valid proof for a valid segment always validates',
      ],
      correctAnswer: 2,
      explanation:
        'Segment 7 served with the proof for segment 7 passes the format check, passes CONTENT_MISMATCH (the leaf hash really is lemma[0]) and passes ROOT_MISMATCH (same file, same root). Check four decodes the path flags to position 7, compares against the 3 you passed, and returns POSITION_MISMATCH. Without that check, segment substitution inside one file is undetectable.',
      weaknessTopic: '0g-verification',
      practiceHint:
        'Walk validateHash top to bottom and ask at each check whether swapping segments inside the same file would trip it.',
    },
    {
      question:
        'What is the one-line evidence in the SDK that indexer.download(root, path, true) does not verify anything?',
      options: [
        'The proof parameter defaults to false in the overload signature',
        'Downloader.downloadTask takes the flag as _proof and carries the comment "// TODO: add proof check" at Downloader.ts:458',
        'Indexer.download logs a warning when proof is true',
        'The Proof class is not exported from the package root',
      ],
      correctAnswer: 1,
      explanation:
        'The flag is forwarded through downloadSingle, Downloader.download and downloadFileHelper, and lands in downloadTask where it is renamed _proof, never read, and preceded by a maintainer TODO at line 458. The default value is a red herring, and Proof is exported and fully functional, it is simply never called on the download path.',
      weaknessTopic: '0g-verification',
      practiceHint:
        'Trace a suspicious flag to the leaf function that would have to use it, not the entry point that accepts it.',
    },
    {
      question:
        'You pull raw segments yourself for a 300-byte file. How many trailing bytes must you slice off the final segment before recomputing?',
      options: ['212', '44', '256', '0, storage returns exactly the file bytes'],
      correctAnswer: 0,
      explanation:
        'Storage always returns whole 256-byte chunks. 300 % 256 = 44 real bytes in the last chunk, so 256 - 44 = 212 bytes are padding. The SDK applies exactly this formula in downloadTask, but only for the last segment and only when the remainder is nonzero. Forget the trim and your recomputed root can never match.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'padding = DEFAULT_CHUNK_SIZE - (fileSize % DEFAULT_CHUNK_SIZE), skipped when the remainder is zero.',
    },
    {
      question:
        'What must always follow ZgFile.fromFilePath, and where must it go?',
      options: [
        'file.flush(), immediately after merkleTree() resolves',
        'file.close(), in a finally block, because the file descriptor is not closed for you',
        'Nothing, the SDK closes the handle when merkleTree() returns',
        'file.close(), but only when merkleTree() returns an error',
      ],
      correctAnswer: 1,
      explanation:
        'fromFilePath opens a real fd and the SDK never closes it. Putting close() on the happy path leaks the descriptor on every thrown error, which is how long-running services run out of file handles. finally is the only placement that always runs. The official merkle-verification skill lists this under ALWAYS and shows the leak as an anti-pattern.',
      weaknessTopic: '0g-storage',
      practiceHint:
        'Any SDK call that hands back a handle needs try/finally, not a trailing cleanup line.',
    },
    {
      question: 'In what order does validateHash run its checks?',
      options: [
        'fold the lemma, then content, then root, then position, then format',
        'format, content, root, position, then fold the lemma',
        'root, position, format, content, then fold the lemma',
        'content, format, fold the lemma, then root and position together',
      ],
      correctAnswer: 1,
      explanation:
        'validateFormat first (path.length + 2 must equal lemma.length), then CONTENT_MISMATCH against lemma[0], then ROOT_MISMATCH against the final lemma entry, then POSITION_MISMATCH via calculateProofPosition, and only then validateRoot folds the lemma upward. Cheap structural rejections come before any hashing work.',
      weaknessTopic: '0g-verification',
    },
    {
      question:
        'Which two techniques give you real integrity on a TypeScript download today?',
      options: [
        'Pass true to download(), and compare file sizes afterwards',
        'Recompute the root with ZgFile + merkleTree() and compare, or fetch segments with downloadSegmentWithProofByTxSeq and run Proof.validate yourself',
        'Use downloadToBlob instead of download, and check the blob type',
        'Query the indexer twice and diff the two responses',
      ],
      correctAnswer: 1,
      explanation:
        'Recomputing the file root proves the whole file against the commitment you already hold. Segment proofs prove one piece without fetching the rest, which is what you want for large files and for streaming reads. The flag verifies nothing, sizes prove nothing, downloadToBlob threads the same dead flag, and diffing two responses only proves two nodes agree.',
      weaknessTopic: '0g-verification',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// verify.ts - real integrity checking for 0G Storage downloads
// Run against the file you uploaded in lesson 8.
import {
  ZgFile,
  Indexer,
  StorageNode,
  MerkleTree,
  Proof,
  ProofErrors,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_SEGMENT_SIZE,
  EMPTY_CHUNK_HASH,
  computePaddedSize,
  numSplits,
} from '@0gfoundation/0g-ts-sdk';
import { decodeBase64 } from 'ethers';
import 'dotenv/config';

const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

// TODO 1: Recompute the 0G file root of a local file.
// Open it with ZgFile.fromFilePath, call merkleTree(), return tree.rootHash().
// The SDK returns [tree, err] Go-style. The fd is NOT closed for you:
// close() must live in a finally block.
export async function recomputeRoot(filePath: string): Promise<string> {
  // Your code here
}

// TODO 2: Download by root hash, then prove the bytes.
// Call indexer.download(rootHash, outputPath, true) - the flag is decorative,
// so recompute the root afterwards and compare (lowercase both sides).
// Note: download() returns Error | null AND can throw. Handle both.
// Note: it refuses to overwrite, so outputPath must not already exist.
export async function verifyDownload(
  rootHash: string,
  outputPath: string
): Promise<boolean> {
  // Your code here
}

// TODO 3: Rebuild a segment root from raw segment bytes.
// This is what AbstractFile.segmentRoot does: one leaf per 256-byte chunk via
// addLeaf, then one addLeafByHash(EMPTY_CHUNK_HASH) per flow-padding chunk,
// then build(). The result is the LEAF of the outer file tree.
export function segmentRoot(
  segment: Uint8Array,
  emptyChunksPadded: number = 0
): string {
  // Your code here
}

// TODO 4: Fetch one segment with its proof and validate it.
// Steps:
//   a. indexer.getFileLocations(rootHash) -> pick a node url
//   b. new StorageNode(url).getFileInfo(rootHash, true) -> info.tx.seq, info.tx.size
//   c. derive numChunks, paddedChunks and numLeafNodes (the segment count)
//   d. node.downloadSegmentWithProofByTxSeq(info.tx.seq, segmentIndex)
//   e. decodeBase64(seg.data), rebuild the leaf with segmentRoot(...)
//   f. new Proof(seg.proof.lemma, seg.proof.path).validateHash(root, leaf, claimedIndex, numLeafNodes)
// Pass a claimedIndex different from segmentIndex to force POSITION_MISMATCH.
export async function validateSegment(
  rootHash: string,
  segmentIndex: number,
  claimedIndex: number = segmentIndex
): Promise<ProofErrors | null> {
  // Your code here
}`,

  solution: `// verify.ts - real integrity checking for 0G Storage downloads
import {
  ZgFile,
  Indexer,
  StorageNode,
  MerkleTree,
  Proof,
  ProofErrors,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_SEGMENT_SIZE,
  EMPTY_CHUNK_HASH,
  computePaddedSize,
  numSplits,
} from '@0gfoundation/0g-ts-sdk';
import { decodeBase64 } from 'ethers';
import 'dotenv/config';

const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

// TODO 1: recompute the 0G file root of a local file
export async function recomputeRoot(filePath: string): Promise<string> {
  const file = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, err] = await file.merkleTree();
    if (err !== null || tree === null) {
      throw new Error('merkle tree failed: ' + String(err));
    }
    return tree.rootHash() as string;
  } finally {
    await file.close();
  }
}

// TODO 2: download, then prove the bytes
export async function verifyDownload(
  rootHash: string,
  outputPath: string
): Promise<boolean> {
  const indexer = new Indexer(INDEXER_URL);

  // The third argument is accepted and ignored. We pass it anyway so the
  // intent is visible, and then we do the work it does not do.
  let err: Error | null = null;
  try {
    err = await indexer.download(rootHash, outputPath, true);
  } catch (e) {
    throw new Error('download threw: ' + (e as Error).message);
  }
  if (err !== null) {
    throw new Error('download failed: ' + err.message);
  }

  const recomputed = await recomputeRoot(outputPath);
  const match = recomputed.toLowerCase() === rootHash.toLowerCase();

  console.log('expected  :', rootHash);
  console.log('recomputed:', recomputed);
  console.log('match     :', match);
  return match;
}

// TODO 3: rebuild a segment root from raw segment bytes
export function segmentRoot(
  segment: Uint8Array,
  emptyChunksPadded: number = 0
): string {
  const tree = new MerkleTree();

  for (let offset = 0; offset < segment.length; offset += DEFAULT_CHUNK_SIZE) {
    tree.addLeaf(segment.subarray(offset, offset + DEFAULT_CHUNK_SIZE));
  }
  for (let i = 0; i < emptyChunksPadded; i++) {
    tree.addLeafByHash(EMPTY_CHUNK_HASH);
  }

  tree.build();
  return tree.rootHash() as string;
}

// TODO 4: fetch one segment with its proof and validate it
export async function validateSegment(
  rootHash: string,
  segmentIndex: number,
  claimedIndex: number = segmentIndex
): Promise<ProofErrors | null> {
  const indexer = new Indexer(INDEXER_URL);

  const locations = await indexer.getFileLocations(rootHash);
  if (locations.length === 0) {
    throw new Error('no storage node holds ' + rootHash);
  }

  const node = new StorageNode(locations[0].url);
  const info = await node.getFileInfo(rootHash, true);
  if (info === null) throw new Error('file not found on node');
  if (!info.finalized) throw new Error('file not finalized yet, retry shortly');

  // Leaf count of the OUTER file tree = number of padded segments.
  const numChunks = numSplits(info.tx.size, DEFAULT_CHUNK_SIZE);
  const [paddedChunks] = computePaddedSize(numChunks);
  const numLeafNodes = numSplits(
    paddedChunks * DEFAULT_CHUNK_SIZE,
    DEFAULT_SEGMENT_SIZE
  );

  const seg = await node.downloadSegmentWithProofByTxSeq(
    info.tx.seq,
    segmentIndex
  );
  const bytes = decodeBase64(seg.data);

  // Flow padding only applies to the last segment of the file.
  const isLast = segmentIndex === numLeafNodes - 1;
  const emptyChunksPadded = isLast ? paddedChunks - numChunks : 0;
  const leafHash = segmentRoot(bytes, emptyChunksPadded);

  const proof = new Proof(seg.proof.lemma, seg.proof.path);
  const result = proof.validateHash(
    rootHash,
    leafHash,
    claimedIndex,
    numLeafNodes
  );

  console.log('segment    :', segmentIndex, 'claimed as', claimedIndex);
  console.log('bytes      :', bytes.length);
  console.log('leaf hash  :', leafHash);
  console.log('result     :', result === null ? 'VALID' : result);
  return result;
}

// Demo run: valid proof, then a deliberate POSITION_MISMATCH.
async function main() {
  const root = process.env.LESSON8_ROOT as string;

  await verifyDownload(root, './downloads/verify-me.bin');

  await validateSegment(root, 0);        // expect VALID
  await validateSegment(root, 0, 1);     // expect POSITION_MISMATCH
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  hints: [
    'recomputeRoot: the SDK returns [tree, err]. Check err first, because tree is null whenever err is set. Put await file.close() in finally so the fd survives the throw on the error path.',
    'verifyDownload: indexer.download refuses to write to a path that already exists and returns "Wrong path, provide a file path which does not exist." Delete the output file between runs or use a fresh name.',
    'Root hashes come back 0x-prefixed with 64 hex characters. Lowercase both sides before comparing, since a value that has travelled through a contract ABI or a CLI may be cased differently.',
    'segmentRoot: use addLeaf for real chunks (it keccak256-hashes the content) and addLeafByHash for padding (EMPTY_CHUNK_HASH is already a hash). Mixing them up gives you a hash of a hash and an instant CONTENT_MISMATCH.',
    'numLeafNodes is the number of padded SEGMENTS, not chunks. numSplits(size, 256) gives chunks, computePaddedSize(chunks)[0] gives padded chunks, and numSplits(paddedChunks * 256, DEFAULT_SEGMENT_SIZE) gives the leaf count. Getting this wrong shows up as POSITION_MISMATCH on a proof that is actually fine.',
    'To force POSITION_MISMATCH, fetch segment 0 and validate it as index 1. Even a single-segment file trips it, because calculateProofPosition on an empty path always returns 0.',
    'If you get CONTENT_MISMATCH on a valid segment, print bytes.length. The node returns whole 256-byte chunks, so the last segment can be longer than the remaining file bytes. That is expected and the flow padding count handles it.',
  ],

  proof: {
    label: 'verify.ts output: recomputed root, a truncation failure, and one POSITION_MISMATCH',
    hint: 'Run verify.ts against your lesson 8 root and capture three things: expectedRoot === recomputedRoot printing true, the same script printing false after you truncate one byte off the downloaded file, and one Proof.validate success plus one deliberate POSITION_MISMATCH from passing the wrong claimed index.',
    verifyUrl: 'https://indexer-storage-testnet-turbo.0g.ai',
    pattern: '0x[a-fA-F0-9]{64}',
  },
};
