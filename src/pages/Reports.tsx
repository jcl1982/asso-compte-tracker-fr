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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { DonutChart } from '@/components/DonutChart';
export default function Reports() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    accounts,
    transactions,
    categories,
    getTotalBalance,
    getBalanceByType
  } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('365'); // année complète par défaut

  // Filtrer les transactions par période
  const filteredTransactions = useMemo(() => {
    const daysBack = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return transactions.filter(transaction => new Date(transaction.transaction_date) >= cutoffDate);
  }, [transactions, selectedPeriod]);

  // Calculs statistiques
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
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
    const dailyData: Record<string, {
      date: string;
      income: number;
      expenses: number;
      balance: number;
    }> = {};
    filteredTransactions.forEach(transaction => {
      const date = transaction.transaction_date;
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          income: 0,
          expenses: 0,
          balance: 0
        };
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
        date: new Date(day.date).toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric'
        })
      };
    });
  }, [filteredTransactions]);

  // Données par catégorie
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, {
      name: string;
      income: number;
      expenses: number;
      total: number;
    }> = {};
    filteredTransactions.forEach(transaction => {
      const categoryName = transaction.categories?.name || 'Non catégorisé';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          name: categoryName,
          income: 0,
          expenses: 0,
          total: 0
        };
      }
      if (transaction.type === 'income') {
        categoryTotals[categoryName].income += Number(transaction.amount);
      } else {
        categoryTotals[categoryName].expenses += Number(transaction.amount);
      }
      categoryTotals[categoryName].total += Number(transaction.amount);
    });
    return Object.values(categoryTotals).sort((a, b) => b.total - a.total).slice(0, 8); // Top 8 catégories
  }, [filteredTransactions]);

  // Données par type de compte
  const accountTypeData = useMemo(() => {
    const balanceByType = getBalanceByType();
    return Object.entries(balanceByType).map(([type, balance]) => ({
      type: type === 'bank' ? 'Banque' : type === 'cash' ? 'Liquide' : type === 'grants' ? 'Subventions' : 'Cotisations',
      balance: Number(balance),
      fill: type === 'bank' ? '#8884d8' : type === 'cash' ? '#82ca9d' : type === 'grants' ? '#ffc658' : '#ff7300'
    }));
  }, [getBalanceByType]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  // Données pour le donut chart des comptes
  const donutChartData = useMemo(() => {
    const balanceByType = getBalanceByType();
    return Object.entries(balanceByType).map(([type, balance]) => ({
      name: type === 'bank' ? 'Banque' : type === 'cash' ? 'Liquide' : type === 'grants' ? 'Subventions' : 'Cotisations',
      value: Number(balance),
      color: type === 'bank' ? 'hsl(var(--primary))' : type === 'cash' ? 'hsl(142, 76%, 36%)' : type === 'grants' ? 'hsl(48, 100%, 67%)' : 'hsl(24, 100%, 50%)'
    }));
  }, [getBalanceByType]);

  // Données pour le donut chart des dépenses par catégories
  const expenseDonutData = useMemo(() => {
    const expenseCategories = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, transaction) => {
      const categoryName = transaction.categories?.name || 'Non catégorisé';
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(expenseCategories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value); // Toutes les catégories
  }, [filteredTransactions]);

  // Données pour le donut chart des recettes par catégories
  const incomeDonutData = useMemo(() => {
    const incomeCategories = filteredTransactions.filter(t => t.type === 'income').reduce((acc, transaction) => {
      const categoryName = transaction.categories?.name || 'Non catégorisé';
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(incomeCategories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[(index + 3) % COLORS.length] // Décalage pour différencier les couleurs
    })).sort((a, b) => b.value - a.value); // Toutes les catégories
  }, [filteredTransactions]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  if (!user) {
    return null;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
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
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recettes totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur les {selectedPeriod} derniers jours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur les {selectedPeriod} derniers jours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solde net</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Différence recettes - dépenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.transactionCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne: {formatCurrency(stats.averageTransaction)}
              </p>
            </CardContent>
          </Card>
        </div>

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
                  Évolution des flux financiers
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData} margin={{
                    top: 20,
                    right: 30,
                    left: 25,
                    bottom: 20
                  }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={value => {
                      // Format plus compact pour l'axe Y
                      if (Math.abs(value) >= 1000) {
                        return `${(value / 1000).toFixed(0)}k€`;
                      }
                      return `${value}€`;
                    }} width={70} />
                        <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Recettes' : name === 'expenses' ? 'Dépenses' : 'Solde cumulé']} />
                        <Line type="monotone" dataKey="income" stroke="#10b981" name="income" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="expenses" strokeWidth={2} />
                        <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="balance" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Titre principal */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Analyse par catégories - {selectedPeriod} derniers jours</h2>
              <p className="text-muted-foreground">Répartition détaillée des recettes et dépenses</p>
            </div>

            {/* Graphiques Recettes et Dépenses côte à côte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Graphique des Recettes */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <TrendingUp className="h-5 w-5" />
                    Recettes {new Date().getFullYear()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <DonutChart data={incomeDonutData} centerText={{
                    title: "Total Recettes",
                    value: formatCurrency(stats.totalIncome)
                  }} />
                  </div>
                </CardContent>
              </Card>

              {/* Graphique des Dépenses */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <TrendingDown className="h-5 w-5" />
                    Dépenses {new Date().getFullYear()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-80">
                    <DonutChart data={expenseDonutData} centerText={{
                    title: "Total Dépenses",
                    value: formatCurrency(stats.totalExpenses)
                  }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tableaux détaillés */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Détail des recettes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Détail des recettes par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {incomeDonutData.map((category, index) => <div key={category.name} className="flex items-center justify-between p-1 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{
                        backgroundColor: category.color
                      }} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(category.value)}</div>
                          <div className="text-sm text-muted-foreground">
                            {stats.totalIncome > 0 ? (category.value / stats.totalIncome * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              {/* Détail des dépenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300">Détail des dépenses par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {expenseDonutData.map((category, index) => <div key={category.name} className="flex items-center justify-between p-1 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{
                        backgroundColor: category.color
                      }} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{formatCurrency(category.value)}</div>
                          <div className="text-sm text-muted-foreground">
                            {stats.totalExpenses > 0 ? (category.value / stats.totalExpenses * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>)}
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
                    Répartition des soldes par type de compte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <DonutChart data={donutChartData} centerText={{
                    title: "Solde total",
                    value: formatCurrency(getTotalBalance())
                  }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détail des comptes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map(account => <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {account.type === 'bank' ? 'Banque' : account.type === 'cash' ? 'Liquide' : account.type === 'grants' ? 'Subventions' : 'Cotisations'}
                          </Badge>
                        </div>
                        <div className={`text-lg font-bold ${Number(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Number(account.balance))}
                        </div>
                      </div>)}
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
                <CardTitle>Comparaison Recettes vs Dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{
                    name: 'Recettes',
                    montant: stats.totalIncome,
                    fill: '#10b981'
                  }, {
                    name: 'Dépenses',
                    montant: stats.totalExpenses,
                    fill: '#ef4444'
                  }, {
                    name: 'Solde net',
                    montant: Math.abs(stats.balance),
                    fill: stats.balance >= 0 ? '#10b981' : '#ef4444'
                  }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={value => formatCurrency(value)} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="montant">
                        {[{
                        name: 'Recettes',
                        montant: stats.totalIncome,
                        fill: '#10b981'
                      }, {
                        name: 'Dépenses',
                        montant: stats.totalExpenses,
                        fill: '#ef4444'
                      }, {
                        name: 'Solde net',
                        montant: Math.abs(stats.balance),
                        fill: stats.balance >= 0 ? '#10b981' : '#ef4444'
                      }].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                      <Badge variant={stats.totalExpenses > 0 && stats.totalIncome / stats.totalExpenses > 1 ? "default" : "destructive"}>
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
                    {stats.balance < 0 && <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-800">⚠️ Solde négatif</div>
                        <div className="text-red-600">Réduisez vos dépenses ou augmentez vos recettes</div>
                      </div>}
                    {stats.totalExpenses > stats.totalIncome * 0.8 && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="font-medium text-yellow-800">📊 Dépenses élevées</div>
                        <div className="text-yellow-600">Vos dépenses représentent plus de 80% des recettes</div>
                      </div>}
                    {stats.transactionCount < 5 && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-blue-800">📈 Peu de données</div>
                        <div className="text-blue-600">Enregistrez plus de transactions pour de meilleures analyses</div>
                      </div>}
                    {stats.balance >= 0 && stats.totalIncome > stats.totalExpenses * 1.2 && <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">✅ Excellente gestion</div>
                        <div className="text-green-600">Vos finances sont bien équilibrées</div>
                      </div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>;
}