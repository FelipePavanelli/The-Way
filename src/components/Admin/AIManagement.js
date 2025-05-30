import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaRobot, FaCog, FaThermometerHalf, FaDatabase } from "react-icons/fa";

const AIManagement = ({ onClose, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    systemPrompt: "",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4000,
    knowledgeBase: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("prompt");

  // Modelos disponíveis para seleção
  const availableModels = [
    { id: "gpt-4o", name: "GPT-4o (Padrão)" },
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
  ];

  // Carregar configurações atuais
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`);
        if (!response.ok) {
          throw new Error("Falha ao carregar configurações");
        }
        const data = await response.json();
        setSettings({
          systemPrompt: data.systemPrompt || "",
          model: data.model || "gpt-4o",
          temperature: data.temperature || 0.7,
          maxTokens: data.maxTokens || 4000,
          knowledgeBase: data.knowledgeBase || []
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setErrorMessage("Não foi possível carregar as configurações. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Salvar alterações
  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...settings,
          updatedBy: "admin"
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar configurações");
      }

      setSuccessMessage("Configurações salvas com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setErrorMessage("Não foi possível salvar as configurações. Tente novamente mais tarde.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Atualizar temperatura (valor numérico)
  const handleTemperatureChange = (e) => {
    const value = parseFloat(e.target.value);
    setSettings(prev => ({
      ...prev,
      temperature: value
    }));
  };

  // Atualizar tokens máximos (valor numérico)
  const handleMaxTokensChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSettings(prev => ({
      ...prev,
      maxTokens: value
    }));
  };

  // Manipular upload de arquivo de conhecimento
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setSettings(prev => ({
        ...prev,
        knowledgeBase: [
          ...prev.knowledgeBase,
          { name: file.name, content: content }
        ]
      }));
    };
    reader.readAsText(file);
  };

  // Remover arquivo de conhecimento
  const handleRemoveFile = (index) => {
    setSettings(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter((_, i) => i !== index)
    }));
  };

  // Exibir tela de carregamento
  if (isLoading) {
    return (
      <div className={`admin-panel ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="admin-header">
          <h2>Gestão de IA</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="admin-content loading">
          <div className="loading-spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-panel ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="admin-header">
        <h2>Gestão de IA</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === "prompt" ? "active" : ""} 
          onClick={() => setActiveTab("prompt")}
        >
          <FaRobot /> Prompt do Sistema
        </button>
        <button 
          className={activeTab === "config" ? "active" : ""} 
          onClick={() => setActiveTab("config")}
        >
          <FaCog /> Configurações
        </button>
        <button 
          className={activeTab === "knowledge" ? "active" : ""} 
          onClick={() => setActiveTab("knowledge")}
        >
          <FaDatabase /> Base de Conhecimento
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "prompt" && (
          <div className="admin-section">
            <label htmlFor="systemPrompt">Prompt do Sistema</label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={settings.systemPrompt}
              onChange={handleInputChange}
              rows={15}
              placeholder="Insira o prompt do sistema aqui..."
            />
            <p className="input-help">
              O prompt do sistema define a personalidade e o comportamento do assistente. 
              Ele é enviado como contexto em todas as conversas.
            </p>
          </div>
        )}

        {activeTab === "config" && (
          <div className="admin-section">
            <div className="form-group">
              <label htmlFor="model">Modelo</label>
              <select
                id="model"
                name="model"
                value={settings.model}
                onChange={handleInputChange}
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="input-help">
                Selecione o modelo de IA a ser utilizado. GPT-4o é recomendado para melhor desempenho.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="temperature">
                <FaThermometerHalf /> Temperatura: {settings.temperature}
              </label>
              <input
                type="range"
                id="temperature"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={handleTemperatureChange}
              />
              <div className="range-labels">
                <span>Preciso</span>
                <span>Criativo</span>
              </div>
              <p className="input-help">
                Controla a aleatoriedade das respostas. Valores mais baixos são mais determinísticos, 
                valores mais altos mais criativos.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="maxTokens">Tokens Máximos</label>
              <input
                type="number"
                id="maxTokens"
                name="maxTokens"
                min="500"
                max="8000"
                value={settings.maxTokens}
                onChange={handleMaxTokensChange}
              />
              <p className="input-help">
                Limite máximo de tokens (palavras/caracteres) que o modelo pode gerar em uma resposta.
              </p>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="admin-section">
            <div className="knowledge-upload">
              <label htmlFor="fileUpload" className="upload-button">
                Adicionar Arquivo de Conhecimento
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                accept=".txt,.md,.json,.csv"
                style={{ display: 'none' }}
              />
              <p className="input-help">
                Arquivos adicionados serão incluídos como contexto adicional para o assistente.
                Formatos suportados: TXT, MD, JSON, CSV.
              </p>
            </div>

            <div className="knowledge-list">
              <h3>Arquivos na Base de Conhecimento ({settings.knowledgeBase.length})</h3>
              {settings.knowledgeBase.length === 0 ? (
                <p className="empty-list">Nenhum arquivo adicionado.</p>
              ) : (
                <ul>
                  {settings.knowledgeBase.map((file, index) => (
                    <li key={index} className="knowledge-file">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        ({Math.round(file.content.length / 1024)} KB)
                      </span>
                      <button 
                        className="remove-file" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="admin-footer">
        <button className="cancel-button" onClick={onClose}>
          Cancelar
        </button>
        <button 
          className="save-button" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="small-spinner"></div> Salvando...
            </>
          ) : (
            <>
              <FaSave /> Salvar Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIManagement;
