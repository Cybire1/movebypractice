# 0G — Intermediate

**Goal.** Close the gap between what Huru and Chum claim and what they enforce, then extend into the four adjacent layers he has never touched but can reach without special hardware: fine-tuning, ERC-8004, precompiles, and running a storage node. Every lesson here changes production code or puts a new address on-chain.


---

## 11. Make the TEE badge real — processResponse is a verification primitive now

### Teaching
The single most important correction in the compute layer, and it lands on Chum's headline feature. Every local SKILL.md states processResponse is MANDATORY, that skipping it 'causes fee settlement failure', and that the signature is (providerAddress, chatID, usageData). The current official inference doc says the opposite in a tip block: processResponse is OPTIONAL, the signature is (providerAddress, chatID), and its ONLY job is verifying the provider's TEE signature. Billing was decoupled and moved to provider-side delayed batch settlement. Under the hood it reads the provider's on-chain Service record, GETs {url}/v1/proxy/signature/{chatID}?model={model}, and verifies the signature as EIP-191 personal_sign against teeSignerAddress. It returns true (validated), false (signature present but failed — treat the response as UNTRUSTED), or null (chatID omitted, or the provider has no verifiable service). Chum's per-call call is still correct and still valuable; the JUSTIFICATION must change from 'required for payment' to 'this is the verification primitive'. Say the old one to DevRel and it reads as stale knowledge. Three mutually contradictory signatures exist in official 0G material simultaneously — docs (2 args), skills (3 args with JSON.stringify(usage)), demo-compute-flow.ts:220 (3rd arg is the response content). Teach all three and say which is current.

### Practice
In /Users/cyber/chum/relay/src/lib/huru/runtime.ts, capture processResponse's return value at line ~499 instead of discarding it. Rewrite buildVerification() at lines 177-191 so `verified` comes from that boolean rather than from provider.verifiability.toLowerCase().includes('tee'). Add an explicit verificationSource field with values 'provider-claim' | 'tee-signature' | 'unverifiable', and surface null distinctly from false in the API and in Chum's Proof Mode. Then confirm which signature your installed @0gfoundation/0g-compute-ts-sdk actually accepts, and pin it.

### Quiz
Which of the three published processResponse signatures does your installed SDK version accept? For each of true / false / null, state exactly what Proof Mode should render — and explain why 'false' must not render the same as 'null'.

### Proof required
A Huru request id whose GET /v1/requests/{id}/verification returns a verdict sourced from processResponse, with verificationSource: 'tee-signature'; plus the git diff; plus one request deliberately routed to a non-verifiable provider showing null, not false.

### Refs
- `/Users/cyber/chum/relay/src/lib/huru/runtime.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/compute/streaming-chat/SKILL.md`
- `/Users/cyber/0g-learn/0g-compute-ts-starter-kit/demo-compute-flow.ts`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution.md`


---

## 12. verifyService — and the honesty about what a green check proves

### Teaching
broker.inference.verifyService(providerAddress, './reports', onStep) returns { signerVerification: { allMatch }, composeVerification: { passed }, dockerImages, outputDirectory } and streams progress to the callback. It automates exactly TWO checks: the TEE signer address match between the on-chain contract and the attestation report, and the Docker Compose hash (calculated vs event log). The docs carry an explicit caution: 'Automated checks are not a full verification.' Image integrity via sigstore (search.sigstore.dev) and full quote verification via dstack-verifier (github.com/Dstack-TEE/dstack) remain MANUAL. Caching the attestation as Chum intends is the right architecture — attestation is per-provider and slow, inference is per-call. What the curriculum adds is scope honesty: a green check is two checks, not a proof. Teaching the two manual steps alongside it is the difference between a demo and an audit story. NOTE: verifyService currently appears in Chum's markdown only. Ship it.

### Practice
Call verifyService against the provider Huru routed the most traffic to last week, writing reports to ./reports, and log every onStep message. Wire the cached result into Chum's Proof Mode with a timestamp and an explicit 'checks performed: 2 of 4' label. Then perform ONE manual step by hand: take a digest from result.dockerImages and look it up on search.sigstore.dev, recording what you find or fail to find.

### Quiz
Name the two automated checks and the two manual ones. Then: a provider swaps the model binary inside the image but keeps the compose file byte-identical. Which of the four checks catches it, and would your current Proof Mode have shown green?

### Proof required
The ./reports directory committed to the repo, a Proof Mode screenshot showing the scoped label with a real attestation timestamp, and the sigstore lookup URL with its result.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/inference.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/compute.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/privacy.md`
- `/Users/cyber/chum/relay/src/lib/huru/runtime.ts`


