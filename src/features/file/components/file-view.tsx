import { useSelector } from 'react-redux';
import { fileViewStateSelector } from '../store/file-view.selectors';
import {channelSelector} from "../../../entities/channels";
import DocViewer, {DocViewerRenderers} from "@cyntler/react-doc-viewer";
import {ExcelRenderer} from "./renderers/excel-renderer";
import {MSWordRenderer} from "./renderers/msword-renderer";
import {SVGRenderer} from "./renderers/svg-renderer";

export const FileView = ({id, channels}: FormState) => {
  const state = useSelector(fileViewStateSelector.bind(id));
  console.log(state);

  const channel: Channel = useSelector(channelSelector.bind(channels[0]));
  const files = channel.data?.rows ?? [];

  const rootUrl = "http://kmn-wmw:8080";
  const filesWithCorrectUrls = files.map(f => ({
      name: f.Cells[0],
      path: f.Cells[1].replace('C:', rootUrl),
      type: f.Cells[0].match(/(\.)(.+$)/)[2]
    })
  );
  console.log(filesWithCorrectUrls);

  const docs = [
    { uri: require("assets/file-mockups/sample.png") },
    { uri: require("assets/file-mockups/sample1.docx") },
    { uri: require("assets/file-mockups/sample.pdf") },
    { uri: require("assets/file-mockups/sample.xlsx") },
    { uri: require("assets/file-mockups/sample2.xls") },
    { uri: require("assets/file-mockups/sample.jpg") },
  ];

  return (
    <DocViewer
      documents={docs}
      pluginRenderers={[
        ...DocViewerRenderers, ExcelRenderer, MSWordRenderer, SVGRenderer
      ]}
    />
  );
};
