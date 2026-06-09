import { useState } from "react";

export default function Cadeira({
  numero,
  foto,
  onClick,
  onRemove,
  mapa,
  setMapa,
}: any) {
  const [dragOver, setDragOver] = useState(false);

  function onDrop(e: any) {
    const origem = e.dataTransfer.getData("origem");

    if (!origem) return;

    const novo = { ...mapa };

    const origemFoto = novo[origem];
    const destinoFoto = novo[numero];

    if (!origemFoto) return;

    if (destinoFoto) {
      novo[origem] = destinoFoto;
    } else {
      delete novo[origem];
    }

    novo[numero] = origemFoto;
    setMapa(novo);
    setDragOver(false);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ fontSize: 12 }}>{numero}</span>

      <div
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          onRemove();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          width: 60,
          height: 60,
          background: dragOver ? "#444" : "#2B2B2B",
          border: "1px solid #555",
          position: "relative",
          borderRadius: 6,
        }}
      >
        {foto && (
          <img
            src={foto}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("origem", String(numero))
            }
            style={{ width: "100%", height: "100%" }}
          />
        )}

        {foto && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
