'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../../../contexts/AuthContext';
import MilestoneCard from '../../../components/MilestoneCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Trophy, Lock, Star } from 'lucide-react';
import { apiClient } from '../../../lib/api';

interface EarnedCard {
  id: string;
  tier: 'Clay' | 'Metal' | 'Bronze' | 'Diamond';
  cardImage: string;
  cardBonusUSD: number;
  stakeAmount: number;
  earnedDate: string;
}

export default function MyCardsPage() {
  const { authenticated, ready } = usePrivy();
  const { privyToken } = useAuth();
  const [earnedCards, setEarnedCards] = useState<EarnedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (ready && authenticated) {
      fetchEarnedCards();
    }
  }, [ready, authenticated]);

  const fetchEarnedCards = async () => {
    try {
      if (!privyToken) return;
      
      const data = await apiClient.getUserMilestoneCards(privyToken) as any;
      
      if (data.cards) {
        setEarnedCards(data.cards);
        setTotalValue(data.totalValue || 0);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // All possible milestone cards
  const allCards = [
    { tier: 'Test' as const, threshold: 0.25, cardImage: 'test card.png', bonusExample: 0.02, isTest: true },
    { tier: 'Clay' as const, threshold: 10, cardImage: 'clay.png', bonusExample: 862.39, isTest: false },
    { tier: 'Metal' as const, threshold: 100, cardImage: 'metal.png', bonusExample: 8623.88, isTest: false },
    { tier: 'Bronze' as const, threshold: 1000, cardImage: 'bronze.png', bonusExample: 86238.85, isTest: false },
    { tier: 'Diamond' as const, threshold: 10000, cardImage: 'diamond.png', bonusExample: 862388.48, isTest: false },
  ];

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Please log in to view your milestone cards.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">My Milestone Cards</h1>
          </div>
          <p className="text-gray-400">
            Complete 365-day stakes to earn exclusive milestone cards and bonus rewards!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Cards Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-bold text-white">
                  {earnedCards.length} / {allCards.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Card Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-green-500" />
                <span className="text-3xl font-bold text-green-500">
                  ${totalValue.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Collection Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-bold">
                    {Math.round((earnedCards.length / allCards.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${(earnedCards.length / allCards.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">All Milestone Cards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allCards.map((card) => {
            const earnedCard = earnedCards.find((ec) => ec.tier === card.tier);
            
            return (
              <MilestoneCard
                key={card.tier}
                tier={card.tier}
                cardImage={card.cardImage}
                cardBonusUSD={earnedCard?.cardBonusUSD || card.bonusExample}
                stakeAmount={earnedCard?.stakeAmount || card.threshold}
                earned={!!earnedCard}
                earnedDate={earnedCard?.earnedDate}
              />
            );
          })}
        </div>

        {/* How to Earn */}
        {earnedCards.length === 0 && (
          <Card className="mt-8 bg-gradient-to-br from-yellow-900/20 to-yellow-700/20 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">How to Earn Cards</h3>
                  <p className="text-gray-300 mb-4">
                    Complete a <span className="font-bold text-yellow-500">365-day stake</span> to unlock milestone cards and earn bonus cash rewards!
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">🧪</span>
                      <span><strong>Test:</strong> Stake $0.25 for 7 days (testing only)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">🏺</span>
                      <span><strong>Clay:</strong> Stake $10 - $99 for 365 days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">🔩</span>
                      <span><strong>Metal:</strong> Stake $100 - $999 for 365 days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">🥉</span>
                      <span><strong>Bronze:</strong> Stake $1,000 - $9,999 for 365 days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <span><strong>Diamond:</strong> Stake $10,000 for 365 days</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-yellow-400 font-bold">
                    Card Value = 20% of your profit! (Profit ÷ 5)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

