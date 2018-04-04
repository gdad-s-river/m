const express = require('express');
const router = express.Router();

const unpublishedCommentController = require('../controllers/unpublishedCommentController');
const { catchErrors } = require('../handlers/errorHandlers');

router.post('/api/sync', catchErrors(unpublishedCommentController.syncComment));

router.get(
  '/api/fetch-unpublished/count',
  catchErrors(unpublishedCommentController.getCommentCount)
);

router.get(
  '/api/fetch-unpublished',
  catchErrors(unpublishedCommentController.getComment)
);

module.exports = router;
