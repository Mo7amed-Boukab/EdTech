import { AppRouter } from "./routes/AppRouter";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
