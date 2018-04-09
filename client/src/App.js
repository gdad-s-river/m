import React from 'react';
import { Provider, Subscribe } from 'unstated';
import { PropTypes } from 'prop-types';

import {
  OfflineStateContainer,
  CommentStateContainer
} from './state-containers';

import { CommentBoxViewContainer } from './view-containers';

import { Header, ErrorBoundary } from './components';
import './css/App.css';

// console.log(CommentBoxViewContainer);

// child
class AppWithNetworkStatusEvents extends React.Component {
  static propTypes = {
    offlineService: PropTypes.object.isRequired
  };

  componentDidMount() {
    const { offlineService } = this.props;
    window.addEventListener('online', offlineService.handleNetworkChange);
    window.addEventListener('offline', offlineService.handleNetworkChange);
  }

  render() {
    const { networkStatus } = this.props.offlineService.state;

    return (
      <div className="App">
        <Header />
        <ErrorBoundary>
          <Subscribe to={[CommentStateContainer]}>
            {commentService => {
              return (
                <CommentBoxViewContainer
                  networkStatus={networkStatus}
                  commentService={commentService}
                />
              );
            }}
          </Subscribe>
        </ErrorBoundary>
      </div>
    );
  }
}

// parent
class AppWithNetworkStatus extends React.Component {
  render() {
    return (
      <Provider>
        <Subscribe to={[OfflineStateContainer]}>
          {offlineService => {
            return (
              <AppWithNetworkStatusEvents offlineService={offlineService} />
            );
          }}
        </Subscribe>
      </Provider>
    );
  }
}

export default AppWithNetworkStatus;
