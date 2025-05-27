import RegisterForm from "./RegisterForm";
import HomeButton from "@/app/components/HomeButton";

export default function RegisterPage() {
  return (
    <div className="page">
      <div className="max-w-md w-full flex flex-col items-center justify-center">
        <h2 className="font-semibold text-center text-3xl text-gray-300 mb-4">
          Create your account
        </h2>
        <RegisterForm />
        <HomeButton />
      </div>
    </div>
  );
}
