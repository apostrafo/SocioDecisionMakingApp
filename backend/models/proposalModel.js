const mongoose = require('mongoose');

// Komentaro schema
const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  text: {
    type: String,
    required: [true, 'Komentaro tekstas privalomas']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Balsavimo schema
const voteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Sociokratijoje vartotojai balsuoja taip (consent), ne (object) arba susilaikant (abstain)
  decision: {
    type: String,
    required: true,
    enum: ['consent', 'object', 'abstain']
  },
  reason: {
    type: String,
    required: function() {
      return this.decision === 'object';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pasiūlymo schema
const proposalSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Pasiūlymo pavadinimas privalomas'],
    trim: true,
    maxlength: [100, 'Pavadinimas negali viršyti 100 simbolių']
  },
  description: {
    type: String,
    required: [true, 'Pasiūlymo aprašymas privalomas'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  facilitator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  circle: {
    type: String,
    required: [true, 'Ratas (komanda) privalomas']
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'discussion', 'voting', 'accepted', 'rejected', 'implemented'],
    default: 'draft'
  },
  deadline: {
    type: Date
  },
  comments: [commentSchema],
  votes: [voteSchema],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtualūs laukai
proposalSchema.virtual('votingStatus').get(function() {
  if (this.status !== 'voting') return null;
  
  const totalParticipants = this.participants.length;
  const totalVotes = this.votes.length;
  const consents = this.votes.filter(vote => vote.decision === 'consent').length;
  const objects = this.votes.filter(vote => vote.decision === 'object').length;
  const abstains = this.votes.filter(vote => vote.decision === 'abstain').length;
  
  return {
    totalParticipants,
    totalVotes,
    consents,
    objects,
    abstains,
    completed: totalVotes === totalParticipants,
    passed: objects === 0 && totalVotes === totalParticipants
  };
});

// Metodai
proposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

proposalSchema.methods.addComment = function(userId, text) {
  this.comments.push({ user: userId, text });
  return this.save();
};

proposalSchema.methods.addVote = function(userId, decision, reason) {
  // Pašalinti ankstesnį balsą, jei toks buvo
  this.votes = this.votes.filter(vote => !vote.user.equals(userId));
  
  // Pridėti naują balsą
  this.votes.push({ 
    user: userId, 
    decision,
    reason: reason || undefined
  });
  
  return this.save();
};

proposalSchema.methods.changeStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

proposalSchema.methods.addParticipant = function(userId) {
  if (!this.participants.some(id => id.equals(userId))) {
    this.participants.push(userId);
  }
  return this.save();
};

proposalSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => !id.equals(userId));
  this.votes = this.votes.filter(vote => !vote.user.equals(userId));
  return this.save();
};

proposalSchema.methods.setFacilitator = function(userId) {
  this.facilitator = userId;
  return this.save();
};

module.exports = mongoose.model('Proposal', proposalSchema); 