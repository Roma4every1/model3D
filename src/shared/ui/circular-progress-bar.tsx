import './circular-progress-bar.scss';


interface CircularProgressBarProps {
  size: number
  percentage: number,
}


export const CircularProgressBar = ({percentage, size}: CircularProgressBarProps) => {
  const radius = (size - 10) / 2;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - dashArray * percentage / 100;

  return (
    <div className={'circular-progress-bar'}>
      <svg width={size} height={size}>
        <circle
          className={'circle-background'} strokeWidth={'10px'}
          cx={'50%'} cy={'50%'} r={radius}
        />
        <circle
          className={'circle-progress'} strokeWidth={'8px'}
          cx={'50%'} cy={'50%'} r={radius}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{strokeDasharray: dashArray, strokeDashoffset: dashOffset}}
        />
        <text className={'circle-text'} x={'50%'} y={'50%'} dy={'.3em'}>
          {percentage + '%'}
        </text>
      </svg>
    </div>
  );
};
