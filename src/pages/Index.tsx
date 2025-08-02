import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ReferrerDashboard from '@/components/ReferrerDashboard';
import AdminPanel from '@/components/AdminPanel';
import { LogOut, Shield, User } from 'lucide-react';

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">SOLARPAY BY SUNNOVA</h1>
            <div className="flex items-center gap-2">
              {userRole === 'admin' ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm bg-primary/10 px-2 py-1 rounded capitalize">
                {userRole}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userRole === 'admin' ? <AdminPanel /> : <ReferrerDashboard />}
      </main>
    </div>
  );
};

export default Index;
