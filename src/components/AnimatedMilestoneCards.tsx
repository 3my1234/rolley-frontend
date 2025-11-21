import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MilestoneCard {
  id: string;
  name: string;
  emoji: string;
  image: string;
  stakeAmount: number;
  cardBonus: number;
  duration: string;
  description: string;
  features: string[];
  color: string;
  gradient: string;
  bgImage: string;
}

const milestoneCards: MilestoneCard[] = [
  {
    id: 'test',
    name: 'Test Card',
    emoji: '🧪',
    image: '/rol cards/test card.png',
    stakeAmount: 0.25,
    cardBonus: 0.02,
    duration: '7 days',
    description: 'Perfect entry point to experience the system',
    features: ['Low risk investment', 'Quick 7-day cycle', 'System familiarization', 'Risk-free testing'],
    color: 'from-zinc-800 to-zinc-700',
    gradient: 'from-zinc-800/20 to-zinc-700/20',
    bgImage: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)'
  },
  {
    id: 'clay',
    name: 'Clay Card',
    emoji: '🏺',
    image: '/rol cards/clay.png',
    stakeAmount: 10,
    cardBonus: 862.39,
    duration: '365 days',
    description: 'Foundation of your wealth-building journey',
    features: ['8,620% return on investment', 'Daily compounding growth', 'Risk-free guaranteed returns', 'Foundation building'],
    color: 'from-zinc-800 to-zinc-700',
    gradient: 'from-zinc-800/20 to-zinc-700/20',
    bgImage: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)'
  },
  {
    id: 'metal',
    name: 'Metal Card',
    emoji: '🔩',
    image: '/rol cards/metal.png',
    stakeAmount: 100,
    cardBonus: 8623.88,
    duration: '365 days',
    description: 'Serious investment for serious returns',
    features: ['86,240% return on investment', 'Premium support access', 'Priority processing', 'Advanced analytics'],
    color: 'from-zinc-800 to-zinc-700',
    gradient: 'from-zinc-800/20 to-zinc-700/20',
    bgImage: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)'
  },
  {
    id: 'bronze',
    name: 'Bronze Card',
    emoji: '🥉',
    image: '/rol cards/bronze.png',
    stakeAmount: 1000,
    cardBonus: 86238.85,
    duration: '365 days',
    description: 'Premium tier for high-value investors',
    features: ['86,239% return on investment', 'VIP support access', 'Exclusive events', 'Personal advisor'],
    color: 'from-zinc-800 to-zinc-700',
    gradient: 'from-zinc-800/20 to-zinc-700/20',
    bgImage: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)'
  },
  {
    id: 'diamond',
    name: 'Diamond Card',
    emoji: '💎',
    image: '/rol cards/diamond.png',
    stakeAmount: 10000,
    cardBonus: 862388.48,
    duration: '365 days',
    description: 'Elite tier for maximum wealth creation',
    features: ['862,388% return on investment', 'Personal wealth advisor', 'White-glove service', 'Exclusive networking'],
    color: 'from-zinc-800 to-zinc-700',
    gradient: 'from-zinc-800/20 to-zinc-700/20',
    bgImage: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)'
  }
];

