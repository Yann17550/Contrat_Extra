import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ContractForm = ({ employee, onPreview }) => {
  const [contractData, setContractData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '23:00',
    hourly_rate_brut: "0",
    job_title: "Extra Restauration"
  });

  // Récupération du SMIC depuis la table settings
  useEffect(() => {
    const fetchSmic = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'smic_horaire')
        .single();
      
      if (data) {
        setContractData(prev => ({ 
          ...prev, 
          hourly_rate_brut: data.value.toString().replace('.', ',') 
        }));
      }
    };
    fetchSmic();
  }, []);

  // Calcul du montant brut estimé
  const calculateTotal = () => {
    const rate = parseFloat(contractData.hourly_rate_brut.replace(',', '.'));
    if (isNaN(rate)) return "0.00";
    
    const start = new Date(`${contractData.start_date}T${contractData.start_time}`);
    const end = new Date(`${contractData.end_date}T${contractData.end_time}`);
    
    const diffMs = end - start;
    if (diffMs <= 0) return "0.00";
    
    const hours = diffMs / (1000 * 60 * 60);
    return (hours * rate).toFixed(2);
  };

  const handleKeyDown = (e) => {
    if (e.key === '.' || e.key === ',') {
      e.preventDefault();
      if (!contractData.hourly_rate_brut.includes(',')) {
        setContractData({ ...contractData, hourly_rate_brut: contractData.hourly_rate_brut + ',' });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPreview({
      ...contractData,
      total_amount: calculateTotal(),
      shift_end: `${contractData.end_date} ${contractData.end_time}:00`
    });
  };

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Conditions de la Mission</h2>
      <p style={{ textAlign: 'center' }}>Salarié : <strong>{employee.first_name} {employee.last_name}</strong></p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Poste occupé</label>
        <input 
          style={inputStyle} 
          value={contractData.job_title} 
          onChange={(e) => setContractData({...contractData, job_title: e.target.value})} 
          required 
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Début (Date/Heure)</label>
            <input type="date" style={inputStyle} value={contractData.start_date} onChange={(e) => setContractData({...contractData, start_date: e.target.value})} required />
            <input type="time" style={inputStyle} value={contractData.start_time} onChange={(e) => setContractData({...contractData, start_time: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fin (Date/Heure)</label>
            <input type="date" style={inputStyle} value={contractData.end_date} onChange={(e) => setContractData({...contractData, end_date: e.target.value})} required />
            <input type="time" style={inputStyle} value={contractData.end_time} onChange={(e) => setContractData({...contractData, end_time: e.target.value})} required />
          </div>
        </div>

        <label style={labelStyle}>Taux horaire brut (€)</label>
        <input 
          style={inputStyle} 
          inputMode="decimal" 
          value={contractData.hourly_rate_brut} 
          onKeyDown={handleKeyDown} 
          onChange={(e) => setContractData({...contractData, hourly_rate_brut: e.target.value.replace('.', ',')})} 
          required 
        />

        <div style={totalContainer}>
          Total Brut Estimé : {calculateTotal()} €
        </div>

        <button type="submit" style={buttonStyle}>Générer le contrat pour lecture</button>
      </form>
    </div>
  );
};

const cardStyle = { maxWidth: '500px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' };
const titleStyle = { textAlign: 'center', marginBottom: '20px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' };
const totalContainer = { marginTop: '15px', padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60', fontSize: '1.2em' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };

export default ContractForm;
