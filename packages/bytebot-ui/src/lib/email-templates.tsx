import React from 'react'

interface EmailTemplateProps {
  subject: string
  content: string
  recipientEmail?: string
  recipientName?: string
}

export const BetaAccessEmailTemplate: React.FC<EmailTemplateProps> = ({
  subject,
  content,
  recipientEmail,
  recipientName
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .email-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #718096;
            font-size: 16px;
          }
          .content {
            background: #f7fafc;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
          }
          .credentials {
            background: #edf2f7;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
          }
          .credential-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .credential-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .credential-label {
            font-weight: 600;
            color: #4a5568;
          }
          .credential-value {
            color: #2d3748;
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          <div className="header">
            <div className="logo">H0L0</div>
            <h1 className="title">🎉 Beta Access Granted!</h1>
            <p className="subtitle">Welcome to the future of productivity</p>
          </div>

          <div className="content">
            <p>Dear {recipientName || 'Beta User'},</p>
            
            <p>Congratulations! Your account has been approved for <strong>H0L0Light-OS</strong> beta access. You're now part of an exclusive group of early adopters shaping the future of productivity.</p>

            <div className="credentials">
              <h3 style={{ marginTop: 0, color: '#2d3748' }}>Your Account Details</h3>
              <div className="credential-item">
                <span className="credential-label">Email:</span>
                <span className="credential-value">holo@kanama.nl</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Password:</span>
                <span className="credential-value">XpDKMLEy2cVH5JgRfekB</span>
              </div>
            </div>

            <div className="credentials">
              <h3 style={{ marginTop: 0, color: '#2d3748' }}>Email Configuration</h3>
              <div className="credential-item">
                <span className="credential-label">POP/IMAP Server:</span>
                <span className="credential-value">mail.kanama.nl</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">SMTP Server:</span>
                <span className="credential-value">mail.kanama.nl (port 587)</span>
              </div>
            </div>

            <p>Get started now and be among the first to experience the revolutionary features of H0L0Light-OS!</p>

            <div style={{ textAlign: 'center' }}>
              <a href="https://h0l0light.com" className="cta-button">
                Launch H0L0Light-OS
              </a>
            </div>
          </div>

          <div className="footer">
            <p>Thank you for being part of our beta program!</p>
            <div className="social-links">
              <a href="https://twitter.com/h0l0light">Twitter</a>
              <a href="https://discord.gg/h0l0light">Discord</a>
              <a href="https://github.com/h0l0light">GitHub</a>
            </div>
            <p>© 2024 H0L0Light-OS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

export const WelcomeEmailTemplate: React.FC<EmailTemplateProps> = ({
  subject,
  content,
  recipientEmail,
  recipientName
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .email-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #718096;
            font-size: 16px;
          }
          .content {
            background: #f7fafc;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
          }
          .benefits {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          .benefit {
            background: #edf2f7;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .benefit-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .benefit-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
          }
          .benefit-desc {
            color: #718096;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          <div className="header">
            <div className="logo">H0L0</div>
            <h1 className="title">Welcome to the Waitlist!</h1>
            <p className="subtitle">You're one step closer to the future</p>
          </div>

          <div className="content">
            <p>Hello {recipientName || 'there'}!</p>
            
            <p>Thank you for joining the <strong>H0L0Light-OS</strong> beta waitlist. We're excited to have you on board for this revolutionary journey!</p>

            <p>You'll receive regular updates about your position in the queue and when beta access becomes available. We're working hard to bring you the most advanced productivity platform ever created.</p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">🚀</div>
                <div className="benefit-title">Early Access</div>
                <div className="benefit-desc">Be the first to try new features</div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">💬</div>
                <div className="benefit-title">Direct Feedback</div>
                <div className="benefit-desc">Shape the product with your input</div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">🎁</div>
                <div className="benefit-title">Free Forever</div>
                <div className="benefit-desc">Beta users get lifetime access</div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">⭐</div>
                <div className="benefit-title">Priority Support</div>
                <div className="benefit-desc">Get help when you need it</div>
              </div>
            </div>

            <p>Stay tuned for more updates and get ready to experience productivity like never before!</p>
          </div>

          <div className="footer">
            <p>Follow us for the latest updates</p>
            <div className="social-links">
              <a href="https://twitter.com/h0l0light">Twitter</a>
              <a href="https://discord.gg/h0l0light">Discord</a>
              <a href="https://github.com/h0l0light">GitHub</a>
            </div>
            <p>© 2024 H0L0Light-OS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

export const CustomEmailTemplate: React.FC<EmailTemplateProps> = ({
  subject,
  content,
  recipientEmail,
  recipientName
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .email-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            background: #f7fafc;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="email-container">
          <div className="header">
            <div className="logo">H0L0</div>
          </div>

          <div className="content">
            {content}
          </div>

          <div className="footer">
            <p>© 2024 H0L0Light-OS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

// Helper function to render React component to HTML string
export const renderEmailToHtml = (template: React.ReactElement): string => {
  // For now, return a simple HTML string since we can't use ReactDOMServer in the browser
  // In a real implementation, this would be handled server-side
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Email Template</h1>
          <p>This is a placeholder for the email template.</p>
        </div>
      </body>
    </html>
  `
}
