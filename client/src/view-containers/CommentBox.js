import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';

import { CommentBox } from '../components/';

import serverPaths from '../utils/serverPaths';
import { isEmptyObject } from '../utils/object';

const dmp = new DiffMatchPatch();

class CommentBoxViewContainer extends Component {
  static propTypes = {
    networkStatus: PropTypes.string.isRequired,
    commentService: PropTypes.object.isRequired
  };

  state = {
    value: ''
  };

  setValue = value => {
    this.setState(value);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { state } = nextProps.commentService;

    // if comment is fetched; put it in the state so that
    // it can be passed down to presentational 'components/CommentBox'
    if (state.commentHTTPState === 'fetched') {
      return { value: state.comment.text };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { commentService } = this.props;
    if (prevProps.networkStatus !== this.props.networkStatus) {
      if (this.props.networkStatus === 'online') {
        this.saveData(this.state.value);
        // reset all errors
        commentService.setState({
          commentHTTPState: 'idle',
          error: {}
        });
      } else {
        commentService.setState({
          commentHTTPState: 'error',
          error: {
            message: 'You are offline'
          }
        });
      }
    }
  }

  async componentDidMount() {
    const { commentService, networkStatus } = this.props;
    // const { networkStatus } = this.state.propState;
    const { state } = commentService;

    this.preventUserFromLeaving(state.commentHTTPState, networkStatus);

    commentService.get(serverPaths.get.unpublishedComment);
  }

  saveData = debounce(async value => {
    const { commentService } = this.props;
    const { state } = commentService;

    const postPath = serverPaths.post.unpublishedComment;

    const previousCommentIsEmpty = isEmptyObject(state.comment);
    let savedComment = previousCommentIsEmpty ? '' : state.comment.text;
    let toBeSavedComment = this.state.value;

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
    } else {
      commentService.setState({ commentHTTPState: 'Nothing Changed' });
    }
  }, 2000);

  preventUserFromLeaving(commentHTTPState, networkStatus) {
    if (!window) {
      throw new Error(
        'you got to call preventUserFromLeaving function when window is available'
      );
    }

    window.addEventListener('beforeunload', e => {
      if (commentHTTPState === 'saving' || networkStatus === 'offline') {
        let confirmationMessage = 'o/';

        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+

        return confirmationMessage;
      }
    });
  }

  handleChange = newCommentText => {
    // reset post errors before trying to fetch again;
    this.props.commentService.setState({
      error: {},
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
