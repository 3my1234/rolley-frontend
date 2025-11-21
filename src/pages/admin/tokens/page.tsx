'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Coins, TrendingUp, Users, Gift, Settings } from 'lucide-react';

const AIRDROP_REASONS = {
  SIGNUP: 'Signup (500 ROL)',
  FIRST_DEPOSIT: 'First Deposit (1,000 ROL)',
  STAKE_30_COMPLETED: '30-Day Stake Completion (2,000 ROL)',
  STAKE_60_COMPLETED: '60-Day Stake Completion (4,000 ROL)',
  STAKE_180_COMPLETED: '180-Day Stake Completion (10,000 ROL)',
  STAKE_365_COMPLETED: '365-Day Stake Completion (20,000 ROL)',
  REFERRAL: 'Referral (500 ROL)',
  LOYALTY_90_DAYS: '90-Day Loyalty (2,000 ROL)',
};

export default function TokenManagementPage() {
  const [stats] = useState({
    totalDistributed: 0,
    totalRewards: 0,
    totalAirdrops: 0,
    totalConversions: 0,
  });

  const [airdropForm, setAirdropForm] = useState({
    userId: '',
    reason: 'SIGNUP',
  });

  const [conversionRateForm, setConversionRateForm] = useState({
    newRate: '100',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(airdropForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Airdrop sent successfully! ${data.rolAmount} ROL` });
        setAirdropForm({ userId: '', reason: 'SIGNUP' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send airdrop' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send airdrop' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConversionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/token/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          key: 'rol_conversion_rate',
          value: conversionRateForm.newRate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Conversion rate updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update conversion rate' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update conversion rate' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Rolley Token Management</h1>
          <p className="text-gray-300 mt-2">Manage $ROL token distribution, airdrops, and settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDistributed.toLocaleString()} ROL</div>
              <p className="text-xs text-muted-foreground">All-time distribution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stake Rewards</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRewards.toLocaleString()} ROL</div>
              <p className="text-xs text-muted-foreground">From completed stakes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Airdrops</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAirdrops.toLocaleString()} ROL</div>
              <p className="text-xs text-muted-foreground">User incentives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversions.toLocaleString()} ROL</div>
              <p className="text-xs text-muted-foreground">Converted to USDT</p>
            </CardContent>
          </Card>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Send Manual Airdrop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Send Manual Airdrop
              </CardTitle>
              <CardDescription>Manually send ROL tokens to a user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendAirdrop} className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID"
                    value={airdropForm.userId}
                    onChange={(e) => setAirdropForm({ ...airdropForm, userId: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Airdrop Reason</Label>
                  <Select
                    value={airdropForm.reason}
                    onValueChange={(value) => setAirdropForm({ ...airdropForm, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AIRDROP_REASONS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Airdrop'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Update Conversion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Update Conversion Rate
              </CardTitle>
              <CardDescription>Set the ROL to USDT conversion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConversionRate} className="space-y-4">
                <div>
                  <Label htmlFor="newRate">New Rate (1 ROL = X USDT)</Label>
                  <Input
                    id="newRate"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={conversionRateForm.newRate}
                    onChange={(e) => setConversionRateForm({ newRate: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current rate: 1 ROL = 100 USDT
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Update Rate'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Token Contract Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Token Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Name:</span>
                <span className="font-medium">Rolley</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium">ROL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Decimals:</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blockchain:</span>
                <span className="font-medium">Polygon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Supply:</span>
                <span className="font-medium">1,000,000,000 ROL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Address:</span>
                <span className="font-mono text-xs">{import.meta.env.VITE_ROL_TOKEN_ADDRESS || 'Not deployed yet'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






