'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const codeExamples = [
  {
    title: 'transfer.move',
    code: `public entry fun transfer(
  token: Coin<TOKEN>,
  amount: u64,
  recipient: address,
  ctx: &mut TxContext
) {
  let split_coin = coin::split(
    &mut token, amount, ctx
  );
  transfer::public_transfer(
    split_coin, recipient
  );
  transfer::public_transfer(
    token, tx_context::sender(ctx)
  );
}`,
  },
  {
    title: 'voting.move',
    code: `public entry fun vote(
  proposal: &mut Proposal,
  choice: bool,
  ctx: &mut TxContext
) {
  let voter = tx_context::sender(ctx);
  assert!(!table::contains(
    &proposal.voters, voter
  ), EAlreadyVoted);
  table::add(&mut proposal.voters, voter, true);
  if (choice) {
    proposal.yes_votes = proposal.yes_votes + 1;
  } else {
    proposal.no_votes = proposal.no_votes + 1;
  };
}`,
  },
  {
    title: 'mint_nft.move',
    code: `public entry fun mint(
  name: vector<u8>,
  description: vector<u8>,
  url: vector<u8>,
  ctx: &mut TxContext
) {
  let nft = NFT {
    id: object::new(ctx),
    name: string::utf8(name),
    description: string::utf8(description),
    url: url::new_unsafe_from_bytes(url),
  };
  transfer::public_transfer(
    nft, tx_context::sender(ctx)
  );
}`,
  },
  {
    title: 'auction.move',
    code: `public entry fun bid(
  auction: &mut Auction,
  coin: Coin<SUI>,
  ctx: &mut TxContext
) {
  let bid_amount = coin::value(&coin);
  assert!(bid_amount > auction.highest_bid, ETooLow);

  auction.highest_bid = bid_amount;
  auction.highest_bidder = tx_context::sender(ctx);
  balance::join(&mut auction.funds,
    coin::into_balance(coin));
}`,
  },
  {
    title: 'token_swap.move',
    code: `public entry fun swap<A, B>(
  pool: &mut Pool<A, B>,
  coin_a: Coin<A>,
  ctx: &mut TxContext
) {
  let amount_in = coin::value(&coin_a);
  let amount_out = calculate_output(
    amount_in, pool
  );
  balance::join(&mut pool.balance_a,
    coin::into_balance(coin_a));
  let coin_out = coin::take(
    &mut pool.balance_b, amount_out, ctx
  );
  transfer::public_transfer(
    coin_out, tx_context::sender(ctx)
  );
}`,
  },
];

