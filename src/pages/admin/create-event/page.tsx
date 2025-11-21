'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Trash2, Sparkles } from 'lucide-react';

interface Match {
  id: string;
  sport: 'football' | 'tennis';
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
  sofascoreEventId?: string; // SofaScore Event ID for widget embedding
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      sport: 'football',
      homeTeam: '',
      awayTeam: '',
      prediction: '',
      odds: 0,
      sofascoreEventId: '',
    },
  ]);
  const [generating, setGenerating] = useState(false);

  const addMatch = () => {
    setMatches([
      ...matches,
      {
        id: Date.now().toString(),
        sport: 'football',
        homeTeam: '',
        awayTeam: '',
        prediction: '',
        odds: 0,
        sofascoreEventId: '',
      },
    ]);
  };

  const removeMatch = (id: string) => {
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatch = (id: string, field: string, value: any) => {
    setMatches(
      matches.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const generateAndPublish = async () => {
    try {
      setGenerating(true);

      // Validate
      const validMatches = matches.filter(
        (m) => m.homeTeam && m.awayTeam && m.prediction && m.odds > 0
      );

      if (validMatches.length === 0) {
        alert('Please fill in at least one complete match');
        return;
      }

      // Send to AI for reasoning generation (cookies sent automatically)
      const response = await fetch('/api/admin/generate-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: validMatches }),
      });

      if (response.ok) {
        alert('Daily event created successfully!');
        navigate('/admin');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating event:', error);
      alert('Failed to create event');
    } finally {
      setGenerating(false);
    }
  };

  const combinedOdds = matches
    .filter((m) => m.odds > 0)
    .reduce((acc, m) => acc * m.odds, 1);

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Daily Event</h1>
          <p className="text-purple-200">
            Manually enter today's matches. AI will generate the reasoning automatically.
          </p>
        </div>

        {/* Combined Odds Display */}
        {matches.some((m) => m.odds > 0) && (
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-white">Combined Odds:</span>
                <span className="text-3xl font-bold text-white">
                  {combinedOdds.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matches */}
        <div className="space-y-4">
          {matches.map((match, index) => (
            <Card key={match.id} className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Match {index + 1}</CardTitle>
                  {matches.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMatch(match.id)}
                      className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sport Selection */}
                <div>
                  <Label className="text-purple-200">Sport</Label>
                  <Select
                    value={match.sport}
                    onValueChange={(v) => updateMatch(match.id, 'sport', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Football ⚽</SelectItem>
                      <SelectItem value="tennis">Tennis 🎾</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teams/Players */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">
                      {match.sport === 'football' ? 'Home Team' : 'Player 1'}
                    </Label>
                    <Input
                      placeholder={
                        match.sport === 'football' ? 'e.g., Manchester City' : 'e.g., Novak Djokovic'
                      }
                      value={match.homeTeam}
                      onChange={(e) => updateMatch(match.id, 'homeTeam', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">
                      {match.sport === 'football' ? 'Away Team' : 'Player 2'}
                    </Label>
                    <Input
                      placeholder={
                        match.sport === 'football' ? 'e.g., Everton' : 'e.g., Carlos Alcaraz'
                      }
                      value={match.awayTeam}
                      onChange={(e) => updateMatch(match.id, 'awayTeam', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                </div>

                {/* Prediction & Odds */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Prediction</Label>
                    <Input
                      placeholder="e.g., Man City -2 Handicap"
                      value={match.prediction}
                      onChange={(e) => updateMatch(match.id, 'prediction', e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-purple-300/50"
                    />
                    <p className="text-xs text-purple-300/70 mt-1">
                      Examples: "Man City -2 Handicap", "Over 2.5 Goals", "Djokovic Set 1"
                    </p>
                  </div>
                  <div>
                    <Label className="text-purple-200">Odds</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.03"
                      value={match.odds || ''}
                      onChange={(e) =>
                        updateMatch(match.id, 'odds', parseFloat(e.target.value) || 0)
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-purple-300/50"
                    />
                    <p className="text-xs text-purple-300/70 mt-1">
                      Target: 1.01 - 1.04 (safe odds)
                    </p>
                  </div>
                </div>

                {/* SofaScore Event ID (for verification link) */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Label className="text-blue-300 mb-2 block text-sm">
                    🔗 SofaScore Event ID (Optional)
                  </Label>
                  <Input
                    placeholder="13233640"
                    value={match.sofascoreEventId || ''}
                    onChange={(e) => updateMatch(match.id, 'sofascoreEventId', e.target.value)}
                    className="bg-white/5 border-blue-500/30 text-white placeholder:text-blue-300/50 text-sm"
                  />
                  <p className="text-xs text-blue-300/70 mt-1">
                    💡 From URL: sofascore.com/match/.../13233640
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Match Button */}
        <Button
          onClick={addMatch}
          variant="outline"
          className="w-full border-blue-500/30 text-white bg-white/5 hover:bg-white/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Match
        </Button>

        {/* Generate & Publish */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="flex-1 border-white/20 text-white bg-white/5 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={generateAndPublish}
            disabled={generating || !matches.some((m) => m.homeTeam && m.odds > 0)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI Generating Reasoning...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate & Publish Event
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <Card className="bg-blue-500/10 border-blue-400/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-sm">How it works:</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 text-sm space-y-2">
            <p>1. Scout matches yourself from Bet365, FlashScore, etc.</p>
            <p>2. Enter the teams, prediction, and odds here</p>
            <p>3. Click "Generate & Publish"</p>
            <p>
              4. AI will automatically generate professional reasoning explaining why these odds
              are safe
            </p>
            <p className="text-green-300 font-semibold mt-3">
              ✨ No API needed! Full manual control with AI assistance!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

