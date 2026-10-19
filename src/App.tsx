import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import LocalStorageSaver from "@/containers/helpers/LocalStorageSaver";
import Layout from "@/containers/Layout";
import { setupStore } from "@/store/store";

export const store = setupStore();

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout />
        <LocalStorageSaver />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
