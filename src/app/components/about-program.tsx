import type { TFunction } from 'react-i18next';
import { version } from '../../../package.json';

import './about-program.scss';
import debugIcon from 'assets/menu/debug.svg';
import externalLinkIcon from 'assets/common/external-link.svg';


interface AboutProgramWindowProps {
  config: ClientConfig;
  t: TFunction;
}
interface ExternalLinkProps {
  href: string;
  title?: string;
}


/** Диалог "О программе". */
export const AboutProgramWindow = ({config, t}: AboutProgramWindowProps) => {
  return (
    <div className={'about-program'}>
      <div className={'header'}>JS Well Manager Web</div>
      <div style={{paddingBottom: 8}}>
        <div>{t('about.version')}: {version}</div>
        <div className={'link-list'}>
          <a href={'mailto:' + config.contactEmail}>{t('about.support')}</a>
          <ExternalLink href={config.userDocLink} title={t('about.manual')}/>
          <ExternalLink href={'https://geospline.com'} title={t('about.site')}/>
        </div>
      </div>
      {config.devMode && <DevModeSection config={config} t={t}/>}
      <div className={'copyright'}>&copy; НПООО &#171;ГЕОСПЛАЙН&#187;</div>
    </div>
  );
};

const DevModeSection = ({config, t}: AboutProgramWindowProps) => {
  return (
    <>
      <div className={'header'}>
        <img src={debugIcon} alt={'icon'} width={16} height={16}/>
        {t('about.dev-mode')}
      </div>
      <div style={{padding: '8px 0'}}>
        <div>
          <span>API: </span>
          <ExternalLink href={config.webServicesURL}/>
        </div>
        {config.devDocLink && <div>
          <span>{t('about.doc')}: </span>
          <ExternalLink href={config.devDocLink}/>
        </div>}
      </div>
    </>
  );
};

const ExternalLink = ({href, title}: ExternalLinkProps) => {
  return (
    <a href={href} target={'_blank'}>
      <span>{title ?? href}</span>
      <img src={externalLinkIcon} alt={'external-link'}/>
    </a>
  );
};
