import { describe, test, expect } from 'vitest';
import { tickFormatter } from 'features/chart/lib/axis-utils';


describe('Tick formatter', () => {

  test('Positive', () => {
    expect(tickFormatter(0)).toEqual('0');
    expect(tickFormatter(1)).toEqual('1');
    expect(tickFormatter(8)).toEqual('8');

    expect(tickFormatter(10)).toEqual('10');
    expect(tickFormatter(42)).toEqual('42');
    expect(tickFormatter(75)).toEqual('75');

    expect(tickFormatter(100)).toEqual('100');
    expect(tickFormatter(1000)).toEqual('1000');
    expect(tickFormatter(1200)).toEqual('1200');
    expect(tickFormatter(25000)).toEqual('25т');
    expect(tickFormatter(55405)).toEqual('55т');

    expect(tickFormatter(999500)).toEqual('1e+6');
    expect(tickFormatter(100000000)).toEqual('1e+8');
    expect(tickFormatter(123456789)).toEqual('1.2e+8');
  });

  test('Negative', () => {
    expect(tickFormatter(-1)).toEqual('-1');
    expect(tickFormatter(-8)).toEqual('-8');

    expect(tickFormatter(-10)).toEqual('-10');
    expect(tickFormatter(-42)).toEqual('-42');
    expect(tickFormatter(-75)).toEqual('-75');

    expect(tickFormatter(-100)).toEqual('-100');
    expect(tickFormatter(-1000)).toEqual('-1000');
    expect(tickFormatter(-1200)).toEqual('-1200');
    expect(tickFormatter(-25000)).toEqual('-25т');
    expect(tickFormatter(-55405)).toEqual('-55т');
  });

  test('Fractions', () => {
    expect(tickFormatter(0.1)).toEqual('0.1');
    expect(tickFormatter(0.25)).toEqual('0.25');
    expect(tickFormatter(0.3333)).toEqual('0.333');

    expect(tickFormatter(1.33)).toEqual('1.33');
    expect(tickFormatter(10.33)).toEqual('10.3');
    expect(tickFormatter(100.33)).toEqual('100');
    expect(tickFormatter(12345.54321)).toEqual('12т');

    expect(tickFormatter(0.0011)).toEqual('0.001');
    expect(tickFormatter(0.00001)).toEqual('1e-5');
    expect(tickFormatter(0.00015)).toEqual('1.5e-4');
    expect(tickFormatter(0.00001234)).toEqual('1.2e-5');
  });

});
