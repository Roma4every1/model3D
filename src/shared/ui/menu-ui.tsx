import { ReactNode, CSSProperties, MouseEvent } from 'react';
import { Skeleton } from '@progress/kendo-react-indicators';
import './menu-ui.scss';


interface MenuSectionProps {
  header: string,
  className?: string,
  style?: CSSProperties,
  children: ReactNode,
}
interface MenuSectionItemProps {
  className?: string,
  children?: ReactNode,
}

export const MenuSection = ({header, className, style, children}: MenuSectionProps) => {
  return (
    <section>
      <div className={'menu-header'}>{header}</div>
      <div className={className || 'menu-list'} style={style}>{children}</div>
    </section>
  );
};

export const MenuSectionItem = ({className, children}: MenuSectionItemProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const mapSectionSkeletons = (width: string, i) => <MenuSectionSkeleton key={i} width={width}/>;

export const MenuSkeleton = ({template}: {template: string[]}) => {
  return (
    <div className={'menu'}>
      {template.map(mapSectionSkeletons)}
    </div>
  );
};

const MenuSectionSkeleton = ({width}: {width: string}) => {
  return (
    <section className={'menu-section-skeleton'} style={{width}}>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    </section>
  );
};

/* --- --- --- */

interface ButtonIconProps {
  text: string,
  icon: string,
  title?: string,
  action?: () => void
  disabled?: boolean,
}

/** Кнопка с иконкой и подписью. */
export const ButtonIcon = ({text, icon, title, action, disabled}: ButtonIconProps) => {
  return (
    <button onClick={action} title={title} disabled={disabled}>
      <img src={icon} alt={'icon'}/>
      <span>{text}</span>
    </button>
  );
};

/** Кнопка с иконкой _Telerik_ и подписью.
 * @see https://www.telerik.com/kendo-react-ui/components/styling/icons/
 * */
export const ButtonStock = ({text, icon, title, action, disabled}: ButtonIconProps) => {
  return (
    <button onClick={action} title={title} disabled={disabled}>
      <span className={'k-icon k-i-' + icon}/>
      <span>{text}</span>
    </button>
  );
};

/** Кнопка с иконкой _Telerik_.
 * @see https://www.telerik.com/kendo-react-ui/components/styling/icons/
 * */
export const ButtonIconStock = ({icon, title, action, disabled}: Omit<ButtonIconProps, 'text'>) => {
  return (
    <button onClick={action} title={title} disabled={disabled}>
      <span className={'k-icon k-i-' + icon}/>
    </button>
  );
};

/* --- --- --- */

interface ButtonIconRowProps {
  justifyContent?: string,
  gap?: number | string,
  children?: ReactNode,
}
interface ButtonIconRowItemProps {
  icon: string,
  alt?: string,
  title?: string,
  active?: boolean,
  onClick?: () => void,
}

export const ButtonIconRow = ({children, justifyContent, gap}: ButtonIconRowProps) => {
  return (
    <div className={'button-icon-row'} style={{justifyContent, gap}}>
      {children}
    </div>
  );
};

export const ButtonIconRowItem = ({icon, alt, title, active, onClick}: ButtonIconRowItemProps) => {
  return (
    <button className={active ? 'active' : undefined} onClick={onClick}>
      <img src={icon} alt={alt} title={title}/>
    </button>
  );
};

/* --- --- --- */

interface BigButtonProps {
  text: string,
  icon: string,
  action?: (event?: MouseEvent) => void,
  disabled?: boolean,
}

export const BigButton = ({text, icon, action, disabled}: BigButtonProps) => {
  return (
    <button className={'map-action'} onClick={action} disabled={disabled}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
};

type BigButtonToggleProps = BigButtonProps & {active?: boolean};

export const BigButtonToggle = ({text, icon, active, action, disabled}: BigButtonToggleProps) => {
  const className = 'map-action' + (active ? ' selected' : '');
  return (
    <button className={className} onClick={action} disabled={disabled}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
};
