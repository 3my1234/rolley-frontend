import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  DollarSign, 
  ArrowRight,
  BarChart3,
  Target,
  Coins
} from 'lucide-react';
import { Button } from '../components/ui/button';
import TermsAcceptanceModal from '../components/TermsAcceptanceModal';
import AnimatedMilestoneCards from '../components/AnimatedMilestoneCards';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, authenticated, ready } = usePrivy();
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 8420,
    totalStaked: 2847650,
    avgReturn: 127,
    activeStakes: 3240
  });

  // All hooks must be called before any conditional returns
  useEffect(() => {
    const accepted = localStorage.getItem('rolley_terms_accepted');
    setTermsAccepted(accepted === 'true');
    
    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('rolley_referral_code', ref);
      setReferralCode(ref);
    }
  }, []);

  useEffect(() => {
    if (authenticated && ready && termsAccepted) {
      navigate('/dashboard');
    }
  }, [authenticated, ready, termsAccepted, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        totalStaked: prev.totalStaked + Math.floor(Math.random() * 1000),
        avgReturn: prev.avgReturn + (Math.random() > 0.5 ? 0.1 : -0.1),
        activeStakes: prev.activeStakes + Math.floor(Math.random() * 2)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  const ensureTermsAccepted = () => {
    const accepted = localStorage.getItem('rolley_terms_accepted');
    if (accepted === 'true') {
      setTermsAccepted(true);
      return true;
    }

    setShowTerms(true);
    return false;
  };

  const handleGetStarted = () => {
    if (authenticated && ready) {
      navigate('/dashboard');
      return;
    }

    if (ensureTermsAccepted()) {
      login();
    }
  };

  const handleLogin = () => {
    console.log('Login button clicked');
    console.log('Privy ready:', ready);
    console.log('Authenticated:', authenticated);
    
    if (authenticated && ready) {
      console.log('Already authenticated, redirecting...');
      navigate('/dashboard');
      return;
    }

    if (!ensureTermsAccepted()) {
      return;
    }

    console.log('Calling Privy login...');
    try {
      login();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please refresh the page and try again.');
    }
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('rolley_terms_accepted', 'true');
    setTermsAccepted(true);
    setShowTerms(false);
    login();
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <img 
                  src="/logo.png" 
                  alt="Rolley" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Rolley</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleLogin}
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 border-0"
              >
                Login
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">AI-Powered Sports</span>
              <br />
              <span className="text-emerald-500">Staking Platform</span>
            </h1>

            <p className="text-xl text-zinc-400 mb-10 max-w-3xl mx-auto">
              Stake on AI-analyzed matches with consistent 1.05x daily returns. 
              Smart algorithms, transparent results, instant payouts.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-medium"
              >
                Start Staking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white px-8 py-6 text-lg"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Stats
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Secure & Transparent</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Instant Withdrawals</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                <span>8,000+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 px-6 border-y border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Users', value: stats.users.toLocaleString(), icon: Users },
              { label: 'Total Staked', value: `$${(stats.totalStaked / 1000).toFixed(1)}k`, icon: DollarSign },
              { label: 'Avg Returns', value: `${stats.avgReturn.toFixed(1)}%`, icon: TrendingUp },
              { label: 'Active Stakes', value: stats.activeStakes.toLocaleString(), icon: BarChart3 }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Rolley?
            </h2>
            <p className="text-xl text-zinc-400">
              Advanced AI meets sports analytics for consistent returns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "AI-Powered Analysis",
                description: "Advanced algorithms analyze thousands of data points to select the safest betting opportunities daily"
              },
              {
                icon: Shield,
                title: "Secure & Transparent",
                description: "Enterprise-grade security with blockchain verification. Every transaction is traceable and transparent"
              },
              {
                icon: Zap,
                title: "Instant Payouts",
                description: "Withdraw your earnings anytime via bank transfer, PayPal, or cryptocurrency wallets"
              },
              {
                icon: TrendingUp,
                title: "Consistent Returns",
                description: "Target 1.05x daily returns with AI-curated match selections and risk management"
              },
              {
                icon: Target,
                title: "Verified Track Record",
                description: "100% transparent results with real-time performance metrics and historical data"
              },
              {
                icon: Coins,
                title: "Multi-Currency",
                description: "Support for USD, USDT, and other cryptocurrencies for global accessibility"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-600/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-zinc-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Create Account", 
                desc: "Sign up with email or connect your wallet in under 30 seconds"
              },
              { 
                step: "02", 
                title: "Deposit Funds", 
                desc: "Add USDT, USD, or your preferred payment method to start staking"
              },
              { 
                step: "03", 
                title: "Start Earning", 
                desc: "AI analyzes and selects matches daily. Watch your balance grow automatically"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-5xl font-bold text-emerald-500 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-zinc-800"></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 text-lg font-medium"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Animated Milestone Cards */}
      <AnimatedMilestoneCards />

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join thousands of users earning consistent returns with AI-powered sports staking
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 text-lg font-medium"
          >
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6">
                <img 
                  src="/logo.png" 
                  alt="Rolley" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">Rolley</span>
            </div>
            <div className="text-sm text-zinc-500">
              © 2025 Rolley. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      <TermsAcceptanceModal
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </div>
  );
}

