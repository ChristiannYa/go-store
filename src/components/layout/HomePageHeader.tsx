import Link from "next/link";
import { useTokens } from "@/contexts/TokenContext";
import { useUser } from "@/contexts/UserContext";
import { useAppSelector, useCartTab } from "@/hooks/useRedux";
import { selectCartItemsLength } from "@/lib/features/cart/cartSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faUser,
  faBagShopping,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePageHeader() {
  const { user, userIsLoading } = useUser();
  const { isTokenLoading } = useTokens();
  const isLoading = isTokenLoading || userIsLoading;

  const { handleCartTabStatus } = useCartTab();
  const cartItemsLength = useAppSelector(selectCartItemsLength);

  return (
    <header className="flex justify-center items-center">
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
        <button
          onClick={handleCartTabStatus}
          className="bg-slate-500 rounded-full cursor-pointer w-[1.6rem] h-[1.6rem] flex justify-center items-center relative"
        >
          <FontAwesomeIcon
            icon={faBagShopping}
            width={12}
            height={12}
            className="text-white-fg dark:text-black-fg"
          />
          <span className="bg-blue-600 text-black-fg text-xs rounded-full w-[18px] h-[18px] flex items-center justify-center absolute -top-1.5 -right-1.5">
            {cartItemsLength}
          </span>
        </button>
      </div>
    </header>
  );
}
