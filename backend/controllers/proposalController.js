const asyncHandler = require('express-async-handler');
const Proposal = require('../models/proposalModel');
const User = require('../models/userModel');

// @desc    Gauti visus pasiūlymus
// @route   GET /api/proposals
// @access  Private
const getProposals = asyncHandler(async (req, res) => {
  // Filtravimo galimybės
  const filter = {};
  
  // Filtruoti pagal ratą (komandą)
  if (req.query.circle) {
    filter.circle = req.query.circle;
  }
  
  // Filtruoti pagal statusą
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // Filtruoti pagal kūrėją
  if (req.query.creator) {
    filter.creator = req.query.creator;
  }
  
  // Filtruoti pagal dalyvį
  if (req.query.participant) {
    filter.participants = req.query.participant;
  }
  
  // Rikiavimo galimybės
  const sort = {};
  
  // Rikiuoti pagal sukūrimo datą (naujausi viršuje)
  if (req.query.sort === 'newest') {
    sort.createdAt = -1;
  }
  
  // Rikiuoti pagal atnaujinimo datą (naujausi viršuje)
  if (req.query.sort === 'updated') {
    sort.updatedAt = -1;
  }
  
  // Rikiuoti pagal terminą (artimiausi viršuje)
  if (req.query.sort === 'deadline') {
    sort.deadline = 1;
  }
  
  // Puslapiavimas
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const proposals = await Proposal.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('creator', 'name email')
    .populate('facilitator', 'name email')
    .populate('participants', 'name email');
  
  // Gauti bendrą pasiūlymų skaičių
  const total = await Proposal.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: proposals.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: proposals
  });
});

// @desc    Gauti vieną pasiūlymą
// @route   GET /api/proposals/:id
// @access  Private
const getProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('facilitator', 'name email')
    .populate('participants', 'name email')
    .populate('comments.user', 'name email')
    .populate('votes.user', 'name email');
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  res.status(200).json({
    success: true,
    data: proposal
  });
});

// @desc    Sukurti naują pasiūlymą
// @route   POST /api/proposals
// @access  Private
const createProposal = asyncHandler(async (req, res) => {
  const { title, description, circle, facilitatorId, participantIds, deadline } = req.body;
  
  // Patikrinti, ar visi būtini laukai užpildyti
  if (!title || !description || !circle) {
    res.status(400);
    throw new Error('Prašome užpildyti visus būtinus laukus');
  }
  
  // Sukurti naują pasiūlymą
  const proposal = await Proposal.create({
    title,
    description,
    creator: req.user._id,
    circle,
    facilitator: facilitatorId,
    deadline: deadline ? new Date(deadline) : undefined,
    participants: participantIds || []
  });
  
  // Automatiškai pridėti kūrėją kaip dalyvį
  if (!proposal.participants.includes(req.user._id)) {
    proposal.participants.push(req.user._id);
    await proposal.save();
  }
  
  res.status(201).json({
    success: true,
    data: proposal
  });
});

// @desc    Atnaujinti pasiūlymą
// @route   PUT /api/proposals/:id
// @access  Private
const updateProposal = asyncHandler(async (req, res) => {
  let proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas turi teisę redaguoti pasiūlymą
  if (proposal.creator.toString() !== req.user._id.toString() && 
      proposal.facilitator?.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Neturite teisės redaguoti šio pasiūlymo');
  }
  
  // Patikrinti, ar pasiūlymas nėra baigtinėje būsenoje
  if (['accepted', 'rejected', 'implemented'].includes(proposal.status)) {
    res.status(400);
    throw new Error('Negalima redaguoti pasiūlymo, kuris jau yra baigtinėje būsenoje');
  }
  
  // Atnaujinti pasiūlymą
  const { title, description, circle, facilitatorId, participantIds, deadline, status } = req.body;
  
  proposal.title = title || proposal.title;
  proposal.description = description || proposal.description;
  proposal.circle = circle || proposal.circle;
  proposal.facilitator = facilitatorId || proposal.facilitator;
  proposal.deadline = deadline ? new Date(deadline) : proposal.deadline;
  
  // Atnaujinti dalyvius, jei pateikti
  if (participantIds) {
    proposal.participants = participantIds;
    
    // Užtikrinti, kad kūrėjas visada būtų dalyvis
    if (!proposal.participants.includes(proposal.creator)) {
      proposal.participants.push(proposal.creator);
    }
  }
  
  // Atnaujinti statusą, jei pateiktas
  if (status && status !== proposal.status) {
    // Patikrinti, ar statusas yra leistinas
    if (!['draft', 'discussion', 'voting', 'accepted', 'rejected', 'implemented'].includes(status)) {
      res.status(400);
      throw new Error('Neteisingas statuso kodas');
    }
    
    // Patikrinti, ar statusas gali būti pakeistas
    if (status === 'voting' && proposal.status === 'draft') {
      res.status(400);
      throw new Error('Pasiūlymas turi būti aptarimo etape prieš pereinant į balsavimą');
    }
    
    proposal.status = status;
  }
  
  await proposal.save();
  
  res.status(200).json({
    success: true,
    data: proposal
  });
});

