import { useEffect } from 'react';
import { useActivePresentation } from 'entities/client';
import { Table } from './table';


interface DetailsTableProps {
  id: ClientID;
  channels: ChannelID[];
  onClose: () => void;
}

export const DetailsTable = ({id, channels, onClose}: DetailsTableProps) => {
  const presentation = useActivePresentation();
  const child = presentation?.children.find(c => c.id === id);

  // закрывает окно при смене презентации
  useEffect(() => {
    if (!child) onClose();
  }, [child, onClose]);

  if (!child) return null;
  return <Table id={id} neededChannels={channels}/>;
};
