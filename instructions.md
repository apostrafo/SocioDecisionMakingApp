# Sociokratinės aplikacijos kūrimo instrukcijos

## 1. Projekto apžvalga

Sociokratinė aplikacija yra skirta pasiūlymų valdymui organizacijoje, leidžianti vartotojams kurti, redaguoti, aptarti ir balsuoti už pasiūlymus. Sistema sukurta remiantis sociokratiniais principais, kur sprendimai priimami bendru sutarimu, o ne daugumos balsavimu.

## 2. Naudojamos technologijos

### Backend:
- **Node.js** - JavaScript vykdymo aplinka serverio pusėje
- **Express.js** - Web aplikacijų karkasas, skirtas API kūrimui
- **MongoDB** - NoSQL duomenų bazė duomenų saugojimui
- **Mongoose** - MongoDB objektų modeliavimo įrankis
- **JWT (JSON Web Tokens)** - Vartotojų autentifikacijai
- **bcryptjs** - Slaptažodžių šifravimui
- **express-async-handler** - Asinchroninių funkcijų klaidų valdymui
- **cors** - Cross-Origin Resource Sharing valdymui
- **dotenv** - Aplinkos kintamųjų valdymui

### Frontend:
- **React** - JavaScript biblioteka vartotojo sąsajos kūrimui
- **TypeScript** - JavaScript praplėtimas su tipų sistema
- **Material UI** - Komponentų biblioteka vartotojo sąsajai
- **Axios** - HTTP užklausų biblioteka
- **React Router** - Maršrutizavimo biblioteka
- **React Context API** - Būsenos valdymui
- **localStorage** - Vartotojo sesijos duomenų saugojimui

## 3. Diegimo ir konfigūravimo instrukcijos

### Reikalavimai
- Node.js (v14.x arba naujesnė)
- MongoDB (v4.x arba naujesnė)
- npm arba yarn

### Backend diegimas
1. Klonuokite repozitoriją:
   ```bash
   git clone https://github.com/jusu-vardas/sociokratine-aplikacija.git
   cd sociokratine-aplikacija/backend
   ```

2. Įdiekite priklausomybes:
   ```bash
   npm install
   ```

