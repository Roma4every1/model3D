import {TXTRenderer} from "./renderers/txt/txt-renderer.tsx";
import {ImageRenderer} from "./renderers/image/image-renderer.tsx";
import {PDFRenderer} from "./renderers/pdf/pdf-renderer.tsx";
import {HTMLRenderer} from './renderers/html/html-renderer.tsx'
import {UnsupportedFile} from "./unsupported-file.tsx";

/** Получение словаря компонентов рендера для расширений файлов. */
const getRenderersDict = (model: FileViewModel) => ({
  'txt': <TXTRenderer model={model} /> ,
  'svg': <ImageRenderer model={model} /> ,
  'png': <ImageRenderer model={model} />,
  'bmp': <ImageRenderer model={model} />,
  'jpg': <ImageRenderer model={model} />,
  'jpeg': <ImageRenderer model={model} />,
  'html': <HTMLRenderer model={model} />,
  'pdf': <PDFRenderer model={model} />,
  // 'xls': <ExcelRenderer model={model} />,
  // 'xlsx': <ExcelRenderer model={model} />,
  // 'csv': <ExcelRenderer model={model} />,
});

/** Получение нужного компонента для рендера файла. */
const getRenderer = (model: FileViewModel) => {
  const rendererDict = getRenderersDict(model);
  return rendererDict[model.fileType] || <UnsupportedFile model={model} />;
}

export const FileRenderer = ({model}: FileRendererProps) => {
  return (
    <>
      {getRenderer(model)}
    </>
  );
};
