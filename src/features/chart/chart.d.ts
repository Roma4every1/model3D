/** Идентификатор оси графика. */
type ChartAxisID = string;
/** Идентификатор свойства графика. */
type ChartPropertyID = string;

/**
 * Тип отображения значений на графике.
 * + `line` — линия
 * + `area` — область
 * + `bar` — гистограмма
 * + `point` — набор точек
 * + `vertical` — вертикальная линия
 */
type ChartDisplayType = 'line' | 'area' | 'bar' | 'point' | 'vertical';

/** Тип кривой на графике.
 * + `linear` — ломанная линия
 * + `natural` — сглаженная линия
 * + `stepAfter` — дискретная линия
 */
type ChartCurveType = 'linear' | 'natural' | 'stepAfter';

/** Значение по оси X на графике; строка только для категорий. */
type ChartXKey = number | string;
/** Тип оси X: числа, даты или категории. */
type ChartXAxisType = 'number' | 'date' | 'category';
/** Тип масштаба оси графика: линейная или логарифмическая. */
type ChartAxisScale = 'linear' | 'log';
/** Расположение оси графика: слева или справа. */
type ChartYAxisLocation = 'left' | 'right';

/** Шаг по времени на графике. */
type ChartDateStep = 'month' | 'year' | 'day';
