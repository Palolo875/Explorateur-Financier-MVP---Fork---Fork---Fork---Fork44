import { describe, it, expect, vi } from 'vitest';
import { categorizeTransaction } from './aiCategorization';
import * as tf from '@tensorflow/tfjs';

vi.mock('@tensorflow/tfjs', () => ({
  sequential: () => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn(),
    predict: vi.fn(() => ({
      argMax: () => ({
        dataSync: () => [0],
      }),
    })),
  }),
  layers: {
    dense: vi.fn(),
  },
  tensor2d: vi.fn(),
  concat: vi.fn(),
}));

describe('aiCategorization', () => {
  it('should return a category', async () => {
    const category = await categorizeTransaction('salaire', 'income', 5000);
    expect(category).toBe('salary');
  });
});
