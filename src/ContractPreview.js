import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas'; // Import du canvas
import { supabase } from './supabaseClient';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  const parapheCanvas = useRef({}); // Référence pour le canvas de paraphe
  const [isParaphed, setIsParaphed] = useState(false); // État pour savoir si le paraphe est apposé
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR');

  // Fonction pour valider le paraphe (l'extra dessine et clique sur "Valider Paraphe")
  const validateParaphe = () => {
    if (parapheCanvas.current.isEmpty()) {
      alert("Veuillez dessiner vos initiales dans la zone de paraphe.");
      setParaphed(false);
      return;
    }
    // Optionnel : On pourrait stocker l'image du paraphe ici si nécessaire
    // const parapheImage = parapheCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setIsParaphed(true);
  };

  // Fonction pour effacer le paraphe et recommencer
  const clearParaphe = () => {
    parapheCanvas.current.clear();
    setIsParaphed(false);
  };

  const handleFinalSubmit = async () => {
    if (!isParaphed) {
      alert("Veuillez apposer et valider votre paraphe avant d'officialiser.");
      return;
    }

    setIsSubmitting(true);
    
    // Enregistrement REEL en base de données
    const { error } = await supabase.from('contracts').insert([{
      employee_id: employee.id,
      contract_date: contract.start_date,
      job_title: contract.job_title,
      hourly_rate_brut: parseFloat(contract.hourly_rate_brut.replace(',', '.')),
      shift_end: contract.shift_end,
      signature_image: contract.signature_image,
      signed_at: contract.signed_at,
      // Note : On pourrait ajouter une colonne 'paraphe_image' dans la DB 
      // si vous souhaitez stocker le dessin des initiales.
    }]);

    if (error) {
      alert("Erreur lors de l'officialisation : " + error.message);
      setIsSubmitting(false);
    } else {
      alert("Contrat officiel enregistré !");
      onConfirm();
    }
  };

  return (
    <div style={previewContainer}>
      <h2 style={headerStyle}>LECTURE ET OFFICIALISATION</h2>
      <p style={{textAlign: 'center', fontSize: '13px', color: '#666'}}>
        Veuillez lire le contrat, apposer vos initiales dans la zone "Paraphe" ci-dessous, puis valider.
      </p>

      <div style={scrollBox}>
        <section style={sectionStyle}>
          <p><strong>ARTICLE 1 - OBJET</strong></p>
          <p>Engagement de M./Mme <strong>{employee.last_name} {employee.first_name}</strong> en qualité de <strong>{contract.job_title}</strong>.</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 2 - DURÉE ET RÉMUNÉRATION</strong></p>
          <p>Mission du {formatDate(contract.start_date)} au {formatDate(contract.end_date)}.<br/>
          Rémunération horaire brute : {contract.hourly_rate_brut} €.</p>
        </section>

        {/* --- ZONE DE PARAPHE DESSINABLE --- */}
        <div style={parapheSection}>
          <p style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '5px'}}>
            Zone de Paraphe (Initiales) {isParaphed && "✅"}
          </p>
          <div style={canvasWrapper}>
            <SignatureCanvas 
              ref={parapheCanvas} 
              penColor='blue' // Pen bleu pour différencier de la signature
              canvasProps={{ width: 150, height: 60, className: 'parapheCanvas' }} 
              onEnd={() => setIsParaphed(false)} // Si on redessine, il faut re-valider
            />
          </div>
          <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
            <button onClick={clearParaphe} style={smallBtnBack}>Effacer</button>
            <button onClick={validateParaphe} style={smallBtnConfirm}>Valider Paraphe</button>
          </div>
        </div>
        {/* ---------------------------------- */}

        <div style={signatureDisplay}>
          <p>Signature de l'employé :</p>
          <img src={contract.signature_image} alt="Signature finale" style={{ width: '150px' }} />
        </div>
      </div>

      <div style={actionZone}>
        <button onClick={onBack} disabled={isSubmitting} style={backBtn}>Modifier</button>
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

// Styles
const previewContainer = { maxWidth: '600px', margin: 'auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' };
const headerStyle = { textAlign: 'center', fontSize: '20px', color: '#2c3e50', textDecoration: 'underline' };
const scrollBox = { height: '450px', overflowY: 'scroll', backgroundColor: '#fdfdfd', padding: '20px', border: '1px solid #ddd', marginBottom: '20px', borderRadius: '4px' };
const sectionStyle = { borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '10px', fontSize: '14px', lineHeight: '1.5' };

// Styles Spécifiques Paraphe
const parapheSection = { marginTop: '20px', padding: '10px', border: '1px solid #e74c3c', backgroundColor: '#fff5f5', borderRadius: '4px', textAlign: 'center' };
const canvasWrapper = { border: '1px solid #ccc', display: 'inline-block', backgroundColor: '#fff', cursor: 'crosshair' };
const smallBtnConfirm = { padding: '5px 10px', fontSize: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const smallBtnBack = { padding: '5px 10px', fontSize: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };

const signatureDisplay = { marginTop: '30px', textAlign: 'right', borderTop: '2px solid #333', paddingTop: '10px' };
const actionZone = { display: 'flex', gap: '10px' };
const submitBtn = { flex: 2, padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const backBtn = { flex: 1, padding: '15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default ContractPreview;
