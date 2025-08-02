import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const { user, updatePassword, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if this is a password reset session (has reset-specific URL params)
  const isPasswordResetSession = searchParams.get('type') === 'recovery' || 
                                  searchParams.get('access_token') || 
                                  searchParams.get('refresh_token');

  useEffect(() => {
    // If this looks like a password reset link but user is logged in,
    // we need to ensure they go through the password reset flow
    if (isPasswordResetSession && user) {
      // Don't redirect away - stay on reset page to force password change
      return;
    }
    
    // If no reset indicators and user is logged in, redirect to main page
    if (!isPasswordResetSession && user) {
      // Normal logged-in user without reset context should go to main page
    }
    
    // If no reset indicators at all, show error
    if (!isPasswordResetSession) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [user, isPasswordResetSession]);

  // Only redirect if user is logged in AND this is not a password reset session
  if (user && !isPasswordResetSession) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await updatePassword(password);
    
    if (!result.error) {
      setIsSuccess(true);
      // Sign out the user after password reset so they must log in with new password
      await signOut();
      setTimeout(() => {
        window.location.href = '/auth';
      }, 3000);
    } else {
      setError(result.error.message || 'Failed to update password');
    }
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
            <CardDescription>Your password has been successfully reset. Please log in with your new password.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You will be redirected to the login page in a few seconds, or you can click the button below.
            </p>
            <Link to="/auth">
              <Button className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!isPasswordResetSession ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This reset link is invalid or has expired.
              </p>
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;