export default function AnimatedCodePreview() {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentExample = codeExamples[currentExampleIndex];
  const fullCode = currentExample.code;

  useEffect(() => {
    // Typing effect
    if (currentIndex < fullCode.length && !isTransitioning) {
      const timeout = setTimeout(() => {
        setDisplayedCode(fullCode.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // 20ms per character for faster typing

      return () => clearTimeout(timeout);
    } else if (currentIndex >= fullCode.length && !isTransitioning) {
      // When done typing, wait 3 seconds then transition to next example
      const waitTimeout = setTimeout(() => {
        setIsTransitioning(true);

        // Fade out and transition to next code
        setTimeout(() => {
          const nextIndex = (currentExampleIndex + 1) % codeExamples.length;
          setCurrentExampleIndex(nextIndex);
          setDisplayedCode('');
          setCurrentIndex(0);
          setIsTransitioning(false);
        }, 500); // Fade out duration
      }, 3000); // Wait 3 seconds before next example

      return () => clearTimeout(waitTimeout);
    }
  }, [currentIndex, fullCode, isTransitioning, currentExampleIndex]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const lines = displayedCode.split('\n');
  const isTypingComplete = currentIndex >= fullCode.length;

  const renderCodeWithSyntax = (text: string) => {
    // Preserve leading whitespace
    const leadingSpaces = text.match(/^\s*/)?.[0] || '';
    const trimmedText = text.trimStart();

    // Comments
    if (trimmedText.startsWith('//')) {
      return <span className="text-gray-500 italic">{text}</span>;
    }

    // Module declaration
    if (trimmedText.startsWith('module')) {
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">module</span>
          <span className="text-white">{trimmedText.replace('module', '')}</span>
        </>
      );
    }

    // Struct declaration
    if (trimmedText.startsWith('struct')) {
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">struct</span>
          <span className="text-white">{trimmedText.replace('struct', '')}</span>
        </>
      );
    }

    // Function declarations (public entry fun)
    if (trimmedText.startsWith('public entry fun') || trimmedText.startsWith('public fun') || trimmedText.startsWith('fun')) {
      const match = trimmedText.match(/^(public\s+entry\s+fun|public\s+fun|fun)/);
      const keyword = match ? match[1] : 'fun';
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">{keyword}</span>
          <span className="text-white">{trimmedText.replace(keyword, '')}</span>
        </>
      );
    }

    // Use declaration
    if (trimmedText.startsWith('use')) {
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">use</span>
          <span className="text-white">{trimmedText.replace('use', '')}</span>
        </>
      );
    }

    // Let, assert!, if, else statements
    if (trimmedText.startsWith('let') || trimmedText.startsWith('assert!') || trimmedText.startsWith('if') || trimmedText.startsWith('} else')) {
      const keyword = trimmedText.split(/[\s(]/)[0];
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">{keyword}</span>
          <span className="text-white">{trimmedText.replace(keyword, '')}</span>
        </>
      );
    }

    // Module operations (coin::, transfer::, etc.)
    if (trimmedText.includes('::') && !trimmedText.startsWith('//')) {
      const parts = trimmedText.split(/([\w]+::[\w]+)/);
      return (
        <>
          {leadingSpaces}
          {parts.map((part, i) =>
            part.includes('::') ? (
              <span key={i} className="text-sui-accent-light font-bold">{part}</span>
            ) : (
              <span key={i} className="text-white">{part}</span>
            )
          )}
        </>
      );
    }

    // Public keyword
    if (trimmedText.includes('public')) {
      return (
        <>
          {leadingSpaces}
          <span className="text-sui-accent font-bold">public</span>
          <span className="text-white">{trimmedText.replace('public', '')}</span>
        </>
      );
    }

    // Field definitions (owner:, amount:, etc.)
    if (trimmedText.includes(':') && !trimmedText.includes('::') && !trimmedText.includes('//') && !trimmedText.includes('=>')) {
      const [key, value] = trimmedText.split(':');
      return (
        <>
          {leadingSpaces}
          <span className="text-gray-400">{key.trim()}</span>
          <span className="text-white">: </span>
          <span className="text-sui-accent-light">{value}</span>
        </>
      );
    }

    // Empty lines and everything else
    return <span className="text-white">{text}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative w-full mx-auto pr-4 lg:pr-8"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-sui-accent/10 to-transparent blur-3xl opacity-30" />

      {/* Code Window */}
      <div className="relative bg-[#1E1E1E]/90 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5">
        {/* Window Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-black/40 border-b border-white/10">
          <div className="flex gap-1 sm:gap-1.5 opacity-80">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-white/20" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-white/20" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-white/20" />
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentExample.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-[10px] sm:text-xs text-gray-400 ml-2 sm:ml-3 font-mono tracking-wider"
            >
              {currentExample.title}
            </motion.span>
          </AnimatePresence>
          {!isTypingComplete && !isTransitioning && (
            <span className="ml-auto text-[10px] sm:text-xs text-sui-accent/70 animate-pulse hidden sm:inline font-mono">typing...</span>
          )}
          {isTransitioning && (
            <span className="ml-auto text-[10px] sm:text-xs text-white/50 hidden sm:inline font-mono">switching...</span>
          )}
          {/* Example counter */}
          <span className="ml-auto text-[10px] sm:text-xs text-gray-600 font-mono">
            {currentExampleIndex + 1}/5
          </span>
        </div>

        {/* Code Content with Typing Effect */}
        <motion.div
          key={currentExampleIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 lg:p-8 font-mono text-xs sm:text-sm lg:text-base min-h-[200px] sm:min-h-[240px] lg:min-h-[280px] text-left overflow-x-auto text-gray-300"
        >
          {lines.map((line, index) => (
            <div key={index} className="flex items-start gap-2 sm:gap-3 lg:gap-4 min-h-[1.25rem] sm:min-h-[1.5rem] lg:min-h-[1.75rem]">
              <span className="text-gray-600 select-none w-6 sm:w-8 lg:w-10 text-right flex-shrink-0 text-[10px] sm:text-xs lg:text-base">
                {index + 1}
              </span>
              <code className="flex-1 whitespace-pre text-left block">
                {renderCodeWithSyntax(line)}
                {/* Show cursor at the end of last line */}
                {index === lines.length - 1 && showCursor && !isTransitioning && (
                  <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 lg:h-5 bg-sui-accent ml-0.5 align-middle shadow-[0_0_8px_rgba(0,255,153,0.8)]" />
                )}
              </code>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
