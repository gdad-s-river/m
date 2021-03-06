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
    const { _id, patches } = req.body;

    // read previouslysaved text;

    const { text: previouslySavedText } = await UnpublishedComment.findOne({
      _id: _id
    });

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

    res.json({ newComment });
  }
};

exports.getComment = async (req, res) => {
  const comment = await UnpublishedComment.findOne();
  res.json({ comment });
};
