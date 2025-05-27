import Link from "next/link";

export default function HomeButton() {
  return (
    <div className="flex justify-center items-center mt-4">
      <Link href="/">
        <p className="link-slate-500">Home</p>
      </Link>
    </div>
  );
}
