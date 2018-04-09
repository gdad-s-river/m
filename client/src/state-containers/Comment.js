import Container from './DebugContainerClass';
import * as axios from 'axios';
import to from 'await-to-js';

import logErrorToService from '../utils/logErrorToService';

class CommentStateContainer extends Container {
  state = {
    commentHTTPState: 'idle', // 'fetching', 'error', 'saved', 'saving', 'fetched', 'Nothing changed'
    comment: {},
    error: {}
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
        error: {}
      });
    }

    // if there is no comment; there is no error, do nothing
    // set the state to idle

    this.setState({
      commentHTTPState: 'idle'
    });
  }

  async sync(postPath, postData) {
    this.setState({ commentHTTPState: 'saving' });
    const [err, response] = await to(axios.post(postPath, postData));

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

    if (response && response.data) {
      this.setState({
        comment: response.data.newComment,
        commentHTTPState: 'saved',
        error: {}
      });
    }

    // not needed anything here, because either post will be successful or it'll fail
  }
}

export default CommentStateContainer;
