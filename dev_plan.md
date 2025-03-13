# SocioDecisionMakingApp - Vystymo planas

## Etapas 1: Projekto struktūros paruošimas ir autentifikacijos sistema (2 savaitės)

### 1.1 Projekto inicializavimas ir aplinkos paruošimas
- Sukurti GitHub repozitoriją
- Inicializuoti backend projektą su Node.js ir Express
- Inicializuoti frontend projektą su React ir TypeScript
- Nustatyti ESLint ir Prettier kodo formatavimui
- Sukurti Docker konteienerius vystymui

### 1.2 Duomenų bazės konfigūracija
- Sukonfigūruoti MongoDB, Mongoose
- Nustatyti duomenų bazės prisijungimą
- Sukurti pradines schemas ir modelius

### 1.3 Autentifikacijos sistema - Backend
- Implementuoti vartotojo modelį
- Sukurti registracijos, prisijungimo ir atsijungimo API
- Implementuoti JWT autentifikaciją
- Sukurti autentifikacijos middleware

### 1.4 Autentifikacijos sistema - Frontend
- Sukurti registracijos formą
- Sukurti prisijungimo formą
- Implementuoti AuthContext vartotojo būsenos valdymui
- Sukurti apsaugotus maršrutus (Protected Routes)

### 1.5 Testavimas
- Parašyti vienetų testus autentifikacijos funkcijoms
- Parašyti integracinius testus API maršrutams
- Atlikti rankinį testavimą

## Etapas 2: Pasiūlymų valdymo sistema (3 savaitės)

### 2.1 Pasiūlymų valdymas - Backend
- Implementuoti pasiūlymo modelį
- Sukurti CRUD operacijas pasiūlymams
- Implementuoti leidimų sistemą (permissions)
- Sukurti pasiūlymų būsenų valdymo logiką

### 2.2 Pasiūlymų valdymas - Frontend
- Sukurti pasiūlymų sąrašo komponentą
- Sukurti pasiūlymo detalių komponentą
- Sukurti pasiūlymo redagavimo formą
- Sukurti pasiūlymų filtravimo funkciją

### 2.3 Facilitatorių ir dalyvių valdymas
- Backend: API facilitatorių ir dalyvių valdymui
- Frontend: Komponentai dalyvių pridėjimui/šalinimui
- Leidimų tikrinimo logika

### 2.4 Testavimas
- Parašyti vienetų testus pasiūlymų funkcijoms
- Parašyti integracinius testus pasiūlymų API
- Atlikti rankinį testavimą

## Etapas 3: Balsavimo sistema (2 savaitės)

### 3.1 Balsavimo sistema - Backend
- Implementuoti balsavimo modelį
- Sukurti API balsavimui
- Implementuoti balsavimo rezultatų logiką

### 3.2 Balsavimo sistema - Frontend
- Sukurti balsavimo formą
- Sukurti balsavimo rezultatų komponentą
- Implementuoti balsavimo būsenos atvaizdavimą

### 3.3 Testavimas
- Parašyti vienetų testus balsavimo funkcijoms
- Parašyti integracinius testus balsavimo API
- Atlikti rankinį testavimą

## Etapas 4: Pranešimų sistema (2 savaitės)

### 4.1 Pranešimų sistema - Backend
- Implementuoti pranešimų modelį
- Sukurti API pranešimams
- Implementuoti automatinių pranešimų logiką

### 4.2 Pranešimų sistema - Frontend
- Sukurti pranešimų sąrašo komponentą
- Sukurti pranešimų ženkliuką (badge)
- Implementuoti pranešimų siuntimo formą

### 4.3 Testavimas
- Parašyti vienetų testus pranešimų funkcijoms
- Parašyti integracinius testus pranešimų API
- Atlikti rankinį testavimą

## Etapas 5: Daugiakalbiškumas ir UI/UX tobulinimas (2 savaitės)

### 5.1 Daugiakalbiškumas
- Integruoti i18next biblioteką
- Sukurti vertimų failus (lietuvių, anglų, rusų kalbomis)
- Implementuoti kalbos keitimo funkciją

### 5.2 UI/UX tobulinimas
- Sukurti vientisą dizaino sistemą
- Optimizuoti vartotojo sąsają skirtingiems įrenginiams
- Pagerinti prieinamumą (accessibility)
- Atlikti vartotojų testavimą

### 5.3 Testavimas
- Atlikti rankinį testavimą skirtingomis kalbomis
- Patikrinti prieinamumą (accessibility) naudojant įrankius
- Atlikti našumo testavimą

## Etapas 6: Projekto optimizavimas ir diegimas (2 savaitės)

### 6.1 Backend optimizavimas
- Optimizuoti duomenų bazės užklausas
- Įdiegti caching mechanizmus
- Optimizuoti API atsakymus

### 6.2 Frontend optimizavimas
- Implementuoti lazy loading
- Optimizuoti bundle dydį
- Pagerinti renderinimo našumą

### 6.3 CI/CD diegimas
- Sukurti GitHub Actions workflow
- Nustatyti automatinį testavimą
- Sukurti diegimo į skirtingas aplinkas procesą

### 6.4 Dokumentacija
- Sukurti API dokumentaciją naudojant Swagger
- Parašyti vartotojo vadovą
- Parašyti administratoriaus vadovą

### 6.5 Galutinis testavimas ir paleidimas
- Atlikti pilną end-to-end testavimą
- Ištaisyti likusias klaidas
- Paleisti sistemą produkcijoje 