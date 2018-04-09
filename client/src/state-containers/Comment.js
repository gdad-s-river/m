import Container from './DebugContainerClass';
import * as axios from 'axios';
import to from 'await-to-js';

import logErrorToService from '../utils/logErrorToService';

class CommentStateContainer extends Container {
  state = {
    commentHTTPState: 'idle', // 'fetching', 'error', 'saved', 'saving', 'fetched'
    comment: null,
    error: null
  };

  async get(getPath) {
    this.setState({
      commentHTTPState: 'fetching'
    });

    const [err, { data: { comment } }] = await to(axios.get(getPath));

    if (err) {
      let errMessage =
        err.message || `There was error while fetching the comment`;

      logErrorToService(err, err.message);

      this.setState({
        commentHTTPState: 'error',
        error: {
          message: errMessage,
          error: err
        }
      });
    }

    if (comment) {
      this.setState({
        comment,
        commentHTTPState: 'fetched',
        error: null
      });
    }

    // WATCH WHAT YOU DO HERE

    // if there is no comment; there is no error, do nothing
    // set the state to idle

    this.setState({
      commentHTTPState: 'idle'
    });
  }

  async sync(postPath, postData) {
    this.setState({ commentHTTPState: 'saving' });
    const [err, { data: newComment }] = await to(
      axios.post(postPath, postData)
    );

    if (err) {
      let maxLength;
      let errorMessage;
      if (err.response) {
        const { data: { errors: { text: { kind } } } } = err.response;
        if (kind === 'maxlength') {
          maxLength = err.response.data.errors.text.properties.maxlength;
          errorMessage = `Comment Text can't have more than ${maxLength} characters`;
        } else {
          errorMessage = `There was an error while saving the comment`;
        }

        // send to error logging service
        logErrorToService(err, errorMessage);

        this.setState({
          error: { message: errorMessage, error: err },
          commentHTTPState: 'error'
        });
      }
    } // err over

    if (newComment) {
      this.setState({
        comment: newComment,
        commentHTTPState: 'saved',
        error: null
      });
    }

    // WATCH WHAT YOU DO HERE

    // don't know if this is needed
    // this.setState({
    //   comment: this.state.comment,
    //   commentHTTPState: 'idle',
    //   errors: null
    // });
  }
}

export default CommentStateContainer;