// @desc    Ištrinti pasiūlymą
// @route   DELETE /api/proposals/:id
// @access  Private
const deleteProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas turi teisę ištrinti pasiūlymą
  if (proposal.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Neturite teisės ištrinti šio pasiūlymo');
  }
  
  await proposal.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Pridėti komentarą prie pasiūlymo
// @route   POST /api/proposals/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    res.status(400);
    throw new Error('Prašome pateikti komentaro tekstą');
  }
  
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas yra pasiūlymo dalyvis
  if (!proposal.participants.includes(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Tik pasiūlymo dalyviai gali komentuoti');
  }
  
  // Pridėti komentarą
  proposal.comments.push({
    user: req.user._id,
    text
  });
  
  await proposal.save();
  
  // Grąžinti atnaujintą pasiūlymą su užpildytais komentarais
  const updatedProposal = await Proposal.findById(req.params.id)
    .populate('comments.user', 'name email');
  
  res.status(201).json({
    success: true,
    data: updatedProposal.comments
  });
});

// @desc    Balsuoti už pasiūlymą
// @route   POST /api/proposals/:id/vote
// @access  Private
const voteProposal = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body;
  
  if (!decision) {
    res.status(400);
    throw new Error('Prašome pateikti sprendimą (consent, object, abstain)');
  }
  
  // Patikrinti, ar sprendimas yra leistinas
  if (!['consent', 'object', 'abstain'].includes(decision)) {
    res.status(400);
    throw new Error('Neteisingas sprendimo kodas');
  }
  
  // Patikrinti, ar pateikta priežastis, jei balsuojama prieš
  if (decision === 'object' && !reason) {
    res.status(400);
    throw new Error('Prašome pateikti priežastį, kodėl balsuojate prieš');
  }
  
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar pasiūlymas yra balsavimo etape
  if (proposal.status !== 'voting') {
    res.status(400);
    throw new Error('Pasiūlymas nėra balsavimo etape');
  }
  
  // Patikrinti, ar vartotojas yra pasiūlymo dalyvis
  if (!proposal.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('Tik pasiūlymo dalyviai gali balsuoti');
  }
  
  // Pridėti arba atnaujinti balsą
  const existingVoteIndex = proposal.votes.findIndex(
    vote => vote.user.toString() === req.user._id.toString()
  );
  
  if (existingVoteIndex !== -1) {
    // Atnaujinti esamą balsą
    proposal.votes[existingVoteIndex].decision = decision;
    proposal.votes[existingVoteIndex].reason = reason || undefined;
    proposal.votes[existingVoteIndex].updatedAt = Date.now();
  } else {
    // Pridėti naują balsą
    proposal.votes.push({
      user: req.user._id,
      decision,
      reason: reason || undefined
    });
  }
  
  await proposal.save();
  
  // Patikrinti, ar visi dalyviai balsavo
  const votingStatus = proposal.votingStatus;
  
  // Jei visi balsavo ir nėra prieštaraujančių, automatiškai pakeisti statusą į "priimta"
  if (votingStatus.completed && votingStatus.passed) {
    proposal.status = 'accepted';
    await proposal.save();
  }
  
  // Grąžinti atnaujintą pasiūlymą su užpildytais balsais
  const updatedProposal = await Proposal.findById(req.params.id)
    .populate('votes.user', 'name email');
  
  res.status(200).json({
    success: true,
    votingStatus: updatedProposal.votingStatus,
    data: updatedProposal.votes
  });
});

