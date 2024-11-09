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
    <div className="flex justify-between items-center px-[480px] py-4 bg-violet-950">
      <h1 className="text-2xl text-white font-bold">Budgie.</h1>
      {/* <h1 className="text-white">What is E</h1> */}
      <div className="space-x-10">
        <button className="text-white hover:underline">Log In</button>
        <button className="px-4 py-2 bg-lime-400 text-sky-900 rounded-md hover:bg-lime-500">
          Star Your Free Trial
        </button>
      </div>
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
