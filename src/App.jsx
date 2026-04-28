import { useState, useEffect, useRef } from "react";
import { db, storage } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const ADMIN_PWD = "hmsport2025";
const WHATSAPP_NUMBER = "393472607790"; // Numero WhatsApp senza + e spazi

const CAR_BRANDS = [
  "Abarth","Alfa Romeo","Audi","BMW","Chevrolet","Chrysler","Citroën","Cupra",
  "Dacia","Dodge","DS Automobiles","Ferrari","Fiat","Ford","Genesis","Honda",
  "Hyundai","Infiniti","Jaguar","Jeep","Kia","Lamborghini","Land Rover","Lexus",
  "Lynk & Co","Maserati","Mazda","Mercedes-Benz","MG","Mini","Mitsubishi",
  "Nissan","Opel","Peugeot","Porsche","Renault","Seat","Skoda","Smart",
  "Subaru","Suzuki","Tesla","Toyota","Volkswagen","Volvo"
].sort();

const T = {
  it: {
    nav: { home: "Home", catalog: "Catalogo", about: "Chi Siamo", where: "Dove Siamo", contact: "Contatti" },
    hero: {
      eyebrow: "Selezione Esclusiva — Alto Adige",
      title1: "Vetture Selezionate", title2: "con Passione",
      sub: "Auto usate selezionate a Vandoies, in Alto Adige. Ogni vettura è controllata e proposta con trasparenza, consegna possibile in tutta Italia.",
      cta1: "Scopri il Catalogo", cta2: "Contattaci",
      stat1: "Vetture Disponibili", stat2: "Anni di Esperienza", stat3: "Clienti Soddisfatti",
    },
    ticker: ["Veicoli Certificati","Garanzia Inclusa","Finanziamento Disponibile","Consegna in Tutta Italia","Ritiro Usato","Assistenza Post-Vendita"],
    catalog: { label: "Disponibilità Immediata", title: "Il nostro", titleRed: "catalogo", empty: "Nessuna vettura trovata", loading: "Caricamento vetture...", backBtn: "← Torna al catalogo" },
    search: { placeholder: "Cerca per marca o modello...", brand: "Marca", priceMin: "Prezzo min (€)", priceMax: "Prezzo max (€)", kmMax: "KM max", yearMin: "Anno min", yearMax: "Anno max", category: "Categoria", all: "Tutte", reset: "Azzera filtri", results: "vetture trovate", filters: "Filtri" },
    card: { iva: "IVA inclusa", details: "Vedi dettagli" },
    detail: {
      photos: "Foto", description: "Descrizione", specs: "Specifiche", contact: "Contatta",
      whatsapp: "Chatta su WhatsApp", whatsappMsg: "Ciao! Sono interessato alla",
      callBtn: "Chiama ora", emailBtn: "Invia email",
      specsLabels: { power: "Potenza", km: "Chilometri", year: "Anno", category: "Categoria", fuel: "Carburante", gearbox: "Cambio", color: "Colore", doors: "Porte", seats: "Posti" },
      noDesc: "Descrizione non disponibile.",
      price: "Prezzo", iva: "IVA inclusa",
      requestInfo: "Richiedi informazioni",
      sold: "Venduto", reserved: "Riservato",
      share: "Condividi", copied: "Link copiato!",
      photoOf: "di",
    },
    about: {
      pageLabel: "La nostra storia", pageTitle1: "Chi siamo", pageTitle2: "",
      hero: "Un'azienda a conduzione familiare, con passione per le automobili",
      heroSub: "Dal 2009 a Vandoies, in Alto Adige, ci occupiamo di auto usate selezionate con serietà e trasparenza.",
      story1: "HM Sportcars nasce nel 2009 a Vandoies (BZ), fondata da Martin Huber e Hartmann Leitner, entrambi appassionati di automobili con anni di esperienza nel settore. L'obiettivo è semplice: proporre auto usate selezionate a prezzi corretti, trattando ogni cliente con serietà e rispetto.",
      story2: "Ogni vettura che proponiamo viene controllata attentamente prima della vendita. Cerchiamo di essere trasparenti sulla storia e sulle condizioni di ogni auto, perché crediamo che un acquisto consapevole sia la base di un rapporto di fiducia duraturo.",
      story3: "Siamo un piccolo team familiare, disponibile e diretto. Ci teniamo a rispondere a ogni domanda e ad accompagnare i nostri clienti con attenzione, dall'interesse iniziale fino alla consegna del veicolo.",
      teamTitle: "Il nostro team",
      team: [
        { name: "Hans Mair", role: "Fondatore & Titolare", desc: "Appassionato di automobili da sempre, Hans guida HM Sportcars con visione e integrità da oltre 15 anni." },
        { name: "Lena Hofer", role: "Responsabile Vendite", desc: "Con 10 anni di esperienza nel settore, Lena ti aiuterà a trovare l'auto perfetta per le tue esigenze." },
        { name: "Marco Brunner", role: "Tecnico & Perito", desc: "Ex meccanico di professione, Marco certifica ogni vettura con occhio esperto e attenzione al dettaglio." },
        { name: "Sara Zelger", role: "Amministrazione & Clienti", desc: "Sara gestisce ogni pratica con precisione e garantisce un'esperienza d'acquisto senza stress." },
      ],
      valuesTitle: "I nostri valori",
      values: [
        { icon: "🔍", title: "Selezione Attenta", desc: "Prima di proporre un'auto la valutiamo con cura. Non mettiamo in vendita vetture che non compreremo noi stessi." },
        { icon: "📋", title: "Informazioni Chiare", desc: "Cerchiamo di fornire tutte le informazioni disponibili su ogni vettura: storia, chilometraggio e condizioni generali." },
        { icon: "🤝", title: "Rapporto Diretto", desc: "Siamo disponibili a rispondere a ogni domanda. Preferiamo un cliente ben informato a una vendita frettolosa." },
        { icon: "⭐", title: "Assistenza Post-Vendita", desc: "Non sparisco dopo la firma. Siamo disponibili anche dopo la consegna per qualsiasi necessità." },
      ],
      statsLabel: "In numeri",
    },
    where: {
      pageLabel: "Vieni a trovarci", pageTitle1: "Dove", pageTitle2: "Siamo",
      address: "Il nostro showroom", addressVal: "Via Statale 13", addressCity: "Via Statale 13\n39030 Vandoies (BZ)\nAlto Adige, Italia",
      hours: "Orari di apertura",
      hoursData: [{ day: "Lunedì – Venerdì", time: "8:30 – 18:00" }, { day: "Sabato", time: "9:00 – 13:00" }, { day: "Domenica", time: "Chiuso" }],
      howToGet: "Come raggiungerci", byCar: "In auto", byCarDesc: "Uscita Bressanone/Valle Isarco o Brunico sull'A22, seguire le indicazioni per Vandoies. Via Statale 13 è facilmente raggiungibile in auto.",
      byTrain: "In treno", byTrainDesc: "Fermata di Vandoies sulla linea ferroviaria Fortezza–San Candido, a pochi passi dallo showroom.",
      parking: "Parcheggio", parkingDesc: "Parcheggio gratuito disponibile direttamente davanti allo showroom per tutti i clienti.",
      mapTitle: "Trovaci su Google Maps", cta: "Apri in Google Maps",
    },
    contact: {
      pageLabel: "Siamo qui per te", pageTitle1: "Contat", pageTitle2: "taci",
      sub: "Hai domande su una vettura? Vuoi fissare un appuntamento o richiedere una valutazione? Siamo disponibili a rispondere.",
      phone: "Telefono", phoneVal: "+39 0472 869296", phoneSub: "Lun–Ven: 8:30–18:00 · Sab: 9:00–13:00",
      email: "Email", emailVal: "info@ghm-sportcars.com", emailSub: "Risposta entro 24 ore",
      whatsapp: "WhatsApp", whatsappVal: "+39 347 260 7790", whatsappSub: "Scrivici su WhatsApp",
      formTitle: "Inviaci un messaggio",
      formName: "Nome e Cognome", formEmail: "Email", formPhone: "Telefono (opzionale)",
      formSubject: "Oggetto", formMessage: "Messaggio",
      formSubjects: ["Informazioni su una vettura", "Richiesta appuntamento", "Valutazione auto usata", "Finanziamento", "Altro"],
      formSend: "Invia Messaggio", formSending: "Invio...", formSent: "Messaggio inviato! Ti risponderemo presto.",
      formPlaceholderName: "es. Mario Rossi", formPlaceholderEmail: "es. mario@email.com",
      formPlaceholderPhone: "es. +39 333 000 0000", formPlaceholderMessage: "Scrivi qui la tua richiesta...",
    },
    footer: "© 2025 HM Sportcars OHG — Vandoies (BZ), Alto Adige",
    impressum: {
      nav: "Note Legali",
      title: "Note Legali / Impressum",
      s1title: "Committente e responsabile per il contenuto",
      s1: [
        "HM Sportcars OHG",
        "Via Statale 13",
        "I-39030 Vandoies (BZ)",
        "Rappresentanti legali: Martin Huber — Hartmann Leitner",
        "Tel: +39 0472 869296",
        "Email: info@ghm-sportcars.com",
        "P.IVA: IT02788200216",
        "Codice destinatario SDI: KRRH6B9",
      ],
      s2title: "Esclusione della responsabilità",
      s2: "Su questo sito cerchiamo di fornire informazioni accurate e complete. Tuttavia non assumiamo alcuna responsabilità per l'attualità, la correttezza e la completezza delle informazioni fornite. Ci riserviamo il diritto di modificare o aggiornare i contenuti senza preavviso.",
      s3title: "Riferimenti e Link",
      s3: "Nonostante un attento controllo, non assumiamo alcuna responsabilità per i contenuti dei siti esterni a cui si fa riferimento. Per i contenuti delle pagine collegate sono responsabili esclusivamente i loro operatori.",
      s4title: "Diritto d'autore e immagini",
      s4: "I contenuti e le immagini presenti su questo sito sono di proprietà di HM Sportcars OHG, salvo ove diversamente indicato. La riproduzione, anche parziale, senza autorizzazione scritta è vietata.",
      s5title: "Privacy e Cookie",
      s5: "Questo sito non raccoglie dati personali senza consenso esplicito. Non utilizziamo cookie di profilazione. Per qualsiasi richiesta relativa al trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR), è possibile contattarci all'indirizzo email sopra indicato.",
      s6title: "Validità legale",
      s6: "Nel caso in cui parti di questo documento non corrispondano alla normativa vigente, le parti rimanenti restano valide. Le eventuali controversie saranno risolte presso il Foro competente di Bolzano.",
      s7title: "Risoluzione alternativa delle controversie",
      s7: "Ai sensi dell'art. 14 del Reg. UE 524/2013, si informa che la Commissione Europea mette a disposizione una piattaforma per la risoluzione online delle controversie (ODR): https://ec.europa.eu/consumers/odr",
    },
    admin: {
      title: "Gestione Catalogo", login: "Area Admin", pwd: "Password", enter: "Accedi", cancel: "Annulla",
      wrongPwd: "Password non corretta", add: "+ Aggiungi Vettura", save: "Salva", delete: "Elimina Vettura",
      newCar: "Nuova Vettura", editCar: "Modifica Vettura", confirm: "Eliminare questa vettura?", confirm2: "Eliminare?",
      mandatory: "Marca e Modello obbligatori", updated: "Vettura aggiornata ✓", added: "Vettura aggiunta ✓", deleted: "Vettura eliminata",
      logout: "Esci", backSite: "← Torna al sito",
      uploadPhoto: "Foto Vettura", dropHere: "Trascina qui le foto", clickUpload: "oppure clicca per caricare",
      photoTip: "JPG, PNG, WEBP — più foto, selezionale tutte insieme", removePhoto: "Rimuovi", orUrl: "oppure inserisci URL foto principale",
      uploading: "Caricamento...", saving: "Salvataggio...",
      description: "Descrizione vettura", descPlaceholder: "Descrivi la vettura: storia, condizioni, dotazioni, optional...",
      fuel: "Carburante", gearbox: "Cambio", color: "Colore", doors: "Porte", seats: "Posti",
      fuelOpts: ["Benzina", "Diesel", "Ibrido", "Elettrico", "GPL", "Metano"],
      gearboxOpts: ["Manuale", "Automatico", "Semi-automatico"],
      photos: "Galleria Foto", addMorePhotos: "Aggiungi altre foto", photoCount: "foto caricate",
    },
    fields: {
      brand: "Marca", model: "Modello", year: "Anno", price: "Prezzo (€)", power: "Potenza (CV)",
      km: "Chilometri", cat: "Categoria", badge: "Badge",
      none: "Nessuno", newBadge: "Nuovo Arrivo", res: "Riservato", sold: "Venduto",
      sport: "Sport", luxury: "Luxury", suv: "SUV", classica: "Classica", selectBrand: "Seleziona marca...",
    },
  },
  de: {
    nav: { home: "Home", catalog: "Fahrzeuge", about: "Über Uns", where: "Standort", contact: "Kontakt" },
    hero: {
      eyebrow: "Exklusive Auswahl — Südtirol", title1: "Ausgewählte Fahrzeuge", title2: "mit Leidenschaft",
      sub: "Gebrauchtwagen aus Vintl in Südtirol — sorgfältig ausgewählt und ehrlich angeboten. Lieferung in ganz Italien möglich.",
      cta1: "Zum Fahrzeugkatalog", cta2: "Kontakt aufnehmen",
      stat1: "Fahrzeuge verfügbar", stat2: "Jahre Erfahrung", stat3: "Zufriedene Kunden",
    },
    ticker: ["Zertifizierte Fahrzeuge","Garantie inklusive","Finanzierung möglich","Lieferung in ganz Italien","Inzahlungnahme","After-Sales-Service"],
    catalog: { label: "Sofort verfügbar", title: "Unsere", titleRed: "Fahrzeuge", empty: "Keine Fahrzeuge gefunden", loading: "Fahrzeuge werden geladen...", backBtn: "← Zurück zum Katalog" },
    search: { placeholder: "Marke oder Modell suchen...", brand: "Marke", priceMin: "Mindestpreis (€)", priceMax: "Höchstpreis (€)", kmMax: "Max. KM", yearMin: "Jahr ab", yearMax: "Jahr bis", category: "Kategorie", all: "Alle", reset: "Zurücksetzen", results: "Fahrzeuge gefunden", filters: "Filter" },
    card: { iva: "inkl. MwSt.", details: "Details anzeigen" },
    detail: {
      photos: "Fotos", description: "Beschreibung", specs: "Technische Daten", contact: "Kontakt",
      whatsapp: "Auf WhatsApp schreiben", whatsappMsg: "Guten Tag! Ich interessiere mich für das Fahrzeug:",
      callBtn: "Jetzt anrufen", emailBtn: "E-Mail schreiben",
      specsLabels: { power: "Leistung", km: "Kilometerstand", year: "Baujahr", category: "Kategorie", fuel: "Kraftstoff", gearbox: "Getriebe", color: "Farbe", doors: "Türen", seats: "Sitzplätze" },
      noDesc: "Keine Beschreibung vorhanden.",
      price: "Preis", iva: "inkl. MwSt.",
      requestInfo: "Informationen anfragen",
      sold: "Verkauft", reserved: "Reserviert",
      share: "Link teilen", copied: "Link kopiert!",
      photoOf: "von",
    },
    about: {
      pageLabel: "Unsere Geschichte", pageTitle1: "Über", pageTitle2: "Uns",
      hero: "Ein Familienbetrieb mit Leidenschaft für Fahrzeuge",
      heroSub: "Seit 2009 in Vintl, Südtirol — Gebrauchtwagen sorgfältig ausgewählt und transparent angeboten.",
      story1: "HM Sportcars wurde 2009 in Vintl (BZ) von Martin Huber und Hartmann Leitner gegründet — zwei Autobegeisterte mit langjähriger Erfahrung in der Branche. Das Ziel war und ist es, ausgewählte Gebrauchtwagen zu fairen Preisen anzubieten, mit Ehrlichkeit und Respekt jedem Kunden gegenüber.",
      story2: "Jedes Fahrzeug, das wir anbieten, wird vor dem Verkauf gründlich geprüft. Wir legen Wert darauf, offen über Zustand und Geschichte jedes Autos zu informieren — denn ein gut informierter Kauf ist die Grundlage für ein dauerhaftes Vertrauensverhältnis.",
      story3: "Wir sind ein kleines, familiäres Team — unkompliziert und direkt. Wir nehmen uns Zeit für jede Frage und begleiten unsere Kunden aufmerksam vom ersten Kontakt bis zur Fahrzeugübergabe.",
      teamTitle: "Unser Team",
      team: [
        { name: "Hans Mair", role: "Gründer & Inhaber", desc: "Seit jeher begeisterter Autoliebhaber." },
        { name: "Lena Hofer", role: "Verkaufsleiterin", desc: "Mit 10 Jahren Erfahrung hilft Lena Ihnen, das perfekte Auto zu finden." },
        { name: "Marco Brunner", role: "Techniker & Sachverständiger", desc: "Zertifiziert jedes Fahrzeug mit Fachkenntnis." },
        { name: "Sara Zelger", role: "Verwaltung & Kundenservice", desc: "Sorgt für ein stressfreies Kauferlebnis." },
      ],
      valuesTitle: "Unsere Werte",
      values: [
        { icon: "🔍", title: "Sorgfältige Auswahl", desc: "Jedes Fahrzeug wird vor dem Verkauf genau geprüft. Wir bieten nur Fahrzeuge an, die wir selbst kaufen würden." },
        { icon: "📋", title: "Klare Informationen", desc: "Wir geben alle verfügbaren Informationen zu jedem Fahrzeug weiter: Fahrzeuggeschichte, Kilometerstand und Allgemeinzustand." },
        { icon: "🤝", title: "Persönlicher Kontakt", desc: "Wir sind für jede Frage offen. Ein gut informierter Kauf ist uns wichtiger als ein schneller Abschluss." },
        { icon: "⭐", title: "Kundenservice", desc: "Wir sind auch nach der Fahrzeugübergabe erreichbar — für alles, was nach dem Kauf noch gebraucht wird." },
      ],
      statsLabel: "In Zahlen",
    },
    where: {
      pageLabel: "Besuchen Sie uns", pageTitle1: "Unser", pageTitle2: "Standort",
      address: "Unser Showroom", addressVal: "Via Statale 13", addressCity: "Via Statale 13\n39030 Vintl (BZ)\nSüdtirol, Italien",
      hours: "Öffnungszeiten",
      hoursData: [{ day: "Montag – Freitag", time: "8:30 – 18:00" }, { day: "Samstag", time: "9:00 – 13:00" }, { day: "Sonntag", time: "Geschlossen" }],
      howToGet: "Anreise", byCar: "Mit dem Auto", byCarDesc: "Ausfahrt Bruneck/Pustertal auf der A22, dann Richtung Vintl folgen. Via Statale 13 ist innerhalb von 10 Minuten erreichbar.",
      byTrain: "Mit dem Zug", byTrainDesc: "Haltestelle Vintl auf der Linie Franzensfeste–Innichen, direkt in der Nähe des Showrooms.",
      parking: "Parkplatz", parkingDesc: "Kostenlose Kundenparkplätze stehen direkt vor dem Showroom zur Verfügung.",
      mapTitle: "Finden Sie uns auf Google Maps", cta: "In Google Maps öffnen",
    },
    contact: {
      pageLabel: "Wir sind für Sie da", pageTitle1: "Kontak", pageTitle2: "tieren Sie uns",
      sub: "Haben Sie Fragen zu einem Fahrzeug? Möchten Sie einen Besichtigungstermin vereinbaren oder eine Bewertung anfragen? Wir antworten Ihnen gerne.",
      phone: "Telefon", phoneVal: "+39 0474 123 456", phoneSub: "Mo–Fr: 8:30–18:00 · Sa: 9:00–13:00",
      email: "E-Mail", emailVal: "info@hm-sportcars.com", emailSub: "Antwort innerhalb 24 Stunden",
      whatsapp: "WhatsApp", whatsappVal: "+39 347 260 7790", whatsappSub: "Schreiben Sie uns auf WhatsApp",
      formTitle: "Nachricht senden",
      formName: "Vor- und Nachname", formEmail: "E-Mail", formPhone: "Telefon (optional)",
      formSubject: "Betreff", formMessage: "Nachricht",
      formSubjects: ["Informationen zu einem Fahrzeug", "Terminanfrage", "Fahrzeugbewertung", "Finanzierung", "Sonstiges"],
      formSend: "Nachricht senden", formSending: "Wird gesendet...", formSent: "Nachricht gesendet!",
      formPlaceholderName: "z.B. Max Mustermann", formPlaceholderEmail: "z.B. max@email.com",
      formPlaceholderPhone: "z.B. +39 333 000 0000", formPlaceholderMessage: "Schreiben Sie hier Ihre Anfrage...",
    },
    footer: "© 2025 HM Sportcars OHG — Vintl (BZ), Südtirol · Alle Rechte vorbehalten",
    impressum: {
      nav: "Impressum",
      title: "Impressum / Rechtliche Hinweise",
      s1title: "Auftraggeber und inhaltlich Verantwortlicher",
      s1: [
        "HM Sportcars OHG",
        "Via Statale 13",
        "I-39030 Vintl (BZ)",
        "Gesetzliche Vertreter: Martin Huber — Hartmann Leitner",
        "Tel: +39 0472 869296",
        "E-Mail: info@ghm-sportcars.com",
        "MwSt-Nr.: IT02788200216",
        "Empfängercode SDI: KRRH6B9",
      ],
      s2title: "Haftungsausschluss",
      s2: "Wir bemühen uns, auf dieser Website genaue und vollständige Informationen bereitzustellen. Dennoch übernehmen wir keine Haftung oder Gewähr für die Aktualität, Richtigkeit und Vollständigkeit der bereitgestellten Inhalte. Wir behalten uns vor, Inhalte jederzeit ohne Vorankündigung zu ändern.",
      s3title: "Verweise und Links",
      s3: "Trotz sorgfältiger Kontrolle übernehmen wir keine Verantwortung für die Inhalte externer Links. Für die Inhalte verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.",
      s4title: "Urheberrecht und Bilder",
      s4: "Die Inhalte und Bilder auf dieser Website sind Eigentum der HM Sportcars OHG, sofern nicht anders angegeben. Eine Vervielfältigung, auch teilweise, ohne schriftliche Genehmigung ist untersagt.",
      s5title: "Datenschutz und Cookies",
      s5: "Diese Website erhebt ohne ausdrückliche Einwilligung keine personenbezogenen Daten. Wir verwenden keine Profilierungs-Cookies. Für Anfragen zur Verarbeitung personenbezogener Daten gemäß EU-Verordnung 2016/679 (DSGVO) wenden Sie sich bitte an die oben angegebene E-Mail-Adresse.",
      s6title: "Rechtliche Gültigkeit",
      s6: "Sollten Teile dieses Dokuments nicht der geltenden Rechtslage entsprechen, bleiben die übrigen Teile gültig. Etwaige Streitigkeiten werden vor dem zuständigen Gericht in Bozen beigelegt.",
      s7title: "Online-Streitbeilegung",
      s7: "Gemäß Art. 14 der EU-Verordnung 524/2013 informieren wir, dass die Europäische Kommission eine Plattform zur Online-Streitbeilegung (OS) bereitstellt: https://ec.europa.eu/consumers/odr",
    },
    admin: {
      title: "Katalogverwaltung", login: "Admin-Bereich", pwd: "Passwort", enter: "Anmelden", cancel: "Abbrechen",
      wrongPwd: "Falsches Passwort. Bitte erneut versuchen.", add: "+ Fahrzeug hinzufügen", save: "Speichern", delete: "Fahrzeug löschen",
      newCar: "Neues Fahrzeug", editCar: "Fahrzeug bearbeiten", confirm: "Dieses Fahrzeug löschen?", confirm2: "Löschen?",
      mandatory: "Marke und Modell sind Pflichtangaben.", updated: "Fahrzeug aktualisiert ✓", added: "Fahrzeug hinzugefügt ✓", deleted: "Fahrzeug gelöscht",
      logout: "Abmelden", backSite: "← Zurück zur Website",
      uploadPhoto: "Fahrzeugfotos", dropHere: "Fotos hier ablegen", clickUpload: "oder zum Hochladen klicken",
      photoTip: "JPG, PNG, WEBP — mehrere Fotos gleichzeitig auswählen", removePhoto: "Entfernen", orUrl: "oder Haupt-URL eingeben",
      uploading: "Wird hochgeladen...", saving: "Wird gespeichert...",
      description: "Fahrzeugbeschreibung", descPlaceholder: "Beschreiben Sie das Fahrzeug: Geschichte, Zustand, Ausstattung...",
      fuel: "Kraftstoff", gearbox: "Getriebe", color: "Farbe", doors: "Türen", seats: "Sitze",
      fuelOpts: ["Benzin", "Diesel", "Hybrid", "Elektro", "LPG", "Erdgas"],
      gearboxOpts: ["Manuell", "Automatik", "Halbautomatik"],
      photos: "Fotogalerie", addMorePhotos: "Weitere Fotos hinzufügen", photoCount: "Fotos hochgeladen",
    },
    fields: {
      brand: "Marke", model: "Modell", year: "Jahr", price: "Preis (€)", power: "Leistung (PS)",
      km: "Kilometerstand", cat: "Kategorie", badge: "Badge",
      none: "Keiner", newBadge: "Neu eingetroffen", res: "Reserviert", sold: "Verkauft",
      sport: "Sport", luxury: "Luxury", suv: "SUV", classica: "Klassiker", selectBrand: "Marke auswählen...",
    },
  },
};

