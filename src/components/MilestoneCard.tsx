'use client';

import { Card, CardContent } from './ui/card';

interface MilestoneCardProps {
  tier: 'Test' | 'Clay' | 'Metal' | 'Bronze' | 'Diamond';
  cardImage: string;
  cardBonusUSD: number;
  stakeAmount: number;
  earned?: boolean;
  earnedDate?: string;
}

const CARD_EMOJIS = {
  Test: '🧪',
  Clay: '🏺',
  Metal: '🔩',
  Bronze: '🥉',
  Diamond: '💎',
};

const CARD_COLORS = {
  Test: 'from-green-900 to-green-700',
  Clay: 'from-orange-900 to-orange-700',
  Metal: 'from-gray-600 to-gray-400',
  Bronze: 'from-amber-700 to-amber-500',
  Diamond: 'from-blue-600 to-cyan-400',
};

export default function MilestoneCard({
  tier,
  cardImage,
  cardBonusUSD,
  stakeAmount,
  earned = false,
  earnedDate,
}: MilestoneCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        earned 
          ? 'bg-gradient-to-br ' + CARD_COLORS[tier] + ' border-2 border-yellow-500 shadow-lg shadow-yellow-500/50' 
          : 'bg-gray-800 border-gray-700 opacity-60'
      }`}
    >
      <CardContent className="p-6">
        {/* Tier Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{CARD_EMOJIS[tier]}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{tier} Card</h3>
              <p className="text-sm text-gray-300">
                {earned ? 'Earned' : 'Locked'}
              </p>
            </div>
          </div>
          {earned && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              ✓ EARNED
            </div>
          )}
        </div>

        {/* Card Image */}
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-black/20">
          <img
            src={`/rol cards/${cardImage}`}
            alt={`${tier} Milestone Card`}
            className={`absolute inset-0 h-full w-full object-contain ${!earned ? 'grayscale opacity-40' : ''}`}
            loading="lazy"
          />
          {!earned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-300 text-sm font-medium">Complete to Unlock</p>
              </div>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Stake Amount:</span>
            <span className="text-white font-bold">${stakeAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Card Value:</span>
            <span className="text-yellow-400 font-bold text-lg">
              ${cardBonusUSD.toLocaleString()}
            </span>
          </div>
          {earnedDate && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-600">
              <span className="text-gray-400 text-xs">Earned on:</span>
              <span className="text-gray-300 text-xs">
                {new Date(earnedDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Requirements (if not earned) */}
        {!earned && (
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              Complete a <span className="font-bold text-white">365-day stake</span> of{' '}
              <span className="font-bold text-white">${stakeAmount.toLocaleString()}</span> to unlock
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

