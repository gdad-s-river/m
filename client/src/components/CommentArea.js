import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import DiffMatchPatch from 'diff-match-patch';
import classnames from 'classnames';
import axios from 'axios';

import '../css/NetworkStatus.css';

const SERVER_HOST = 'http://localhost:7777';

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
    previousSavedVal: '',
    isSaving: false,
    count: 0,
    comment: {}
  };

  async componentDidMount() {
    // throw new Error('oho');
    // get the saved Value;
    // read comment and set commentId;

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

  saveData = debounce(async value => {
    /**
     * NOTE: This will not be needed when one'd have multiple
     * 'unpublishedComments' associated with say different blogposts
     //  */

    // check if there is previous comment text
    // if (!this.state.comment.text) {
    //   const { data: { comment: newComment } } = await axios.post(
    //     `${SERVER_HOST}/api/sync`,
    //     {
    //       text: this.state.value
    //     }
    //   );

    //   this.setState({ comment: newComment });
    // }

    if (!this.state.comment.text) {
      /**
       * Send the diff between empty string and current value
       */

      let diffs = dmp.diff_main('', this.state.value);
      let patches = dmp.patch_make('', diffs);

      const { data: { newComment: newComment } } = await axios.post(
        `${SERVER_HOST}/api/sync`,
        { patches }
      );

      this.setState({ comment: newComment });
    } else {
      let savedCommentText = this.state.comment.text;
      let toBeSavedText = this.state.value;

      let diffs = dmp.diff_main(savedCommentText, toBeSavedText);
      let patches = dmp.patch_make(savedCommentText, diffs);
    }

    // this.setState({ commentId: id });

    // console.log('new Value', value);
    /** Patch diff here with previousSavedVal and this.state.value */

    // console.log(
    //   'difference between ',
    //   this.state.previousSavedVal,
    //   ' and ',
    //   value
    // );

    // let patches = dmp.patch_make(this.state.previousSavedVal, value);
    // console.log('patches: ', patches[0]);
    // console.log(
    //   'reconstruction ',
    //   dmp.patch_apply(patches, this.state.previousSavedVal)
    // );

    // this.setState({ previousSavedVal: value });
  }, 2000);

  handleChange = e => {
    let value = e.target.value;

    this.setState({ value }, () => {});
    this.saveData(value);
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
        <div className="savinStatus">{this.state.isSaving ? 'Saving' : ''}</div>
      </section>
    );
  }
}

CommentArea.displayName = 'CommentArea';

export default CommentArea;
