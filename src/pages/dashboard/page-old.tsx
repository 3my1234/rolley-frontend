'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Wallet, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function DashboardPage() {
  const { getAccessToken } = usePrivy();
  const [user, setUser] = useState<any>(null);
  const [stakes, setStakes] = useState<any[]>([]);
  const [dailyEvent, setDailyEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createStakeOpen, setCreateStakeOpen] = useState(false);
  const [stakeForm, setStakeForm] = useState({
    amount: '10',
    currency: 'USD',
    period: 'THIRTY_DAYS',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, stakesRes, eventRes] = await Promise.all([
        axios.get('/api/auth/user', { headers }),
        axios.get('/api/stakes/list', { headers }),
        axios.get('/api/daily-events/current', { headers }),
      ]);

      setUser(userRes.data.user);
      setStakes(stakesRes.data.stakes);
      setDailyEvent(eventRes.data.dailyEvent);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStake = async () => {
    try {
      const token = await getAccessToken();
      await axios.post(
        '/api/stakes/create',
        stakeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateStakeOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create stake');
    }
  };

  const handleParticipate = async (stakeId: string, participate: boolean) => {
    try {
      const token = await getAccessToken();
      await axios.post(
        '/api/stakes/participate',
        { stakeId, dailyEventId: dailyEvent.id, participate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to participate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeStakes = stakes.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your staking overview.</p>
        </div>
        <Dialog open={createStakeOpen} onOpenChange={setCreateStakeOpen}>
          <DialogTrigger asChild>
            <Button size="lg">Create New Stake</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Stake</DialogTitle>
              <DialogDescription>
                Choose your stake amount, currency, and period
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount</Label>
                <Select value={stakeForm.amount} onValueChange={(v) => setStakeForm({ ...stakeForm, amount: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 100, 1000, 10000, 100000, 1000000].map((amt) => (
                      <SelectItem key={amt} value={amt.toString()}>
                        {formatCurrency(amt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={stakeForm.currency} onValueChange={(v) => setStakeForm({ ...stakeForm, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Period</Label>
                <Select value={stakeForm.period} onValueChange={(v) => setStakeForm({ ...stakeForm, period: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                    <SelectItem value="SIXTY_DAYS">60 Days</SelectItem>
                    <SelectItem value="ONE_EIGHTY_DAYS">180 Days</SelectItem>
                    <SelectItem value="THREE_SIXTY_FIVE_DAYS">365 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateStake} className="w-full">
                Create Stake
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">USD Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user?.usdBalance || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">USDT Balance</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user?.usdtBalance || 0, 'USDT')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Stakes</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStakes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Staked</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                activeStakes.reduce((acc, s) => acc + s.currentAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Event */}
      {dailyEvent && activeStakes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Event - {formatDate(new Date(dailyEvent.date))}</CardTitle>
            <CardDescription>
              AI-selected matches with {dailyEvent.totalOdds}x odds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyEvent.matches.map((match: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium text-primary uppercase">{match.sport}</span>
                      <h4 className="font-bold mt-1">
                        {match.homeTeam && match.awayTeam
                          ? `${match.homeTeam} vs ${match.awayTeam}`
                          : `${match.player1} vs ${match.player2}`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{match.prediction}</p>
                      <p className="text-xs text-gray-500 mt-2">{match.reasoning}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{match.odds}</div>
                      <div className="text-xs text-gray-500">odds</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <h5 className="font-semibold mb-3">Participate with your stakes:</h5>
                <div className="space-y-2">
                  {activeStakes.map((stake) => {
                    const hasResponded = stake.dailyParticipations.some(
                      (p: any) => p.dailyEventId === dailyEvent.id
                    );
                    return (
                      <div
                        key={stake.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {formatCurrency(stake.currentAmount, stake.currency)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Day {stake.daysCompleted + 1} of {stake.totalDays}
                          </div>
                        </div>
                        {hasResponded ? (
                          <span className="text-sm text-gray-500">Responded</span>
                        ) : (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleParticipate(stake.id, false)}
                            >
                              Skip
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleParticipate(stake.id, true)}
                            >
                              Participate
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Stakes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Active Stakes</h2>
        {activeStakes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No active stakes. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeStakes.map((stake) => (
              <Card key={stake.id}>
                <CardHeader>
                  <CardTitle>{formatCurrency(stake.currentAmount, stake.currency)}</CardTitle>
                  <CardDescription>
                    Started: {formatDate(new Date(stake.startDate))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Initial Amount:</span>
                      <span className="font-medium">{formatCurrency(stake.initialAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Profit:</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(stake.totalProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">
                        {stake.daysCompleted} / {stake.totalDays} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participated:</span>
                      <span className="font-medium">{stake.daysParticipated} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(stake.daysCompleted / stake.totalDays) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


