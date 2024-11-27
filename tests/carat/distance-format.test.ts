import { describe, test, expect } from 'vitest';


function formatDistance(d: number): string {
  return d.toString().replace('.', ',') + 'м';
}


describe('Distance formatting', () => {

  test('Less than 500 meters', () => {
    expect(formatDistance(0)).toEqual('0м');
    expect(formatDistance(22.5)).toEqual('22,5м')
    expect(formatDistance(100)).toEqual('100м');
  });

});
