import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, CreditCard, Shield, Gavel, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
              <p className="text-muted-foreground mt-1">Rules and guidelines for using Velto AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Welcome to Velto AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Last updated:</strong> July 21, 2025
              </p>
              <p className="leading-relaxed mb-4">
                These Terms and Conditions ("Terms") govern your access to and use of the Velto AI platform, 
                including all related websites, mobile applications, features, tools, and services provided 
                (collectively, the "Service" or "Platform").
              </p>
              <div className="p-4 border border-orange-500/20 rounded-lg">
                <p className="text-sm font-medium">
                  By accessing or using Velto AI, you agree to be bound by these Terms. 
                  If you do not agree, you may not use the Platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Who We Are */}
          <Card>
            <CardHeader>
              <CardTitle>About Velto AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Velto AI is a digital platform designed to help users—especially aspiring young entrepreneurs—generate 
                business ideas, plan timelines, get startup guidance, and interact with AI tools to support business creation.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Eligibility & Account Requirements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Age Requirements</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Must be at least 13 years old to use Velto AI</li>
                  <li>• Users under 18 must have parent or guardian permission</li>
                  <li>• By using the Platform, you confirm you meet these requirements</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Account Responsibilities</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Provide accurate, current information during sign-up</li>
                  <li>• Maintain the confidentiality of your account credentials</li>
                  <li>• Take responsibility for all activities under your account</li>
                  <li>• Do not share login credentials or impersonate others</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions and Payment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Subscriptions and Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <Badge variant="secondary" className="mb-2">Free</Badge>
                  <p className="text-xs text-muted-foreground">Basic features included</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Badge variant="default" className="mb-2">Pro</Badge>
                  <p className="text-xs text-muted-foreground">Advanced AI tools</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Badge variant="destructive" className="mb-2">Ultra</Badge>
                  <p className="text-xs text-muted-foreground">Premium features</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Payment Terms</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Subscriptions are billed monthly</li>
                  <li>• By subscribing, you agree to pay all applicable fees</li>
                  <li>• Cancellation is allowed anytime (no refund for current cycle)</li>
                  <li>• Prices, features, or plans may change with prior notice</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Acceptable Use Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">You agree NOT to:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use the Service for illegal or unauthorized purposes</li>
                    <li>• Violate any laws or regulations</li>
                    <li>• Reverse engineer, hack, or disrupt our systems</li>
                    <li>• Upload harmful or inappropriate content</li>
                    <li>• Spam, harass, or abuse other users</li>
                    <li>• Create fake accounts or impersonate others</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">We encourage you to:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use the platform creatively and constructively</li>
                    <li>• Respect other users and their content</li>
                    <li>• Report inappropriate behavior or content</li>
                    <li>• Provide feedback to help us improve</li>
                    <li>• Follow community guidelines</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ Violation of these terms may result in account suspension or termination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gavel className="w-5 h-5 text-primary" />
                <CardTitle>Intellectual Property Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Velto AI's Property</h4>
                <p className="text-sm text-muted-foreground">
                  All content, branding, code, and materials on Velto AI (excluding user-generated content) 
                  are our property and protected by copyright, trademark, and intellectual property laws. 
                  You may not reproduce, distribute, or exploit any part of the Service without our written consent.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Content</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• You retain ownership of content you create or upload</li>
                  <li>• You grant us a non-exclusive, royalty-free license to host and display your content</li>
                  <li>• This license is solely to operate and improve the Service</li>
                  <li>• You're responsible for ensuring your content complies with laws and these Terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <CardTitle>Service Limitations & Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold mb-2">Service "As Is"</h4>
                <p className="text-sm text-muted-foreground">
                  Velto AI is provided "as is" and "as available." We do not guarantee that the platform 
                  will be error-free, secure, or uninterrupted.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-sm text-muted-foreground">
                  To the fullest extent permitted by law, Velto AI shall not be liable for any indirect, 
                  incidental, special, or consequential damages arising from your use of the Service.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Third-Party Services</h4>
                <p className="text-sm text-muted-foreground">
                  Velto AI may integrate with third-party services (e.g., OpenAI, Firebase). We are not 
                  responsible for third-party terms, privacy practices, or outages. Your use of these services 
                  is at your own risk.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">We may terminate if:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• You violate these Terms</li>
                    <li>• We suspect misuse of the platform</li>
                    <li>• Required by law or regulation</li>
                    <li>• For operational or security reasons</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">You may terminate by:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Deleting your account through dashboard</li>
                    <li>• Contacting our support team</li>
                    <li>• Canceling your subscription anytime</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes & Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Changes & Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Changes to These Terms</h4>
                <p className="text-sm text-muted-foreground">
                  We may update these Terms from time to time. Material changes will be communicated via email 
                  or platform alert. Continued use of the Service after changes means you agree to the new Terms.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-sm text-muted-foreground">
                  These Terms are governed by applicable local laws. Any disputes will be resolved in accordance 
                  with our jurisdiction's legal framework.
                </p>
              </div>
              
              <div className="p-4 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2">Contact Us</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For questions, feedback, or support:
                </p>
                <div className="space-y-1 text-sm">
                  <p>📧 Email: <a href="mailto:support@launchpilot.app" className="text-blue-600 hover:underline">support@launchpilot.app</a></p>
                  <p>🌐 Website: <a href="https://launchpilot.app" className="text-blue-600 hover:underline">https://launchpilot.app</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: July 21, 2025 • These terms are effective immediately upon posting.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            By continuing to use Velto AI, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}