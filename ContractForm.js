import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

/**
 * Composant pour définir les conditions du contrat et signer.
 */
const ContractForm = ({ employee, onBack }) => {
  const sigPad = useRef({});
  const [loading, setLoading] = useState(false);
  const [contractDetails, setContractDetails] = useState({
    job_title: 'Extra Restauration',
    hourly_rate_brut: '',
    shift_start: '',
    shift_end: ''
  });

  // Fonction pour tout enregistrer dans Supabase
  const saveContract = async () => {
    if (sigPad.current.isEmpty()) {
      return alert("L'employé doit signer avant de valider !");
    }

    setLoading(true);

    // 1. On récupère l'image de la signature (tracé au doigt)
    const signatureImage = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

    // 2. On prépare les données du contrat
    const contractData = {
      employee_id: employee.id,
      job_title: contractDetails.job_title,
      hourly_rate_brut: parseFloat(contractDetails.hourly_rate_brut),
      shift_start: contractDetails.shift_start,
      shift_end: contractDetails.shift_end,
      signature_image: signatureImage,
      signed_at: new Date().toISOString(), // Horodatage précis
      ip_address: "Client-side capture" // Sera affiné avec l'hébergement
    };

    // 3. Envoi vers la table 'contracts' de Supabase
    const { error } = await supabase.from('contracts').insert([contractData]);

    if (error) {
      alert("Erreur lors de la signature : " + error.message);
    } else {
      alert("Contrat signé et enregistré avec succès !");
      // Ici, on pourrait ajouter l'étape de génération du PDF
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #28a745', borderRadius: '8px' }}>
      <button onClick={onBack} style={{ marginBottom: '10px' }}>← Retour</button>
      
      <h3>Contrat pour {employee.first_name} {employee.last_name}</h3>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Sécu : {employee.ssn}</p>

      <div style={{ marginTop: '20px' }}>
        <label>Taux horaire Brut (€)</label>
        <input 
          type="number" 
          style={inputStyle} 
          onChange={(e) => setContractDetails({...contractDetails, hourly_rate_brut: e.target.value})}
        />
        
        <label>Début du shift</label>
        <input 
          type="datetime-local" 
          style={inputStyle} 
          onChange={(e) => setContractDetails({...contractDetails, shift_start: e.target.value})}
        />

        <label>Fin du shift (estimée)</label>
        <input 
          type="datetime-local" 
          style={inputStyle} 
          onChange={(e) => setContractDetails({...contractDetails, shift_end: e.target.value})}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Signature de l'employé (au doigt) :</label>
        <div style={{ border: '1px solid #000', background: '#f9f9f9', marginTop: '5px' }}>
          <SignatureCanvas 
            ref={sigPad}
            penColor='black'
            canvasProps={{ width: 460, height: 200, className: 'sigCanvas' }} 
          />
        </div>
        <button onClick={() => sigPad.current.clear()} style={{ marginTop: '5px', fontSize: '0.8em' }}>Effacer la signature</button>
      </div>

      <button 
        onClick={saveContract} 
        disabled={loading}
        style={{ ...buttonStyle, marginTop: '30px', backgroundColor: '#28a745' }}
      >
        {loading ? "Enregistrement..." : "Signer le contrat en direct"}
      </button>
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' };
const buttonStyle = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ContractForm;
