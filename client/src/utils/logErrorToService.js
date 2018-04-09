function logErrorToService(err, errMsg) {
  if (process.env.NODE_ENV === 'production') {
    console.log(err, errMsg);
  }
}

export default logErrorToService;
