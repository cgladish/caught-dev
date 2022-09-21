import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChannelGrid from "./ChannelGrid";
import { Dispatch } from "../../redux";
import { ActionType as AppLoginActionType } from "../../redux/appLogin/actions";
import { getDiscordUserInfo } from "../../redux/appLogin/selectors";
import Login from "./Login";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import ArrowForward from "@mui/icons-material/ArrowForward";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import Save from "@mui/icons-material/Save";
import Refresh from "@mui/icons-material/Refresh";
import { Tooltip } from "@mui/material";
import Header from "./Header";
import { ActionType } from "../../redux/preservationRules/actions";

const combineDateAndTime = (date: Date, time: Date | null) => {
  if (!time) {
    return date;
  }
  return new Date(date.toLocaleDateString() + " " + time.toLocaleTimeString());
};

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

  const [ruleName, setRuleName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedGuilds, setSelectedGuilds] = useState<{
    [guildId: string]: boolean;
  }>({});
  const [selectedChannels, setSelectedChannels] = useState<{
    [channelId: string]: boolean;
  }>({});
  const [selectedDmChannels, setSelectedDmChannels] = useState<{
    [dmChannelId: string]: boolean;
  }>({});

  const areDatesValid = useMemo(() => {
    if (!startDate || !endDate) {
      return true;
    }
    const startDatetime = combineDateAndTime(startDate, startTime);
    const endDatetime = combineDateAndTime(endDate, endTime);
    return startDatetime < endDatetime;
  }, [startDate, startTime, endDate, endTime]);

  const isSaveDisabled = useMemo(
    () =>
      !areDatesValid ||
      !ruleName ||
      (!Object.values(selectedGuilds).some((selected) => selected) &&
        !Object.values(selectedChannels).some((selected) => selected)),
    [areDatesValid, !!ruleName, selectedGuilds, selectedChannels]
  );

  const submitForm = () => {
    if (!isSaveDisabled) {
      dispatch({
        type: ActionType.createStart,
        payload: {
          appName: "discord",
          preservationRule: {
            appName: "discord",
            name: ruleName,
            startDatetime: combineDateAndTime(startDate!, startTime),
            endDatetime: combineDateAndTime(endDate!, endTime),
            selected: {
              guildIds: Object.keys(selectedGuilds),
            },
          },
        },
      });
    }
  };

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
      <div style={{ marginLeft: 40, marginTop: 20 }}>
        <ChannelGrid
          selectedGuilds={selectedGuilds}
          setSelectedGuilds={setSelectedGuilds}
          selectedChannels={selectedChannels}
          setSelectedChannels={setSelectedChannels}
          selectedDmChannels={selectedDmChannels}
          setSelectedDmChannels={setSelectedDmChannels}
        />
        <TextField
          label="New Rule Name"
          value={ruleName}
          onChange={(event) => setRuleName(event.target.value)}
          style={{ marginTop: 40 }}
          required
        />
        <Typography
          style={{
            marginTop: 30,
            marginBottom: 15,
            display: "flex",
            alignItems: "center",
          }}
        >
          Preservation Window
          <Tooltip title="The date and time range that messages will be preserved between.">
            <InfoOutlined style={{ width: 20, marginLeft: 5 }} />
          </Tooltip>
        </Typography>
        <div>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: 160 }}
                error={!areDatesValid}
                helperText={
                  !areDatesValid && "Window start must be before window end."
                }
              />
            )}
          />
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: 150, marginLeft: 5 }}
                error={!areDatesValid}
              />
            )}
          />
          <ArrowForward
            style={{ marginLeft: 5, marginRight: 5, marginTop: 15 }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: 160 }}
                error={!areDatesValid}
              />
            )}
          />
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: 150, marginLeft: 5 }}
                error={!areDatesValid}
              />
            )}
          />
        </div>
        <div style={{ marginTop: 40 }}>
          <Button
            startIcon={<Refresh />}
            onClick={() => {
              setSelectedGuilds({});
              setSelectedChannels({});
              setSelectedDmChannels({});
              setRuleName("");
              setStartDate(null);
              setStartTime(null);
              setEndDate(null);
              setEndTime(null);
            }}
            size="large"
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            style={{ marginLeft: 10 }}
            disabled={isSaveDisabled}
            size="large"
            onClick={() => submitForm()}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
