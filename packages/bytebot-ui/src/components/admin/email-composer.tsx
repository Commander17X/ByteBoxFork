'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  Users, 
  FileText, 
  Eye, 
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'beta_access' | 'custom'
}

interface EmailComposerProps {
  selectedUsers: string[]
  onClose: () => void
}

interface UserEmail {
  id: string
  email: string
  status: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'beta_access',
    name: 'Beta Access Granted',
    subject: '🎉 Your H0L0Light-OS Beta Access is Ready!',
    content: `Dear Beta User,

Congratulations! Your account has been approved for H0L0Light-OS beta access.

Your account details:
Username: holo@kanama.nl
Password: XpDKMLEy2cVH5JgRfekB

Email Configuration:
POP/IMAP Server: mail.kanama.nl
SMTP Server: mail.kanama.nl (port 587)

Get started now and be among the first to experience the future of productivity!

Best regards,
The H0L0Light Team`,
    type: 'beta_access'
  },
  {
    id: 'welcome',
    name: 'Welcome to Waitlist',
    subject: 'Welcome to H0L0Light-OS Waitlist!',
    content: `Hello!

Thank you for joining the H0L0Light-OS beta waitlist. We're excited to have you on board!

You'll receive updates about your position and when beta access becomes available.

Stay tuned for more updates!

Best regards,
The H0L0Light Team`,
    type: 'welcome'
  }
]

export default function EmailComposer({ selectedUsers, onClose }: EmailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [recipientEmails, setRecipientEmails] = useState<UserEmail[]>([])
  const [emailServiceStatus, setEmailServiceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  // Check email service connection
  React.useEffect(() => {
    const checkEmailService = async () => {
      try {
        const response = await fetch('/api/admin/email/test')
        const data = await response.json()
        setEmailServiceStatus(data.connected ? 'connected' : 'disconnected')
      } catch (error) {
        console.error('Failed to check email service:', error)
        setEmailServiceStatus('disconnected')
      }
    }

    checkEmailService()
  }, [])

  // Fetch recipient emails when component mounts
  React.useEffect(() => {
    const fetchRecipientEmails = async () => {
      try {
        const userIds = selectedUsers.join(',')
        const response = await fetch(`/api/admin/waitlist/emails?userIds=${userIds}`)
        const data = await response.json()
        if (data.success) {
          setRecipientEmails(data.emails)
        }
      } catch (error) {
        console.error('Failed to fetch recipient emails:', error)
      }
    }

    if (selectedUsers.length > 0) {
      fetchRecipientEmails()
    }
  }, [selectedUsers])

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setCustomSubject(template.subject)
    setCustomContent(template.content)
    setIsPreview(false)
  }

  const handleSend = async () => {
    if (!customSubject || !customContent) return

    setIsSending(true)
    setSendStatus('idle')

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipientEmails.map(user => user.email),
          subject: customSubject,
          content: customContent,
          templateType: selectedTemplate?.type || 'custom'
        })
      })

      if (response.ok) {
        setSendStatus('success')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setSendStatus('error')
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      setSendStatus('error')
    } finally {
      setIsSending(false)
    }
  }

  const renderEmailPreview = () => {
    return (
      <div className="bg-white text-gray-900 p-6 rounded-lg max-w-2xl mx-auto">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="text-sm text-gray-500 mb-2">Subject:</div>
          <div className="font-semibold">{customSubject}</div>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {customContent}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold warmwind-text">Email Composer</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm warmwind-body">
                ({recipientEmails.length} recipients)
              </span>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                emailServiceStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : emailServiceStatus === 'disconnected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  emailServiceStatus === 'connected' 
                    ? 'bg-green-400'
                    : emailServiceStatus === 'disconnected'
                    ? 'bg-red-400'
                    : 'bg-yellow-400'
                }`} />
                <span>
                  {emailServiceStatus === 'connected' 
                    ? 'Email Service Ready'
                    : emailServiceStatus === 'disconnected'
                    ? 'Email Service Offline'
                    : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="warmwind-button p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Templates Sidebar */}
          <div className="w-80 border-r border-white/20 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold warmwind-text mb-4">Templates</h3>
            <div className="space-y-3">
              {emailTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-white/40 bg-white/20'
                      : 'border-white/20 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="warmwind-text font-medium mb-1">{template.name}</div>
                  <div className="warmwind-body text-sm line-clamp-2">
                    {template.subject}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <h4 className="warmwind-text font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="w-full warmwind-button flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isPreview ? 'Edit' : 'Preview'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {sendStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="warmwind-text">Emails sent successfully!</span>
              </div>
            )}

            {sendStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="warmwind-text">Failed to send emails. Please try again.</span>
              </div>
            )}

            {isPreview ? (
              <div>
                <h3 className="text-lg font-semibold warmwind-text mb-4">Email Preview</h3>
                {renderEmailPreview()}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block warmwind-text font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="warmwind-input w-full"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="block warmwind-text font-medium mb-2">Content</label>
                  <textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="warmwind-input w-full h-64 resize-none"
                    placeholder="Enter email content..."
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="text-sm warmwind-body">
                    Recipients: {recipientEmails.length} users
                    {recipientEmails.length > 0 && (
                      <div className="mt-2 text-xs text-white/70">
                        {recipientEmails.map(user => user.email).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsPreview(true)}
                      className="warmwind-button flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!customSubject || !customContent || isSending}
                      className="warmwind-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
