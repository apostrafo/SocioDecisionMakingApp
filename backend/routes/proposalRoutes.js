const express = require('express');
const router = express.Router();
const {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
  addComment,
  voteProposal,
  addParticipant,
  removeParticipant,
  setFacilitator
} = require('../controllers/proposalController');
const { protect } = require('../middleware/authMiddleware');

// Pagrindiniai pasiūlymų maršrutai
router.route('/')
  .get(protect, getProposals)
  .post(protect, createProposal);

router.route('/:id')
  .get(protect, getProposal)
  .put(protect, updateProposal)
  .delete(protect, deleteProposal);

// Komentarų maršrutai
router.route('/:id/comments')
  .post(protect, addComment);

// Balsavimo maršrutai
router.route('/:id/vote')
  .post(protect, voteProposal);

// Dalyvių maršrutai
router.route('/:id/participants')
  .post(protect, addParticipant);

router.route('/:id/participants/:userId')
  .delete(protect, removeParticipant);

// Facilitatoriaus maršrutai
router.route('/:id/facilitator')
  .put(protect, setFacilitator);

module.exports = router; 