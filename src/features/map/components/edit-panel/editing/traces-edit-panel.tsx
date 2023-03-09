import {BigButton, MenuSection} from "../../../../../shared/ui";
import chartDownloadIcon from "../../../../../assets/images/chart/download-png.png";

/** Панель редактирования трассы. */
export const TracesEditPanel = () => {

  return (
    <div className={'menu'}>
      <MenuSection header={'Управление'} className={'map-actions'}>
        <BigButton
          text={'Создать'} icon={chartDownloadIcon}
          action={()=>{}}
        />
        <BigButton
          text={'Удалить'} icon={chartDownloadIcon}
          action={()=>{}} disabled={true}
        />
        <BigButton
          text={'Редактирование'} icon={chartDownloadIcon}
          action={()=>{}} disabled={true}
        />
      </MenuSection>
      <MenuSection header={'Экспорт'} className={'map-actions'}>
        <BigButton
          text={'Сохранить в файл'} icon={chartDownloadIcon}
          action={()=>{}} disabled={true}
        />
        <BigButton
          text={'Загрузить'} icon={chartDownloadIcon}
          action={()=>{}}
        />
      </MenuSection>
      <MenuSection header={'Редактирование'} className={'map-actions'}>
        <BigButton
          text={'Применить'} icon={chartDownloadIcon}
          action={()=>{}} disabled={true}
        />
        <BigButton
          text={'Отменить'} icon={chartDownloadIcon}
          action={()=>{}} disabled={true}
        />
      </MenuSection>
    </div>
  );
};
