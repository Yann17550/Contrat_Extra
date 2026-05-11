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

  const stripAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  };

  const handleLastNameChange = async (e) => {
    const upperName = e.target.value.toUpperCase();
    setFormData({ ...formData, last_name: upperName });

    if (upperName.length > 2) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .ilike('last_name', `%${upperName}%`);

      if (data && data.length > 0) {
        const found = data.find(emp => stripAccents(emp.last_name) === stripAccents(upperName));
        if (found) {
          // On sépare l'ID des données du formulaire pour ne pas l'envoyer dans l'insert
          const { id, created_at, ...rest } = found;
          setFormData(rest);
          setExistingId(id); // On mémorise qu'il existe déjà
        } else {
          setExistingId(null);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      last_name: formData.last_name.toUpperCase(),
      first_name: formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1).toLowerCase()
    };

    if (existingId) {
      // Si l'employé existe déjà, on le sélectionne simplement avec son ID
      onEmployeeSelect({ id: existingId, ...finalData });
    } else {
      // Sinon, on le crée
      const { data, error } = await supabase.from('employees').insert([finalData]).select();
      if (error) {
        alert("Erreur lors de l'enregistrement : " + error.message);
      } else {
        onEmployeeSelect(data[0]);
      }
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nom de famille {existingId && "✅"}</label>
        <input style={inputStyle} placeholder="NOM" value={formData.last_name} onChange={handleLastNameChange} required />

        <label style={labelStyle}>Prénom</label>
        <input style={inputStyle} placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
        
        <label style={labelStyle}>Date de Naissance</label>
        <input type="date" style={inputStyle} value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required />

        <label style={labelStyle}>Lieu de naissance</label>
        <input style={inputStyle} placeholder="Ville" value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} required />

        <label style={labelStyle}>Sécurité Sociale</label>
        <input style={inputStyle} placeholder="Numéro SS" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required />
        
        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        
        <button type="submit" style={buttonStyle}>
          {existingId ? "Utiliser ce profil" : "Enregistrer et continuer"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default EmployeeForm;
