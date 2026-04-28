# HM Sportcars — Sito Web

Sito React moderno per HM Sportcars con admin panel integrato.

## Funzionalità
- Catalogo auto con filtri per categoria
- Admin panel protetto da password per gestire le auto
- Dati salvati in localStorage (persistenti nel browser)
- Design dark moderno stile Porsche

## Password Admin
```
hmsport2025
```
> ⚠️ Cambia la password nel file `src/App.jsx` alla riga `const ADMIN_PWD = "hmsport2025";`

---

## Come deployare su Vercel (gratis, 10 minuti)

### 1. Installa dipendenze e testa in locale
```bash
npm install
npm run dev
```
Apri http://localhost:5173

### 2. Carica su GitHub
1. Vai su [github.com](https://github.com) → **New repository**
2. Nome: `hm-sportcars` → crea il repo
3. Nella cartella del progetto, esegui:
```bash
git init
git add .
git commit -m "primo commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/hm-sportcars.git
git push -u origin main
```

### 3. Deploy su Vercel
1. Vai su [vercel.com](https://vercel.com) → accedi con GitHub
2. Clicca **"Add New Project"**
3. Seleziona il repository `hm-sportcars`
4. Vercel rileva automaticamente Vite/React
5. Clicca **Deploy** → in 2 minuti il sito è online!

### 4. Dominio personalizzato (opzionale)
Nel dashboard Vercel → Settings → Domains → aggiungi `hm-sportcars.com`

---

## Struttura file
```
hm-sportcars/
├── src/
│   ├── App.jsx      ← tutto il sito + admin
│   └── main.jsx     ← entry point
├── public/
│   └── favicon.svg
├── index.html
├── package.json
└── vite.config.js
```

## Prossimi passi consigliati
- **Foto reali**: sostituisci gli URL Unsplash con foto reali delle tue auto
- **Contatti reali**: aggiungi telefono, email e indirizzo nelle sezioni contatti
- **Database cloud**: per condividere i dati tra dispositivi, considera Firebase Firestore (gratuito)
