export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bite Byte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            QR ordering platform for restaurants and food trucks
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
