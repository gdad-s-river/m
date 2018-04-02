import React from 'react';
import { CommentArea, Header, ErrorBoundary } from './components';
import './css/App.css';

class App extends React.Component {
  state = {
    networkStatus: 'online'
  };

  handleNetwork = e => {
    e.type === 'online'
      ? this.setState({ networkStatus: 'online' })
      : this.setState({ networkStatus: 'offline' });

    // if (e.type === 'online') {
    //   this.handleComingOnline(e.type);
    // } else {
    //   this.handleGoingOffline(e.type);
    // }
  };

  handleComingOnline(networkStateType) {
    this.setState({ networkStatus: networkStateType });
  }

  handleGoingOffline(networkStateType) {
    this.setState({ networkStatus: networkStateType });
  }

  componentDidMount() {
    window.addEventListener('online', this.handleNetwork);
    window.addEventListener('offline', this.handleNetwork);
  }

  render() {
    const { networkStatus } = this.state;

    return (
      <div className="App">
        <Header />
        <ErrorBoundary>
          <CommentArea networkStatus={networkStatus} />
        </ErrorBoundary>
      </div>
    );
  }
}

App.displayName = 'App';

export default App;
