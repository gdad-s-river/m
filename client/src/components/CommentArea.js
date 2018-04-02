import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';
import classnames from 'classnames';

import '../css/NetworkStatus.css';

const dmp = new DiffMatchPatch();
// import idb from 'idb';

const commentAreaStyles = {};
const textareaStyles = {
  margin: '15px 0'
};
const networkStatusMessageStyles = {};

class CommentArea extends Component {
  static propTypes = {
    networkStatus: PropTypes.string
  };

  state = {
    value: '',
    previousSavedVal: ''
  };

  componentDidMount() {
    // throw new Error('oho');
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('prevState', prevState.value);
  }

  saveData = debounce(value => {
    // console.log('new Value', value);
    /** Patch diff here with previousSavedVal and this.state.value */

    // console.log(
    //   'difference between ',
    //   this.state.previousSavedVal,
    //   ' and ',
    //   value
    // );

    let patches = dmp.patch_make(this.state.previousSavedVal, value);
    // console.log('patches: ', patches[0]);
    // console.log(
    //   'reconstruction ',
    //   dmp.patch_apply(patches, this.state.previousSavedVal)
    // );

    this.setState({ previousSavedVal: value });
  }, 2000);

  handleChange = e => {
    let value = e.target.value;

    this.setState({ value }, () => {
      this.saveData(this.state.value);
    });
  };

  render() {
    const textareaSpecificProps = {
      name: 'comment',
      id: 'comment',
      cols: '90',
      rows: '10'
    };

    const { networkStatus } = this.props;

    const isOnline = networkStatus === 'online';

    let networkMessageClasses = classnames(
      'networkMessage',
      isOnline ? 'online' : 'offline'
    );

    let networkStatusText = isOnline
      ? 'You can start writing, and text will auto sync with the server'
      : 'Oops, Network is down';

    return (
      <section style={commentAreaStyles}>
        <textarea
          {...textareaSpecificProps}
          style={textareaStyles}
          value={this.state.value}
          onChange={this.handleChange}
        />
        <div className={networkMessageClasses}>{networkStatusText} </div>
      </section>
    );
  }
}

CommentArea.displayName = 'CommentArea';

export default CommentArea;
