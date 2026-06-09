"use client";

import { useState } from "react";
import UsuariosGrid from "./UsuariosGrid";

export default function Menu({ usuario, onIrPainel, onIrCadastro, onSair }: any) {

    const [aba, setAba] = useState("");
    const [menuAberto, setMenuAberto] = useState(false);


    return (
        <div className="flex min-h-screen">

            {/* BOTÃO MOBILE */}
            <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded"
            >
                ☰
            </button>


            {/* ✅ MENU LATERAL */}
            <div
                className={`
    fixed md:static
    top-0 left-0
    h-full md:h-auto
    w-64
    bg-slate-800 text-white
    p-5 pt-16 md:pt-5
    flex flex-col gap-3
    transform transition-transform duration-300
    ${menuAberto ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    z-40
  `}
            >

                <h2>Gestor de Assentos</h2>
                <div className="mb-4 pb-2 border-b border-slate-600">
                    👤 {usuario?.nome}
                </div>


                <button
                    onClick={() => {
                        onIrPainel();
                        setMenuAberto(false);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                >
                    📋 Painel
                </button>


                {usuario?.admin === true && (

                    <button
                        onClick={() => {
                            setAba("usuarios");
                            setMenuAberto(false);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-left"
                    >
                        👤 Usuários
                    </button>

                )}

                <button
                    onClick={() => {
                        onSair();
                        setMenuAberto(false);
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