export default function AnimatedMilestoneCards() {
  const [activeCard, setActiveCard] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLearnMore = (cardId: string) => {
    setShowDetails(showDetails === cardId ? null : cardId);
  };

  return (
    <section ref={containerRef} className="py-32 px-6 bg-black relative overflow-hidden">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          display: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          display: none !important;
        }
      `}</style>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Milestone Cards
          </h2>
          <p className="text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed">
            Transform your financial future with our revolutionary milestone system. 
            Each card represents a different level of commitment and reward.
          </p>
        </motion.div>

        {/* Tesla-style Horizontal Scroll Container */}
        <div className="relative">
          {/* Main Card Display */}
          <div className="relative h-[700px] mb-16 scrollbar-hide">
            {milestoneCards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                  index === activeCard ? 'z-20' : 'z-10'
                }`}
                initial={{ opacity: 0, x: index * 100 }}
                animate={{
                  opacity: index === activeCard ? 1 : 0.3,
                  x: index === activeCard ? 0 : (index - activeCard) * 50,
                  scale: index === activeCard ? 1 : 0.8,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.div
                  className={`relative w-full max-w-5xl mx-auto p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden`}
                  style={{ background: card.bgImage }}
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Card Info */}
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-6xl">{card.emoji}</div>
                          <div>
                            <h3 className="text-4xl font-bold text-white">{card.name}</h3>
                            <p className="text-xl text-white/80">{card.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="text-3xl font-bold text-emerald-400 mb-2">${card.stakeAmount.toLocaleString()}</div>
                          <div className="text-sm text-white/70">Initial Stake</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="text-3xl font-bold text-cyan-400 mb-2">${card.cardBonus.toLocaleString()}</div>
                          <div className="text-sm text-white/70">Total Bonus</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-white">Key Benefits:</h4>
                        <ul className="space-y-2">
                          {card.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center space-x-3 text-white/80">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Learn More Button */}
                      <motion.button
                        className="w-full bg-white text-black font-semibold py-4 px-8 rounded-2xl hover:bg-white/90 transition-all duration-300 flex items-center justify-center space-x-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLearnMore(card.id)}
                      >
                        <span>Learn More</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Right Side - Card Visual */}
                    <div className="relative">
                      <div className="relative w-full h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 backdrop-blur-sm overflow-hidden">
                        {/* Card Image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
                <img 
                  src={card.image} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
                          </div>
                        </div>
                        
                        {/* Floating Elements */}
                        <motion.div
                          className="absolute top-8 right-8 w-16 h-16 bg-emerald-400/30 rounded-full"
                          animate={{
                            y: [0, -20, 0],
                            rotate: [0, 180, 360],
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute bottom-8 left-8 w-12 h-12 bg-cyan-400/30 rounded-full"
                          animate={{
                            y: [0, 20, 0],
                            rotate: [0, -180, -360],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4 mb-16">
            {milestoneCards.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveCard(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === activeCard
                    ? 'bg-emerald-400 scale-125'
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Card Preview Strip */}
          <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {milestoneCards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`flex-shrink-0 w-64 p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  index === activeCard
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
                }`}
                onClick={() => setActiveCard(index)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center space-y-4">
                  <div className="text-4xl">{card.emoji}</div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{card.name}</h4>
                    <p className="text-sm text-zinc-400 mb-3">{card.description}</p>
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-semibold">${card.stakeAmount.toLocaleString()}</div>
                      <div className="text-cyan-400 font-semibold">${card.cardBonus.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Information Modal */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-zinc-900 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-zinc-700 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const card = milestoneCards.find(c => c.id === showDetails);
                if (!card) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{card.emoji}</div>
                      <div>
                        <h3 className="text-3xl font-bold text-white">{card.name}</h3>
                        <p className="text-zinc-400">{card.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800 rounded-xl p-4">
                        <div className="text-2xl font-bold text-emerald-400">${card.stakeAmount.toLocaleString()}</div>
                        <div className="text-sm text-zinc-400">Initial Stake</div>
                      </div>
                      <div className="bg-zinc-800 rounded-xl p-4">
                        <div className="text-2xl font-bold text-cyan-400">${card.cardBonus.toLocaleString()}</div>
                        <div className="text-sm text-zinc-400">Total Bonus</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4">What You Get:</h4>
                      <ul className="space-y-3">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-3 text-zinc-300">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
                      <div className="text-emerald-400 font-semibold mb-2">How It Works:</div>
                      <p className="text-zinc-300 text-sm">
                        Complete a {card.duration} stake with ${card.stakeAmount.toLocaleString()} to unlock this milestone card. 
                        Your bonus of ${card.cardBonus.toLocaleString()} will be automatically distributed to your wallet upon completion.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowDetails(null)}
                      className="w-full bg-emerald-400 text-black font-semibold py-3 px-6 rounded-xl hover:bg-emerald-300 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-xl text-zinc-400 mb-8">
            Start your journey with the <span className="text-emerald-400 font-semibold">Test Card</span> - 
            only $0.25 to experience the system
          </p>
          <div className="inline-flex items-center space-x-4 text-sm text-zinc-500 bg-zinc-900/50 backdrop-blur-sm px-6 py-3 rounded-full border border-zinc-700">
            <span>Bonus Formula:</span>
            <code className="bg-emerald-400/20 text-emerald-400 px-3 py-1 rounded-full">
              Profit ÷ 5 = Bonus
            </code>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
