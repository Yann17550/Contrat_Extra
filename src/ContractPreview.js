import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  const [paraphed, setParaphed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR');

  const handleFinalSubmit = async () => {
    if (!paraphed) {
      alert("Veuillez apposer votre paraphe sur le contrat avant de valider.");
      return;
    }

    setIsSubmitting(true);
    
    // C'est ici que l'enregistrement REEL en base de données se fait
    const { error } = await supabase.from('contracts').insert([{
      employee_id: employee.id,
      contract_date: contract.start_date,
      job_title: contract.job_title,
      hourly_rate_brut: parseFloat(contract.hourly_rate_brut.replace(',', '.')),
      shift_end: contract.shift_end,
      signature_image: contract.signature_image,
      signed_at: contract.signed_at,
      // On peut ajouter une colonne 'paraphe_confirmed' si besoin dans votre table
    }]);

    if (error) {
      alert("Erreur lors de l'officialisation : " + error.message);
      setIsSubmitting(false);
    } else {
      onConfirm(); // Retour à l'accueil via App.js
    }
  };

  return (
    <div style={previewContainer}>
      <h2 style={headerStyle}>CONTRAT DE TRAVAIL</h2>

      <div style={scrollBox}>
        <section style={sectionStyle}>
          <p><strong>ARTICLE 1 - PARTIES</strong></p>
          <p>Entre l'établissement et M./Mme <strong>{employee.last_name} {employee.first_name}</strong>.</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 2 - MISSION</strong></p>
          <p>Le salarié est engagé en qualité de <strong>{contract.job_title}</strong> le <strong>{formatDate(contract.start_date)}</strong>.</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 3 - RÉMUNÉRATION</strong></p>
          <p>Taux horaire : {contract.hourly_rate_brut} € brut. Total estimé : {contract.total_amount} €.</p>
          
          {/* Zone de Paraphe */}
          <div onClick={() => setParaphed(true)} style={parapheZone}>
            {paraphed ? 
              <span style={{color: 'blue', fontStyle: 'italic', fontWeight: 'bold'}}>Paraphé : {employee.first_name[0]}{employee.last_name[0]}</span> : 
              <span style={{color: '#e74c3c'}}>Cliquez ici pour parapher cette page</span>
            }
          </div>
        </section>

        <div style={signatureDisplay}>
          <p>Signature apposée :</p>
          <img src={contract.signature_image} alt="Signature" style={{ width: '150px' }} />
        </div>
      </div>

      <div style={actionZone}>
        <button onClick={onBack} disabled={isSubmitting} style={backBtn}>Modifier les infos</button>
        <button 
          onClick={handleFinalSubmit} 
          disabled={!paraphed || isSubmitting} 
          style={{ ...submitBtn, opacity: paraphed ? 1 : 0.5 }}
        >
          {isSubmitting ? "Enregistrement..." : "Officialiser et Enregistrer le contrat"}
        </button>
      </div>
    </div>
  );
};

// Styles
const previewContainer = { maxWidth: '600px', margin: 'auto', padding: '20px', backgroundColor: '#f4f4f4', border: '1px solid #ccc' };
const headerStyle = { textAlign: 'center', fontSize: '18px', textDecoration: 'underline' };
const scrollBox = { height: '400px', overflowY: 'scroll', backgroundColor: '#fff', padding: '20px', border: '1px solid #ddd', marginBottom: '20px' };
const sectionStyle = { borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '10px' };
const parapheZone = { border: '2px dashed #ccc', padding: '10px', textAlign: 'right', cursor: 'pointer', fontSize: '12px' };
const signatureDisplay = { marginTop: '20px', textAlign: 'right', borderTop: '1px solid #000', paddingTop: '10px' };
const actionZone = { display: 'flex', gap: '10px' };
const submitBtn = { flex: 2, padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const backBtn = { flex: 1, padding: '15px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default ContractPreview;
