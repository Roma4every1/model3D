import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table } from './table';
import { presentationSelector } from 'app/store/root-form/root-form.selectors';


interface LinkedTableProps {
  id: ClientID;
  onClose: () => void;
}


export const LinkedTable = ({id, onClose}: LinkedTableProps) => {
  const presentation = useSelector(presentationSelector);
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации
  useEffect(() => {
    if (!child) onClose();
  }, [child, onClose]);

  if (!child) return null;
  return <Table id={id} parent={null} type={null} settings={null} channels={null}/>;
};
