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
  const [existingId, setExistingId] = useState(null);

  // La fonction de simplification (doit être identique à la logique SQL)
  const simplify = (str) => {
    if (!str) return "";
    return str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlève accents
      .replace(/[^a-zA-Z0-9]/g, "")    // Enlève caractères spéciaux
      .toUpperCase()
      .trim();
  };

  const handleLastNameChange = async (e) => {
    const inputRaw = e.target.value;
    const inputUpper = inputRaw.toUpperCase();
    setFormData({ ...formData, last_name: inputUpper });

    const searchKey = simplify(inputUpper);

    if (searchKey.length >= 2) {
      // RECHERCHE DIRECTE sur la colonne simplifiée
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('search_name', searchKey)
        .maybeSingle();

      if (data) {
        const { id, created_at, search_name, ...rest } = data;
        setFormData(rest);
        setExistingId(id);
      } else {
        setExistingId(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // On prépare les données avec la search_name pour la base
    const dataToSave = {
      ...formData,
      last_name: formData.last_name.toUpperCase(),
      first_name: formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1).toLowerCase(),
      search_name: simplify(formData.last_name) // On génère la clé ici
    };

    if (existingId) {
      const { data, error } = await supabase
        .from('employees')
        .update(dataToSave)
        .eq('id', existingId)
        .select();

      if (!error) onEmployeeSelect(data[0]);
    } else {
      const { data, error } = await supabase
        .from('employees')
        .insert([dataToSave])
        .select();

      if (!error) onEmployeeSelect(data[0]);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nom de famille {existingId && "✅"}</label>
        <input style={inputStyle} value={formData.last_name} onChange={handleLastNameChange} placeholder="NOM" required />
        
        <label style={labelStyle}>Prénom</label>
        <input style={inputStyle} value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} placeholder="Prénom" required />

        <label style={labelStyle}>Date de Naissance</label>
        <input type="date" style={inputStyle} value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required />

        <label style={labelStyle}>Lieu de naissance</label>
        <input style={inputStyle} value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} placeholder="Ville (Dépt)" required />

        <label style={labelStyle}>Sécurité Sociale</label>
        <input style={inputStyle} value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} placeholder="15 chiffres" required />

        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />

        <button type="submit" style={buttonStyle}>
          {existingId ? "Mettre à jour et continuer" : "Enregistrer et continuer"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default EmployeeForm;
