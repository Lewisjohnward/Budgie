import { Link } from "react-router-dom";
import { darkBlueBg, bannerColorText } from "../../core/theme/colors";
import { useMenu } from "@/pages/landing/hooks/useMenu";
import { cn } from "@/core/lib/utils";

export default function LandingPage() {
  const { menu } = useMenu();

  return (
    <>
      <TopBar menu={menu} />
      <Body menuVisible={menu.visible} />
    </>
  );
}

type MenuProps = {
  menu: {
    visible: boolean;
    toggle: () => void;
  };
};

function TopBar({ menu }: MenuProps) {
  return (
    <div>
      <div className={`fixed w-full flex justify-center z-10 ${darkBlueBg}`}>
        <div
          className={`flex-grow flex justify-between items-center max-w-screen-xl py-4 px-2 lg:px-4 ${darkBlueBg}`}
        >
          <div className="flex items-center gap-8">
            <Logo />
            <NavBar />
          </div>
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
      className={`fixed w-full h-screen p-4 ${darkBlueBg} transform ease-in-out transition-transform duration-300 md:hidden ${visible ? "translate-y-0" : "-translate-y-full"}`}
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

function AuthActions() {
  return (
    <ul className="hidden md:flex items-center space-x-10">
      <li className="text-white hover:cursor-pointer hover:underline">
        <Link to={`/user/login`}>Log In</Link>
      </li>
      <li
        className={`px-4 py-2 bg-lime-400 ${bannerColorText} font-semibold rounded-md hover:cursor-pointer hover:bg-lime-500`}
      >
        <Link to={`/user/login`}>Join Budgie</Link>
      </li>
    </ul>
  );
}

function Body({ menuVisible }: { menuVisible: boolean }) {
  return (
    <div className={cn("h-screen", menuVisible && "overflow-hidden")}>
      <HomeHero />
    </div>
  );
}

function HomeHero() {
  return (
    <section
      className="h-screen flex justify-center bg-[#FEFAEE] bg-cover bg-top bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://cdn.prod.website-files.com/640f69143ec11b21d42015c6/6776d0feb0dad6298ff22ba1_bkg_home_tissuepaper_noise.avif')",
        backgroundSize: "3000px 1300px",
      }}
    >
      <div className="max-w-screen-xl px-4 pt-40">
        <div className="flex gap-40">
          <div className="space-y-4">
            <h1 className="text-4xl text-white text-center md:text-left font-bold pb-4">
              Rethink your relationship with money.
            </h1>
            <p className="italic text-white pb-4 text-center md:text-left">
              Budgie aims to help thousands discover how to spend wisely, save
              confidently, and live joyfully through a straightforward set of
              transformative habits.
            </p>
            <Link
              className={`block md:inline-block px-4 py-4 bg-lime-400 ${bannerColorText} text-center font-semibold rounded-md hover:cursor-pointer hover:bg-lime-500`}
              to={`/user/login`}
            >
              Join Budgie
            </Link>
          </div>
          <div className="hidden md:block w-10/12"></div>
        </div>
      </div>
    </section>
  );
}
