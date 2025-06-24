/**
 * Gaming-Inspired Landing Page
 * Modern 2025 game UI with personality and clear visual hierarchy
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Zap, 
  Trophy,
  Users,
  Star,
  ArrowRight,
  Gamepad2,
  Target,
  Flame,
  Sparkles,
  Crown,
  Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LandingPageGamingProps {
  onGetStarted?: () => void;
}

export const LandingPageGaming: React.FC<LandingPageGamingProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const [currentStat, setCurrentStat] = useState(0);
  const [glowActive, setGlowActive] = useState(false);

  const gamingStats = [
    { number: "50K+", label: "PLAYERS ONLINE", color: "text-green-400" },
    { number: "15", label: "DIALECT WORLDS", color: "text-blue-400" },
    { number: "98%", label: "SUCCESS RATE", color: "text-purple-400" }
  ];

  const powerUps = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "VOICE BOOST",
      description: "AI-powered pronunciation training",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "SMART AIM",
      description: "Adaptive lesson targeting",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: "ACHIEVEMENT HUNTER",
      description: "Unlock badges and rewards",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % gamingStats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowActive(true);
      setTimeout(() => setGlowActive(false), 1000);
    }, 3000);
    return () => clearInterval(glowInterval);
  }, []);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/lessons');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              {/* Gaming Badge */}
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  LEVEL UP YOUR LANGUAGE
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Main Title */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    MASTER
                  </span>
                  <br />
                  <span className="text-white">DIALECTS</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    LIKE A PRO
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  🎮 Epic language adventures await! Master dialects through 
                  <span className="text-yellow-400 font-semibold"> gamified learning</span>, 
                  unlock achievements, and dominate the leaderboards!
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className={`
                    relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 
                    hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg px-8 py-4 
                    transform hover:scale-105 transition-all duration-300 shadow-2xl
                    ${glowActive ? 'shadow-yellow-500/50 shadow-2xl' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-6 w-6" />
                    START QUEST NOW
                    <Rocket className="h-5 w-5" />
                  </div>
                  {glowActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse"></div>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/demo')}
                  className="
                    border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 
                    font-bold text-lg px-8 py-4 hover:border-purple-400 transition-all duration-300
                  "
                >
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  TRY DEMO
                </Button>
              </div>

              {/* Live Stats */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="grid grid-cols-3 gap-6">
                  {gamingStats.map((stat, index) => (
                    <div 
                      key={index} 
                      className={`text-center transform transition-all duration-500 ${
                        currentStat === index ? 'scale-110' : 'opacity-70'
                      }`}
                    >
                      <div className={`text-3xl font-black ${stat.color}`}>
                        {stat.number}
                      </div>
                      <div className="text-gray-400 text-sm font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Visual - Game UI Mockup */}
            <div className="relative">
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-700">
                {/* Main Game Panel */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <CardTitle className="text-lg font-bold">LEVEL 3 - CONVERSATION MASTER</CardTitle>
                      </div>
                      <Badge className="bg-yellow-500 text-black font-bold">
                        <Crown className="h-4 w-4 mr-1" />
                        ELITE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">XP Progress</span>
                      <span className="text-yellow-400 font-bold">2,840 / 3,000</span>
                    </div>
                    <Progress value={95} className="h-4 bg-gray-700" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                        <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-green-400 font-bold">12 WINS</div>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                        <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                        <div className="text-blue-400 font-bold">7 STREAK</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Achievement */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full p-3 animate-bounce shadow-xl">
                  <Trophy className="h-6 w-6" />
                </div>

                {/* Floating Level Up */}
                <div className="absolute -bottom-6 -left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 animate-pulse shadow-xl">
                  <div className="text-sm font-bold">+500 XP BONUS!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Power-ups Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              CHOOSE YOUR 
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}POWER-UPS
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Unlock special abilities to accelerate your learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {powerUps.map((powerUp, index) => (
              <Card 
                key={index} 
                className={`
                  group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 
                  border-2 ${powerUp.borderColor} hover:border-opacity-80 transition-all duration-300 
                  hover:transform hover:scale-105 hover:shadow-2xl cursor-pointer
                `}
              >
                <div className={`absolute inset-0 ${powerUp.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <CardContent className="relative z-10 p-8 text-center">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${powerUp.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {powerUp.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{powerUp.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {powerUp.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black text-white">
              READY TO 
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}DOMINATE?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of players already mastering dialects. 
              <span className="text-yellow-400 font-semibold"> Your epic language journey starts now!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="
                  bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 
                  text-black font-bold text-xl px-12 py-6 transform hover:scale-110 transition-all duration-300 
                  shadow-2xl shadow-yellow-500/30 border-2 border-yellow-400
                "
              >
                <div className="flex items-center gap-3">
                  <Play className="h-6 w-6" />
                  ENTER THE ARENA
                  <ArrowRight className="h-6 w-6" />
                </div>
              </Button>
              
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="h-5 w-5" />
                <span className="text-sm">50,000+ players online</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-x-4">
              <span>✓ Free to start</span>
              <span>✓ No downloads</span>
              <span>✓ Instant play</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageGaming;