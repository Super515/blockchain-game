import "./App.css";
import MyRoutes from "./MyRoutes";
import { Toaster } from "react-hot-toast";
import { Wallets } from "./components/wallet";
import { SnackbarProvider } from "notistack";


function App() {
  return (
    <div className="App">
      <SnackbarProvider>
        <Wallets>
          <MyRoutes />
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Define default options
              className: "",
              duration: 5000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              // Default options for specific types
              success: {
                duration: 3000,
                theme: {
                  primary: "green",
                  secondary: "black",
                },
              },
            }}
          />
        </Wallets>
      </SnackbarProvider>
    </div>
  );
}

export default App;
