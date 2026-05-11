import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

const ContractForm = ({ employee, onComplete }) => {
  const sigCanvas = useRef({});
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '23:00',
    hourly_rate: 0, // Sera remplacé par la valeur de la DB
  });

  // Chargement du SMIC depuis Supabase au démarrage
  useEffect(() => {
    const fetchSmic = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'smic_horaire')
        .single();
      
      if (data) {
        setContractData(prev => ({ ...prev, hourly_rate: data.value }));
      }
    };
    fetchSmic();
  }, []);

  const calculateTotal = () => {
    const start = new Date(`2000-01-01T${contractData.start_time}`);
    const end = new Date(`2000-01-01T${contractData.end_time}`);
    if (end < start) end.setDate(end.getDate() + 1);
    
    const hours = (end - start) / (1000 * 60 * 60);
    return (hours * contractData.hourly_rate).toFixed(2);
  };

  const handleSubmit = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Signature obligatoire.");
      return;
    }
    setLoading(true);
    const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const { error } = await supabase.from('contracts').insert([{
      employee_id: employee.id,
      work_date: contractData.work_date,
      start_time: contractData.start_time,
      end_time: contractData.end_time,
      hourly_rate: contractData.hourly_rate,
      total_amount: calculateTotal(),
      signature_image: signatureImage,
      status: 'signed'
    }]);

    if (!error) {
      alert("Contrat enregistré !");
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
      <h2 style={{ textAlign: 'center' }}>Contrat de Travail</h2>
      <p style={{textAlign: 'center', color: '#666'}}>Employé : <strong>{employee.first_name} {employee.last_name}</strong></p>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <label style={labelStyle}>Date du travail</label>
        <input type="date" style={inputStyle} value={contractData.work_date} onChange={(e) => setContractData({...contractData, work_date: e.target.value})} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Heure de début</label>
            <input type="time" style={inputStyle} value={contractData.start_time} onChange={(e) => setContractData({...contractData, start_time: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Heure de fin</label>
            <input type="time" style={inputStyle} value={contractData.end_time} onChange={(e) => setContractData({...contractData, end_time: e.target.value})} />
          </div>
        </div>

        <label style={labelStyle}>Taux horaire brut (€)</label>
        <input type="number" step="0.01" style={inputStyle} value={contractData.hourly_rate} onChange={(e) => setContractData({...contractData, hourly_rate: parseFloat(e.target.value)})} />

        <div style={{ marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold', color: '#2ecc71', textAlign: 'right' }}>
          Total Brut : {calculateTotal()} €
        </div>
      </div>

      <label style={labelStyle}>Signature de l'employé</label>
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', backgroundColor: '#fff' }}>
        <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{ width: 450, height: 180, className: 'sigCanvas' }} />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => sigCanvas.current.clear()} style={{ ...buttonStyle, backgroundColor: '#e74c3c', flex: 1 }}>Effacer</button>
        <button onClick={handleSubmit} disabled={loading} style={{ ...buttonStyle, flex: 2 }}>
          {loading ? "Chargement..." : "Signer le contrat"}
        </button>
      </div>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' };
const buttonStyle = { padding: '15px', color: 'white', backgroundColor: '#27ae60', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ContractForm;
