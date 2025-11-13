// Email notifications for quote revision flow
import { sendEmail, type EmailNotificationData } from "./notifications";

export async function sendArtisanQuoteRejectionNotification(
  adminEmail: string,
  artisanName: string,
  serviceType: string,
  rejectionReason: string,
  requestId: number
) {
  const subject = `⚠️ Devis rejeté par l'artisan - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Action requise - Révision de devis</p>
        </div>
        
        <div class="content">
          <h2>Devis rejeté par l'artisan</h2>
          
          <p>L'artisan <strong>${artisanName}</strong> a rejeté le devis pour la demande <strong>${serviceType}</strong> (ID: ${requestId}).</p>
          
          <div class="alert-box">
            <h3>Raison du rejet :</h3>
            <p>${rejectionReason}</p>
          </div>
          
          <p>Une révision du devis est nécessaire. Veuillez créer un nouveau devis révisé en tenant compte de la raison du rejet.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/requests/${requestId}" class="button">
              Gérer la demande
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Plateforme de services à domicile</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Devis rejeté par l'artisan
    
    L'artisan ${artisanName} a rejeté le devis pour la demande ${serviceType} (ID: ${requestId}).
    
    Raison du rejet :
    ${rejectionReason}
    
    Une révision du devis est nécessaire.
    
    Gérer la demande : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/requests/${requestId}
  `;
  
  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

export async function sendRevisedEstimateToClientNotification(
  clientEmail: string,
  clientName: string,
  serviceType: string,
  estimateAmount: number,
  revisionNumber: number,
  estimateId: number
) {
  const subject = `Devis révisé disponible (v${revisionNumber}) - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .price { font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Votre devis révisé est prêt !</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${clientName},</h2>
          
          <p>Nous avons préparé un devis révisé pour votre demande de <strong>${serviceType}</strong>.</p>
          
          <div class="alert-box">
            <p><strong>Version du devis :</strong> ${revisionNumber}</p>
            <p>Ce devis a été mis à jour suite à une réévaluation du travail nécessaire par l'artisan.</p>
          </div>
          
          <div class="price">
            Nouveau montant : ${(estimateAmount / 100).toFixed(2)} €
          </div>
          
          <p><strong>⚠️ Important :</strong> Si vous refusez ce devis révisé, votre demande sera automatiquement annulée.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/devis/${estimateId}" class="button">
              Voir le devis révisé
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Plateforme de services à domicile</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Bonjour ${clientName},
    
    Nous avons préparé un devis révisé pour votre demande de ${serviceType}.
    
    Version du devis : ${revisionNumber}
    Nouveau montant : ${(estimateAmount / 100).toFixed(2)} €
    
    ⚠️ Important : Si vous refusez ce devis révisé, votre demande sera automatiquement annulée.
    
    Voir le devis révisé : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/devis/${estimateId}
  `;
  
  return sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}

export async function sendRevisedEstimateAcceptedNotification(
  artisanEmail: string,
  artisanName: string,
  serviceType: string,
  estimateAmount: number,
  requestId: number
) {
  const subject = `Devis révisé accepté - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-box { background: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Le client a accepté le devis révisé</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${artisanName},</h2>
          
          <p>Le client a accepté le devis révisé pour la demande <strong>${serviceType}</strong>.</p>
          
          <div class="alert-box">
            <p><strong>Montant du devis :</strong> ${(estimateAmount / 100).toFixed(2)} €</p>
            <p>Veuillez confirmer que vous acceptez toujours cette mission avec le nouveau montant.</p>
          </div>
          
          <p><strong>Note :</strong> Si vous ne souhaitez plus réaliser cette mission, vous pouvez la refuser. La demande sera alors proposée à d'autres artisans.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/jobs/${requestId}" class="button">
              Gérer la mission
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Plateforme de services à domicile</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Bonjour ${artisanName},
    
    Le client a accepté le devis révisé pour la demande ${serviceType}.
    
    Montant du devis : ${(estimateAmount / 100).toFixed(2)} €
    
    Veuillez confirmer que vous acceptez toujours cette mission.
    
    Gérer la mission : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/jobs/${requestId}
  `;
  
  return sendEmail({
    to: artisanEmail,
    subject,
    html,
    text,
  });
}

export async function sendRevisedEstimateRejectedNotification(
  adminEmail: string,
  artisanEmail: string,
  clientName: string,
  artisanName: string,
  serviceType: string,
  requestId: number
) {
  const subject = `❌ Devis révisé refusé - Demande annulée - ${serviceType}`;
  
  const htmlToAdmin = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Devis révisé refusé</p>
        </div>
        
        <div class="content">
          <h2>Demande annulée</h2>
          
          <p>Le client <strong>${clientName}</strong> a refusé le devis révisé pour la demande <strong>${serviceType}</strong> (ID: ${requestId}).</p>
          
          <div class="alert-box">
            <p>La demande a été automatiquement annulée suite au refus du devis révisé.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/requests/${requestId}" class="button">
              Voir la demande
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Plateforme de services à domicile</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const htmlToArtisan = htmlToAdmin.replace(
    "<h2>Demande annulée</h2>",
    "<h2>Bonjour " + artisanName + ",</h2>"
  );
  
  const text = `
    Le client ${clientName} a refusé le devis révisé pour la demande ${serviceType} (ID: ${requestId}).
    
    La demande a été automatiquement annulée suite au refus du devis révisé.
  `;
  
  // Send to both admin and artisan
  await sendEmail({
    to: adminEmail,
    subject,
    html: htmlToAdmin,
    text,
  });
  
  await sendEmail({
    to: artisanEmail,
    subject,
    html: htmlToArtisan,
    text,
  });
  
  return true;
}

export async function sendArtisanRefusedRevisedEstimateNotification(
  adminEmail: string,
  artisanName: string,
  serviceType: string,
  requestId: number
) {
  const subject = `Artisan a refusé le devis révisé - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Réassignation nécessaire</p>
        </div>
        
        <div class="content">
          <h2>Artisan a refusé la mission</h2>
          
          <p>L'artisan <strong>${artisanName}</strong> a refusé la mission révisée pour la demande <strong>${serviceType}</strong> (ID: ${requestId}).</p>
          
          <div class="alert-box">
            <p>La demande est à nouveau disponible pour d'autres artisans.</p>
            <p>Status : En attente d'assignation</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/requests/${requestId}" class="button">
              Gérer la demande
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Plateforme de services à domicile</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    L'artisan ${artisanName} a refusé la mission révisée pour la demande ${serviceType} (ID: ${requestId}).
    
    La demande est à nouveau disponible pour d'autres artisans.
    Status : En attente d'assignation
    
    Gérer la demande : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspace/requests/${requestId}
  `;
  
  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

