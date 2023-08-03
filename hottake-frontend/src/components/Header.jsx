import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-max my-4 mx-auto">
      <div className="px-4 pt-4 font-surreal text-7xl sm:text-9xl -rotate-1 ">
        <Link
          className="transition ease-in-out duration-200 sm:hover:drop-shadow-[4px_4px_0_rgb(239,68,68)] hover:drop-shadow-[2px_2px_0_rgb(239,68,68)]  hover:shadow-red-500"
          to={"/"}
        >
          <span className="text-6xl sm:text-8xl">hot</span>Takes
        </Link>
      </div>
    </header>
  );
};

export default Header;
