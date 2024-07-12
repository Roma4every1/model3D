import { useTranslation } from 'react-i18next';
import { usePrograms } from 'entities/program';
import { MenuSection } from 'shared/ui';
import { ProgramButton } from './program-button';
import './program-list.scss';


/** Список доступных программ/отчётов презентации. */
export const ProgramList = ({id}: {id: ClientID}) => {
  const { t } = useTranslation();
  const headerTitle = t('program.programs');

  const programs = usePrograms(id);
  if (!programs) return <MenuSection header={headerTitle}/>;

  const toButton = (program: Program) => {
    return <ProgramButton key={program.orderIndex} program={program}/>;
  };

  return (
    <MenuSection header={headerTitle} className={'program-list'}>
      {programs.length ? programs.map(toButton) : t('program.no-programs')}
    </MenuSection>
  );
};
