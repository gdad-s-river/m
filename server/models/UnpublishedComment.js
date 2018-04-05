const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unpublishedCommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      maxlength: 5000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UnpublishedComment', unpublishedCommentSchema);
