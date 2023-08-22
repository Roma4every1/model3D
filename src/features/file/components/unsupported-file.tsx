import { saveAs } from '@progress/kendo-file-saver';


interface UnsupportedFileProps {
  /** Модель просматриваемого файла. */
  model: FileViewModel;
}


/** Заглушка для неподдерживаемого расширения файла. */
export const UnsupportedFile = ({model}: UnsupportedFileProps) => {
  const onClick = () => {
    saveAs(model.data, model.fileName);
  };

  return (
    <div className={'wm-text-info file-view-unsupported'}>
      <div>
        <span>Предпросмотр файла </span>
        <strong>{model.fileName}</strong>
        <span> недоступен</span>
      </div>
      <button onClick={onClick}>Загрузить</button>
    </div>
  );
};
