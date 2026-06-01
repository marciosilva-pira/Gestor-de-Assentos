"use client";

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

export default function Home() {
  const [carregado, setCarregado] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<string[]>([]);

  // ✅ CARREGAR dados do Firebase
  useEffect(() => {
    async function carregar() {
      const refMapa = doc(db, "cadeiras", "mapa");
      const snapMapa = await getDoc(refMapa);
      if (snapMapa.exists()) {
        setMapa(snapMapa.data().dados || {});
      }

      const refFotos = doc(db, "cadeiras", "fotos");
      const snapFotos = await getDoc(refFotos);
      if (snapFotos.exists()) {
        setFotos(snapFotos.data().lista || []);
      }

      setCarregado(true);
    }

    carregar();
  }, []);

  // ✅ SALVAR mapa automaticamente
  useEffect(() => {
    if (!carregado) return;

    async function salvar() {
      await setDoc(doc(db, "cadeiras", "mapa"), {
        dados: mapa,
      });
    }

    salvar();
  }, [mapa, carregado]);

  // ✅ UPLOAD + SALVAR FOTOS
  async function carregarFotos(e: any) {
    const files = e.target.files;
    if (!files) return;

    let novas: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload_cadeiras");
      formData.append("folder", "cadeiras");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dous0lse8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      novas.push(data.secure_url);
    }

    const atualizado = [...fotos, ...novas];

    setFotos(atualizado);

    await setDoc(doc(db, "cadeiras", "fotos"), {
      lista: atualizado,
    });
  }

  function limparCadeiras() {
    if (confirm("Deseja limpar todas as cadeiras?")) {
      setMapa({});
      setSelecionada(null);
    }
  }

  function clicarCadeira(num: number) {
    const novo = { ...mapa };

    if (selecionada) {
      novo[num] = selecionada;
      setSelecionada(null);
    } else if (novo[num]) {
      setSelecionada(novo[num]);
      delete novo[num];
    }

    setMapa(novo);
  }

  if (!carregado) return null;

  let cadeiras: any[] = [];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const corredores = [5, 12, 19];

      if (corredores.includes(j)) {
        cadeiras.push(<div key={`gap-${i}-${j}`} />);
        continue;
      }

      let col;
      if (j < 5) col = j;
      else if (j < 12) col = j - 1;
      else if (j < 19) col = j - 2;
      else col = j - 3;

      let linha = ROWS - 1 - i;

      let numeroLinha = linha * COLS + col + 1;
      let cadeiraNum = numeroLinha < 90 ? numeroLinha : numeroLinha + 10;

      const foto = mapa[cadeiraNum];

      cadeiras.push(
        <div
          key={i + "-" + j}
          onClick={() => clicarCadeira(cadeiraNum)}
          style={{
            width: "80%",
            aspectRatio: "1/1",
            background: "#2B2B2B",
            border: "1px solid #555",
            position: "relative",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <span
            style={{
              position: "absolute",
              bottom: "100%",
              width: "100%",
              textAlign: "center",
              color: "white",
            }}
          >
            {cadeiraNum}
          </span>

          {foto && (
            <img
              src={foto}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        background: "#1E1E1E",
        minHeight: "100vh",
        padding: 20,
        color: "white",
      }}
    >
      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `
            repeat(5, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(5, 1fr)
          `,
          gap: 10,
        }}
      >
        {cadeiras}
      </div>

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <input
          id="uploadFotos"
          type="file"
          multiple
          onChange={carregarFotos}
          style={{ display: "none" }}
        />

        <button
          onClick={() =>
            document.getElementById("uploadFotos")?.click()
          }
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
          }}
        >
          Carregar Fotos
        </button>

        <button
          onClick={limparCadeiras}
          style={{
            background: "#dc3545",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
          }}
        >
          Limpar Cadeiras
        </button>
      </div>

      {/* MINIATURAS MELHORADAS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 20,
          padding: 10,
          background: "#111",
        }}
      >
        {fotos.map((src, index) => (
          <img
            key={index}
            src={src}
            onClick={() => setSelecionada(src)}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
              cursor: "pointer",
              border:
                selecionada === src
                  ? "3px solid red"
                  : "1px solid #444",
            }}
          />
        ))}
      </div>
    </div>
  );
}