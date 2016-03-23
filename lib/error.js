isKnownError = function (error) {
  var errorName = error && error.error;
  var listOfKnownErrors = ['no-token', 'no-network'];
  return _.contains(listOfKnownErrors, errorName);
};

throwError = function(error, reason, details) {
  var meteorError = new Meteor.Error(error, reason, details);
  if (Meteor.isClient) {
    return meteorError;
  } else if (Meteor.isServer) {
    throw meteorError;
  }
};
