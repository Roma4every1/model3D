import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Window } from '@progress/kendo-react-dialogs';
import { Table } from './table';
import { presentationSelector } from 'app/store/root-form/root-form.selectors';


interface LinkedTableProps {
  id: FormID,
  onClose: () => void,
}


export const LinkedTable = ({id, onClose}: LinkedTableProps) => {
  const presentation = useSelector(presentationSelector);
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации
  useEffect(() => {
    if (!child) onClose();
  }, [child, onClose]);

  if (!child) return null;
  const title = child.displayName;

  return (
    <Window
      className={'linked-table-window'} style={{zIndex: 99}}
      width={400} height={300} resizable={true} title={title} onClose={onClose}
    >
      <Table id={id} parent={null} type={null} settings={null} channels={null}/>
    </Window>
  );
};
