
const CHARITY_COMMISSION_API_BASE_URL = 'https://api.charitycommission.gov.uk/register/api';

interface FinancialHistoryEntry {
  financial_period_end_date: string;
  income: number;
  expenditure: number;
}

interface UKNonProfitFinancials {
  revenue: number;
  spending: number;
  income: number;
  financialYearEnd: string;
}

export async function fetchUKNonProfitData(charityNumber: string): Promise<UKNonProfitFinancials[] | null> {
  if (!charityNumber) {
    return null;
  }

  try {
    const headers = {
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': 'e2aff38f4f3e4691bba114cc44c8fcff', // Primary Key
    };

    // Using suffix 0 for the main charity registration
    const response = await fetch(`${CHARITY_COMMISSION_API_BASE_URL}/charityfinancialhistory/${charityNumber}/0`, { headers });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Charity Commission API request failed:', response.statusText, errorBody);
      return null;
    }

    const data: FinancialHistoryEntry[] = await response.json();
    console.log('--- Charity Commission API Response ---', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      console.warn('Charity Commission API returned no financial history for charity number:', charityNumber);
      return null;
    }

    return data.map(filing => ({
      revenue: filing.income,
      spending: filing.expenditure,
      income: filing.income - filing.expenditure,
      financialYearEnd: filing.financial_period_end_date,
    })).sort((a, b) => new Date(b.financialYearEnd).getTime() - new Date(a.financialYearEnd).getTime());
  } catch (error) {
    console.error('An error occurred while fetching UK non-profit data:', error);
    return null;
  }
}
