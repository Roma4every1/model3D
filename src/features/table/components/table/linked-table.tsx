import { useSelector } from 'react-redux';
import { Window } from '@progress/kendo-react-dialogs';
import { Form } from 'widgets/presentation/components/form';
import { presentationSelector } from 'app/store/root-form/root-form.selectors';


interface LinkedTableProps {
  id: FormID,
  onClose: () => void,
}


export const LinkedTable = ({id, onClose}: LinkedTableProps) => {
  const presentation = useSelector(presentationSelector);
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации, либо если привязанной таблицы не существует
  if (!child) { onClose(); return null; }
  const title = child.displayName;

  return (
    <Window
      className={'linked-table-window'} style={{zIndex: 99}}
      width={400} height={300} resizable={true} title={title} onClose={onClose}
    >
      <Form id={id} type={'dataSet'}/>
    </Window>
  );
};
