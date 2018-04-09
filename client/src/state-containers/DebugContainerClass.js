import { Container } from 'unstated';

/** helps debug unstated state;
  warning: currently doesn't work because it's written in es2017;
  create react app - webpack doesn't support object spread 
  and Object.entries yet. To be able to use it, you'll have to
  manually babel transform the node module's indexjs 
 */

// import unstatedDebug from 'unstated-debug';

// export default unstatedDebug()(Container);

export default Container;
