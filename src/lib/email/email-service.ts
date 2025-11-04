import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@ikgptu.edu';

export async function sendWelcomeEmail(
  to: string,
  name: string,
  rollNo: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to IK Gujral PTU Attendance System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to IK Gujral PTU!</h1>
              </div>
              <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                <p>Welcome to the IK Gujral Punjab Technical University Attendance Management System!</p>
                <p>Your registration has been successfully completed. Here are your details:</p>
                <ul>
                  <li><strong>Name:</strong> ${name}</li>
                  <li><strong>Roll Number:</strong> ${rollNo}</li>
                  <li><strong>Email:</strong> ${to}</li>
                </ul>
                <p>You can now login to view your attendance, track your progress, and apply for leave requests.</p>
                <p><strong>Features you can access:</strong></p>
                <ul>
                  <li>✅ Real-time attendance updates</li>
                  <li>✅ Subject-wise attendance tracking</li>
                  <li>✅ Attendance percentage calculations</li>
                  <li>✅ Leave application system</li>
                  <li>✅ Download attendance reports</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/dashboard" class="button">Go to Dashboard</a>
              </div>
              <div class="footer">
                <p>IK Gujral Punjab Technical University<br>
                Jalandhar-Kapurthala Highway, Kapurthala - 144603, Punjab, India</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendLeaveStatusEmail(
  to: string,
  name: string,
  leaveType: string,
  status: 'Approved' | 'Rejected',
  comments?: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Leave Request ${status}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: ${status === 'Approved' ? '#10b981' : '#ef4444'};">
                Leave Request ${status}
              </h2>
              <p>Dear ${name},</p>
              <p>Your <strong>${leaveType}</strong> leave request has been <strong>${status.toLowerCase()}</strong>.</p>
              ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
              <p>For more details, please login to your dashboard.</p>
              <hr>
              <p style="color: #666; font-size: 14px;">IK Gujral Punjab Technical University</p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send leave status email:', error);
    return false;
  }
}

export async function sendAttendanceAlert(
  to: string,
  name: string,
  subject: string,
  percentage: number
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Attendance Alert - ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ef4444;">⚠️ Attendance Alert</h2>
              <p>Dear ${name},</p>
              <p>This is to inform you that your attendance percentage in <strong>${subject}</strong> has dropped to <strong>${percentage}%</strong>.</p>
              <p>Minimum required attendance is <strong>75%</strong>. Please ensure regular attendance to meet the requirements.</p>
              <p>Login to your dashboard to view detailed attendance records.</p>
              <hr>
              <p style="color: #666; font-size: 14px;">IK Gujral Punjab Technical University</p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send attendance alert:', error);
    return false;
  }
}
