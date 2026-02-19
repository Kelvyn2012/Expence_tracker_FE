import api from '../lib/api';
import { Button, Card, CardHeader, CardTitle, CardContent, Label } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleTheme = async () => {
      const newTheme = user?.theme_preference === 'dark' ? 'light' : 'dark';
      setLoading(true);
      try {
          const { data } = await api.patch('/auth/preferences/', { theme_preference: newTheme });
          // Backend should return updated user or we just update local state
          // Assuming backend returns nothing or full user, let's just optimistically update or use response
          // Requirement says: "Return updated user"
          // Wait, response structure for patch? 
          // user view uses UpdateAPIView -> returns object.
          // But our AuthContext expects User object.
          // Let's assume data is the user object.
          // Or we can just use the spread from current user
           if (data && data.theme_preference) {
               updateUser({ ...user!, theme_preference: data.theme_preference });
           } else {
               updateUser({ ...user!, theme_preference: newTheme });
           }
      } catch (err) {
          console.error("Failed to update theme", err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
           <div className="space-y-1">
               <Label>Theme Preference</Label>
               <p className="text-sm text-muted-foreground">
                   Switch between light and dark mode.
               </p>
           </div>
           
           <Button variant="outline" onClick={toggleTheme} disabled={loading}>
               {user?.theme_preference === 'dark' ? (
                   <>
                       <Sun className="mr-2 h-4 w-4" /> Light Mode
                   </>
               ) : (
                   <>
                       <Moon className="mr-2 h-4 w-4" /> Dark Mode
                   </>
               )}
           </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                  </div>
                   <div>
                      <Label className="text-muted-foreground">Member Since</Label>
                      <p className="font-medium">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}</p>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
