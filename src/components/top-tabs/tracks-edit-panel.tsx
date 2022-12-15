import { useSelector } from "react-redux";
import { selectors } from "../../store";
import { MenuSection, ButtonIconStock } from "../common/menu-ui";
import IntegerTextEditor from "../editors/integer-text.editor";


export function TracksEditPanel({formID}: PropsFormID) {
  const caratState: CaratState = useSelector(selectors.caratState.bind(formID));

  return (
    <div className={'menu'}>
      <MenuSection header={'Масштаб'}>
        <ButtonIconStock text={'Увеличить'} icon={'zoom-in'}/>
        <ButtonIconStock text={'Уменьшить'} icon={'zoom-out'}/>
        <div>
          <span className={'k-icon k-i-pan'}/>
          <span>1 / </span>
          <IntegerTextEditor value={caratState?.settings.metersInMeter}/>
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
}

const TextGrid = ({labels}: {labels: string[]}) => {
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}}>
      {labels.map((label, i) => <div key={i}>{label}</div>)}
    </div>
  );
}
