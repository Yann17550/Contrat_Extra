import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const EmployeeForm = ({ onEmployeeSelect }) => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    ssn: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: '',
    address: ''
  });

  // Supprime les accents pour la comparaison technique
  const stripAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Met en forme pour l'affichage (NOM en majuscule, Prénom en Proper)
  const formatName = (name, type) => {
    if (!name) return '';
    if (type === 'last') return name.toUpperCase();
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleLastNameChange = async (e) => {
    const rawValue = e.target.value;
    const upperName = rawValue.toUpperCase();
    
    setFormData({ ...formData, last_name: upperName });

    if (upperName.length > 2) {
      // 1. On récupère tous les employés qui ressemblent au nom tapé
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .ilike('last_name', `%${upperName}%`);

      if (data && data.length > 0) {
        // 2. On compare sans les accents côté code pour trouver le bon
        const found = data.find(emp => 
          stripAccents(emp.last_name) === stripAccents(upperName)
        );

        if (found) {
          setFormData(found);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      last_name: formData.last_name.toUpperCase(),
      first_name: formatName(formData.first_name, 'first')
    };

    const { data: existing } = await supabase
      .from('employees')
      .select('*')
      .eq('last_name', finalData.last_name)
      .eq('first_name', finalData.first_name)
      .maybeSingle();

    if (existing) {
      onEmployeeSelect(existing);
    } else {
      const { data, error } = await supabase.from('employees').insert([finalData]).select();
      if (error) alert("Erreur : " + error.message);
      else onEmployeeSelect(data[0]);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nom de famille (Recherche auto)</label>
        <input style={inputStyle} placeholder="Ex: DUPONT" value={formData.last_name} onChange={handleLastNameChange} required />

        <label style={labelStyle}>Prénom</label>
        <input style={inputStyle} placeholder="Prénom" value={formData.first_name} 
          onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
          onBlur={(e) => setFormData({...formData, first_name: formatName(e.target.value, 'first')})}
          required />
        
        <label style={labelStyle}>Date de Naissance</label>
        <input type="date" style={inputStyle} value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required />

        <label style={labelStyle}>Lieu de naissance</label>
        <input style={inputStyle} placeholder="Ville ou Pays" value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} required />

        <label style={labelStyle}>Numéro de Sécurité Sociale</label>
        <input style={inputStyle} placeholder="1 00 00 00 000 000" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required />
        
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        
        <label style={labelStyle}>Adresse</label>
        <textarea style={inputStyle} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
        
        <button type="submit" style={buttonStyle}>Valider et passer au contrat</button>
      </form>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default EmployeeForm;
