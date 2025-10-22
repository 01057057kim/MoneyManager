import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { DollarSign, Clock, Users, BarChart3 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Money Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Manage Your Money, Time & Team
            <span className="block text-blue-400">All in One Place</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Replace messy spreadsheets and disconnected tools with a single, clear, and reliable platform for handling both personal and shared finances.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need to Manage Finances
          </h2>
          <p className="text-slate-300 text-lg">
            From personal budgeting to team collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Financial Tracking</h3>
              <p className="text-slate-300">
                Track income, expenses, and budgets with automatic calculations and insights.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Time Management</h3>
              <p className="text-slate-300">
                Shared calendars and task management to keep everyone organized and on track.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-slate-300">
                Work together with shared workspaces, roles, and transparent financial relationships.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
              <p className="text-slate-300">
                Get insights with live dashboards, spending patterns, and financial health metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800/30 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-300 mb-8">
              Join thousands of users who have simplified their financial management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Create Your Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
