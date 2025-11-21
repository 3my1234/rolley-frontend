'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Wallet, TrendingUp, Calendar, DollarSign, Sparkles, Zap, Target } from 'lucide-react';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-200 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const activeStakes = stakes.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-blue-300/70">Welcome back! Here's your staking overview.</p>
          </div>
          <Dialog open={createStakeOpen} onOpenChange={setCreateStakeOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create New Stake
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-blue-500/30">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Create New Stake</DialogTitle>
                <DialogDescription className="text-blue-300/70">
                  Choose your stake amount, currency, and period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Amount</Label>
                  <Select value={stakeForm.amount} onValueChange={(v) => setStakeForm({ ...stakeForm, amount: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-500/30">
                      {[10, 100, 1000, 10000, 100000, 1000000].map((amt) => (
                        <SelectItem key={amt} value={amt.toString()} className="text-white">
                          {formatCurrency(amt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Currency</Label>
                  <Select value={stakeForm.currency} onValueChange={(v) => setStakeForm({ ...stakeForm, currency: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-500/30">
                      <SelectItem value="USD" className="text-white">USD</SelectItem>
                      <SelectItem value="USDT" className="text-white">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Period</Label>
                  <Select value={stakeForm.period} onValueChange={(v) => setStakeForm({ ...stakeForm, period: v })}>
                    <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-blue-500/30">
                      <SelectItem value="THIRTY_DAYS" className="text-white">30 Days</SelectItem>
                      <SelectItem value="SIXTY_DAYS" className="text-white">60 Days</SelectItem>
                      <SelectItem value="ONE_EIGHTY_DAYS" className="text-white">180 Days</SelectItem>
                      <SelectItem value="THREE_SIXTY_FIVE_DAYS" className="text-white">365 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateStake} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Stake
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: DollarSign, title: 'USD Balance', value: formatCurrency(user?.usdBalance || 0), gradient: 'from-blue-500 to-cyan-500' },
            { icon: Wallet, title: 'USDT Balance', value: formatCurrency(user?.usdtBalance || 0, 'USDT'), gradient: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, title: 'Active Stakes', value: activeStakes.length, gradient: 'from-pink-500 to-orange-500' },
            { icon: Calendar, title: 'Total Staked', value: formatCurrency(activeStakes.reduce((acc, s) => acc + s.currentAmount, 0)), gradient: 'from-orange-500 to-yellow-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200/70">{stat.title}</CardTitle>
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Today's Event */}
        {dailyEvent && activeStakes.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-blue-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-white text-2xl">Today's Event - {formatDate(new Date(dailyEvent.date))}</CardTitle>
                </div>
                <CardDescription className="text-blue-200/70">
                  AI-selected matches with {dailyEvent.totalOdds}x odds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyEvent.matches.map((match: any, i: number) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-xs font-medium text-blue-400 uppercase">{match.sport}</span>
                          <h4 className="font-bold text-white mt-1 text-lg">
                            {match.homeTeam && match.awayTeam
                              ? `${match.homeTeam} vs ${match.awayTeam}`
                              : `${match.player1} vs ${match.player2}`}
                          </h4>
                          <p className="text-sm text-blue-200/70 mt-1">{match.prediction}</p>
                          <p className="text-xs text-blue-300/50 mt-2">{match.reasoning}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{match.odds}</div>
                          <div className="text-xs text-blue-300/70">odds</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-white/10">
                    <h5 className="font-semibold text-white mb-3 flex items-center">
                      <Target className="mr-2 h-5 w-5 text-blue-400" />
                      Participate with your stakes:
                    </h5>
                    <div className="space-y-2">
                      {activeStakes.map((stake) => {
                        const hasResponded = stake.dailyParticipations.some(
                          (p: any) => p.dailyEventId === dailyEvent.id
                        );
                        return (
                          <div
                            key={stake.id}
                            className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                          >
                            <div>
                              <div className="font-medium text-white text-lg">
                                {formatCurrency(stake.currentAmount, stake.currency)}
                              </div>
                              <div className="text-sm text-blue-300/70">
                                Day {stake.daysCompleted + 1} of {stake.totalDays}
                              </div>
                            </div>
                            {hasResponded ? (
                              <span className="text-sm text-green-400 font-medium">✓ Responded</span>
                            ) : (
                              <div className="space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleParticipate(stake.id, false)}
                                  className="border-white/20 text-white bg-white/5 hover:bg-white/10"
                                >
                                  Skip
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleParticipate(stake.id, true)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
          </motion.div>
        )}

        {/* Active Stakes */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="mr-3 h-8 w-8 text-blue-400" />
            Your Active Stakes
          </h2>
          {activeStakes.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="py-16 text-center">
                <Sparkles className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-200/70 text-lg">No active stakes. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeStakes.map((stake, index) => (
                <motion.div
                  key={stake.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-300 group">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">{formatCurrency(stake.currentAmount, stake.currency)}</CardTitle>
                      <CardDescription className="text-blue-200/70">
                        Started: {formatDate(new Date(stake.startDate))}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-300/70">Initial Amount:</span>
                          <span className="font-medium text-white">{formatCurrency(stake.initialAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-300/70">Total Profit:</span>
                          <span className="font-medium text-green-400">
                            +{formatCurrency(stake.totalProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-300/70">Progress:</span>
                          <span className="font-medium text-white">
                            {stake.daysCompleted} / {stake.totalDays} days
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-300/70">Participated:</span>
                          <span className="font-medium text-white">{stake.daysParticipated} days</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 group-hover:from-blue-400 group-hover:to-purple-400"
                            style={{ width: `${(stake.daysCompleted / stake.totalDays) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

