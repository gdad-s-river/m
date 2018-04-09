import { Subscribe } from 'unstated';
import { CommentContainer } from '../containers';
import { CommentBox } from './CommentBox';

function CommentBoxService() {
  <Subscribe to={[CommentContainer]}>
    {commentService => {
      <CommentBox commentService={commentService} />;
    }}
  </Subscribe>;
}
