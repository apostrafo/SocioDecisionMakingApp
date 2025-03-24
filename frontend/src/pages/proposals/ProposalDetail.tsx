import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Grid,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  LinearProgress,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Forum as ForumIcon,
  HowToVote as HowToVoteIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

// Pasiūlymo būsenos lietuviški pavadinimai ir spalvos
const statusLabels: Record<string, string> = {
  draft: 'Juodraštis',
  discussion: 'Aptarimas',
  voting: 'Balsavimas',
  accepted: 'Priimtas',
  rejected: 'Atmestas',
  implemented: 'Įgyvendintas'
};

const statusColors: Record<string, string> = {
  draft: 'default',
  discussion: 'info',
  voting: 'warning',
  accepted: 'success',
  rejected: 'error',
  implemented: 'secondary'
};

// Balsavimo variantų lietuviški pavadinimai
const voteLabels: Record<string, string> = {
  consent: 'Pritariu',
  object: 'Prieštarauju',
  abstain: 'Susilaikau'
};

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Vote {
  _id: string;
  user: User;
  decision: string;
  reason?: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface Proposal {
  _id: string;
  title: string;
  description: string;
  circle: string;
  status: string;
  votingStatus?: string;
  creator: User;
  facilitator: User;
  participants: User[];
  votes: Vote[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

interface VoteData {
  decision: 'consent' | 'object' | 'block';
  reason?: string;
}

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  
  // Balsavimo būsena
  const [voteDialogOpen, setVoteDialogOpen] = useState<boolean>(false);
  const [decision, setDecision] = useState<VoteData['decision']>('consent');
  const [reason, setReason] = useState<string>('');
  const [voting, setVoting] = useState<boolean>(false);
  
  // Būsenos keitimo dialogas
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [changingStatus, setChangingStatus] = useState<boolean>(false);
  
  // Ištrynimo dialogas
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  // Dalyvių pridėjimo dialogas
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [addingParticipants, setAddingParticipants] = useState<boolean>(false);
  
  // Inicialinis duomenų gavimas
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/proposals/${id}`);
        setProposal(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching proposal:', err);
        setError(err.response?.data?.message || 'Nepavyko užkrauti pasiūlymo');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProposal();
    }
  }, [id]);
  
  // Formatuoti datą
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: lt });
  };
  
  // Patikrinti, ar vartotojas turi teisę redaguoti pasiūlymą
  const canEdit = () => {
    if (!proposal || !user) return false;
    
    return (
      user._id === proposal.creator._id || 
      user._id === proposal.facilitator?._id || 
      user.role === 'admin'
    );
  };
  
  // Patikrinti, ar vartotojas turi teisę ištrinti pasiūlymą
  const canDelete = () => {
    if (!proposal || !user) return false;
    
    return user._id === proposal.creator._id || user.role === 'admin';
  };
  
  // Patikrinti, ar vartotojas turi teisę keisti būseną
  const canChangeStatus = () => {
    if (!proposal || !user) return false;
    
    return (
      user._id === proposal.facilitator?._id || 
      user._id === proposal.creator._id || 
      user.role === 'admin'
    );
  };
  
  // Patikrinti, ar vartotojas yra pasiūlymo dalyvis
  const isParticipant = () => {
    if (!proposal || !user) return false;
    
    return proposal.participants.some((p: any) => p._id === user._id);
  };
  
  // Patikrinti, ar vartotojas gali balsuoti
  const canVote = () => {
    if (!proposal || !user || proposal.status !== 'voting') return false;
    
    return isParticipant();
  };
  
  // Patikrinti, ar vartotojas jau balsavo
  const hasVoted = () => {
    if (!proposal || !user) return false;
    
    return proposal.votes.some((v: any) => v.user._id === user._id);
  };
  
  // Gauti vartotojo balsą
  const getUserVote = () => {
    if (!proposal || !user) return null;
    
    const userVote = proposal.votes.find((v: any) => v.user._id === user._id);
    if (userVote && (userVote.decision === 'consent' || userVote.decision === 'object' || userVote.decision === 'block')) {
      return userVote;
    }
    return null;
  };
  
  // Gauti galimus būsenos keitimo variantus
  const getPossibleStatusChanges = () => {
    if (!proposal) return [];
    
    const currentStatus = proposal.status;
    
    switch (currentStatus) {
      case 'draft':
        return ['discussion'];
      case 'discussion':
        return ['voting', 'draft', 'rejected'];
      case 'voting':
        return ['accepted', 'rejected', 'discussion'];
      case 'accepted':
        return ['implemented', 'discussion'];
      case 'rejected':
        return ['draft', 'discussion'];
      case 'implemented':
        return [];
      default:
        return [];
    }
  };
  
  // Komentaro siuntimas
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await api.post(`/api/proposals/${id}/comments`, { text: comment });
      setProposal(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, response.data.data]
        };
      });
      setComment('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.response?.data?.message || 'Įvyko klaida siunčiant komentarą');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Balsavimo dialogo atidarymas
  const handleOpenVoteDialog = () => {
    const userVote = getUserVote();
    
    if (userVote) {
      if (userVote.decision === 'consent' || userVote.decision === 'object' || userVote.decision === 'block') {
        setDecision(userVote.decision as VoteData['decision']);
      } else {
        setDecision('consent');
      }
      setReason(userVote.reason || '');
    } else {
      setDecision('consent');
      setReason('');
    }
    
    setVoteDialogOpen(true);
  };
  
  // Balsavimo siuntimas
  const handleVoteSubmit = async () => {
    setVoting(true);
    
    try {
      const data: any = { decision: decision };
      
      if (decision === 'object' || decision === 'block') {
        if (!reason.trim()) {
          setError('Prieštaraujant būtina nurodyti priežastį');
          setVoting(false);
          return;
        }
        data.reason = reason;
      }
      
      const response = await api.post(`/api/proposals/${id}/votes`, data);
      setVoteDialogOpen(false);
      setDecision('consent');
      setReason('');
      setProposal(prev => {
        if (!prev) return null;
        return {
          ...prev,
          votes: [...prev.votes, response.data.data]
        };
      });
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      setError(err.response?.data?.message || 'Įvyko klaida balsuojant');
    } finally {
      setVoting(false);
    }
  };
  
  // Būsenos keitimo dialogo atidarymas
  const handleOpenStatusDialog = () => {
    setNewStatus(getPossibleStatusChanges()[0] || '');
    setStatusDialogOpen(true);
  };
  
  // Būsenos keitimas
  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    setChangingStatus(true);
    
    try {
      const response = await api.put(`/api/proposals/${id}/status`, {
        status: newStatus
      });
      
      setStatusDialogOpen(false);
      setProposal(response.data.data);
    } catch (err: any) {
      console.error('Error changing status:', err);
      setError(err.response?.data?.message || 'Įvyko klaida keičiant būseną');
    } finally {
      setChangingStatus(false);
    }
  };
  
  // Pasiūlymo ištrynimas
  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      await api.delete(`/api/proposals/${id}`);
      navigate('/proposals');
    } catch (err: any) {
      console.error('Error deleting proposal:', err);
      setError(err.response?.data?.message || 'Įvyko klaida trinant pasiūlymą');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };
  
  // Balsavimo statistika
  const renderVotingStats = () => {
    if (!proposal) return null;
    
    const totalParticipants = proposal.participants.length;
    const totalVotes = proposal.votes.length;
    const consents = proposal.votes.filter(v => v.decision === 'consent').length;
    const objects = proposal.votes.filter(v => v.decision === 'object').length;
    const abstains = proposal.votes.filter(v => v.decision === 'abstain').length;
    const completed = totalParticipants === totalVotes;
    
    const consentPercent = totalParticipants ? (consents / totalParticipants) * 100 : 0;
    const objectPercent = totalParticipants ? (objects / totalParticipants) * 100 : 0;
    const abstainPercent = totalParticipants ? (abstains / totalParticipants) * 100 : 0;
    const remainingPercent = totalParticipants ? ((totalParticipants - totalVotes) / totalParticipants) * 100 : 0;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Balsavimo statistika
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Balsavo: {totalVotes} iš {totalParticipants} ({Math.round((totalVotes / totalParticipants) * 100)}%)
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={(totalVotes / totalParticipants) * 100} 
            sx={{ height: 10, borderRadius: 5, mb: 1 }} 
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="success.main">
                Pritaria: {consents} ({Math.round(consentPercent)}%)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={consentPercent} 
                color="success" 
                sx={{ height: 8, borderRadius: 5 }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="error.main">
                Prieštarauja: {objects} ({Math.round(objectPercent)}%)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={objectPercent} 
                color="error" 
                sx={{ height: 8, borderRadius: 5 }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Susilaiko: {abstains} ({Math.round(abstainPercent)}%)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={abstainPercent} 
                color="warning" 
                sx={{ height: 8, borderRadius: 5 }} 
              />
            </Box>
          </Grid>
        </Grid>
        
        {completed && objects === 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Balsavimas baigtas. Pasiūlymui pritarta bendru sutarimu!
          </Alert>
        )}
        
        {completed && objects > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Balsavimas baigtas. Pasiūlymas atmestas, nes yra prieštaravimų.
          </Alert>
        )}
      </Box>
    );
  };
  
  // Gauti visus vartotojus
  const fetchUsers = async () => {
    if (availableUsers.length > 0) return;
    
    try {
      setLoadingUsers(true);
      const response = await api.get('/api/users');
      setAvailableUsers(response.data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Nepavyko gauti vartotojų sąrašo');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Dalyvių pridėjimo dialogo atidarymas
  const handleOpenParticipantsDialog = async () => {
    await fetchUsers();
    setSelectedUsers([]);
    setParticipantsDialogOpen(true);
  };
  
  // Dalyvių pridėjimas
  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) {
      setParticipantsDialogOpen(false);
      return;
    }
    
    setAddingParticipants(true);
    
    try {
      // Pridėti visus pasirinktus vartotojus kaip dalyvius
      for (const user of selectedUsers) {
        await api.post(`/api/proposals/${id}/participants`, { userId: user._id });
      }
      
      // Atnaujinti pasiūlymą
      const response = await api.get(`/api/proposals/${id}`);
      setProposal(response.data.data);
      
      // Uždaryti dialogą
      setParticipantsDialogOpen(false);
      setSelectedUsers([]);
    } catch (err: any) {
      console.error('Error adding participants:', err);
      setError(err.response?.data?.message || 'Nepavyko pridėti dalyvių');
    } finally {
      setAddingParticipants(false);
    }
  };
  
  // Vartotojo pasirinkimas
  const handleUserToggle = (user: User) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    const isParticipant = proposal?.participants.some(p => p._id === user._id);
    
    // Nepridėti vartotojo, kuris jau yra dalyvis
    if (isParticipant) return;
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // Fasilitatoriaus keitimas
  const handleSetFacilitator = async () => {
    if (!user) return;

    try {
      await api.put(`/api/proposals/${id}/facilitator`, { userId: user._id });
      const response = await api.get(`/api/proposals/${id}`);
      setProposal(response.data.data);
    } catch (error) {
      console.error('Klaida nustatant moderatoriaus statusą:', error);
    }
  };
  
  // Dalyvio pašalinimas
  const handleRemoveParticipant = async (userId: string) => {
    try {
      await api.delete(`/api/proposals/${id}/participants/${userId}`);
      
      // Atnaujinti pasiūlymą
      const response = await api.get(`/api/proposals/${id}`);
      setProposal(response.data.data);
    } catch (err: any) {
      console.error('Error removing participant:', err);
      setError(err.response?.data?.message || 'Nepavyko pašalinti dalyvio');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !proposal) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Pasiūlymas nerastas'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/proposals')}
        >
          Grįžti į pasiūlymų sąrašą
        </Button>
      </Container>
    );
  }
  
  // Balsavimo statistika
  const voteStats = {
    total: proposal.votes.length,
    consent: proposal.votes.filter(v => v.decision === 'consent').length,
    standAside: proposal.votes.filter(v => v.decision === 'stand-aside').length,
    abstain: proposal.votes.filter(v => v.decision === 'abstain').length,
    object: proposal.votes.filter(v => v.decision === 'object').length,
    block: proposal.votes.filter(v => v.decision === 'block').length,
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Viršutinė juosta su veiksmų mygtukais */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/proposals')}
        >
          Grįžti į sąrašą
        </Button>
        
        <Box>
          {canChangeStatus() && proposal.status !== 'implemented' && (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleOpenStatusDialog}
              disabled={getPossibleStatusChanges().length === 0}
              sx={{ mr: 1 }}
            >
              Keisti būseną
            </Button>
          )}
          
          {canEdit() && (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<EditIcon />} 
              onClick={() => navigate(`/proposals/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              Redaguoti
            </Button>
          )}
          
          {canDelete() && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={() => setDeleteDialogOpen(true)}
            >
              Ištrinti
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Pasiūlymo antraštė ir būsena */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {proposal.title}
          </Typography>
          <Chip 
            label={statusLabels[proposal.status]} 
            color={statusColors[proposal.status] as any} 
            size="medium"
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip 
            label={`Ratas: ${proposal.circle}`} 
            variant="outlined" 
            size="small" 
          />
          
          <Chip 
            icon={<PersonIcon />} 
            label={`Kūrėjas: ${proposal.creator.name}`} 
            variant="outlined" 
            size="small" 
          />
          
          {proposal.facilitator && (
            <Chip 
              icon={<PersonIcon />} 
              label={`Facilitatorius: ${proposal.facilitator.name}`} 
              variant="outlined" 
              size="small" 
            />
          )}
          
          {proposal.deadline && (
            <Chip 
              label={`Terminas: ${formatDate(proposal.deadline)}`}
              variant="outlined" 
              size="small" 
            />
          )}
        </Box>
        
        <Typography variant="body1" paragraph sx={{ mt: 2, whiteSpace: 'pre-line' }}>
          {proposal.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Sukurta: {formatDate(proposal.createdAt)} | Atnaujinta: {formatDate(proposal.updatedAt)}
          </Typography>
          
          {/* Balsavimo mygtukas */}
          {proposal.status === 'voting' && isParticipant() && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ThumbUpIcon />} 
              onClick={handleOpenVoteDialog}
            >
              {hasVoted() ? 'Pakeisti balsą' : 'Balsuoti'}
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Balsavimo informacija */}
      {proposal.status === 'voting' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          {renderVotingStats()}
          
          {proposal.votes.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Balsai
              </Typography>
              
              <List>
                {proposal.votes.map((vote: any) => (
                  <ListItem 
                    key={vote._id} 
                    sx={{ 
                      bgcolor: 
                        vote.decision === 'consent' ? 'success.light' : 
                        vote.decision === 'object' ? 'error.light' : 
                        'warning.light',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        alt={vote.user.name} 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(vote.user.name)}&background=random`} 
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={vote.user.name} 
                      secondary={
                        <>
                          <strong>{voteLabels[vote.decision]}</strong>
                          {vote.reason && <>: {vote.reason}</>}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(vote.createdAt)}
                          </Typography>
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Dalyviai */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dalyviai ({proposal.participants.length})
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {proposal.participants.map((participant: any) => (
            <Tooltip 
              key={participant._id} 
              title={
                <>
                  <Typography variant="body2">{participant.name}</Typography>
                  {proposal.facilitator && proposal.facilitator._id === participant._id && (
                    <Typography variant="caption" color="success.main">Fasilitatorius</Typography>
                  )}
                  {canEdit() && participant._id !== proposal.creator._id && (
                    <Box sx={{ mt: 1 }}>
                      {proposal.facilitator?._id !== participant._id && (
                        <Button 
                          size="small" 
                          onClick={() => handleSetFacilitator()}
                          sx={{ mr: 1, fontSize: '0.7rem' }}
                        >
                          Skirti fasilitatoriumi
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveParticipant(participant._id)}
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Pašalinti
                      </Button>
                    </Box>
                  )}
                </>
              } 
              arrow
              placement="top"
            >
              <Avatar 
                alt={participant.name} 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} 
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: proposal.facilitator && proposal.facilitator._id === participant._id ? 
                    '2px solid #4caf50' : 'none'
                }}
              />
            </Tooltip>
          ))}
          
          {canEdit() && (
            <Tooltip title="Pridėti dalyvius" arrow>
              <IconButton 
                color="primary" 
                sx={{ width: 40, height: 40 }}
                onClick={handleOpenParticipantsDialog}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>
      
      {/* Komentarai */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Komentarai ({proposal.comments.length})
        </Typography>
        
        {proposal.comments.length > 0 ? (
          <List>
            {proposal.comments.map((comment: any) => (
              <ListItem key={comment._id} alignItems="flex-start" sx={{ pb: 2 }}>
                <ListItemAvatar>
                  <Avatar 
                    alt={comment.user.name} 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=random`} 
                  />
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography component="span" variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      sx={{ display: 'inline', whiteSpace: 'pre-line' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {comment.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Komentarų dar nėra.
          </Typography>
        )}
        
        {/* Komentaro formos */}
        {isParticipant() && (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Rašyti komentarą"
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submittingComment}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleCommentSubmit}
                disabled={!comment.trim() || submittingComment}
              >
                {submittingComment ? <CircularProgress size={24} /> : 'Komentuoti'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Balsavimo dialogas */}
      <Dialog open={voteDialogOpen} onClose={() => setVoteDialogOpen(false)}>
        <DialogTitle>Balsavimas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pasirinkite savo sprendimą dėl šio pasiūlymo. Sociokratijoje sprendimai priimami bendru sutarimu,
            todėl prieštaravimas turi būti pagrįstas argumentais.
          </DialogContentText>
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={decision as VoteData['decision']}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value as VoteData['decision'];
                setDecision(value);
              }}
            >
              <FormControlLabel
                value="consent"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>Pritariu – Pasiūlymas tinkamas, neturiu prieštaravimų</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="object"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CloseIcon color="error" sx={{ mr: 1 }} />
                    <Typography>Prieštarauju – Turiu rimtų argumentų prieš</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="block"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RemoveCircleOutlineIcon color="warning" sx={{ mr: 1 }} />
                    <Typography>Blokuoju – Turiu rimtų argumentų prieš</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
          
          {decision === 'object' && (
            <TextField
              fullWidth
              label="Prieštaravimo priežastis (privaloma)"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoteDialogOpen(false)}>Atšaukti</Button>
          <Button 
            onClick={handleVoteSubmit}
            variant="contained"
            color="primary"
            disabled={voting || (decision === 'object' && !reason.trim())}
          >
            {voting ? <CircularProgress size={24} /> : 'Balsuoti'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Būsenos keitimo dialogas */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Keisti pasiūlymo būseną</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pasirinkite naują pasiūlymo būseną. Būsenos keitimas gali turėti įtakos pasiūlymo eigai.
          </DialogContentText>
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {getPossibleStatusChanges().map((status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={statusLabels[status]}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Atšaukti</Button>
          <Button 
            onClick={handleStatusChange}
            variant="contained"
            color="primary"
            disabled={changingStatus || !newStatus}
          >
            {changingStatus ? <CircularProgress size={24} /> : 'Keisti būseną'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ištrynimo dialogas */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Ištrinti pasiūlymą</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ar tikrai norite ištrinti šį pasiūlymą? Šis veiksmas negrįžtamas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Atšaukti</Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Ištrinti'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dalyvių pridėjimo dialogas */}
      <Dialog 
        open={participantsDialogOpen} 
        onClose={() => setParticipantsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Pridėti dalyvius</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pasirinkite vartotojus, kuriuos norite pridėti kaip pasiūlymo dalyvius.
          </DialogContentText>
          
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2, maxHeight: '300px', overflow: 'auto' }}>
              <List>
                {availableUsers
                  .filter(availableUser => 
                    !proposal.participants.some(p => p._id === availableUser._id)
                  )
                  .map(availableUser => {
                    const isSelected = selectedUsers.some(u => u._id === availableUser._id);
                    
                    return (
                      <ListItem 
                        key={availableUser._id}
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={isSelected}
                            onChange={() => handleUserToggle(availableUser)}
                          />
                        }
                        sx={{ 
                          bgcolor: isSelected ? 'action.selected' : 'inherit',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {availableUser.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={availableUser.name}
                          secondary={availableUser.email}
                        />
                      </ListItem>
                    );
                  })}
                  
                {availableUsers.filter(availableUser => 
                  !proposal.participants.some(p => p._id === availableUser._id)
                ).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Visi vartotojai jau yra dalyviai
                  </Typography>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantsDialogOpen(false)}>Atšaukti</Button>
          <Button 
            onClick={handleAddParticipants}
            variant="contained"
            color="primary"
            disabled={addingParticipants || selectedUsers.length === 0}
          >
            {addingParticipants ? <CircularProgress size={24} /> : 'Pridėti'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProposalDetail; 