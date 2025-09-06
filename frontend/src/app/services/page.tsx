'use client'

import { motion } from 'framer-motion'
import { Bot, ArrowLeft, Zap, Globe, Brain, Shield, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function ServicesPage() {
  const services = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Automation",
      description: "Intelligent task automation that works independently to handle your repetitive work",
      features: ["Natural language commands", "Multi-step workflows", "Real-time execution", "Error handling"]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Persistent Web OS",
      description: "Your automation continues running even when your browser is closed",
      features: ["Background processing", "24/7 availability", "Cross-device sync", "Offline capabilities"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Intelligent Processing",
      description: "AI that learns your patterns and makes decisions autonomously",
      features: ["Pattern recognition", "Predictive actions", "Smart decision making", "Continuous learning"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance",
      features: ["Data encryption", "Access controls", "Audit logs", "GDPR compliance"]
    }
  ]

  const plans = [
    {
      name: "PRO",
      price: "$25",
      period: "/month",
      description: "Perfect for individuals and small teams",
      features: [
        "10+ hours saved per week",
        "Basic automation workflows",
        "Email support",
        "Standard security",
        "5 active automations"
      ],
      popular: false
    },
    {
      name: "BUSINESS",
      price: "$99",
      period: "/month",
      description: "Advanced features for growing businesses",
      features: [
        "50+ hours saved per week",
        "Advanced automation workflows",
        "Priority support",
        "Enhanced security",
        "Unlimited automations",
        "Team collaboration"
      ],
      popular: true
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited hours saved",
        "Custom automation workflows",
        "Dedicated support",
        "Enterprise security",
        "Unlimited automations",
        "Custom integrations",
        "SLA guarantees"
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen wallpaper-bg relative">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </Link>
          <Link 
            href="/landing" 
            className="warmwind-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold warmwind-text mb-6">
              Our Services
            </h1>
            <p className="text-xl warmwind-body mb-8 max-w-3xl mx-auto">
              Transform your productivity with our AI-powered automation platform. 
              Get back 10+ hours per week with intelligent, persistent automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="ethereal-card p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold warmwind-text mb-2">
                      {service.title}
                    </h3>
                    <p className="warmwind-body">
                      {service.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 warmwind-body">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold warmwind-text mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl warmwind-body max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core automation features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`ethereal-card p-8 relative ${plan.popular ? 'ring-2 ring-white/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold warmwind-text mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center space-x-1 mb-2">
                    <span className="text-4xl font-bold warmwind-text">{plan.price}</span>
                    <span className="warmwind-body">{plan.period}</span>
                  </div>
                  <p className="warmwind-body">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3 warmwind-body">
                      <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/waitlist" 
                  className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'warmwind-button hover:scale-105' 
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.name === 'ENTERPRISE' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="ethereal-card p-6 text-center"
            >
              <Clock className="w-8 h-8 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold warmwind-text mb-2">10+</div>
              <div className="warmwind-body">Hours Saved Per Week</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="ethereal-card p-6 text-center"
            >
              <Users className="w-8 h-8 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold warmwind-text mb-2">99.9%</div>
              <div className="warmwind-body">Uptime Guarantee</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="ethereal-card p-6 text-center"
            >
              <Zap className="w-8 h-8 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold warmwind-text mb-2">2min</div>
              <div className="warmwind-body">Setup Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ethereal-card p-6 text-center"
            >
              <Shield className="w-8 h-8 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold warmwind-text mb-2">24/7</div>
              <div className="warmwind-body">Security Monitoring</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold warmwind-text">
              H0L0Light-OS
            </span>
          </div>
          <p className="warmwind-body mb-4">
            The future of productivity is here. Transform your digital life today.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm warmwind-body">
            <Link href="/privacy" className="hover:warmwind-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:warmwind-text transition-colors">Terms</Link>
            <Link href="/services" className="hover:warmwind-text transition-colors">Services</Link>
            <Link href="/support" className="hover:warmwind-text transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
