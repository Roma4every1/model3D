import { useClientParameters } from 'entities/parameter';
import { ClientParameterList } from './client-parameter-list';


/** Левая панель для внешнего окна. */
export const PopupLeftBorder = ({activeID}: {activeID: ClientID}) => {
  const presentationParameters = useClientParameters(activeID);
  return <ClientParameterList list={presentationParameters ?? []}/>;
};
