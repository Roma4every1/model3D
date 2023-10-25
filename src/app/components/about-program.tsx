import { TFunction } from 'react-i18next';
import PACKAGE from '/package.json';

import './about-program.scss';
import debugIcon from 'assets/images/menu/debug.svg';
import externalLinkIcon from 'assets/images/common/external-link.svg';


interface AboutProgramWindowProps {
  config: ClientConfiguration;
  t: TFunction;
}
interface SectionProps {
  header: string;
  icon?: string;
  children: any;
}
interface SectionItemProps {
  text: string;
  children: any;
}
interface ExternalLinkProps {
  href: string;
  title?: string;
}


/** Диалог "О программе". */
export const AboutProgramWindow = ({config, t}: AboutProgramWindowProps) => {
  return (
    <div className={'about-program'}>
      <Section header={'Well Manager'}>
        <SectionItem text={t('about.version')}>
          <b>{PACKAGE['version']}</b>
        </SectionItem>
        <SectionItem text={t('about.doc')}>
          <ExternalLink href={config.userDocLink}/>
        </SectionItem>
        <div className={'no-user-select'}>&nbsp;</div>
        <SectionItem text={t('about.site')}>
          <ExternalLink href={'https://geospline.com'} title={'geospline.com'}/>
        </SectionItem>
        <SectionItem text={t('about.contact-email')}>
          <a href={'mailto:' + config.contactEmail}>{config.contactEmail}</a>
        </SectionItem>
      </Section>
      {config.devMode && <Section header={t('about.dev-mode')} icon={debugIcon}>
        <SectionItem text={'API'}>
          <ExternalLink href={config.webServicesURL}/>
        </SectionItem>
        <SectionItem text={t('about.doc')}>
          <ExternalLink href={config.devDocLink}/>
        </SectionItem>
      </Section>}
    </div>
  );
};

const Section = ({header, icon, children}: SectionProps) => {
  return (
    <section>
      <div className={'section-header'}>
        {icon && <img src={icon} alt={'icon'}/>}
        {header}
      </div>
      <div className={'section-body'}>{children}</div>
    </section>
  );
};

const SectionItem = ({text, children}: SectionItemProps) => {
  return (
    <div>
      <span>{text}: </span>
      {children}
    </div>
  );
};

const ExternalLink = ({href, title}: ExternalLinkProps) => {
  return (
    <a href={href} target={'_blank'}>
      <span style={{marginRight: 4}}>{title ?? href}</span>
      <img src={externalLinkIcon} alt={'external-link'}/>
    </a>
  );
};
