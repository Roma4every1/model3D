import { useSelector } from 'react-redux';
import { MenuSection } from 'shared/ui';
import { caratStateSelector } from '../store/carats.selectors';


/** Панель редактирования каротажа. */
export function CaratEditPanel({id}: FormEditPanelProps) {
  const caratState: CaratState = useSelector(caratStateSelector.bind(id));
  console.log(caratState);

  return (
    <div className={'menu'}>
      <MenuSection header={'Шкала'}>
        <div>Показать сетку</div>
        <div>Делений: n</div>
      </MenuSection>
      <MenuSection header={'Типы кривых'}>
        <div>Select Box</div>
      </MenuSection>
      <MenuSection header={'Настройки типа'}>
        <div>Цвет</div>
        <div>Минимум</div>
        <div>Максимум</div>
      </MenuSection>
    </div>
  );
}
