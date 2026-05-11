import { LessonContent } from '@/app/types/lesson';

export const predictLesson8: LessonContent = {
  id: 'predict-8',
  title: 'React Integration Patterns',
  description: 'Master the React hooks, component patterns, and visibility-aware polling techniques used to build a production trading UI on DeepBook Predict — from data fetching hooks to transaction execution and battery-friendly polling.',
  difficulty: 'advanced',
  xpReward: 400,
  order: 8,
  language: 'typescript',
  prerequisiteLessons: ['predict-7'],

  narrative: {
    welcomeMessage: "You've built transactions and understand the full DeepBook Predict stack. Now it's time to connect everything to a React UI — the layer your users actually see. In this lesson you'll learn the hook architecture that fetches oracles, computes prices, executes trades, and does it all without wasting battery or API calls when the browser tab is hidden.",
    quizTransition: "You've explored data hooks, the TradePanel pattern, and visibility-aware polling. Let's see how well you can reason about composing these pieces into a production-ready trading interface.",
    practiceTransition: "Time to build the hooks yourself. You'll implement useOracles for data fetching, useFairPrice for derived pricing, useVisibilityAwareInterval for smart polling, and a TradeButton component that ties it all together.",
    celebrationMessage: "Incredible work! You've completed the entire DeepBook Predict course — from SVI theory and on-chain architecture all the way to a production React integration. You now have every skill needed to build, price, and ship a binary options trading dApp on Sui.",
    nextLessonTease: "This is the final lesson in the DeepBook Predict series. You're now fully equipped to build a production dApp — take everything you've learned and ship something real. The market is waiting.",
  },

  teachingSections: [
    {
      sectionTitle: 'Data Hooks',
      slides: [
        {
          title: 'Hook Architecture Overview',
          content: 'A Predict trading UI is powered by a small set of focused React hooks. Each hook owns one data concern: fetching markets, computing prices, finding the user\'s manager, or reading vault state. They compose together inside components to create a complete trading experience.',
          emoji: '🪝',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'useOracles', content: 'Fetches all oracle markets from the predict-server API. Returns three arrays — oracles (all), active (tradeable), and settled (redeemable) — plus loading state and a manual refresh function. Polls on a configurable interval.' },
                { label: 'useSviPricing', content: 'Fetches the latest SVI parameters for a single oracle from /oracles/:id/svi/latest. Returns the SviData object (a, b, rho, m, sigma, forwardPrice, timeToExpiry) needed by computeSviPrice. Also polls on an interval.' },
                { label: 'useManager', content: 'Looks up the current wallet\'s PredictManager on-chain using the Registry. Returns the manager object ID if one exists, or null if the user hasn\'t created one yet. This drives the "Create Account" vs. "Trade" UI flow.' },
                { label: 'useVaultStats', content: 'Reads the Predict vault shared object on-chain to surface key stats: total deposits, current exposure, and utilization ratio. Used in dashboard panels and risk displays.' },
              ],
            },
          },
        },
        {
          title: 'useOracles Implementation',
          content: 'useOracles is the foundational data hook. It fetches the full oracle list from the predict-server REST API, categorizes markets by status, and re-fetches on a polling interval. The hook returns everything a market-list component needs.',
          emoji: '📡',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { useState, useEffect, useCallback } from 'react';

interface Oracle {
  id: string;
  feedName: string;
  status: 'active' | 'settled' | 'expired';
  expiry: number;
  settlementPrice?: number;
}

function useOracles(pollInterval = 30_000) {
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOracles = useCallback(async () => {
    try {
      const res = await fetch('/api/predict-server/oracles');
      const data: Oracle[] = await res.json();
      setOracles(data);
    } catch (err) {
      console.error('Failed to fetch oracles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOracles();
    const id = setInterval(fetchOracles, pollInterval);
    return () => clearInterval(id);
  }, [fetchOracles, pollInterval]);

  const active  = oracles.filter(o => o.status === 'active');
  const settled = oracles.filter(o => o.status === 'settled');

  return { oracles, active, settled, loading, refresh: fetchOracles };
}`,
              highlights: [
                { line: 11, explanation: 'pollInterval defaults to 30 seconds. Callers can override for more or less frequent updates.' },
                { line: 12, explanation: 'useState<Oracle[]>([]) holds the full oracle list. Starts empty; populated after the first fetch.' },
                { line: 16, explanation: 'useCallback memoizes fetchOracles so it has a stable identity across renders — essential for the useEffect dependency array.' },
                { line: 28, explanation: 'useEffect runs fetchOracles immediately on mount, then starts a setInterval. The cleanup function clears the interval on unmount or when dependencies change.' },
                { line: 34, explanation: 'Derived arrays — active and settled — are computed inline on every render. For large lists, useMemo would be more efficient.' },
                { line: 37, explanation: 'The refresh function is exposed so components can trigger a manual re-fetch (e.g., after a successful trade).' },
              ],
            },
          },
        },
        {
          title: 'useSviPricing Implementation',
          content: 'useSviPricing fetches the SVI volatility surface parameters for a single oracle. It hits the /oracles/:id/svi/latest endpoint and returns the SviData needed by computeSviPrice to calculate fair value for any strike.',
          emoji: '📈',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface SviData {
  a: number;
  b: number;
  rho: number;
  m: number;
  sigma: number;
  forwardPrice: number;
  timeToExpiry: number;
}

function useSviPricing(oracleId: string | null, pollInterval = 30_000) {
  const [sviData, setSviData] = useState<SviData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSvi = useCallback(async () => {
    if (!oracleId) return;
    setLoading(true);
    try {
      const res = await fetch(
        \`/api/predict-server/oracles/\${oracleId}/svi/latest\`
      );
      const data: SviData = await res.json();
      setSviData(data);
    } catch (err) {
      console.error('Failed to fetch SVI data:', err);
    } finally {
      setLoading(false);
    }
  }, [oracleId]);

  useEffect(() => {
    fetchSvi();
    const id = setInterval(fetchSvi, pollInterval);
    return () => clearInterval(id);
  }, [fetchSvi, pollInterval]);

  return { sviData, loading, refresh: fetchSvi };
}`,
              highlights: [
                { line: 1, explanation: 'SviData contains the five SVI parameters (a, b, rho, m, sigma) plus forwardPrice and timeToExpiry — everything computeSviPrice needs.' },
                { line: 11, explanation: 'oracleId can be null (no oracle selected yet). The fetch is skipped when null, avoiding a bad API request.' },
                { line: 16, explanation: 'The guard "if (!oracleId) return" ensures we never hit the API without a valid oracle ID. The hook simply stays in its initial state.' },
                { line: 20, explanation: 'The endpoint /oracles/:id/svi/latest returns the most recent SVI calibration for this oracle\'s market.' },
                { line: 38, explanation: 'Returns sviData (null until first successful fetch), loading state, and a manual refresh function.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-015',
    },
    {
      sectionTitle: 'Trading UI Pattern',
      slides: [
        {
          title: 'TradePanel Component',
          content: 'The TradePanel is the central trading component. It composes multiple hooks to gather all the data it needs — the user\'s manager, their DUSDC balance, SVI pricing data, and vault stats. Then it uses useMemo to derive the fair price and fee breakdown, keeping expensive computations cached.',
          emoji: '🖥️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function TradePanel({ oracleId, strike, direction }: TradePanelProps) {
  // Compose data hooks
  const { manager, loading: managerLoading } = useManager();
  const { balance }     = useDUSDCBalance(manager?.id);
  const { sviData }     = useSviPricing(oracleId);
  const { vaultStats }  = useVaultStats();

  // Derive fair price from SVI parameters
  const fairPrice = useMemo(() => {
    if (!sviData) return null;
    return computeSviPrice(sviData, strike, direction);
  }, [sviData, strike, direction]);

  // Derive fee breakdown
  const fees = useMemo(() => {
    if (fairPrice === null) return null;
    return computeFeeBreakdown(fairPrice, quantity);
  }, [fairPrice, quantity]);

  // Component renders loading / no-manager / trade UI
  // based on the hook states ...
}`,
              highlights: [
                { line: 1, explanation: 'TradePanel receives the selected oracle, strike price, and direction as props. Everything else comes from hooks.' },
                { line: 3, explanation: 'useManager() checks on-chain whether this wallet has a PredictManager. If manager is null, the UI shows a "Create Account" button instead of the trade form.' },
                { line: 4, explanation: 'useDUSDCBalance reads the manager\'s deposited DUSDC balance. It depends on manager.id, so it only runs after the manager is loaded.' },
                { line: 5, explanation: 'useSviPricing fetches the volatility surface for the selected oracle. If oracleId changes (user switches market), the hook refetches automatically.' },
                { line: 9, explanation: 'useMemo caches the fair price computation. computeSviPrice involves math-heavy SVI evaluation — memoization prevents recalculating on every render.' },
                { line: 15, explanation: 'Fee breakdown is derived from fair price and quantity. This two-layer memo chain (SVI -> price -> fees) keeps the component efficient.' },
              ],
            },
          },
        },
        {
          title: 'Transaction Execution',
          content: 'When the user clicks "Mint," the TradePanel builds a transaction and submits it through the connected wallet. The @mysten/dapp-kit provides signAndExecuteTransaction, which prompts the wallet for approval and returns the transaction result.',
          emoji: '🚀',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function TradePanel({ oracleId, strike, direction }: TradePanelProps) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { manager }     = useManager();
  const { refresh: refreshBalance } = useDUSDCBalance(manager?.id);

  const [minting, setMinting] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleMint = async () => {
    if (!manager) return;
    setMinting(true);
    setError(null);

    try {
      // Build the transaction
      const tx = depositAndMintTx(
        manager.id,
        coinIds,
        depositAmount,
        oracleId,
        expiry,
        direction,
        strike,
        quantity
      );

      // Sign and execute via wallet
      const result = await signAndExecute({ transaction: tx });
      console.log('Mint success:', result.digest);

      // Refresh balance to reflect new position
      await refreshBalance();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mint failed';
      setError(message);
    } finally {
      setMinting(false);
    }
  };

  // ... render mint button with minting/error state
}`,
              highlights: [
                { line: 1, explanation: 'useSignAndExecuteTransaction is the primary dapp-kit hook for submitting transactions. It handles wallet connection, signing prompts, and submission.' },
                { line: 4, explanation: 'mutateAsync is destructured and renamed to signAndExecute. It returns a promise that resolves with the transaction result or rejects on failure.' },
                { line: 11, explanation: 'handleMint is async: it builds the transaction, waits for wallet signing, then handles the result. Loading and error states are tracked with useState.' },
                { line: 18, explanation: 'depositAndMintTx builds the Programmable Transaction Block you learned in the previous lesson — deposit + RangeKey + mint in one atomic operation.' },
                { line: 30, explanation: 'signAndExecute({ transaction: tx }) opens the wallet popup, gets the signature, submits to the network, and waits for confirmation.' },
                { line: 34, explanation: 'After a successful mint, refreshBalance() re-fetches the on-chain balance so the UI reflects the new position immediately.' },
              ],
            },
          },
        },
        {
          title: 'State Management',
          content: 'The TradePanel has four distinct states based on the data from its hooks. Each state maps to a different UI presentation — from skeleton loaders to active trading. Matching these states correctly is essential for a polished user experience.',
          emoji: '🔄',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'skeleton', label: 'Skeleton loader animation', emoji: '💀' },
                { id: 'create-btn', label: '"Create Account" button', emoji: '🆕' },
                { id: 'disabled-warning', label: 'Disabled mint + warning banner', emoji: '⚠️' },
                { id: 'active-mint', label: 'Active mint button with live price', emoji: '✅' },
              ],
              targets: [
                { id: 'loading', label: 'Loading oracles / manager' },
                { id: 'no-manager', label: 'No PredictManager found' },
                { id: 'low-balance', label: 'Insufficient DUSDC balance' },
                { id: 'ready', label: 'Ready to trade' },
              ],
              correctPairs: [
                { itemId: 'skeleton', targetId: 'loading' },
                { itemId: 'create-btn', targetId: 'no-manager' },
                { itemId: 'disabled-warning', targetId: 'low-balance' },
                { itemId: 'active-mint', targetId: 'ready' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-016',
    },
    {
      sectionTitle: 'Visibility-Aware Polling',
      slides: [
        {
          title: 'Why Visibility Matters',
          content: 'A trading dApp polls APIs every few seconds for live prices. But when the user switches to another browser tab, those requests keep firing — wasting bandwidth, draining battery on mobile, and hitting rate limits. The Page Visibility API solves this by letting you detect when your tab is hidden.',
          emoji: '👁️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Wasted API Calls', content: 'A tab polling every 5 seconds makes 720 requests per hour even when hidden. Multiply by thousands of users and your API infrastructure pays the price. Pausing polls when hidden eliminates this entirely.' },
                { label: 'Battery Drain on Mobile', content: 'Network requests wake the radio, preventing the CPU from entering low-power states. A hidden tab that keeps polling can visibly reduce battery life on phones and laptops.' },
                { label: 'Stale Data on Return', content: 'Without visibility awareness, when a user returns to the tab after 10 minutes, they see data from the last poll — potentially very stale. A visibility-aware hook immediately fetches fresh data on tab focus.' },
                { label: 'Visibility API Solution', content: 'document.visibilityState is either "visible" or "hidden". The "visibilitychange" event fires on transitions. Your hook listens for this event to pause/resume polling and trigger an immediate refresh on return.' },
              ],
            },
          },
        },
        {
          title: 'useVisibilityAwareInterval',
          content: 'This custom hook wraps setInterval with visibility awareness. It pauses the interval when the tab is hidden and resumes it — with an immediate callback invocation — when the tab becomes visible again.',
          emoji: '⏱️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { useEffect, useRef } from 'react';

function useVisibilityAwareInterval(
  callback: () => void,
  intervalMs: number
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const start = () => {
      if (intervalRef.current !== null) return;
      intervalRef.current = setInterval(
        () => callbackRef.current(),
        intervalMs
      );
    };

    const stop = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current();   // Immediate refresh
        start();                 // Resume polling
      } else {
        stop();                  // Pause polling
      }
    };

    // Initial start
    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}`,
              highlights: [
                { line: 7, explanation: 'intervalRef stores the interval ID. Using a ref (not state) avoids triggering re-renders when starting/stopping the interval.' },
                { line: 8, explanation: 'callbackRef always holds the latest callback. This avoids stale closures — the interval always calls the current version of the callback.' },
                { line: 12, explanation: 'start() creates the interval only if one isn\'t already running. The guard prevents double-starting.' },
                { line: 19, explanation: 'stop() clears the interval and resets the ref to null. Called when the tab becomes hidden or on cleanup.' },
                { line: 28, explanation: 'When the tab becomes visible: immediately invoke the callback (get fresh data now) then resume the polling interval.' },
                { line: 31, explanation: 'When the tab becomes hidden: stop the interval. No more API calls until the user returns to the tab.' },
                { line: 38, explanation: 'The cleanup function in useEffect stops the interval and removes the event listener when the component unmounts.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together',
          content: 'Here is a complete mini trading dApp skeleton showing how providers, hooks, visibility-aware polling, price display, and transaction execution compose into a cohesive application.',
          emoji: '🏗️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

// App shell with providers
function App() {
  const networks = { testnet: { url: getFullnodeUrl('testnet') } };

  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider>
        <TradingDashboard />
      </WalletProvider>
    </SuiClientProvider>
  );
}

// Dashboard: composes hooks, displays prices, enables trading
function TradingDashboard() {
  const { active, loading } = useOracles();
  const [selectedOracle, setSelectedOracle] = useState(active[0]?.id ?? null);
  const { sviData } = useSviPricing(selectedOracle);
  const { manager }  = useManager();

  // Visibility-aware polling for the oracle list
  useVisibilityAwareInterval(() => {
    // This replaces the internal setInterval in useOracles
    // for a more battery-friendly approach
  }, 15_000);

  if (loading) return <div>Loading markets...</div>;

  return (
    <div>
      <h1>DeepBook Predict</h1>
      <MarketSelector oracles={active} onSelect={setSelectedOracle} />
      {sviData && <PriceDisplay sviData={sviData} />}
      {manager
        ? <TradePanel oracleId={selectedOracle} />
        : <CreateAccountButton />
      }
    </div>
  );
}`,
              highlights: [
                { line: 1, explanation: 'SuiClientProvider and WalletProvider from @mysten/dapp-kit wrap the entire app. They provide Sui RPC access and wallet connection context to all child components.' },
                { line: 9, explanation: 'SuiClientProvider accepts a networks config and a default. All Sui hooks (useSignAndExecuteTransaction, etc.) use this client.' },
                { line: 10, explanation: 'WalletProvider enables wallet connection UI and exposes the connected wallet to useCurrentAccount and signing hooks.' },
                { line: 19, explanation: 'useOracles provides the market list. active is filtered to only tradeable (non-expired, non-settled) oracles.' },
                { line: 25, explanation: 'useVisibilityAwareInterval replaces naive setInterval for polling. Pauses when the tab is hidden, refreshes immediately on return.' },
                { line: 37, explanation: 'Conditional rendering: if the user has a manager, show the trade panel. Otherwise, show a "Create Account" button that calls createManagerTx.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-017',
    },
  ],

  quiz: [
    {
      question: 'Why does useOracles wrap fetchOracles in useCallback?',
      options: [
        'To make the fetch function async',
        'To ensure a stable function reference for the useEffect dependency array',
        'To prevent the fetch from running on mount',
        'To cache the API response between renders',
      ],
      correctAnswer: 1,
      explanation: 'useCallback memoizes the function so it has a stable identity across renders. Without it, fetchOracles would be a new function on every render, causing the useEffect to re-run its cleanup and setup on every render cycle — restarting the interval continuously.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'In useVisibilityAwareInterval, what happens when the tab becomes visible again?',
      options: [
        'Nothing — the interval was never stopped',
        'The interval resumes from where it left off',
        'The callback is invoked immediately, then the interval is restarted',
        'The component re-mounts and all hooks re-initialize',
      ],
      correctAnswer: 2,
      explanation: 'When document.visibilityState changes to "visible," the handler immediately calls the callback (to get fresh data right away) and then calls start() to resume the polling interval. This ensures the user sees up-to-date data the instant they return to the tab.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'Which dapp-kit hook is used to submit a transaction to the Sui network?',
      options: [
        'useTransactionBlock',
        'useSignAndExecuteTransaction',
        'useSuiClient.sendTransaction',
        'useWallet.signAndSubmit',
      ],
      correctAnswer: 1,
      explanation: 'useSignAndExecuteTransaction from @mysten/dapp-kit is the primary hook for signing and submitting transactions. It returns a mutateAsync function that opens the wallet prompt, collects the signature, submits the transaction, and waits for confirmation.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'In the TradePanel, why is fairPrice computed with useMemo rather than calculated inline?',
      options: [
        'useMemo makes the value available to child components',
        'Inline calculations are not allowed in React function components',
        'computeSviPrice is math-heavy; useMemo prevents recalculating on every render when inputs haven\'t changed',
        'useMemo is required to use the value in JSX',
      ],
      correctAnswer: 2,
      explanation: 'computeSviPrice involves SVI evaluation with logarithms and square roots — relatively expensive math. useMemo caches the result and only recomputes when sviData, strike, or direction actually change, preventing unnecessary work on unrelated re-renders.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What determines whether the TradePanel shows a "Create Account" button vs. an active mint button?',
      options: [
        'Whether the wallet is connected',
        'Whether useManager returns a non-null manager',
        'Whether the oracle status is "active"',
        'Whether the DUSDC balance exceeds zero',
      ],
      correctAnswer: 1,
      explanation: 'The useManager hook checks on-chain whether the connected wallet has a PredictManager. If manager is null, the UI shows "Create Account" (calling createManagerTx). If a manager exists, the full trade form with the mint button is rendered.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// React Integration Patterns — Practice
// Build the hooks and components that power a DeepBook Predict trading UI.

// ─── Type Stubs ───
interface Oracle {
  id: string;
  feedName: string;
  status: 'active' | 'settled' | 'expired';
  expiry: number;
}

interface SviData {
  a: number;
  b: number;
  rho: number;
  m: number;
  sigma: number;
  forwardPrice: number;
  timeToExpiry: number;
}

// ─── Mock Functions (simulate API and pricing) ───
async function fetchOraclesFromApi(): Promise<Oracle[]> {
  return [
    { id: 'oracle-1', feedName: 'SUI/USD', status: 'active', expiry: Date.now() + 86400000 },
    { id: 'oracle-2', feedName: 'BTC/USD', status: 'active', expiry: Date.now() + 86400000 },
    { id: 'oracle-3', feedName: 'ETH/USD', status: 'settled', expiry: Date.now() - 3600000 },
  ];
}

async function fetchSviFromApi(oracleId: string): Promise<SviData> {
  return {
    a: 0.04, b: 0.1, rho: -0.3, m: 0.0, sigma: 0.5,
    forwardPrice: 3.50, timeToExpiry: 0.0833,
  };
}

function computeSviPrice(svi: SviData, strike: number, direction: 'UP' | 'DOWN'): number {
  // Simplified mock: returns a value between 0 and 1
  const moneyness = Math.log(strike / svi.forwardPrice);
  const variance = svi.a + svi.b * (svi.rho * moneyness + Math.sqrt(moneyness * moneyness + svi.sigma * svi.sigma));
  const price = direction === 'UP' ? 0.55 : 0.45;
  return Math.max(0.01, Math.min(0.99, price));
}

async function mintPositionTx(managerId: string, oracleId: string, quantity: number): Promise<{ digest: string }> {
  return { digest: '0xabc123_mock_digest' };
}

// ─── Minimal React-like Hooks (for practice environment) ───
type SetState<T> = (value: T | ((prev: T) => T)) => void;
type CleanupFn = () => void;

let _stateStore: Record<string, unknown> = {};
let _stateCounter = 0;

function useState<T>(initial: T): [T, SetState<T>] {
  const key = 'state_' + _stateCounter++;
  if (!(key in _stateStore)) _stateStore[key] = initial;
  const setState: SetState<T> = (value) => {
    _stateStore[key] = typeof value === 'function' ? (value as (prev: T) => T)(_stateStore[key] as T) : value;
  };
  return [_stateStore[key] as T, setState];
}

function useRef<T>(initial: T): { current: T } {
  return { current: initial };
}

function useCallback<T extends (...args: unknown[]) => unknown>(fn: T, _deps: unknown[]): T {
  return fn;
}

function useEffect(fn: () => CleanupFn | void, _deps: unknown[]): void {
  // In real React, this runs after render. Here it's a no-op stub.
}

function useMemo<T>(fn: () => T, _deps: unknown[]): T {
  return fn();
}

// ─── TODO 1: useOracles Hook ───
// Implement a hook that:
//   1. Uses useState for oracles (Oracle[]) and loading (boolean)
//   2. Creates a fetchOracles async function (wrapped in useCallback)
//      that calls fetchOraclesFromApi() and updates state
//   3. Sets up a useEffect that calls fetchOracles immediately and
//      starts a setInterval with pollInterval
//   4. Derives 'active' array by filtering oracles with status === 'active'
//   5. Returns { oracles, active, loading, refresh: fetchOracles }
function useOracles(pollInterval = 30_000): {
  oracles: Oracle[];
  active: Oracle[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  // Your code here
}

// ─── TODO 2: useFairPrice Hook ───
// Implement a hook that:
//   1. Calls useSviPricing(oracleId) — you can inline it:
//      use useState<SviData | null>(null), useCallback to fetchSviFromApi,
//      and useEffect to fetch on mount
//   2. Uses useMemo to compute the fair price:
//      if sviData is null, return null
//      otherwise return computeSviPrice(sviData, strike, direction)
//   3. Returns { fairPrice: number | null, loading: boolean }
function useFairPrice(
  oracleId: string,
  strike: number,
  direction: 'UP' | 'DOWN'
): { fairPrice: number | null; loading: boolean } {
  // Your code here
}

// ─── TODO 3: useVisibilityAwareInterval Hook ───
// Implement a hook that:
//   1. Uses useRef for intervalRef (null initially) and callbackRef
//   2. Updates callbackRef.current = callback on every call
//   3. Defines start() — creates setInterval if not already running
//   4. Defines stop() — clears interval and sets ref to null
//   5. Defines handleVisibility:
//      - if document.visibilityState === 'visible': call callback, then start()
//      - else: call stop()
//   6. In a useEffect: call start(), add 'visibilitychange' listener,
//      return cleanup that calls stop() and removes listener
function useVisibilityAwareInterval(
  callback: () => void,
  intervalMs: number
): void {
  // Your code here
}

// ─── TODO 4: TradeButton Component (as a function) ───
// Implement a function that simulates a trade button component:
//   1. Takes managerId (string | null), oracleId (string), quantity (number)
//   2. Uses useState for 'minting' (boolean) and 'error' (string | null)
//   3. Defines handleMint async function:
//      - If managerId is null, return early (can't trade without manager)
//      - Set minting = true, error = null
//      - Try: call mintPositionTx(managerId, oracleId, quantity)
//      - Catch: set error to the caught message
//      - Finally: set minting = false
//   4. Returns an object describing the button state:
//      { disabled: boolean, label: string, onMint: handleMint, error }
//      - disabled is true when managerId is null or minting is true
//      - label: 'No Account' if no managerId, 'Minting...' if minting,
//        otherwise 'Mint Position'
function tradeButton(
  managerId: string | null,
  oracleId: string,
  quantity: number
): { disabled: boolean; label: string; onMint: () => Promise<void>; error: string | null } {
  // Your code here
}`,

  solution: `// React Integration Patterns — Solution

// ─── Type Stubs ───
interface Oracle {
  id: string;
  feedName: string;
  status: 'active' | 'settled' | 'expired';
  expiry: number;
}

interface SviData {
  a: number;
  b: number;
  rho: number;
  m: number;
  sigma: number;
  forwardPrice: number;
  timeToExpiry: number;
}

// ─── Mock Functions ───
async function fetchOraclesFromApi(): Promise<Oracle[]> {
  return [
    { id: 'oracle-1', feedName: 'SUI/USD', status: 'active', expiry: Date.now() + 86400000 },
    { id: 'oracle-2', feedName: 'BTC/USD', status: 'active', expiry: Date.now() + 86400000 },
    { id: 'oracle-3', feedName: 'ETH/USD', status: 'settled', expiry: Date.now() - 3600000 },
  ];
}

async function fetchSviFromApi(oracleId: string): Promise<SviData> {
  return {
    a: 0.04, b: 0.1, rho: -0.3, m: 0.0, sigma: 0.5,
    forwardPrice: 3.50, timeToExpiry: 0.0833,
  };
}

function computeSviPrice(svi: SviData, strike: number, direction: 'UP' | 'DOWN'): number {
  const moneyness = Math.log(strike / svi.forwardPrice);
  const variance = svi.a + svi.b * (svi.rho * moneyness + Math.sqrt(moneyness * moneyness + svi.sigma * svi.sigma));
  const price = direction === 'UP' ? 0.55 : 0.45;
  return Math.max(0.01, Math.min(0.99, price));
}

async function mintPositionTx(managerId: string, oracleId: string, quantity: number): Promise<{ digest: string }> {
  return { digest: '0xabc123_mock_digest' };
}

// ─── Minimal React-like Hooks ───
type SetState<T> = (value: T | ((prev: T) => T)) => void;
type CleanupFn = () => void;

let _stateStore: Record<string, unknown> = {};
let _stateCounter = 0;

function useState<T>(initial: T): [T, SetState<T>] {
  const key = 'state_' + _stateCounter++;
  if (!(key in _stateStore)) _stateStore[key] = initial;
  const setState: SetState<T> = (value) => {
    _stateStore[key] = typeof value === 'function' ? (value as (prev: T) => T)(_stateStore[key] as T) : value;
  };
  return [_stateStore[key] as T, setState];
}

function useRef<T>(initial: T): { current: T } {
  return { current: initial };
}

function useCallback<T extends (...args: unknown[]) => unknown>(fn: T, _deps: unknown[]): T {
  return fn;
}

function useEffect(fn: () => CleanupFn | void, _deps: unknown[]): void {
  // No-op stub
}

function useMemo<T>(fn: () => T, _deps: unknown[]): T {
  return fn();
}

// ─── TODO 1: useOracles Hook ───
function useOracles(pollInterval = 30_000): {
  oracles: Oracle[];
  active: Oracle[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOracles = useCallback(async () => {
    try {
      const data = await fetchOraclesFromApi();
      setOracles(data);
    } catch (err) {
      console.error('Failed to fetch oracles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOracles();
    const id = setInterval(fetchOracles, pollInterval);
    return () => clearInterval(id);
  }, [fetchOracles, pollInterval]);

  const active = oracles.filter(o => o.status === 'active');

  return { oracles, active, loading, refresh: fetchOracles };
}

// ─── TODO 2: useFairPrice Hook ───
function useFairPrice(
  oracleId: string,
  strike: number,
  direction: 'UP' | 'DOWN'
): { fairPrice: number | null; loading: boolean } {
  const [sviData, setSviData] = useState<SviData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSvi = useCallback(async () => {
    try {
      const data = await fetchSviFromApi(oracleId);
      setSviData(data);
    } catch (err) {
      console.error('Failed to fetch SVI:', err);
    } finally {
      setLoading(false);
    }
  }, [oracleId]);

  useEffect(() => {
    fetchSvi();
  }, [fetchSvi]);

  const fairPrice = useMemo(() => {
    if (!sviData) return null;
    return computeSviPrice(sviData, strike, direction);
  }, [sviData, strike, direction]);

  return { fairPrice, loading };
}

// ─── TODO 3: useVisibilityAwareInterval Hook ───
function useVisibilityAwareInterval(
  callback: () => void,
  intervalMs: number
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const start = () => {
      if (intervalRef.current !== null) return;
      intervalRef.current = setInterval(
        () => callbackRef.current(),
        intervalMs
      );
    };

    const stop = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}

// ─── TODO 4: TradeButton Component ───
function tradeButton(
  managerId: string | null,
  oracleId: string,
  quantity: number
): { disabled: boolean; label: string; onMint: () => Promise<void>; error: string | null } {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!managerId) return;
    setMinting(true);
    setError(null);

    try {
      await mintPositionTx(managerId, oracleId, quantity);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mint failed';
      setError(message);
    } finally {
      setMinting(false);
    }
  };

  const disabled = managerId === null || minting;
  const label = managerId === null
    ? 'No Account'
    : minting
      ? 'Minting...'
      : 'Mint Position';

  return { disabled, label, onMint: handleMint, error };
}`,

  hints: [
    'For useOracles: create useState for oracles ([]) and loading (true). Wrap fetchOraclesFromApi in an async fetchOracles function with useCallback. In useEffect, call fetchOracles() then setInterval(fetchOracles, pollInterval). Filter active oracles with oracles.filter(o => o.status === "active").',
    'For useFairPrice: use useState<SviData | null>(null) for SVI data. Fetch it with fetchSviFromApi(oracleId) in a useCallback + useEffect. Then useMemo to return computeSviPrice(sviData, strike, direction) only when sviData is not null.',
    'For useVisibilityAwareInterval: use useRef for the interval ID and callback. Define start() that creates setInterval if not running, stop() that clears it. In handleVisibility, check document.visibilityState — "visible" means call callback + start(), otherwise stop(). Set up in useEffect with cleanup.',
    'For tradeButton: useState for minting (false) and error (null). In handleMint, guard on managerId, set minting true, try mintPositionTx, catch errors, finally set minting false. Compute disabled = !managerId || minting, and label based on managerId/minting state.',
  ],
};
