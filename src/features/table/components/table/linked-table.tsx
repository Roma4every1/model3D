import { useEffect } from 'react';
import { useActivePresentation } from 'entities/client';
import { Table } from './table';


interface LinkedTableProps {
  id: ClientID;
  onClose: () => void;
}


export const LinkedTable = ({id, onClose}: LinkedTableProps) => {
  const presentation = useActivePresentation();
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации
  useEffect(() => {
    if (!child) onClose();
  }, [child, onClose]);

  if (!child) return null;
  return <Table id={id}/>;
};
