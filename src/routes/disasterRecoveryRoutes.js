const express = require('express');
const router = express.Router();
const disasterRecoveryController = require('../controllers/disasterRecoveryController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.get('/rpo-rto', disasterRecoveryController.getRPORTODefinitions);
router.get('/plan', disasterRecoveryController.getDRPlan);
router.post('/backups', disasterRecoveryController.createBackup);
router.post('/backups/schedule', disasterRecoveryController.scheduleBackups);
router.post('/backups/:backupId/restore', disasterRecoveryController.restoreBackup);
router.post('/drills', disasterRecoveryController.performRestoreDrill);
router.post('/failover', disasterRecoveryController.handleRegionFailure);

module.exports = router;


