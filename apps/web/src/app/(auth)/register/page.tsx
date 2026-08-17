import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Crear cuenta — Lumis",
};

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <h1>Crear cuenta</h1>
      <RegisterForm />
      <p>
        ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
      </p>
    </main>
  );
}
