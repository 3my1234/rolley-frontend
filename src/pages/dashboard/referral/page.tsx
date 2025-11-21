'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, Copy, Check, Gift, TrendingUp } from 'lucide-react';

export default function ReferralPage() {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalEarningsROL, setTotalEarningsROL] = useState(0);
  const [totalEarningsUSD, setTotalEarningsUSD] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      fetchReferralData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  const fetchReferralData = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/user/referral', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setTotalReferrals(data.totalReferrals);
        setTotalEarningsROL(data.totalEarningsROL);
        setTotalEarningsUSD(data.totalEarningsUSD);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
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
              <p className="text-gray-400">Please log in to view your referral dashboard.</p>
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
            <Users className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold">Referral Program</h1>
          </div>
          <p className="text-gray-400">
            Invite friends and earn 100 ROL ($0.10) for each friend who creates their first stake!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                <span className="text-3xl font-bold text-white">
                  {totalReferrals}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">ROL Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-500">
                  {totalEarningsROL.toLocaleString()} ROL
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">USD Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <span className="text-3xl font-bold text-green-500">
                  ${totalEarningsUSD.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="bg-gradient-to-br from-green-900/20 to-green-700/20 border-green-500/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="referral-code-input" className="text-sm text-gray-400 mb-2 block">Referral Code</label>
              <div className="flex gap-2">
                <input
                  id="referral-code-input"
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(referralCode)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="referral-link-input" className="text-sm text-gray-400 mb-2 block">Full Referral Link</label>
              <div className="flex gap-2">
                <input
                  id="referral-link-input"
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(referralLink)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-gray-300">
                💡 <strong>How it works:</strong> Share your referral link with friends. When they create their first stake, 
                you automatically receive <strong>100 ROL ($0.10)</strong> in your wallet!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How Referrals Work */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>How Referrals Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-3xl mb-2">1️⃣</div>
                <h3 className="font-bold text-white mb-2">Share Your Link</h3>
                <p className="text-sm text-gray-400">
                  Copy your unique referral link and share it with friends via social media, email, or messaging apps.
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-3xl mb-2">2️⃣</div>
                <h3 className="font-bold text-white mb-2">Friend Creates Stake</h3>
                <p className="text-sm text-gray-400">
                  Your friend signs up using your link and creates their first stake (any amount, any period).
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-3xl mb-2">3️⃣</div>
                <h3 className="font-bold text-white mb-2">You Earn ROL!</h3>
                <p className="text-sm text-gray-400">
                  You automatically receive 100 ROL ($0.10) in your wallet! No limits on referrals.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-bold text-yellow-500 mb-2">💰 Unlimited Earnings</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 10 referrals = 1,000 ROL ($1.00)</li>
                <li>• 100 referrals = 10,000 ROL ($10.00)</li>
                <li>• 1,000 referrals = 100,000 ROL ($100.00)</li>
                <li>• No limit! Keep referring and earning!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

