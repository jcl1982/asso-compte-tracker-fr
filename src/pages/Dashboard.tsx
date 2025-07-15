import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useFinance } from '@/hooks/useFinance';
import { TrendingUp, Users, FileText, BarChart3, Shield, LogOut, Wallet, Building2, Gift, Users2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { accounts, getTotalBalance, getBalanceByType } = useFinance();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected to auth
  }

  const totalBalance = getTotalBalance();
  const balanceByType = getBalanceByType();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const accountTypeIcons = {
    bank: Building2,
    cash: Wallet,
    grants: Gift,
    dues: Users2
  };

  const accountTypeLabels = {
    bank: 'Comptes bancaires',
    cash: 'Espèces',
    grants: 'Subventions',
    dues: 'Cotisations'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-blue/10 via-background to-vibrant-purple/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple p-2 rounded-lg shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">FinanceAssoc</h1>
              <p className="text-sm text-muted-foreground">Gestion financière</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Bienvenue, {user.email}</p>
              <p className="text-xs text-muted-foreground">Connecté</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos finances associatives
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-vibrant-blue bg-gradient-to-r from-vibrant-blue/5 to-transparent shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde Total</p>
                  <p className="text-2xl font-bold text-vibrant-blue">{formatCurrency(totalBalance)}</p>
                </div>
                <div className="bg-vibrant-blue/10 p-2 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-vibrant-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(balanceByType).map(([type, balance], index) => {
            const Icon = accountTypeIcons[type as keyof typeof accountTypeIcons];
            const label = accountTypeLabels[type as keyof typeof accountTypeLabels];
            const colors = ['vibrant-green', 'vibrant-purple', 'vibrant-orange', 'vibrant-pink'];
            const color = colors[index % colors.length];
            
            return (
              <Card key={type} className={`border-l-4 border-l-${color} bg-gradient-to-r from-${color}/5 to-transparent shadow-lg hover:shadow-xl transition-all`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className={`text-2xl font-bold text-${color}`}>{formatCurrency(balance)}</p>
                    </div>
                    <div className={`bg-${color}/10 p-2 rounded-lg`}>
                      <Icon className={`h-8 w-8 text-${color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 border-vibrant-green/20 bg-gradient-to-br from-vibrant-green/5 to-transparent group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-vibrant-green/10 p-2 rounded-lg group-hover:bg-vibrant-green/20 transition-colors">
                  <FileText className="h-5 w-5 text-vibrant-green" />
                </div>
                <span className="text-vibrant-green">Comptes & Saisie</span>
              </CardTitle>
              <CardDescription>
                Gérez vos comptes bancaires, espèces, subventions et cotisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-vibrant-green hover:bg-vibrant-green/90" 
                onClick={() => navigate('/accounts')}
              >
                Gérer les comptes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-vibrant-purple/20 bg-gradient-to-br from-vibrant-purple/5 to-transparent group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-vibrant-purple/10 p-2 rounded-lg group-hover:bg-vibrant-purple/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-vibrant-purple" />
                </div>
                <span className="text-vibrant-purple">Transactions</span>
              </CardTitle>
              <CardDescription>
                Enregistrez et suivez toutes vos recettes et dépenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90"
                onClick={() => navigate('/transactions')}
              >
                Gérer les transactions
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-vibrant-orange/20 bg-gradient-to-br from-vibrant-orange/5 to-transparent group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-vibrant-orange/10 p-2 rounded-lg group-hover:bg-vibrant-orange/20 transition-colors">
                  <Users className="h-5 w-5 text-vibrant-orange" />
                </div>
                <span className="text-vibrant-orange">Rapports & Analyses</span>
              </CardTitle>
              <CardDescription>
                Générez des rapports automatiques et visualisez vos données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90"
                onClick={() => navigate('/reports')}
              >
                Consulter les rapports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les fonctionnalités les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => navigate('/accounts')}>
                <Wallet className="h-4 w-4 mr-2" />
                Nouveau compte
              </Button>
              <Button variant="outline" onClick={() => navigate('/transactions')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Nouvelle transaction
              </Button>
              <Button variant="outline" onClick={() => navigate('/reports')}>
                <FileText className="h-4 w-4 mr-2" />
                Consulter rapports
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}