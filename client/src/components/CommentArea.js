import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';
import classnames from 'classnames';
import axios from 'axios';
import { isEmptyObject } from '../utils/object';

import '../css/NetworkStatus.css';

const SERVER_HOST = 'http://localhost:7777';

const dmp = new DiffMatchPatch();

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
    previousSavedVal: '',
    isSaving: false,
    count: 0,
    comment: {},
    propState: {
      networkStatus: this.props.networkStatus
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log(nextProps.networkStatus);
    // console.log(prevState.propState.networkStatus);
    if (nextProps.networkStatus !== prevState.propState.networkStatus) {
      let stateUpdate = {
        propState: {
          networkStatus: nextProps.networkStatus
        }
      };

      if (nextProps.networkStatus === 'online') {
        stateUpdate.isSaving = true;
      }

      return stateUpdate;
    }

    return prevState;
  }

  componentDidUpdate(prevProps, prevState) {
    this.saveData(this.state.value);
  }

  async componentDidMount() {
    const { data: { count: count } } = await axios.get(
      `${SERVER_HOST}/api/fetch-unpublished/count`
    );

    this.setState({ count });

    if (this.state.count) {
      const { data: { comment: comment } } = await axios.get(
        `${SERVER_HOST}/api/fetch-unpublished`
      );

      this.setState({ comment, value: comment.text });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('prevState', prevState.value);
  }

  async sync(postPath, postData) {
    try {
      const { data: { newComment: newComment } } = await axios.post(
        postPath,
        postData
      );
      this.setState({ comment: newComment, isSaving: false });
    } catch (e) {
      console.error(`Ooops, something went wrong ${e}`);
    }
  }

  saveData = debounce(async value => {
    const postPath = `${SERVER_HOST}/api/sync`;
    if (isEmptyObject(this.state.comment)) {
      /**
       * Send the diff between empty string and current value
       */

      let diffs = dmp.diff_main('', this.state.value);
      let patches = dmp.patch_make('', diffs);

      this.sync(postPath, {
        patches
      });
    } else {
      let savedCommentText = this.state.comment.text;
      let toBeSavedText = this.state.value;

      let diffs = dmp.diff_main(savedCommentText, toBeSavedText);
      let patches = dmp.patch_make(savedCommentText, diffs);

      if (patches.length) {
        this.sync(postPath, {
          _id: this.state.comment._id,
          patches
        });
      }
    }
  }, 2000);

  handleChange = e => {
    let value = e.target.value;

    this.setState({ value, isSaving: true });
    this.saveData(value);
  };

  render() {
    const textareaSpecificProps = {
      name: 'comment',
      id: 'comment',
      cols: '90',
      rows: '10'
    };

    // const { networkStatus } = this.props;
    const { propState: { networkStatus } } = this.state;

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
        <div className="savinStatus">
          {isOnline
            ? this.state.isSaving
              ? 'Syncing'
              : isEmptyObject(this.state.comment) ? null : 'Synced'
            : 'You appear to be offline'}
        </div>
      </section>
    );
  }
}

CommentArea.displayName = 'CommentArea';

export default CommentArea;
