import { describe, test, expect } from 'vitest';
import { createColumnFormatter } from 'features/table/lib/utils';


describe('Table column format', () => {

  test('Fixed digits', () => {
    const n = createColumnFormatter('n');
    expect(n(0)).toEqual('0');
    expect(n(-1)).toEqual('-1');
    expect(n(22.5)).toEqual('23');
    expect(n(0.3333)).toEqual('0');

    const n2 = createColumnFormatter('n2');
    expect(n2(0)).toEqual('0,00');
    expect(n2(-1)).toEqual('-1,00');
    expect(n2(22.5)).toEqual('22,50');
    expect(n2(0.3333)).toEqual('0,33');
  });

  test('Percents', () => {
    const p = createColumnFormatter('p');
    expect(p(0)).toEqual('0%');
    expect(p(0.3)).toEqual('30%');

    const p1 = createColumnFormatter('p1');
    expect(p1(0)).toEqual('0,0%');
    expect(p1(1.5432)).toEqual('154,3%');
  });

  test('Flex format', () => {
    let format = createColumnFormatter('#.##');
    expect(format(0)).toEqual('0');
    expect(format(-0.1)).toEqual('-0,1');
    expect(format(0.12345)).toEqual('0,12');

    format = createColumnFormatter('0.00##');
    expect(format(0)).toEqual('0,00');
    expect(format(-0.1)).toEqual('-0,10');
    expect(format(0.12345)).toEqual('0,1235');
  });
});
