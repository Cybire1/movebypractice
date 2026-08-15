# 0G — Beginner

**Goal.** A stranger with a browser wallet and nothing else reaches a verified inference response, a storage root hash they can independently recompute, and a verified contract on 0G — in one sitting per lesson. For Afeez personally: lessons 3-6 are net-new territory (the Router), 9 repairs something he shipped wrong, and 7/8/10 are ground he has mastered — those he authors rather than takes.


---

## 1. Two networks, one wallet, first transaction

### Teaching
0G is not one product. It is four independently usable services — Chain, Compute, Storage, DA — sitting on DePIN supply (io.net, Aethir GPUs; independent storage/DA/validator operators). That is why every layer has the same three-step shape: discover a provider, pay it, verify it. Architecturally 0G splits an optimised CometBFT consensus layer from a standard EVM execution layer, which is why your Solidity is portable but your throughput is not Ethereum's. Exact endpoints: Galileo testnet chainId 16602, RPC https://evmrpc-testnet.0g.ai, explorer https://chainscan-galileo.0g.ai, faucet https://faucet.0g.ai. Mainnet chainId 16661, RPC https://evmrpc.0g.ai, explorer https://chainscan.0g.ai. Note 16601 is the legacy testnet id and still appears in stale links — it is wrong.

### Practice
Add both networks to MetaMask by hand (do not use a chainlist import — typing the chainId is the point). Claim testnet 0G from faucet.0g.ai. Send 0.001 0G from your address to your own address. Then curl the RPC directly: curl -s https://evmrpc-testnet.0g.ai -X POST -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'

### Quiz
Paste the hex value eth_chainId returned and convert it. Then explain why a tutorial telling you to use chainId 16601 will appear to work in MetaMask but fail when you verify a contract.

### Proof required
The self-transfer transaction hash, opened on chainscan-galileo.0g.ai, plus the raw eth_chainId JSON response.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/testnet/testnet-overview.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/mainnet/mainnet-overview.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/chain.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/depin.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/getting-started.md`


---

## 2. Deploy and verify a contract — the cancun trap

### Teaching
0G Chain is EVM-identical with exactly one compiler-level difference: pin evmVersion to "cancun". 0G supports Cancun-Deneb and Pectra; newer experimental opcodes throw `invalid opcode` at RUNTIME, not at compile time, which is how people lose an afternoon. Second trap: the verification API path is /open/api, not /api — chain/deploy-contract/SKILL.md says /api and is wrong; the official docs say /open/api and are right. Third trap: 0G's own integration guide is written in ethers v5 (contract.deployed(), contract.address, ethers.utils.keccak256) while the official chain skills mandate v6 (waitForDeployment(), getAddress(), native BigInt). Copy-pasting the doc's deploy.js throws at runtime.

### Practice
Scaffold a Hardhat project following skills/chain/scaffold-project/SKILL.md. Write a 20-line contract that stores a bytes32 and emits an event on set. Configure hardhat.config.ts with evmVersion 'cancun', both networks (16602/16661), and customChains pointing apiURL at https://chainscan-galileo.0g.ai/open/api with a PLACEHOLDER apiKey. Deploy to Galileo. Run npx hardhat verify. Then deliberately break it: remove evmVersion, add a function using transient storage (TSTORE), redeploy, and call it.

### Quiz
Your second deploy succeeded but the call reverted with a message that names no revert reason. What produced it, and what are the two documented fixes (one compiler setting, one version downgrade)?

### Proof required
A contract address on chainscan-galileo.0g.ai showing verified green source, plus the failing tx hash from the broken build.

### Refs
- `/Users/cyber/0g-learn/0g-agent-skills/skills/chain/scaffold-project/SKILL.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/chain/deploy-contract/SKILL.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/chain/interact-contract/SKILL.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts.md`


---

## 3. First inference through the Router — zero crypto required

### Teaching
There are two financially separate ways to reach 0G Compute, and confusing them is the #1 documented support question. The Router (https://router-api.0g.ai/v1) is an official OpenAI-compatible gateway with ONE unified balance held in the shared 0G Payment Layer contract (mainnet 0xA3b15Bd2aD18BFB6b5f92D8AA9F444Dd59d1cE32, testnet 0x0AD9690e0b34aB2d493DE02cDF149ee34f6C9939), an sk- API key, and automatic failover. The Direct SDK path (lesson 7) uses a wallet, a main ledger account and per-provider sub-accounts in different contracts entirely. A Router deposit does not fund sub-accounts and sub-account balances do not back Router calls. Every 0G response also carries a non-OpenAI field, x_0g_trace: request_id, the serving provider's on-chain address, and billing.{input_cost, output_cost, total_cost} in neuron (1e18 neuron = 1 0G). NOTE FOR AFEEZ: this is net-new. You built a gateway without ever using theirs.

### Practice
Get an sk- key at pc.0g.ai. Call GET https://router-api.0g.ai/v1/models with no auth and read pricing and provider_count. Then run a chat completion with the stock OpenAI SDK pointed at baseURL https://router-api.0g.ai/v1 against zai-org/GLM-5-FP8, and print the full response including x_0g_trace. Then repeat with chat_template_kwargs {"enable_thinking": false} and compare token counts — GLM-5 has thinking on by default and emits reasoning_content.

### Quiz
From your own x_0g_trace: which provider address served you, what was total_cost in neuron, and what is that in 0G? Then: your colleague deposited on compute-marketplace.0g.ai and pc.0g.ai shows a zero balance. What actually happened, and what is the fix (it is a toggle, not a support ticket)?

### Proof required
A saved JSON response containing request_id, provider address and the billing block, plus the token-count delta from disabling thinking.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/quickstart.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/models.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/features/chat-completions.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/comparison.md`


