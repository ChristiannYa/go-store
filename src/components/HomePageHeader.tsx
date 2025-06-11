import { useTokens } from "@/contexts/TokenContext";
import { useUser } from "@/contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function HomePageHeader() {
  const { user, userIsLoading } = useUser();
  const { isTokenLoading } = useTokens();

  const isLoading = isTokenLoading || userIsLoading;

  return (
    <header>
      <div className="flex items-center gap-2">
        <h1 className="text-3xl">
          <span className="text-sky-400">Golang</span> <span>Store!</span>
        </h1>
        {isLoading ? (
          /* We could add a loading state, but most of the
          loading is handled by the server checking page */
          <></>
        ) : !user ? (
          <Link href="/login">
            <FontAwesomeIcon
              icon={faRightToBracket}
              size="xl"
              className="text-slate-500 hover:text-blue-500"
            />
          </Link>
        ) : (
          <Link href="/account">
            <FontAwesomeIcon
              icon={faUser}
              size="lg"
              className="text-slate-500 hover:text-blue-500"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
