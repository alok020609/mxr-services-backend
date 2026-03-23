const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const packageSelectionController = require('../controllers/packageSelectionController');
const { auth, admin } = require('../middleware/auth');

// ---------- Public: Taxonomy ----------
router.get('/taxonomy', packageController.getTaxonomyTree);
router.get('/taxonomy/:id', packageController.getTaxonomyNode);

// ---------- Public-ish (authenticated): Package lead / selection fallback ----------
// Used when frontend can't use dynamic customizable packages yet.
router.post('/selection', auth, packageSelectionController.submitPackageSelection);

// ---------- Public: Packages ----------
router.get('/', packageController.getPackages);
router.get('/slug/:slug', packageController.getPackageBySlug);
router.get('/:id', packageController.getPackage);
router.post('/:id/calculate-price', packageController.calculatePackagePrice);

// ---------- Public: Package options (read) ----------
router.get('/:id/options', packageController.getPackageOptions);

// ---------- Admin ----------
router.use(auth, admin);

// Taxonomy write
router.post('/taxonomy', packageController.createTaxonomyNode);
router.put('/taxonomy/:id', packageController.updateTaxonomyNode);
router.delete('/taxonomy/:id', packageController.deleteTaxonomyNode);

// Package write
router.post('/', packageController.createPackage);
router.put('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);

// Package options write (must come after /:id so :id is not consumed by optionId)
router.post('/:id/options', packageController.createPackageOption);
router.put('/:id/options/:optionId', packageController.updatePackageOption);
router.delete('/:id/options/:optionId', packageController.deletePackageOption);

module.exports = router;
