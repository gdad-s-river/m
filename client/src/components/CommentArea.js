import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';
import classnames from 'classnames';
import axios from 'axios';

import { isEmptyObject } from '../utils/object';

import '../css/NetworkStatus.css';

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;

const dmp = new DiffMatchPatch();

const commentAreaStyles = {};
const textareaStyles = {
  margin: '15px 0'
};

class CommentArea extends Component {
  static propTypes = {
    networkStatus: PropTypes.string
  };

  state = {
    value: '',
    isSaving: false,
    count: 0,
    comment: {},
    propState: {
      networkStatus: this.props.networkStatus
    },
    errors: {}
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.networkStatus !== prevState.propState.networkStatus) {
      let stateUpdate = {
        propState: {
          networkStatus: nextProps.networkStatus
        }
      };

      return stateUpdate;
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.networkStatus !== this.props.networkStatus) {
      this.setState({ errors: {} });
      this.saveData(this.state.value);
    }
  }

  async componentDidMount() {
    const { data: { count } } = await axios.get(
      `${SERVER_HOST}/api/fetch-unpublished/count`
    );

    this.setState({ count });

    if (this.state.count) {
      await this.get();
    }

    window.addEventListener('beforeunload', e => {
      if (this.state.isSaving || this.propState.networkStatus === 'offline') {
        var confirmationMessage = 'o/';

        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
        return confirmationMessage;
      }
    });
  }

  async get() {
    try {
      const { data: { comment } } = await axios.get(
        `${SERVER_HOST}/api/fetch-unpublished`
      );

      this.setState({ comment, value: comment.text, errors: {} });
    } catch (e) {
      console.log(`There was an error while trying to fetch comment - ${e}`);
      this.setState({
        errors: {
          get: 'There was an error while fetching the comment'
        },
        isSaving: false
      });
    }
  }

  async sync(postPath, postData) {
    this.setState({ isSaving: true });
    try {
      const { data: { newComment } } = await axios.post(postPath, postData);
      this.setState({ comment: newComment, isSaving: false, errors: {} });
    } catch (e) {
      // very bloated error handling; provide a separate error
      // handling utility;
      let maxLength;
      let errorMessage;
      if (e.response) {
        const { data: { errors: { text: { kind } } } } = e.response;
        if (kind === 'maxlength') {
          maxLength = e.response.data.errors.text.properties.maxlength;
          errorMessage = `Text can't have more than ${maxLength} characters`;
        } else {
          errorMessage = `There was error while saving the comment`;
        }
      }

      console.error(`There was an error while trying to save comment — ${e}`);
      this.setState({
        errors: {
          post: errorMessage
        }
      });
    }
  }

  saveData = debounce(async value => {
    const postPath = `${SERVER_HOST}/api/sync`;

    const previousCommentIsEmpty = isEmptyObject(this.state.comment);

    let savedCommentText = previousCommentIsEmpty
      ? ''
      : this.state.comment.text;

    let toBeSavedText = this.state.value;

    let diffs = dmp.diff_main(savedCommentText, toBeSavedText);
    let patches = dmp.patch_make(savedCommentText, diffs);

    const postOptions = {
      patches
    };

    if (!previousCommentIsEmpty) {
      postOptions._id = this.state.comment._id;
    }

    if (patches.length) {
      this.sync(postPath, postOptions);
    } else {
      this.setState({ isSaving: false });
    }
  }, 2000);

  handleChange = e => {
    let value = e.target.value;

    // reset errors for every change
    this.setState({ errors: {} });

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

    const {
      propState: { networkStatus },
      errors,
      comment,
      isSaving
    } = this.state;

    const isOnline = networkStatus === 'online';

    let networkMessageClasses = classnames(
      'networkMessage',
      isOnline ? 'online' : 'offline'
    );

    let networkStatusText = isOnline
      ? 'You are online! can start writing, and text will auto sync with the server'
      : 'Oops, Network is down, you appear to be offline';

    /**
     * used index as keys because all three points in the following articles meets
     * the requirements — https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318
     */
    const errorsElements = !isEmptyObject(errors)
      ? Object.keys(errors).map((errorType, i) => {
          return (
            <div key={i} className={`error-${errorType}`}>
              {errors[errorType]}
            </div>
          );
        })
      : null;

    const savingStatus = isOnline
      ? isSaving
        ? !isEmptyObject(errors) ? 'Error See Below' : 'Syncing'
        : !isEmptyObject(errors)
          ? 'Error See Below'
          : !isEmptyObject(comment) ? 'Synced' : null
      : `Can't autosave anymore network down 🏳️. But! you can keep writing, and it'll save as soon as network is online again 🏁`;

    return (
      <section style={commentAreaStyles}>
        <textarea
          {...textareaSpecificProps}
          style={textareaStyles}
          value={this.state.value}
          onChange={this.handleChange}
        />
        <div className={networkMessageClasses}>{networkStatusText} </div>
        <div className="savinStatus">{savingStatus}</div>
        <div className="errors" style={{ color: '#ff576c' }}>
          {errorsElements}
        </div>
      </section>
    );
  }
}

CommentArea.displayName = 'CommentArea';

export default CommentArea;
