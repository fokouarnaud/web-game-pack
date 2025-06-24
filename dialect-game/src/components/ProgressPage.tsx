/**
 * Progress Page with Phase 3 Integration
 * Comprehensive progress tracking using ProgressTracker component
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Settings,
  Trophy,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressTracker from './ProgressTracker';
import { BreadcrumbNavigation } from './core/navigation/Navigation';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Home', path: '/', isActive: false },
    { label: 'Progress', path: '/progress', isActive: true }
  ];

  const handleGoalSet = (type: 'weekly' | 'monthly', value: number) => {
    console.log(`Setting ${type} goal to ${value}`);
    // Implement goal setting logic
  };

  const handleExportProgress = () => {
    console.log('Exporting progress data...');
    // Implement progress export functionality
  };

  const handleShareProgress = () => {
    console.log('Sharing progress...');
    // Implement social sharing functionality
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/lessons')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lessons
              </Button>
              
              <BreadcrumbNavigation 
                items={breadcrumbItems}
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportProgress}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareProgress}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Learning Progress</h1>
              <p className="text-muted-foreground">
                Track your achievements, set goals, and monitor your dialect learning journey
              </p>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/lessons')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Continue Learning</div>
                    <div className="text-sm text-muted-foreground">Resume your lessons</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/achievements')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold">View Achievements</div>
                    <div className="text-sm text-muted-foreground">See your badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/goals')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Set New Goals</div>
                    <div className="text-sm text-muted-foreground">Plan your learning</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Tracker Component */}
        <ProgressTracker 
          onSetGoal={handleGoalSet}
          className="space-y-8"
        />

        {/* Additional Insights */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Learning Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-sm">Peak Learning Time</div>
                    <div className="text-sm text-muted-foreground">
                      You learn best between 2-4 PM. Consider scheduling lessons during this time.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-sm">Strength Area</div>
                    <div className="text-sm text-muted-foreground">
                      You excel at conversation practice. Keep building on this strength!
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-sm">Improvement Opportunity</div>
                    <div className="text-sm text-muted-foreground">
                      Focus more on pronunciation exercises to boost your overall accuracy.
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Get Detailed Report
              </Button>
            </CardContent>
          </Card>

          {/* Social Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Success
              </CardTitle>
              <CardDescription>
                Celebrate your achievements with friends and family
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">7-Day Streak!</div>
                <div className="text-sm text-muted-foreground mb-4">
                  You've been learning consistently for a week. Amazing progress!
                </div>
                <Badge variant="secondary" className="mb-4">
                  🔥 Week Warrior Achievement
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={handleShareProgress}>
                  Share on Social
                </Button>
                <Button variant="outline" size="sm">
                  Generate Certificate
                </Button>
              </div>
              
              <div className="text-center">
                <Button variant="link" size="sm">
                  Invite Friends to Learn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Learning Tips</CardTitle>
            <CardDescription>
              Maximize your dialect learning with these proven strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Consistency is Key</h4>
                <p className="text-sm text-muted-foreground">
                  Practice for 15-20 minutes daily rather than long sessions once a week.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Use Real Contexts</h4>
                <p className="text-sm text-muted-foreground">
                  Try to use what you learn in real conversations with native speakers.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Review Regularly</h4>
                <p className="text-sm text-muted-foreground">
                  Revisit completed lessons to reinforce your learning and improve retention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;