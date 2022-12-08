import { MenuListItem, MenuSection } from "../common/menu-ui";
import IntegerTextEditor from "../editors/integer-text.editor";


/** Панель редактирования каротажа. */
export default function CaratEditPanel() {
  return (
    <div className={'menu'}>
      <MenuSection header={'Масштаб'}>
        <MenuListItem text={'Увеличить'} icon={'zoom-in'}/>
        <MenuListItem text={'Уменьшить'} icon={'zoom-out'}/>
        <div>
          <span className={'k-icon k-i-pan'}/>
          <span>1 / </span>
          <IntegerTextEditor/>
        </div>
      </MenuSection>
    </div>
  );
}
