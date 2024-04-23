import { useEffect } from 'react';
import { Table } from './table';
import { useActivePresentationID } from '../../../../app/store/root-form.store';
import { usePresentation } from 'widgets/presentation';


interface LinkedTableProps {
  id: ClientID;
  onClose: () => void;
}


export const LinkedTable = ({id, onClose}: LinkedTableProps) => {
  const activePresentationID = useActivePresentationID();
  const presentation = usePresentation(activePresentationID);
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации
  useEffect(() => {
    if (!child) onClose();
  }, [child, onClose]);

  if (!child) return null;
  return <Table id={id} parent={null} type={null} settings={null} channels={null}/>;
};