3. Sukurkite `.env` failą su šiais kintamaisiais:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sociokratine-app
   JWT_SECRET=jūsų_slaptas_raktas
   JWT_EXPIRE=30d
   ```

4. Paleiskite serverį:
   ```bash
   npm run dev
   ```

### Frontend diegimas
1. Pereikite į frontend direktoriją:
   ```bash
   cd ../frontend
   ```

2. Įdiekite priklausomybes:
   ```bash
   npm install
   ```

3. Sukurkite `.env` failą su šiais kintamaisiais:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Paleiskite aplikaciją:
   ```bash
   npm start
   ```

### Docker diegimas (alternatyva)
1. Įsitikinkite, kad turite įdiegtą Docker ir Docker Compose
2. Klonuokite repozitoriją:
   ```bash
   git clone https://github.com/jusu-vardas/sociokratine-aplikacija.git
   cd sociokratine-aplikacija
   ```

3. Paleiskite konteinerius:
   ```bash
   docker-compose up -d
   ```

4. Aplikacija bus pasiekiama adresu http://localhost:3000

## 4. Duomenų modeliai

### Vartotojo modelis
- **name** - Vartotojo vardas
- **email** - Unikalus el. pašto adresas
- **password** - Šifruotas slaptažodis
- **role** - Vartotojo rolė (user, admin)
- **createdAt** - Sukūrimo data

### Pasiūlymo modelis
- **title** - Pasiūlymo pavadinimas
- **description** - Pasiūlymo aprašymas
- **status** - Pasiūlymo būsena (draft, under_discussion, voting, accepted, rejected)
- **owner** - Pasiūlymo savininkas (objektas su id, name, email)
- **facilitator** - Pasiūlymo facilitatorius (objektas su id, name, email)
- **participants** - Pasiūlymo dalyviai (masyvas objektų su id, name, email, role)
- **deadline** - Terminas
- **registrationDate** - Registracijos data
- **createdAt** - Sukūrimo data
- **updatedAt** - Paskutinio atnaujinimo data

### Balsavimo modelis
- **proposalId** - Pasiūlymo ID
- **userId** - Vartotojo ID
- **vote** - Balsas ("for", "against", "abstain")
- **comment** - Komentaras
- **createdAt** - Balsavimo data

### Pranešimo modelis
- **type** - Pranešimo tipas ("system", "user")
- **sender** - Siuntėjas (objektas su id, name)
- **recipients** - Gavėjai (masyvas objektų su id, name, read)
- **proposalId** - Pasiūlymo ID
- **title** - Pranešimo pavadinimas
- **content** - Pranešimo turinys
- **createdAt** - Sukūrimo data

## 5. Autentifikacijos sistema

### Vartotojo registracija
1. Vartotojas pateikia vardą, el. paštą ir slaptažodį
2. Sistema patikrina, ar el. paštas unikalus
3. Slaptažodis užšifruojamas naudojant bcrypt
4. Sukuriamas naujas vartotojo įrašas duomenų bazėje
5. Sugeneruojamas JWT token
6. Grąžinamas token ir vartotojo duomenys

### Vartotojo prisijungimas
1. Vartotojas pateikia el. paštą ir slaptažodį
2. Sistema patikrina, ar vartotojas egzistuoja
3. Patikrinamas slaptažodžio teisingumas
4. Sugeneruojamas JWT token
5. Grąžinamas token ir vartotojo duomenys

### Autentifikacijos middleware
1. Tikrinama, ar užklausoje yra Authorization header su Bearer token
2. Token verifikuojamas naudojant JWT
3. Randamas vartotojas pagal token ID
4. Vartotojo duomenys pridedami prie užklausos objekto

## 6. Leidimų sistema

### Pasiūlymų peržiūros leidimai
- Administratoriai gali peržiūrėti visus pasiūlymus
- Vartotojai gali peržiūrėti tik tuos pasiūlymus, kuriuose jie yra:
  - Savininkai
  - Facilitatoriai
  - Dalyviai

### Pasiūlymų redagavimo leidimai
- Administratoriai gali redaguoti visus pasiūlymus
- Juodraščio būsenoje esančius pasiūlymus gali redaguoti:
  - Savininkas
  - Facilitatorius
- Kitose būsenose esančius pasiūlymus gali redaguoti tik:
  - Facilitatorius

### Pasiūlymų būsenos keitimo leidimai
- Administratoriai gali keisti visų pasiūlymų būsenas
- Tik facilitatorius gali keisti pasiūlymo būseną
- Negalima keisti pasiūlymų, kurie jau yra galutinėje būsenoje (accepted/rejected)

### Pasiūlymų ištrynimo leidimai
- Administratoriai gali ištrinti visus pasiūlymus
- Savininkas gali ištrinti savo pasiūlymus
- Facilitatorius gali ištrinti pasiūlymus, kuriuose jis yra facilitatorius

## 7. API maršrutai

### Vartotojų maršrutai
- **POST /api/users/register** - Vartotojo registracija
- **POST /api/users/login** - Vartotojo prisijungimas
- **GET /api/users/me** - Gauti prisijungusio vartotojo duomenis
- **GET /api/users** - Gauti visų vartotojų sąrašą (tik administratoriams)

### Pasiūlymų maršrutai
- **GET /api/proposals** - Gauti pasiūlymų sąrašą su filtravimu ir rūšiavimu
- **GET /api/proposals/:id** - Gauti konkretų pasiūlymą pagal ID
- **POST /api/proposals** - Sukurti naują pasiūlymą
- **PUT /api/proposals/:id** - Atnaujinti pasiūlymą
- **DELETE /api/proposals/:id** - Ištrinti pasiūlymą
- **PATCH /api/proposals/:id/status** - Atnaujinti pasiūlymo būseną
- **POST /api/proposals/:id/facilitator** - Priskirti facilitatorių
- **POST /api/proposals/:id/participants** - Pridėti dalyvį
- **DELETE /api/proposals/:id/participants/:userId** - Pašalinti dalyvį

### Balsavimo maršrutai
- **POST /api/proposals/:id/votes** - Balsuoti už pasiūlymą
- **GET /api/proposals/:id/votes** - Gauti pasiūlymo balsavimo rezultatus
- **PUT /api/proposals/:id/votes/:voteId** - Atnaujinti balsą
- **DELETE /api/proposals/:id/votes/:voteId** - Pašalinti balsą

### Pranešimų maršrutai
- **GET /api/notifications** - Gauti vartotojo pranešimus
- **GET /api/notifications/:id** - Gauti konkretų pranešimą
- **POST /api/notifications** - Sukurti naują pranešimą
- **PATCH /api/notifications/:id/read** - Pažymėti pranešimą kaip perskaitytą
- **DELETE /api/notifications/:id** - Ištrinti pranešimą

## 8. Pasiūlymų būsenų valdymas

### Būsenų perėjimai
1. **draft** (juodraštis) - Pradinis pasiūlymo etapas, kai jis kuriamas ir redaguojamas
2. **under_discussion** (aptariamas) - Pasiūlymas pateiktas aptarimui, galima pridėti dalyvius
3. **voting** (balsavimas) - Pasiūlymas pateiktas balsavimui
4. **accepted** (priimtas) - Pasiūlymas priimtas
5. **rejected** (atmestas) - Pasiūlymas atmestas

### Būsenų keitimo taisyklės
- Tik facilitatorius arba administratorius gali keisti būseną
- Būsenos keitimas turi sekti loginę seką (negalima peršokti etapų)
- Galutinės būsenos (accepted, rejected) nebegali būti keičiamos

## 9. Frontend komponentai

### Autentifikacijos komponentai
- **LoginPage** - Prisijungimo forma
- **RegisterPage** - Registracijos forma
- **AuthContext** - Vartotojo autentifikacijos būsenos valdymas

### Pasiūlymų komponentai
- **ProposalsPage** - Pagrindinis pasiūlymų puslapis
- **ProposalsList** - Pasiūlymų sąrašas su filtravimu ir rūšiavimu
- **ProposalDetails** - Detalus pasiūlymo peržiūros komponentas
- **ProposalForm** - Pasiūlymo kūrimo/redagavimo forma
- **ProposalFilters** - Pasiūlymų filtravimo komponentas

### Balsavimo komponentai
- **VotingForm** - Balsavimo forma
- **VotingResults** - Balsavimo rezultatų atvaizdavimas
- **VotingStatus** - Balsavimo būsenos atvaizdavimas

### Pranešimų komponentai
- **NotificationsList** - Pranešimų sąrašas
- **NotificationBadge** - Neperskaitytų pranešimų ženkliukas
- **NotificationForm** - Pranešimo siuntimo forma

### Pagalbiniai komponentai
- **StatusBadge** - Pasiūlymo būsenos ženkliukas
- **ConfirmDialog** - Patvirtinimo dialogas veiksmams
- **ErrorAlert** - Klaidų atvaizdavimas
- **LoadingSpinner** - Užkrovimo indikatorius

## 10. Duomenų srautai

### Pasiūlymų gavimas
1. Frontend siunčia GET užklausą į `/api/proposals` su filtravimo parametrais
2. Backend tikrina vartotojo autentifikaciją
3. Backend filtruoja pasiūlymus pagal vartotojo ID (savininkas, facilitatorius, dalyvis)
4. Backend taiko papildomus filtrus (paieška, būsena)
5. Backend grąžina filtruotų pasiūlymų sąrašą
6. Frontend atvaizduoja pasiūlymus

### Pasiūlymo sukūrimas
1. Vartotojas užpildo pasiūlymo formą
2. Frontend siunčia POST užklausą į `/api/proposals`
3. Backend tikrina vartotojo autentifikaciją
4. Backend sukuria naują pasiūlymą su vartotoju kaip savininku
5. Backend grąžina sukurto pasiūlymo duomenis
6. Frontend atnaujina pasiūlymų sąrašą

### Pasiūlymo redagavimas
1. Vartotojas redaguoja pasiūlymą
2. Frontend tikrina, ar vartotojas turi teisę redaguoti (canEditProposal funkcija)
3. Frontend siunčia PUT užklausą į `/api/proposals/:id`
4. Backend tikrina vartotojo autentifikaciją
5. Backend tikrina, ar vartotojas turi teisę redaguoti (canUserEditProposal funkcija)
6. Backend atnaujina pasiūlymą
7. Backend grąžina atnaujinto pasiūlymo duomenis
8. Frontend atnaujina pasiūlymų sąrašą

### Pasiūlymo būsenos keitimas
1. Vartotojas keičia pasiūlymo būseną
2. Frontend tikrina, ar vartotojas turi teisę keisti būseną (canChangeStatus funkcija)
3. Frontend siunčia PATCH užklausą į `/api/proposals/:id/status`
4. Backend tikrina vartotojo autentifikaciją
5. Backend tikrina, ar būsena yra tinkama
6. Backend tikrina, ar vartotojas turi teisę keisti būseną (administratorius arba facilitatorius)
7. Backend atnaujina pasiūlymo būseną
8. Backend grąžina atnaujinto pasiūlymo duomenis
9. Frontend atnaujina pasiūlymų sąrašą

### Pasiūlymo ištrynimas
1. Vartotojas bando ištrinti pasiūlymą
2. Frontend tikrina, ar vartotojas turi teisę ištrinti (canDeleteProposal funkcija)
3. Frontend siunčia DELETE užklausą į `/api/proposals/:id`
4. Backend tikrina vartotojo autentifikaciją
5. Backend tikrina, ar vartotojas turi teisę ištrinti (administratorius, savininkas arba facilitatorius)
6. Backend ištrina pasiūlymą
7. Backend grąžina sėkmės pranešimą
8. Frontend atnaujina pasiūlymų sąrašą

### Balsavimo procesas
1. Facilitatorius pakeičia pasiūlymo būseną į "voting"
2. Visi dalyviai gauna pranešimą apie balsavimą
3. Dalyvis balsuoja naudodamas VotingForm komponentą
4. Frontend siunčia POST užklausą į `/api/proposals/:id/votes`
5. Backend tikrina vartotojo autentifikaciją
6. Backend tikrina, ar vartotojas yra pasiūlymo dalyvis
7. Backend išsaugo balsą
8. Backend grąžina atnaujintus balsavimo rezultatus
9. Frontend atnaujina balsavimo rezultatus

## 11. Klaidų valdymas

### Backend klaidų valdymas
- Naudojamas express-async-handler asinchroninių funkcijų klaidų valdymui
- Klaidos registruojamos konsolėje su detaliais pranešimais
- Klaidos grąžinamos klientui su atitinkamais HTTP statusais:
  - 400 - Blogi užklausos duomenys
  - 401 - Neautorizuota
  - 403 - Draudžiama
  - 404 - Nerasta
  - 500 - Serverio klaida

### Frontend klaidų valdymas
- Axios interceptoriai HTTP užklausų klaidų apdorojimui
- 401 klaidos atveju vartotojas atjungiamas ir nukreipiamas į prisijungimo puslapį
- Klaidos rodomos vartotojui naudojant ErrorAlert komponentą
- Detalūs klaidų pranešimai registruojami konsolėje

## 12. ID palyginimo logika

Viena iš pagrindinių problemų, su kuria susidurta kuriant aplikaciją, buvo MongoDB ObjectId palyginimas. MongoDB ObjectId yra objektas, o ne paprastas string, todėl tiesioginis palyginimas neveikia. Šiai problemai spręsti:

1. Visur, kur lyginami ID, jie konvertuojami į string:
   ```javascript
   const isOwner = String(proposal.owner.id) === String(user.id);
   ```

2. Patikrinama, ar ID egzistuoja prieš lyginimą:
   ```javascript
   if (!proposal.facilitator || !proposal.facilitator.id) {
     return false;
   }
   ```

3. Registruojami ID tipai derinimo tikslais:
   ```javascript
   console.log('User ID:', userId, typeof userId);
   console.log('Proposal owner ID:', proposal.owner.id, typeof proposal.owner.id);
   ```

## 13. Svarbiausios funkcijos

### canUserViewProposal
Tikrina, ar vartotojas turi teisę peržiūrėti pasiūlymą:
- Administratoriai gali peržiūrėti visus pasiūlymus
- Savininkas gali peržiūrėti savo pasiūlymą
- Facilitatorius gali peržiūrėti pasiūlymą
- Dalyvis gali peržiūrėti pasiūlymą

### canUserEditProposal
Tikrina, ar vartotojas turi teisę redaguoti pasiūlymą:
- Administratoriai gali redaguoti visus pasiūlymus
- Juodraščio būsenoje esančius pasiūlymus gali redaguoti savininkas arba facilitatorius
- Kitose būsenose esančius pasiūlymus gali redaguoti tik facilitatorius

### canChangeStatus
Tikrina, ar vartotojas turi teisę keisti pasiūlymo būseną:
- Administratoriai gali keisti visų pasiūlymų būsenas
- Tik facilitatorius gali keisti pasiūlymo būseną
- Negalima keisti pasiūlymų, kurie jau yra galutinėje būsenoje (accepted/rejected)

### canDeleteProposal
Tikrina, ar vartotojas turi teisę ištrinti pasiūlymą:
- Administratoriai gali ištrinti visus pasiūlymus
- Savininkas gali ištrinti savo pasiūlymus
- Facilitatorius gali ištrinti pasiūlymus, kuriuose jis yra facilitatorius

## 14. Derinimo strategijos

Kuriant aplikaciją, buvo naudojamos šios derinimo strategijos:

1. **Išsamus registravimas** - Visose svarbiose funkcijose naudojami console.log pranešimai, kurie padeda sekti funkcijų vykdymą ir kintamųjų reikšmes.

2. **ID tipų tikrinimas** - Registruojami ID tipai, kad būtų galima nustatyti, ar jie yra string, objektai ar kito tipo.

3. **Būsenos registravimas** - Registruojama pasiūlymų būsena, kad būtų galima patikrinti, ar teisingai veikia būsenos keitimo logika.

4. **Leidimų tikrinimas** - Registruojami leidimų tikrinimo rezultatai, kad būtų galima patikrinti, ar teisingai veikia leidimų sistema.

5. **HTTP užklausų registravimas** - Registruojamos HTTP užklausos ir atsakymai, kad būtų galima patikrinti, ar teisingai veikia API.

## 15. Saugumo aspektai

1. **JWT autentifikacija** - Vartotojų autentifikacijai naudojami JWT, kurie turi ribotą galiojimo laiką.

2. **Slaptažodžių šifravimas** - Vartotojų slaptažodžiai šifruojami naudojant bcrypt.

3. **Leidimų tikrinimas** - Kiekviena operacija tikrinama, ar vartotojas turi teisę ją atlikti.

4. **CORS apsauga** - Naudojama CORS apsauga, kad būtų galima kontroliuoti, kurios svetainės gali kreiptis į API.

5. **Duomenų validavimas** - Visi įvesties duomenys validuojami tiek kliento, tiek serverio pusėje.

## 16. Testavimo strategija

### Vienetų testai
- **Backend**: Naudojamas Jest testavimo karkasas
- **Frontend**: Naudojamas React Testing Library ir Jest

### Integraciniai testai
- Naudojamas Supertest biblioteka API testavimui
- Testai apima pagrindinius API maršrutus ir jų funkcionalumą

### End-to-End testai
- Naudojamas Cypress testavimo karkasas
- Testai apima pagrindinius vartotojo scenarijus:
  - Vartotojo registracija ir prisijungimas
  - Pasiūlymo sukūrimas ir redagavimas
  - Pasiūlymo būsenos keitimas
  - Dalyvių pridėjimas ir šalinimas

### Testavimo komandos
```bash
# Vienetų testai
npm run test

