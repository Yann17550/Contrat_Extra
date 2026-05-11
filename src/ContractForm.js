import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

const ContractForm = ({ employee, onPreview }) => {
  const sigCanvas = useRef({});
  const [contractData, setContractData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '23:00',
    hourly_rate_brut: "0",
    job_title: "Extra Restauration"
  });

  // Récupération du SMIC dans les réglages
  useEffect(() => {
    const fetchSmic = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'smic_horaire').single();
      if (data) setContractData(prev => ({ ...prev, hourly_rate_brut: data.value.toString().replace('.', ',') }));
    };
    fetchSmic();
  }, []);

  // Calcul du montant brut pour affichage et export
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
    if (sigCanvas.current.isEmpty()) {
      alert("La signature est obligatoire.");
      return;
    }
    
    // On génère l'image de la signature
    const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    
    // On prépare l'objet complet pour l'aperçu
    const finalContract = {
      ...contractData,
      total_amount: calculateTotal(),
      signature_image: signatureImage,
      // On garde le format pour shift_end
      shift_end: `${contractData.end_date} ${contractData.end_time}:00`,
      signed_at: new Date().toISOString()
    };

    // On passe les données au composant parent (App.js) pour affichage du contrat type
    onPreview(finalContract);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
      <h2 style={{ textAlign: 'center' }}>Contrat de Travail</h2>
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

      <label style={labelStyle}>Signature de l'employé</label>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', backgroundColor: '#fff' }}>
        <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{ width: 450, height: 180, className: 'sigCanvas' }} />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => sigCanvas.current.clear()} style={{ ...buttonStyle, backgroundColor: '#e74c3c', flex: 1 }}>Effacer</button>
        <button onClick={handleSubmit} style={{ ...buttonStyle, flex: 2 }}>Voir l'aperçu du contrat</button>
      </div>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const inputSmall = { display: 'block', width: '100%', marginBottom: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { padding: '15px', color: 'white', backgroundColor: '#27ae60', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ContractForm;
