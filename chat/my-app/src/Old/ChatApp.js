import React, { useState, useRef, useEffect } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";

import { FaEllipsisV, FaShareAlt, FaFolderOpen, FaEdit, FaArchive, FaTrash } from "react-icons/fa";

import "./index.css"; // Aqui onde incluímos o .CodeMirror { ... }

function App() {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Chat 1",
      messages: [
        { role: "assistant", content: "Olá! Como posso te ajudar hoje?" }
      ],
      // CodeMirror começa vazio ou com algo
      codeResult: ""
    }
  ]);

  const [selectedChatId, setSelectedChatId] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [editChatId, setEditChatId] = useState(null);
  const [editChatName, setEditChatName] = useState("");
  const [menuOpenForChat, setMenuOpenForChat] = useState(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  // Auto-scroll do container de mensagens
  const messagesContainerRef = useRef(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  // Criar um novo chat
  const handleNewChat = () => {
    const newId = chats.length ? chats[chats.length - 1].id + 1 : 1;
    const newChat = {
      id: newId,
      name: `Chat ${newId}`,
      messages: [
        {
          role: "assistant",
          content: "Olá Pavanelli, no que posso auxiliar hoje?"
        }
      ],
      codeResult: ""
    };
    setChats([...chats, newChat]);
    setSelectedChatId(newId);
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => {
      const updated = prev.filter((chat) => chat.id !== id);
      if (id === selectedChatId && updated.length > 0) {
        setSelectedChatId(updated[0].id);
      } else if (updated.length === 0) {
        setSelectedChatId(null);
      }
      return updated;
    });
  };

  const handleRenameChat = (chatId) => {
    setEditChatId(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setEditChatName(chat.name);
    }
  };

  const handleSaveChatName = (chatId) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, name: editChatName };
        }
        return chat;
      })
    );
    setEditChatId(null);
  };

  // Exemplos de ações de menu
  const handleCompartilhar = (chatId) => {
    alert(`Compartilhar o ${chatId ? "Chat " + chatId : "chat selecionado"}`);
  };
  const handleAdicionarProjeto = (chatId) => {
    alert(`Adicionar ao projeto o ${chatId ? "Chat " + chatId : "chat selecionado"}`);
  };
  const handleArquivar = (chatId) => {
    alert(`Arquivar o ${chatId ? "Chat " + chatId : "chat selecionado"}`);
  };

  // Envia mensagem => /api/agent => resposta do The Way no codeResult
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat) return;

    const userMessage = { role: "user", content: inputValue };
    const userText = inputValue;
    setInputValue("");

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage]
          };
        }
        return chat;
      })
    );

    try {
      const response = await fetch("http://localhost:3001/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await response.json();

      const agentReply = data.reply || "Erro: sem resposta.";

      // Armazena SOMENTE a resposta do The Way no codeResult
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { role: "assistant", content: agentReply }],
              codeResult: agentReply
            };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error("Erro ao chamar /api/agent:", err);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { role: "assistant", content: "Erro ao obter resposta." }]
            };
          }
          return chat;
        })
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Coluna Esquerda */}
      <div
        style={{
          width: "13%",
          background: "#202123",
          color: "#fff",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid #343541" }}>
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              padding: "0.5rem",
              background: "#3e3f4b",
              border: "1px solid #555",
              color: "#fff",
              cursor: "pointer",
              borderRadius: "20px"
            }}
          >
            + Novo Planejamento
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.3rem 0.5rem",
                margin: "0.5rem",
                border: "1px solid #2f3035",
                borderRadius: "10px",
                cursor: "pointer",
                background: chat.id === selectedChatId ? "#343541" : "transparent"
              }}
            >
              <div style={{ flex: 1 }} onClick={() => setSelectedChatId(chat.id)}>
                {chat.id === editChatId ? (
                  <input
                    type="text"
                    value={editChatName}
                    onChange={(e) => setEditChatName(e.target.value)}
                    onBlur={() => handleSaveChatName(chat.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveChatName(chat.id)}
                    style={{
                      width: "100%",
                      background: "#2d2d2d",
                      border: "1px solid #555",
                      color: "#fff",
                      borderRadius: "5px"
                    }}
                  />
                ) : (
                  chat.name
                )}
              </div>

              <button
                aria-label="Menu de opções"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenForChat(menuOpenForChat === chat.id ? null : chat.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#bbb",
                  cursor: "pointer",
                  marginLeft: "0.5rem"
                }}
              >
                <FaEllipsisV />
              </button>

              {menuOpenForChat === chat.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "1rem",
                    background: "#2d2d2d",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "0.5rem",
                    zIndex: 10
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0.3rem 0" }}
                    onClick={() => {
                      handleCompartilhar(chat.id);
                      setMenuOpenForChat(null);
                    }}
                  >
                    <FaShareAlt style={{ marginRight: "0.5rem" }} />
                    Compartilhar
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0.3rem 0" }}
                    onClick={() => {
                      handleAdicionarProjeto(chat.id);
                      setMenuOpenForChat(null);
                    }}
                  >
                    <FaFolderOpen style={{ marginRight: "0.5rem" }} />
                    Adicionar ao projeto
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0.3rem 0" }}
                    onClick={() => {
                      handleRenameChat(chat.id);
                      setMenuOpenForChat(null);
                    }}
                  >
                    <FaEdit style={{ marginRight: "0.5rem" }} />
                    Renomear
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0.3rem 0" }}
                    onClick={() => {
                      handleArquivar(chat.id);
                      setMenuOpenForChat(null);
                    }}
                  >
                    <FaArchive style={{ marginRight: "0.5rem" }} />
                    Arquivar
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "0.3rem 0",
                      color: "red"
                    }}
                    onClick={() => {
                      handleDeleteChat(chat.id);
                      setMenuOpenForChat(null);
                    }}
                  >
                    <FaTrash style={{ marginRight: "0.5rem" }} />
                    Excluir
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coluna Central */}
      <div
        style={{
          width: "57%",
          background: "#202123",
          color: "#fff",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "1rem" }}>
          <h1 style={{ margin: "0 0 0.3rem 0", fontSize: "1.5rem" }}>Chat com The Way</h1>
          <div style={{ fontSize: "0.9rem", color: "#aaaaaa" }}>
            Especialista em planejamento financeiro
          </div>
          <hr style={{ border: "none", margin: "0.5rem 0 0 0" }} />
        </div>

        <div
          ref={messagesContainerRef}
          style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
        >
          {selectedChat ? (
            selectedChat.messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <strong>{msg.role === "user" ? "Você" : "The Way"}:</strong>
                <p style={{ margin: 0 }}>{msg.content}</p>
              </div>
            ))
          ) : (
            <p>Nenhum chat selecionado</p>
          )}
        </div>

        <div
          style={{
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <input
            type="text"
            placeholder="Envie uma mensagem para The Way..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            style={{
              flex: 1,
              padding: "1rem",
              background: "#2d2d2d",
              border: "1px solid #555",
              color: "#fff",
              borderRadius: "10px"
            }}
            disabled={!selectedChat}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: "0.5rem 1rem",
              background: "#4caf50",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              borderRadius: "10px"
            }}
            disabled={!selectedChat}
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Coluna Direita */}
      <div style={{ width: "30%", display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #343541", color: "#fff" }}>
          <h2 style={{ margin: 0 }}>Resultado</h2>
        </div>
        <div style={{ flex: 1, padding: "1rem" }}>
          <CodeMirror
            value={selectedChat ? selectedChat.codeResult : ""}
            options={{
              mode: "javascript",
              theme: "dracula",
              lineNumbers: true,
              readOnly: true
            }}
            onBeforeChange={(editor, data, value) => {
              // readOnly => não atualiza state
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
