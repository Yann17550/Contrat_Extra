import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const EmployeeForm = ({ onEmployeeSelect }) => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    ssn: '',
    email: '',
    phone: '', // Ajout du champ téléphone
    birth_date: '',
    birth_place: '',
    address: ''
  });

  // Fonction de recherche par Nom
  const handleLastNameChange = async (e) => {
    const nameValue = e.target.value;
    setFormData({ ...formData, last_name: nameValue });

    if (nameValue.length > 2) {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .ilike('last_name', nameValue)
        .maybeSingle();

      if (data) {
        setFormData(data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data: existing } = await supabase
      .from('employees')
      .select('*')
      .eq('last_name', formData.last_name)
      .eq('first_name', formData.first_name)
      .maybeSingle();

    if (existing) {
      onEmployeeSelect(existing);
    } else {
      const { data, error } = await supabase
        .from('employees')
        .insert([formData])
        .select();

      if (error) alert("Erreur lors de l'enregistrement : " + error.message);
      else onEmployeeSelect(data[0]);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        
        <label style={labelStyle}>Nom de famille (Recherche auto)</label>
        <input 
          style={inputStyle} 
          placeholder="NOM" 
          value={formData.last_name} 
          onChange={handleLastNameChange} 
          required 
        />

        <label style={labelStyle}>Prénom</label>
        <input 
          style={inputStyle} 
          placeholder="Prénom" 
          value={formData.first_name} 
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
          required 
        />
        
        <label style={labelStyle}>Date de Naissance</label>
        <input 
          type="date" 
          style={inputStyle} 
          value={formData.birth_date} 
          onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
          required 
        />

        <label style={labelStyle}>Lieu de naissance</label>
        <input 
          style={inputStyle} 
          placeholder="Ville ou Pays" 
          value={formData.birth_place} 
          onChange={(e) => setFormData({...formData, birth_place: e.target.value})} 
          required 
        />

        <label style={labelStyle}>Numéro de Sécurité Sociale</label>
        <input 
          style={inputStyle} 
          placeholder="1 00 00 00 000 000" 
          value={formData.ssn} 
          onChange={(e) => setFormData({...formData, ssn: e.target.value})} 
          required 
        />
        
        <label style={labelStyle}>Email</label>
        <input 
          style={inputStyle} 
          placeholder="nom@exemple.com" 
          type="email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />

        <label style={labelStyle}>Numéro de téléphone</label>
        <input 
          style={inputStyle} 
          placeholder="06 00 00 00 00" 
          type="tel" 
          value={formData.phone} 
          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
        />
        
        <label style={labelStyle}>Adresse postale</label>
        <textarea 
          style={inputStyle} 
          placeholder="Adresse complète" 
          value={formData.address} 
          onChange={(e) => setFormData({...formData, address: e.target.value})} 
        />
        
        <button type="submit" style={buttonStyle}>Valider et passer au contrat</button>
      </form>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

export default EmployeeForm;
