import { AppProviders } from "@/app/providers/appProviders";
import { AppRouter } from "@/app/router";

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </div>
  );
}

export default App;
