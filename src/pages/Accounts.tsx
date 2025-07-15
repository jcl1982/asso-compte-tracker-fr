import React from 'react';
import { AccountsManagement } from '@/components/AccountsManagement';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Accounts() {
  const { user } = useAuth();
  const { isAdmin, loading } = useProfile();
  const navigate = useNavigate();

  if (!user) {
    return null; // Will be redirected by auth guard
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FinanceAssoc</h1>
                <p className="text-sm text-muted-foreground">Gestion des comptes</p>
              </div>
            </div>
          </div>
        </header>

        {/* Access Denied Content */}
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Accès refusé</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Seuls les administrateurs peuvent accéder à la gestion des comptes.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FinanceAssoc</h1>
              <p className="text-sm text-muted-foreground">Gestion des comptes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AccountsManagement />
      </main>
    </div>
  );
}