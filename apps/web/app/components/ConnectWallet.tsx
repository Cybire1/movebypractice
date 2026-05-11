'use client';

import { ConnectButton } from '@mysten/dapp-kit';

export default function ConnectWallet() {
  return (
    <div className="connect-wallet-wrap relative z-50">
      <style>{`
        .connect-wallet-wrap button {
          background: #000 !important;
          color: #fff !important;
          border: none !important;
          border-radius: 9999px !important;
          padding: 0 20px !important;
          height: 36px !important;
          min-height: 0 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          box-shadow: none !important;
          transition: background 0.2s !important;
        }
        .connect-wallet-wrap button:hover {
          background: #27272a !important;
        }
        .connect-wallet-wrap button span,
        .connect-wallet-wrap button div {
          color: #fff !important;
        }
        .connect-wallet-wrap button svg {
          display: none !important;
        }
      `}</style>
      <ConnectButton connectText="Connect Wallet" />
    </div>
  );
}