---

## 4. Routing headers and price ceilings — the ordering that matters

### Teaching
Default behaviour is round-robin across healthy providers with automatic retry on the next one; 503 only when all fail. Overrides are HTTP headers, canonical across JSON, multipart and async endpoints (the legacy JSON body provider:{} object is deprecated and JSON-only; when both are set the header wins). X-0G-Provider-Sort accepts exactly latency or price. X-0G-Provider-Address pins a provider and IMPLICITLY disables failover — you must add X-0G-Provider-Allow-Fallbacks: true to get retry back. The three USD ceilings (Max-Price-Usd-Prompt, -Completion, -Image) are a hard filter applied BEFORE sort and failover, not a preference: 'a fallback during an outage can never silently route you to a provider you've priced out.' They are service-type aware, so an Image ceiling on a chat call is silently inert and a cross-endpoint SDK can send all three safely. Speech-to-text enforces no ceiling at all, because STT bills per second of audio and reusing the Prompt header would mean '$1 per 1M tokens' on chat and '$1 per second' on audio. Validation is strict: Sort must be exactly latency|price, Allow-Fallbacks exactly true|false — 1/0/yes give 400 invalid_provider_header — but a blank or whitespace header is treated as unset and is never an error.

### Practice
Send the same prompt four times: (a) with X-0G-Provider-Sort: price, (b) with Sort: latency, (c) pinned with X-0G-Provider-Address to the provider from (a) and no fallbacks flag, (d) with X-0G-Provider-Max-Price-Usd-Prompt: 0.000001. Record the provider address and total_cost from each x_0g_trace. Then send Sort: cheapest and record the error.

### Quiz
Call (d) failed. Give its exact HTTP status and error code, and explain why treating it as a transient failure and retrying will spin forever. Then: why is that a different code from what you get when you pin a provider whose price exceeds your ceiling?

