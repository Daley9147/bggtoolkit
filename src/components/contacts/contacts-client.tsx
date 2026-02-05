'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, User, Download, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Contact } from '@/lib/types';
import ContactDetailsSheet from './contact-details-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

interface CrmList {
    name: string;
    count: number;
}

interface ContactWithAssignee extends Contact {
    assignee?: {
        full_name: string;
        email: string;
    } | null;
}

export default function ContactsClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'lists' ? 'lists' : 'all';
  
  const [contacts, setContacts] = useState<ContactWithAssignee[]>([]);
  const [lists, setLists] = useState<CrmList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'lists' | 'list-details'>(initialTab as any);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContacts = async (query = '', listName = '') => {
    setIsLoading(true);
    try {
      let url;
      if (listName) {
         url = new URL(`/api/crm/lists/${encodeURIComponent(listName)}`, window.location.origin);
      } else {
         url = new URL('/api/mission-metrics/contacts', window.location.origin);
      }
      
      if (query) url.searchParams.append('query', query);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load contacts.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLists = async () => {
      setIsLoading(true);
      try {
          const response = await fetch('/api/crm/lists');
          if (!response.ok) throw new Error('Failed to fetch lists');
          const data = await response.json();
          setLists(data);
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'Failed to load lists.', variant: 'destructive' });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
        if (viewMode === 'all') {
            fetchContacts(searchTerm);
        } else if (viewMode === 'lists') {
            fetchLists();
        } else if (viewMode === 'list-details' && selectedList) {
            fetchContacts(searchTerm, selectedList);
        }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, viewMode, selectedList]);

  const handleDownloadCsv = async (listName: string) => {
      try {
          const response = await fetch(`/api/crm/lists/${encodeURIComponent(listName)}`);
          if (!response.ok) throw new Error('Failed to fetch list data');
          const data = await response.json();

          if (!data || data.length === 0) {
              toast({ title: 'Info', description: 'List is empty.' });
              return;
          }

          // Convert to CSV
          const headers = Object.keys(data[0]).join(',');
          const csvRows = data.map((row: any) => {
              return Object.values(row).map(value => {
                  const escaped = String(value ?? '').replace(/"/g, '""');
                  return `"${escaped}"`;
              }).join(',');
          });
          const csvContent = [headers, ...csvRows].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${listName}_export.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast({ title: 'Success', description: 'CSV Downloaded.' });
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'Failed to download CSV.', variant: 'destructive' });
      }
  };

  const handleDeleteList = async (listName: string) => {
      if (!confirm(`Are you sure you want to delete the list "${listName}"? This will delete all contacts in this list.`)) return;

      try {
          const response = await fetch(`/api/crm/lists?name=${encodeURIComponent(listName)}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete list');
          
          toast({ title: 'Success', description: 'List deleted.' });
          fetchLists();
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'Failed to delete list.', variant: 'destructive' });
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
            {viewMode === 'list-details' ? (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewMode('lists')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    {selectedList}
                </div>
            ) : 'Contacts'}
        </h1>
      </div>

      <Tabs value={viewMode === 'list-details' ? 'lists' : viewMode} onValueChange={(val) => setViewMode(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>

        <div className="mt-6">
            {viewMode !== 'lists' && (
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search contacts..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                {viewMode === 'lists' ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>List Name</TableHead>
                                    <TableHead>Contacts</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Loading Lists...</TableCell></TableRow>
                                ) : lists.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">No lists found.</TableCell></TableRow>
                                ) : (
                                    lists.map((list) => (
                                        <TableRow key={list.name}>
                                            <TableCell className="font-medium">{list.name}</TableCell>
                                            <TableCell>{list.count}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => { setSelectedList(list.name); setViewMode('list-details'); }}>
                                                        <Eye className="h-4 w-4 mr-2" /> View
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadCsv(list.name)}>
                                                        <Download className="h-4 w-4 mr-2" /> CSV
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteList(list.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Organisation</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {isLoading ? (
                                <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No contacts found.</TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((contact) => (
                                <TableRow 
                                    key={contact.id} 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <TableCell className="font-medium flex items-center gap-2 whitespace-nowrap">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {contact.first_name} {contact.last_name}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{contact.organisation_name || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{contact.job_title || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{contact.assignee?.full_name || contact.assignee?.email || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{contact.email || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{contact.phone || '-'}</TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </Tabs>

      <ContactDetailsSheet 
        contact={selectedContact} 
        isOpen={!!selectedContact} 
        onOpenChange={(open) => !open && setSelectedContact(null)} 
      />
    </div>
  );
}