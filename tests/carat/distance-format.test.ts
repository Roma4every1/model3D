import { describe, test, expect } from 'vitest';
import { formatDistance } from 'features/carat/lib/utils';

describe('Distance formatting', () => {

  test('Less than 500 meters', () => {
    expect(formatDistance(0)).toEqual('0м');
    expect(formatDistance(22.5)).toEqual('22,5м');
    expect(formatDistance(100)).toEqual('100м');
    expect(formatDistance(499.94)).toEqual('499,9м');
    expect(formatDistance(499.9612)).toEqual('500м');
  });
  test('More than 500 meters but less than 1000 meters', () => {
    expect(formatDistance(500)).toEqual('500м');
    expect(formatDistance(800.65)).toEqual('801м');
    expect(formatDistance(999.9)).toEqual('1,0км');
  });
  test('More than 1000 meters', () => {
    expect(formatDistance(1000)).toEqual('1,0км');
    expect(formatDistance(1999)).toEqual('2,0км');
    expect(formatDistance(5552.51256)).toEqual('5,6км');
    expect(formatDistance(12555)).toEqual('12,6км');
    expect(formatDistance(99999)).toEqual('100км');
    expect(formatDistance(700010.65456)).toEqual('700км');
  });
  test('Null input', () => {
    expect(formatDistance(null)).toEqual('');
  });

});
