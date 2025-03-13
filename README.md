# SocioDecisionMakingApp

Sociokratinė sprendimų priėmimo aplikacija, leidžianti vartotojams kurti, redaguoti, aptarti ir balsuoti už pasiūlymus. Sistema sukurta remiantis sociokratiniais principais, kur sprendimai priimami bendru sutarimu, o ne daugumos balsavimu.

## Projekto struktūra

Projektas sudarytas iš dviejų dalių:
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, TypeScript, Material UI

## Reikalavimai

- Node.js (v14.x arba naujesnė)
- MongoDB (v4.x arba naujesnė)
- npm arba yarn

## Paleidimas

### Backend

1. Pereiti į backend direktoriją:
   ```bash
   cd backend
   ```

2. Įdiegti priklausomybes:
   ```bash
   npm install
   ```

3. Sukurti .env failą su šiais kintamaisiais:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/socio-decision-making-app
   JWT_SECRET=jūsų_slaptas_raktas
   JWT_EXPIRE=30d
   ```

4. Paleisti serverį:
   ```bash
   npm run dev
   ```

### Frontend

1. Pereiti į frontend direktoriją:
   ```bash
   cd frontend
   ```

2. Įdiegti priklausomybes:
   ```bash
   npm install
   ```

3. Sukurti .env failą su šiais kintamaisiais:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Paleisti aplikaciją:
   ```bash
   npm start
   ```

## Funkcionalumas

### Vartotojų valdymas
- Registracija ir prisijungimas
- Vartotojų rolės (vartotojas, administratorius)
- Profilio valdymas

### Pasiūlymų valdymas
- Pasiūlymų kūrimas ir redagavimas
- Pasiūlymų būsenų valdymas
- Facilitatorių ir dalyvių valdymas

### Balsavimo sistema
- Balsavimas už pasiūlymus
- Balsavimo rezultatų peržiūra
- Sprendimų priėmimas sociokratiniu metodu

### Pranešimų sistema
- Automatiniai pranešimai apie pasiūlymų būsenos pasikeitimus
- Vartotojų pranešimai kitiems dalyviams

## Licencija

ISC 