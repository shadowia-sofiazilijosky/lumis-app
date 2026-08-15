import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Iniciar sesión — Lumis",
};

export default function LoginPage() {
  return (
    <main>
      <h1>Iniciar sesión</h1>
      <LoginForm />
      <p>
        ¿No tenés cuenta? <Link href="/register">Creá una</Link>
      </p>
    </main>
  );
}
