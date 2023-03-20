import { useSelector } from 'react-redux';
import { MenuSection, ButtonStock } from 'shared/ui';
import { caratStateSelector } from '../store/carats.selectors';


export const TracksEditPanel = ({id}: FormEditPanelProps) => {
  const caratState: CaratState = useSelector(caratStateSelector.bind(id));

  return (
    <div className={'menu'}>
      <MenuSection header={'Масштаб'}>
        <ButtonStock text={'Увеличить'} icon={'zoom-in'}/>
        <ButtonStock text={'Уменьшить'} icon={'zoom-out'}/>
        <div>
          <span className={'k-icon k-i-pan'}/>
          <span>1 / </span>
          <input type={'number'} value={caratState?.settings.metersInMeter}/>
        </div>
      </MenuSection>
      <MenuSection header={'Управление колонками'} style={{flexDirection: 'row'}}>
        <div>
          <div>Вправо</div>
          <div>Влево</div>
        </div>
        <TextGrid labels={caratState?.columns.map(c => c.columnSettings.label) || []}/>
      </MenuSection>
      <MenuSection header={'Настройки активной колонки'}>
        <div>Имя</div>
        <div>Ширина</div>
      </MenuSection>
    </div>
  );
};

const TextGrid = ({labels}: {labels: string[]}) => {
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}}>
      {labels.map((label, i) => <div key={i}>{label}</div>)}
    </div>
  );
};
