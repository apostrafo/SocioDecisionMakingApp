const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

// Aplinkos kintamųjų įkėlimas
dotenv.config();

// Prisijungti prie duomenų bazės
connectDB();

// Express aplikacijos sukūrimas
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Pagrindinė rūte
app.get('/', (req, res) => {
  res.json({ message: 'SocioDecisionMakingApp API veikia' });
});

// Maršrutų naudojimas
app.use('/api/users', userRoutes);
app.use('/api/proposals', proposalRoutes);

// Klaidų middleware
app.use(notFound);
app.use(errorHandler);

// Aplikacijos paleidimas
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveris veikia portu ${PORT}`)); 