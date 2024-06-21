import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Search from "./components/Search";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Employee Search</h1>
        <Search />
      </div>
    </QueryClientProvider>
  );
}

export default App;
