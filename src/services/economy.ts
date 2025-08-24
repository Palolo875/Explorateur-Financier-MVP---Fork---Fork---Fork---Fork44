import { parseStringPromise } from 'xml2js';

// Service for fetching economic data like inflation and interest rates.
export const USE_MOCK_DATA = true;

export async function fetchInflationData(countryCode: string = 'FRA'): Promise<{ year: number; value: number }[]> {
  if (USE_MOCK_DATA) {
    return [
      { year: 2013, value: 0.9 },
      { year: 2014, value: 0.5 },
      { year: 2015, value: 0.0 },
      { year: 2016, value: 0.2 },
      { year: 2017, value: 1.0 },
      { year: 2018, value: 1.8 },
      { year: 2019, value: 1.1 },
      { year: 2020, value: 0.5 },
      { year: 2021, value: 1.6 },
      { year: 2022, value: 5.2 },
    ];
  }

  try {
    const response = await fetch(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.DEFL.KD.ZG?downloadformat=xml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inflation data: ${response.statusText}`);
    }
    const xmlText = await response.text();
    const parsedData = await parseStringPromise(xmlText);

    const dataPoints = parsedData.root.data[0].record;

    const inflationData = dataPoints.map((record: any) => ({
      year: parseInt(record.field.find((f: any) => f.$.name === 'date')._, 10),
      value: parseFloat(record.field.find((f: any) => f.$.name === 'value')._ || 0),
    }));

    return inflationData.slice(-10);
  } catch (error) {
    console.error('Error fetching inflation data:', error);
    throw new Error('Could not fetch inflation data.');
  }
}

export async function fetchInterestRates(countryCode: string = 'FR'): Promise<{ year: number; value: number }[]> {
  if (USE_MOCK_DATA) {
    return [
      { year: 2013, value: 0.11 },
      { year: 2014, value: 0.03 },
      { year: 2015, value: -0.13 },
      { year: 2016, value: -0.33 },
      { year: 2017, value: -0.36 },
      { year: 2018, value: -0.37 },
      { year: 2019, value: -0.41 },
      { year: 2020, value: -0.48 },
      { year: 2021, value: -0.52 },
      { year: 2022, value: 0.29 },
    ];
  }

  try {
    const response = await fetch(`https://ec.europa.eu/eurostat/api/dissemination/statistics/v2.1/data/irt_st_m?format=JSON&geo=${countryCode}&time=2022&time=2021&time=2020&time=2019&time=2018&time=2017&time=2016&time=2015&time=2014&time=2013`);
    if (!response.ok) {
      throw new Error(`Failed to fetch interest rate data: ${response.statusText}`);
    }
    const data = await response.json();

    const years = data.dimension.time.category.index;
    const values = data.value;

    const interestRateData = Object.keys(years).map((yearKey, index) => ({
        year: parseInt(yearKey, 10),
        value: values[index] || 0,
    }));

    return interestRateData;
  } catch (error) {
    console.error('Error fetching interest rate data:', error);
    throw new Error('Could not fetch interest rate data.');
  }
}
