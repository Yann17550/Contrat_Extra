import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  const parapheCanvas = useRef({});
  const signatureCanvas = useRef({});
  const [isParaphed, setIsParaphed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    if (!isParaphed) {
      alert("Veuillez apposer votre paraphe (initiales) avant de signer.");
      return;
    }

    if (signatureCanvas.current.isEmpty()) {
      alert("La signature finale est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    const signatureImage = signatureCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const { error } = await supabase.from('contracts').insert([{
      employee_id: employee.id,
      contract_date: contract.start_date,
      job_title: contract.job_title,
      hourly_rate_brut: parseFloat(contract.hourly_rate_brut.replace(',', '.')),
      shift_end: contract.shift_end,
      signature_image: signatureImage,
      signed_at: new Date().toISOString()
    }]);

    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
      setIsSubmitting(false);
    } else {
      alert("Contrat officialisé avec succès !");
      onConfirm();
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>LECTURE ET SIGNATURE DU CONTRAT</h2>
      
      <div style={scrollBox}>
        <section style={sectionStyle}>
          <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
          <p>L'établissement [NOM] et M./Mme <strong>{employee.last_name} {employee.first_name}</strong>.</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 1 - MISSION :</strong></p>
          <p>Le salarié est engagé en qualité de {contract.job_title} du {contract.start_date} au {contract.end_date}.</p>
        </section>

        {/* ZONE DE PARAPHE */}
        <div style={parapheContainer}>
          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Paraphe (Initiales) :</p>
          <div style={canvasBorder}>
            <SignatureCanvas 
              ref={parapheCanvas} 
              penColor='blue' 
              canvasProps={{ width: 150, height: 60, className: 'parapheCanvas' }} 
              onEnd={() => setIsParaphed(true)}
            />
          </div>
          <button onClick={() => { parapheCanvas.current.clear(); setIsParaphed(false); }} style={miniBtn}>Effacer paraphe</button>
        </div>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 2 - RÉMUNÉRATION :</strong></p>
          <p>Taux horaire brut : {contract.hourly_rate_brut} €. Total estimé : {contract.total_amount} €.</p>
        </section>

        {/* ZONE DE SIGNATURE FINALE */}
        <div style={signatureContainer}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Signature finale du salarié :</p>
          <div style={canvasBorder}>
            <SignatureCanvas 
              ref={signatureCanvas} 
              penColor='black' 
              canvasProps={{ width: 300, height: 150, className: 'signatureCanvas' }} 
            />
          </div>
          <button onClick={() => signatureCanvas.current.clear()} style={miniBtn}>Effacer signature</button>
        </div>
      </div>

      <div style={footerActions}>
        <button onClick={onBack} disabled={isSubmitting} style={backBtn}>Retour aux réglages</button>
        <button 
          onClick={handleFinalSubmit} 
          disabled={!isParaphed || isSubmitting} 
          style={{ ...submitBtn, opacity: isParaphed ? 1 : 0.5 }}
        >
          {isSubmitting ? "Enregistrement..." : "Officialiser le contrat"}
        </button>
      </div>
    </div>
  );
};

const containerStyle = { maxWidth: '600px', margin: 'auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' };
const headerStyle = { textAlign: 'center', fontSize: '18px', textDecoration: 'underline', marginBottom: '15px' };
const scrollBox = { height: '450px', overflowY: 'scroll', border: '1px solid #eee', padding: '15px', backgroundColor: '#f9f9f9' };
const sectionStyle = { marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' };
const parapheContainer = { textAlign: 'right', marginBottom: '20px', padding: '10px', border: '1px dashed #3498db' };
const signatureContainer = { marginTop: '30px', padding: '15px', border: '1px solid #000', backgroundColor: '#fff' };
const canvasBorder = { border: '1px solid #ddd', display: 'inline-block', backgroundColor: '#fff' };
const miniBtn = { fontSize: '10px', display: 'block', marginLeft: 'auto', marginTop: '5px', cursor: 'pointer' };
const footerActions = { display: 'flex', gap: '10px', marginTop: '20px' };
const submitBtn = { flex: 2, padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const backBtn = { flex: 1, padding: '15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default ContractPreview;
