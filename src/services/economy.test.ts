import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast');

vi.mock('@/services/economy', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    USE_MOCK_DATA: false,
  };
});

describe('Economy Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('fetchInflationData', () => {
    it('should return inflation data on successful fetch', async () => {
      const { fetchInflationData } = await import('@/services/economy');
      const mockXml = `
        <root>
          <data>
            <record>
              <field name="date">2022</field>
              <field name="value">5.2</field>
            </record>
          </data>
        </root>
      `;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockXml),
      });

      const data = await fetchInflationData();
      expect(data).toEqual([{ year: 2022, value: 5.2 }]);
    });

    it('should return an empty array and show toast on fetch error', async () => {
      const { fetchInflationData } = await import('@/services/economy');
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
      const data = await fetchInflationData();
      expect(data).toEqual([]);
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la récupération des données sur l\'inflation.');
    });
  });

  describe('fetchInterestRates', () => {
    it('should return interest rate data on successful fetch', async () => {
      const { fetchInterestRates } = await import('@/services/economy');
      const mockJson = {
        dimension: {
          time: {
            category: {
              index: { '2022': 0 },
            },
          },
        },
        value: [0.29],
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockJson),
      });

      const data = await fetchInterestRates();
      expect(data).toEqual([{ year: 2022, value: 0.29 }]);
    });

    it('should return an empty array and show toast on fetch error', async () => {
      const { fetchInterestRates } = await import('@/services/economy');
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
      const data = await fetchInterestRates();
      expect(data).toEqual([]);
      expect(toast.error).toHaveBeenCalledWith('Erreur lors de la récupération des taux d\'intérêt.');
    });
  });
});
