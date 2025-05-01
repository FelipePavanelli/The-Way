import React from 'react';

const InitialButtons = ({ onPlanningClick, onAVClick }) => {
  console.log("Renderizando botões iniciais");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      <button
        onClick={() => onPlanningClick("Quero fazer um Planejamento Financeiro passo a passo.")}
        className="financial-card flex flex-col items-center p-6 hover:translate-y-[-2px] transition-all duration-300"
      >
        <div className="bg-accent/10 p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Planejamento Financeiro</h3>
        <p className="text-muted-foreground text-center text-sm">Ajuda para planejar seu patrimônio e investimentos</p>
      </button>
      
      <button 
        onClick={() => onAVClick(null, true)}
        className="financial-card flex flex-col items-center p-6 hover:translate-y-[-2px] transition-all duration-300"
      >
        <div className="bg-accent/10 p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-4-4-3Z"></path>
            <path d="M12 19h9"></path>
            <path d="M5 13v5a2 2 0 0 0 2 2h3"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Alta Vista IA</h3>
        <p className="text-muted-foreground text-center text-sm">Assistente especializado para clientes Alta Vista</p>
      </button>
    </div>
  );
};

export default InitialButtons;
