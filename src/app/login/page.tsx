import LoginForm from "./LoginForm";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="page">
      <div className="max-w-md w-full flex flex-col items-center justify-center">
        <h2 className="font-semibold text-center text-3xl text-gray-300 mb-4">
          Golang Auth!
        </h2>
        <LoginForm />
        <div className="mt-2">
          <Link href="/forgot-password">
            <p className="link-slate-500">Forgot your password?</p>
          </Link>
        </div>
        <HomeButton />
      </div>
    </div>
  );
}
