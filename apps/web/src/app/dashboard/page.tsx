import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
        <p className="text-muted-foreground">
          Welcome to Bite Byte. Venue management coming soon.
        </p>
      </div>
    </main>
  );
}
