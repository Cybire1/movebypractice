# What I already know vs what I do not

Produced by reading the actual source of Chum, Huru, 0g-aura and 0g-ts-sdk, not the marketing.


## Mastered — teach these rather than take them

- 0G Compute Direct inference path end to end: listService provider discovery, TEE-preferring ranking, cross-provider failover across chat/vision/image/transcription, getServiceMetadata, getRequestHeaders, ZG-Res-Key capture — /Users/cyber/chum/relay/src/lib/huru/runtime.ts (29K, production)
- Broker ledger/account lifecycle: getLedger, addLedger, depositFund, refund, acknowledgeProviderSigner — /Users/cyber/0g-aura/src/compute.ts:150-210
- 0G Storage upload path: Indexer, ZgFile, merkleTree-before-upload, root hash as the only retrieval key — /Users/cyber/chum/relay/src/lib/huru/storage.ts
- 0G KV beyond the official skills: Batcher + StreamDataBuilder writes with a hand-rolled resilient dual-write and provenance tagging (kvPutResilient/kvGetResilient) — storage.ts:133-290, kv-mirror.ts
- ERC-7857 contract authorship plus a real mainnet deployment behind a beacon proxy — 0xa3916cB180013170254C40a65A1fFA761667afE6, chain 16661, token 0 minted
- Envelope encryption over 0G Storage: AES-256-GCM DEK wrapped under an HKDF-derived per-consumer KEK, HD-derived per-consumer wallets with gas drip-funding — encryption.ts, wallet-manager.ts
- Gateway architecture: OpenAI-compatible surface, per-call settlement accounting, multi-provider routing (DeepSeek-v3, GLM-5, qwen3-VL), fiat on-ramp via Paystack — Huru
- SDK-level depth with an upstream track record: found, filed and got merged a real Indexer.download() null-deref in the storage SDK — /Users/cyber/0g-ts-sdk/ISSUE.md, PR #53
- The two cross-layer seams (compute→storage, storage→chain) shipped in production, in the correct order (upload before register)

## Claimed but not actually enforced — fix before the funding conversation

- TEE attestation verification. MILESTONE.md:15 and SUBMISSION.md:27 claim 'real per-call TEE attestation ... processResponse + a cached verifyService'. In the working tree verifyService is never called from any .ts file (markdown only), processResponse's boolean return is discarded at runtime.ts:499, and buildVerification() at runtime.ts:177-191 sets verified by lowercasing the provider's self-advertised verifiability string and checking .includes('tee'). reportId and quoteHash are never populated, so Proof Mode and /v1/requests/{id}/verification return null attestation fields. The badge is a provider self-claim rendered as a cryptographic result.
- Merkle verification on read. storage.ts:233 calls indexer.download(rootHash, tempPath, false) — withProof=false, the exact anti-pattern the storage-plus-chain skill flags. (Mitigating fact he should know and state: the TS SDK's proof flag is a no-op anyway — Downloader.ts:458 carries '// TODO: add proof check' and :464 renames the param _proof. So the fix is recompute-and-compare, not flipping a boolean.)
- ERC-7857 security property. The live iNFT uses the reference/mock verifier — his own chum/inft/scripts/deploy.ts:15-20 notes 'attestation addr is unused on mock paths' and that the reference Verifier accepts any 32-byte data-hash proof as valid. docs/0G_INFT.md:286 already says 'Use MockOracle and say so.' The token is real; the transfer/clone re-encryption guarantee is not enforced on-chain.
- Per-call on-chain micropayment framing. settleConsumerCredits (store.ts:2018+) is a Supabase credit-ledger transaction with optimistic retry, not a chain write. The genuine on-chain economics happen inside the broker's sub-account settlement. Both real; conflating them in a funding pitch is the kind of imprecision a technical reviewer punishes.
- Package-namespace drift he has already hit but not resolved: Huru runs @0glabs/0g-ts-sdk ^0.3.3 + @0gfoundation/0g-compute-ts-sdk ^0.8.4 while 0g-aura is still on @0glabs/0g-serving-broker ^0.7.1.
- Proof surface centralisation: Proof Mode and the Huru dashboard read from Supabase, a database he controls. Even with correct attestation, a viewer is trusting his API's word.

## Never touched

- 0G DA in any form: blob submission, the 32,505,852-byte ceiling, the 1024x1024 31-byte-field-element matrix, erasure extension to 3072x1024, KZG commitments, PoDAS sampling, the ~3-month EPOCH_WINDOW_SIZE retention horizon, the DA fee market. Zero hits across chum, 0g-aura, 0g-ts-sdk, 0g-bug-repro.
- DA node operation: client/disperser :51001, encoder :34000 (GPU-bound), retriever :34005, challenge_0084 + AMT parameter builds.
- Rollups and appchains: OP Stack alt-DA (--altda.enabled, --altda.da-server, GenericCommitment, daChallengeWindow/daResolveWindow/daBondSize), Arbitrum Nitro DataAvailabilityProvider / das/zerogravity.go, Caldera RaaS, EigenLayer/Babylon AVS on 0G DA.
- Precompiles: DASigners at 0x0000000000000000000000000000000000001000 (BN254 G1/G2, quorum bitmaps, getAggPkG1, epoch registration) and Wrapped0GBase at 0x...1002.
- The 0G Compute Router entirely. He built his own gateway and never used 0G's, so he has no working knowledge of x_0g_trace, verify_tee, sk-/mk- scoped keys, X-0G-Provider-* routing headers, price ceilings as a pre-sort filter, trust-mode tiers, async image jobs, or the Payment Layer PaymentWorker tranche pull — and therefore cannot yet answer 'why not just use the Router?'
- Compute fine-tuning: broker.fineTuning, the CLI lifecycle, LoRA output, the 48-hour acknowledge fuse.
- The provider side of the marketplace: registering an inference or fine-tuning service, advertising verifiability, serving /v1/proxy/signature/{chatID}.
- ERC-8004: Identity, Reputation and Validation registries. His live 7857 iNFT is invisible to 8004scan and to every other agent ecosystem.
- Node operation of any kind: validator, storage, DA, archival; geth→reth migration; staking/validator contract interaction.
- Indexing: Goldsky/subgraphs over 0G Chain.
- AI Alignment Nodes.
- 0gmem's actual relationship to 0G — worth stating plainly so he does not over-credit reading it: pyproject.toml pulls numpy/networkx/faiss/sentence-transformers/spacy, there is no ethers, no web3, no @0glabs package, and persistence.py writes local JSON+NPZ. It teaches memory design, not 0G. It is the single clearest funded-product gap and he already owns the missing half.