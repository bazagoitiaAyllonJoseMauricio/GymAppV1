import { createContext, useContext, useState, useEffect } from "react";

export const DataContext = createContext();

export function DataContextProvider({ children, user }) {
  const [contextData, setContextData] = useState({
    uid: user?.uid || "",
    email: user?.email || "",
    rol: user?.rol || "",
  });

  useEffect(() => {
    if (user) {
      setContextData({
        uid: user.uid,
        email: user.email,
        rol: user.rol,
      });
    }
  }, [user]);

  const updateContextData = (newData) => {
    setContextData({ ...contextData, ...newData });
  };

  const value = { ...contextData, updateContextData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContextProvider() {
  const data = useContext(DataContext);
  if (!data) {
    throw new Error("useDataContextProvider must be used within DataContextProvider");
  }
  return data;
}
