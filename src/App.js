import React, { useState } from 'react';
import EmployeeForm from './EmployeeForm';
import ContractForm from './ContractForm';

/**
 * Application principale : Gère la navigation entre l'étape 1 (Employé)
 * et l'étape 2 (Contrat & Signature).
 */
function App() {
  const [step, setStep] = useState(1); // 1 = Infos employé, 2 = Signature contrat
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div style={{ padding: '10px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>✍️ Signature Contrat Extra</h1>
        <p>Restauration - Embauche Immédiate</p>
      </header>

      {/* ÉTAPE 1 : Identification de l'extra */}
      {step === 1 && (
        <EmployeeForm 
          onEmployeeSelect={(emp) => {
            setSelectedEmployee(emp);
            setStep(2);
          }} 
        />
      )}

      {/* ÉTAPE 2 : Détails du shift et signature au doigt */}
      {step === 2 && (
        <ContractForm 
          employee={selectedEmployee} 
          onBack={() => setStep(1)} 
        />
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.8em', color: '#999' }}>
        Système de signature numérique certifié - IP & Horodatage activés
      </footer>
    </div>
  );
}

export default App;
