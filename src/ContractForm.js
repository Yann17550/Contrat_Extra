import React, { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    const fetchSmic = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'smic_horaire').single();
      if (data) setContractData(prev => ({ ...prev, hourly_rate_brut: data.value.toString().replace('.', ',') }));
    };
    fetchSmic();
  }, []);

  const calculateTotal = () => {
    const rate = parseFloat(contractData.hourly_rate_brut.replace(',', '.'));
    if (isNaN(rate)) return "0.00";
    const start = new Date(`${contractData.start_date}T${contractData.start_time}`);
    const end = new Date(`${contractData.end_date}T${contractData.end_time}`);
    const diffMs = end - start;
    if (diffMs <= 0) return "0.00";
    return ((diffMs / (1000 * 60 * 60)) * rate).toFixed(2);
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
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
      <h2 style={{ textAlign: 'center' }}>Conditions de la Mission</h2>
      <p style={{textAlign: 'center'}}>Extra : <strong>{employee.first_name} {employee.last_name}</strong></p>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <label style={labelStyle}>Poste occupé</label>
        <input type="text" style={inputStyle} value={contractData.job_title} onChange={(e) => setContractData({...contractData, job_title: e.target.value})} />

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Début (Date/Heure)</label>
            <input type="date" style={inputSmall} value={contractData.start_date} onChange={(e) => setContractData({...contractData, start_date: e.target.value})} />
            <input type="time" style={inputSmall} value={contractData.start_time} onChange={(e) => setContractData({...contractData, start_time: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fin (Date/Heure)</label>
            <input type="date" style={inputSmall} value={contractData.end_date} onChange={(e) => setContractData({...contractData, end_date: e.target.value})} />
            <input type="time" style={inputSmall} value={contractData.end_time} onChange={(e) => setContractData({...contractData, end_time: e.target.value})} />
          </div>
        </div>

        <label style={labelStyle}>Taux horaire brut (€)</label>
        <input type="text" inputMode="decimal" style={inputStyle} value={contractData.hourly_rate_brut} onKeyDown={handleKeyDown} onChange={(e) => setContractData({...contractData, hourly_rate_brut: e.target.value.replace('.', ',')})} />

        <div style={{ marginTop: '10px', fontSize: '1.1em', fontWeight: 'bold', color: '#2ecc71', textAlign: 'right' }}>
          Total Brut Estimé : {calculateTotal()} €
        </div>
      </div>

      <button onClick={handleSubmit} style={buttonStyle}>
        Générer le contrat pour lecture
      </button>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const inputSmall = { display: 'block', width: '100%', marginBottom: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { width: '100%', padding: '15px', color: 'white', backgroundColor: '#3498db', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ContractForm;
