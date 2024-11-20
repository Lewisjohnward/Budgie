import { Link } from "react-router-dom";
import { bannerColor, bannerColorText } from "../../core/theme/colors";
import { GiHamburgerMenu } from "../../core/icons/icons";
import { useMenu } from "../budget/hooks/useMenu";

export default function LandingPage() {
  const { menu } = useMenu();

  return <LandingContent menu={menu} />;
}

type MenuProps = {
  menu: {
    visible: boolean;
    toggle: () => void;
  };
};

function LandingContent({ menu }: MenuProps) {
  return (
    <>
      <TopBar menu={menu} />
      <Body menuVisible={menu.visible} />
    </>
  );
}

function TopBar({ menu }: MenuProps) {
  return (
    <div>
      <div className={`fixed w-full flex justify-center z-10 ${bannerColor}`}>
        <div
          className={`flex-grow flex justify-between items-center max-w-screen-xl py-4 px-2 lg:px-4 ${bannerColor}`}
        >
          <div className="flex items-center gap-8">
            <Logo />
            <NavBar />
          </div>
          <MenuButton onClick={menu.toggle} />
          <AuthActions />
        </div>
      </div>
      <Menu visible={menu.visible} />
    </div>
  );
}

function Menu({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed w-full h-screen p-4 ${bannerColor} transform ease-in-out transition-transform duration-300 md:hidden ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex justify-center items-center bg-red-200 transform-none overflow-scroll"></div>
    </div>
  );
}

function Logo() {
  return <h1 className="text-2xl lg:text-3xl text-white font-bold">Budgie.</h1>;
}

function NavBar() {
  return (
    <ul className="hidden md:block">
      <Link className="text-white hover:underline" to={"#"}>
        What is Budgie?
      </Link>
    </ul>
  );
}

function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <ul className="md:hidden hover:cursor-pointer">
      <GiHamburgerMenu
        className="text-white"
        size={28}
        onClick={() => onClick()}
      />
    </ul>
  );
}

function AuthActions() {
  return (
    <ul className="hidden md:flex items-center space-x-10">
      <li className="text-white hover:cursor-pointer hover:underline">
        <Link to={`/users/login`}>Log In</Link>
      </li>
      <li
        className={`px-4 py-2 bg-lime-400 ${bannerColorText} font-semibold rounded-md hover:cursor-pointer hover:bg-lime-500`}
      >
        <Link to={`/users/login`}>Join Budgie</Link>
      </li>
    </ul>
  );
}

function Body({ menuVisible }: { menuVisible: boolean }) {
  return (
    <div className={`h-screen ${menuVisible && "overflow-hidden"}`}>
      <HomeHero />
      <section className="h-[5000px] bg-amber-50"></section>
    </div>
  );
}

function HomeHero() {
  return (
    <section className="flex justify-center pt-20 pb-40 bg-indigo-500">
      <div className="max-w-screen-xl px-4 pt-20 bg-indigo-500">
        <div className="flex gap-40">
          <div>
            <h1 className="text-4xl text-white font-bold pb-4">
              Rethink your relationship with money.
            </h1>
            <p className="italic text-white pb-4">
              Budgie aims to help thousands discover how to spend wisely, save
              confidently, and live joyfully through a straightforward set of
              transformative habits.
            </p>
            <Link
              className={`block md:inline-block px-4 py-4 bg-lime-400 ${bannerColorText} text-center font-semibold rounded-md hover:cursor-pointer hover:bg-lime-500`}
              to={`/users/login`}
            >
              Join Budgie
            </Link>
          </div>
          <div className="hidden md:block bg-pink-400 w-10/12"></div>
        </div>
      </div>
    </section>
  );
}
