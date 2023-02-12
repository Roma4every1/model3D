/** Лоадер для формы. */
export const FormSkeleton = () => {
  return <div className={'form-container'}>Загрузка...</div>;
};

/** Заглушка при ошибке инициализации формы. */
export const FormFetchError = ({details}: {details: string}) => {
  return <div className={'map-not-found'}>{details}</div>;
};

/** Заглушка для не поддерживаемых форм. */
export const NotSupportedForm = () => {
  return <div className={'map-not-found'}>Данный тип формы не поддерживается</div>;
};
