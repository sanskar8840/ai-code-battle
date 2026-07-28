import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./routes/AppRoutes";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--toast-bg, #131829)",
              color: "#F4F2EE",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22C55E", secondary: "#131829" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#131829" } },
          }}
        />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
