import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  const parapheCanvas = useRef({});
  const signatureCanvas = useRef({});
  const [isParaphed, setIsParaphed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formattage de la date pour l'affichage écran uniquement
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const handleFinalSubmit = async () => {
    // Blocage de sécurité si les conditions ne sont pas remplies
    if (!isParaphed) {
      alert("Veuillez apposer votre paraphe (initiales) dans la zone bleue avant de signer.");
      return;
    }

    if (signatureCanvas.current.isEmpty()) {
      alert("La signature finale est obligatoire pour valider le contrat.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Récupération de l'adresse IP depuis le code (Client-side)
      let userIp = "0.0.0.0";
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          userIp = ipData.ip;
        }
      } catch (e) {
        console.warn("Échec récupération IP, utilisation du fallback.");
      }

      // 2. Préparation de l'heure locale exacte (Format YYYY-MM-DD HH:mm:ss)
      // On force le format ISO local pour éviter le décalage UTC de Supabase
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const signedAtLocal = (new Date(now - offset)).toISOString().replace('T', ' ').split('.')[0];

      // 3. Préparation des cellules de shift (Format strict YYYY-MM-DD HH:mm:ss)
      // On envoie le résultat complet de la cellule depuis le code
      const shiftStartFull = `${contract.start_date} ${contract.start_time}:00`;
      const shiftEndFull = `${contract.end_date} ${contract.end_time}:00`;

      // 4. Capture de l'image de signature
      const signatureImage = signatureCanvas.current.getTrimmedCanvas().toDataURL('image/png');

      // 5. Envoi du payload complet à Supabase
      const { data, error } = await supabase.from('contracts').insert([{
        employee_id: employee.id,
        contract_date: contract.start_date,
        job_title: contract.job_title,
        hourly_rate_brut: parseFloat(contract.hourly_rate_brut.replace(',', '.')),
        shift_start: shiftStartFull, // Résultat de cellule envoyé depuis le code
        shift_end: shiftEndFull,     // Résultat de cellule envoyé depuis le code
        signature_image: signatureImage,
        signed_at: signedAtLocal,     // Heure locale envoyée depuis le code
        ip_address: userIp           // IP envoyée depuis le code
      }]).select();

      if (error) {
        console.error("Détails de l'erreur Supabase :", error);
        alert(`Erreur lors de l'enregistrement : ${error.message}`);
        setIsSubmitting(false);
      } else {
        alert("Contrat enregistré avec succès (IP et Heure locale validées) !");
        onConfirm();
      }
    } catch (err) {
      console.error("Erreur système lors de la soumission :", err);
      alert("Une erreur imprévue est survenue.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>LECTURE ET SIGNATURE DU CONTRAT</h2>
      
      <div style={scrollBox}>
        <section style={sectionStyle}>
          <p><strong>ARTICLE 1 - PARTIES :</strong></p>
          <p>L'établissement [NOM DE L'ETABLISSEMENT] d'une part,</p>
          <p>Et M./Mme <strong>{employee.last_name} {employee.first_name}</strong>,<br/>
          Né(e) le {formatDate(employee.birth_date)} à {employee.birth_place},<br/>
          Demeurant au <strong>{employee.address}</strong>,<br/>
          Numéro de Sécurité Sociale : {employee.ssn}.</p>
          <p>Email : {employee.email || 'Non renseigné'} | Tél : {employee.phone || 'Non renseigné'}</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 2 - MISSION :</strong></p>
          <p>Le salarié est engagé en qualité de <strong>{contract.job_title}</strong>.</p>
          <p>La mission débutera le <strong>{formatDate(contract.start_date)}</strong> à <strong>{contract.start_time}</strong>.<br/>
          Elle se terminera le <strong>{formatDate(contract.end_date)}</strong> à <strong>{contract.end_time}</strong>.</p>
        </section>

        {/* ZONE DE PARAPHE - OBLIGATOIRE POUR DEBLOQUER LA SUITE */}
        <div style={parapheContainer}>
          <p style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Paraphe (Initiales) dans cette zone bleue :</p>
          <div style={canvasBorder}>
            <SignatureCanvas 
              ref={parapheCanvas} 
              penColor='blue' 
              canvasProps={{ width: 150, height: 60, className: 'parapheCanvas' }} 
              onEnd={() => setIsParaphed(true)}
            />
          </div>
          <button 
            onClick={() => { parapheCanvas.current.clear(); setIsParaphed(false); }} 
            style={miniBtn}
          >
            Effacer paraphe
          </button>
        </div>

        <section style={sectionStyle}>
          <p><strong>ARTICLE 3 - RÉMUNÉRATION :</strong></p>
          <p>Le taux horaire brut est fixé à {contract.hourly_rate_brut} €.<br/>
          Pour la durée prévue, le montant total brut estimé est de : <strong>{contract.total_amount} €</strong>.</p>
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
        <button 
          onClick={onBack} 
          disabled={isSubmitting} 
          style={backBtn}
        >
          Retour aux conditions
        </button>
        <button 
          onClick={handleFinalSubmit} 
          disabled={!isParaphed || isSubmitting} 
          style={{ ...submitBtn, opacity: isParaphed ? 1 : 0.5 }}
        >
          {isSubmitting ? "Enregistrement en cours..." : "Officialiser le contrat"}
        </button>
      </div>
    </div>
  );
};

// --- STYLES (Conservés intégralement sans simplification) ---
const containerStyle = { maxWidth: '600px', margin: 'auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' };
const headerStyle = { textAlign: 'center', fontSize: '18px', textDecoration: 'underline', marginBottom: '15px', color: '#2c3e50' };
const scrollBox = { height: '450px', overflowY: 'scroll', border: '1px solid #eee', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' };
const sectionStyle = { marginBottom: '20px', fontSize: '14px', lineHeight: '1.5', color: '#34495e' };
const parapheContainer = { textAlign: 'right', marginBottom: '20px', padding: '10px', border: '1px dashed #3498db', backgroundColor: '#ebf5fb', borderRadius: '4px' };
const signatureContainer = { marginTop: '30px', padding: '15px', border: '1px solid #2c3e50', backgroundColor: '#fff', borderRadius: '4px' };
const canvasBorder = { border: '1px solid #ddd', display: 'inline-block', backgroundColor: '#fff' };
const miniBtn = { fontSize: '10px', display: 'block', marginLeft: 'auto', marginTop: '5px', cursor: 'pointer', color: '#e74c3c', background: 'none', border: 'none', textDecoration: 'underline' };
const footerActions = { display: 'flex', gap: '10px', marginTop: '20px' };
const submitBtn = { flex: 2, padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const backBtn = { flex: 1, padding: '15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'normal' };

export default ContractPreview;
