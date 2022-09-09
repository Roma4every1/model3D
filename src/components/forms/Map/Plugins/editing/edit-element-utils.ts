import { MapModes } from "../../enums";
import { getAngleDelta } from "./editing-utils";
import { getNearestPointIndex, getNearestSegment } from "../../map-utils";


export interface MouseDownEditAction {
  mode: MapModes,
  point: ClientPoint,
  pIndex?: number,
  scale?: MapScale,
}
export interface MouseMoveEditAction {
  mode: MapModes,
  point: ClientPoint,
  pIndex?: number,
  initPoint?: ClientPoint,
}

/* --- Mouse Down Event --- */

export const applyMouseDownActionToPolyline = (element: MapPolyline, action: MouseDownEditAction): void => {
  switch (action.mode) {
    case MapModes.ADD_END: {
      const firstArc = element.arcs[0];
      firstArc.path = firstArc.path.concat([action.point.x, action.point.y]);
      return;
    }
    case MapModes.ADD_BETWEEN: {
      const index = getNearestSegment(action.point, element);
      element.arcs[0].path.splice(index * 2 + 2, 0, action.point.x, action.point.y);
      return;
    }
    case MapModes.DELETE_POINT: {
      const nearestIndex = getNearestPointIndex(action.point, action.scale, element);
      if (nearestIndex) element.arcs[0].path.splice(nearestIndex * 2, 2);
    }
  }
}

/* --- Mouse Move Event --- */

const applyMouseMoveActionToPolyline = (element: MapPolyline, action: MouseMoveEditAction): void => {
  if (action.mode === MapModes.MOVE_POINT && action.pIndex) {
    const firstArcPath = element.arcs[0].path;
    firstArcPath[action.pIndex * 2] = action.point.x;
    firstArcPath[action.pIndex * 2 + 1] = action.point.y;
  }
}
const applyMouseMoveActionToLabel = (element: MapLabel, action: MouseMoveEditAction): void => {
  if (action.mode === MapModes.MOVE) {
    element.x = action.point.x;
    element.y = action.point.y;
  } else if (action.mode === MapModes.ROTATE) {
    const centerPoint: ClientPoint = {x: element.x, y: element.y};
    element.angle += getAngleDelta(centerPoint, action.initPoint, action.point);
  }
}
const applyMouseMoveActionToSign = (element: MapSign, action: MouseMoveEditAction): void => {
  if (action.mode === MapModes.MOVE) {
    element.x = action.point.x;
    element.y = action.point.y;
  }
}

export const applyMouseMoveActionToElement = (element: MapElement, action: MouseMoveEditAction): void => {
  if (element.type === 'polyline') return applyMouseMoveActionToPolyline(element, action);
  if (element.type === 'label') return applyMouseMoveActionToLabel(element, action);
  if (element.type === 'sign') return applyMouseMoveActionToSign(element, action);
}

/* --- Mouse Wheel Event --- */

/**
 * Поворачивает подпись на 4 градуса по/против часовой стрелки.
 * С зажатым шифтом выравнивает угол.
 * */
export const applyRotateToLabel = (element: MapLabel, clockwise: boolean, align: boolean) => {
  if (align) {
    let angle = 0;
    for (let i = -22.5; i < 360; i += 45) {
      if (element.angle === i + 22.5) return element.angle += clockwise ? 45 : -45
      if (element.angle > i && element.angle < i + 45) return element.angle = angle;
      angle += 45;
    }
  } else {
    element.angle += clockwise ? 4 : -4;
  }

  if (element.angle > 360) element.angle -= 360;
  if (element.angle < 0) element.angle += 360;
}
