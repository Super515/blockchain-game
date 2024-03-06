const Footer = ({ isRaffle }) => {
  return (
    <div className={`border-gray-800 py-2 border-t-2 ${isRaffle ? "text-white" : "text-black"}`}>
      <div className="max-w-6xl m-auto items-center p-2 flex justify-between flex-col md:flex-row">
        <p className="mb-4">Copyrights © All Rights Reserved by @FUDBOIS </p>
        <p className="mb-4">Powered by <b><a target="_blank" href="https://alimango.studio/" className=" text--base ms-2">Alimango Studios</a></b></p>
        <div className="flex ">
          <a href="https://discord.com/invite/veE8b428YN" target="_blank"><div className="w-8  h-8 flex mx-2 items-center justify-center rounded-full bg-black">
            <i className="text-gray-200 fa-brands fa-discord"></i>
          </div></a>
          <a href="https://mobile.twitter.com/DrunkenApeSC" target="_blank"><div className="w-8  h-8 flex mx-2 items-center justify-center rounded-full bg-black">
            <i className="text-gray-200 fa-brands fa-twitter"></i>{" "}
          </div></a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
