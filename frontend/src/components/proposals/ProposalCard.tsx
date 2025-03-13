import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Button,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';

// Pasiūlymo būsenos spalvos
const statusColors: Record<string, string> = {
  draft: 'default',
  discussion: 'info',
  voting: 'warning',
  accepted: 'success',
  rejected: 'error',
  implemented: 'secondary'
};

// Pasiūlymo būsenos lietuviški pavadinimai
const statusLabels: Record<string, string> = {
  draft: 'Juodraštis',
  discussion: 'Aptarimas',
  voting: 'Balsavimas',
  accepted: 'Priimtas',
  rejected: 'Atmestas',
  implemented: 'Įgyvendintas'
};

// Pasiūlymo tipas
interface Participant {
  _id: string;
  name: string;
  email: string;
}

interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'discussion' | 'voting' | 'accepted' | 'rejected' | 'implemented';
  circle: string;
  creator: Participant;
  facilitator?: Participant;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  comments: any[];
  votes: any[];
}

interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const navigate = useNavigate();
  
  // Formatuoti datą
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: lt });
  };
  
  // Sutrumpinti aprašymą, jei jis per ilgas
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={() => navigate(`/proposals/${proposal._id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {proposal.title}
          </Typography>
          <Chip 
            label={statusLabels[proposal.status]} 
            color={statusColors[proposal.status] as any} 
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {truncateDescription(proposal.description)}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={proposal.circle} 
            variant="outlined" 
            size="small" 
          />
          
          {proposal.deadline && (
            <Typography variant="caption" color="text.secondary">
              Terminas: {formatDate(proposal.deadline)}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Sukurta: {formatDate(proposal.createdAt)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                {proposal.participants.map((participant) => (
                  <Tooltip key={participant._id} title={participant.name}>
                    <Avatar alt={participant.name} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} />
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          </Box>
          
          <Box>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/proposals/${proposal._id}`);
              }}
            >
              Peržiūrėti
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProposalCard; 