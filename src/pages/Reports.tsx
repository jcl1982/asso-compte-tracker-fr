import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useFinance } from '@/hooks/useFinance';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, DollarSign, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chart3DContainer } from '@/components/charts/Chart3DContainer';
import { Bar3DChart } from '@/components/charts/Bar3DChart';
import { Pie3DChart } from '@/components/charts/Pie3DChart';
import { Line3DChart } from '@/components/charts/Line3DChart';
import { Stats3DCard } from '@/components/charts/Stats3DCard';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { accounts, transactions, categories, getTotalBalance, getBalanceByType } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // derniers 30 jours par défaut

  // Filtrer les transactions par période
  const filteredTransactions = useMemo(() => {
    const daysBack = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    return transactions.filter(transaction => 
      new Date(transaction.transaction_date) >= cutoffDate
    );
  }, [transactions, selectedPeriod]);

  // Calculs statistiques
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    const transactionCount = filteredTransactions.length;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount,
      averageTransaction: transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0
    };
  }, [filteredTransactions]);

  // Données pour le graphique d'évolution dans le temps
  const evolutionData = useMemo(() => {
    const dailyData: Record<string, { date: string; income: number; expenses: number; balance: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.transaction_date;
      if (!dailyData[date]) {
        dailyData[date] = { date, income: 0, expenses: 0, balance: 0 };
      }
      
      if (transaction.type === 'income') {
        dailyData[date].income += Number(transaction.amount);
      } else {
        dailyData[date].expenses += Number(transaction.amount);
      }
    });
    
    // Calculer le solde cumulé et trier par date
    const sortedData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    let cumulativeBalance = 0;
    
    return sortedData.map(day => {
      cumulativeBalance += day.income - day.expenses;
      return {
        ...day,
        balance: cumulativeBalance,
        name: new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
      };
    });
  }, [filteredTransactions]);

  // Données par catégorie
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, { name: string; income: number; expenses: number; total: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const categoryName = transaction.categories?.name || 'Non catégorisé';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { name: categoryName, income: 0, expenses: 0, total: 0 };
      }
      
      if (transaction.type === 'income') {
        categoryTotals[categoryName].income += Number(transaction.amount);
      } else {
        categoryTotals[categoryName].expenses += Number(transaction.amount);
      }
      categoryTotals[categoryName].total += Number(transaction.amount);
    });
    
    return Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 catégories
  }, [filteredTransactions]);

  // Données par type de compte
  const accountTypeData = useMemo(() => {
    const balanceByType = getBalanceByType();
    return Object.entries(balanceByType).map(([type, balance]) => ({
      type: type === 'bank' ? 'Banque' : 
            type === 'cash' ? 'Liquide' : 
            type === 'grants' ? 'Subventions' : 'Cotisations',
      balance: Number(balance),
      fill: type === 'bank' ? '#8884d8' : 
            type === 'cash' ? '#82ca9d' : 
            type === 'grants' ? '#ffc658' : '#ff7300'
    }));
  }, [getBalanceByType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  if (!user) {
    return null;
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
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FinanceAssoc</h1>
              <p className="text-sm text-muted-foreground">Rapports & Analyses</p>
            </div>
          </div>
          <div className="ml-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">3 derniers mois</SelectItem>
                <SelectItem value="365">Année complète</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistiques générales en 3D */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tableau de bord 3D
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart3DContainer height="300px">
              <Stats3DCard
                title="Recettes totales"
                value={formatCurrency(stats.totalIncome)}
                subtitle={`Sur les ${selectedPeriod} derniers jours`}
                color="#10b981"
                position={[-3, 0, 0]}
              />
              <Stats3DCard
                title="Dépenses totales"
                value={formatCurrency(stats.totalExpenses)}
                subtitle={`Sur les ${selectedPeriod} derniers jours`}
                color="#ef4444"
                position={[-1, 0, 0]}
              />
              <Stats3DCard
                title="Solde net"
                value={formatCurrency(stats.balance)}
                subtitle="Différence recettes - dépenses"
                color={stats.balance >= 0 ? "#10b981" : "#ef4444"}
                position={[1, 0, 0]}
              />
              <Stats3DCard
                title="Transactions"
                value={stats.transactionCount.toString()}
                subtitle={`Moyenne: ${formatCurrency(stats.averageTransaction)}`}
                color="#3b82f6"
                position={[3, 0, 0]}
              />
            </Chart3DContainer>
          </CardContent>
        </Card>

        {/* Graphiques et analyses */}
        <Tabs defaultValue="evolution" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evolution">Évolution</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Évolution des flux financiers en 3D
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart3DContainer height="400px">
                  <Line3DChart
                    data={evolutionData}
                    lines={[
                      { key: 'income', color: '#10b981', name: 'Recettes' },
                      { key: 'expenses', color: '#ef4444', name: 'Dépenses' },
                      { key: 'balance', color: '#3b82f6', name: 'Solde cumulé' }
                    ]}
                    formatValue={formatCurrency}
                  />
                </Chart3DContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Répartition par catégories en 3D
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart3DContainer height="400px">
                    <Bar3DChart
                      data={categoryData.map(cat => ({
                        name: cat.name,
                        value: cat.total,
                        color: COLORS[categoryData.indexOf(cat) % COLORS.length]
                      }))}
                      formatValue={formatCurrency}
                    />
                  </Chart3DContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top des catégories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.slice(0, 6).map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(category.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            {((category.total / stats.totalIncome + stats.totalExpenses) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Répartition des soldes par type de compte en 3D
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart3DContainer height="400px">
                    <Pie3DChart
                      data={accountTypeData.map(account => ({
                        name: account.type,
                        value: account.balance,
                        color: account.fill
                      }))}
                      formatValue={formatCurrency}
                    />
                  </Chart3DContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détail des comptes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {account.type === 'bank' ? 'Banque' : 
                             account.type === 'cash' ? 'Liquide' : 
                             account.type === 'grants' ? 'Subventions' : 'Cotisations'}
                          </Badge>
                        </div>
                        <div className={`text-lg font-bold ${Number(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Number(account.balance))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total général</span>
                      <span className={`text-xl font-bold ${getTotalBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(getTotalBalance())}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison Recettes vs Dépenses en 3D</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart3DContainer height="400px">
                  <Bar3DChart
                    data={[
                      { name: 'Recettes', value: stats.totalIncome, color: '#10b981' },
                      { name: 'Dépenses', value: stats.totalExpenses, color: '#ef4444' },
                      { name: 'Solde net', value: Math.abs(stats.balance), color: stats.balance >= 0 ? '#10b981' : '#ef4444' }
                    ]}
                    formatValue={formatCurrency}
                  />
                </Chart3DContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des tendances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Ratio recettes/dépenses</span>
                      <Badge variant={stats.totalExpenses > 0 && (stats.totalIncome / stats.totalExpenses) > 1 ? "default" : "destructive"}>
                        {stats.totalExpenses > 0 ? (stats.totalIncome / stats.totalExpenses).toFixed(2) : '∞'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Nombre de comptes</span>
                      <Badge variant="outline">{accounts.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Catégories utilisées</span>
                      <Badge variant="outline">{categoryData.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Santé financière</span>
                      <Badge variant={stats.balance >= 0 ? "default" : "destructive"}>
                        {stats.balance >= 0 ? "Positive" : "Attention"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {stats.balance < 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-800">⚠️ Solde négatif</div>
                        <div className="text-red-600">Réduisez vos dépenses ou augmentez vos recettes</div>
                      </div>
                    )}
                    {stats.totalExpenses > stats.totalIncome * 0.8 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="font-medium text-yellow-800">📊 Dépenses élevées</div>
                        <div className="text-yellow-600">Vos dépenses représentent plus de 80% des recettes</div>
                      </div>
                    )}
                    {stats.transactionCount < 5 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-blue-800">📈 Peu de données</div>
                        <div className="text-blue-600">Enregistrez plus de transactions pour de meilleures analyses</div>
                      </div>
                    )}
                    {stats.balance >= 0 && stats.totalIncome > stats.totalExpenses * 1.2 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">✅ Excellente gestion</div>
                        <div className="text-green-600">Vos finances sont bien équilibrées</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}