# Integraciniai testai
npm run test:integration

# End-to-End testai
npm run test:e2e
```

### Testavimo aplinka
- Testams naudojama atskira MongoDB duomenų bazė
- Prieš kiekvieną testą duomenų bazė išvaloma
- Testams naudojami fiksuoti duomenys (fixtures)

## 17. Balsavimo sistema

### Balsavimo principai
- Sociokratinėje sistemoje balsavimas vyksta ne daugumos principu, bet siekiant bendro sutarimo
- Vartotojai gali balsuoti "Už", "Prieš" arba "Susilaikyti"
- Pasiūlymas laikomas priimtu, jei nėra "Prieš" balsų arba jei visi "Prieš" balsavę dalyviai sutinka su pasiūlymu po diskusijos

### Balsavimo procesas
1. Facilitatorius pakeičia pasiūlymo būseną į "voting"
2. Visi dalyviai gauna pranešimą apie balsavimą
3. Dalyviai balsuoja per nustatytą laiką
4. Facilitatorius peržiūri balsavimo rezultatus
5. Jei yra "Prieš" balsų, facilitatorius inicijuoja diskusiją
6. Po diskusijos vyksta pakartotinis balsavimas
7. Facilitatorius priima galutinį sprendimą pagal balsavimo rezultatus

### Balsavimo duomenų modelis
```javascript
{
  proposalId: ObjectId,
  userId: ObjectId,
  vote: String, // "for", "against", "abstain"
  comment: String,
  createdAt: Date
}
```

## 18. Pranešimų sistema

### Pranešimų tipai
- **Sisteminiai pranešimai** - Automatiškai generuojami sistemos (pvz., pasiūlymo būsenos pasikeitimas)
- **Vartotojų pranešimai** - Siunčiami vartotojų (pvz., komentarai, klausimai)

### Pranešimų duomenų modelis
```javascript
{
  type: String, // "system", "user"
  sender: {
    id: ObjectId,
    name: String
  },
  recipients: [{
    id: ObjectId,
    name: String,
    read: Boolean
  }],
  proposalId: ObjectId,
  title: String,
  content: String,
  createdAt: Date
}
```

### Pranešimų siuntimo logika
- Kai pasiūlymo būsena pasikeičia, visiems dalyviams siunčiamas sisteminis pranešimas
- Kai pridedamas naujas dalyvis, jam siunčiamas sisteminis pranešimas
- Vartotojai gali siųsti pranešimus kitiems pasiūlymo dalyviams

## 19. Duomenų bazės indeksavimas ir optimizavimas

### Indeksai
- **Vartotojų kolekcija**:
  - `email`: unikalus indeksas greitai paieškai pagal el. paštą
  - `role`: indeksas greitai paieškai pagal rolę

- **Pasiūlymų kolekcija**:
  - `status`: indeksas greitai paieškai pagal būseną
  - `"owner.id"`: indeksas greitai paieškai pagal savininką
  - `"facilitator.id"`: indeksas greitai paieškai pagal facilitatorių
  - `"participants.id"`: indeksas greitai paieškai pagal dalyvius
  - `createdAt`: indeksas rūšiavimui pagal sukūrimo datą

### Duomenų bazės užklausų optimizavimas
- Naudojami projekcijos operatoriai, kad būtų grąžinami tik reikalingi laukai
- Naudojami agregavimo pipeline operatoriai sudėtingoms užklausoms
- Dideliems duomenų kiekiams naudojamas puslapiavimas

### Mongoose modelių optimizavimas
- Naudojami virtualūs laukai skaičiuojamiems duomenims
- Naudojami pre-save hooks duomenų validavimui
- Naudojami post-save hooks susijusių duomenų atnaujinimui

## 20. Daugiakalbiškumo palaikymas

### Technologijos
- **i18next** - Daugiakalbiškumo biblioteka
- **react-i18next** - React integracija su i18next

### Palaikomos kalbos
- Lietuvių (pagrindinė)
- Anglų
- Rusų

### Vertimų failų struktūra
```
/src
  /locales
    /lt
      common.json
      auth.json
      proposals.json
    /en
      common.json
      auth.json
      proposals.json
    /ru
      common.json
      auth.json
      proposals.json
