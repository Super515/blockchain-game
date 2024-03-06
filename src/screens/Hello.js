import LogoImage from "../assets/images/logo.png";
import ManImage from "../assets/images/man.png";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Hello = () => {
    return (
        <div className="flex flex-col min-h-screen" style={{backgroundColor: "#fab727"}}>
            <div className="flex flex-col items-center justify-center py-16">
                <div className=" w-24 md:w-36 lg:w-48 bg-black">
                    <img className="w-full" src={LogoImage} />
                </div>
                <div className="font-bold mt-4">Fud Bitches, Get Money.</div>
            </div>
            <div className="flex-1 flex justify-center items-center ">
                <div className="flex flex-col md:flex-row items-center text-white w-5/6 m-auto md:w-5/6 xl:w-4/6">
                    <div className="w-60 md:w-80 lg:w-96">
                        <Carousel showThumbs={false} showStatus={false} showIndicators={false} showArrows={false} autoPlay infiniteLoop>
                            <div className="">
                                <img className="" src={ManImage} />
                                <p>1 of 2 &#x2192;</p>
                            </div>
                            <div className="">
                                <img className="" src={ManImage} />
                                <p>&#x2190; 2 of 2</p>
                            </div>
                        </Carousel>
                    </div>
                    <div className="md:-ml-24 mt-0 md:-mt-12 text-sm md:text-md lg:text-lg z-10">
                        <p className="mb-8 ">
                            Let me introduce you to the FUD bois. We are a set of self-deprecating individuals who thrive on FUD. Our missing is simple. To spread the word about how much our project sucks. 
                        </p>
                        <p>
                            If you too are tired of endless self promo from copycat projects join the FUD boi's today and become part of a rapidly expanding community of like-minded FUDders. And remember: FUD Bitches, Get Money.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between py-8 m-auto font-bold text-sm md:text-md lg:text-lg">
                <a href="/merch" className="p-2">Home</a>
                <a href="#" className="p-2">Team</a>
                <a href="#" className="p-2">Fud</a>
                <a href="#" className="p-2">Fudmap</a>
                <a href="#" className="p-2">Store</a>
            </div>
        </div>
    );
}

export default Hello;