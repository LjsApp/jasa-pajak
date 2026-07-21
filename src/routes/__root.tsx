import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAdminLoggedIn } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Halaman gagal dimuat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terjadi kesalahan. Coba refresh halaman atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isPublic =
    path === "/" ||
    path === "/kalkulator" ||
    path === "/blog" ||
    path.startsWith("/blog/");
  const isLogin = path === "/admin/login";
  const navigate = useNavigate();

  // Inisialisasi langsung — hindari flash frame 'false' yang menyebabkan
  // halaman login muncul sebentar sebelum AppShell.
  const [checked, setChecked] = useState<boolean>(
    () => isPublic || isLogin || isAdminLoggedIn()
  );

  useEffect(() => {
    if (isPublic || isLogin) {
      setChecked(true);
      return;
    }
    if (!isAdminLoggedIn()) {
      setChecked(false);
      navigate({ to: "/admin/login", replace: true });
    } else {
      setChecked(true);
    }
  }, [path, isPublic, isLogin, navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      {isPublic || isLogin ? (
        <Outlet />
      ) : checked ? (
        <AppShell />
      ) : (
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Memuat…</div>
      )}
    </QueryClientProvider>
  );
}

