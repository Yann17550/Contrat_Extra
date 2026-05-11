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
          const { id, created_at, ...rest } = found;
          // On remplit le formulaire avec ce qu'on a trouvé en base
          setFormData({
            last_name: rest.last_name || upperName,
            first_name: rest.first_name || '',
            ssn: rest.ssn || '',
            email: rest.email || '',
            phone: rest.phone || '',
            birth_date: rest.birth_date || '',
            birth_place: rest.birth_place || '',
            address: rest.address || ''
          });
          setExistingId(id);
        } else {
          setExistingId(null);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSave = {
      last_name: formData.last_name.toUpperCase(),
      first_name: formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1).toLowerCase(),
      ssn: formData.ssn,
      email: formData.email,
      phone: formData.phone,
      birth_date: formData.birth_date,
      birth_place: formData.birth_place,
      address: formData.address
    };

    if (existingId) {
      // MISE À JOUR : On update l'employé existant avec les nouvelles infos
      const { data, error } = await supabase
        .from('employees')
        .update(dataToSave)
        .eq('id', existingId)
        .select();

      if (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
      } else {
        onEmployeeSelect(data[0]);
      }
    } else {
      // CRÉATION : Nouvel employé
      const { data, error } = await supabase
        .from('employees')
        .insert([dataToSave])
        .select();

      if (error) {
        alert("Erreur lors de l'enregistrement : " + error.message);
      } else if (data && data.length > 0) {
        onEmployeeSelect(data[0]);
      }
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nom de famille {existingId && "✅ (Existant)"}</label>
        <input style={inputStyle} placeholder="NOM" value={formData.last_name} onChange={handleLastNameChange} required />

        <label style={labelStyle}>Prénom</label>
        <input style={inputStyle} placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
        
        <label style={labelStyle}>Date de Naissance</label>
        <input type="date" style={inputStyle} value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required />

        <label style={labelStyle}>Lieu de naissance (Ville + Dépt)</label>
        <input style={inputStyle} placeholder="Ex: Paris (75)" value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} required />

        <label style={labelStyle}>Sécurité Sociale</label>
        <input style={inputStyle} placeholder="15 chiffres" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required />
        
        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        
        <label style={labelStyle}>Adresse postale</label>
        <textarea style={inputStyle} placeholder="N°, rue, CP, Ville" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
        
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
