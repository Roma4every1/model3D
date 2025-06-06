import { Button } from 'antd';
import { round } from 'shared/lib';
import './site-reserves-window.scss';


interface SiteReservesDialogProps {
  readonly context: SiteReservesContext;
  readonly close: (e?: any) => void;
}
interface SiteReservesContext {
  /** Участок, по которому считались запасы. */
  readonly site: SiteModel;
  /** Слой карты, с которого взяты поля. */
  readonly layer: IMapLayer;
  /** Значение запасов в тоннах. */
  readonly value: number;
}

/** Содержимое окна с данными расчёта запасов по полю и участку. */
export const SiteReservesWindow = ({context, close}: SiteReservesDialogProps) => {
  const siteName = context.site.name;
  const layerName = context.layer.displayName;

  return (
    <>
      <fieldset>
        <span>Слой: </span>
        <span className={'no-wrap-ellipsis'} title={layerName}>{layerName}</span>
      </fieldset>
      <fieldset>
        <span>Участок: </span>
        <span className={'no-wrap-ellipsis'} title={siteName}>{siteName}</span>
      </fieldset>
      <fieldset>
        <span>Значение: </span>
        <b>{round(context.value, 2)} т.</b>
      </fieldset>
      <div className={'wm-dialog-actions'} style={{gridTemplateColumns: '1fr', marginTop: 8}}>
        <Button onClick={close}>Ок</Button>
      </div>
    </>
  );
};
