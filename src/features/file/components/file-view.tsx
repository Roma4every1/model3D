import { useSelector } from 'react-redux';
import { fileViewStateSelector } from '../store/file-view.selectors';


export const FileView = ({id}: FormState) => {
  const state = useSelector(fileViewStateSelector.bind(id));
  console.log(state);
  return <div>file</div>;
};
