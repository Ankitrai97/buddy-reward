import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface Referral {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  stage: string;
  bonus_status: string;
  notes: string;
  created_at: string;
}

const ReferrerDashboard = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReferral, setNewReferral] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferrals();
    }
  }, [user]);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referrals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const { error } = await supabase
        .from('referrals')
        .insert([{
          user_id: user?.id,
          ...newReferral
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral added successfully"
      });

      setNewReferral({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: ''
      });

      fetchReferrals();
    } catch (error) {
      console.error('Error adding referral:', error);
      toast({
        title: "Error",
        description: "Failed to add referral",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Referred Connection': return 'bg-purple-100 text-purple-800';
      case 'Client Signed': return 'bg-blue-100 text-blue-800';
      case 'Site Inspection Done': return 'bg-yellow-100 text-yellow-800';
      case 'Documents Verified': return 'bg-orange-100 text-orange-800';
      case 'Solar Installed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBonusColor = (status: string) => {
    return status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Referrer Dashboard</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total Referrals: {referrals.length}
        </Badge>
      </div>

      <Tabs defaultValue="referrals" className="w-full">
        <TabsList>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="add">Add New Referral</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          {referrals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No referrals yet. Add your first referral to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {referrals.map((referral) => (
                <Card key={referral.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{referral.client_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getStageColor(referral.stage)}>
                          {referral.stage}
                        </Badge>
                        <Badge className={getBonusColor(referral.bonus_status)}>
                          {referral.bonus_status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Added on {new Date(referral.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Email:</strong> {referral.client_email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {referral.client_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {referral.client_address || 'N/A'}</p>
                      </div>
                    </div>
                    {referral.notes && (
                      <div className="mt-4">
                        <p><strong>Notes:</strong></p>
                        <p className="text-sm text-muted-foreground mt-1">{referral.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Referral
              </CardTitle>
              <CardDescription>
                Add details of a new client you've referred
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReferral} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      required
                      value={newReferral.client_name}
                      onChange={(e) => setNewReferral({...newReferral, client_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Client Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={newReferral.client_email}
                      onChange={(e) => setNewReferral({...newReferral, client_email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Client Phone</Label>
                    <Input
                      id="client_phone"
                      value={newReferral.client_phone}
                      onChange={(e) => setNewReferral({...newReferral, client_phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_address">Client Address</Label>
                    <Textarea
                      id="client_address"
                      value={newReferral.client_address}
                      onChange={(e) => setNewReferral({...newReferral, client_address: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isAdding} className="w-full">
                  {isAdding ? 'Adding Referral...' : 'Add Referral'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferrerDashboard;