import { Link } from "react-router-dom";

const Card = ({ data }) => {
  return (
    <Link to={`/${data._id}`}>
      <div
        className="cursor-pointer duration-100 hover:shadow-xl max-w-xs m-2 text-center rounded-lg shadow-md p-0 pb-2"
      >
        {data && (
          <div>
            <div className="w-60 overflow-hidden">
              <img
                className="w-full  rounded-lg"
                // src={BASEURL + "/images/" + data.imageUrl}
                src={data.imageUrl}
                alt=""
                style={{ minHeight: 240 }}
              />
            </div>
            <div className="py-4">
              <div className="py-2">
                <p className="font-bold text-xl">{data.brand}</p>
                <p className="font-bold text-xl">{data.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Card;
