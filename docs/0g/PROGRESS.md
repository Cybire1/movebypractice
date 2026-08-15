# 0G track — study progress

Tick a lesson only when the **proof artefact** exists. Reading is not completion.

| # | Tier | Lesson | Proof required | Done |
|---|---|---|---|---|
| 1 | beginner | Two networks, one wallet, first transaction | The self-transfer transaction hash, opened on chainscan-galileo.0g.ai, plus the raw eth_ch | [ ] |
| 2 | beginner | Deploy and verify a contract — the cancun trap | A contract address on chainscan-galileo.0g.ai showing verified green source, plus the fail | [ ] |
| 3 | beginner | First inference through the Router — zero crypto required | A saved JSON response containing request_id, provider address and the billing block, plus  | [ ] |
| 4 | beginner | Routing headers and price ceilings — the ordering that matters | Four request_ids with their provider addresses and costs, plus the two verbatim error bodi | [ ] |
| 5 | beginner | Trust modes — what the word 'TEE' actually promises | The TeeML model list from your own jq run, one private-tier response with its provider add | [ ] |
| 6 | beginner | verify_tee and the trust boundary a gateway cannot close | One JSON artefact containing: the chatID, the provider address, the Router's tee_verified, | [ ] |
| 7 | beginner | The Direct path: main account, sub-accounts, and the 24-hour lock | The addLedger and transferFund tx hashes, a get-sub-account output showing Locked plus the | [ ] |
| 8 | beginner | First storage upload — the root hash is the only key | Two root hashes, the submit() tx hashes on chainscan, the fee for each, and the empty-txHa | [ ] |
| 9 | beginner | Download and actually verify — `proof: true` is a no-op in TypeScript | A verify.ts run showing expectedRoot === recomputedRoot true, the same script failing on t | [ ] |
| 10 | beginner | The storage→chain seam: hash on-chain, bytes off-chain | A verified StorageRegistry address, the registerFile tx hash, and reader output showing th | [ ] |
| 11 | intermediate | Make the TEE badge real — processResponse is a verification primitive now | A Huru request id whose GET /v1/requests/{id}/verification returns a verdict sourced from  | [ ] |
| 12 | intermediate | verifyService — and the honesty about what a green check proves | The ./reports directory committed to the repo, a Proof Mode screenshot showing the scoped  | [ ] |
| 13 | intermediate | Merkle-verify Huru's reads | A Chum memory read whose response carries storage_verified: true with the recomputed root; | [ ] |
| 14 | intermediate | Router vs Huru — write the memo you will be asked for | A Huru response body carrying a spec-shaped x_0g_trace; a Huru request that honoured X-0G- | [ ] |
| 15 | intermediate | Fine-tuning end to end — the one thing the Router cannot do | The task ID, the create-task transaction, adapter_config.json + adapter_model.safetensors, | [ ] |
| 16 | intermediate | ERC-8004 — make Chum discoverable instead of merely owned | The mainnet register tx hash, the resulting agentId, the live 8004scan.io listing URL, the | [ ] |
| 17 | intermediate | ERC-8004 Validation Registry — turn per-call TEE checks into portable reputation | A validationRequest tx hash and a validationResponse tx hash on 0G mainnet, a getValidatio | [ ] |
| 18 | intermediate | Precompiles — reading the chain's native modules from Solidity | A verified DAWatcher address on chainscan-galileo, a script output printing live epoch/quo | [ ] |
| 19 | intermediate | Run a storage node — become the supply you have been consuming | Your node's zgs_getShardConfig response, a zgs_getFileInfo response from your own node sho | [ ] |
| 20 | intermediate | Goldsky — make the proof surface independently queryable | A live Goldsky subgraph query URL returning token 0's full history, and a Proof Mode scree | [ ] |
| 21 | advanced | DA from first principles — compute a data root with no DA node | The computed data root for a named blob, the script committed to the repo, and a written c | [ ] |
| 22 | advanced | Run the DA stack and disperse a real blob | The disperse response containing data root, epoch and quorumId; the offline-computed root  | [ ] |
| 23 | advanced | Gate a contract on availability — DASigners, BLS quorums and PoDAS | A verified DAGated address, one tx hash where a real dispersed blob's checkpoint was accep | [ ] |
| 24 | advanced | Alt-DA — put an OP Stack rollup on 0G DA | An L2 transaction hash, the corresponding L1 batcher tx on Sepolia, the DA data root that  | [ ] |
| 25 | advanced | Arbitrum Nitro on 0G DA — and the doc gap you close | A working Nitro L2 transaction hash with its 0G DA data root, and a PR URL against 0gfound | [ ] |
| 26 | advanced | ERC-7857 transfer — the half you never shipped | An iTransferFrom tx hash on Galileo with its PublishedSealedKey event decoded, an iCloneFr | [ ] |
| 27 | advanced | Replace the mock verifier with a real TEE oracle | A TeeVerifier address whose teeOracleAddress read returns YOUR key, a transfer tx where th | [ ] |
| 28 | advanced | 0gmem on 0G Storage — close the gap in 0G's own repo | A 0gmem instance restored to full working state after a container wipe, from a root hash p | [ ] |
| 29 | advanced | Become a provider — the other side of the marketplace | Your provider address appearing in a listService() output run by someone else, a Huru requ | [ ] |
