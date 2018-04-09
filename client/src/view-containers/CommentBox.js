import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';
import axios from 'axios';
import to from 'await-to-js';

import { CommentBox } from '../components/';

import serverPaths from '../utils/serverPaths';
import logErrorToService from '../utils/logErrorToService';

const dmp = new DiffMatchPatch();

class CommentBoxViewContainer extends Component {
  static propTypes = {
    networkStatus: PropTypes.string.isRequired,
    commentService: PropTypes.object.isRequired
  };

  state = {
    value: '',
    propState: {
      networkStatus: this.props.networkStatus
    }
  };

  setValue = value => {
    this.setState(value);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.networkStatus !== prevState.propState.networkStatus) {
      return {
        propState: {
          networkStatus: nextProps.networkStatus
        }
      };
    }

    const { state } = nextProps.commentService;

    if (state.commentHTTPState === 'fetched') {
      return { value: state.comment.text };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.networkStatus !== this.props.networkStatus &&
      this.props.networkStatus === 'online'
    ) {
      this.saveData(this.save.value);
    }
  }

  async componentDidMount() {
    const { commentService, networkStatus } = this.props;
    const { get, state } = commentService;

    commentService.get(serverPaths.get.unpublishedComment);

    this.preventUserFromLeaving(state.commentHTTPState, networkStatus, state);
  }

  saveData = debounce(async value => {
    const { commentService } = this.props;
    const { state } = commentService;

    const postPath = serverPaths.post.unpublishedComment;

    const savedComment = !state.comment ? '' : state.comment.text;

    let toBeSavedComment = this.state.value;

    // TODO: try named importing them
    console.log(savedComment, toBeSavedComment);
    let diffs = dmp.diff_main(savedComment, toBeSavedComment);

    let patches = dmp.patch_make(savedComment, diffs);

    const postOptions = {
      patches
    };

    if (state.comment) {
      postOptions._id = state.comment._id;
    }

    if (patches.length) {
      commentService.sync(postPath, postOptions);
    }
  }, 2000);

  preventUserFromLeaving(commentHTTPState, networkStatus, state) {
    if (!window) {
      throw new Error(
        'you got to call preventUserFromLeaving function when window is available'
      );
    }

    window.addEventListener('beforeunload', e => {
      if (state.commentHTTPState === 'saving' || networkStatus === 'offline') {
        let confirmationMessage = `\o/`;

        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+

        return confirmationMessage;
      }
    });
  }

  handleChange = newCommentText => {
    // reset post errors before trying to fetch again;
    this.props.commentService.setState({
      error: null,
      commentHTTPState: 'saving'
    });

    this.setState({ value: newCommentText });

    this.saveData(newCommentText);
  };

  render() {
    const { commentService, networkStatus } = this.props;
    const { state } = commentService;
    const { value } = this.state;

    return (
      <CommentBox
        handleChange={this.handleChange}
        commentHTTPState={state.commentHTTPState}
        error={state.error}
        value={value}
        networkStatus={networkStatus}
      />
    );
  }
}

export default CommentBoxViewContainer;
