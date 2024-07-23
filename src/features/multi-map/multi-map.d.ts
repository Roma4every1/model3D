interface MultiMapState {
  readonly templateFormID: FormID;
  layout: any;
  sync: boolean;
  children: MultiMapChild[];
}

interface MultiMapChild {
  readonly id: MapID;
  readonly storage: MapStorageID;
  readonly formID: FormID;
  readonly stratumName: string;
  stage: IMapStage;
  loader: IMapLoader;
  loadFlag?: boolean;
}