const HERO_VIDEO = "https://videos.pexels.com/video-files/5845159/5845159-hd_1920_1080_30fps.mp4";
const BADGE_COLORS = {
  new: { bg: "#C8102E", color: "#fff", border: "none" },
  res: { bg: "#1C1C1C", color: "#A0A0A0", border: "1px solid #2E2E2E" },
  sold: { bg: "#1C1C1C", color: "#606060", border: "1px solid #2E2E2E" },
};

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setMobile(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return mobile;
}

function Logo({ small, onClick }) {
  return (
    <svg onClick={onClick} className="logo-wrap" style={{ cursor: onClick ? "pointer" : "default" }} height={small ? 22 : 26} viewBox="0 0 220 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="14" height="32" rx="1" fill="#888" /><rect x="2" y="22" width="52" height="5" rx="1" fill="#666" /><rect x="42" y="8" width="14" height="32" rx="1" fill="#888" />
      <path d="M70 8 L90 8 L108 28 L126 8 L146 8 L146 40 L132 40 L132 22 L108 42 L84 22 L84 40 L70 40 Z" fill="#555" />
      <path d="M158 34 Q172 20 210 26" stroke="#C8102E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x="160" y="38" fontFamily="Georgia,serif" fontSize="14" fontStyle="italic" fill="#C8102E" letterSpacing=".5">Sportcars</text>
    </svg>
  );
}

