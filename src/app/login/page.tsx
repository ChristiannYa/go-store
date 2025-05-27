import LoginForm from "./LoginForm";
import HomeButton from "@/components/HomeButton";

export default function RegisterPage() {
  return (
    <div className="page">
      <div className="max-w-md w-full flex flex-col items-center justify-center">
        <h2 className="font-semibold text-center text-3xl text-gray-300 mb-4">
          Golang Auth!
        </h2>
        <LoginForm />
        <HomeButton />
      </div>
    </div>
  );
}
