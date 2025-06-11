import LoginForm from "./LoginForm";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="page">
      <div className="max-w-md w-full flex flex-col items-center justify-center">
        <h2 className="font-semibold text-center text-3xl text-gray-300 mb-4">
          Golang Store!
        </h2>
        <LoginForm />
        <div className="mt-2">
          <Link href="/forgot-password">
            <p className="link-slate-500">Forgot your password?</p>
          </Link>
        </div>
        <div className="flex gap-1">
          <p>Don&apos;t have an account?</p>
          <Link href="/register">
            <p className="text-slate-500 hover:text-blue-500 cursor-pointer">
              Register
            </p>
          </Link>
        </div>
        <HomeButton />
      </div>
    </div>
  );
}
