"use client";

import { useState, useEffect } from "react";
import UsuariosGrid from "./UsuariosGrid";

export default function Menu({ usuario, onIrPainel, onIrCadastro, onSair }: any) {

    const [aba, setAba] = useState("");

    const [menuAberto, setMenuAberto] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 768;
        }
        return false;
    });


    function fecharSeMobile() {
        if (window.innerWidth < 768) {
            setMenuAberto(false);
        }
    }

console.log("Menu renderizado");

    return (
        <div className="min-h-screen bg-slate-900 flex">


            {/* BOTÃO MOBILE */}
            <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded"
            >
                ☰
            </button>


            {/* ✅ OVERLAY (COLOCA AQUI) */}
            {menuAberto && (
                <div
                    onClick={() => setMenuAberto(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                />
            )}


            {/* ✅ MENU LATERAL */}
            <div
  className="
    fixed
    top-0 left-0
    h-full
    w-64
    bg-slate-800 text-white
    p-5 pt-16 md:pt-5
    flex flex-col gap-3
    z-[9999]
  "
>


                <h2>Gestor de Assentos</h2>
                <div className="mb-4 pb-2 border-b border-slate-600">
                    👤 {usuario?.nome}
                </div>


                <button
                    onClick={() => {
                        onIrPainel();
                        fecharSeMobile();
                    }}

                    className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                >
                    📋 Painel
                </button>


                {usuario?.admin === true && (

                    <button
                        onClick={() => {
                            setAba("usuarios");
                            fecharSeMobile();
                        }}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                    >
                        👤 Usuários
                    </button>

                )}

                <button
                    onClick={() => {
                        onSair();
                        fecharSeMobile();
                    }}
                    className="mt-auto bg-red-500 hover:bg-red-600 p-2 rounded text-left"
                >
                    🚪 Sair
                </button>
            </div>

            {/* ✅ CONTEÚDO PRINCIPAL */}
            <div className="flex-1 bg-slate-900 p-6 md:p-8 text-white w-full">


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

