const pathMaker = serverHost => {
  // check that serverHost doesn't end with '/'
  if (serverHost.lastIndexOf('/') === serverHost.length - 1) {
    throw Error('Do not use trailing slash in the url');
  }

  return {
    get: {
      unpublishedComment: `${serverHost}/api/fetch-unpublished/`
    },
    post: {
      unpublishedComment: `${serverHost}/api/sync`
    }
  };
};

export default pathMaker(process.env.REACT_APP_SERVER_HOST);