```

### Vertimų naudojimas komponentuose
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('proposals');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Kalbos keitimas
- Vartotojas gali pasirinkti kalbą iš išskleidžiamo meniu
- Pasirinkta kalba išsaugoma localStorage
- Kalba automatiškai nustatoma pagal naršyklės kalbą pirmą kartą apsilankius

## 21. Projekto struktūra

### Backend struktūra
```
/backend
  /config
    db.js          # Duomenų bazės konfigūracija
    config.env     # Aplinkos kintamieji (nepridedama į Git)
  /controllers
    userController.js
    proposalController.js
    voteController.js
    notificationController.js
  /middleware
    authMiddleware.js
    errorMiddleware.js
  /models
    userModel.js
    proposalModel.js
    voteModel.js
    notificationModel.js
  /routes
    userRoutes.js
    proposalRoutes.js
    voteRoutes.js
    notificationRoutes.js
  /utils
    generateToken.js
    permissions.js
  server.js        # Pagrindinis serverio failas
  package.json
```

### Frontend struktūra
```
/frontend
  /public
  /src
    /components
      /auth
        Login.tsx
        Register.tsx
      /proposals
        ProposalsList.tsx
        ProposalDetails.tsx
        ProposalForm.tsx
      /voting
        VotingForm.tsx
        VotingResults.tsx
      /notifications
        NotificationsList.tsx
        NotificationBadge.tsx
    /context
      AuthContext.tsx
      ProposalContext.tsx
      NotificationContext.tsx
    /pages
      Home.tsx
      Proposals.tsx
      ProposalDetail.tsx
      Profile.tsx
    /services
      api.ts
      auth.ts
      proposals.ts
      votes.ts
      notifications.ts
    /utils
      permissions.ts
      formatters.ts
    /locales
      /lt
      /en
      /ru
    App.tsx
    index.tsx
    package.json
