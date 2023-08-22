import { useSelector } from 'react-redux';
import { channelSelector } from 'entities/channels';
import { fileViewStateSelector } from '../store/file-view.selectors';

import { TextInfo } from 'shared/ui';
import DocViewer, { IConfig, IDocument } from '@cyntler/react-doc-viewer';
// import { ExcelRenderer } from './renderers/excel-renderer';
// import { MSWordRenderer } from './renderers/ms-word-renderer';

const config: IConfig = {
  header: {disableHeader: true},
};
const doc: IDocument = {uri: require('assets/sample.pdf')};
const documents = [doc];

export const FileView = ({id, channels}: FormState) => {
  const { info }: FileViewState = useSelector(fileViewStateSelector.bind(id));
  const channel: Channel = useSelector(channelSelector.bind(channels[0]));
  const activeRow = channel.data?.activeRow;

  if (!activeRow) return <TextInfo text={'Файл не выбран'}/>;
  console.log(activeRow.Cells[info.filePath.index]);
  return <DocViewer config={config} documents={documents} activeDocument={doc}/>;
};
