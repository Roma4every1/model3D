import {TXTRenderer} from "./renderers/txt/txt-renderer.tsx";
import {ImageRenderer} from "./renderers/image/image-renderer.tsx";
import {PDFRenderer} from "./renderers/pdf/pdf-renderer.tsx";
import {UnsupportedFile} from "./unsupported-file.tsx";
import {ExcelRenderer} from "./renderers/excel/excel-renderer.tsx";
import {CsvRenderer} from "./renderers/csv-renderer/csv-renderer.tsx";
import {MsWordRenderer} from "./renderers/ms-word/ms-word-renderer.tsx";

/** Получение словаря компонентов рендера для расширений файлов. */
const getRenderersDict = (model: FileViewModel) => ({
    'txt': <TXTRenderer model={model} /> ,
    'svg': <ImageRenderer model={model} /> ,
    'png': <ImageRenderer model={model} />,
    'bmp': <ImageRenderer model={model} />,
    'jpg': <ImageRenderer model={model} />,
    'jpeg': <ImageRenderer model={model} />,
    'html': <PDFRenderer model={model} />,
    'pdf': <PDFRenderer model={model} />,
    'xlsx': <ExcelRenderer model={model} />,
    'csv': <CsvRenderer model={model} />,
    'docx': <MsWordRenderer model={model} />,
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
