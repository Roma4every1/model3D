interface CurveSelector {
  regExp: RegExp,
  selected: boolean,
}

export class CurveSelection {
  private static typeToSelector(t: CaratCurveSelector): CurveSelector {
    return {regExp: new RegExp(t.expression), selected: t.isSelected};
  }
  private static selectorToType(s: CurveSelector): CaratCurveSelector {
    return {expression: s.regExp.source, isSelected: s.selected};
  }

  /** Типы кривых. */
  private readonly selectors: CurveSelector[];
  /** Начальная дата. */
  private start: Date | 'now';
  /** Конечная дата. */
  private end: Date | 'now';

  constructor(init: CaratDataSelection) {
    this.selectors = init.types.map(CurveSelection.typeToSelector);
    this.start = init.start === 'now' ? 'now' : new Date(init.start);
    this.end = init.end === 'now' ? 'now' : new Date(init.end);
  }

  public setStart(start: Date | 'now') {
    this.start = start;
  }

  public setEnd(end: Date | 'now') {
    this.end = end;
  }

  public testCurve(curveType: CaratCurveType, curveDate: Date): boolean {
    const start = typeof this.start === 'string' ? new Date() : this.start;
    if (curveDate < start) return false;
    const end = typeof this.end === 'string' ? new Date() : this.end;
    if (curveDate > end) return false;

    for (const selector of this.selectors) {
      const matched = selector.regExp.test(curveType);
      if (matched) return selector.selected;
    }
    return false;
  }

  public filterCurves(rows: ChannelRow[], info: CaratCurveSetInfo): ChannelRow[] {
    const start = typeof this.start === 'string' ? new Date() : this.start;
    const end = typeof this.end === 'string' ? new Date() : this.end;

    const typeIndex = info.type.index;
    const dateIndex = info.date.index;

    return rows.filter((row) => {
      const dateString = row.Cells[dateIndex];
      if (!dateString) return false;
      const curveDate = new Date(dateString);
      if (curveDate < start || curveDate > end) return false;

      const curveType = row.Cells[typeIndex];
      for (const selector of this.selectors) {
        const matched = selector.regExp.test(curveType);
        if (matched) return selector.selected;
      }
      return false;
    });
  }

  public getInit(): CaratDataSelection {
    const types = this.selectors.map(CurveSelection.selectorToType);
    const start = typeof this.start === 'string' ? this.start : this.start.toJSON();
    const end = typeof this.end === 'string' ? this.end : this.end.toJSON();
    return {types, start, end};
  }
}
