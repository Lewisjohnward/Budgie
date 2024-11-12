import { Link } from "react-router-dom";
import { bannerColor, bannerColorText } from "../../core/theme/colors";

export default function LandingPage() {
  return (
    <div className="">
      <TopBar />
      <Body />
    </div>
  );
}

function TopBar() {
  return (
    <div
      className={`flex justify-between items-center px-[480px] py-4 ${bannerColor}`}
    >
      <h1 className="text-2xl text-white font-bold">Budgie.</h1>
      <ul className="flex items-center space-x-10">
        <li className="text-white hover:cursor-pointer hover:underline">
          <Link to={`login`}>Log In</Link>
        </li>
        <li
          className={`px-4 py-2 bg-lime-400 ${bannerColorText} rounded-md hover:cursor-pointer hover:bg-lime-500`}
        >
          <Link to={`login`}>Start Your Free Trial</Link>
        </li>
      </ul>
    </div>
  );
}

function Body() {
  return (
    <div className="h-[5000px] bg-indigo-500">
      <p>body</p>
    </div>
  );
}
