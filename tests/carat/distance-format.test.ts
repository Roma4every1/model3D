import { describe, test, expect } from 'vitest';
import { formatDistance } from '../../src/features/carat/lib/utils';

describe('Distance formatting', () => {

  test('Less than 500 meters', () => {
    expect(formatDistance(0)).toEqual('0м');
    expect(formatDistance(22.5)).toEqual('22,5м')
    expect(formatDistance(100)).toEqual('100м');
  });

});
