/**
 * @overview Этот файл содержит юнит-тесты для расчётов инклинометрии.
 *
 * Набор тестов предполагает корректость исходных данных:
 * 1. отсутствие пустых записей (и глубина, и отметка не `null`)
 * 2. записи отсортированы по возрастанию по глубине
 *
 * Если эти требования не выполняются, расчёты будут давать заведомо
 * некорретный и непредсказуемый результат; об этом сказано в документации.
 */

import { describe, test, expect } from 'vitest';
import { CaratInclinometry } from 'features/carat/lib/inclinometry';


const channelInfo: ChannelRecordInfo<'depth' | 'absMark'> = {
  depth: {propertyName: 'depth', columnName: 'depth'},
  absMark: {propertyName: 'absMark', columnName: 'absMark'},
};

function getInstance(marks: {depth: number, absMark: number}[] | null): CaratInclinometry {
  const incl = new CaratInclinometry({id: 1, info: channelInfo});
  incl.setData({1: marks});
  return incl;
}

describe('CaratInclinometry', () => {

  test('Lack of data', () => {
    // no data at all
    let incl = getInstance(null);
    expect(incl.getAbsMark(1)).toEqual(-1);
    expect(incl.getDepth(-1)).toEqual(1);

    // empty
    incl = getInstance([]);
    expect(incl.getAbsMark(1)).toEqual(-1);
    expect(incl.getDepth(-1)).toEqual(1);

    // less than 2 marks
    incl = getInstance([{depth: 0, absMark: 0}]);
    expect(incl.getAbsMark(1)).toEqual(-1);
    expect(incl.getDepth(-1)).toEqual(1);
  });

  test('Depth to absolute mark', () => {
    const incl = getInstance([
      {depth: 10, absMark: 10},
      {depth: 20, absMark: 0},
      {depth: 30, absMark: -10},
      {depth: 40, absMark: -20},
      {depth: 50, absMark: -30},
    ]);

    // exact
    expect(incl.getAbsMark(10)).toEqual(10);
    expect(incl.getAbsMark(30)).toEqual(-10);
    expect(incl.getAbsMark(50)).toEqual(-30);

    // interpolate
    expect(incl.getAbsMark(25)).toEqual(-5);
    expect(incl.getAbsMark(35)).toEqual(-15);

    // out of range
    expect(incl.getAbsMark(0)).toEqual(20);
    expect(incl.getAbsMark(60)).toEqual(-40);
  });

  test('Absolute mark to depth', () => {
    const incl = getInstance([
      {depth: 0, absMark: 100},
      {depth: 100, absMark: 50},
      {depth: 200, absMark: 0},
      {depth: 300, absMark: -50},
      {depth: 400, absMark: -100},
    ]);

    // exact
    expect(incl.getDepth(100)).toEqual(0);
    expect(incl.getDepth(0)).toEqual(200);
    expect(incl.getDepth(-100)).toEqual(400);

    // interpolate
    expect(incl.getDepth(25)).toEqual(150);
    expect(incl.getDepth(-25)).toEqual(250);

    // out of range
    expect(incl.getDepth(150)).toEqual(-100);
    expect(incl.getDepth(-150)).toEqual(500);
  });

});
