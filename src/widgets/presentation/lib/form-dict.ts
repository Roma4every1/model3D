import type { FunctionComponent } from 'react';
import { Table, createTableState } from 'features/table';
import { Chart, createChartState } from 'features/chart';
import { Map, createMapState } from 'features/map';
import { Carat, createCaratState, caratChannelCriteria } from 'features/carat';
import { Profile, createProfileState } from 'features/profile';
import { FileView, createFileViewState } from 'features/file';
import { FileListView, createFileListState } from 'features/file-list';


type SupportedFormDict<T> = Record<SupportedFormType, T>;
type FormStateCreator = (payload: FormStatePayload) => void;


/** Словарь компонентов форм; используется в компоненте `Form`. */
export const formDict: SupportedFormDict<FunctionComponent<SessionClient>> = {
  'dataSet': Table,
  'carat': Carat,
  'chart': Chart,
  'map': Map,
  'profile': Profile,
  'files': FileView,
  'filesList': FileListView,
};

/** Словарь функций-экшенов для создания состояния форм. */
export const formCreators: SupportedFormDict<FormStateCreator> = {
  'dataSet': createTableState,
  'carat': createCaratState,
  'chart': createChartState,
  'map': createMapState,
  'profile': createProfileState,
  'files': createFileViewState,
  'filesList': createFileListState,
};

export const formChannelCriteria: Partial<SupportedFormDict<ClientChannelCriteria>> = {
  'carat': caratChannelCriteria,
  'profile': {},
};