---

## 13. Merkle-verify Huru's reads

### Teaching
storage.ts:233 calls indexer.download(rootHash, tempPath, false) — withProof=false, listed verbatim as a BAD anti-pattern in the storage-plus-chain skill. For a product whose entire pitch is verifiability, downloading unverified is the second-worst finding after the attestation one. The subtlety that makes this a good lesson rather than a one-character fix: flipping it to true changes nothing, because of the Downloader._proof no-op from lesson 9. So the correct fix is recompute-and-compare, or segment-level Proof.validate. Two further constraints in Huru's specific case: indexer.download() has NO decryption path at all, so encrypted payloads must go through downloadToBlob() which buffers the whole file in memory; and a wrong decryption key does NOT throw — downloadToBlob and tryDecrypt are best-effort and silently return raw ciphertext on mismatch, so peekHeader(rootHash) must be called first (null = plaintext, version 1 = aes256, version 2 = ecies).

### Practice
Replace the unverified read path in /Users/cyber/chum/relay/src/lib/huru/storage.ts with a verified one: download, recompute merkleTree(), compare to the expected root, and fail closed. Add a storage_verified boolean plus the recomputed root to the read result and surface both in Proof Mode. Add peekHeader() before every decrypt so a wrong-key read errors instead of silently returning ciphertext. Write a test that corrupts a byte in transit and proves the read now fails.

### Quiz
Why does setting the third argument of indexer.download to true not fix this? Cite the exact file and line. Then: your decrypt returned bytes that are not JSON and threw no error — what did you skip, and what would peekHeader have told you?

### Proof required
A Chum memory read whose response carries storage_verified: true with the recomputed root; the corrupted-byte test failing; and a wrong-key read that now errors explicitly instead of returning garbage.