### Proof required
Four request_ids with their provider addresses and costs, plus the two verbatim error bodies (invalid_provider_header and no_provider_within_max_price).

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/routing.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/errors.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/rate-limits.md`


---

## 5. Trust modes — what the word 'TEE' actually promises

### Teaching
X-0G-Provider-Trust-Mode takes standard | verified | private and behaves as a FLOOR, not an exact match: asking for verified is also satisfied by the stronger private. The tiers are the verification modes wearing product names. TeeML means the model itself runs inside the enclave (Intel TDX CPU plus TEE-enabled H100/H200), the enclave holds the signing key, and prompts never leave it. TeeTLS means the 0G broker runs inside a TEE and relays to a centralised LLM over attested TLS, bundling cert fingerprint plus request/response hashes into a TEE-signed routing proof — the docs call it 'conceptually similar to zkTLS but with stronger privacy properties'. The consequence people miss: under TeeTLS the upstream provider DOES process your plaintext under its own data policy. Only TeeML gives sealed inference. And when a model has both TeeML and TeeTLS providers the Router load-balances between them unless you set a tier — so 'my model is TEE' does not mean 'my prompt stayed in an enclave'. If nothing matches you get a hard 503 no_provider_for_trust_mode; it never silently downgrades. Zero data retention has fine print too: prompts and completions are memory-only, but uploaded multipart files persist up to 60 minutes and image-generation inputs/outputs up to 30.

### Practice
Run curl -s https://router-api.0g.ai/v1/models | jq '.data[] | select(.verifiability == "TeeML") | .name' to get the sealed-inference set. Send one request with X-0G-Provider-Trust-Mode: private against a model in that set, and one against a model NOT in it to trigger the 503. Then create an sk- key with trust_mode pinned to 'private' via POST /v1/api-keys (needs an mk- management key) and confirm the calling code cannot override it.

### Quiz
Under TeeTLS, name every party that sees your plaintext prompt, and name the single field on GET /v1/models that tells you which mode a provider runs BEFORE you send anything.

### Proof required
The TeeML model list from your own jq run, one private-tier response with its provider address, and the verbatim 503 no_provider_for_trust_mode body.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/privacy.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/authentication.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/compute.md`


---

## 6. verify_tee and the trust boundary a gateway cannot close

### Teaching
This is the sharpest teaching moment in the whole doc set, because it is a gateway documenting its own limits. Setting verify_tee:true (JSON body, or ?verify_tee=true on multipart endpoints) makes the Router fetch the provider's signature, look up the signer on-chain, verify it, and report tee_verified in x_0g_trace. The docs are unusually candid: 'tee_verified: true in the response says the Router says it verified the signature. It does not carry the raw signature back to you — you still have to trust the Router to have done the check honestly.' The escape hatch is documented: take providerAddress from x_0g_trace.provider and chatID from the ZG-Res-Key response HEADER, then call broker.inference.processResponse(providerAddress, chatID) yourself with any throwaway wallet — it only reads the chain and hits the provider's public endpoint. Because chatID lives in a header, any client that hides raw responses (most OpenAI SDK convenience methods) makes verification impossible. Use fetch. NOTE FOR AFEEZ: this is the exact check Huru claims and does not perform, and 'my users can verify me without trusting me' is a feature you can ship in an afternoon.

### Practice
Using fetch (not the SDK), send a Router completion with verify_tee:true. Read tee_verified from x_0g_trace. Read ZG-Res-Key from the response headers, checking both casings. Then create a throwaway wallet with ethers.Wallet.createRandom(), build a broker with createZGComputeNetworkBroker, and call processResponse(providerAddress, chatID). Compare the two answers. Then repeat using the OpenAI SDK's convenience method and observe that you cannot get chatID at all.

### Quiz
Your independent processResponse returned null rather than true or false. There are exactly two documented causes. Name both, and say which one you can rule out from your own request.

### Proof required
One JSON artefact containing: the chatID, the provider address, the Router's tee_verified, and your independent boolean — obtained with a wallet that has never held funds.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/principles.md`


---

## 7. The Direct path: main account, sub-accounts, and the 24-hour lock

### Teaching
AFEEZ: YOU HAVE SHIPPED THIS — 0g-aura/src/compute.ts:150-210 is a correct ledger lifecycle. Your job here is to AUTHOR the lesson, not take it, and specifically to teach the three things the official material gets wrong. (1) depositFund/addLedger creates a main ledger account with a 3 0G contract minimum; transferFund(provider, 'inference'|'fine-tuning', weiAmount) carves a per-provider sub-account with 1 0G minimum locked. get-account renders this as Total / Locked / Available, and the Locked/Available split is what makes people think funds vanished. (2) acknowledgeProviderSigner has been quietly demoted — transferFund now auto-acknowledges, so the skills' ALWAYS/NEVER rules burn a transaction for nothing. (3) retrieveFund must be called TWICE with 24 hours between: the first call only registers the request and starts the lock. Calling it back-to-back does nothing and looks like a broken SDK. Also teach delayed batch settlement — providers settle on-chain in lumps, so a sub-account drops by one large amount rather than ten small ones, which is precisely why the Router's inline per-request billing block is a real feature and not sugar.

