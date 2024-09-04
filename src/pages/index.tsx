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

// Aggiungi opzioni di durata (es. breve, medio, lungo) con specifiche sui caratteri
const durataOpzioni = [
  { label: 'Breve', value: 'short', chars: 'meno di 500 caratteri' },
  { label: 'Medio', value: 'medium', chars: 'tra 500 e 1500 caratteri' },
  { label: 'Lungo', value: 'long', chars: 'oltre 1500 caratteri' },
];

export default function Home() {
  const [protagonista, setProtagonista] = useState("");
  const [antagonista, setAntagonista] = useState("");
  const [genere, setGenere] = useState("");
  const [pegi18, setPegi18] = useState(false);
  const [durata, setDurata] = useState("medium"); // Stato per la durata

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleGenerate = async () => {
    setLoading(true);

    // Trova l'opzione di durata selezionata e il suo intervallo di caratteri
    const durataScelta = durataOpzioni.find((opt) => opt.value === durata);

    const prompt = `genera un racconto ${genere} della durata ${durataScelta?.chars} per ${
      pegi18 ? "adulti" : "bambini"
    }, con il protagonista chiamato ${protagonista} e l'antagonista chiamato ${antagonista}.`;

    console.log("Chiave API:", process.env.NEXT_PUBLIC_GEMINI_KEY);

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
  
          const output = (
            result.response.candidates as GenerateContentCandidate[]
          )[0].content.parts[0].text;
  
          if (output) {
            setResponse(output);
          } else {
            setResponse("Nessun contenuto generato.");
          }
        } else {
          setResponse("Per favore, compila tutti i campi.");
        }
      } else {
        setResponse("Chiave API non configurata.");
      }
    } catch (error) {
      console.error("Errore durante la generazione del contenuto:", error);
      setResponse("Errore durante la generazione del contenuto.");
    } finally {
      setLoading(false);
    }
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
          <WindowBox title="Story Params">
            <div className={style.container}>
              <InputBox
                label="Nome Protagonista:"
                value={protagonista}
                setValue={setProtagonista}
              />
              <InputBox
                label="Nome Antagonista:"
                value={antagonista}
                setValue={setAntagonista}
              />
              <SelectBox
                label="Genere:"
                list={listaGeneri}
                setAction={setGenere}
              />
              <SelectBox
                label="Durata:"
                list={durataOpzioni}
                setAction={setDurata}
              />
              <SwitchBox
                label="Per Adulti:"
                value={pegi18}
                setValue={setPegi18}
              />
              <Button
                label="Genere"
                onClick={handleGenerate}
                disabled={
                  protagonista.trim().length <= 0 ||
                  antagonista.trim().length <= 0 ||
                  genere.trim().length <= 0 ||
                  loading
                }
              />
            </div>

            {loading ? (
              <div className={style.loading}>
                <p>loading...</p>
              </div>
            ) : (
              <div className={style.result}>{response}</div>
            )}
          </WindowBox>
        </div>
      </main>
    </>
  );
}