// @desc    Pridėti dalyvį prie pasiūlymo
// @route   POST /api/proposals/:id/participants
// @access  Private
const addParticipant = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    res.status(400);
    throw new Error('Prašome pateikti vartotojo ID');
  }
  
  // Patikrinti, ar vartotojas egzistuoja
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('Vartotojas nerastas');
  }
  
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas turi teisę pridėti dalyvius
  if (proposal.creator.toString() !== req.user._id.toString() && 
      proposal.facilitator?.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Neturite teisės pridėti dalyvių prie šio pasiūlymo');
  }
  
  // Patikrinti, ar pasiūlymas nėra baigtinėje būsenoje
  if (['accepted', 'rejected', 'implemented'].includes(proposal.status)) {
    res.status(400);
    throw new Error('Negalima pridėti dalyvių prie pasiūlymo, kuris jau yra baigtinėje būsenoje');
  }
  
  // Pridėti dalyvį, jei jis dar nėra dalyvis
  if (!proposal.participants.includes(userId)) {
    proposal.participants.push(userId);
    await proposal.save();
  }
  
  // Grąžinti atnaujintą pasiūlymą su užpildytais dalyviais
  const updatedProposal = await Proposal.findById(req.params.id)
    .populate('participants', 'name email');
  
  res.status(200).json({
    success: true,
    data: updatedProposal.participants
  });
});

// @desc    Pašalinti dalyvį iš pasiūlymo
// @route   DELETE /api/proposals/:id/participants/:userId
// @access  Private
const removeParticipant = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas turi teisę pašalinti dalyvius
  if (proposal.creator.toString() !== req.user._id.toString() && 
      proposal.facilitator?.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Neturite teisės pašalinti dalyvių iš šio pasiūlymo');
  }
  
  // Patikrinti, ar pasiūlymas nėra baigtinėje būsenoje
  if (['accepted', 'rejected', 'implemented'].includes(proposal.status)) {
    res.status(400);
    throw new Error('Negalima pašalinti dalyvių iš pasiūlymo, kuris jau yra baigtinėje būsenoje');
  }
  
  // Neleisti pašalinti kūrėjo
  if (proposal.creator.toString() === req.params.userId) {
    res.status(400);
    throw new Error('Negalima pašalinti pasiūlymo kūrėjo iš dalyvių sąrašo');
  }
  
  // Pašalinti dalyvį ir jo balsą
  proposal.participants = proposal.participants.filter(
    id => id.toString() !== req.params.userId
  );
  
  proposal.votes = proposal.votes.filter(
    vote => vote.user.toString() !== req.params.userId
  );
  
  await proposal.save();
  
  // Grąžinti atnaujintą pasiūlymą su užpildytais dalyviais
  const updatedProposal = await Proposal.findById(req.params.id)
    .populate('participants', 'name email');
  
  res.status(200).json({
    success: true,
    data: updatedProposal.participants
  });
});

// @desc    Paskirti facilitatorių pasiūlymui
// @route   PUT /api/proposals/:id/facilitator
// @access  Private
const setFacilitator = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    res.status(400);
    throw new Error('Prašome pateikti vartotojo ID');
  }
  
  // Patikrinti, ar vartotojas egzistuoja
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('Vartotojas nerastas');
  }
  
  const proposal = await Proposal.findById(req.params.id);
  
  if (!proposal) {
    res.status(404);
    throw new Error('Pasiūlymas nerastas');
  }
  
  // Patikrinti, ar vartotojas turi teisę paskirti facilitatorių
  if (proposal.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Neturite teisės paskirti facilitatoriaus šiam pasiūlymui');
  }
  
  // Patikrinti, ar pasiūlymas nėra baigtinėje būsenoje
  if (['accepted', 'rejected', 'implemented'].includes(proposal.status)) {
    res.status(400);
    throw new Error('Negalima paskirti facilitatoriaus pasiūlymui, kuris jau yra baigtinėje būsenoje');
  }
  
  // Paskirti facilitatorių
  proposal.facilitator = userId;
  
  // Užtikrinti, kad facilitatorius būtų dalyvis
  if (!proposal.participants.includes(userId)) {
    proposal.participants.push(userId);
  }
  
  await proposal.save();
  
  // Grąžinti atnaujintą pasiūlymą
  const updatedProposal = await Proposal.findById(req.params.id)
    .populate('facilitator', 'name email');
  
  res.status(200).json({
    success: true,
    data: updatedProposal
  });
});

module.exports = {
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
}; 