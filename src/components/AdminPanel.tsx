import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Edit, Users, FileText, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  bank_details: string;
  created_at: string;
}

interface Referral {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  stage: string;
  bonus_status: string;
  notes: string;
  created_at: string;
  profiles: { name: string; email: string };
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newReferral, setNewReferral] = useState({
    user_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles data
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      // For admin panel, we'll use profiles table and fetch user emails separately
      const usersWithProfiles = profilesData?.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        email: '', // We'll populate this from auth
        bank_details: profile.bank_details || '',
        created_at: profile.created_at
      })) || [];

      // Fetch referrals with profiles - correct join syntax
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          profiles:profiles(user_id, name)
        `)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        throw referralsError;
      }

      const referralsWithUsers = referralsData?.map(referral => ({
        ...referral,
        profiles: {
          name: (referral.profiles as any)?.name || 'Unknown User',
          email: '' // We'll keep this simple for now
        }
      })) || [];

      setUsers(usersWithProfiles);
      setReferrals(referralsWithUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferral = async () => {
    if (!editingReferral) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
        stage: editingReferral.stage as any,
        bonus_status: editingReferral.bonus_status as any,
          notes: editingReferral.notes
        })
        .eq('id', editingReferral.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral updated successfully"
      });

      setEditingReferral(null);
      fetchData();
    } catch (error) {
      console.error('Error updating referral:', error);
      toast({
        title: "Error",
        description: "Failed to update referral",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddReferral = async () => {
    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('referrals')
        .insert([newReferral]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral added successfully"
      });

      setNewReferral({
        user_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: ''
      });

      fetchData();
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
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Users className="h-4 w-4 mr-1" />
            {users.length} Users
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <FileText className="h-4 w-4 mr-1" />
            {referrals.length} Referrals
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="referrals" className="w-full">
        <TabsList>
          <TabsTrigger value="referrals">All Referrals</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="add">Add Referral</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referrals Management</CardTitle>
              <CardDescription>View and manage all referrals in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Bonus Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{referral.client_name}</div>
                          <div className="text-sm text-muted-foreground">{referral.client_email}</div>
                          <div className="text-sm text-muted-foreground">{referral.client_phone}</div>
                          <div className="text-sm text-muted-foreground">{referral.client_address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{referral.profiles.name}</div>
                          <div className="text-sm text-muted-foreground">{referral.profiles.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(referral.stage)}>
                          {referral.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBonusColor(referral.bonus_status)}>
                          {referral.bonus_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingReferral(referral)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Referral</DialogTitle>
                              <DialogDescription>
                                Update the status and details of this referral
                              </DialogDescription>
                            </DialogHeader>
                            {editingReferral && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Client: {editingReferral.client_name}</Label>
                                </div>
                                <div className="space-y-2">
                                  <Label>Stage</Label>
                                  <Select
                                    value={editingReferral.stage}
                                    onValueChange={(value) => setEditingReferral({...editingReferral, stage: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Referred Connection">Referred Connection</SelectItem>
                                      <SelectItem value="Client Signed">Client Signed</SelectItem>
                                      <SelectItem value="Site Inspection Done">Site Inspection Done</SelectItem>
                                      <SelectItem value="Documents Verified">Documents Verified</SelectItem>
                                      <SelectItem value="Solar Installed">Solar Installed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Bonus Status</Label>
                                  <Select
                                    value={editingReferral.bonus_status}
                                    onValueChange={(value) => setEditingReferral({...editingReferral, bonus_status: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Paid">Paid</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Notes</Label>
                                  <Textarea
                                    value={editingReferral.notes || ''}
                                    onChange={(e) => setEditingReferral({...editingReferral, notes: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                                <Button onClick={handleUpdateReferral} disabled={isEditing} className="w-full">
                                  {isEditing ? 'Updating...' : 'Update Referral'}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>View all registered users and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Referrals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userReferrals = referrals.filter(r => r.user_id === user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{users.email}</TableCell>
                        <TableCell>{user.bank_details || 'Not provided'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{userReferrals.length}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Referral
              </CardTitle>
              <CardDescription>
                Add a referral on behalf of any user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select
                    value={newReferral.user_id}
                    onValueChange={(value) => setNewReferral({...newReferral, user_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client Name *</Label>
                    <Input
                      required
                      value={newReferral.client_name}
                      onChange={(e) => setNewReferral({...newReferral, client_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Email</Label>
                    <Input
                      type="email"
                      value={newReferral.client_email}
                      onChange={(e) => setNewReferral({...newReferral, client_email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client Phone</Label>
                    <Input
                      value={newReferral.client_phone}
                      onChange={(e) => setNewReferral({...newReferral, client_phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Address</Label>
                    <Textarea
                      value={newReferral.client_address}
                      onChange={(e) => setNewReferral({...newReferral, client_address: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddReferral} 
                  disabled={isAdding || !newReferral.user_id || !newReferral.client_name} 
                  className="w-full"
                >
                  {isAdding ? 'Adding Referral...' : 'Add Referral'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;