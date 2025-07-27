import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
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
              <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground mt-1">How we protect and use your data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-primary/20 bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Your Privacy Matters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Effective Date:</strong> July 21, 2025
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>App Name:</strong> Velto AI
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Platform:</strong> <a href="https://launchpilot.app" className="text-blue-600 hover:underline">https://launchpilot.app</a>
              </p>
              <p className="leading-relaxed">
                At Velto AI, your privacy is our priority. We understand that you're trusting us with your ideas, 
                projects, and personal data — and we take that seriously. This Privacy Policy explains what information 
                we collect, how we use it, and the choices you have.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Account Information
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Email address (used for login and authentication)</li>
                  <li>• User ID associated with your Firebase account</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Project Data
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Ideas, timelines, summaries, and other content you generate or save</li>
                  <li>• AI interaction data, such as prompts or responses</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Usage Data (Automatically Collected)</h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Device type, browser, language, and IP address</li>
                  <li>• Feature usage metrics (e.g., tokens used, buttons clicked)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Cookies and Local Storage</h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Session maintenance and app settings</li>
                  <li>• Never used for advertising or cross-site tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">We do:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Save and retrieve your projects</li>
                    <li>• Power core features like AI prompts and timelines</li>
                    <li>• Improve platform performance and security</li>
                    <li>• Notify you of major updates (when necessary)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">We do not:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Sell your data to third parties</li>
                    <li>• Show ads or track you across websites</li>
                    <li>• Use your content to train third-party AI models</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Velto AI uses trusted third-party services:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium mb-1">Firebase</h5>
                  <p className="text-xs text-muted-foreground">Authentication, database, hosting, analytics</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium mb-1">Vercel</h5>
                  <p className="text-xs text-muted-foreground">Frontend hosting and deployment</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium mb-1">AI Providers</h5>
                  <p className="text-xs text-muted-foreground">OpenAI, Google, and other LLM services</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                These providers uphold high standards of data security and privacy, accessing your data only as needed to provide their services.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention & Deletion */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <CardTitle>Data Retention & Your Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Retention</h4>
                <p className="text-sm text-muted-foreground">
                  We retain your project data for as long as your account is active, unless you delete it.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Delete individual projects from your dashboard</li>
                  <li>• Request account and data deletion by emailing us</li>
                  <li>• Access, correct, or restrict how we use your data</li>
                  <li>• Data portability (where legally required)</li>
                </ul>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm">
                  <strong>Account Deletion:</strong> We will permanently delete all associated data within 30 days of your request.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Children's Privacy */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• HTTPS encryption</li>
                  <li>• Firebase Authentication</li>
                  <li>• Access control and monitoring</li>
                  <li>• Regular security updates</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  No system is 100% secure. Use strong passwords and log out on public devices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Velto AI is intended for users aged 13 and above. If we become aware that we have 
                  inadvertently collected data from someone under 13, we will promptly delete that data 
                  and terminate the account.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Changes & Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Changes & Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Changes to This Policy</h4>
                <p className="text-sm text-muted-foreground">
                  We may update this Privacy Policy from time to time. Material changes will be communicated 
                  via email or in-app alert. Continued use after changes means you accept the new policy.
                </p>
              </div>
              
              <div className="p-4 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2">Contact Us</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For questions, concerns, or data requests:
                </p>
                <div className="space-y-1 text-sm">
                  <p>📧 Email: <a href="mailto:privacy@launchpilot.app" className="text-blue-600 hover:underline">privacy@launchpilot.app</a></p>
                  <p>🌐 Website: <a href="https://launchpilot.app" className="text-blue-600 hover:underline">https://launchpilot.app</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: July 21, 2025 • This privacy policy is effective immediately.
          </p>
        </div>
      </div>
    </div>
  );
}