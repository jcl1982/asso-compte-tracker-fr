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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FinanceAssoc</h1>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>

          {Object.entries(balanceByType).map(([type, balance]) => {
            const Icon = accountTypeIcons[type as keyof typeof accountTypeIcons];
            const label = accountTypeLabels[type as keyof typeof accountTypeLabels];
            
            return (
              <Card key={type}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                    </div>
                    <Icon className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Comptes & Saisie
              </CardTitle>
              <CardDescription>
                Gérez vos comptes bancaires, espèces, subventions et cotisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/accounts')}
              >
                Gérer les comptes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Transactions
              </CardTitle>
              <CardDescription>
                Enregistrez et suivez toutes vos recettes et dépenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate('/transactions')}
              >
                Gérer les transactions
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Rapports & Analyses
              </CardTitle>
              <CardDescription>
                Générez des rapports automatiques et visualisez vos données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
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