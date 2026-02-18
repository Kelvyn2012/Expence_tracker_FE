import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { SpendingCharts } from '../components/SpendingCharts';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '../components/ui';
import { Link } from 'react-router-dom';
import { PlusCircle, Download, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { expensesQuery, summaryQuery, deleteExpense } = useExpenses({ 
      page, 
      category: categoryFilter || undefined 
  });
  
  const handleExport = async () => {
     try {
         const response = await api.get('/expenses/export/', { responseType: 'blob' });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `expenses_export.csv`);
         document.body.appendChild(link);
         link.click();
         link.remove();
     } catch (e) {
         console.error("Export failed", e);
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handleExport}>
             <Download className="mr-2 h-4 w-4" /> Export CSV
           </Button>
           <Link to="/expenses/new">
             <Button>
               <PlusCircle className="mr-2 h-4 w-4" /> New Expense
             </Button>
           </Link>
        </div>
      </div>

      {/* Charts */}
      <SpendingCharts data={summaryQuery.data} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (Month)</CardTitle>
            <span className="text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {summaryQuery.isLoading ? "..." : `$${summaryQuery.data?.total_spend || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryQuery.data?.count} expenses recorded
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {summaryQuery.data?.breakdown?.[0]?.category || "None"}
                </div>
                 <p className="text-xs text-muted-foreground">
                    ${summaryQuery.data?.breakdown?.[0]?.total || 0}
                </p>
            </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
           <CardTitle>Recent Expenses</CardTitle>
           <div className="flex gap-2 mt-2">
               <Input 
                 placeholder="Filter by category..." 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="max-w-sm"
               />
           </div>
        </CardHeader>
        <CardContent>
           {expensesQuery.isLoading ? (
               <div className="text-center py-4">Loading expenses...</div>
           ) : (
               <div className="relative w-full overflow-auto">
                   <table className="w-full caption-bottom text-sm">
                       <thead className="[&_tr]:border-b">
                           <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                               <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                               <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                               <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                               <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                               <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="[&_tr:last-child]:border-0">
                           {expensesQuery.data?.results.map((expense) => (
                               <tr key={expense.id} className="border-b transition-colors hover:bg-muted/50">
                                   <td className="p-4 align-middle">
                                       {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                                   </td>
                                   <td className="p-4 align-middle font-medium">{expense.title}</td>
                                   <td className="p-4 align-middle">
                                       <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                           {expense.category}
                                       </span>
                                   </td>
                                   <td className="p-4 align-middle text-right">
                                       {expense.currency} {expense.amount}
                                   </td>
                                   <td className="p-4 align-middle text-right">
                                       <div className="flex justify-end gap-2">
                                           <Link to={`/expenses/${expense.id}`}>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                  <Edit className="h-4 w-4" />
                                              </Button>
                                           </Link>
                                           <Button 
                                             variant="ghost" 
                                             size="sm" 
                                             className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                             onClick={() => {
                                                 if(confirm('Are you sure?')) deleteExpense.mutate(expense.id)
                                             }}
                                           >
                                               <Trash2 className="h-4 w-4" />
                                           </Button>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                           {!expensesQuery.data?.results.length && (
                               <tr>
                                   <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                       No expenses found.
                                   </td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           )}
           
           {/* Pagination */}
           <div className="flex items-center justify-end space-x-2 py-4">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setPage(p => Math.max(1, p - 1))}
                 disabled={page === 1}
               >
                 Previous
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setPage(p => p + 1)}
                 disabled={!expensesQuery.data?.next}
               >
                 Next
               </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
