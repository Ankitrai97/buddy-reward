import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', name: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(signInData.email, signInData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signUp(signUpData.email, signUpData.password, signUpData.name);
    
    // If signup fails due to existing account, provide helpful message
    if (result.error && result.error.message.includes('already have an account')) {
      // Error is already shown by useAuth, no need to duplicate
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await resetPassword(forgotPasswordEmail);
    setIsLoading(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-3">
            SolarPay Referrals
          </h1>
          <p className="text-lg text-gold font-medium mb-2">by Sunnova</p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Join our exclusive referral program and earn rewards for every successful solar installation you help us achieve.
          </p>
        </div>

        <Card className="card-elevated border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-primary">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Access your referral dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 h-12 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-medium">Sign Up</TabsTrigger>
              </TabsList>
            
              <TabsContent value="signin" className="mt-0">
                {!showForgotPassword ? (
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-foreground font-medium">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-foreground font-medium">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        placeholder="Enter your password"
                        className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl btn-primary font-semibold text-base mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                    </Button>
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-foreground font-medium">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl btn-primary font-semibold text-base mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                    </Button>
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    placeholder="Create a strong password"
                    className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary shadow-soft"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl btn-accent font-semibold text-base mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Your Account'}
                </Button>
              </form>
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Benefits Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Why join our referral program?
          </p>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 shadow-soft">
              <div className="text-gold font-semibold mb-1">💰</div>
              <div className="text-foreground font-medium">Earn Rewards</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 shadow-soft">
              <div className="text-accent font-semibold mb-1">🌱</div>
              <div className="text-foreground font-medium">Help Environment</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 shadow-soft">
              <div className="text-primary font-semibold mb-1">⚡</div>
              <div className="text-foreground font-medium">Easy Process</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;