'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

interface Match {
  id: string;
  sport: 'football' | 'tennis';
  league: string;
  homeTeam: string;
  awayTeam: string;
  player1?: string;
  player2?: string;
  dateEvent: string;
  timeEvent: string;
  venue?: string;
  tournament?: string;
}

interface SelectedMatch extends Match {
  prediction: string;
  odds: number;
  reasoning: string;
}

export default function DailyMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<SelectedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('privy:token');
      const response = await fetch('/api/sports/upcoming-matches', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMatchSelection = (match: Match) => {
    const isSelected = selectedMatches.some((m) => m.id === match.id);

    if (isSelected) {
      setSelectedMatches(selectedMatches.filter((m) => m.id !== match.id));
    } else {
      setSelectedMatches([
        ...selectedMatches,
        {
          ...match,
          prediction: '',
          odds: 0,
          reasoning: '',
        },
      ]);
    }
  };

  const updateMatchDetails = (id: string, field: string, value: string | number) => {
    setSelectedMatches(
      selectedMatches.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const publishEvent = async () => {
    try {
      setPublishing(true);
      const token = localStorage.getItem('privy:token');

      // Validate
      const validMatches = selectedMatches.filter(
        (m) => m.prediction && m.odds > 0 && m.reasoning
      );

      if (validMatches.length === 0) {
        alert('Please add prediction, odds, and reasoning for selected matches');
        return;
      }

      // Create event
      const response = await fetch('/api/admin/create-daily-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matches: validMatches.map((m) => ({
            sport: m.sport,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            player1: m.player1,
            player2: m.player2,
            tournament: m.tournament,
            prediction: m.prediction,
            odds: Number(m.odds),
            reasoning: m.reasoning,
          })),
        }),
      });

      if (response.ok) {
        alert('Daily event published successfully!');
        setSelectedMatches([]);
        navigate('/admin');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      alert('Failed to publish event');
    } finally {
      setPublishing(false);
    }
  };

  const combinedOdds = selectedMatches
    .filter((m) => m.odds > 0)
    .reduce((acc, m) => acc * m.odds, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Create Daily Event</h1>
            <p className="text-blue-300/70">
              Select matches and add verified odds from Bet365
            </p>
          </div>
          <Button onClick={fetchMatches} variant="outline" disabled={loading} className="border-white/20 text-white bg-white/5 hover:bg-white/10">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Matches
          </Button>
        </div>

        {/* Selected Matches Summary */}
        {selectedMatches.length > 0 && (
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-400" />
                Selected Matches: {selectedMatches.length}
              </CardTitle>
              <CardDescription className="text-green-200/70">
                Combined Odds: <span className="text-2xl font-bold text-green-400">
                  {combinedOdds.toFixed(2)}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Available Matches */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-blue-400" />
              Available Matches ({matches.length})
            </CardTitle>
            <CardDescription className="text-blue-200/70">
              Click to select matches, then add odds from Bet365
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-white">Loading matches from TheSportsDB...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-white mb-2">No upcoming matches found</p>
                <p className="text-blue-300/50 text-sm">Try refreshing or check back later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
                  const isSelected = selectedMatches.some((m) => m.id === match.id);
                  const selectedMatch = selectedMatches.find((m) => m.id === match.id);

                  return (
                    <div
                      key={match.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-900/40 border-blue-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleMatchSelection(match)}
                              className="w-5 h-5 rounded"
                              aria-label={`Select ${match.sport === 'football' ? `${match.homeTeam} vs ${match.awayTeam}` : `${match.player1} vs ${match.player2}`}`}
                            />
                            <div>
                              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase">
                                {match.sport}
                              </span>
                              <span className="ml-2 text-blue-300/70 text-sm">
                                {match.league}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-white font-semibold text-lg ml-8">
                            {match.sport === 'football'
                              ? `${match.homeTeam} vs ${match.awayTeam}`
                              : `${match.player1} vs ${match.player2}`}
                          </h3>

                          <p className="text-blue-300/50 text-sm ml-8 mt-1">
                            {new Date(match.dateEvent).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at {match.timeEvent}
                            {match.venue && ` • ${match.venue}`}
                          </p>

                          {/* Selected Match Details */}
                          {isSelected && selectedMatch && (
                            <div className="mt-4 ml-8 space-y-3 p-4 bg-white/5 rounded-lg">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-white">Prediction</Label>
                                  <Input
                                    placeholder="e.g., Man City -2 Handicap"
                                    value={selectedMatch.prediction}
                                    onChange={(e) =>
                                      updateMatchDetails(match.id, 'prediction', e.target.value)
                                    }
                                    className="bg-slate-800/50 border-blue-500/30 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white">Odds</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 1.03"
                                    value={selectedMatch.odds || ''}
                                    onChange={(e) =>
                                      updateMatchDetails(match.id, 'odds', parseFloat(e.target.value))
                                    }
                                    className="bg-slate-800/50 border-blue-500/30 text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-white">Reasoning</Label>
                                <Input
                                  placeholder="e.g., Man City has won 8 of last 10 home games..."
                                  value={selectedMatch.reasoning}
                                  onChange={(e) =>
                                    updateMatchDetails(match.id, 'reasoning', e.target.value)
                                  }
                                  className="bg-slate-800/50 border-blue-500/30 text-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publish Button */}
        {selectedMatches.length > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={publishEvent}
              disabled={publishing}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Daily Event'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