### Practice
Author and ship the lesson, and while doing it find two real bugs in the official starter kit: (a) src/startup.ts:17 hardcodes `const initialAmount = 0.01` and calls addFundsToLedger with it — below the 3 0G contract minimum the same repo's README documents, so the official starter kit fails its own first-run path on a fresh wallet; (b) demo-compute-flow.ts:220 passes the response CONTENT as processResponse's third argument, contradicting both the docs (2 args) and the skills (3 args, JSON.stringify(usage)). Turn both into CodeHighlight exercises. Then run the flow yourself on Galileo: create a ledger, transferFund to one provider, one chat completion via fetch + getRequestHeaders, then call retrieveFund once and read the countdown.

### Quiz
Paste your `Remaining Locked Time` from 0g-compute-cli get-sub-account. Then explain why your sub-account balance did not drop by the exact cost of your single request — and name the one operational situation in which initiating a refund will destroy work in progress.

### Proof required
The addLedger and transferFund tx hashes, a get-sub-account output showing Locked plus the live countdown, and two merged MoveByPractice CodeHighlight exercises built from the starter-kit bugs.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/account-management.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/compute/account-management/SKILL.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/compute/provider-discovery/SKILL.md`
- `/Users/cyber/0g-learn/0g-compute-ts-starter-kit/src/startup.ts`
- `/Users/cyber/0g-learn/0g-compute-ts-starter-kit/src/services/brokerService.ts`
- `/Users/cyber/0g-learn/0g-compute-ts-starter-kit/demo-compute-flow.ts`
- `/Users/cyber/chum/relay/src/lib/huru/runtime.ts`


---

## 8. First storage upload — the root hash is the only key

### Teaching
AFEEZ: YOU HAVE SHIPPED THIS. Author it. The content that makes it worth publishing is the structure nobody explains: the file root is NOT a flat Merkle tree. Bytes are padded and split into 256-byte chunks; chunks are grouped 1024-at-a-time into 256KB segments; each segment gets its own inner keccak256 tree (AbstractFile.segmentRoot); those segment roots become PRE-HASHED leaves of an outer tree (tree.addLeafByHash), whose root is the file root. That is why a segment carries an O(log numSegments) proof and can be uploaded independently. And 0G's MerkleTree.build() does NOT duplicate the last node on an odd level — it rotates the trailing node to the back of the queue, matching zerog-rust — so you cannot compute a 0G root with merkletreejs or OpenZeppelin. Upload is two-phase: an on-chain submit() to FixedPriceFlow carrying a power-of-2 decomposition (SubmissionNode[], priced at sum(2^height) x pricePerSector, so you pay for PADDED sectors), then an off-chain shard-aware parallel push of segments-with-proofs by txSeq. Turbo and Standard are two independent networks, not two speeds — a root uploaded to turbo is not retrievable from the standard indexer.

### Practice
Author the lesson using the runnable scripts. Upload a 300-byte file and a 512-byte file to testnet turbo via scripts/upload.ts, and record the fee for each. Upload the 300-byte file a second time and observe skipIfFinalized (default TRUE) returning txHash '' with a valid rootHash and no error — easy to misread as failure. Then upload a >4GB file, or force fragmentSize down, and observe the response becoming a union type {rootHashes[], txHashes[]} that breaks any code assuming tx.rootHash. Build a DragDrop exercise for chunk → segment → segment root → file root.

### Quiz
Your 300-byte and 512-byte files cost the same. Print the SubmissionNode heights for each and explain why, using computePaddedSize. Then: which single line of the SDK's build() makes an off-the-shelf Merkle library produce a different root?

### Proof required
Two root hashes, the submit() tx hashes on chainscan, the fee for each, and the empty-txHash dedup response.

### Refs
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/scripts/upload.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/src/storage.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/src/config.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/file/AbstractFile.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/file/MerkleTree.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/transfer/Uploader.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/storage/sdk.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/storage/upload-file/SKILL.md`


---

## 9. Download and actually verify — `proof: true` is a no-op in TypeScript