```

## 22. Versijų kontrolė

### Git darbų eiga
- Naudojamas GitHub Flow modelis
- Pagrindinė šaka: `main`
- Funkcionalumams kurti naudojamos atskiros šakos: `feature/feature-name`
- Klaidoms taisyti naudojamos šakos: `bugfix/bug-name`
- Prieš sujungiant šakas, atliekama kodo peržiūra (pull request)

### Įsipareigojimų konvencijos
- Naudojama Conventional Commits specifikacija:
  - `feat`: naujas funkcionalumas
  - `fix`: klaidos taisymas
  - `docs`: dokumentacijos pakeitimai
  - `style`: kodo stiliaus pakeitimai (formatavimas)
  - `refactor`: kodo refaktoringas
  - `test`: testų pridėjimas ar keitimas
  - `chore`: pakeitimai, nesusiję su kodu (build, dependencies)

### Šakų apsauga
- `main` šaka apsaugota nuo tiesioginių įsipareigojimų
- Prieš sujungimą turi būti atlikti automatiniai testai
- Būtina bent viena teigiama peržiūra

## 23. CI/CD

### Continuous Integration
- Naudojamas GitHub Actions arba GitLab CI
- Kiekvienam įsipareigojimui vykdomi automatiniai testai
- Tikrinama kodo kokybė naudojant ESLint ir Prettier

### Continuous Deployment
- Automatinis diegimas į test aplinką kiekvienam pull request
- Automatinis diegimas į staging aplinką sujungus į `main` šaką
- Rankinis patvirtinimas diegimui į production aplinką

### Pipeline etapai
1. **Build** - Aplikacijos kompiliavimas
2. **Test** - Vienetų ir integracinių testų vykdymas
3. **Lint** - Kodo kokybės tikrinimas
4. **Deploy** - Diegimas į atitinkamą aplinką

## 24. Našumo optimizavimas

### Frontend optimizavimas
- React komponentų memoizacija naudojant `React.memo`, `useMemo` ir `useCallback`
- Lazy loading komponenams naudojant `React.lazy` ir `Suspense`
- Code splitting naudojant dynamic imports
- Vaizdų optimizavimas (suspaudimas, lazy loading)
- Bundle size optimizavimas naudojant tree shaking

### Backend optimizavimas
- Duomenų bazės užklausų optimizavimas
- Atsakymų caching naudojant Redis
- Horizontalus skalabilumas naudojant load balancer
- Rate limiting apsaugai nuo DDoS atakų
- Gzip kompresija

### API optimizavimas
- Pagination dideliems duomenų kiekiams
- Partial responses (tik reikalingų laukų grąžinimas)
- Batch requests (kelių užklausų apjungimas)

## 25. Mobilusis dizainas ir prieinamumas

### Responsive dizainas
- Naudojamas Mobile-first dizaino principas
- Flex ir Grid išdėstymai
- Media queries skirtingiems ekrano dydžiams
- Viewport meta tag

### Prieinamumo standartai
- WCAG 2.1 AA lygio atitikimas
- Semantinis HTML
- Alt tekstai vaizdams
- Klaviatūros navigacija
- Screen reader palaikymas
- Kontrastingas spalvų pasirinkimas

Šios instrukcijos suteikia išsamų vadovą sociokratinės aplikacijos kūrimui, apimantį visus pagrindinius aspektus nuo technologijų pasirinkimo iki diegimo, testavimo ir optimizavimo. 