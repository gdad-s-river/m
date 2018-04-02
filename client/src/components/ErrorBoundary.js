import React from 'react';
import { errorBoundaryMessage } from '../utils/userMessages';
// import PropTypes from 'prop-types';

const ErrorBoundaryStyles = {
  maxWidth: '800px',
  margin: '20px auto'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  logErrorToMyService(error, info) {
    console.log(`error info ${info}`);
    console.error(error);
  }

  componentDidCatch(error, info) {
    this.setState({ error: error, errorInfo: info });

    // ideally log error to a error reporting service
    this.logErrorToMyService(error, info);
  }

  render() {
    const productionEnv = process.env.NODE_ENV === 'production';
    if (this.state.errorInfo) {
      return (
        <React.Fragment>
          {productionEnv ? (
            <section style={ErrorBoundaryStyles}>
              <h1>
                {errorBoundaryMessage(this.props.children.type.displayName)}
              </h1>
            </section>
          ) : null}
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
