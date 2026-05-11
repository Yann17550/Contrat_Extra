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

  const simplify = (str) => {
    if (!str) return "";
    return str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .trim();
  };

  const handleLastNameChange = async (e) => {
    const inputUpper = e.target.value.toUpperCase();
    setFormData({ ...formData, last_name: inputUpper });

    const searchKey = simplify(inputUpper);

    if (searchKey.length >= 3) {
      const { data, error } = await supabase
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
    } else {
      setExistingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      last_name: formData.last_name.toUpperCase(),
      first_name: formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1).toLowerCase(),
      search_name: simplify(formData.last_name)
    };

    if (existingId) {
      const { data, error } = await supabase
        .from('employees')
        .update(dataToSave)
        .eq('id', existingId)
        .select();

      if (!error) onEmployeeSelect(data[0]);
      else alert("Erreur MAJ: " + error.message);
    } else {
      const { data, error } = await supabase
        .from('employees')
        .insert([dataToSave])
        .select();

      if (!error) onEmployeeSelect(data[0]);
      else alert("Erreur Création: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Fiche de l'Extra</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Nom de famille {existingId && "✅ (Connu)"}</label>
          <input 
            style={inputStyle} 
            value={formData.last_name} 
            onChange={handleLastNameChange} 
            placeholder="Tapez le nom..." 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Prénom</label>
            <input style={inputStyle} value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Date de Naissance</label>
            <input type="date" style={inputStyle} value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required />
          </div>
        </div>

        <label style={labelStyle}>Lieu de naissance</label>
        <input style={inputStyle} value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} placeholder="Ville (Département)" required />

        <label style={labelStyle}>Numéro de Sécurité Sociale</label>
        <input style={inputStyle} value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} placeholder="15 chiffres" required />

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="exemple@mail.com" />

        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="06..." />

        <label style={labelStyle}>Adresse</label>
        <textarea 
          style={inputStyle} 
          value={formData.address} 
          onChange={(e) => setFormData({...formData, address: e.target.value})} 
          placeholder="Rue, Code Postal, Ville"
          required
        />

        <button type="submit" style={buttonStyle}>
          Suivant : Conditions du contrat
        </button>
      </form>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', marginTop: '10px' };
const buttonStyle = { width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

export default EmployeeForm;
