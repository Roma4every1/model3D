import { ReactNode, CSSProperties } from "react";


interface MenuSectionProps {
  header: string,
  className?: 'menu-list' | 'map-panel-main'
  style?: CSSProperties,
  children: ReactNode,
}

export const MenuSection = ({header, className, style, children}: MenuSectionProps) => {
  return (
    <section>
      <div className={'menu-header'}>{header}</div>
      <div className={className || 'menu-list'} style={style}>{children}</div>
    </section>
  );
}

/* --- --- --- */

interface MenuListItemProps {
  text: string,
  icon: string,
  onClick?: () => void
}

/** Кнопка с иконкой и подписью.
 * @see https://www.telerik.com/kendo-react-ui/components/styling/icons/
 * */
export const MenuListItem = ({text, icon, onClick}: MenuListItemProps) => {
  return (
    <button onClick={onClick}>
      <span className={'k-icon k-i-' + icon}/>
      <span>{text}</span>
    </button>
  );
}

/* --- --- --- */

interface MenuListItemIconProps {
  text: string,
  src: string,
  alt: string,
  onClick?: () => void
}

export const MenuListItemIcon = ({text, src, alt, onClick}: MenuListItemIconProps) => {
  return (
    <button onClick={onClick}>
      <img src={src} alt={alt}/>
      <span>{text}</span>
    </button>
  );
}
