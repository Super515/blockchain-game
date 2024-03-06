import toast from "react-hot-toast";
export const BASEURL = "http://localhost:4000";
// export const BASEURL = "http://93.188.167.90:4000";

export const successToast = (message) => toast.success(message);
export const errorToast = (message) => toast.error(message);
