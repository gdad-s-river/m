const mongoose = require('mongoose');
const UnpublishedComment = mongoose.model('UnpublishedComment');

const DiffMatchPatch = require('diff-match-patch');

const dmp = new DiffMatchPatch();

exports.syncComment = async (req, res) => {
  const count = await UnpublishedComment.count();

  if (!count) {
    let [reconstructedMsg, results] = dmp.patch_apply(req.body.patches, '');

    const newComment = await new UnpublishedComment({
      text: reconstructedMsg
    }).save();

    res.send({ newComment });
  } else {
    const { _id, patches, previouslySavedText } = req.body;

    console.log(previouslySavedText);

    let [reconstructedMsg, results] = dmp.patch_apply(
      patches,
      previouslySavedText
    );

    const newComment = await UnpublishedComment.findOneAndUpdate(
      { _id },
      { text: reconstructedMsg },
      {
        new: true,
        runValidators: true
      }
    );

    console.log(newComment);
    res.send({ newComment });
  }
};

exports.getCommentCount = async (req, res) => {
  const count = await UnpublishedComment.count();
  res.json({ count });
};

exports.getComment = async (req, res) => {
  const comment = await UnpublishedComment.findOne();
  res.json({ comment });
};
