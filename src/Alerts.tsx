import { AlertColor, Alert, AlertTitle } from "@mui/material";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import { ResourceStatus, RootState } from "./redux";
import * as AppLoginSelectors from "./redux/appLogin/selectors";
import * as DiscordSelectors from "./redux/discord/selectors";
import * as PreservationRulesSelectors from "./redux/preservationRules/selectors";

type AlertParams = { type: AlertColor; message: string };
type AlertWithId = AlertParams & { id: string };

type ShowAlert = (params: AlertParams) => void;
export const AlertContext = createContext<{
  showAlert: ShowAlert;
}>({
  showAlert: () => {},
});

const useShowAlertForStatus = (
  showAlert: ShowAlert,
  selector: (rootState: RootState) => ResourceStatus,
  message: string
) => {
  const status = useSelector(selector);
  useEffect(() => {
    if (status === "errored") {
      showAlert({ type: "error", message });
    }
  }, [status]);
};

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
  const showAlert: ShowAlert = (alert) => {
    const id = v4();
    setAlerts((prevAlerts) => [...prevAlerts, { ...alert, id }]);
    setTimeout(() => cancelAlert(id), ALERT_TIMEOUT);
  };

  useShowAlertForStatus(
    showAlert,
    AppLoginSelectors.getFetchStatus,
    "Failed to fetch app login information"
  );
  useShowAlertForStatus(
    showAlert,
    AppLoginSelectors.getLogoutStatus,
    "Failed to log out of app"
  );
  useShowAlertForStatus(
    showAlert,
    DiscordSelectors.getGuildsFetchStatus,
    "Failed to fetch discord servers"
  );
  useShowAlertForStatus(
    showAlert,
    DiscordSelectors.getChannelsFetchStatus,
    "Failed to fetch discord channels"
  );
  useShowAlertForStatus(
    showAlert,
    DiscordSelectors.getDmChannelsFetchStatus,
    "Failed to fetch discord DMs"
  );
  useShowAlertForStatus(
    showAlert,
    PreservationRulesSelectors.getFetchStatus,
    "Failed to fetch preservation rules"
  );
  useShowAlertForStatus(
    showAlert,
    PreservationRulesSelectors.getSaveStatus,
    "Failed to save preservation rule"
  );

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
