"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    addDoc
} from "firebase/firestore";

export default function UsuariosGrid() {

    const [selecionado, setSelecionado] = useState<string | null>(null);

    const [usuarios, setUsuarios] = useState<any[]>([]);

    const [modo, setModo] = useState<"novo" | "editar" | null>(null);
    const [usuarioAtual, setUsuarioAtual] = useState<any>(null);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [admin, setAdmin] = useState(false);

    async function carregarUsuarios() {
        const snapshot = await getDocs(collection(db, "usuarios"));

        const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        setUsuarios(lista);
    }

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // ✅ EXCLUIR
    async function excluirUsuario(id: string) {
        if (!confirm("Deseja excluir este usuário?")) return;

        await deleteDoc(doc(db, "usuarios", id));
        carregarUsuarios();
    }

    // ✅ NOVO USUÁRIO
    function novoUsuario() {
        setModo("novo");
        setNome("");
        setEmail("");
        setSenha("");
        setAdmin(false);
    }


    // ✅ EDITAR
    function editarUsuario(u: any) {
        setModo("editar");
        setUsuarioAtual(u);
        setNome(u.nome);
        setEmail(u.email);
        setSenha(u.senha || "");
        setAdmin(u.admin || false);
    }

    // ✅ SALVAR (novo ou edição)
    async function salvar() {

        if (!nome || !email || !senha) {
            alert("Preencha nome, email e senha");
            return;
        }


        if (modo === "novo") {
            await addDoc(collection(db, "usuarios"), {
                nome,
                email,
                senha,
                admin
            });
        }

        if (modo === "editar") {
            await updateDoc(doc(db, "usuarios", usuarioAtual.id), {
                nome,
                email,
                senha,
                admin
            });
        }

        setModo(null);
        carregarUsuarios();
    }

    return (
        <div>
            <h2>Usuários</h2>

            <button onClick={novoUsuario} style={btnNovo}>
                ➕ Novo Usuário
            </button>

            <table style={{
                width: "100%",
                marginTop: 20,
                borderCollapse: "collapse"
            }}>

                <thead style={{ background: "#1e293b", color: "#fff" }}>
                    <tr>
                        <th style={th}>Nome</th>
                        <th style={th}>Email</th>
                        <th style={th}>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {usuarios.map((u) => (

                        <tr
                            key={u.id}
                            onClick={() => setSelecionado(u.id)}
                            onMouseEnter={(e) => {
                                if (selecionado !== u.id)
                                    e.currentTarget.style.background = "#1e293b";
                            }}
                            onMouseLeave={(e) => {
                                if (selecionado !== u.id)
                                    e.currentTarget.style.background = "transparent";
                            }}
                            style={{
                                background: selecionado === u.id ? "#334155" : "transparent",
                                cursor: "pointer"
                            }}
                        >



                            <td style={td}>{u.nome}</td>
                            <td style={td}>{u.email}</td>

                            <td style={td}>
                                <button onClick={() => editarUsuario(u)} style={btnEditar}>
                                    ✏️
                                </button>

                                <button onClick={() => excluirUsuario(u.id)} style={btnExcluir}>
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ FORMULÁRIO */}
            {modo && (
                <div style={modal}>
                    <div style={box}>
                        <h3>{modo === "novo" ? "Novo Usuário" : "Editar Usuário"}</h3>

                        <input
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            style={input}
                        />

                        <input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={input}
                        />

                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={input}
                        />

                        <label style={{ color: "white", display: "block", marginTop: 10 }}>
                            <input
                                type="checkbox"
                                checked={admin}
                                onChange={(e) => setAdmin(e.target.checked)}
                            /> Admin
                        </label>

                        <button onClick={salvar} style={btnSalvar}>
                            Salvar
                        </button>

                        <button onClick={() => setModo(null)} style={btnCancelar}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}


/* ✅ ESTILOS */

const th = {
    textAlign: "left" as const,
    padding: 12,
    borderBottom: "1px solid #334155"
};

const td = {
    padding: 12,
    borderBottom: "1px solid #1e293b"
};

const btnNovo = {
    padding: 10,
    background: "#22c55e",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
};

const btnEditar = {
    marginRight: 5,
    background: "#3b82f6",
    border: "none",
    color: "white",
    padding: 5,
    borderRadius: 4,
    cursor: "pointer"
};

const btnExcluir = {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: 5,
    borderRadius: 4,
    cursor: "pointer"
};

const btnSalvar = {
    width: "100%",
    padding: 10,
    background: "#3b82f6",
    border: "none",
    borderRadius: 6,
    color: "white",
    marginTop: 10
};

const btnCancelar = {
    width: "100%",
    padding: 10,
    background: "#334155",
    border: "none",
    borderRadius: 6,
    color: "white",
    marginTop: 5
};

const input = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff"
};

const modal = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const box = {
    background: "#1e293b",
    padding: 20,
    borderRadius: 10,
    width: 300,
    color: "white"
};