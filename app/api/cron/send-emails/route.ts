import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

export const maxDuration = 60; // Max allowed for Vercel Serverless (Pro), or 10s (Hobby)
export const dynamic = 'force-dynamic';

function getSmtpConfig(account: any) {
  let host = 'smtp.gmail.com';
  let port = 587;
  let secure = false;

  if (account.provider === 'Google Workspace' || account.provider?.includes('Google') || account.provider?.includes('Gmail')) {
    host = 'smtp.gmail.com';
    port = 465;
    secure = true;
  } else if (account.provider === 'Outlook' || account.provider?.includes('Microsoft')) {
    host = 'smtp.office365.com';
    port = 587;
    secure = false;
  } else {
    // Custom SMTP fallback
    host = account.smtpHost || host;
    port = account.smtpPort || port;
    secure = port === 465;
  }

  return {
    host,
    port,
    secure,
    auth: {
      user: account.email,
      pass: account.password,
    }
  };
}

export async function GET(request: Request) {
  try {
    console.log('[Worker] Starting email queue processor...');
    
    // 1. Fetch active campaigns
    const campaignsSnapshot = await adminDb.collection('campaigns').where('status', '==', 'active').get();
    
    if (campaignsSnapshot.empty) {
      return NextResponse.json({ message: 'No active campaigns.' });
    }

    let emailsSent = 0;

    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaign = campaignDoc.data();
      const campaignId = campaignDoc.id;

      // 2. Fetch the user's SMTP account
      const accountsSnapshot = await adminDb.collection('accounts')
        .where('userId', '==', campaign.userId)
        .where('status', '==', 'connected')
        .limit(1)
        .get();

      if (accountsSnapshot.empty) {
        console.warn(`[Worker] No connected account found for campaign ${campaignId}`);
        continue;
      }
      
      const account = accountsSnapshot.docs[0].data();
      const accountId = accountsSnapshot.docs[0].id;

      // Check daily limit roughly
      if ((account.sentToday || 0) >= (account.dailyLimit || 50)) {
        console.warn(`[Worker] Account ${account.email} reached daily limit.`);
        continue;
      }

      // 3. Initialize Nodemailer
      const transporter = nodemailer.createTransport(getSmtpConfig(account));

      // 4. Fetch pending leads for this campaign (status: new)
      const leadsSnapshot = await adminDb.collection('leads')
        .where('campaignId', '==', campaignId)
        .where('status', '==', 'new')
        .limit(5) // Process in small batches to avoid timeouts
        .get();

      if (leadsSnapshot.empty) {
        // No more new leads. (In a full app, you'd check for followups here too)
        // Mark campaign as completed if all leads are sent
        const allPendingLeads = await adminDb.collection('leads')
          .where('campaignId', '==', campaignId)
          .where('status', 'in', ['new', 'waiting'])
          .limit(1)
          .get();
          
        if (allPendingLeads.empty) {
          await campaignDoc.ref.update({ status: 'completed' });
        }
        continue;
      }

      const sequence = campaign.sequence || [];
      const firstEmailStep = sequence.find((s: any) => s.type === 'initial') || sequence[0];

      if (!firstEmailStep) continue;

      // 5. Send emails
      for (const leadDoc of leadsSnapshot.docs) {
        const lead = leadDoc.data();
        
        try {
          // Parse template variables
          let subject = campaign.subjectA || 'Hello';
          let body = firstEmailStep.body || '';

          const replaceVars = (text: string) => {
            if (!text) return '';
            return text
              .replace(/{{name}}/g, lead.name || 'there')
              .replace(/{{company}}/g, lead.company || 'your company')
              .replace(/{{position}}/g, lead.position || 'your role')
              .replace(/{{role_type}}/g, lead.role_type || '')
              .replace(/{{company_hook}}/g, lead.company_hook || '');
          };

          subject = replaceVars(subject);
          body = replaceVars(body);

          // Handle Attachment
          const attachments = [];
          if (firstEmailStep.attachment?.url) {
            // It's a base64 Data URL or direct URL
            const url = firstEmailStep.attachment.url;
            if (url.startsWith('data:')) {
              attachments.push({
                filename: firstEmailStep.attachment.name,
                path: url // nodemailer supports data URLs directly via path
              });
            } else {
              attachments.push({
                filename: firstEmailStep.attachment.name,
                href: url
              });
            }
          }

          // Send Email
          const mailOptions = {
            from: `"${account.name || 'Outreach'}" <${account.email}>`,
            to: lead.email,
            subject: subject,
            text: body,
            attachments: attachments.length > 0 ? attachments : undefined
          };

          await transporter.sendMail(mailOptions);
          
          // Update Lead
          await leadDoc.ref.update({
            status: 'sent_initial',
            lastSentAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Update Campaign and Account stats
          await campaignDoc.ref.update({
            sent: admin.firestore.FieldValue.increment(1)
          });
          
          await adminDb.collection('accounts').doc(accountId).update({
            sentToday: admin.firestore.FieldValue.increment(1)
          });

          emailsSent++;
          console.log(`[Worker] Sent email to ${lead.email}`);
          
          // Wait 2 seconds between emails to avoid spam filters/rate limits instantly
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`[Worker] Failed to send to ${lead.email}`, error);
          await leadDoc.ref.update({ status: 'error', error: String(error) });
        }
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error: any) {
    console.error('[Worker] Fatal Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
