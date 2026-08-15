# 0G — Advanced

**Goal.** Reach every layer he has never touched — DA end to end, on-chain availability gating, alt-DA rollups, the real ERC-7857 transfer machinery with a real TEE oracle, the provider side of the marketplace — and produce upstream contributions, not just working code. This is the tier that makes 'understands the whole stack' unfalsifiable.


---

## 21. DA from first principles — compute a data root with no DA node

### Teaching
0G Storage and 0G DA share one cryptographic primitive and almost nothing else. A DA blob is at most 32,505,852 bytes — an odd number that falls out of the construction, not a round limit. The blob is zero-padded to exactly that length with a 4-byte little-endian original size appended, then laid out as a 1024x1024 matrix where each element is 31 bytes padded with one zero byte to 32, so every element is a valid BN254 scalar field member. A polynomial of degree 2^20-1 is interpolated through those values and evaluated at additional points to erasure-extend to 3072x1024 — 3x redundancy, so losing two thirds of the rows still reconstructs. The erasure commitment is a KZG commitment over BN254 G1 using the perpetual-powers-of-tau setup. HERE IS THE BRIDGE, and it is the single most important fact in this tier: DA's 'data root' is defined as the 0G STORAGE SUBMISSION ROOT of that expanded matrix. The same Merkle machinery from lesson 8 verifies DA slices. DA nodes verify two independent things — slice-to-data-root via Merkle proofs, slice-to-erasure-commitment via KZG proofs. And the thing storage intuition gets wrong: DA guarantees availability for a sampling window, not permanent retrievability. EPOCH_WINDOW_SIZE is 300 epochs at roughly 8 hours each, about 3 months. If a human will read it in a year, that is Storage. If a verifier or a fraud-proof window needs to know it was published, that is DA.

### Practice
Write a TypeScript script that takes any file, zero-pads it to 32,505,852 bytes, appends the 4-byte length, lays out the 1024x1024 matrix of 31-byte elements padded to 32, and then computes the storage submission root of the 1024x3072 32-byte elements using the storage SDK's own MerkleTree and AbstractFile machinery — producing a DA data root entirely offline, with no DA node running. Do it for a 1KB file and a 1MB file.

### Quiz
Your 1KB and 1MB blobs produced different data roots but identical blob byte counts and identical computation time. Explain both facts. Then: your agent's memory graph must be readable in eighteen months. Which layer holds it, and which constant in the DA design decides?

### Proof required
The computed data root for a named blob, the script committed to the repo, and a written comparison of the two files' padding overhead.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/da-deep-dive.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/da.md`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/file/AbstractFile.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/file/MerkleTree.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/transfer/utils.ts`


---

## 22. Run the DA stack and disperse a real blob

### Teaching
0G DA is not a library you npm install — it is three services you operate, and any lesson designed around an SDK import is wrong. The DA Client (combined disperser and batcher, gRPC :51001) holds a funded key and talks to ENTRANCE_CONTRACT_ADDR and BATCHER_DASIGNERS_CONTRACT_ADDRESS, which is the precompile at 0x0000000000000000000000000000000000001000. The DA Encoder (Rust, gRPC :34000) does the polynomial extension and KZG commitments, needs AMT parameters built from the perpetual-powers-of-tau challenge_0084, and wants an NVIDIA GPU — the docs specify driver 12.04 on an RTX 4090 class card. The DA Retriever (:34005) is the read path for verifiers and derivation pipelines. Client and Retriever are cheap (8GB, 2 cores, 100MBps); the Encoder is not. BE HONEST ABOUT THE LAGOS HARDWARE CONSTRAINT in the public lesson: split the three services explicitly and give an hourly-GPU-rental path, or learners will hit a wall on step one and abandon the track. Key config: BATCHER_BATCH_SIZE_LIMIT (MiB), BATCHER_CONFIRMER_NUM, BATCHER_FINALIZED_BLOCK_COUNT.

### Practice
Run the DA Client and Retriever locally from docker. Rent an hourly GPU box for the Encoder, download challenge_0084, run dev-support/download_params.sh, and build with cargo --features grpc/parallel,grpc/cuda. Disperse the blob whose data root you computed offline in lesson 21 and confirm the dispersed root MATCHES your offline computation — that match is the whole point of doing lesson 21 first. Then retrieve the blob through :34005 and byte-compare. Finally, verify one slice yourself with zg_encoder::EncodedSlice::verify.

### Quiz
Which of the three services ran on your laptop and which did not, and what specifically failed without the GPU — name the operation, not just 'the encoder'. Then: your offline data root matched the dispersed one. What would a mismatch have told you about your matrix layout?

