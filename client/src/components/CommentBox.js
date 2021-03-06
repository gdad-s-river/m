import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import '../css/NetworkStatus.css';

const textareaSpecificProps = {
  name: 'comment',
  id: 'comment',
  cols: '90',
  rows: '10'
};

// TODO: change to css styles
const textareaStyles = {
  margin: '15px 0'
};

class CommentBox extends Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    commentHTTPState: PropTypes.string.isRequired,
    error: PropTypes.object,
    value: PropTypes.string.isRequired,
    networkStatus: PropTypes.string.isRequired
  };

  handleChange = e => {
    const value = e.target.value;

    this.props.handleChange(value);
  };

  render() {
    const { commentHTTPState, error, value, networkStatus } = this.props;

    const isOnline = networkStatus === 'online';

    const networkMessageClasses = classnames(
      'networkMessage',
      isOnline ? 'online' : 'offline'
    );

    let networkStatusText = isOnline
      ? 'You are online! can start writing, and text will auto sync with the server'
      : `Oops, Network is down, you appear to be offline`;

    /**
     * used index as keys because all three points in the following articles meets
     * the requirements — https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318
     */

    const errorsElement =
      error.message && !!error.message.length ? (
        <div className={`error-`}>{error.message}</div>
      ) : null;

    const commentStatus = isOnline
      ? commentHTTPState
      : `Can't autosave anymore network down 🏳️. But! you can keep writing, and it'll save as soon as network is online again 🏁`;

    return (
      <section>
        <textarea
          {...textareaSpecificProps}
          style={textareaStyles}
          value={value}
          onChange={this.handleChange}
        />
        <div className={networkMessageClasses}>{networkStatusText} </div>
        <div className="savinStatus">{commentStatus}</div>
        <div className="error" style={{ color: '#ff576c' }}>
          {errorsElement}
        </div>
      </section>
    );
  }
}

export default CommentBox;
