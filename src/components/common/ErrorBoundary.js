import React from "react";
import { withTranslation } from "react-i18next";


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Обновить состояние с тем, чтобы следующий рендер показал запасной UI.
    return { hasError: true };
  }

  // componentDidCatch(error, errorInfo) {
  //   // Можно также сохранить информацию об ошибке в соответствующую службу журнала ошибок
  //   // logErrorToMyService(error, errorInfo);
  // }

  render() {
    return this.state.hasError ? <h1>{this.props.t('base.wrong')}</h1> : this.props.children
  }
}

export default withTranslation()(ErrorBoundary);
