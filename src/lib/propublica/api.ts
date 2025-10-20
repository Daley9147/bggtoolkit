import { PROPUBLICA_API_KEY } from '@/lib/constants';

const PROPUBLICA_API_BASE_URL = 'https://projects.propublica.org/nonprofits/api/v2';

interface NonProfitOrg {
  ein: string;
  name: string;
  city: string;
  state: string;
}

interface NonProfitFinancials {
  revenue: number;
  expenses: number;
  net_income: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchNonProfitData(identifier: string): Promise<NonProfitFinancials | null> {
  if (!identifier) {
    return null;
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    // First, search for the organization to get its EIN
    const searchUrl = `${PROPUBLICA_API_BASE_URL}/search.json?q=${encodeURIComponent(identifier)}`;
    const searchResponse = await fetch(searchUrl, { headers });

    if (!searchResponse.ok) {
      console.error('ProPublica API search request failed:', searchResponse.statusText);
      return null;
    }

    const searchData = await searchResponse.json();
    if (!searchData.organizations || searchData.organizations.length === 0) {
      console.warn(`No non-profit organization found for identifier: ${identifier}`);
      return null;
    }

    const org: NonProfitOrg = searchData.organizations[0];
    const { ein } = org;

    // Respectful delay to avoid rate limiting
    await delay(1000);

    // Then, fetch the detailed financial data using the EIN
    const orgUrl = `${PROPUBLICA_API_BASE_URL}/organizations/${ein}.json`;
    const orgResponse = await fetch(orgUrl, { headers });

    if (!orgResponse.ok) {
      console.error(`ProPublica API org request failed for EIN ${ein}:`, orgResponse.statusText);
      return null;
    }

    const orgData = await orgResponse.json();
    
    // Extract the most recent filing's financial data
    if (orgData.filings_with_data && orgData.filings_with_data.length > 0) {
      const latestFiling = orgData.filings_with_data[0];
      return {
        revenue: latestFiling.totrevenue ?? 0,
        expenses: latestFiling.totfuncexpns ?? 0,
        net_income: (latestFiling.totrevenue ?? 0) - (latestFiling.totfuncexpns ?? 0),
      };
    }

    return null;
  } catch (error) {
    console.error('An error occurred while fetching non-profit data:', error);
    return null;
  }
}

export async function inspectLatestFiling(ein: string) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
    const orgUrl = `${PROPUBLICA_API_BASE_URL}/organizations/${ein}.json`;
    const orgResponse = await fetch(orgUrl, { headers });
    if (!orgResponse.ok) {
      console.error(`ProPublica API org request failed for EIN ${ein}:`, orgResponse.statusText);
      return;
    }
    const orgData = await orgResponse.json();
    if (orgData.filings_with_data && orgData.filings_with_data.length > 0) {
      const latestFiling = orgData.filings_with_data[0];
      console.log('--- Latest Filing Data ---');
      console.log(latestFiling);
      console.log('--------------------------');
    } else {
      console.log('No filings with data found.');
    }
  } catch (error) {
    console.error('An error occurred during inspection:', error);
  }
}
