import Container from './DebugContainerClass';

class OfflineStateContainer extends Container {
  state = {
    networkStatus: 'online'
  };

  handleNetworkChange = e => {
    e.type === 'online'
      ? this.setState({ networkStatus: 'online' })
      : this.setState({ networkStatus: 'offline' });
  };
}

export default OfflineStateContainer;
