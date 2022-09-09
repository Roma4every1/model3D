import { useDispatch } from "react-redux";
import { TFunction, useTranslation } from "react-i18next";

import { MapModes, MapModes as Modes } from "../../enums";
import { mapEditIconsDict } from "../../../../dicts/images";
import { actions } from "../../../../../store";


interface EditElementProps {
  type: string,
  mode: Modes,
  formID: FormID,
}
interface EditItemProps {
  ownMode: Modes,
  selected: boolean,
  t: TFunction,
  action: () => void,
}


/** Подсказки режимов редактирования. */
const translationDict: {[key: number]: string} = {
  10: 'map.editing.move-map',     // MapModes.MOVE_MAP
  11: 'map.editing.move',         // MapModes.MOVE
  12: 'map.editing.rotate',       // MapModes.ROTATE
  21: 'map.editing.move-point',   // MapModes.MOVE_POINT
  22: 'map.editing.add-end',      // MapModes.ADD_END
  23: 'map.editing.add-between',  // MapModes.ADD_BETWEEN
  24: 'map.editing.delete-point', // MapModes.DELETE_POINT
};

/** Доступные режимы редактирования для выбранных элементов карты. */
const elementsModes: {[key: string]: Modes[]} = {
  'polyline': [Modes.MOVE_MAP, Modes.MOVE_POINT, Modes.ADD_END, Modes.ADD_BETWEEN, Modes.DELETE_POINT],
  'label': [Modes.MOVE_MAP, Modes.MOVE, MapModes.ROTATE],
  'sign': [Modes.MOVE_MAP, Modes.MOVE],
};

const EditItem = ({ownMode, selected, t, action}: EditItemProps) => {
  const src = mapEditIconsDict[ownMode], alt = translationDict[ownMode];
  return (
    <button className={selected ? 'selected' : undefined} onClick={action}>
      <img src={src} alt={alt} title={t(alt)}/>
    </button>
  );
}

export const EditElement = ({type, mode, formID}: EditElementProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const buttons = (elementsModes[type] || []).map((ownMode) => {
    const action = () => {
      if (mode < MapModes.MOVE_MAP) dispatch(actions.startMapEditing(formID));

      mode === ownMode
        ? dispatch(actions.setEditMode(formID, Modes.NONE))
        : dispatch(actions.setEditMode(formID, ownMode));
    }
    return <EditItem key={ownMode} ownMode={ownMode} selected={ownMode === mode} t={t} action={action}/>;
  });
  return <div className={'map-edit-element'}>{buttons}</div>;
}
