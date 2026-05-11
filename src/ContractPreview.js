import React from 'react';

const ContractPreview = ({ employee, contract, onConfirm, onBack }) => {
  // Formatage de la date pour le contrat
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR');

  return (
    <div style={previewContainer}>
      <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        CONTRAT DE TEST - APERÇU
      </h2>

      <div style={contractBody}>
        <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
        <p>L'établissement <strong>[NOM DE VOTRE RESTAURANT]</strong> d'une part,</p>
        <p>Et M./Mme <strong>{employee.last_name} {employee.first_name}</strong>,</p>
        <p>Né(e) le <strong>{formatDate(employee.birth_date)}</strong> à <strong>{employee.birth_place}</strong>,<br/>
        Demeurant au <strong>{employee.address || "[Adresse non renseignée]"}</strong>,<br/>
        Numéro de Sécurité Sociale : <strong>{employee.ssn}</strong>.</p>

        <hr />

        <p><strong>OBJET :</strong></p>
        <p>Le présent contrat est conclu pour la mission suivante : <strong>{contract.job_title}</strong>.</p>
        <p>La prestation débutera le <strong>{formatDate(contract.start_date)}</strong> à <strong>{contract.start_time}</strong> 
        et se terminera le <strong>{formatDate(contract.end_date)}</strong> à <strong>{contract.end_time}</strong>.</p>

        <p><strong>RÉMUNÉRATION :</strong></p>
        <p>Le salarié percevra une rémunération horaire brute de <strong>{contract.hourly_rate_brut} €</strong>.<br/>
        Le montant total brut estimé pour cette mission est de <strong>{contract.total_amount} €</strong>.</p>

        <div style={signatureBox}>
          <p><strong>Signature de l'employé :</strong></p>
          <img src={contract.signature_image} alt="Signature" style={{ maxWidth: '200px', border: '1px solid #eee' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={onBack} style={{ ...buttonStyle, backgroundColor: '#95a5a6' }}>Modifier</button>
        <button onClick={onConfirm} style={buttonStyle}>Valider et Envoyer</button>
      </div>
    </div>
  );
};

const previewContainer = { maxWidth: '600px', margin: '20px auto', padding: '30px', backgroundColor: '#fff', border: '1px solid #000', fontFamily: 'serif', lineHeight: '1.6' };
const contractBody = { marginTop: '20px', fontSize: '14px' };
const signatureBox = { marginTop: '30px', textAlign: 'right' };
const buttonStyle = { flex: 1, padding: '12px', color: 'white', backgroundColor: '#27ae60', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ContractPreview;
