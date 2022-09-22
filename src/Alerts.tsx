import { AlertColor, Alert, AlertTitle } from "@mui/material";
import { createContext, ReactNode, useState } from "react";
import { v4 } from "uuid";

type AlertParams = { type: AlertColor; message: string };
type AlertWithId = AlertParams & { id: string };

export const AlertContext = createContext<{
  showAlert: (params: AlertParams) => void;
}>({
  showAlert: () => {},
});

const ALERT_TIMEOUT = 5000;
export default function Alerts({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [alerts, setAlerts] = useState<AlertWithId[]>([]);

  const cancelAlert = (alertId: string) => {
    setAlerts((prevAlerts) => {
      const index = prevAlerts.findIndex(({ id }) => id === alertId);
      if (index !== -1) {
        const newAlerts = prevAlerts.slice();
        newAlerts.splice(index, 1);
        return newAlerts;
      }
      return prevAlerts;
    });
  };
  const showAlert = (alert: AlertParams) => {
    const id = v4();
    setAlerts((prevAlerts) => [...prevAlerts, { ...alert, id }]);
    setTimeout(() => cancelAlert(id), ALERT_TIMEOUT);
  };

  return (
    <>
      <AlertContext.Provider value={{ showAlert }}>
        {children}
      </AlertContext.Provider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 1000,
        }}
      >
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.type}
            onClose={() => cancelAlert(alert.id)}
            style={{ marginBottom: 5, width: 300 }}
          >
            <AlertTitle>
              {alert.type === "success" && "Success"}
              {alert.type === "info" && "Info"}
              {alert.type === "warning" && "Warning"}
              {alert.type === "error" && "Error"}
            </AlertTitle>
            {alert.message}
          </Alert>
        ))}
      </div>
    </>
  );
}