### Proof required
The disperse response containing data root, epoch and quorumId; the offline-computed root shown equal to it; a successful retrieve with a byte-identical diff; and one EncodedSlice::verify pass.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/da-integration.md`
- `/Users/cyber/0g-learn/0g-doc/docs/run-a-node/da-node.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/da-deep-dive.md`


---

## 23. Gate a contract on availability — DASigners, BLS quorums and PoDAS

### Teaching
Signing earns a DA node nothing. Rewards flow only through DA Sampling, and that design choice is what converts 'I attested this was available' into 'I actually still hold the bytes'. Every SAMPLE_PERIOD (30 blocks, about 90 seconds) the parent block hash becomes sampleSeed. Each DA row splits into 32 sub-lines; lineQuality = keccak256(sampleSeed, epoch, quorumId, dataRoot, lineIndex), dataQuality = keccak256(lineQuality, sublineIndex, data), podasQuality = lineQuality + dataQuality. A response is valid if podasQuality < podasTarget and the epoch falls inside [currentEpoch - 300, currentEpoch). Difficulty self-adjusts toward TARGET_SUBMITS = 20 per period. It is a lottery you can only enter if you still hold the data — and the 300-epoch window IS the practical retention horizon. On the chain side, getAggPkG1(epoch, quorumId, quorumBitmap) returns the aggregated G1 point for exactly the signers in the bitmap plus total and hit. That is your primitive: aggregate, check hit/total against your threshold, pair against the aggregate signature. Without the precompile you would maintain the signer set yourself and pay for aggregation in Solidity.

### Practice
Extend lesson 18's DAWatcher into a DAGated contract: requireQuorum(epoch, quorumId, bitmap) reverting unless hit * 3 >= total * 2, plus submitCheckpoint(bytes32 dataRoot, uint256 epoch, uint256 quorumId, bytes bitmap) that stores an agent-memory checkpoint ONLY when the quorum threshold is met. Feed it the real epoch, quorumId and bitmap from your lesson-22 dispersal. Then feed it a deliberately under-threshold bitmap and capture the revert.

### Quiz
Your blob was signed by a quorum three months ago and every signature is still valid on-chain. Is the data still retrievable? Name the exact constant that decides and explain the economic mechanism behind it. Then: why does your contract check hit/total rather than counting the bits set in the bitmap?

### Proof required
A verified DAGated address, one tx hash where a real dispersed blob's checkpoint was accepted, and one tx where an under-threshold bitmap reverted.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/precompiles/dasigners.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/da-deep-dive.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/da.md`


---

## 24. Alt-DA — put an OP Stack rollup on 0G DA

### Teaching
Rollups do not import a 0G SDK. The batch submitter sends its batch to a disperser instead of to Ethereum calldata, gets back a short blob commitment, and only that reference goes to the settlement chain; the derivation pipeline fetches from the Retriever and checks against the commitment. OP Stack integrates via a da-server sidecar: docker run 0g-da-op-plasma da-server --addr 0.0.0.0 --port 3100 --zg.server pointing at your DA client on :51001. Then op-node gets --altda.enabled=true --altda.da-server=http://host:3100; op-batcher gets the same PLUS --altda.da-service=true and --max-channel-duration; op-geth gets --rollup.disabletxpoolgossip=true. Contracts deploy from getting_started.json with useAltDA:true, daCommitmentType:'GenericCommitment', daChallengeWindow:160, daResolveWindow:160, daBondSize:1000000. --max-channel-duration is the single biggest cost lever and the docs' main gotcha: set it to 1 for testing and you write to L1 constantly and burn money; raise it in production. Version pins matter — Go 1.21.6, Node ^20, op-node v1.9.1, op-geth v1.101408.0 — and funding on Sepolia is specific: Admin 0.5 ETH, Proposer 0.2, Batcher 0.1.

### Practice
Bring up a Sepolia-settled OP Stack devnet posting batches to the DA client from lesson 22. Send a transaction on the L2. Trace it forward: L2 tx → batcher channel → da-server → 0G DA data root → the L1 batcher transaction carrying only the commitment. Retrieve the blob from :34005 and confirm your L2 transaction bytes are inside it. Then run once with --max-channel-duration=1 and once at a production value and record the Sepolia ETH burn difference.

### Quiz
What is --max-channel-duration actually controlling, and state the production trade-off in one sentence with the failure mode on each side. Then: your L1 batcher transaction is tiny regardless of L2 throughput. What exactly is in it, and what is NOT?

