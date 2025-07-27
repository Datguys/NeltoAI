import { useState, useEffect } from "react";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';
import { 
  deleteAccountImmediately, 
  checkAccountDeletionStatus 
} from '@/lib/firestoreProjects';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Crown, 
  Palette, 
  Zap, 
  CreditCard, 
  Trash2,
  Mail,
  Shield,
  Settings as SettingsIcon,
  ArrowRight,
  Check,
  AlertTriangle
} from "lucide-react";

interface SettingsProps {
  onSectionChange: (section: string) => void;
}

export function Settings({ onSectionChange }: SettingsProps) {
  const { user, loading } = useFirebaseUser();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<{
    isDeleted: boolean;
    deletedDate?: string;
  }>({ isDeleted: false });
  const [isDeleting, setIsDeleting] = useState(false);



  const templates = [
    {
      id: "modern",
      name: "Modern Dark",
      description: "Sleek dark theme with purple gradients",
      preview: "bg-gradient-to-br from-purple-900 to-blue-900",
      features: ["Dark mode", "Purple accents", "Glass morphism"]
    },
    {
      id: "minimal",
      name: "Minimal Light",
      description: "Clean light theme with subtle colors",
      preview: "bg-gradient-to-br from-gray-100 to-blue-100",
      features: ["Light mode", "Blue accents", "Clean lines"]
    }
  ];

  // Real credit packages (from tokenTiers)
  const { 
    CREDIT_PACKAGES, 
    addCredits, 
    credits, 
    tier, 
    setTier, 
    usedThisMonth, 
    inputTokensUsed = 0, 
    outputTokensUsed = 0, 
    getMaxTokens, 
    getRemainingTokens, 
    getUsagePercentage, 
    loading: creditsLoading 
  } = useCredits();

  // Check account deletion status on component mount and user change
  useEffect(() => {
    const checkDeletionStatus = async () => {
      if (user?.uid) {
        const status = await checkAccountDeletionStatus(user.uid);
        setDeletionStatus(status);
      }
    };
    
    if (user?.uid && !loading) {
      checkDeletionStatus();
    }
  }, [user?.uid, loading]);

  // Handle immediate account deletion
  const handleDeleteAccount = async () => {
    if (!user?.uid) return;
    
    setIsDeleting(true);
    try {
      await deleteAccountImmediately(user.uid);
      setShowDeleteConfirm(false);
      
      // Sign out user immediately
      await signOut(auth);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {user && user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-lg object-cover glow-primary" />
          ) : (
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <Button
          variant="upgrade"
          className="mt-4 mb-6"
          onClick={() => window.location.href = '/upgrade'}
        >
          Upgrade / Subscribe
        </Button>
            <p className="text-muted-foreground">Manage your account and preferences</p>
            <div className="mt-2">
              <div className="font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</div>
              {user && user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 p-1">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              About You
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Credits
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Purchase
            </TabsTrigger>
          </TabsList>

          {/* About You Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid gap-6">
              {/* Subscription Info */}
              <Card className="p-6 bg-gradient-card glow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
                  <Badge 
                    variant={"secondary"}
                    className="bg-primary/20 text-primary"
                  >
                    Free Plan
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Plan</span>
                    <span className="text-foreground font-medium">Free</span>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6 bg-gradient-card glow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="text-foreground font-medium">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email Address</span>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{user ? user.email : loading ? 'Loading...' : 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Status</span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="text-success font-medium">Verified</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Edit Profile
                </Button>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-gradient-card glow-card border-destructive/20">
                <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account. You can recover it by signing in again within 30 days.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  {showDeleteConfirm && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-destructive mb-2">Delete Account Immediately?</h4>
                          <div className="text-sm text-muted-foreground mb-4 space-y-2">
                            <p><strong>⚠️ What happens next:</strong></p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>You will be <strong>immediately logged out</strong></li>
                              <li>Your account will appear deleted, but data is preserved for recovery</li>
                              <li>Sign in again within <strong>30 days</strong> to recover your account</li>
                              <li>After 30 days, your data may be permanently deleted</li>
                              <li>Includes all projects, analytics, and personal information</li>
                            </ul>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Template Customization Tab */}
          <TabsContent value="customization" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Theme System (Coming Soon)</h3>
              <p className="text-muted-foreground mb-4">
                We're working on a comprehensive theme system that will allow you to completely change the app's layout and appearance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg opacity-50">
                  <h4 className="font-medium mb-2">🏢 Professional Theme</h4>
                  <p className="text-sm text-muted-foreground">Clean white business layout with compact information display</p>
                </div>
                <div className="p-4 border rounded-lg opacity-50">
                  <h4 className="font-medium mb-2">🌙 Pure Dark Theme</h4>
                  <p className="text-sm text-muted-foreground">Clean dark theme with green/blue accents, no purple</p>
                </div>
                <div className="p-4 border rounded-lg opacity-50">
                  <h4 className="font-medium mb-2">🎨 Creative Theme</h4>
                  <p className="text-sm text-muted-foreground">Playful floating cards with animations and fun typography</p>
                </div>
                <div className="p-4 border rounded-lg opacity-50">
                  <h4 className="font-medium mb-2">📱 Sidebar-Only Theme</h4>
                  <p className="text-sm text-muted-foreground">Everything in sidebar, no headers, maximized content space</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Coming features:</strong> Complete layout restructuring, different color schemes, 
                  component repositioning, and customizable spacing - not just color changes!
                </p>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Current Templates</h3>
              <p className="text-muted-foreground mb-6">
                Select a template that matches your style and preferences.
              </p>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5 glow-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-12 rounded-lg ${template.preview} border border-border`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          {selectedTemplate === template.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex gap-2">
                          {template.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full">
                Apply Template
              </Button>
            </Card>

          </TabsContent>

          {/* AI Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">AI Credits & Tier Management</h3>
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-semibold text-foreground">
                  Remaining: <span className="text-primary">{creditsLoading ? 'Loading...' : `${getRemainingTokens().toLocaleString()} tokens`}</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    Used: {(usedThisMonth || 0).toLocaleString()} / {getMaxTokens().toLocaleString()} ({Math.round(getUsagePercentage())}%)
                  </div>
                </div>
                <Badge 
                  variant={tier === 'free' ? 'secondary' : tier === 'starter' ? 'default' : 'destructive'}
                  className="bg-primary/20 text-primary"
                >
                  {(tier || 'free').charAt(0).toUpperCase() + (tier || 'free').slice(1)} Plan
                </Badge>
              </div>
              
              {/* Tier Management Note */}
              <div className="space-y-4 mb-6 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">💡 Tier Management</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  To test different tiers and unlock features, visit the <strong>Upgrade page</strong> and use the admin tier management buttons at the bottom.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/upgrade'}
                >
                  Go to Upgrade Page
                </Button>
              </div>

              {/* Token Usage Statistics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Available</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">{creditsLoading ? 'Loading...' : getRemainingTokens().toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">tokens remaining</p>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <Crown className="w-8 h-8 text-warning mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Input Tokens</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">{inputTokensUsed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">used this month</p>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <Crown className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Output Tokens</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">{outputTokensUsed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">used this month</p>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <Crown className="w-8 h-8 text-warning mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Current Tier</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">{(tier || 'free').charAt(0).toUpperCase() + (tier || 'free').slice(1)}</p>
                  <p className="text-xs text-muted-foreground">subscription plan</p>
                </div>
                <div className="text-center p-4 bg-card/50 rounded-lg">
                  <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">This Month</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">0</p>
                  <p className="text-xs text-muted-foreground">credits used</p>
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Current Plan Benefits</h4>
                <div className="grid gap-3">
                  {tier === 'free' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>10,000 AI tokens per month</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>5 idea generations per day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>2 deep analysis reports per month</span>
                      </div>
                    </>
                  )}
                  {tier === 'starter' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>50,000 AI tokens per month</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>20 idea generations per day</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>10 deep analysis reports per month</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>Timeline & budget planning</span>
                      </div>
                    </>
                  )}
                  {(tier === 'ultra' || tier === 'lifetime') && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>250,000+ AI tokens per month</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>Unlimited idea generations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>50+ deep analysis reports per month</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>Advanced project management</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        <span>Priority AI model access</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Purchase Credits Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Purchase AI Credits</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-foreground">Current Balance: <span className="text-primary">{creditsLoading ? 'Loading...' : `${(credits || 0).toLocaleString()} credits`}</span></div>
                <div className="text-md text-muted-foreground">Tier: <span className="text-foreground font-bold">{(tier || 'free').charAt(0).toUpperCase() + (tier || 'free').slice(1)}</span></div>
              </div>
              <p className="text-muted-foreground mb-6">
                Choose a credit package to continue using AI-powered features. Payment is securely processed by Stripe.
              </p>
              <div className="grid gap-4">
                {CREDIT_PACKAGES.map((pkg, idx) => (
                  <div
                    key={pkg.credits}
                    className={`p-4 border rounded-lg transition-all duration-300 ${idx === 1 ? 'border-primary bg-primary/5 glow-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {pkg.credits.toLocaleString()} Credits
                          </h4>
                          {idx === 1 && (
                            <Badge className="bg-primary text-primary-foreground">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Best value for regular users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${pkg.price}</p>
                        <Button
                          variant={idx === 1 ? "primary" : "outline"}
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            // TODO: Integrate Stripe Checkout here
                            // Replace with your Stripe publishable key and backend endpoint
                            // For MVP, simulate a successful purchase
                            // await stripeRedirect(pkg.credits, pkg.price);
                            addCredits(pkg.credits);
                            alert(`Purchased ${pkg.credits.toLocaleString()} credits! (Stripe integration goes here)`);
                          }}
                        >
                          Purchase
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-card/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Credit Usage Guide</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Idea Generation: 2-5 credits per request</li>
                  <li>• Budget Analysis: 3-8 credits per analysis</li>
                  <li>• Timeline Planning: 5-10 credits per timeline</li>
                  <li>• Market Research: 8-15 credits per report</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}