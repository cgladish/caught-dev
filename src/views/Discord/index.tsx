import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../../redux";
import { ActionType as AppLoginActionType } from "../../redux/appLogin/actions";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";
import Login from "./Login";
import Header from "./Header";
import CreateOrEdit from "./CreateOrEdit";
import { Routes, Route } from "react-router-dom";
import PreservationRules from "./PreservationRules";
import PreservationRule from "./PreservationRule";

export default function Discord() {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);
  const [fetchUserInfoInterval, setFetchUserInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  useEffect(() => {
    if (!userInfo && !fetchUserInfoInterval) {
      const interval = setInterval(() => {
        dispatch({
          type: AppLoginActionType.fetchStart,
          payload: { appName: "discord" },
        });
      }, 1000);
      setFetchUserInterval(interval);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo && fetchUserInfoInterval) {
      clearInterval(fetchUserInfoInterval);
      setFetchUserInterval(null);
    }
  }, [userInfo, fetchUserInfoInterval]);

  if (!userInfo) {
    return <Login />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Header />
      <Routes>
        <Route path="" element={<PreservationRules />} />
        <Route
          path="/rules/:preservationRuleId"
          element={<PreservationRule />}
        />
        <Route path="/rules/create" element={<CreateOrEdit />} />
        <Route
          path="/rules/:preservationRuleId/edit"
          element={<CreateOrEdit />}
        />
      </Routes>
    </div>
  );
}
