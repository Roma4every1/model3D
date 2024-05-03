export interface MultiMapRecord {
  /** Идентификатор карты. */
  mapID: number | string;
  /** Название пласта карты. */
  stratumName: string;
}


/** Критерий канала мультикарты. */
export const multiMapChannelCriterion: ChannelCriterion<keyof MultiMapRecord> = {
  properties: {
    mapID: {name: 'MAP_ID'},
    stratumName: {name: 'PLAST_NAME'},
  },
};

/** Преобразует данные канала в элементы мультикарты. */
export function toMultiMapRecords(data: ChannelData, info: ChannelRecordInfo): MultiMapRecord[] {
  if (!data) return [];
  const idIndex = data.columns.findIndex(c => c.name === info.mapID.columnName);
  const nameIndex = data.columns.findIndex(c => c.name === info.statumName.columnName);

  return data.rows.map((row: ChannelRow): MultiMapRecord => {
    const mapID = row[idIndex];
    const stratumName = row[nameIndex] ?? '';
    return {mapID, stratumName};
  });
}
