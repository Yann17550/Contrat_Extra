import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from './supabaseClient';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  const parapheCanvas = useRef({});
  const signatureCanvas = useRef({});
  const [isParaphed, setIsParaphed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const handleFinalSubmit = async () => {
    if (!isParaphed) {
      alert("Veuillez apposer votre paraphe avant de signer.");
      return;
    }
    if (signatureCanvas.current.isEmpty()) {
      alert("La signature est obligatoire.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Récupération de l'IP
      let userIp = "0.0.0.0";
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) { console.warn("IP non dispo"); }

      // 2. Préparation des dates et images
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const signedAtLocal = (new Date(now - offset)).toISOString().replace('T', ' ').split('.')[0];
      const shiftStartFull = `${contract.start_date} ${contract.start_time}:00`;
      const shiftEndFull = `${contract.end_date} ${contract.end_time}:00`;
      
      const signatureImage = signatureCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const parapheImage = parapheCanvas.current.getTrimmedCanvas().toDataURL('image/png');

      // 3. Enregistrement Supabase
      const { error: dbError } = await supabase.from('contracts').insert([{
        employee_id: employee.id,
        contract_date: contract.start_date,
        job_title: contract.job_title,
        hourly_rate_brut: parseFloat(contract.hourly_rate_brut.replace(',', '.')),
        shift_start: shiftStartFull,
        shift_end: shiftEndFull,
        signature_image: signatureImage,
        signed_at: signedAtLocal,
        ip_address: userIp
      }]);

      if (dbError) throw dbError;

      // 4. Génération du PDF en mémoire (via le script chargé dans index.html)
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("CONTRAT DE TRAVAIL (EXTRA)", 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Employé : ${employee.first_name} ${employee.last_name}`, 20, 40);
      doc.text(`SSN : ${employee.ssn}`, 20, 45);
      doc.text(`Adresse : ${employee.address}`, 20, 50);
      doc.text(`Poste : ${contract.job_title}`, 20, 60);
      doc.text(`Début : ${shiftStartFull}`, 20, 65);
      doc.text(`Fin : ${shiftEndFull}`, 20, 70);
      doc.text(`Rémunération : ${contract.hourly_rate_brut} Euros/h brut`, 20, 80);
      doc.text(`Total estimé : ${contract.total_amount} Euros`, 20, 85);
      
      doc.text("Paraphe :", 150, 90);
      doc.addImage(parapheImage, 'PNG', 150, 95, 20, 10);
      
      doc.text("Signature :", 20, 110);
      doc.addImage(signatureImage, 'PNG', 20, 115, 50, 25);
      doc.text(`Signé le : ${signedAtLocal} (IP: ${userIp})`, 20, 150);

      // Conversion du PDF en Base64 pour l'envoi
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // 5. Appel de la Edge Function pour l'envoi d'email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contract-email', {
        body: {
          employeeEmail: employee.email,
          myEmail: "oleron.pizza@gmail.com", // Ton email de gestion
          employeeName: `${employee.first_name} ${employee.last_name}`,
          pdfBase64: pdfBase64,
          fileName: `Contrat_${employee.last_name}_${contract.start_date}.pdf`
        }
      });

      if (emailError) {
        console.error("Erreur Email:", emailError);
        alert("Contrat enregistré, mais l'envoi de l'email a échoué.");
      } else {
        alert("Contrat validé, enregistré et envoyé par email !");
      }

      onConfirm();

    } catch (err) {
      console.error(err);
      alert("Erreur critique : " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>LECTURE ET SIGNATURE</h2>
      <div style={scrollBox}>
        <section style={sectionStyle}>
          <p><strong>EMPLOYÉ :</strong> {employee.last_name} {employee.first_name}</p>
          <p>Né(e) le {formatDate(employee.birth_date)} à {employee.birth_place}</p>
          <p>Demeurant : {employee.address}</p>
          <p>SSN : {employee.ssn}</p>
        </section>

        <section style={sectionStyle}>
          <p><strong>MISSION :</strong> {contract.job_title}</p>
          <p>Du {formatDate(contract.start_date)} à {contract.start_time}</p>
          <p>Au {formatDate(contract.end_date)} à {contract.end_time}</p>
          <p>Taux : {contract.hourly_rate_brut} €/h brut</p>
        </section>

        <div style={parapheContainer}>
          <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Paraphe (Initiales) :</p>
          <div style={canvasBorder}>
            <SignatureCanvas 
              ref={parapheCanvas} 
              penColor='blue' 
              canvasProps={{ width: 150, height: 60, className: 'parapheCanvas' }} 
              onEnd={() => setIsParaphed(true)}
            />
          </div>
          <button onClick={() => { parapheCanvas.current.clear(); setIsParaphed(false); }} style={miniBtn}>Effacer</button>
        </div>

        <div style={signatureContainer}>
          <p style={{ fontWeight: 'bold' }}>Signature finale :</p>
          <div style={canvasBorder}>
            <SignatureCanvas 
              ref={signatureCanvas} 
              penColor='black' 
              canvasProps={{ width: 300, height: 150, className: 'signatureCanvas' }} 
            />
          </div>
          <button onClick={() => signatureCanvas.current.clear()} style={miniBtn}>Effacer</button>
        </div>
      </div>

      <div style={footerActions}>
        <button onClick={onBack} disabled={isSubmitting} style={backBtn}>Retour</button>
        <button onClick={handleFinalSubmit} disabled={!isParaphed || isSubmitting} style={submitBtn}>
          {isSubmitting ? "Traitement..." : "Officialiser et Envoyer"}
        </button>
      </div>
    </div>
  );
};

const containerStyle = { maxWidth: '600px', margin: 'auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' };
const headerStyle = { textAlign: 'center', fontSize: '18px', textDecoration: 'underline', marginBottom: '15px' };
const scrollBox = { height: '450px', overflowY: 'scroll', border: '1px solid #eee', padding: '15px', backgroundColor: '#f9f9f9' };
const sectionStyle = { marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' };
const parapheContainer = { textAlign: 'right', marginBottom: '20px', padding: '10px', border: '1px dashed #3498db', backgroundColor: '#ebf5fb' };
const signatureContainer = { marginTop: '30px', padding: '15px', border: '1px solid #000', backgroundColor: '#fff' };
const canvasBorder = { border: '1px solid #ddd', display: 'inline-block', backgroundColor: '#fff' };
const miniBtn = { fontSize: '10px', display: 'block', marginLeft: 'auto', marginTop: '5px', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' };
const footerActions = { display: 'flex', gap: '10px', marginTop: '20px' };
const submitBtn = { flex: 2, padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const backBtn = { flex: 1, padding: '15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default ContractPreview;
