const mongoose = require('mongoose');
const dotenv = require('dotenv');
const seedData = require('./utils/seedData');

// Įkelti aplinkos kintamuosius
dotenv.config();

// Prisijungti prie duomenų bazės
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Prisijungta prie MongoDB');
    
    // Sukurti testinius duomenis
    await seedData();
    
    // Uždaryti prisijungimą
    mongoose.connection.close();
    console.log('Duomenų bazės prisijungimas uždarytas');
    process.exit(0);
  })
  .catch(error => {
    console.error('Klaida prisijungiant prie MongoDB:', error);
    process.exit(1);
  }); 