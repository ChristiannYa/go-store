import HomeButton from "@/app/components/HomeButton";

export default function Page() {
  return (
    <div className="page">
      <div>
        <div className="text-center">
          <h1 className="text-3xl">Account Page</h1>
          <h2 className="text-xl">Welcome</h2>
        </div>
        <HomeButton />
      </div>
    </div>
  );
}
