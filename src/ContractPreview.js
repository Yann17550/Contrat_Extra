import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ContractForm = ({ employee, onPreview }) => {
  const [isNet, setIsNet] = useState(false); // État pour le switch Brut/Net
  const [contractData, setContractData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '23:00',
    hourly_rate: "0", 
    job_title: "Extra Restauration"
  });

  useEffect(() => {
    const fetchSmic = async () => {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'smic_horaire').single();
        if (data) {
          setContractData(prev => ({ ...prev, hourly_rate: data.value.toString().replace('.', ',') }));
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du SMIC");
      }
    };
    fetchSmic();
  }, []);

  // Fonction de calcul du taux brut final
  const getFinalBrutRate = () => {
    const value = parseFloat(contractData.hourly_rate.replace(',', '.'));
    if (isNaN(value)) return 0;
    // Si l'utilisateur a sélectionné NET, on convertit en BRUT (base 20% charges)
    return isNet ? (value / 0.80) : value;
  };

  const calculateTotal = () => {
    const rate = getFinalBrutRate();
    const start = new Date(`${contractData.start_date}T${contractData.start_time}`);
    const end = new Date(`${contractData.end_date}T${contractData.end_time}`);
    const diffMs = end - start;
    if (diffMs <= 0) return "0.00";
    return ((diffMs / (1000 * 60 * 60)) * rate).toFixed(2);
  };

  const handleKeyDown = (e) => {
    if (e.key === '.' || e.key === ',') {
      e.preventDefault();
      if (!contractData.hourly_rate.includes(',')) {
        setContractData({ ...contractData, hourly_rate: contractData.hourly_rate + ',' });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. VERIFICATION : L'heure de début ne peut pas être inférieure à maintenant
    const now = new Date();
    const selectedStart = new Date(`${contractData.start_date}T${contractData.start_time}`);

    if (selectedStart < now) {
      alert("Erreur : La mission ne peut pas commencer dans le passé. Veuillez corriger l'heure ou la date de début.");
      return;
    }

    const brutRate = getFinalBrutRate();
    const total = calculateTotal();

    if (parseFloat(total) <= 0) {
      alert("Veuillez vérifier les horaires : la fin doit être après le début.");
      return;
    }

    // 2. ENVOI : On envoie le taux BRUT au composant suivant (le PDF affichera donc le brut)
    onPreview({
      ...contractData,
      hourly_rate_brut: brutRate.toFixed(2).replace('.', ','),
      total_amount: total,
      shift_end: `${contractData.end_date} ${contractData.end_time}:00`
    });
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Conditions de la Mission</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>Salarié : <strong>{employee.first_name} {employee.last_name}</strong></p>

      <div style={formCard}>
        <label style={labelStyle}>Poste occupé</label>
        <input 
          type="text" 
          style={inputStyle} 
          value={contractData.job_title} 
          onChange={(e) => setContractData({...contractData, job_title: e.target.value})} 
        />

        <div style={rowStyle}>
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

        <label style={labelStyle}>Rémunération (€)</label>
        {/* SWITCH BRUT / NET */}
        <div style={switchContainer}>
          <button 
            type="button" 
            onClick={() => setIsNet(false)} 
            style={!isNet ? switchBtnActive : switchBtnInactive}
          >BRUT</button>
          <button 
            type="button" 
            onClick={() => setIsNet(true)} 
            style={isNet ? switchBtnActive : switchBtnInactive}
          >NET</button>
        </div>

        <input 
          type="text" 
          inputMode="decimal" 
          style={inputStyle} 
          value={contractData.hourly_rate} 
          onKeyDown={handleKeyDown} 
          onChange={(e) => setContractData({...contractData, hourly_rate: e.target.value.replace('.', ',')})} 
        />

        <div style={totalBox}>
          Total Brut Estimé : {calculateTotal()} €
        </div>
      </div>

      <button onClick={handleSubmit} style={buttonStyle}>
        Générer le contrat pour lecture
      </button>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' };
const formCard = { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' };
const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' };
const inputSmall = { display: 'block', width: '100%', marginBottom: '5px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#34495e' };
const rowStyle = { display: 'flex', gap: '10px', marginBottom: '10px' };
const totalBox = { marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold', color: '#27ae60', textAlign: 'right' };
const buttonStyle = { width: '100%', padding: '16px', color: 'white', backgroundColor: '#3498db', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

const switchContainer = { display: 'flex', marginBottom: '10px', gap: '2px', backgroundColor: '#eee', padding: '2px', borderRadius: '4px' };
const switchBtnActive = { flex: 1, padding: '8px', border: 'none', backgroundColor: '#3498db', color: 'white', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const switchBtnInactive = { flex: 1, padding: '8px', border: 'none', backgroundColor: 'transparent', color: '#7f8c8d', cursor: 'pointer', fontSize: '12px' };

export default ContractForm;
