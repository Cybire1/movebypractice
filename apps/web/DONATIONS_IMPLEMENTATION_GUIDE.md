# Sui Blockchain Donations - Implementation Guide

This guide will help you implement the donations feature for live classes using the Sui blockchain.

---

## Overview

The donations feature allows students to send SUI tokens to instructors during live classes as tips or appreciation.

### Architecture
```
Student Browser                 API Route                  Sui Blockchain
     │                              │                            │
     ├─ Connect Wallet              │                            │
     ├─ Enter Amount                │                            │
     ├─ Sign Transaction            │                            │
     ├─ Submit ──────────────────>  │                            │
     │                              ├─ Verify Transaction ─────> │
     │                              ├─ Store in Database         │
     │                              └─ Return Confirmation       │
     └─ Show Success                                             │
```

---

## Step 1: Create DonationModal Component

### File: `app/components/classes/DonationModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useSuiClient } from '@mysten/dapp-kit';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorWallet: string;
  classId: string;
  onDonationSuccess?: () => void;
}

export function DonationModal({
  isOpen,
  onClose,
  instructorWallet,
  classId,
  onDonationSuccess,
}: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const handleDonate = async () => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountInMist = Math.floor(parseFloat(amount) * 1_000_000_000);

      // Create transaction
      const tx = new Transaction();

      // Split coins to get exact amount
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);

      // Transfer to instructor
      tx.transferObjects([coin], instructorWallet);

      // Sign and execute transaction
      const result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: currentAccount,
      });

      // Wait for transaction confirmation
      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      // Record donation in database
      await fetch(`/api/classes/${classId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_sui: parseFloat(amount),
          transaction_digest: result.digest,
          message: message || null,
          donor_wallet_address: currentAccount.address,
          recipient_wallet_address: instructorWallet,
        }),
      });

      // Success!
      onDonationSuccess?.();
      onClose();

      // Reset form
      setAmount('');
      setMessage('');
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to send donation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Send Donation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (SUI)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.1"
              min="0.1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum: 0.1 SUI (≈ ${(parseFloat(amount || '0') * 2.5).toFixed(2)} USD)
            </p>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[1, 5, 10, 20].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                {quickAmount} SUI
              </button>
            ))}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the instructor..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Wallet status */}
          {!currentAccount ? (
            <div className="bg-yellow-900/50 border border-yellow-500 rounded p-3">
              <p className="text-yellow-200 text-sm">
                Please connect your Sui wallet to send donations
              </p>
            </div>
          ) : (
            <div className="bg-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Sending from:</p>
              <p className="text-sm text-white font-mono">
                {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDonate}
              disabled={loading || !currentAccount || !amount}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Sending...' : 'Send Donation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 2: Create Donation API Route

### File: `app/api/classes/[id]/donate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { SuiClient } from '@mysten/sui/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: class_id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount_sui,
      transaction_digest,
      message,
      donor_wallet_address,
      recipient_wallet_address,
    } = body;

    // Validate required fields
    if (!amount_sui || !transaction_digest || !donor_wallet_address || !recipient_wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify transaction on Sui blockchain
    const suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });

    let transactionValid = false;
    try {
      const txResponse = await suiClient.getTransactionBlock({
        digest: transaction_digest,
        options: {
          showEffects: true,
          showInput: true,
        },
      });

      // Verify transaction was successful
      transactionValid = txResponse.effects?.status?.status === 'success';
    } catch (err) {
      console.error('Transaction verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid or pending transaction' },
        { status: 400 }
      );
    }

    if (!transactionValid) {
      return NextResponse.json(
        { error: 'Transaction failed or not confirmed' },
        { status: 400 }
      );
    }

    // Store donation in database
    const { data, error } = await supabase
      .from('class_donations')
      .insert({
        class_id,
        donor_id: user.id,
        donor_wallet_address,
        recipient_wallet_address,
        amount_sui,
        transaction_digest,
        message,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to record donation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Donation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Step 3: Create Donation Feed Component

### File: `app/components/classes/DonationFeed.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Database } from '@/app/lib/supabase/database.types';

type Donation = Database['public']['Tables']['class_donations']['Row'];

interface DonationFeedProps {
  classId: string;
}

export function DonationFeed({ classId }: DonationFeedProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchDonations();

    // Subscribe to new donations
    const channel = supabase
      .channel(`donations:${classId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'class_donations',
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          setDonations((prev) => [payload.new as Donation, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from('class_donations')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching donations:', error);
      return;
    }

    setDonations(data || []);
  };

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount_sui), 0);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Donations</h3>
        <div className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-semibold">
          {totalDonations.toFixed(2)} SUI
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {donations.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">
            No donations yet
          </p>
        ) : (
          donations.map((donation) => (
            <div
              key={donation.id}
              className="bg-gray-800 rounded p-3 flex items-start gap-3"
            >
              <div className="text-2xl">💝</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-semibold">
                    {donation.amount_sui} SUI
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(donation.created_at).toLocaleTimeString()}
                  </span>
                </div>
                {donation.message && (
                  <p className="text-sm text-gray-300 break-words">
                    {donation.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 font-mono mt-1">
                  From: {donation.donor_wallet_address.slice(0, 6)}...
                  {donation.donor_wallet_address.slice(-4)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Step 4: Integrate into Class Pages

### Update `app/classes/watch/[id]/page.tsx`

Add donation button and modal:

```typescript
import { DonationModal } from '@/app/components/classes/DonationModal';
import { DonationFeed } from '@/app/components/classes/DonationFeed';

// ... existing code ...

const [showDonationModal, setShowDonationModal] = useState(false);
const [instructorWallet, setInstructorWallet] = useState('');

// Fetch instructor wallet address
useEffect(() => {
  const fetchInstructorWallet = async () => {
    const { data } = await supabase
      .from('classes')
      .select('instructor:users!instructor_id(wallet_address)')
      .eq('id', classId)
      .single();

    if (data?.instructor?.wallet_address) {
      setInstructorWallet(data.instructor.wallet_address);
    }
  };
  fetchInstructorWallet();
}, [classId]);

// Add donation button to actions
<div className="flex gap-2">
  <button
    onClick={raiseHand}
    className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
  >
    ✋ Raise Hand
  </button>

  {instructorWallet && (
    <button
      onClick={() => setShowDonationModal(true)}
      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
    >
      💝 Donate
    </button>
  )}
</div>

{/* Add donation feed in sidebar */}
<DonationFeed classId={classId} />

{/* Add donation modal */}
<DonationModal
  isOpen={showDonationModal}
  onClose={() => setShowDonationModal(false)}
  instructorWallet={instructorWallet}
  classId={classId}
  onDonationSuccess={() => {
    // Optional: Show success toast
  }}
/>
```

---

## Step 5: Update User Profile with Wallet

### Allow users to connect their Sui wallet:

```typescript
// In user profile page or settings
import { ConnectButton } from '@mysten/dapp-kit';

// Save wallet address to user profile
const { data } = await supabase
  .from('users')
  .update({ wallet_address: currentAccount?.address })
  .eq('id', user.id);
```

---

## Testing the Donations Feature

### 1. Set Up Test Wallets
```bash
# Install Sui Wallet extension
# Create 2 test wallets:
# - Wallet A (Instructor)
# - Wallet B (Student)

# Get testnet SUI from faucet:
# https://discord.com/channels/916379725201563759/971488439931392130
```

### 2. Test Flow
```
1. Instructor: Connect Wallet A in profile settings
2. Instructor: Start a test class
3. Student: Connect Wallet B
4. Student: Join the class
5. Student: Click "Donate" button
6. Student: Enter amount and message
7. Student: Sign transaction in Sui wallet
8. Verify:
   ✅ Transaction appears on Sui Explorer
   ✅ Donation appears in feed
   ✅ Total donations updates
   ✅ Instructor receives SUI in wallet
```

---

## Production Considerations

### Security
```typescript
// Verify transactions server-side (already implemented)
// Never trust client-side transaction data
// Always check transaction status on blockchain
```

### Rate Limiting
```typescript
// Add rate limiting to donation API
// Prevent spam donations
// Max 1 donation per minute per user
```

### Gas Fees
```typescript
// Inform users about gas fees (~0.001 SUI per transaction)
// Consider minimum donation amount (e.g., 0.5 SUI)
// to make gas fees reasonable
```

### Error Handling
```typescript
// Handle insufficient balance
// Handle rejected transactions
// Handle network errors
// Provide clear error messages
```

---

## Future Enhancements

### 1. Donation Leaderboard
- Show top donors for each class
- Monthly/all-time leaderboards
- Badges for top contributors

### 2. Donation Goals
- Set fundraising goals for classes
- Progress bar showing goal completion
- Unlock special content when goal reached

### 3. Recurring Donations
- Allow students to set up monthly donations
- Subscription-based class access
- Automatic payment processing

### 4. NFT Rewards
- Mint NFTs for donors above certain threshold
- Special badges/achievements on profile
- Access to exclusive classes

---

## Complete! ✅

You've successfully implemented Sui blockchain donations for live classes. Students can now support instructors with cryptocurrency during classes!

For questions or issues, refer to:
- [Sui TypeScript SDK Docs](https://sdk.mystenlabs.com/typescript)
- [@mysten/dapp-kit Docs](https://sdk.mystenlabs.com/dapp-kit)
- [Sui Explorer](https://suiscan.xyz/)
