import React from "react";
import RegistryManagement from "./components/RegsitryManagement.jsx";

const App = () => {
  const styles = {
    app: {
      width: "100vw",
      height: "100vh"
    }
  };

  return (
    <div style={styles.app}>
      <RegistryManagement />
    </div>
  );
};

export default App;