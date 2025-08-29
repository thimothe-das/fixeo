// Simple email notification service for billing estimates
// In a production environment, you would use a service like SendGrid, Resend, or AWS SES

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailNotificationData): Promise<boolean> {
  // For now, we'll just log the email content
  // In production, replace this with actual email service
  console.log('📧 Email Notification:', {
    to: data.to,
    subject: data.subject,
    html: data.html.substring(0, 200) + '...',
  });
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send(data);
  
  return true;
}

export async function sendEstimateCreatedNotification(
  clientEmail: string,
  clientName: string,
  serviceType: string,
  estimateAmount: number,
  estimateId: number
) {
  const subject = `Nouveau devis disponible - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .price { font-size: 24px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo</h1>
          <p>Votre devis est prêt !</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${clientName},</h2>
          
          <p>Nous avons préparé un devis pour votre demande de <strong>${serviceType}</strong>.</p>
          
          <div class="price">
            Montant du devis : ${(estimateAmount / 100).toFixed(2)} €
          </div>
          
          <p>Vous pouvez consulter les détails complets de votre devis et y répondre en vous connectant à votre espace client.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              Voir mon devis
            </a>
          </div>
          
          <p><strong>Important :</strong> Ce devis nécessite votre validation pour que nous puissions procéder à l'assignation d'un artisan.</p>
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
    
    Nous avons préparé un devis pour votre demande de ${serviceType}.
    
    Montant du devis : ${(estimateAmount / 100).toFixed(2)} €
    
    Vous pouvez consulter les détails complets en vous connectant à votre espace client :
    ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard
    
    Ce devis nécessite votre validation pour que nous puissions procéder à l'assignation d'un artisan.
    
    Cordialement,
    L'équipe Fixéo
  `;
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}

export async function sendEstimateResponseNotification(
  adminEmail: string,
  clientName: string,
  serviceType: string,
  action: 'accepted' | 'rejected',
  estimateAmount: number,
  clientResponse?: string
) {
  const actionText = action === 'accepted' ? 'accepté' : 'refusé';
  const subject = `Devis ${actionText} - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${action === 'accepted' ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .response { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo Admin</h1>
          <p>Réponse client reçue</p>
        </div>
        
        <div class="content">
          <h2>Devis ${actionText}</h2>
          
          <p><strong>Client :</strong> ${clientName}</p>
          <p><strong>Service :</strong> ${serviceType}</p>
          <p><strong>Montant :</strong> ${(estimateAmount / 100).toFixed(2)} €</p>
          <p><strong>Action :</strong> ${actionText.toUpperCase()}</p>
          
          ${clientResponse ? `
            <div class="response">
              <strong>Message du client :</strong><br>
              ${clientResponse}
            </div>
          ` : ''}
          
          <p>
            ${action === 'accepted' 
              ? 'Le client a accepté le devis. Vous pouvez maintenant assigner un artisan à cette demande.'
              : 'Le client a refusé le devis. La demande a été annulée.'
            }
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              Voir dans l'admin
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Administration</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Devis ${actionText}
    
    Client : ${clientName}
    Service : ${serviceType}
    Montant : ${(estimateAmount / 100).toFixed(2)} €
    Action : ${actionText.toUpperCase()}
    
    ${clientResponse ? `Message du client : ${clientResponse}\n` : ''}
    
    ${action === 'accepted' 
      ? 'Le client a accepté le devis. Vous pouvez maintenant assigner un artisan à cette demande.'
      : 'Le client a refusé le devis. La demande a été annulée.'
    }
    
    Voir dans l'admin : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard
    
    L'équipe Fixéo
  `;
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

export async function sendValidationNotification(
  adminEmail: string,
  clientName: string,
  serviceType: string,
  action: 'approve' | 'dispute',
  disputeReason?: string,
  disputeDetails?: string
) {
  const actionText = action === 'approve' ? 'validée' : 'contestée';
  const subject = `Mission ${actionText} - ${serviceType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${action === 'approve' ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .dispute-details { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Fixéo Admin</h1>
          <p>Validation client reçue</p>
        </div>
        
        <div class="content">
          <h2>Mission ${actionText}</h2>
          
          <p><strong>Client :</strong> ${clientName}</p>
          <p><strong>Service :</strong> ${serviceType}</p>
          <p><strong>Action :</strong> ${actionText.toUpperCase()}</p>
          
          ${action === 'dispute' && disputeReason && disputeDetails ? `
            <div class="dispute-details">
              <strong>Détails du litige :</strong><br>
              <p><strong>Motif :</strong> ${disputeReason}</p>
              <p><strong>Description :</strong><br>${disputeDetails}</p>
            </div>
          ` : ''}
          
          <p>
            ${action === 'approve' 
              ? 'Le client a validé la mission avec succès. Le paiement peut être déclenché vers l\'artisan.'
              : 'Le client a contesté la mission. Un litige a été créé et nécessite votre intervention immédiate.'
            }
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              ${action === 'approve' ? 'Traiter le paiement' : 'Gérer le litige'}
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} Fixéo - Administration</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Mission ${actionText}
    
    Client : ${clientName}
    Service : ${serviceType}
    Action : ${actionText.toUpperCase()}
    
    ${action === 'dispute' && disputeReason && disputeDetails ? `
    Détails du litige :
    Motif : ${disputeReason}
    Description : ${disputeDetails}
    ` : ''}
    
    ${action === 'approve' 
      ? 'Le client a validé la mission avec succès. Le paiement peut être déclenché vers l\'artisan.'
      : 'Le client a contesté la mission. Un litige a été créé et nécessite votre intervention immédiate.'
    }
    
    Voir dans l'admin : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard
    
    L'équipe Fixéo
  `;
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}
