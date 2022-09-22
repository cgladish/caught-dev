import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChannelGrid, { GRID_WIDTH } from "./ChannelGrid";
import { Dispatch } from "../../../redux";
import { getDiscordUserInfo } from "../../../redux/appLogin/selectors";
import Login from "../Login";
import { ActionType } from "../../../redux/preservationRules/actions";
import { getSaveStatus } from "../../../redux/preservationRules/selectors";
import {
  InfoOutlined,
  ArrowForward,
  Refresh,
  Save,
  CancelOutlined,
  Clear,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { TextField, Typography, Tooltip, Button } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const combineDateAndTime = (date: Date, time: Date | null) => {
  if (!time) {
    return date;
  }
  return new Date(date.toLocaleDateString() + " " + time.toLocaleTimeString());
};

export default function CreateOrEdit() {
  const dispatch = useDispatch<Dispatch>();

  const userInfo = useSelector(getDiscordUserInfo);
  const saveStatus = useSelector(getSaveStatus);

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
  const [autoPreserveNewGuilds, setAutoPreserveNewGuilds] =
    useState<boolean>(false);
  const [autoPreserveNewChannels, setAutoPreserveNewChannels] = useState<{
    [guildId: string]: boolean;
  }>({});
  const [autoPreserveNewDmChannels, setAutoPreserveNewDmChannels] =
    useState<boolean>(false);

  const areDatesValid = useMemo(() => {
    if (!startDate || !endDate) {
      return true;
    }
    const startDatetime = combineDateAndTime(startDate, startTime);
    const endDatetime = combineDateAndTime(endDate, endTime);
    return startDatetime < endDatetime;
  }, [startDate, startTime, endDate, endTime]);

  const isSaving = saveStatus === "pending";
  const isSaveDisabled = useMemo(
    () =>
      isSaving ||
      !areDatesValid ||
      !ruleName ||
      (!Object.values(selectedGuilds).some((selected) => selected) &&
        !Object.values(selectedChannels).some((selected) => selected) &&
        !Object.values(selectedDmChannels).some((selected) => selected) &&
        !autoPreserveNewGuilds &&
        !Object.values(autoPreserveNewChannels).some((selected) => selected) &&
        !autoPreserveNewDmChannels),
    [saveStatus, areDatesValid, !!ruleName, selectedGuilds, selectedChannels]
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
              guildIds: Object.keys(selectedGuilds).filter(
                (guildId) => selectedGuilds[guildId]
              ),
              channelIds: Object.keys(selectedChannels).filter(
                (channelId) => selectedChannels[channelId]
              ),
              dmChannelIds: Object.keys(selectedDmChannels).filter(
                (dmChannelId) => selectedDmChannels[dmChannelId]
              ),
              autoPreserveNewGuilds,
              autoPreserveNewChannelsGuildIds: Object.keys(
                autoPreserveNewChannels
              ).filter((guildId) => autoPreserveNewChannels[guildId]),
              autoPreserveNewDmChannels,
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
    <div style={{ marginLeft: 40, marginTop: 20, width: GRID_WIDTH }}>
      <ChannelGrid
        selectedGuilds={selectedGuilds}
        setSelectedGuilds={setSelectedGuilds}
        selectedChannels={selectedChannels}
        setSelectedChannels={setSelectedChannels}
        selectedDmChannels={selectedDmChannels}
        setSelectedDmChannels={setSelectedDmChannels}
        autoPreserveNewGuilds={autoPreserveNewGuilds}
        setAutoPreserveNewGuilds={setAutoPreserveNewGuilds}
        autoPreserveNewChannels={autoPreserveNewChannels}
        setAutoPreserveNewChannels={setAutoPreserveNewChannels}
        autoPreserveNewDmChannels={autoPreserveNewDmChannels}
        setAutoPreserveNewDmChannels={setAutoPreserveNewDmChannels}
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
      <div
        style={{
          display: "flex",
          marginTop: 40,
          width: "100%",
        }}
      >
        <Button
          startIcon={<Clear />}
          onClick={() => {}}
          size="large"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <div style={{ marginLeft: "auto" }}>
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
            disabled={isSaving}
          >
            Reset
          </Button>
          <LoadingButton
            variant="contained"
            startIcon={<Save />}
            style={{ marginLeft: 10 }}
            disabled={isSaveDisabled}
            loading={isSaving}
            size="large"
            onClick={() => submitForm()}
          >
            Save
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
