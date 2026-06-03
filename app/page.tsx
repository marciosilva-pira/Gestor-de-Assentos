"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const COLS = 22;
const ROWS = 6;
const GRID_COLS = 25;

export default function Home() {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<{ [key: number]: string }>({});
  const [fotos, setFotos] = useState<{ id: string; url: string }[]>([]);

  // ✅ NOVO: controle de drag
  const [dragOrigem, setDragOrigem] = useState<number | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ CARREGAR MAPA
  useEffect(() => {
    async function carregarMapa() {
      const snap = await getDoc(doc(db, "config", "mapa"));
      if (snap.exists()) setMapa(snap.data());
    }
    carregarMapa();
  }, []);

  // ✅ tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "fotos"), (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        nome: doc.data().nome,
      }));

      lista.sort((a, b) => a.nome.localeCompare(b.nome));

      setFotos(lista);
    });

    return () => unsubscribe();
  }, []);

  // ✅ carregar inicial
  useEffect(() => {
    async function carregarFotosBanco() {
      const snapshot = await getDocs(collection(db, "fotos"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        nome: doc.data().nome || "",
      }));

      lista.sort((a, b) => a.nome.localeCompare(b.nome));

      setFotos(lista);
    }

    carregarFotosBanco();
  }, []);

  async function excluirFoto(id: string) {
    if (!confirm("Deseja excluir esta foto?")) return;
    await deleteDoc(doc(db, "fotos", id));
  }

  async function salvarMapaFirebase() {
    await setDoc(doc(db, "config", "mapa"), mapa);
    alert("✅ Mapa salvo no banco!");
  }

  async function carregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setCarregando(true);
    setProgresso(0);

    const arquivosOrdenados = Array.from(files).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const uploads = arquivosOrdenados.map(async (file, index) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload_cadeiras");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dous0lse8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        await addDoc(collection(db, "fotos"), {
          url: data.secure_url,
          nome: file.name,
        });
      }

      setProgresso(Math.round(((index + 1) / arquivosOrdenados.length) * 100));
    });

    await Promise.all(uploads);

    setCarregando(false);
  }

  function limparCadeiras() {
    setMapa({});
    setSelecionada(null);
  }

  function clicarCadeira(num: number) {
    const novo = { ...mapa };

    // ✅ SOMENTE colocar foto selecionada
    if (selecionada) {
      novo[num] = selecionada;
      setMapa(novo);
      setSelecionada(null);
    }
  }


  function removerFotoCadeira(num: number) {
    const novo = { ...mapa };
    delete novo[num];
    setMapa(novo);
  }


  // ✅ NOVO: drop
  function onDropCadeira(destino: number) {
    if (dragOrigem === null) return;

    const novo = { ...mapa };

    const origemFoto = novo[dragOrigem];
    const destinoFoto = novo[destino];

    if (!origemFoto) return;

    // troca ou move
    if (destinoFoto) {
      novo[dragOrigem] = destinoFoto;
    } else {
      delete novo[dragOrigem];
    }

    novo[destino] = origemFoto;

    setMapa(novo);
    setDragOrigem(null);
  }

  const cadeiras = [];

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
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#ccc",
              fontSize: isMobile ? 12 : 14,
              marginBottom: 3,
              letterSpacing: 3,
            }}
          >
            {cadeiraNum}
          </span>

          <div
            onClick={() => clicarCadeira(cadeiraNum)}
            onContextMenu={(e) => {
              e.preventDefault();
              removerFotoCadeira(cadeiraNum);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropCadeira(cadeiraNum)}
            style={{
              width: "100%",
              maxWidth: isMobile ? 50 : 70,
              aspectRatio: "1",
              background: "#2B2B2B",
              border: "1px solid #555",
              position: "relative",
              cursor: "pointer",
              borderRadius: 6,
              overflow: "visible",
            }}
          >
            {foto && (
              <img
                src={foto}
                draggable
                onDragStart={() => setDragOrigem(cadeiraNum)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}


  {foto && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      removerFotoCadeira(cadeiraNum);
    }}
    style={{
      position: "absolute",
      top: -12,
      right: -10,
      background: "#1f1f1f", // ✅ fundo escuro
      /*border: "none",*/
      border: "1px solid #444",

      borderRadius: "50%",
      width: 30,
      height: 30,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      boxShadow: "0 3px 8px rgba(0,0,0,0.6)",
      padding: 0,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"   // ✅ aumentou só o ícone
      height="22"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/>
    </svg>
  </button>
)}




          </div>
        </div>
      );
    }
  }

  return (
    <div
      style={{
        background: "#1E1E1E",
        minHeight: "100vh",
        padding: isMobile ? 10 : 20,
        color: "white",
      }}
    >
      {/* GRID */}
      <div style={{ overflowX: isMobile ? "hidden" : "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(4,1fr)"
              : isTablet
                ? "repeat(10,1fr)"
                : `
              repeat(5, 1fr) 0.2fr
              repeat(6, 1fr) 0.2fr
              repeat(6, 1fr) 0.2fr
              repeat(5, 1fr)
            `,
            rowGap: isMobile ? 5 : 10,
            columnGap: isMobile ? 0 : 1,
            minWidth: isTablet ? 1000 : undefined,
          }}
        >
          {cadeiras}
        </div>
      </div>

      {/* TÍTULOS */}
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `
            repeat(5, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(6, 1fr) 0.2fr
            repeat(5, 1fr)
          `,
            marginTop: 6,
            marginBottom: 20,
            fontSize: 16,
            fontWeight: "bold",
            color: "#ccc",
          }}
        >
          <div style={{ gridColumn: "1 / span 5", textAlign: "center" }}>
            3 - CADEIRA (ESQUERDO)
          </div>

          <div style={{ gridColumn: "7 / span 13", textAlign: "center" }}>
            2 - TRIBUNA
          </div>

          <div style={{ gridColumn: "20 / span 5", textAlign: "center" }}>
            4 - MESA (DIREITO)
          </div>
        </div>
      )}

      {/* BOTÕES */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
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
          disabled={carregando}
          style={{
            background: "#007BFF",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
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
            cursor: "pointer",
          }}
        >
          Limpar Cadeiras
        </button>

        <button
          onClick={salvarMapaFirebase}
          style={{
            background: "#28a745",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Salvar Layout
        </button>
      </div>

      {/* LOADING */}
      {carregando && (
        <div style={{ marginTop: 15 }}>
          ⏳ {progresso}%
        </div>
      )}

      {/* MINIATURAS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 15,
          padding: 10,
          background: "#111",
          borderRadius: 6,
        }}
      >
        {fotos.map((foto) => (
          <div key={foto.id} style={{ position: "relative" }}>
            <img
              src={foto.url}
              onClick={() => setSelecionada(foto.url)}
              style={{
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "pointer",
                border:
                  selecionada === foto.url
                    ? "3px solid red"
                    : "1px solid #444",
              }}
            />

            <button
              onClick={() => excluirFoto(foto.id)}
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}