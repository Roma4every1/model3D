/** Получает расстояние между двумя точками в двумерном пространстве. */
export const getPointsDistance2D = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2))
}

/** Получает расстояние между двумя точками, учитывая глубины. */
export const getPointsDistance3D = (point1: Point, point2: Point, depth1: number, depth2: number) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2) + Math.pow(depth1 - depth2, 2));
}
