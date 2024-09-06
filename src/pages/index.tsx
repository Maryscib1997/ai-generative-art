import Head from "next/head";
import style from "@/styles/Home.module.css";
import Header from "@/components/Molecules/Header/Header";
import WindowBox from "@/components/Organism/WindowBox/WindowBox";
import InputBox from "@/components/Molecules/InputBox/InputBox";
import SelectBox from "@/components/Molecules/SelectBox/SelectBox";
import { useState } from "react";
import { listaGeneri } from "@/constants/common";
import Button from "@/components/Atoms/Button/Button";
import {
  GenerateContentCandidate,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import SwitchBox from "@/components/Molecules/SwitchBox/SwitchBox";
import Toast from "@/components/Atoms/Toast/Toast";

// Opzioni di durata
const durataOpzioni = [
  { label: 'Breve', value: 'short', chars: 'meno di 500 caratteri' },
  { label: 'Medio', value: 'medium', chars: 'tra 500 e 1500 caratteri' },
  { label: 'Lungo', value: 'long', chars: 'oltre 1500 caratteri' },
];

// Opzioni di tipo
const tipoOpzioni = [
  { label: 'Persona', value: 'person' },
  { label: 'Animale', value: 'animal' },
];

// Opzioni di ambientazione
const ambientazioneOpzioni = [
  { label: 'Città', value: 'città' },
  { label: 'Foresta', value: 'foresta' },
  { label: 'Isola', value: 'isola' },
  { label: 'Montagna', value: 'montagna' },
  { label: 'Spazio', value: 'spazio' },
  { label: 'Casa', value: 'casa' },
  { label: 'Cimitero', value: 'cimitero' },
  { label: 'Scuola', value: 'scuola' },
  { label: 'Università', value: 'università' },
  { label: 'Lavoro', value: 'lavoro' },
];

const tempoOpzioni = [
  { label: 'Passato', value: 'past' },
  { label: 'Presente', value: 'present' },
  { label: 'Futuro', value: 'future' },
];

// Opzioni di lingua
const linguaOpzioni = [
  { label: 'Italiano', value: 'italiano' },
  { label: 'Inglese', value: 'inglese' },
  { label: 'Spagnolo', value: 'spagnolo' },
  { label: 'Francese', value: 'francese' },
];

export default function Home() {
  const [protagonista, setProtagonista] = useState("");
  const [antagonista, setAntagonista] = useState("");
  const [genere, setGenere] = useState("");
  const [pegi18, setPegi18] = useState(false);
  const [durata, setDurata] = useState("medium");
  const [tipoProtagonista, setTipoProtagonista] = useState("person");
  const [tipoAntagonista, setTipoAntagonista] = useState("person");
  const [tipoAnimaleProtagonista, setTipoAnimaleProtagonista] = useState(""); // Stato per il tipo di animale del protagonista
  const [tipoAnimaleAntagonista, setTipoAnimaleAntagonista] = useState(""); // Stato per il tipo di animale dell'antagonista
  const [ambientazione, setAmbientazione] = useState("");
  const [tempo, setTempo] = useState("present");
  const [lingua, setLingua] = useState("italiano");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState(""); // Stato per il titolo

  const handleGenerate = async () => {
    setLoading(true);
    setError(false);

    const durataScelta = durataOpzioni.find((opt) => opt.value === durata);

    // Costruzione del prompt con il tipo di animale se necessario
    let prompt = `Genera un racconto ${genere} della durata ${durataScelta?.chars} per ${
      pegi18 ? "adulti" : "bambini"
    }, con il ${tipoProtagonista} chiamato ${protagonista} e il ${tipoAntagonista} chiamato ${antagonista}. (Lingua: ${lingua})`;

    if (tipoProtagonista === "animal" && tipoAnimaleProtagonista.trim().length > 0) {
      prompt += ` Il tipo di animale del protagonista è ${tipoAnimaleProtagonista}.`;
    }
    if (tipoAntagonista === "animal" && tipoAnimaleAntagonista.trim().length > 0) {
      prompt += ` Il tipo di animale dell'antagonista è ${tipoAnimaleAntagonista}.`;
    }

    try {
      if (process.env.NEXT_PUBLIC_GEMINI_KEY) {
        if (
          protagonista.trim().length > 0 &&
          antagonista.trim().length > 0 &&
          genere.trim().length > 0
        ) {
          const genAI = new GoogleGenerativeAI(
            process.env.NEXT_PUBLIC_GEMINI_KEY
          );
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const result = await model.generateContent(prompt);

          // Controllo della struttura della risposta
          if (result?.response?.candidates && Array.isArray(result.response.candidates)) {
            const output = (
              result.response.candidates as GenerateContentCandidate[]
            )[0]?.content?.parts[0]?.text || "Nessun contenuto generato.";

            setResponse(output);
            const title = generateTitle(output); // Genera il titolo
            setTitle(title); // Memorizza il titolo nello stato
          } else {
            setResponse("Nessun contenuto generato.");
            setTitle("Titolo non disponibile");
          }
        } else {
          setResponse("Per favore, compila tutti i campi.");
          setTitle("Titolo non disponibile");
        }
      }
    } catch (e) {
      console.error("Errore durante la generazione del contenuto:", e);
      setError(true);
      setTitle("Titolo non disponibile");
    } finally {
      setLoading(false);
    }
  };

  const generateTitle = (text: string): string => {
    // Verifica che `text` sia una stringa valida
    if (typeof text !== 'string') {
      return 'Titolo generato';
    }
  
    // Rimuove spazi all'inizio e alla fine della stringa e la suddivide in frasi
    const sentences = text.trim().split('.');
    
    // Controlla se ci sono frasi nella stringa
    if (sentences.length > 0) {
      // Prende la prima frase e la suddivide in parole
      const firstSentence = sentences[0].trim();
      const words = firstSentence.split(' ');
      
      // Restituisce le prime 3 parole come titolo
      return words.slice(0, 3).join(' ') + (words.length > 5 ? '' : '');
    }
  
    // Se non ci sono frasi, restituisce un titolo predefinito
    return 'Titolo generato';
  };
  
  const handleVoice = () => {
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.lang = "it-IT", "en-GB", "es-ES", "fr-FR";
    setIsPlaying(true);
    speechSynthesis.speak(utterance);

    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
    };
  };

  const handleStopVoice = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <>
      <Head>
        <title>Ai Story Teller</title>
        <meta name="description" content="AI based app to generate stories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={style.main}>
        <Header title="AI Story Teller" />
        <div className={style.content}>
          {error && (
            <Toast
              setAction={setError}
              title="Errore"
              message="Errore nella creazione del racconto"
            />
          )}

          <WindowBox title="Story Params">
            <div className={style.container}>
              <InputBox
                label="Nome Protagonista:"
                value={protagonista}
                setValue={setProtagonista}
              />
              <SelectBox
                label="Tipo Protagonista:"
                list={tipoOpzioni}
                setAction={setTipoProtagonista}
              />
              {tipoProtagonista === 'animal' && (
                <InputBox
                  label="Scegli un animale:"
                  value={tipoAnimaleProtagonista}
                  setValue={setTipoAnimaleProtagonista}
                />
              )}
              <InputBox
                label="Nome Antagonista:"
                value={antagonista}
                setValue={setAntagonista}
              />
              <SelectBox
                label="Tipo Antagonista:"
                list={tipoOpzioni}
                setAction={setTipoAntagonista}
              />
              {tipoAntagonista === 'animal' && (
                <InputBox
                  label="Scegli un animale:"
                  value={tipoAnimaleAntagonista}
                  setValue={setTipoAnimaleAntagonista}
                />
              )}
              <SelectBox
                label="Ambientazione:"
                list={ambientazioneOpzioni}
                setAction={setAmbientazione}
              />
              <SelectBox
                label="Genere:"
                list={listaGeneri}
                setAction={setGenere}
              />
                  <SelectBox
              label="Epoca:"
              list={tempoOpzioni}
              setAction={setTempo}
              />
              <SelectBox
                label="Lunghezza:"
                list={durataOpzioni}
                setAction={setDurata}
              />
              <SelectBox
                label="Lingua:"
                list={linguaOpzioni}
                setAction={setLingua}
              />
              <SwitchBox
                label="Per Adulti:"
                value={pegi18}
                setValue={setPegi18}
              />
              <Button
                label="Genera"
                onClick={handleGenerate}
                disabled={
                  protagonista.trim().length <= 0 ||
                  antagonista.trim().length <= 0 ||
                  genere.trim().length <= 0 ||
                  loading
                }
              />
            </div>

            {loading && (
              <div className={style.loading}>
                <div className={style.loader}></div>
              </div>
            )}
            {!loading && response && (
               <div className={style.result}>
                <div className={style.btn}>
                 {isPlaying ? (
                  <button onClick={handleStopVoice} 
                  className={style.customButton}> Stop </button>
                 ) : (
                <button onClick={handleVoice} 
                className={style.customButton}> Racconta </button>
      )}
              <div className={style.title}>
                <h2>{title}</h2> {/* Visualizza il titolo */}
              </div> 
    </div>
    {response}
  </div>
)}
          </WindowBox>
        </div>
      </main>
    </>
  );
}