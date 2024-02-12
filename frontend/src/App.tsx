import Banner from "./Components/Carousel/Banner";
import Footer from "./Components/Footer/Footer";
import { Header } from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";

export const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-w-[100vw]  ">
      <div className="w-full h-full max-w-[1800px] flex flex-col justify-center items-center">
        <div className="mb-[100px] z-50">
          <Header />
        </div>
        <div className="">
          <Banner />
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
