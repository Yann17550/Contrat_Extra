import React, { useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * Composant permettant de saisir les informations d'un employé
 * ou de le rechercher dans la base de données.
 */
const EmployeeForm = ({ onEmployeeSelect }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ssn: '',
    email: '',
    birth_date: '',
    address: ''
  });

  // Fonction pour enregistrer l'employé dans Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // On vérifie si l'employé existe déjà avec son Numéro de Sécurité Sociale
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('ssn', formData.ssn)
      .single();

    if (existingEmployee) {
      alert("Employé déjà connu. Récupération des données...");
      onEmployeeSelect(existingEmployee);
    } else {
      // Sinon, on crée un nouvel enregistrement
      const { data, error } = await supabase
        .from('employees')
        .insert([formData])
        .select();

      if (error) {
        alert("Erreur lors de l'enregistrement : " + error.message);
      } else {
        alert("Nouvel employé créé !");
        onEmployeeSelect(data[0]);
      }
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <input 
          style={inputStyle} 
          placeholder="Prénom" 
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
          required 
        />
        <input 
          style={inputStyle} 
          placeholder="Nom" 
          onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
          required 
        />
        <input 
          style={inputStyle} 
          placeholder="Numéro de Sécurité Sociale" 
          onChange={(e) => setFormData({...formData, ssn: e.target.value})} 
          required 
        />
        <input 
          style={inputStyle} 
          placeholder="Email (pour envoi du contrat)" 
          type="email"
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          style={inputStyle} 
          type="date"
          title="Date de naissance"
          onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
        />
        <textarea 
          style={inputStyle} 
          placeholder="Adresse postale" 
          onChange={(e) => setFormData({...formData, address: e.target.value})} 
        />
        
        <button type="submit" style={buttonStyle}>
          Valider et passer au contrat
        </button>
      </form>
    </div>
  );
};

// Petits styles pour que ce soit propre
const inputStyle = { display: 'block', width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default EmployeeForm;
