import React from 'react'
import nodemailer from 'nodemailer'
import { 
  BetaAccessEmailTemplate, 
  WelcomeEmailTemplate, 
  CustomEmailTemplate,
  renderEmailToHtml 
} from './email-templates'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string[]
  subject: string
  content: string
  templateType: 'beta_access' | 'welcome' | 'custom'
  recipientName?: string
}

class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    this.config = {
      host: 'mail.kanama.nl',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'holo@kanama.nl',
        pass: 'XpDKMLEy2cVH5JgRfekB'
      }
    }

    this.transporter = nodemailer.createTransport(this.config)
  }

  private getEmailTemplate(templateType: string, data: EmailData): React.ReactElement {
    const templateProps = {
      subject: data.subject,
      content: data.content,
      recipientName: data.recipientName
    }

    switch (templateType) {
      case 'beta_access':
        return React.createElement(BetaAccessEmailTemplate, templateProps)
      case 'welcome':
        return React.createElement(WelcomeEmailTemplate, templateProps)
      case 'custom':
      default:
        return React.createElement(CustomEmailTemplate, templateProps)
    }
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Verify connection configuration
      await this.transporter.verify()

      const emailTemplate = this.getEmailTemplate(data.templateType, data)
      const htmlContent = renderEmailToHtml(emailTemplate)

      const mailOptions = {
        from: `"H0L0Light-OS" <${this.config.auth.user}>`,
        to: data.to.join(', '),
        subject: data.subject,
        html: htmlContent,
        text: data.content // Fallback text version
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      return {
        success: true,
        message: `Email sent successfully. Message ID: ${result.messageId}`
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<{ success: boolean; results: any[] }> {
    const results = []
    
    for (const emailData of emails) {
      const result = await this.sendEmail(emailData)
      results.push({
        recipients: emailData.to,
        ...result
      })
    }

    const allSuccessful = results.every(r => r.success)
    
    return {
      success: allSuccessful,
      results
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email connection test failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
export default EmailService
