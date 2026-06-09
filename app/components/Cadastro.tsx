"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Cadastro({ usuario, onVoltar }: any) {

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoAdmin, setNovoAdmin] = useState(false);

  async function cadastrarUsuario() {

    if (!novoNome.trim()) {
      alert("Digite o nome");
      return;
    }

    if (!novoEmail.trim()) {
      alert("Digite o email");
      return;
    }

    if (!novaSenha.trim()) {
      alert("Digite a senha");
      return;
    }

    await addDoc(collection(db, "usuarios"), {
      nome: novoNome,
      email: novoEmail,
      senha: novaSenha,
      admin: novoAdmin,
    });

    alert("✅ Usuário criado!");

    setNovoNome("");
    setNovoEmail("");
    setNovaSenha("");
    setNovoAdmin(false);

    onVoltar(); // volta para o menu
  }

  // ✅ BLOQUEIO
  if (!usuario?.admin) {
    return <div style={{ color: "white" }}>Acesso negado</div>;
  }

  return (
    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#1e293b",
        padding: 30,
        borderRadius: 10,
        width: 300
      }}>

        <h2 style={{ color: "white" }}>Cadastro</h2>

        <input
          placeholder="Nome"
          onChange={(e) => setNovoNome(e.target.value)}
          style={input}
        />

        <input
          placeholder="Email"
          onChange={(e) => setNovoEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setNovaSenha(e.target.value)}
          style={input}
        />

        <label style={{ color: "white" }}>
          <input
            type="checkbox"
            onChange={(e) => setNovoAdmin(e.target.checked)}
          /> Admin
        </label>

        <button onClick={cadastrarUsuario} style={btnPrimary}>
          Salvar
        </button>

        <button onClick={onVoltar} style={btnSecondary}>
          Voltar
        </button>

      </div>
    </div>
  );
}

/* estilos */
const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff"
};

const btnPrimary = {
  width: "100%",
  padding: 10,
  background: "#3b82f6",
  border: "none",
  borderRadius: 6,
  color: "white",
  marginTop: 10,
  cursor: "pointer"
};

const btnSecondary = {
  width: "100%",
  padding: 10,
  background: "#334155",
  border: "none",
  borderRadius: 6,
  color: "white",
  marginTop: 5,
  cursor: "pointer"
};
