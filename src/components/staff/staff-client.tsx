'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCog, Ban, CheckCircle, Workflow, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createStaffAccount } from '@/lib/actions/staff-actions';
import StaffPipelinesDialog from './staff-pipelines-dialog';
import EmailSettingsDialog from './email-settings-dialog';

interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

export default function StaffClient() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStaffForPipelines, setSelectedStaffForPipelines] = useState<StaffProfile | null>(null);
  const [selectedStaffForEmail, setSelectedStaffForEmail] = useState<StaffProfile | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    console.log('Staff Fetch Result:', { data, error });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load staff list.', variant: 'destructive' });
    } else {
      setStaff(data as StaffProfile[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } else {
      setStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast({ title: 'Success', description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}.` });
    }
  };

  const handleAddStaff = async (formData: FormData) => {
    setIsAdding(true);
    try {
      await createStaffAccount(formData);
      toast({ title: 'Success', description: 'Staff account created successfully.' });
      setIsAddOpen(false);
      fetchStaff(); // Refresh list
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Staff</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form action={handleAddStaff} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="john@missionmetrics.io" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>{isAdding ? 'Creating...' : 'Create Account'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No staff members found.</TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name || 'N/A'}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'outline' : 'destructive'} className={member.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                        {member.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStaffForEmail(member)} title="Email Settings">
                          <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStaffForPipelines(member)} title="Manage Pipelines">
                        <Workflow className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(member.id, member.status || 'active')} title="Toggle Status">
                        {member.status === 'active' ? <Ban className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStaffForPipelines && (
        <StaffPipelinesDialog 
            userId={selectedStaffForPipelines.id} 
            userName={selectedStaffForPipelines.full_name} 
            isOpen={!!selectedStaffForPipelines} 
            onOpenChange={(open) => !open && setSelectedStaffForPipelines(null)} 
        />
      )}

      {selectedStaffForEmail && (
        <EmailSettingsDialog 
            userId={selectedStaffForEmail.id} 
            userName={selectedStaffForEmail.full_name} 
            isOpen={!!selectedStaffForEmail} 
            onOpenChange={(open) => !open && setSelectedStaffForEmail(null)} 
        />
      )}
    </div>
  );
}
