import type { MultiMapChild } from '../store/multi-map.store';


export class MultiMapChildFactory {
  private readonly parentID: ClientID;
  private readonly recordInfo: ChannelRecordInfo;

  constructor(parentID: ClientID, info: ChannelRecordInfo) {
    this.parentID = parentID;
    this.recordInfo = info;
  }

  /** Преобразует данные канала в элементы мультикарты. */
  public create(data: ChannelData): MultiMapChild[] {
    const children: MultiMapChild[] = [];
    if (!data || data.rows.length === 0) return children;

    const findIndex = (name: string) => data.columns.findIndex(c => c.name === name);
    const idIndex = findIndex(this.recordInfo.id.columnName);
    const storageIndex = findIndex(this.recordInfo.storage?.columnName ?? 'OWNER');
    const nameIndex = findIndex(this.recordInfo.stratumName.columnName);

    for (const row of data.rows) {
      if (row[idIndex] === null) continue;
      const id = String(row[idIndex]);

      children.push({
        id, storage: row[storageIndex] ?? 'Common',
        formID: this.parentID + ',' + id, stratumName: row[nameIndex] ?? '',
        stage: null, loader: null,
      });
    }
    return children;
  }
}
