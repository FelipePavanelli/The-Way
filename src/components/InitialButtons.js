import React from 'react';

function InitialButtons({ onPlanningClick, onAVClick }) {
  const containerStyle = {
    display: "flex",
    flexDirection: "row", // Alterado para row para colocar os botões lado a lado
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "20px",
    gap: "20px" // Espaçamento entre os botões
  };

  const buttonStyle = {
    backgroundColor: "#d8c4a9",
    color: "#000000",
    padding: "15px 30px", // Padding maior
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "280px", // Largura fixa para os botões
    height: "60px", // Altura maior
    fontSize: "18px", // Fonte maior
    fontWeight: "600", // Fonte mais negrito
    margin: "5px 0",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  };

  // Efeito de hover
  const hoverStyle = {
    ...buttonStyle,
    backgroundColor: "#c8b499", // Um pouco mais escuro no hover
    transform: "translateY(-2px)", // Leve efeito de elevação
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
  };

  const [hoverButton1, setHoverButton1] = React.useState(false);
  const [hoverButton2, setHoverButton2] = React.useState(false);

  return (
    <div style={containerStyle}>
      <button 
        className="initial-button" 
        onClick={() => onPlanningClick("Quero realizar um planejamento financeiro.", false)}
        style={hoverButton1 ? hoverStyle : buttonStyle}
        onMouseEnter={() => setHoverButton1(true)}
        onMouseLeave={() => setHoverButton1(false)}
      >
        Quero fazer um planejamento
      </button>
      <button 
        className="initial-button" 
        onClick={() => onAVClick(null, true)}
        style={hoverButton2 ? hoverStyle : buttonStyle}
        onMouseEnter={() => setHoverButton2(true)}
        onMouseLeave={() => setHoverButton2(false)}
      >
        Falar com The Way - IA da Alta Vista
      </button>
    </div>
  );
}

export default InitialButtons;