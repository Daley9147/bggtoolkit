import Header from '@/components/layout/header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedClient from '@/components/saved/saved-client';

export default async function SavedPage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    industry?: string;
    search?: string;
  };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const sp = searchParams || {};
  const currentPage = Number(sp.page) || 1;
  const industryFilter = sp.industry || '';
  const searchTerm = sp.search || '';
  const ITEMS_PER_PAGE = 10;

  // Base query
  let query = supabase
    .from('companies')
    .select('*, outreach_templates(*)', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply industry filter if present
  if (industryFilter) {
    query = query.eq('industry', industryFilter);
  }

  // Apply search term if present
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);
  }

  // Apply pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: companies, error, count } = await query;

  if (error) {
    console.error('Error fetching companies:', error);
  }

  // Fetch unique industries for the filter dropdown
  const { data: industriesData, error: industriesError } = await supabase
    .from('companies')
    .select('industry')
    .eq('user_id', user.id);

  if (industriesError) {
    console.error('Error fetching industries:', industriesError);
  }

  const uniqueIndustries = [...new Set(industriesData?.map(item => item.industry).filter(Boolean) || [])];


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <SavedClient
          companies={companies || []}
          count={count || 0}
          industries={uniqueIndustries}
        />
      </main>
    </div>
  );
}