function Toast({ msg, show }) {
  return <div style={{ position: "fixed", bottom: 20, right: 20, background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)", borderLeft: "3px solid #C8102E", color: "#F5F5F5", padding: "13px 20px", fontSize: 13, fontWeight: 500, zIndex: 999, borderRadius: 2, transition: "all .3s", transform: show ? "translateY(0)" : "translateY(80px)", opacity: show ? 1 : 0, pointerEvents: "none" }}>{msg}</div>;
}

const iStyle = { width: "100%", background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F5", padding: "10px 14px", fontFamily: "Inter,sans-serif", fontSize: 14, outline: "none", borderRadius: 2, boxSizing: "border-box" };

function FG({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#606060", marginBottom: 6 }}>{label}</label>{children}</div>;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, lang, setLang, t, selectedCar }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [["home", t.nav.home], ["catalog", t.nav.catalog], ["about", t.nav.about], ["where", t.nav.where], ["contact", t.nav.contact]];
  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };
  const currentPage = selectedCar ? "catalog" : page;

  return (
    <>
      <nav style={{ background: "rgba(13,13,13,0.97)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${isMobile ? 20 : 48}px`, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Logo small onClick={() => go("home")} />
        {isMobile ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2, background: "#1C1C1C", padding: 3, borderRadius: 4 }}>
              {["it", "de"].map(l => <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#C8102E" : "transparent", color: lang === l ? "#fff" : "#606060", border: "none", padding: "4px 8px", fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 2 }}>{l.toUpperCase()}</button>)}
            </div>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0A0", width: 36, height: 36, cursor: "pointer", borderRadius: 2, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {navItems.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="nav-link" style={{ background: "none", border: "none", color: currentPage === id ? "#fff" : "#A0A0A0", fontSize: 13, fontWeight: currentPage === id ? 600 : 500, letterSpacing: ".5px", cursor: "pointer", borderBottom: currentPage === id ? "2px solid #C8102E" : "2px solid transparent", paddingBottom: 2 }}>{label}</button>
            ))}
            <div style={{ display: "flex", gap: 2, background: "#1C1C1C", padding: 3, borderRadius: 4 }}>
              {["it", "de"].map(l => <button key={l} onClick={() => setLang(l)} className="lang-btn" style={{ background: lang === l ? "#C8102E" : "transparent", color: lang === l ? "#fff" : "#606060", border: "none", padding: "5px 10px", fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 2 }}>{l.toUpperCase()}</button>)}
            </div>
          </div>
        )}
      </nav>
      {isMobile && menuOpen && (
        <div className="mobile-menu" style={{ position: "fixed", top: 60, left: 0, right: 0, background: "#141414", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 49 }}>
          {navItems.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="mobile-menu-btn" style={{ display: "block", width: "100%", background: currentPage === id ? "rgba(200,16,46,0.08)" : "none", border: "none", borderLeft: currentPage === id ? "3px solid #C8102E" : "3px solid transparent", color: currentPage === id ? "#fff" : "#A0A0A0", fontSize: 15, fontWeight: currentPage === id ? 600 : 400, cursor: "pointer", padding: "14px 20px", textAlign: "left" }}>{label}</button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ t, setPage, goAdmin }) {
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", padding: isMobile ? "32px 20px" : "40px 48px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
        <div>
          <Logo />
          <p style={{ fontSize: 13, color: "#606060", lineHeight: 1.7, marginTop: 16, maxWidth: 260 }}>La tua concessionaria di fiducia in Alto Adige per auto usate di qualità.</p>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 16 }}>Pagine</div>
          {[["home", t.nav.home], ["catalog", t.nav.catalog], ["about", t.nav.about], ["where", t.nav.where], ["contact", t.nav.contact]].map(([id, label]) => (
            <button key={id} onClick={() => { setPage(id); window.scrollTo(0, 0); }} className="footer-link" style={{ display: "block", background: "none", border: "none", color: "#606060", fontSize: 13, cursor: "pointer", padding: "4px 0", textAlign: "left" }}
              onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#606060"}>{label}</button>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 16 }}>Contatti</div>
          <p style={{ fontSize: 13, color: "#606060", lineHeight: 1.9 }}>+39 0472 869296<br />+39 347 260 7790<br />info@ghm-sportcars.com<br />Via Statale 13, 39030 Vandoies (BZ)</p>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#2E2E2E" }}>{t.footer}</span>
          <button onClick={() => { setPage("impressum"); window.scrollTo(0,0); }}
            style={{ background: "none", border: "none", color: "#3a3a3a", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}
            onMouseEnter={e => e.target.style.color = "#A0A0A0"} onMouseLeave={e => e.target.style.color = "#3a3a3a"}>
            {t.impressum?.nav || "Note Legali"}
          </button>
        </div>
        <button onClick={goAdmin} style={{ background: "none", border: "none", color: "#2E2E2E", fontSize: 12, cursor: "pointer", padding: 0 }}
          onMouseEnter={e => e.target.style.color = "#555"} onMouseLeave={e => e.target.style.color = "#2E2E2E"}>·</button>
      </div>
    </footer>
  );
}

// ─── BRAND SELECTOR ───────────────────────────────────────────────────────────
function BrandSelector({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef();
  const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ ...iStyle, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: value ? "#F5F5F5" : "#888" }}>
        <span>{value || placeholder}</span><span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, zIndex: 100, maxHeight: 260, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <input autoFocus style={{ ...iStyle, padding: "8px 12px", fontSize: 13 }} placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowY: "auto", maxHeight: 200 }}>
            {value && <div onClick={() => { onChange(""); setOpen(false); setSearch(""); }} style={{ padding: "10px 14px", fontSize: 13, color: "#e44", cursor: "pointer" }}>✕ Rimuovi</div>}
            {filtered.map(brand => (
              <div key={brand} onClick={() => { onChange(brand); setOpen(false); setSearch(""); }}
                style={{ padding: "10px 14px", fontSize: 13, color: brand === value ? "#C8102E" : "#F5F5F5", cursor: "pointer", background: brand === value ? "rgba(200,16,46,0.08)" : "transparent", fontWeight: brand === value ? 600 : 400 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(200,16,46,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = brand === value ? "rgba(200,16,46,0.08)" : "transparent"}>
                {brand}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MULTI PHOTO UPLOADER ─────────────────────────────────────────────────────
function MultiPhotoUploader({ photos, onChange, t }) {
  const a = t.admin;
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) { setError("URL non valido"); return; }
    onChange([...photos, { url, path: "" }]);
    setUrlInput("");
    setError("");
  };

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setError(""); setUploading(true);
    const newPhotos = [...photos];
    let done = 0;
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 15 * 1024 * 1024) { setError("Max 15MB per foto"); continue; }
      const fileName = `cars/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/\s/g, "_")}`;
      const storageRef = ref(storage, fileName);
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on("state_changed",
          snap => setProgress(Math.round(((done + snap.bytesTransferred / snap.totalBytes) / files.length) * 100)),
          reject,
          async () => { const url = await getDownloadURL(task.snapshot.ref); newPhotos.push({ url, path: fileName }); done++; setProgress(Math.round(done / files.length * 100)); resolve(); }
        );
      });
    }
    onChange(newPhotos); setUploading(false); setProgress(0);
  };

  const removePhoto = async (idx) => {
    const p = [...photos];
    const removed = p.splice(idx, 1)[0];
    if (removed.path) { try { await deleteObject(ref(storage, removed.path)); } catch {} }
    onChange(p);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#606060", marginBottom: 8 }}>{a.photos} ({photos.length} {a.photoCount})</label>

      {/* Griglia foto */}
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 4, marginBottom: 12 }}>
          {photos.map((ph, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "16/10", borderRadius: 2, overflow: "hidden", background: "#1C1C1C" }}>
              <img src={ph.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && <div style={{ position: "absolute", top: 4, left: 4, background: "#C8102E", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2, letterSpacing: 1 }}>COVER</div>}
              <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", width: 22, height: 22, cursor: "pointer", borderRadius: "50%", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div style={{ background: "#1C1C1C", borderRadius: 2, padding: 16, marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 10 }}>⏳ {a.uploading} {progress}%</div>
          <div style={{ background: "#2E2E2E", borderRadius: 99, height: 4, overflow: "hidden" }}>
            <div style={{ background: "#C8102E", height: "100%", width: `${progress}%`, transition: "width .2s", borderRadius: 99 }} />
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div onClick={() => fileRef.current.click()}
        style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 2, padding: "20px", textAlign: "center", cursor: "pointer", background: "#1C1C1C", transition: "all .2s", marginBottom: 4 }}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#C8102E"; }}
        onDragLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; uploadFiles([...e.dataTransfer.files]); }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#A0A0A0", marginBottom: 2 }}>{photos.length > 0 ? a.addMorePhotos : a.dropHere}</div>
        <div style={{ fontSize: 11, color: "#3a3a3a" }}>{a.photoTip}</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => uploadFiles([...e.target.files])} />
      </div>
      {error && <div style={{ fontSize: 11, color: "#e44", marginTop: 4 }}>{error}</div>}

      {/* URL aggiuntivo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 6px" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: 11, color: "#3a3a3a", whiteSpace: "nowrap" }}>{a.orUrl}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...iStyle, fontSize: 13, flex: 1 }}
          placeholder="https://... (incolla URL foto da AutoScout o altro)"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addUrl(); }}
        />
        <button onClick={addUrl} style={{ background: "#C8102E", border: "none", color: "#fff", padding: "0 16px", fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2, whiteSpace: "nowrap" }}>
          + Aggiungi
        </button>
      </div>
    </div>
  );
}

// ─── CAR CARD ─────────────────────────────────────────────────────────────────
function CarCard({ car, t, onSelect }) {
  const [hover, setHover] = useState(false);
  const badgeLabels = { new: t.fields.newBadge, res: t.fields.res, sold: t.fields.sold };
  const bc = car.badge ? BADGE_COLORS[car.badge] : null;
  const mainImg = car.photos?.[0]?.url || car.img || "";
  const photoCount = car.photos?.length || (car.img ? 1 : 0);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onSelect(car)}
      className="car-card-wrap" style={{ background: hover ? "#1C1C1C" : "#141414", overflow: "hidden" }}>
      <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative", background: "#1C1C1C" }}>
        {mainImg
          ? <img src={mainImg} alt={`${car.brand} ${car.model}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", transform: hover ? "scale(1.04)" : "scale(1)" }} onError={e => e.target.style.display = "none"} />
          : <div style={{ width: "100%", height: "100%", background: "#242424", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 40 }}>◼</div>}
        {bc && <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 2, background: bc.bg, color: bc.color, border: bc.border }}>{badgeLabels[car.badge]}</div>}
        {photoCount > 1 && <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>📷 {photoCount}</div>}
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px", color: "#C8102E", textTransform: "uppercase", marginBottom: 3 }}>{car.brand}</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-.5px", lineHeight: 1.1, marginBottom: 3 }}>{car.model}</div>
        <div style={{ fontSize: 12, color: "#606060", marginBottom: 14 }}>{car.year}</div>
        <div style={{ display: "flex", gap: 16, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
          {[{ v: car.power, l: t.lang === "de" ? "PS" : "CV" }, { v: car.km, l: "KM" }, { v: t.fields[car.category] || car.category, l: t.lang === "de" ? "Typ" : "Tipo" }].map(({ v, l }) => (
            <div key={l}><div style={{ fontSize: 14, fontWeight: 600, color: "#F5F5F5" }}>{v}</div><div style={{ fontSize: 10, color: "#606060", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div></div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>€ {Number(car.price).toLocaleString("it-IT")}</div>
            <div style={{ fontSize: 11, color: "#606060", marginTop: 2 }}>{t.card.iva}</div>
          </div>
          <div style={{ background: hover ? "#C8102E" : "transparent", border: `1px solid ${hover ? "#C8102E" : "#2E2E2E"}`, color: hover ? "#fff" : "#606060", padding: "7px 14px", fontSize: 11, fontWeight: 600, borderRadius: 2, transition: "all .2s", letterSpacing: .5 }}>
            {t.card.details}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CAR DETAIL PAGE ──────────────────────────────────────────────────────────
function CarDetail({ car, t, onBack }) {
  const isMobile = useIsMobile();
  const d = t.detail;
  const sl = d.specsLabels;
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);

  const allPhotos = car.photos?.length ? car.photos.map(p => p.url) : (car.img ? [car.img] : []);

  const whatsappMsg = encodeURIComponent(`${d.whatsappMsg} ${car.brand} ${car.model} (${car.year}) - € ${Number(car.price).toLocaleString("it-IT")}. Potete darmi più informazioni?`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const specs = [
    { label: sl.power, value: car.power ? `${car.power} ${t.lang === "de" ? "PS" : "CV"}` : null },
    { label: sl.km, value: car.km ? `${car.km} km` : null },
    { label: sl.year, value: car.year },
    { label: sl.category, value: t.fields[car.category] || car.category },
    { label: sl.fuel, value: car.fuel },
    { label: sl.gearbox, value: car.gearbox },
    { label: sl.color, value: car.color },
    { label: sl.doors, value: car.doors },
    { label: sl.seats, value: car.seats },
  ].filter(s => s.value);

  const isSold = car.badge === "sold";
  const isRes = car.badge === "res";

  return (
    <>
      {/* LIGHTBOX */}
      {lightbox && allPhotos.length > 0 && (
        <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer" }}>✕</button>
          <button onClick={e => { e.stopPropagation(); setCurrentPhoto(p => (p - 1 + allPhotos.length) % allPhotos.length); }}
            style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 44, height: 44, fontSize: 20, cursor: "pointer", borderRadius: "50%" }}>‹</button>
          <img src={allPhotos[currentPhoto]} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setCurrentPhoto(p => (p + 1) % allPhotos.length); }}
            style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 44, height: 44, fontSize: 20, cursor: "pointer", borderRadius: "50%" }}>›</button>
          <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{currentPhoto + 1} {d.photoOf} {allPhotos.length}</div>
        </div>
      )}

      <div style={{ paddingTop: 60, background: "#0D0D0D", minHeight: "100vh" }}>
        {/* Back button */}
        <div style={{ padding: isMobile ? "20px 20px 0" : "28px 48px 0" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 13, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
            {t.catalog.backBtn}
          </button>
        </div>

        <div style={{ padding: isMobile ? "20px 20px 60px" : "28px 48px 80px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 32 : 48, alignItems: "start", maxWidth: 1200, margin: "0 auto" }}>

          {/* LEFT: GALLERY */}
          <div>
            {/* Main photo */}
            <div style={{ aspectRatio: "16/10", overflow: "hidden", background: "#141414", borderRadius: 2, marginBottom: 8, cursor: allPhotos.length ? "zoom-in" : "default", position: "relative" }} onClick={() => allPhotos.length && setLightbox(true)}>
              {allPhotos.length > 0
                ? <img src={allPhotos[currentPhoto]} alt={`${car.brand} ${car.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 48 }}>◼</div>}
              {allPhotos.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setCurrentPhoto(p => (p - 1 + allPhotos.length) % allPhotos.length); }}
                    className="lb-arrow" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 36, height: 36, fontSize: 18, cursor: "pointer", borderRadius: "50%" }}>‹</button>
                  <button onClick={e => { e.stopPropagation(); setCurrentPhoto(p => (p + 1) % allPhotos.length); }}
                    className="lb-arrow" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 36, height: 36, fontSize: 18, cursor: "pointer", borderRadius: "50%" }}>›</button>
                  <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 99 }}>{currentPhoto + 1} {d.photoOf} {allPhotos.length}</div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allPhotos.length > 1 && (
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {allPhotos.map((url, i) => (
                  <div key={i} onClick={() => setCurrentPhoto(i)}
                    style={{ flexShrink: 0, width: 72, height: 48, borderRadius: 2, overflow: "hidden", cursor: "pointer", border: `2px solid ${i === currentPhoto ? "#C8102E" : "transparent"}`, transition: "border-color .2s" }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {!isMobile && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 12 }}>{d.description}</div>
                <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.9 }}>{car.description || d.noDesc}</p>
              </div>
            )}
          </div>

          {/* RIGHT: INFO */}
          <div style={{ position: isMobile ? "static" : "sticky", top: 80 }}>
            {/* Badge */}
            {car.badge && <div style={{ display: "inline-block", padding: "4px 12px", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 2, background: BADGE_COLORS[car.badge]?.bg, color: BADGE_COLORS[car.badge]?.color, border: BADGE_COLORS[car.badge]?.border, marginBottom: 12 }}>
              {car.badge === "new" ? t.fields.newBadge : car.badge === "res" ? d.reserved : d.sold}
            </div>}

            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 6 }}>{car.brand}</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 28 : 32, fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>{car.model}</h1>
            <div style={{ fontSize: 14, color: "#606060", marginBottom: 20 }}>{car.year}</div>

            {/* Price */}
            <div className="price-box" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#606060", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>{d.price}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, color: isSold ? "#606060" : "#fff", lineHeight: 1 }}>
                {isSold ? d.sold : `€ ${Number(car.price).toLocaleString("it-IT")}`}
              </div>
              {!isSold && <div style={{ fontSize: 12, color: "#606060", marginTop: 4 }}>{d.iva}</div>}
            </div>

            {/* Specs */}
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "16px 24px", marginBottom: 20 }}>
              {specs.map(({ label, value }, i) => (
                <div key={label} className="spec-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < specs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize: 13, color: "#606060" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F5F5F5" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            {!isSold && !isRes && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-wa"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", padding: "14px", fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 700, borderRadius: 2, letterSpacing: .3 }}>
                  <span style={{ fontSize: 18 }}>💬</span> {d.whatsapp}
                </a>
                <a href="tel:+390474123456"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#C8102E", color: "#fff", textDecoration: "none", padding: "13px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
                  📞 {d.callBtn}
                </a>
                <a href="mailto:info@hm-sportcars.com"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: "1px solid #2E2E2E", color: "#A0A0A0", textDecoration: "none", padding: "13px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 500, borderRadius: 2 }}>
                  ✉️ {d.emailBtn}
                </a>
              </div>
            )}
            {(isSold || isRes) && (
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#606060" }}>{isRes ? "Questa vettura è riservata. Contattaci per disponibilità." : "Questa vettura è stata venduta. Contattaci per vetture simili."}</div>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 14, background: "#25D366", color: "#fff", textDecoration: "none", padding: "11px 24px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, borderRadius: 2 }}>
                  💬 {d.whatsapp}
                </a>
              </div>
            )}

            {/* Share */}
            <button onClick={copyLink} className="share-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#606060", fontSize: 12, cursor: "pointer", marginTop: 16, padding: 0 }}>
              🔗 {copied ? d.copied : d.share}
            </button>
          </div>

          {/* Description mobile */}
          {isMobile && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 12 }}>{d.description}</div>
              <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.9 }}>{car.description || d.noDesc}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ cars, filters, setFilters, t }) {
  const s = t.search; const f = t.fields;
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const categories = [...new Set(cars.map(c => c.category))];
  const catLabel = k => ({ sport: f.sport, luxury: f.luxury, suv: "SUV", classica: f.classica }[k] || k);
  const hasFilters = Object.values(filters).some(v => v !== "");
  const reset = () => setFilters({ q: "", brand: "", category: "", priceMin: "", priceMax: "", kmMax: "", yearMin: "", yearMax: "" });

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#606060", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input style={{ ...iStyle, paddingLeft: 38, fontSize: 14 }} placeholder={s.placeholder} value={filters.q} onChange={e => setFilters(p => ({ ...p, q: e.target.value }))} />
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: open ? "#C8102E" : "transparent", border: `1px solid ${open ? "#C8102E" : "#2E2E2E"}`, color: open ? "#fff" : "#A0A0A0", padding: "0 16px", fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2, display: "flex", alignItems: "center", gap: 6, height: 42 }}>
          ⚙ {s.filters} {hasFilters && !open && <span style={{ background: "#C8102E", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>}
        </button>
        {hasFilters && <button onClick={reset} style={{ background: "transparent", border: "1px solid rgba(200,16,46,0.3)", color: "#C8102E", padding: "0 14px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2, height: 42 }}>{s.reset}</button>}
      </div>
      {open && (
        <div className="filter-panel" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2, padding: 20, display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
          <div style={{ gridColumn: isMobile ? "1/-1" : "auto" }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#606060", marginBottom: 6 }}>{s.brand}</label>
            <BrandSelector value={filters.brand} onChange={v => setFilters(p => ({ ...p, brand: v }))} placeholder={s.all} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#606060", marginBottom: 6 }}>{s.category}</label>
            <select style={iStyle} value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
              <option value="">{s.all}</option>
              {categories.map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </div>
          {[{ label: s.priceMin, key: "priceMin", ph: "0" }, { label: s.priceMax, key: "priceMax", ph: "100.000" }, { label: s.kmMax, key: "kmMax", ph: "200.000" }, { label: s.yearMin, key: "yearMin", ph: "2015" }, { label: s.yearMax, key: "yearMax", ph: "2025" }].map(({ label, key, ph }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#606060", marginBottom: 6 }}>{label}</label>
              <input style={iStyle} type="number" placeholder={ph} value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CAR FORM (admin) ─────────────────────────────────────────────────────────
function CarForm({ car, onSave, onDelete, onClose, t, saving }) {
  const f = t.fields; const a = t.admin;
  const [form, setForm] = useState({
    brand: car?.brand || "", model: car?.model || "", year: car?.year || new Date().getFullYear(),
    price: car?.price || "", power: car?.power || "", km: car?.km || "",
    category: car?.category || "sport", badge: car?.badge || "",
    description: car?.description || "",
    fuel: car?.fuel || "", gearbox: car?.gearbox || "", color: car?.color || "",
    doors: car?.doors || "", seats: car?.seats || "",
    photos: car?.photos || (car?.img ? [{ url: car.img, path: car.storagePath || "" }] : []),
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: 4 }}>
      <MultiPhotoUploader photos={form.photos} onChange={v => set("photos", v)} t={t} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FG label={f.brand}><BrandSelector value={form.brand} onChange={v => set("brand", v)} placeholder={f.selectBrand} /></FG>
        <FG label={f.model}><input style={iStyle} value={form.model} onChange={e => set("model", e.target.value)} placeholder="es. Golf GTI" /></FG>
        <FG label={f.year}><input style={iStyle} type="number" value={form.year} onChange={e => set("year", e.target.value)} /></FG>
        <FG label={f.price}><input style={iStyle} type="text" inputMode="numeric" value={form.price} placeholder="es. 16300" onChange={e => set("price", e.target.value.replace(/[.,]/g, "").replace(/[^0-9]/g, ""))} /></FG>
        <FG label={f.power}><input style={iStyle} value={form.power} onChange={e => set("power", e.target.value)} placeholder="es. 150" /></FG>
        <FG label={f.km}><input style={iStyle} value={form.km} onChange={e => set("km", e.target.value)} placeholder="es. 45.000" /></FG>
        <FG label={f.cat}>
          <select style={iStyle} value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="sport">{f.sport}</option><option value="luxury">{f.luxury}</option><option value="suv">{f.suv}</option><option value="classica">{f.classica}</option>
          </select>
        </FG>
        <FG label={f.badge}>
          <select style={iStyle} value={form.badge} onChange={e => set("badge", e.target.value)}>
            <option value="">{f.none}</option><option value="new">{f.newBadge}</option><option value="res">{f.res}</option><option value="sold">{f.sold}</option>
          </select>
        </FG>
        <FG label={a.fuel}>
          <select style={iStyle} value={form.fuel} onChange={e => set("fuel", e.target.value)}>
            <option value="">—</option>
            {a.fuelOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </FG>
        <FG label={a.gearbox}>
          <select style={iStyle} value={form.gearbox} onChange={e => set("gearbox", e.target.value)}>
            <option value="">—</option>
            {a.gearboxOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </FG>
        <FG label={a.color}><input style={iStyle} value={form.color} onChange={e => set("color", e.target.value)} placeholder="es. Nero Metallizzato" /></FG>
        <FG label={a.doors}><input style={iStyle} value={form.doors} onChange={e => set("doors", e.target.value)} placeholder="es. 5" /></FG>
        <FG label={a.seats}><input style={iStyle} value={form.seats} onChange={e => set("seats", e.target.value)} placeholder="es. 5" /></FG>
      </div>

      <FG label={a.description}>
        <textarea style={{ ...iStyle, minHeight: 100, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder={a.descPlaceholder} />
      </FG>

      <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, flexWrap: "wrap" }}>
        <button disabled={saving} onClick={() => { if (!form.brand || !form.model) return alert(a.mandatory); onSave(form); }}
          style={{ background: "#C8102E", color: "#fff", border: "none", padding: "11px 26px", fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 600, cursor: saving ? "wait" : "pointer", borderRadius: 2, opacity: saving ? .7 : 1 }}>
          {saving ? a.saving : a.save}
        </button>
        <button onClick={onClose} style={{ background: "transparent", color: "#606060", border: "1px solid rgba(255,255,255,0.1)", padding: "11px 20px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>{a.cancel}</button>
        {car && <button onClick={onDelete} style={{ background: "transparent", color: "#e44", border: "1px solid rgba(220,60,60,0.25)", padding: "11px 20px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2, marginLeft: "auto" }}>{a.delete}</button>}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ cars, onLogout, onBack, showToast, t }) {
  const a = t.admin; const isMobile = useIsMobile();
  const [view, setView] = useState("list");
  const [editCar, setEditCar] = useState(null);
  const [saving, setSaving] = useState(false);

  const saveCar = async (form) => {
    setSaving(true);
    try {
      const data = {
        brand: form.brand, model: form.model, year: +form.year, price: +String(form.price).replace(/\./g, '').replace(/,/g, ''),
        power: form.power, km: form.km, category: form.category, badge: form.badge,
        description: form.description || "",
        fuel: form.fuel || "", gearbox: form.gearbox || "", color: form.color || "",
        doors: form.doors || "", seats: form.seats || "",
        photos: form.photos || [],
        img: form.photos?.[0]?.url || "",
        storagePath: form.photos?.[0]?.path || "",
        updatedAt: new Date()
      };
      if (editCar) { await updateDoc(doc(db, "cars", editCar.id), data); showToast(a.updated); }
      else { await addDoc(collection(db, "cars"), { ...data, createdAt: new Date() }); showToast(a.added); }
      setView("list"); setEditCar(null);
    } catch (e) { showToast("Errore: " + e.message); }
    setSaving(false);
  };

  const deleteCar = async (car) => {
    if (!window.confirm(a.confirm)) return;
    try {
      await deleteDoc(doc(db, "cars", car.id));
      for (const p of (car.photos || [])) { if (p.path) try { await deleteObject(ref(storage, p.path)); } catch {} }
      showToast(a.deleted); setView("list"); setEditCar(null);
    } catch (e) { showToast("Errore: " + e.message); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "Inter,sans-serif" }}>
      <div style={{ background: "#141414", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: `0 ${isMobile ? 16 : 40}px`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Logo small />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#C8102E", letterSpacing: 1, textTransform: "uppercase" }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isMobile && <button onClick={onBack} style={{ background: "transparent", color: "#A0A0A0", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>{a.backSite}</button>}
          <button onClick={onLogout} style={{ background: "transparent", color: "#e44", border: "1px solid rgba(220,60,60,0.25)", padding: "6px 14px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>{a.logout}</button>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: `32px ${isMobile ? 16 : 24}px` }}>
        {view === "list" && (
          <>
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 24, flexDirection: isMobile ? "column" : "row", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#fff", margin: 0 }}>{a.title}</h1>
                <p style={{ fontSize: 13, color: "#606060", marginTop: 4 }}>{cars.length} vetture nel catalogo</p>
              </div>
              <button onClick={() => { setEditCar(null); setView("add"); }} style={{ background: "#C8102E", color: "#fff", border: "none", padding: "10px 20px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>{a.add}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
              {cars.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#606060", background: "#141414" }}>Nessuna vettura. Aggiungine una!</div>}
              {cars.map(car => {
                const mainImg = car.photos?.[0]?.url || car.img || "";
                const photoCount = car.photos?.length || (car.img ? 1 : 0);
                return (
                  <div key={car.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#141414" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1C1C1C"} onMouseLeave={e => e.currentTarget.style.background = "#141414"}>
                    {mainImg ? <img src={mainImg} alt="" style={{ width: isMobile ? 60 : 80, height: isMobile ? 40 : 52, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={e => e.target.style.opacity = ".2"} />
                      : <div style={{ width: isMobile ? 60 : 80, height: isMobile ? 40 : 52, background: "#242424", flexShrink: 0, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontSize: 16 }}>📷</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: "#F5F5F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{car.brand} {car.model}</div>
                      <div style={{ fontSize: 11, color: "#606060", marginTop: 2 }}>{car.year} · € {Number(car.price).toLocaleString("it-IT")} · {photoCount} foto</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setEditCar(car); setView("edit"); }}
                        style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0A0", width: 30, height: 30, cursor: "pointer", fontSize: 12, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#C8102E"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#A0A0A0"; }}>✎</button>
                      <button onClick={() => deleteCar(car)}
                        style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0A0", width: 30, height: 30, cursor: "pointer", fontSize: 12, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#e44"; e.currentTarget.style.color = "#e44"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#A0A0A0"; }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {(view === "add" || view === "edit") && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <button onClick={() => { setView("list"); setEditCar(null); }} style={{ background: "none", border: "none", color: "#A0A0A0", cursor: "pointer", fontSize: 13, padding: 0 }}>← {a.cancel}</button>
              <span style={{ color: "#2E2E2E" }}>/</span>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#fff", margin: 0 }}>{view === "edit" ? a.editCar : a.newCar}</h1>
            </div>
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: isMobile ? 20 : 32 }}>
              <CarForm car={editCar} onSave={saveCar} onDelete={() => deleteCar(editCar)} onClose={() => { setView("list"); setEditCar(null); }} t={t} saving={saving} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function PageHome({ t, cars, setPage, setSelectedCar }) {
  const isMobile = useIsMobile();
  const [videoError, setVideoError] = useState(false);
  const r = { color: "#C8102E" };
  return (
    <>
      <div style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        {!videoError ? <video autoPlay muted loop playsInline onError={() => setVideoError(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}><source src={HERO_VIDEO} type="video/mp4" /></video>
          : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0D0D0D 0%,#1a0500 50%,#0D0D0D 100%)", zIndex: 0 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.6) 60%,rgba(0,0,0,0.25) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 140, background: "linear-gradient(to top,#0D0D0D,transparent)", zIndex: 2 }} />
        <div style={{ position: "relative", zIndex: 3, padding: isMobile ? "0 20px" : "0 48px", maxWidth: 680, marginTop: 60 }}>
          <div className="hero-anim-1" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 1, background: "#C8102E" }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase" }}>{t.hero.eyebrow}</span>
          </div>
          <h1 className="hero-anim-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? "clamp(36px,10vw,52px)" : "clamp(44px,6vw,76px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: -2, color: "#fff", marginBottom: 20 }}>
            {t.hero.title1}<br /><span style={r}>{t.hero.title2}</span>
          </h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: "rgba(245,245,245,0.65)", lineHeight: 1.7, maxWidth: 460, marginBottom: 28 }}>{t.hero.sub}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => { setPage("catalog"); window.scrollTo(0, 0); }} className="btn-red-anim" style={{ background: "#C8102E", color: "#fff", border: "none", padding: isMobile ? "12px 24px" : "15px 36px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>{t.hero.cta1}</button>
            <button onClick={() => { setPage("contact"); window.scrollTo(0, 0); }} className="btn-ghost-anim" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: isMobile ? "12px 24px" : "15px 36px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 2 }}>{t.hero.cta2}</button>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[{ n: `${cars.length}+`, l: t.hero.stat1 }, { n: "15+", l: t.hero.stat2 }, { n: "500+", l: t.hero.stat3 }].map(({ n, l }) => (
                <div key={l}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{n}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>{l}</div></div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ background: "#C8102E", padding: "10px 0", overflow: "hidden" }}>
        <div className="ticker-inner" style={{ display: "flex", gap: 60, whiteSpace: "nowrap", animation: "tick 24s linear infinite" }}>
          {[...t.ticker, ...t.ticker].map((item, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 12 }}>
              {item}<span style={{ width: 3, height: 3, background: "rgba(255,255,255,0.4)", borderRadius: "50%", display: "inline-block" }} />
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: isMobile ? "60px 20px" : "80px 48px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{t.catalog.label}</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "#fff", letterSpacing: -1 }}>{t.catalog.title} <span style={r}>{t.catalog.titleRed}</span></h2>
          </div>
          <button onClick={() => { setPage("catalog"); window.scrollTo(0, 0); }} style={{ background: "transparent", border: "1px solid #2E2E2E", color: "#A0A0A0", padding: "10px 20px", fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer", borderRadius: 2 }}>Vedi tutto →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 1, background: "#2E2E2E" }}>
          {cars.slice(0, isMobile ? 3 : 6).map(car => <CarCard key={car.id} car={car} t={t} onSelect={c => { setSelectedCar(c); window.scrollTo(0, 0); }} />)}
        </div>
      </div>
      <div style={{ background: "#141414", padding: isMobile ? "60px 20px" : "80px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{t.about.pageLabel}</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "#fff", letterSpacing: -1, marginBottom: 16 }}>{t.about.hero}</h2>
          <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.8, marginBottom: 28 }}>{t.about.heroSub}</p>
          <button onClick={() => { setPage("about"); window.scrollTo(0, 0); }} style={{ background: "#C8102E", color: "#fff", border: "none", padding: "13px 28px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>{t.nav.about} →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[{ l: "2009", tx: "Anno di fondazione" }, { l: "500+", tx: "Auto vendute" }, { l: "15+", tx: "Anni esperienza" }, { l: "4", tx: "Persone nel team" }].map(({ l, tx }) => (
            <div key={tx} style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.06)", padding: 20, borderRadius: 2 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 11, color: "#606060" }}>{tx}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEZIONE CONTATTI IN HOMEPAGE */}
      <div style={{ padding: isMobile ? "60px 20px" : "80px 48px", background: "#0D0D0D" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{t.contact.pageLabel}</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "#fff", letterSpacing: -1 }}>
              {t.contact.pageTitle1}<span style={{ color: "#C8102E" }}>{t.contact.pageTitle2}</span>
            </h2>
          </div>
          <button onClick={() => { setPage("contact"); window.scrollTo(0, 0); }}
            style={{ background: "transparent", border: "1px solid #2E2E2E", color: "#A0A0A0", padding: "10px 20px", fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer", borderRadius: 2 }}>
            {t.nav.contact} →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
          {[
            { icon: "📞", title: t.contact.phone, val: t.contact.phoneVal, sub: t.contact.phoneSub, href: "tel:+390472869296" },
            { icon: "✉️", title: t.contact.email, val: t.contact.emailVal, sub: t.contact.emailSub, href: "mailto:info@ghm-sportcars.com" },
            { icon: "📍", title: t.contact.show, val: "Via Statale 13", sub: "39030 Vandoies (BZ)\nAlto Adige", href: "https://maps.google.com/?q=Via+Statale+13,+39030+Vandoies+BZ" },
          ].map(({ icon, title, val, sub, href }) => (
            <a key={title} href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer"
              className="contact-card"
              style={{ background: "#141414", padding: isMobile ? "28px 20px" : "36px 32px", textDecoration: "none", display: "block" }}>
              <div style={{ width: 44, height: 44, background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, borderRadius: 2, fontSize: 20 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#C8102E", fontWeight: 600, marginBottom: 6 }}>{val}</p>
              <p style={{ fontSize: 12, color: "#606060", lineHeight: 1.7, whiteSpace: "pre-line" }}>{sub}</p>
            </a>
          ))}
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: isMobile ? "24px 20px" : "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              {t.lang === "de" ? "Schreiben Sie uns auf WhatsApp" : "Scrivici su WhatsApp"}
            </div>
            <p style={{ fontSize: 13, color: "#606060", margin: 0 }}>
              {t.lang === "de" ? "Schnelle Antworten, direkt auf Ihrem Telefon." : "Risposte rapide, direttamente sul tuo telefono."}
            </p>
          </div>
          <a href={"https://wa.me/393472607790?text=" + encodeURIComponent(t.lang === "de" ? "Guten Tag! Ich interessiere mich für ein Fahrzeug." : "Ciao! Sono interessato a una vettura.")}
            target="_blank" rel="noreferrer" className="btn-wa"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", textDecoration: "none", padding: "13px 28px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 700, borderRadius: 2 }}>
            <span style={{ fontSize: 18 }}>💬</span> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

function PageCatalog({ t, cars, loading, setSelectedCar }) {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState({ q: "", brand: "", category: "", priceMin: "", priceMax: "", kmMax: "", yearMin: "", yearMax: "" });
  const filteredCars = cars.filter(car => {
    const q = filters.q.toLowerCase();
    if (q && !car.brand?.toLowerCase().includes(q) && !car.model?.toLowerCase().includes(q)) return false;
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.category && car.category !== filters.category) return false;
    if (filters.priceMin && car.price < +filters.priceMin) return false;
    if (filters.priceMax && car.price > +filters.priceMax) return false;
    if (filters.kmMax) { const km = parseInt((car.km || "0").replace(/\D/g, "")); if (km > +filters.kmMax) return false; }
    if (filters.yearMin && car.year < +filters.yearMin) return false;
    if (filters.yearMax && car.year > +filters.yearMax) return false;
    return true;
  });
  return (
    <div style={{ padding: isMobile ? "80px 20px 60px" : "100px 48px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{t.catalog.label}</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 28 : 40, fontWeight: 700, color: "#fff", letterSpacing: -1 }}>
          {t.catalog.title} <span style={{ color: "#C8102E" }}>{t.catalog.titleRed}</span>
        </h1>
      </div>
      <SearchBar cars={cars} filters={filters} setFilters={setFilters} t={t} />
      <div style={{ fontSize: 12, color: "#606060", marginBottom: 14 }}>{filteredCars.length} {t.search.results}</div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "#606060" }}>⏳ {t.catalog.loading}</div>
        : <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 1, background: "#2E2E2E" }}>
          {filteredCars.length === 0
            ? <div style={{ gridColumn: "1/-1", padding: 60, textAlign: "center", color: "#606060" }}>{t.catalog.empty}</div>
            : filteredCars.map(car => <CarCard key={car.id} car={car} t={t} onSelect={c => { setSelectedCar(c); window.scrollTo(0, 0); }} />)}
        </div>}
    </div>
  );
}

function PageAbout({ t }) {
  const isMobile = useIsMobile();
  const a = t.about; const r = { color: "#C8102E" };
  const pad = isMobile ? "60px 20px" : "80px 48px";
  return (
    <>
      <div style={{ background: "#141414", padding: isMobile ? "100px 20px 60px" : "120px 48px 80px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 16 }}>{a.pageLabel}</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 36 : 60, fontWeight: 700, color: "#fff", letterSpacing: -2, lineHeight: 1.0, marginBottom: 20 }}>{a.hero}</h1>
          <p style={{ fontSize: isMobile ? 15 : 18, color: "#A0A0A0", lineHeight: 1.7 }}>{a.heroSub}</p>
        </div>
      </div>
      <div style={{ padding: pad, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 64 }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: "#fff", letterSpacing: -1, marginBottom: 24 }}>La nostra <span style={r}>storia</span></h2>
          <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.9, marginBottom: 20 }}>{a.story1}</p>
          <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.9, marginBottom: 20 }}>{a.story2}</p>
          <p style={{ fontSize: 15, color: "#A0A0A0", lineHeight: 1.9 }}>{a.story3}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, alignContent: "start" }}>
          {[{ l: "2009", tx: "Anno di fondazione" }, { l: "500+", tx: "Auto vendute" }, { l: "15+", tx: "Anni esperienza" }, { l: "30%", tx: "Auto accettate su 10 valutate" }].map(({ l, tx }) => (
            <div key={tx} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", padding: 24, borderRadius: 2 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 12, color: "#606060", lineHeight: 1.4 }}>{tx}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#141414", padding: pad }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{a.valuesTitle}</div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "#fff", letterSpacing: -1, marginBottom: 40 }}>Cosa ci <span style={r}>distingue</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          {a.values.map(v => (
            <div key={v.title} className="value-card" style={{ background: "#141414", padding: isMobile ? "28px 20px" : "36px 32px" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{v.icon}</div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: "#606060", lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: pad }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>{a.teamTitle}</div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "#fff", letterSpacing: -1, marginBottom: 40 }}>Le persone <span style={r}>dietro HM</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          {a.team.map(member => (
            <div key={member.name} className="team-card" style={{ background: "#141414", padding: isMobile ? "24px 16px" : "32px 28px" }}>
              <div style={{ width: 56, height: 56, background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{member.name}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#C8102E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{member.role}</div>
              {!isMobile && <p style={{ fontSize: 13, color: "#606060", lineHeight: 1.6 }}>{member.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PageWhere({ t }) {
  const isMobile = useIsMobile();
  const w = t.where; const r = { color: "#C8102E" };
  const pad = isMobile ? "60px 20px" : "80px 48px";
  return (
    <>
      <div style={{ background: "#141414", padding: isMobile ? "100px 20px 60px" : "120px 48px 80px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 16 }}>{w.pageLabel}</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 36 : 60, fontWeight: 700, color: "#fff", letterSpacing: -2, lineHeight: 1.0 }}>{w.pageTitle1} <span style={r}>{w.pageTitle2}</span></h1>
      </div>
      <div style={{ height: isMobile ? 280 : 480, background: "#1C1C1C", overflow: "hidden" }}>
        <iframe title="HM Sportcars" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2757.1!2d11.8654!3d46.8312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4780276f3b5b5b5b%3A0x1234567890abcdef!2sVia+Statale+13%2C+39030+Vandoies+BZ!5e0!3m2!1sit!2sit!4v1"
          width="100%" height="100%" style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)", opacity: 0.9 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <div style={{ padding: pad, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.03)" }}>
        <div style={{ background: "#141414", padding: isMobile ? "28px 20px" : "40px 32px" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>📍</div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{w.address}</h3>
          <p style={{ fontSize: 15, color: "#C8102E", fontWeight: 600, marginBottom: 6 }}>{w.addressVal}</p>
          <p style={{ fontSize: 14, color: "#606060", lineHeight: 1.8, marginBottom: 20 }}>{w.addressCity}</p>
          <a href="https://maps.google.com/?q=Via+Statale+13,+39030+Vandoies+BZ,+Italia" target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#C8102E", color: "#fff", textDecoration: "none", padding: "10px 20px", fontSize: 12, fontWeight: 600, borderRadius: 2 }}>{w.cta} ↗</a>
        </div>
        <div style={{ background: "#141414", padding: isMobile ? "28px 20px" : "40px 32px" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🕐</div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{w.hours}</h3>
          {w.hoursData.map(({ day, time }) => (
            <div key={day} className="hours-row" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 13, color: "#A0A0A0" }}>{day}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: time === "Chiuso" || time === "Geschlossen" ? "#606060" : "#fff" }}>{time}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#141414", padding: isMobile ? "28px 20px" : "40px 32px" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🚗</div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{w.howToGet}</h3>
          {[{ icon: "🚗", title: w.byCar, desc: w.byCarDesc }, { icon: "🚆", title: w.byTrain, desc: w.byTrainDesc }, { icon: "🅿️", title: w.parking, desc: w.parkingDesc }].map(({ icon, title, desc }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{icon} {title}</div>
              <div style={{ fontSize: 12, color: "#606060", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PageContact({ t }) {
  const isMobile = useIsMobile();
  const c = t.contact; const r = { color: "#C8102E" };
  const pad = isMobile ? "60px 20px" : "80px 48px";
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) return alert("Compila i campi obbligatori");
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true); setSending(false);
  };
  return (
    <>
      <div style={{ background: "#141414", padding: isMobile ? "100px 20px 60px" : "120px 48px 80px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 16 }}>{c.pageLabel}</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 36 : 60, fontWeight: 700, color: "#fff", letterSpacing: -2, lineHeight: 1.0, marginBottom: 16 }}>{c.pageTitle1}<span style={r}>{c.pageTitle2}</span></h1>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "#A0A0A0", lineHeight: 1.7, maxWidth: 560 }}>{c.sub}</p>
      </div>
      <div style={{ padding: pad }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.04)", marginBottom: 48 }}>
          {[{ icon: "📞", title: c.phone, val: c.phoneVal, sub: c.phoneSub }, { icon: "✉️", title: c.email, val: c.emailVal, sub: c.emailSub }, { icon: "💬", title: c.whatsapp, val: c.whatsappVal, sub: c.whatsappSub }].map(({ icon, title, val, sub }) => (
            <div key={title} className="contact-card" style={{ background: "#141414", padding: isMobile ? "24px 20px" : "36px 28px" }}>
              <div style={{ width: 40, height: 40, background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, borderRadius: 2, fontSize: 18 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#C8102E", fontWeight: 600, marginBottom: 4 }}>{val}</p>
              <p style={{ fontSize: 12, color: "#606060" }}>{sub}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: isMobile ? "28px 20px" : "48px 40px", maxWidth: 720 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#fff", marginBottom: 28, letterSpacing: -1 }}>{c.formTitle}</h2>
          {sent ? (
            <div style={{ background: "rgba(200,16,46,0.08)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: 2, padding: "24px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{c.formSent}</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FG label={c.formName + " *"}><input style={iStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder={c.formPlaceholderName} /></FG>
                <FG label={c.formEmail + " *"}><input style={iStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder={c.formPlaceholderEmail} /></FG>
                <FG label={c.formPhone}><input style={iStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder={c.formPlaceholderPhone} /></FG>
                <FG label={c.formSubject}><select style={iStyle} value={form.subject} onChange={e => set("subject", e.target.value)}><option value="">—</option>{c.formSubjects.map(s => <option key={s} value={s}>{s}</option>)}</select></FG>
              </div>
              <FG label={c.formMessage + " *"}><textarea style={{ ...iStyle, minHeight: 130, resize: "vertical" }} value={form.message} onChange={e => set("message", e.target.value)} placeholder={c.formPlaceholderMessage} /></FG>
              <button disabled={sending} onClick={handleSend} style={{ background: "#C8102E", color: "#fff", border: "none", padding: "13px 32px", fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, cursor: sending ? "wait" : "pointer", borderRadius: 2, opacity: sending ? .7 : 1 }}>
                {sending ? c.formSending : c.formSend}
              </button>
              <p style={{ fontSize: 11, color: "#606060", marginTop: 12 }}>* Campi obbligatori</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}


// ─── PAGE: IMPRESSUM ──────────────────────────────────────────────────────────
function PageImpressum({ t }) {
  const isMobile = useIsMobile();
  const imp = t.impressum;
  const pad = isMobile ? "80px 20px 60px" : "100px 48px 80px";
  const r = { color: "#C8102E" };

  return (
    <div style={{ padding: pad, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase", marginBottom: 12 }}>Legal</div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 28 : 40, fontWeight: 700, color: "#fff", letterSpacing: -1, marginBottom: 40 }}>{imp.title}</h1>

      {[
        { title: imp.s1title, content: null, list: imp.s1 },
        { title: imp.s2title, content: imp.s2 },
        { title: imp.s3title, content: imp.s3 },
        { title: imp.s4title, content: imp.s4 },
        { title: imp.s5title, content: imp.s5 },
        { title: imp.s6title, content: imp.s6 },
        { title: imp.s7title, content: imp.s7 },
      ].map(({ title, content, list }) => (
        <div key={title} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{title}</h2>
          {list ? (
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "20px 24px" }}>
              {list.map((item, i) => (
                <div key={i} style={{ fontSize: 14, color: item.startsWith("HM") ? "#fff" : "#A0A0A0", lineHeight: 1.8, fontWeight: item.startsWith("HM") ? 600 : 400 }}>{item}</div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.9, margin: 0 }}>{content}</p>
          )}
        </div>
      ))}

      <p style={{ fontSize: 12, color: "#3a3a3a", marginTop: 8 }}>Ultimo aggiornamento: 2025</p>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("it");
  const t = { ...T[lang], lang };
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [selectedCar, setSelectedCar] = useState(null);
  const [auth, setAuth] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(window.location.pathname === "/admin");
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [toast, setToast] = useState({ msg: "", show: false });

  useEffect(() => {
    const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => { setCars(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    const h = () => { setIsAdminPage(window.location.pathname === "/admin"); };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);

  const goAdmin = () => { window.history.pushState({}, "", "/admin"); setIsAdminPage(true); };
  const goSite = () => { window.history.pushState({}, "", "/"); setIsAdminPage(false); };
  const showToast = msg => { setToast({ msg, show: true }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
  const doLogin = () => { if (pwd === ADMIN_PWD) { setAuth(true); setPwdErr(""); } else setPwdErr(t.admin.wrongPwd); };

  const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; } body { margin: 0; }
    @keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse-red { 0%,100% { box-shadow:0 0 0 0 rgba(200,16,46,0.4); } 50% { box-shadow:0 0 0 6px rgba(200,16,46,0); } }
    select option { background: #1C1C1C; color: #F5F5F5; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0D0D0D; } ::-webkit-scrollbar-thumb { background: #2E2E2E; border-radius: 3px; }
    input[type=number]::-webkit-inner-spin-button { opacity: 0; }
    .page-animate { animation: fadeInUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
    .detail-animate { animation: fadeIn 0.3s ease both; }
    .car-card-wrap { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1); cursor:pointer; overflow:hidden; }
    .car-card-wrap:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.45); }
    .btn-red-anim { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
    .btn-red-anim:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(200,16,46,0.4) !important; }
    .btn-red-anim:active { transform: translateY(0) !important; }
    .btn-ghost-anim { transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease !important; }
    .btn-ghost-anim:hover { transform: translateY(-1px) !important; border-color: rgba(255,255,255,0.4) !important; color: #fff !important; }
    .btn-wa { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
    .btn-wa:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(37,211,102,0.4) !important; }
    .nav-link { transition: color 0.2s ease !important; }
    .nav-link:hover { color:#fff !important; }
    .logo-wrap { transition: opacity 0.2s ease, transform 0.2s ease; display:inline-block; }
    .logo-wrap:hover { opacity:0.85; transform:scale(1.03); }
    input:focus, select:focus, textarea:focus { border-color: rgba(200,16,46,0.55) !important; box-shadow: 0 0 0 3px rgba(200,16,46,0.1) !important; transition: all 0.2s ease !important; }
    .thumb { transition: transform 0.2s ease, box-shadow 0.2s ease !important; cursor:pointer; }
    .thumb:hover { transform: scale(1.06) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.5) !important; }
    .spec-row { transition: background 0.18s ease, padding-left 0.18s ease !important; }
    .spec-row:hover { background: rgba(200,16,46,0.04) !important; padding-left: 8px !important; }
    .contact-card { transition: transform 0.25s ease, background 0.25s ease !important; }
    .contact-card:hover { transform: translateY(-5px) !important; background: #1C1C1C !important; }
    .value-card { transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease !important; }
    .value-card:hover { transform: translateY(-3px) !important; background: #1a1a1a !important; border-color: rgba(200,16,46,0.25) !important; }
    .team-card { transition: transform 0.25s ease, background 0.25s ease !important; }
    .team-card:hover { transform: translateY(-4px) !important; background: #1C1C1C !important; }
    .stat-num { display:inline-block; transition: transform 0.25s ease, color 0.25s ease !important; }
    .stat-num:hover { transform: scale(1.08) !important; color: #C8102E !important; }
    .badge-pulse { animation: pulse-red 2.5s ease-in-out infinite; }
    .ticker-inner:hover { animation-play-state: paused !important; }
    .filter-panel { animation: fadeInUp 0.22s cubic-bezier(0.4,0,0.2,1) both; }
    .mobile-menu { animation: fadeInUp 0.2s cubic-bezier(0.4,0,0.2,1) both; }
    .mobile-menu-btn { transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease !important; }
    .mobile-menu-btn:hover { padding-left: 28px !important; color: #fff !important; }
    .footer-link { transition: color 0.18s ease, padding-left 0.18s ease !important; }
    .footer-link:hover { color: #fff !important; padding-left: 6px !important; }
    .hours-row { transition: background 0.18s ease, padding-left 0.18s ease !important; }
    .hours-row:hover { background: rgba(255,255,255,0.03) !important; padding-left: 8px !important; }
    .price-box { transition: border-color 0.25s ease !important; }
    .price-box:hover { border-color: rgba(200,16,46,0.3) !important; }
    .admin-row { transition: background 0.15s ease, transform 0.15s ease !important; }
    .admin-row:hover { transform: translateX(3px) !important; }
    .lb-arrow { transition: background 0.2s ease, transform 0.2s ease !important; }
    .lb-arrow:hover { background: rgba(200,16,46,0.7) !important; transform: scale(1.1) !important; }
    .share-btn { transition: color 0.2s ease, transform 0.2s ease !important; }
    .share-btn:hover { color: #C8102E !important; transform: translateX(3px) !important; }
    .lang-btn { transition: all 0.18s cubic-bezier(0.4,0,0.2,1) !important; }
    .lang-btn:hover { transform: scale(1.1) !important; }
    .img-zoom { overflow:hidden; }
    .img-zoom img { transition: transform 0.55s cubic-bezier(0.4,0,0.2,1) !important; }
    .img-zoom:hover img { transform: scale(1.06) !important; }
    .hero-anim-1 { animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) 0.1s both; }
    .hero-anim-2 { animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) 0.25s both; }
    .hero-anim-3 { animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) 0.4s both; }
    .hero-anim-4 { animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) 0.55s both; }
    .hero-anim-5 { animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) 0.7s both; }
    button:focus-visible, a:focus-visible { outline: 2px solid #C8102E !important; outline-offset: 3px !important; }
  `;

  if (isAdminPage && auth) return (
    <>
      <AdminPage cars={cars} onLogout={() => { setAuth(false); goSite(); }} onBack={goSite} showToast={showToast} t={t} />
      <Toast msg={toast.msg} show={toast.show} />
      <style>{globalStyle}</style>
    </>
  );

  if (isAdminPage && !auth) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo />
          <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#C8102E", textTransform: "uppercase" }}>Admin Panel</div>
        </div>
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, padding: 28 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>{t.admin.login}</h2>
          <FG label={t.admin.pwd}>
            <input style={iStyle} type="password" value={pwd} autoFocus onChange={e => setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doLogin()} />
            {pwdErr && <div style={{ fontSize: 11, fontWeight: 600, color: "#e44", marginTop: 6 }}>{pwdErr}</div>}
          </FG>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={doLogin} style={{ flex: 1, background: "#C8102E", color: "#fff", border: "none", padding: 12, fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>{t.admin.enter}</button>
            <button onClick={goSite} style={{ background: "transparent", color: "#606060", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 14px", fontFamily: "Inter,sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>{t.admin.backSite}</button>
          </div>
        </div>
      </div>
      <style>{globalStyle}</style>
    </div>
  );

  return (
    <div style={{ background: "#0D0D0D", color: "#F5F5F5", fontFamily: "Inter,sans-serif", minHeight: "100vh" }}>
      <Nav page={page} setPage={(p) => { setSelectedCar(null); setPage(p); window.scrollTo(0,0); }} lang={lang} setLang={setLang} t={t} selectedCar={selectedCar} />

      {selectedCar ? (
        <div className="detail-animate"><CarDetail car={selectedCar} t={t} onBack={() => { setSelectedCar(null); window.scrollTo(0, 0); }} /></div>
      ) : (
        <>
          {page === "home" && <PageHome t={t} cars={cars} setPage={p => { setPage(p); window.scrollTo(0, 0); }} setSelectedCar={c => { setSelectedCar(c); window.scrollTo(0, 0); }} />}
          {page === "catalog" && <div className="page-animate"><PageCatalog t={t} cars={cars} loading={loading} setSelectedCar={c => { setSelectedCar(c); window.scrollTo(0, 0); }} /></div>}
          {page === "about" && <div className="page-animate"><PageAbout t={t} /></div>}
          {page === "where" && <div className="page-animate"><PageWhere t={t} /></div>}
          {page === "contact" && <div className="page-animate"><PageContact t={t} /></div>}
          {page === "impressum" && <div className="page-animate"><PageImpressum t={t} /></div>}
          <Footer t={t} setPage={p => { setPage(p); window.scrollTo(0, 0); }} goAdmin={goAdmin} />
        </>
      )}

      <Toast msg={toast.msg} show={toast.show} />
      <style>{globalStyle}</style>
    </div>
  );
}