### Proof required
An L2 transaction hash, the corresponding L1 batcher tx on Sepolia, the DA data root that carries it, and a retrieved blob containing the L2 transaction bytes — plus the two-configuration cost comparison.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/da-integration.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/rollup-as-a-service/caldera-on-0g-da.md`


---

## 25. Arbitrum Nitro on 0G DA — and the doc gap you close

### Teaching
Nitro does not use the OP Stack's alt-DA sidecar. It implements the DataAvailabilityProvider interface, with the 0G implementation in das/zerogravity.go. The integration is explicitly beta and the doc page is thin — it names the interface and the file and then punts everything else to the 0gfoundation/nitro README. Do not build a lesson from the doc page alone; it will be wrong. That thinness IS the opportunity, and it is a repeatable version of a move Afeez has already made: he found, filed and got merged a real null-deref in the storage SDK. Same move, higher stakes, and this time on the layer 0G monetises to rollups. The same page family covers Caldera as RaaS and EigenLayer/Babylon AVS on 0G DA — worth reading all four so the PR frames Nitro correctly relative to them.

### Practice
Get a Nitro devnet writing batches to your 0G DA client. Keep a strict log of every step that is required but not documented — build flags, config keys, contract addresses, ordering constraints, version pins. Send an L2 transaction and locate its blob through the retriever. Then write the missing documentation and open a PR against 0gfoundation/0g-doc, modelled on the structure of the OP Stack page which is complete.

### Quiz
Name three steps your Nitro devnet required that the current arbitrum-nitro-on-0g-da.md page does not mention, and for each say what the failure looks like when you skip it.

### Proof required
A working Nitro L2 transaction hash with its 0G DA data root, and a PR URL against 0gfoundation/0g-doc — open or merged.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/rollups-and-appchains/arbitrum-nitro-on-0g-da.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/avs/eigenlayer-avs-on-0g-da.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/avs/babylon-avs-on-0g-da.md`
- `/Users/cyber/0g-ts-sdk/ISSUE.md`


---

## 26. ERC-7857 transfer — the half you never shipped

### Teaching
First, a warning that saves a day: the official erc7857.md doc page does NOT match the reference implementation, and the implementation is what is deployed. The page shows transfer(from,to,tokenId,bytes sealedKey,bytes proof). The real contract implements iTransferFrom(from,to,tokenId,TransferValidityProof[]). Build against /Users/cyber/0g-learn/0g-agent-nft/contracts/ and treat the doc page as narrative. Token data is IntelligentData[]{string dataDescription; bytes32 dataHash} — an ARRAY, one entry per encrypted blob, hashes only on-chain. Each TransferValidityProof is a PAIR: an AccessProof signed by the receiver or their delegated access assistant proving they can receive at targetPubkey, and an OwnershipProof signed by the TEE oracle carrying the new dataHash, the sealedKey encrypted to the receiver, and an OracleType. Two independent parties must sign; neither alone suffices. _proofCheck requires one proof per data entry, requires each proof's dataHash to equal the token's current hash, requires the access signer to be the receiver or their REGISTERED assistant, and enforces the public/private branch: empty wantedKey means seal to the receiver's own Ethereum key (checked by deriving the address from targetPubkey), non-empty means the two pubkeys must match byte-for-byte. THE SIGNATURE FORMAT IS HAND-ROLLED, not standard EIP-191 over 32 bytes: it prefixes '\x19Ethereum Signed Message:\n66' over the HEX STRING of the inner keccak (66 chars = '0x' plus 64). Off-chain you must signMessage(hexString) — passing raw bytes produces a \n32 digest and recovers the wrong address. Nonces are namespaced by msg.sender inside Verifier.hashNonce, and msg.sender there is the NFT CONTRACT, not the EOA. maxProofAge governs only cleanExpiredProofs — nothing rejects a proof for being old, so your issuer must enforce its own expiry. The ZKP branch returns false; TEE is the only live path.

### Practice
Redeploy AgentNFT on Galileo from the 0g-agent-nft hardhat-deploy graph (tee-verifier → verifier → agentNFT → agentMarket, with getOrNull idempotence). Write the off-chain signer that produces a valid AccessProof and OwnershipProof for a two-entry IntelligentData array. Execute a real iTransferFrom between two wallets you control and decode the PublishedSealedKey event. Then iCloneFrom. Then exercise delegateAccess so a third-party assistant signs the AccessProof — the zero-crypto-UX hook Huru's HD-wallet model needs. Finally, batchAuthorizeUsage three addresses, transfer, and confirm the set was wiped.