### Refs
- `/Users/cyber/chum/relay/src/lib/huru/storage.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/transfer/Downloader.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/indexer/Indexer.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/scripts/encrypted-download.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-starter-kit/scripts/peek-header.ts`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/cross-layer/storage-plus-chain/SKILL.md`


---

## 14. Router vs Huru — write the memo you will be asked for

### Teaching
A funder will ask 'why not just use the Router?' You need an evidence-backed answer, not a vibe. What the Router ships that Huru does not: a scoped key system (sk- for inference and billed, mk- for admin and not billed, with an explicit allowlist from {account:read, keys:read, keys:create, keys:manage}, and mk- keys deliberately cannot mint other mk- keys); the full X-0G-Provider-* header suite; an x_0g_trace block with exact per-request cost in neuron; opt-in verify_tee; async submit-and-poll image jobs; documented zero-data-retention with 60min/30min file TTLs; and per-trust-tier usage breakdown you can use as a compliance artefact. There is also a BREAKING CHANGE flagged at the top of the auth page: sk- keys no longer reach /v1/account/*, which now needs mk- with account:read — any dashboard using an sk- key gets 403 insufficient_scope. What Huru has that the Router does not and shows no roadmap for: a fiat on-ramp (Naira/USD via Paystack from ~100 naira), per-consumer HD wallets giving each end user their own custody boundary, and any per-key spending budget (Router RPM/TPM controls are explicitly 'coming soon'; today the only multi-tenant surface is an api_key_id filter on usage history). Strategic read: the Router commoditises the gateway layer Huru occupies. Huru's defensible ground is fiat rails plus per-user custody plus Africa distribution, NOT OpenAI compatibility. The move is to build on top — route TEE traffic through the Router and keep the wallet/fiat layer — which is exactly the composition story DevRel would fund.

### Practice
Adopt the Router's vocabulary in Huru rather than inventing a dialect: accept X-0G-Provider-Sort / -Address / -Allow-Fallbacks / -Max-Price-Usd-* on inbound requests with the same strict validation and the same filter-before-sort ordering, and emit a spec-shaped x_0g_trace on every response (request_id, provider, billing in neuron). Implement the sk-/mk- scope split with the create/manage separation. Add a Router-backed transport option alongside the Direct transport, selected per request. Then write COMPARISON.md in the Huru repo with the three-column table: Router only / both / Huru only.

### Quiz
Why does the Router split keys:create from keys:manage, and what specific integration does that split enable that a single keys:write scope would not? Then: name the one Router guardrail that prevents a compromised management key from escalating, and say whether Huru's design has an equivalent.

### Proof required
A Huru response body carrying a spec-shaped x_0g_trace; a Huru request that honoured X-0G-Provider-Max-Price-Usd-Prompt and returned the Router's own 400 code shape; a public COMPARISON.md in the Huru repo.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/comparison.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/authentication.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/routing.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/rate-limits.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/faq.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/router/account/deposits.md`
- `/Users/cyber/chum/relay/src/lib/huru/runtime.ts`
- `/Users/cyber/chum/relay/src/lib/huru/paystack.ts`


---

## 15. Fine-tuning end to end — the one thing the Router cannot do

### Teaching
Fine-tuning is Direct-only and CLI-only, which is the strongest argument for teaching the SDK path at all. It produces a LoRA ADAPTER, not a full model — you supply the base and load with peft.PeftModel. The footguns are unusually expensive. transfer-fund MUST carry --service fine-tuning; omit it and money silently lands in the inference sub-account, with the symptom surfacing much later as MinimumDepositRequired at create-task. The config file is a FIXED 5-key template (neftune_noise_alpha, num_train_epochs, per_device_train_batch_size, learning_rate, max_steps) — adding "fp16": true, removing a key, or writing 2e-4 instead of 0.0002 breaks the task. --model takes the bare name Qwen2.5-0.5B-Instruct, never Qwen/Qwen2.5-0.5B-Instruct. Fee = (tokenSize/1e6 x pricePerMillionTokens x epochs) + a fixed storage reserve (0.01 0G for Qwen2.5-0.5B, 0.09 0G for Qwen3-32B). Lifecycle: Init → SettingUp → SetUp → Training → Trained → Delivering → Delivered → UserAcknowledged → Finished. THE 48-HOUR FUSE: from the moment status hits Delivered you have 48 hours to acknowledge-model. Miss it and the provider force-settles, you permanently lose the model AND forfeit 30% of the fee. A second, smaller trap: after acknowledge-model the provider needs about a minute to settle and upload the decryption key — decrypting while status is still UserAcknowledged fails with the unhelpful 'second arg must be public key'. And acknowledge-model's --data-path must be a FILE, not a directory.

### Practice
Build a 200-line JSONL dataset from real Huru traffic — Nigerian-English and pidgin customer-support turns, in the instruction/input/output shape. Deposit, transfer-fund WITH --service fine-tuning, list-models, create-task against Qwen2.5-0.5B-Instruct with --dataset-path (it auto-uploads to 0G Storage). Poll get-task and get-log through every lifecycle state, recording timestamps. Acknowledge inside the window, wait for Finished, decrypt, unzip, and load the adapter with peft. Generate the same 10 prompts before and after.

