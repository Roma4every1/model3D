import { Skeleton, SkeletonProps } from '@progress/kendo-react-indicators';


const skeletonProps: SkeletonProps = {
  shape: 'rectangle',
  style: {width: '100%', height: '100%'},
  animation: {type: 'wave'},
};

/** Лоадер для презентации. */
export const PresentationSkeleton = () => {
  return <Skeleton {...skeletonProps}/>;
};

/** Лоадер для формы. */
export const FormSkeleton = () => {
  return <Skeleton {...skeletonProps}/>;
};