### Quiz
Your first transfer reverted ERC7857ProofCountMismatch even though you sent exactly one proof for a one-entry token. Given _intelligentDatasOf's default return in ERC7857Upgradeable, what is the most likely cause and which extension did you forget to inherit? Then: your access proof recovered a valid-looking but wrong address. Which byte-level detail of the message format did you get wrong?

### Proof required
An iTransferFrom tx hash on Galileo with its PublishedSealedKey event decoded, an iCloneFrom tx producing a new tokenId, a transfer signed by a delegated assistant rather than the receiver, and the committed signer script.

### Refs
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/ERC7857Upgradeable.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/verifiers/Verifier.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/verifiers/base`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/interfaces/IERC7857DataVerifier.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/extensions/ERC7857CloneableUpgradeable.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/extensions/ERC7857AuthorizeUpgradeable.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/Utils.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/scripts/deploy/deploy_agent_nft.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/erc7857.md`


---

## 27. Replace the mock verifier with a real TEE oracle

### Teaching
Chum's live mainnet iNFT uses the reference verifier, which accepts any 32-byte data-hash proof as valid — his own deploy script says so, and docs/0G_INFT.md:286 already concedes 'Use MockOracle and say so'. The token is real; the security property is not enforced. The oracle abstraction is the whole design: ERC-7857 treats re-encryption as a query to an ideal oracle returning (oldDataHash, newDataHash, receiver-can-access, sealedKey). A TEE decrypts inside the enclave, generates a FRESH key the sender never sees, re-encrypts, and seals to the receiver. A ZKP proves correct re-encryption without revealing keys — but cannot generate a key secret from the sender, so under ZKP the receiver must rotate on their next update or the previous owner retains read access. That asymmetry is the entire security argument and it is a perfect ClickReveal. Two live footguns in the reference deploy scripts: deploy_tee.ts falls back to a HARDCODED default oracle address (0x04581d192d22510ced643eaced12ef169644811a) when ORACLE_ADDRESS is unset — deploy without setting it and your verifier trusts someone else's key. And AgentNFT's storageInfo is a JSON string of {chainURL, indexerURL} baked in at initialize() time, defaulting to TESTNET endpoints — deploy to mainnet without ZG_RPC_URL/ZG_INDEXER_URL and your contract permanently advertises testnet.

### Practice
Stand up a real oracle: either a dstack/TDX enclave you control, or a 0G TeeML provider acting as the signing oracle. It must decrypt the payload inside the enclave, mint a new symmetric key, re-encrypt, seal the key to the receiver's targetPubkey, and sign the OwnershipProof in the exact \n66 format. Deploy TeeVerifier with YOUR teeOracleAddress explicitly set, behind UpgradeableBeacon + BeaconProxy with ERC-7201 namespaced storage. Execute a transfer where the receiver decrypts the payload with a key the sender never held — and prove the sender cannot. Then compute one ERC-7201 slot by hand in Node and show it equals the constant in the contract.

### Quiz
Under the ZKP branch the receiver must rotate keys on their next data update or the previous owner keeps read access. Why does the TEE branch not require that? Then: you deployed without setting ORACLE_ADDRESS and everything appeared to work in tests. What did you actually deploy, and what is the attack?

### Proof required
A TeeVerifier address whose teeOracleAddress read returns YOUR key, a transfer tx where the receiver decrypted with a sender-unknown key, a demonstration that the sender's old key fails on the new ciphertext, and a hand-computed ERC-7201 slot matching the contract constant.

