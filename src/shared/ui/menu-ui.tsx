import type { ReactNode, CSSProperties, MouseEvent } from 'react';
import { Skeleton } from '@progress/kendo-react-indicators';
import { clsx } from 'clsx';
import './menu-ui.scss';


interface MenuSectionProps {
  header: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
interface MenuSectionItemProps {
  className?: string;
  children?: ReactNode;
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
  text: string;
  icon: string;
  title?: string;
  action?: () => void;
  disabled?: boolean;
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

/* --- --- --- */

interface IconRowProps {
  justify?: CSSProperties['justifyContent'];
  gap?: number | string;
  className?: string;
  children?: ReactNode;
}
interface IconRowButtonProps {
  icon: string | ReactNode;
  alt?: string;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}
interface IconRowLinkProps {
  href: string;
  target?: '_blank' | string;
  icon: string;
  alt?: string;
  title?: string;
}

export const IconRow = ({children, justify, className, gap}: IconRowProps) => {
  const cls = clsx(className, 'wm-icon-row');
  const style: CSSProperties = {justifyContent: justify, gap: gap ?? 2};
  return <div className={cls} style={style}>{children}</div>;
};

export const IconRowButton = (props: IconRowButtonProps) => {
  const icon = props.icon;
  const className = props.active ? 'active' : undefined;

  return (
    <button className={className} onClick={props.onClick} disabled={props.disabled} title={props.title}>
      {typeof icon === 'string' ? <img src={icon} alt={props.alt}/> : icon}
    </button>
  );
};

export const IconRowLink = (props: IconRowLinkProps) => {
  return (
    <a href={props.href} target={props.target} title={props.title}>
      <img src={props.icon} alt={props.alt}/>
    </a>
  );
};

/* --- --- --- */

interface BigButtonProps {
  text: string;
  icon: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (event?: MouseEvent) => void;
}

export const BigButton = (props: BigButtonProps) => {
  const { text, icon, className, ...buttonProps } = props;
  const buttonClassName = clsx('map-action', className);

  return (
    <button className={buttonClassName} {...buttonProps}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
};

type BigButtonToggleProps = BigButtonProps & {active?: boolean};

export const BigButtonToggle = (props: BigButtonToggleProps) => {
  const { text, icon, active, className, ...buttonProps} = props;
  const buttonClassName = clsx('map-action', active && 'selected', className);

  return (
    <button className={buttonClassName} {...buttonProps}>
      <div><img src={icon} alt={'icon'}/></div>
      <div>{text}</div>
    </button>
  );
};