### Quiz
Compute the total fee yourself from your token count, epochs and the per-million price, add the storage reserve, and compare to what the broker actually charged — explain any delta. Then: at which status did your first decrypt-model attempt fail, what was the exact error string, and how long did you have to wait?

### Proof required
The task ID, the create-task transaction, adapter_config.json + adapter_model.safetensors, a lifecycle timestamp log, and a side-by-side before/after generation sample on pidgin input.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/fine-tuning.md`
- `/Users/cyber/0g-learn/0g-agent-skills/skills/compute/fine-tuning/SKILL.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/compute-network/account-management.md`


---

## 16. ERC-8004 — make Chum discoverable instead of merely owned

### Teaching
ERC-7857 and ERC-8004 solve non-overlapping problems and are composable, not alternatives. 7857 is encrypted ownership: the asset IS the agent and the metadata is secret and must survive a change of owner. 8004 is discovery and trust: strangers need to find the agent and evaluate it. Chum holds a live 7857 iNFT that no other agent ecosystem can see. The Identity Registry is an ERC-721 where tokenId is called agentId and tokenURI is called agentURI — which means every existing NFT wallet, indexer and marketplace can already browse and transfer agent identities with zero new tooling. 0G addresses: mainnet Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432, Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63; Galileo Identity 0x8004A818BFB912233c491871b3d84c89A494BD9e, Reputation 0x8004B663056A597Dffe9eCcC1965A193B7388713. CRITICAL TRAP: these are CREATE2 vanity addresses IDENTICAL across roughly 40 chains — 0G mainnet's Identity Registry is byte-for-byte the same address as Ethereum mainnet's, Base's and Arbitrum's. Point your RPC at the wrong chain and your calls silently succeed against a different chain's agent set. Always carry the full triple eip155:{chainId}:{registry}. agentId is a global counter per registry DEPLOYMENT, not per app and not per chain-family. agentWallet is a reserved metadata key that cannot be set via setMetadata or register, requires an EIP-712 signature through setAgentWallet, and is CLEARED automatically when the agent NFT transfers.

### Practice
Publish a registration file at https://chum.app/agent.json with type, name, description, image, a services[] array (web, A2A agent card, MCP), x402Support, active, registrations[], and supportedTrust: ["reputation", "tee-attestation"] — the claim a 0G-Compute-backed agent should be making. Serve the same registrations array at /.well-known/agent-registration.json for domain proof. Register on Galileo first, confirm, then register on mainnet 16661. Cross-link the iNFT with setMetadata(agentId, "erc7857", abi.encode(uint256(16661), 0xa3916cB180013170254C40a65A1fFA761667afE6, uint256(0))). Then post one giveFeedback and read it back with getSummary.

### Quiz
Your Galileo agentId and your mainnet agentId are different numbers for the same agent. Explain why, and give the exact string that uniquely identifies each. Then: getSummary reverted or returned nothing until you passed a client list. Why is unfiltered aggregation deliberately unavailable?

### Proof required
The mainnet register tx hash, the resulting agentId, the live 8004scan.io listing URL, the setMetadata tx cross-linking the 7857 token, and a getSummary read returning your own feedback.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/erc8004.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/overview.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/integration.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/agentic-id.md`
- `/Users/cyber/chum/relay/src/lib/huru/agentic-id.ts`


---

## 17. ERC-8004 Validation Registry — turn per-call TEE checks into portable reputation

### Teaching
This is where lesson 11's fix stops being an internal detail and becomes an ecosystem contribution. The Validation Registry is where TEE attestation, zkML and stake-secured re-execution plug into the standard: validationRequest(validatorAddress, agentId, requestURI, requestHash) is called by the agent's owner or operator, and validationResponse(requestHash, uint8 response 0-100, responseURI, responseHash, tag) can only be called by the named validator. Multiple responses per requestHash are allowed, which gives you progressive states — tag "soft" then tag "hard". A 0G TEE oracle is a natural validator contract: it converts per-call attestation from a UI panel into a durable, queryable, on-chain track record that another contract can gate on. Nothing in the standard prevents you validating your own agent, which is exactly why the reads are filtered by validator address — trust is delegated by the reader, not asserted by the writer. Nobody has done this on 0G yet.

