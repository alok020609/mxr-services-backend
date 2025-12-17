const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migrationController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.post('/execute', migrationController.executeMigration);
router.post('/zero-downtime', migrationController.executeZeroDowntimeMigration);
router.post('/:migrationId/rollback', migrationController.rollbackMigration);
router.post('/rollout', migrationController.gradualRollout);
router.post('/compatibility', migrationController.checkBackwardCompatibility);

module.exports = router;


