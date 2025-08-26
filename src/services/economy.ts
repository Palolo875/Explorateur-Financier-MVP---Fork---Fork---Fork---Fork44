import { parseStringPromise } from 'xml2js';
import { toast } from 'react-hot-toast';

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
		toast.error('Erreur lors de la récupération des données sur l\'inflation.');
		return [];
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
		// Eurostat 1.0 API for Money market interest rates monthly dataset (irt_st_m)
		const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/irt_st_m?geo=${countryCode}&time=2022&format=JSON`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch interest rate data: ${response.statusText}`);
		}
		const data = await response.json();

		// Data structure: value is a sparse object with numeric string keys
		// Dimensions order is given by data.id and their categories by data.dimension
		const timeDim = (data.dimension?.time?.category?.index) || {};
		const values = data.value || {};

		// Map time keys to indices, then read values by index position if present
		const entries: { year: number; value: number }[] = Object.keys(timeDim)
			.map((yearKey) => {
				const position = timeDim[yearKey];
				const raw = values[position];
				const num = typeof raw === 'number' ? raw : raw != null ? Number(raw) : null;
				return { year: parseInt(yearKey, 10), value: num ?? 0 };
			})
			.sort((a, b) => a.year - b.year);

		return entries;
	} catch (error) {
		console.error('Error fetching interest rate data:', error);
		toast.error('Erreur lors de la récupération des taux d\'intérêt.');
		return [];
	}
}
