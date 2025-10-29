import './App.css'
import AiTest from "./AiTest.jsx";
import {RouterProvider} from "react-router-dom";
import {router} from "./routes/router-config"
import {Toaster} from "react-hot-toast";

function App() {

  return (
    <>
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
            }}
        />
        <RouterProvider router={router} />
    </>
  )
}

export default App
