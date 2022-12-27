import { ReactNode, CSSProperties, MouseEvent } from "react";
import { Skeleton } from "@progress/kendo-react-indicators";


interface MenuSectionProps {
  header: string,
  className?: 'menu-list' | 'map-panel-main' | 'map-actions',
  style?: CSSProperties,
  children: ReactNode,
}

export function MenuSection({header, className, style, children}: MenuSectionProps) {
  return (
    <section>
      <div className={'menu-header'}>{header}</div>
      <div className={className || 'menu-list'} style={style}>{children}</div>
    </section>
  );
}

const mapSectionSkeletons = (width: string, i) => <MenuSectionSkeleton key={i} width={width}/>;

export function MenuSkeleton({template}: {template: string[]}) {
  return (
    <div className={'menu'}>
      {template.map(mapSectionSkeletons)}
    </div>
  );
}

export function MenuSectionSkeleton({width}: {width: string}) {
  return (
    <section className={'menu-section-skeleton'} style={{width}}>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    </section>
  );
}

/* --- --- --- */

interface ButtonIconProps {
  text: string,
  icon: string,
  title?: string,
  action?: () => void
}

/** Кнопка с иконкой и подписью. */
export function ButtonIcon({text, icon, title, action}: ButtonIconProps) {
  return (
    <button onClick={action} title={title}>
      <img src={icon} alt={'icon'}/>
      <span>{text}</span>
    </button>
  );
}

/** Кнопка с иконкой _Telerik_ и подписью.
 * @see https://www.telerik.com/kendo-react-ui/components/styling/icons/
 * */
export function ButtonIconStock({text, icon, title, action}: ButtonIconProps) {
  return (
    <button onClick={action} title={title}>
      <span className={'k-icon k-i-' + icon}/>
      <span>{text}</span>
    </button>
  );
}

/* --- --- --- */

interface BigButtonProps {
  text: string,
  icon: string,
  action: (event?: MouseEvent) => void,
  disabled?: boolean,
}

export function BigButton({text, icon, action, disabled}: BigButtonProps) {
  return (
    <button className={'map-action'} onClick={action} disabled={disabled}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
}

export function BigButtonToggle({text, icon, active, action, disabled}: BigButtonProps & {active: boolean}) {
  const className = 'map-action' + (active ? ' selected' : '');
  return (
    <button className={className} onClick={action} disabled={disabled}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
}
