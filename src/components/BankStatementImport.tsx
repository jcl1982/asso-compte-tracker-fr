import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance, Account } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface ImportedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  accountName?: string;
}

export function BankStatementImport() {
  const { accounts, categories, createTransaction } = useFinance();
  const { toast } = useToast();
  
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedData, setImportedData] = useState<ImportedTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ImportedTransaction[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const transactions = parseTransactionData(jsonData);
        setImportedData(transactions);
        setPreviewData(transactions.slice(0, 5)); // Aperçu des 5 premières lignes
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de lire le fichier Excel",
          variant: "destructive"
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseTransactionData = (data: any[]): ImportedTransaction[] => {
    return data.map((row, index) => {
      // Essayer différents formats de colonnes courantes
      const date = row['Date'] || row['date'] || row['DATE'] || row['Date de valeur'] || '';
      const description = row['Description'] || row['description'] || row['Libellé'] || row['Opération'] || '';
      let amount = row['Montant'] || row['montant'] || row['Amount'] || row['amount'] || row['Crédit'] || row['Débit'] || 0;
      
      // Traitement du montant pour gérer les différents formats
      if (typeof amount === 'string') {
        amount = parseFloat(amount.replace(/[^\d.-]/g, ''));
      }
      
      // Déterminer le type (recette/dépense) basé sur le signe du montant
      const type: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense';
      
      return {
        date: formatDate(date),
        description: String(description),
        amount: Math.abs(Number(amount)),
        type,
        category: '',
        accountName: ''
      };
    }).filter(transaction => 
      transaction.date && 
      transaction.amount > 0 && 
      transaction.description
    );
  };

  const formatDate = (dateInput: any): string => {
    if (!dateInput) return new Date().toISOString().split('T')[0];
    
    try {
      // Si c'est un nombre Excel date
      if (typeof dateInput === 'number') {
        const date = XLSX.SSF.parse_date_code(dateInput);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // Si c'est une chaîne, essayer de la parser
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const handleImport = async () => {
    if (!selectedAccount || importedData.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez un compte et assurez-vous d'avoir des données à importer",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      const totalTransactions = importedData.length;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < totalTransactions; i++) {
        const transaction = importedData[i];
        
        try {
          await createTransaction({
            account_id: selectedAccount,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            transaction_date: transaction.date,
            category_id: undefined
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Erreur lors de l\'import de la transaction:', error);
        }
        
        setImportProgress(Math.round(((i + 1) / totalTransactions) * 100));
        
        // Petite pause pour éviter de surcharger la base de données
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast({
        title: "Import terminé",
        description: `${successCount} transactions importées avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`,
        variant: successCount > 0 ? "default" : "destructive"
      });

      if (successCount > 0) {
        setShowImportDialog(false);
        setImportedData([]);
        setPreviewData([]);
        setSelectedAccount('');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'import des transactions",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const getAmountColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importer un relevé bancaire
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import de relevé bancaire Excel
          </DialogTitle>
          <DialogDescription>
            Importez vos transactions bancaires depuis un fichier Excel (.xlsx, .xls)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection du fichier */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Fichier Excel</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
            />
            <p className="text-sm text-muted-foreground">
              Le fichier doit contenir des colonnes pour : Date, Description/Libellé, Montant
            </p>
          </div>

          {/* Sélection du compte */}
          {importedData.length > 0 && (
            <div className="space-y-2">
              <Label>Compte de destination</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Aperçu des données */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aperçu des données</h3>
                <Badge variant="secondary">
                  {importedData.length} transaction{importedData.length > 1 ? 's' : ''} détectée{importedData.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                              {transaction.type === 'income' ? (
                                <><TrendingUp className="h-3 w-3 mr-1" />Recette</>
                              ) : (
                                <><TrendingDown className="h-3 w-3 mr-1" />Dépense</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${getAmountColor(transaction.type)}`}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {importedData.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... et {importedData.length - 5} transaction{importedData.length - 5 > 1 ? 's' : ''} supplémentaire{importedData.length - 5 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Barre de progression lors de l'import */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import en cours...</span>
                <span className="text-sm text-muted-foreground">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
              disabled={importing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!selectedAccount || importedData.length === 0 || importing}
            >
              {importing ? 'Import en cours...' : `Importer ${importedData.length} transaction${importedData.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}