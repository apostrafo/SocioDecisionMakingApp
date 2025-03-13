const mongoose = require('mongoose');
const User = require('../models/userModel');
const Proposal = require('../models/proposalModel');
const bcrypt = require('bcryptjs');

// Testinių vartotojų duomenys
const users = [
  {
    name: 'Admin Vartotojas',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Jonas Jonaitis',
    email: 'jonas@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Petras Petraitis',
    email: 'petras@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Ona Onaitė',
    email: 'ona@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Testinių pasiūlymų duomenys (be vartotojų ID, nes jie bus pridėti po vartotojų sukūrimo)
const proposalTemplates = [
  {
    title: 'Organizacijos vertybių atnaujinimas',
    description: 'Siūlau peržiūrėti ir atnaujinti organizacijos vertybes, kad jos geriau atspindėtų mūsų dabartinę kultūrą ir siekius. Siūlomos naujos vertybės:\n\n1. Skaidrumas\n2. Bendradarbiavimas\n3. Inovacijos\n4. Tvarumas\n5. Įtrauktis\n\nŠios vertybės padės mums aiškiau komunikuoti mūsų tikslus ir principus tiek viduje, tiek išorėje.',
    circle: 'Valdyba',
    status: 'discussion'
  },
  {
    title: 'Naujų patalpų įrengimas',
    description: 'Siūlau įrengti naujas patalpas biuro plėtrai. Esamos patalpos tapo per mažos augančiai komandai. Naujos patalpos turėtų būti:\n\n- Mažiausiai 200 kv.m. ploto\n- Su pakankamai susitikimų kambarių\n- Lengvai pasiekiamos viešuoju transportu\n- Su ergonomiška darbo aplinka\n\nPradedu ieškoti variantų ir siūlau sudaryti darbo grupę šiam projektui.',
    circle: 'Administracija',
    status: 'voting',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Po savaitės
  },
  {
    title: 'Komandos formavimo renginys',
    description: 'Siūlau organizuoti komandos formavimo renginį, kuris padėtų gerinti tarpusavio ryšius ir bendradarbiavimą tarp skyrių. Renginys vyktų gamtoje ir apimtų įvairias komandines veiklas.\n\nSiūlomos datos: birželio 15-16 d.\nBiudžetas: iki 2000 EUR\nDalyviai: visi darbuotojai',
    circle: 'Žmogiškieji ištekliai',
    status: 'draft'
  },
  {
    title: 'Tvarios plėtros strategija',
    description: 'Siūlau sukurti ir įgyvendinti tvarios plėtros strategiją, kuri apimtų:\n\n1. Energijos suvartojimo mažinimą\n2. Atliekų mažinimą ir rūšiavimą\n3. Tvarių tiekėjų pasirinkimą\n4. Darbuotojų švietimą aplinkosaugos klausimais\n\nŠi strategija padėtų mums sumažinti poveikį aplinkai ir būti atsakingesne organizacija.',
    circle: 'Strategija',
    status: 'accepted'
  },
  {
    title: 'Naujų technologijų diegimas',
    description: 'Siūlau įdiegti naujas technologijas, kurios pagerintų mūsų darbo efektyvumą ir produktyvumą. Konkrečiai siūlau:\n\n1. Įdiegti projektų valdymo sistemą Asana\n2. Pereiti prie Google Workspace vietoj dabartinių sprendimų\n3. Įdiegti automatizuoto testavimo įrankius\n\nŠie pakeitimai leistų mums greičiau ir efektyviau dirbti bei sumažinti klaidų tikimybę.',
    circle: 'IT',
    status: 'implemented'
  }
];

// Funkcija duomenų sukūrimui
const seedData = async () => {
  try {
    // Išvalyti esamus duomenis
    await User.deleteMany();
    await Proposal.deleteMany();
    
    console.log('Duomenys išvalyti');
    
    // Sukurti vartotojus
    const createdUsers = [];
    
    for (const user of users) {
      // Užšifruoti slaptažodį
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }
    
    console.log(`${createdUsers.length} vartotojai sukurti`);
    
    // Sukurti pasiūlymus
    const proposals = proposalTemplates.map((template, index) => {
      const creator = createdUsers[index % createdUsers.length];
      const facilitator = createdUsers[(index + 1) % createdUsers.length];
      
      // Pridėti dalyvius (visi vartotojai)
      const participants = createdUsers.map(user => user._id);
      
      return {
        ...template,
        creator: creator._id,
        facilitator: facilitator._id,
        participants
      };
    });
    
    // Sukurti pasiūlymus
    const createdProposals = await Proposal.insertMany(proposals);
    
    console.log(`${createdProposals.length} pasiūlymai sukurti`);
    
    // Pridėti balsus "voting" būsenos pasiūlymams
    for (const proposal of createdProposals) {
      if (proposal.status === 'voting') {
        // Pridėti balsus nuo visų dalyvių
        for (let i = 0; i < createdUsers.length; i++) {
          let decision = 'consent';
          
          // Pirmasis vartotojas balsuoja "object"
          if (i === 0) {
            decision = 'object';
          }
          
          // Antrasis vartotojas balsuoja "abstain"
          if (i === 1) {
            decision = 'abstain';
          }
          
          await proposal.addVote(
            createdUsers[i]._id, 
            decision, 
            decision === 'object' ? 'Nemanau, kad tai prioritetinis projektas šiuo metu' : undefined
          );
        }
      }
      
      // Pridėti komentarus
      await proposal.addComment(
        createdUsers[0]._id,
        'Labai geras pasiūlymas, palaikau iniciatyvą!'
      );
      
      await proposal.addComment(
        createdUsers[1]._id,
        'Ar galėtumėte detalizuoti biudžetą?'
      );
    }
    
    console.log('Balsai ir komentarai pridėti');
    console.log('Duomenys sėkmingai sukurti!');
    
  } catch (error) {
    console.error('Klaida kuriant duomenis:', error);
  }
};

module.exports = seedData; 