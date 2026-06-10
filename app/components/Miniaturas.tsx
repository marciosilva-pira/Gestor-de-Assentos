export default function Miniaturas({
  fotos,
  selecionada,
  setSelecionada,
  usuario,
  excluirFoto,
}: any) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
      {fotos.map((foto: any) => (
        <div key={foto.id} style={{ position: "relative" }}>

          <img
            src={foto.url}
            draggable={false}
            onClick={() => setSelecionada(foto.url)}

            onPointerDown={(e) => {
              console.log("Iniciou drag", foto.url)
              // aqui você pode salvar a foto selecionada para arrastar
            }}

            onPointerMove={(e) => {
              // aqui você pode mover visualmente se quiser
            }}

            onPointerUp={(e) => {
              console.log("Soltou")
              // aqui entra a lógica de soltar na cadeira
            }}

            onDragStart={(e) => e.preventDefault()}

            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              userSelect: "none",
              touchAction: "none", // ESSENCIAL para tablet
              cursor: "grab"
            }}
          />


          {usuario?.admin && (
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
          )}
        </div>
      ))}
    </div>
  );
}
