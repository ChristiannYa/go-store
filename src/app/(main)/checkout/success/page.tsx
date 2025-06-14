import HomeButton from "@/components/HomeButton";

export default function SuccessPage() {
  return (
    <div className="page min-h-dvh">
      <h1 className="font-[600] text-blue-500 text-2xl">Success</h1>
      <p>Your payment was successful.</p>
      <HomeButton />
    </div>
  );
}