### Teaching
This is a real, demonstrable finding and it lands on code Afeez already ships. Indexer.download(root, path, true) threads the flag down to Downloader.downloadTask(info, segmentOffset, taskInd, numChunks, _proof) — where the parameter is renamed with a leading underscore, never read, and the function carries the comment `// TODO: add proof check` at Downloader.ts:458. Both the official skill file and the docs say 'always use verified downloads in production'. That advice is currently unenforced in TS; the Go client's --proof flag is the one that verifies. Two ways to get real integrity today: recompute merkleTree() on the downloaded bytes and compare root hashes, or pull segments with downloadSegmentWithProofByTxSeq and run Proof.validate() yourself. Proof.validate checks four things in order — format (path.length + 2 === lemma.length), CONTENT_MISMATCH, ROOT_MISMATCH, POSITION_MISMATCH via calculateProofPosition, then VALIDATION_FAILURE by folding the lemma. The position check is what stops a node serving segment 7's bytes as segment 3. Also teach the padding trim: storage always returns whole 256-byte chunks, so the final segment must have DEFAULT_CHUNK_SIZE - (fileSize % DEFAULT_CHUNK_SIZE) trailing bytes sliced off, or your recomputed root will never match.

### Practice
Download your lesson-8 file. Recompute the root with ZgFile.fromFilePath + merkleTree() and compare — remember try/finally with file.close(), the fd is not closed for you. Then truncate one byte and watch it fail. Then call node.downloadSegmentWithProofByTxSeq(txSeq, segIndex) and run Proof.validate(root, segmentBytes, segIndex, numSegments). Finally, deliberately pass the wrong segment index and observe which ProofError fires.

### Quiz
Which of the four ProofErrors fires when a node serves you segment 7's data as segment 3, and which of the four checks in validateHash catches it? Then: why does flipping Indexer.download's third argument to true not fix anything, and what is the one-line evidence in the SDK source?

### Proof required
A verify.ts run showing expectedRoot === recomputedRoot true, the same script failing on the truncated file, and one Proof.validate() success plus one deliberate POSITION_MISMATCH.

### Refs
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/transfer/Downloader.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/file/MerkleTree.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/scripts/download.ts`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/storage/merkle-verification/SKILL.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/storage/download-file/SKILL.md`
- `/Users/cyber/chum/relay/src/lib/huru/storage.ts`


---

## 10. The storage→chain seam: hash on-chain, bytes off-chain

### Teaching
AFEEZ: YOU HAVE SHIPPED THIS — Chum's iNFT metadata pointer is this seam. Author it, and teach the ordering rule that makes it safe. A contract stores the 32-byte root hash, never the data. You MUST upload to storage before registering the hash on-chain: register first and the contract points at data that does not exist, and nothing on-chain can ever detect it — there is no oracle, no callback, no failure mode the EVM can see. The read path inverts: read hash from chain, then verified-download from storage using lesson 9's technique. This one seam, restacked, is every higher-level 0G product: ERC-7857 iNFTs are storage+chain with an encrypted payload and a TEE re-encryption oracle; 0G DA is storage-shaped blob commitments consumed by a rollup's derivation pipeline instead of a user contract.

### Practice
Author the lesson. Deploy the StorageRegistry from skills/cross-layer/storage-plus-chain/SKILL.md (FileRecord{rootHash, uploader, timestamp, metadata}, registerFile, FileRegistered event), verify it, register your lesson-8 root hash, then write a reader that pulls the hash from chain and verify-downloads. Then deliberately register a root hash you never uploaded, and write the test that proves the contract cannot tell. Build a DragDrop exercise for the six-step ordering.

### Quiz
You registered before uploading and the upload later failed. Give the exact sequence of calls a reader makes and the exact point at which it discovers the problem — and explain why the contract could not have prevented it.

### Proof required
A verified StorageRegistry address, the registerFile tx hash, and reader output showing the recomputed root equals the on-chain hash — plus the dangling-pointer test that fails at the storage layer, not the chain layer.

### Refs
- `/Users/cyber/0g-learn/0g-agent-skills/skills/cross-layer/storage-plus-chain/SKILL.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/cross-layer/compute-plus-storage/SKILL.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/introduction.md`
- `/Users/cyber/chum/relay/src/lib/huru/agentic-id.ts`
