# The 0G track

A beginner-to-advanced path through the whole 0G stack, built from the official
repos and the 83-page doc set rather than from blog posts.

## Read in this order

1. **[GAP-ANALYSIS.md](./GAP-ANALYSIS.md)** — start here. What is genuinely
   mastered already, what is claimed but not enforced in the code, and what has
   never been touched. Read this before deciding where to begin.
2. **[beginner.md](./beginner.md)** — 10 lessons. Wallet to verified inference to
   a storage root you can recompute yourself.
3. **[intermediate.md](./intermediate.md)** — 10 lessons. Closes the gap between
   what Huru and Chum claim and what they actually enforce, then reaches
   fine-tuning, ERC-8004, precompiles and running a storage node.
4. **[advanced.md](./advanced.md)** — 9 lessons. DA end to end, alt-DA rollups,
   the real ERC-7857 transfer machinery, and the provider side of the marketplace.
5. **[CAPSTONE.md](./CAPSTONE.md)** — the project that proves whole-stack command,
   plus the evidence plan for the 0G DevRel conversation.

[CURRICULUM.md](./CURRICULUM.md) is all of the above in one file.
[PROGRESS.md](./PROGRESS.md) is the checklist.

## The one rule

Every lesson ends in a **proof artefact**: a transaction hash, a storage root
hash, a deployed contract address, a live URL. A lesson is not complete because
it was read. It is complete when the artefact exists and someone else could
verify it without trusting you.

## Source material

Clone these alongside (they are what the lessons reference):

    0gfoundation/0g-agent-skills            the 14 official skills
    0gfoundation/0g-compute-ts-starter-kit  demo-compute-flow.ts
    0gfoundation/0g-storage-ts-starter-kit  upload and download
    0gfoundation/0g-storage-ts-sdk          the SDK internals
    0gfoundation/0g-agent-nft               ERC-7857
    0gfoundation/0g-doc                     the docs

## Turning this into lessons in the app

The `packages/shared/lessons/` format is a typed `LessonContent` object with
teaching slides, a quiz and a practice phase. Each lesson here maps onto it
directly: **Teaching** to `teachingSections`, **Quiz** to `quiz`, **Practice**
to `starterCode` / `solution` / `unitTests`. The proof artefact has no home in
the current type — it wants a new field, since it is the thing that makes this
track different from every other 0G tutorial.