### Refs
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/TeeVerifier.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/verifiers/base`
- `/Users/cyber/0g-learn/0g-agent-nft/scripts/deploy/deploy_tee.ts`
- `/Users/cyber/0g-learn/0g-agent-nft/scripts/deploy/deploy_verifier.ts`
- `/Users/cyber/0g-learn/0g-agent-nft/scripts/utils/utils.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/erc7857.md`
- `/Users/cyber/chum/inft/scripts/deploy.ts`


---

## 28. 0gmem on 0G Storage — close the gap in 0G's own repo

### Teaching
State this bluntly so nobody over-credits reading it: 0gmem carries a 0G Labs copyright and contains ZERO 0G integration. pyproject.toml pulls numpy, networkx, faiss-cpu, sentence-transformers, openai, spacy, rank-bm25, mcp. There is no ethers, no web3, no @0glabs package, and persistence.py writes local JSON and NPZ to disk. It teaches memory design — a unified temporal/semantic/causal/entity graph with first-class negation, Allen's interval algebra, 8-strategy RRF retrieval, an LLM plan-execute-evaluate-replan query planner, attention-filter forgetting — and it teaches nothing about 0G. It is also the sharpest product opportunity in the entire survey, because Afeez has already built the missing half in Huru: encrypted memory on 0G Storage with a KV pointer, envelope encryption, and per-consumer HD wallets. The KV constraints shape the design: KV is not a database, it is a deterministic replay of the append-only log — a StreamDataBuilder serialises writes into one blob, uploads it as an ordinary file tagged with sha256('STREAM') || streamIds, and KV nodes materialise versioned state from those tagged entries. There is NO delete and no in-place mutation; every write costs gas plus a storage fee; reads go to a KV NODE url, not the indexer; values over 256KB need KvClient's reassembly loop, and a version change mid-read resets the buffer.

### Practice
Implement a ZeroGStore backend for 0gmem's persistence layer: graph snapshots as encrypted 0G Storage uploads, the current-snapshot pointer in 0G KV, embedding matrices chunked below MAX_QUERY_SIZE, and a compaction policy since KV cannot delete. Reuse Huru's envelope encryption (AES-256-GCM DEK under an HKDF-derived per-consumer KEK) and per-consumer HD wallets so each user's memory is sealed to them. Verify every read with lesson 13's recompute-and-compare. Then destroy the container entirely and restore a full working 0gmem instance from nothing but a root hash and a KV pointer. Upstream it as a PR.

### Quiz
KV has no delete and every write costs gas plus a storage fee. Describe your compaction strategy and what 'version' means on a KV read. Then: your restore returned a graph one write behind. Which specific KvClient behaviour explains that, and how do you detect it rather than silently serving stale memory?

### Proof required
A 0gmem instance restored to full working state after a container wipe, from a root hash plus a KV pointer alone, with a recorded LoCoMo score matching the pre-wipe run — plus the PR URL.

### Refs
- `/Users/cyber/0g-learn/0gmem`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/kv/batcher.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/kv/builder.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/kv/client.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/kv/iterator.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/storage/sdk.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/storage/storage-cli.md`
- `/Users/cyber/chum/relay/src/lib/huru/encryption.ts`
- `/Users/cyber/chum/relay/src/lib/huru/kv-mirror.ts`
- `/Users/cyber/chum/relay/src/lib/huru/wallet-manager.ts`


---

## 29. Become a provider — the other side of the marketplace

### Teaching
Afeez has only ever consumed the compute marketplace. Standing up even a toy provider is disproportionately convincing, because it is what makes every odd shape on the consumer side stop being arbitrary: acknowledgeProviderSigner exists because a provider registers a TEE signer on-chain; ZG-Res-Key exists because the provider mints a chatID; the verifiability string exists because the provider declares it; /v1/proxy/signature/{chatID} exists because the provider serves it; and processResponse returns null precisely when a provider's service record declares no verifiable service. Provider addresses are also NOT stable — the current inference doc has stopped publishing a catalog entirely ('The provider and model catalog changes frequently... This page does not reproduce the list'), which is why any lesson hardcoding an address rots and why listService() and GET /v1/models are the only correct discovery paths. Rate limits differ by path and are easy to conflate: Direct is per-provider at roughly 30 req/min sustained with burst 5 and 5 concurrent; the Router is per-account with deliberately undocumented, evolving thresholds surfaced through X-RateLimit-* headers.

### Practice
Register a small inference service on Galileo serving a compact model. Declare verifiability HONESTLY — if you are not running TeeML, do not claim it. Implement the service record fields, mint chatIDs, return them in the ZG-Res-Key header, and serve GET /v1/proxy/signature/{chatID}?model={model} returning {text, signature} signed as EIP-191 personal_sign by your registered TEE signer address. Then consume your own provider from Huru through the Direct path, and confirm your own processResponse returns true. Finally set verifiability to none and confirm consumers now get null, not false.

### Quiz
Your own provider's processResponse returns null for every consumer. Which field on your on-chain service record causes that, and why is null the correct answer rather than false? Then: a consumer pins your provider address with X-0G-Provider-Address and your node goes down. What do they see, and what header would have saved them?

### Proof required
Your provider address appearing in a listService() output run by someone else, a Huru request served by your own provider with a settled fee, one processResponse returning true against your signature endpoint, and one returning null after you flipped verifiability.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference-provider.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/fine-tuning-provider.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/compute/provider-discovery/SKILL.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/rate-limits.md`
