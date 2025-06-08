"use client";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useTokens } from "@/contexts/TokenContext";

export default function Home() {
  const { user, userIsLoading } = useUser();
  const { isTokenLoading } = useTokens();

  const isLoading = isTokenLoading || userIsLoading;

  return (
    <div className="font-mono grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-dvh gap-4 p-4">
      <header>
        <h1 className="text-3xl">
          <span className="text-sky-400">Golang</span>{" "}
          <span className="underline">Authentication!</span>
        </h1>
      </header>
      <main className="flex flex-col justify-center items-center">
        {isLoading ? (
          <p className="text-lg">Loading...</p>
        ) : !user ? (
          <div className="text-lg text-center flex flex-col gap-y-2">
            <Link href="/register">
              <p className="text-slate-500 hover:text-blue-500 cursor-pointer">
                Register
              </p>
            </Link>
            <Link href="/login">
              <p className="text-slate-500 hover:text-blue-500 cursor-pointer">
                Login
              </p>
            </Link>
          </div>
        ) : (
          <Link href="/account">
            <p className="text-slate-500 hover:text-blue-500 cursor-pointer">
              Account
            </p>
          </Link>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