### Practice
Stand up a validator address that Huru's post-inference path calls. After each processResponse verdict, accumulate pass/fail per provider. Once daily, submit a validationRequest for Chum's agentId and a matching validationResponse carrying the pass rate scaled to 0-100 with tag 'tee-daily'. Deploy a tiny consumer contract that reads getSummary(agentId, [yourValidator], 'tee-daily') and refuses to route work below 95.

### Quiz
What stops a competitor writing a 0 validation against Chum's agentId — and if the answer is 'nothing', explain how a reader is nevertheless protected, naming the exact parameter that does the work.

### Proof required
A validationRequest tx hash and a validationResponse tx hash on 0G mainnet, a getValidationStatus read showing your score, and the consumer contract reverting for a below-threshold agent.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/erc8004.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/agentic-id/integration.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/ai-alignment.md`
- `/Users/cyber/chum/relay/src/lib/huru/runtime.ts`


---

## 18. Precompiles — reading the chain's native modules from Solidity

### Teaching
This is the real 'more than an EVM' surface, and the only part of 0G Chain that is not standard Ethereum. Precompiles are contracts at fixed addresses that execute native Go/Rust chain code instead of EVM bytecode, claimed 10-100x cheaper than a Solidity equivalent. Two are documented: DASigners at 0x0000000000000000000000000000000000001000 (the docs abbreviate this as 0x...1000 — the real value is the full 20 bytes) and Wrapped0GBase at 0x0000000000000000000000000000000000001002, an ERC-20 wrapper over the native token that any agent participating in ERC-20-shaped DeFi needs. A staking precompile at 0x...1001 exists in the docs source but is HTML-commented out — it is not a supported surface. DASigners is the interesting one: it lets a contract ask the chain, on-chain, who the DA signers are this epoch, which quorum a signer belongs to, and via getAggPkG1(epoch, quorumId, quorumBitmap) returns the aggregated BN254 G1 public key plus (total, hit) row counts. That is the raw material for on-chain BLS verification of a DA availability attestation — the on-chain half of a proof story that today stops at 'here is a root hash in the UI'.

### Practice
Write IDASigners verbatim from the precompile doc page (with the BN254 G1Point/G2Point library) and a DAWatcher contract exposing currentEpoch(), quorumSize(epoch, quorumId), and a view that calls getAggPkG1 with a bitmap and returns (total, hit). Deploy and verify on Galileo with evmVersion cancun. Write an ethers v6 reader that prints the live epoch, quorum count, quorum 0 membership, and whether a given address isSigner. Then wrap and unwrap 0.01 0G through Wrapped0GBase and confirm the ERC-20 balance.

### Quiz
For the current epoch on Galileo: how many quorums exist, and how many signers are in quorum 0? Then explain precisely what `total` and `hit` mean in getAggPkG1's return, and why a contract needs both rather than just a signature count.

### Proof required
A verified DAWatcher address on chainscan-galileo, a script output printing live epoch/quorum/signer data, and a Wrapped0GBase wrap tx hash with the resulting ERC-20 balance.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/precompiles/dasigners.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/precompiles/overview.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/precompiles/wrappedogbase.md`
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts.md`


---

## 19. Run a storage node — become the supply you have been consuming

### Teaching
Every failure Afeez has debugged so far, including the merged Indexer null-deref, was debugged from the client side. Running a node converts abstract failure modes into felt ones, and it is the only part of the stack DevRel can verify independently by looking him up in the node set. The concepts that only make sense once you operate one: every storage node advertises a ShardConfig {shardId, numShard} via zgs_getShardConfig, meaning it holds segments where globalSegmentIndex % numShard === shardId. selectNodes() uses a lazy-propagation segment tree to pick a minimal set of nodes forming complete non-overlapping covering sets ('min' for upload, 'random' for download load-balancing). That is why Uploader.splitTasks round-robins across nodes and why nextSgmentIndex computes the next index a given shard owns. It also explains the failure message 'No storage node holds segment with index N' — the covering set is incomplete, not the file gone. And it explains why upload appears to hang: waitForLogEntry polls zgs_getFileInfo in a while(true) with NO timeout, logging 'Waiting for storage node to sync'. Mining is PoRA with an 8TB mining range cap.

### Practice
Run a 0G storage node on Galileo following docs/run-a-node/storage-node.md, configured for a specific shard. Query its zgs_getShardConfig. Then re-upload your lesson-8 file with your own node explicitly in the node list, and watch it sync the log entry and accept segments-with-proofs. Query zgs_getFileInfo on YOUR node for YOUR root hash. Then kill the node mid-upload and observe the uploader's behaviour.

### Quiz
Your node advertises numShard=4, shardId=1. For a 3MB file, list the global segment indices your node is responsible for, and explain why the uploader still needed three other nodes even though your node was healthy. Then: what happens to the uploader when no node covers segment 5, and why does it not time out?

### Proof required
Your node's zgs_getShardConfig response, a zgs_getFileInfo response from your own node showing your root hash finalized, and the node's public endpoint or peer id.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/run-a-node/storage-node.md`
- `/Users/cyber/0g-learn/0g-doc/docs/run-a-node/overview.md`
- `/Users/cyber/0g-learn/0g-doc/docs/concepts/storage.md`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/common/index.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/common/segment_tree.ts`
- `/Users/cyber/0g-learn/0g-storage-ts-sdk/src.ts/transfer/Uploader.ts`


---

## 20. Goldsky — make the proof surface independently queryable

### Teaching
Chum's Proof Mode and the Huru dashboard read from Supabase, a database Afeez controls. For a verifiability product this is a structural weakness independent of the attestation bug: even after lesson 11, a viewer is trusting his API's word that the verification happened. Indexing is the fix. A subgraph over the AgentNFT and the ERC-8004 registries makes the on-chain half of the proof reproducible by a stranger with nothing but a query URL. Teach the honest boundary too: a subgraph proves what is on-chain (mints, transfers, sealed-key publications, data-hash updates, agent registrations, validation responses). It cannot prove the off-chain half (which provider served a given request, what the TEE signature said) unless that half is anchored on-chain — which is what lesson 17 and the capstone's DA checkpoints exist to do.

### Practice
Build a subgraph indexing the AgentNFT at 0xa3916cB180013170254C40a65A1fFA761667afE6 on chain 16661 (Transfer, Updated, PublishedSealedKey, CreatorSet, Authorization) plus the ERC-8004 Identity Registry Registered event and the Validation Registry ValidationResponse event for your agentId. Deploy it on Goldsky. Repoint Chum's Proof Mode provenance tab at the subgraph instead of Supabase, and label every field in the UI as either 'on-chain, verifiable by anyone' or 'reported by Huru'.

### Quiz
List every Proof Mode field a stranger can now reproduce with only your subgraph URL, and every field that still requires trusting your API. For each field in the second list, name the specific on-chain artefact that would move it to the first.

### Proof required
A live Goldsky subgraph query URL returning token 0's full history, and a Proof Mode screenshot where every field is labelled with its trust source.

### Refs
- `/Users/cyber/0g-learn/0g-doc/docs/developer-hub/building-on-0g/indexing/goldsky.md`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/AgentNFT.sol`
- `/Users/cyber/0g-learn/0g-agent-nft/contracts/extensions/ERC7857AuthorizeUpgradeable.sol`
- `/Users/cyber/chum/relay/src/lib/huru/agentic-id.ts`
- `/Users/cyber/chum/relay/src/lib/huru/dashboard.ts`
