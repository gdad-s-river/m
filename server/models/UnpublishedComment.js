const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unpublishedCommentSchema = new mongoose.Schema({
  text: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UnpublishedComment', unpublishedCommentSchema);
