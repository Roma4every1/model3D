import { MapMode } from '../../../lib/constants';
import { distance } from 'shared/lib';
import { getNearestPointIndex, getNearestSegment, PIXEL_PER_METER } from '../../../lib/map-utils';


export interface MouseDownEditAction {
  mode: MapMode;
  point: Point;
  pIndex?: number;
  scale?: MapScale;
}
export interface MouseMoveEditAction {
  mode: MapMode;
  point: Point;
  pIndex?: number;
}

/* --- Mouse Down Event --- */

export function applyMouseDownActionToPolyline(element: MapPolyline, action: MouseDownEditAction): void {
  switch (action.mode) {
    case MapMode.ADD_END: {
      element.arcs[0].path.push(action.point.x, action.point.y);
      return;
    }
    case MapMode.ADD_BETWEEN: {
      if (element.arcs[0].path.length < 3) return;
      const index = getNearestSegment(action.point, element);
      element.arcs[0].path.splice(index * 2 + 2, 0, action.point.x, action.point.y);
      return;
    }
    case MapMode.DELETE_POINT: {
      if (element.arcs[0].path.length < 3) return;
      const nearestIndex = getNearestPointIndex(action.point, action.scale, element);
      if (typeof nearestIndex === 'number') element.arcs[0].path.splice(nearestIndex * 2, 2);
    }
  }
}

/* --- Mouse Move Event --- */

export function applyMouseMoveActionToElement(element: MapElement, action: MouseMoveEditAction): void {
  if (element.type === 'polyline') return applyMouseMoveActionToPolyline(element, action);
  if (element.type === 'label') return applyMouseMoveActionToLabel(element, action);
  if (element.type === 'sign') return applyMouseMoveActionToSign(element, action);
  if (element.type === 'pieslice') return applyMouseMoveActionToPieSlice(element, action);
}
function applyMouseMoveActionToPolyline(element: MapPolyline, action: MouseMoveEditAction): void {
  if (action.mode === MapMode.MOVE_POINT && typeof action.pIndex === 'number') {
    const firstArcPath = element.arcs[0].path;
    firstArcPath[action.pIndex * 2] = action.point.x;
    firstArcPath[action.pIndex * 2 + 1] = action.point.y;
  }
}
function applyMouseMoveActionToLabel(element: MapLabel, action: MouseMoveEditAction): void {
  if (action.mode === MapMode.MOVE) {
    element.x = action.point.x;
    element.y = action.point.y;
  } else if (action.mode === MapMode.ROTATE) {
    const centerPoint: Point = {
      x: element.x + (element.xoffset || 0) * 0.001 * PIXEL_PER_METER,
      y: element.y - (element.yoffset || 0) * 0.001 * PIXEL_PER_METER
    };
    element.angle = getAngle(centerPoint, action.point);
  }
}
function applyMouseMoveActionToSign(element: MapSign, action: MouseMoveEditAction): void {
  if (action.mode === MapMode.MOVE) {
    element.x = action.point.x;
    element.y = action.point.y;
  }
}
function applyMouseMoveActionToPieSlice(element: MapPieSlice, action: MouseMoveEditAction): void {
  if (action.mode === MapMode.MOVE) {
    element.x = action.point.x;
    element.y = action.point.y;
  }
}

/* --- Mouse Wheel Event --- */

/**
 * Поворачивает подпись на 4 градуса по/против часовой стрелки.
 * С зажатым шифтом выравнивает угол.
 * */
export function applyRotateToLabel(element: MapLabel, clockwise: boolean, align: boolean) {
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

function getAngle(centerPoint: Point, currentPoint: Point): number {
  currentPoint.x -= centerPoint.x;
  currentPoint.y -= centerPoint.y;
  currentPoint.x /= distance({x: 0, y: 0}, currentPoint);
  return Math.sign(-currentPoint.y) * Math.acos(currentPoint.x) * 180 / Math.PI;
}
