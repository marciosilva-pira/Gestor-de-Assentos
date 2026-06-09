"use client";

import { useState } from "react";
import UsuariosGrid from "./UsuariosGrid";

export default function Menu({ usuario, onIrPainel, onIrCadastro, onSair }: any) {

    const [aba, setAba] = useState("");


    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* ✅ MENU LATERAL */}
            <div style={{
                width: 250,
                background: "#1e293b",
                color: "white",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10
            }}>
                <h2>Gestor de Assentos</h2>
                <div style={{
                    marginBottom: 20,
                    paddingBottom: 10,
                    borderBottom: "1px solid #334155",
                    color: "white"
                }}>
                    👤 {usuario?.nome}
                </div>


                <button onClick={onIrPainel} style={btnMenu}>
                    📋 Painel
                </button>

                {usuario?.admin && (
                    <button
                        onClick={() => setAba("usuarios")}
                        style={btnMenu}
                    >
                        👤 Usuários
                    </button>
                )}

                <button onClick={onSair} style={btnMenuSair}>
                    🚪 Sair
                </button>
            </div>

            {/* ✅ CONTEÚDO PRINCIPAL */}
            <div
                style={{
                    flex: 1,
                    background: "#0f172a",
                    padding: 30,
                    color: "white"
                }}
            >

                {aba === "usuarios" && (
                    <UsuariosGrid />
                )}

            </div>

        </div>
    );
}

/* ✅ ESTILOS */

const btnMenu = {
    padding: 10,
    background: "#334155",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    textAlign: "left" as const,
    width: "100%"
};



const btnMenuSair = {
    marginTop: "auto",
    padding: 10,
    background: "#ef4444",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    textAlign: "left" as const
};

