import { Link } from "react-router-dom";
import { bannerColor, bannerColorText } from "../../core/theme/colors";
import { GiHamburgerMenu } from "../../core/icons/icons";

export default function LandingPage() {
  return (
    <div>
      <LandingContent />
    </div>
  );
}

function LandingContent() {
  return (
    <>
      <TopBar />
      <Body />
    </>
  );
}

function TopBar() {
  return (
    <div className={`flex justify-center ${bannerColor}`}>
      <div
        className={`flex-grow flex justify-between items-center max-w-screen-xl py-4 px-2 lg:px-4 ${bannerColor}`}
      >
        <div className="flex items-center gap-8">
          <Logo />
          <NavBar />
        </div>
        <Menu />
        <AuthActions />
      </div>
    </div>
  );
}

function Logo() {
  return <h1 className="text-2xl lg:text-3xl text-white font-bold">Budgie.</h1>;
}

function NavBar() {
  return (
    <ul className="hidden md:block">
      <li className="text-white">What is Budgie?</li>
    </ul>
  );
}

function Menu() {
  return (
    <ul className="md:hidden">
      <GiHamburgerMenu className="text-white" size={28} />
    </ul>
  );
}

function AuthActions() {
  return (
    <ul className="hidden md:flex items-center space-x-10">
      <li className="text-white hover:cursor-pointer hover:underline">
        <Link to={`login`}>Log In</Link>
      </li>
      <li
        className={`px-4 py-2 bg-lime-400 ${bannerColorText} rounded-md hover:cursor-pointer hover:bg-lime-500`}
      >
        <Link to={`login`}>Start Your Free Trial</Link>
      </li>
    </ul>
  );
}

function Body() {
  return (
    <div className="h-[5000px] bg-indigo-500">
      <p>body</p>
    </div>
  );
}
