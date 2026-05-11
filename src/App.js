import React, { useState } from 'react';
import EmployeeForm from './EmployeeForm';
import ContractForm from './ContractForm';
import ContractPreview from './ContractPreview'; // Nouveau

function App() {
  const [step, setStep] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tempContract, setTempContract] = useState(null);

  const handleEmployeeReady = (employee) => {
    setSelectedEmployee(employee);
    setStep(2);
  };

  const handleContractSigned = (contractData) => {
    setTempContract(contractData);
    setStep(3); // On passe à l'aperçu
  };

  const finalizeProcess = () => {
    alert("Processus terminé ! Le contrat a été archivé.");
    setStep(1);
    setSelectedEmployee(null);
    setTempContract(null);
  };

  return (
    <div className="App" style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Gestion des Extras</h1>
      
      {step === 1 && <EmployeeForm onEmployeeSelect={handleEmployeeReady} />}
      
      {step === 2 && (
        <ContractForm 
          employee={selectedEmployee} 
          onPreview={handleContractSigned} // On change onComplete par onPreview
        />
      )}

      {step === 3 && (
        <ContractPreview 
          employee={selectedEmployee} 
          contract={tempContract} 
          onConfirm={finalizeProcess} 
          onBack={() => setStep(2)} 
        />
      )}
    </div>
  );
}

export default App;
