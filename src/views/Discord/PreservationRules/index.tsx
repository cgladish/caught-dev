import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  LinearProgress,
  LinearProgressProps,
  Typography,
} from "@mui/material";
import { sortBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/preservationRules/actions";
import { BackupsInProgress } from "../../../../api/messages";
import {
  getDiscordPreservationRules,
  getSaveStatus,
} from "../../../redux/preservationRules/selectors";
import { timeAgo } from "../../../utils";

function LinearProgressWithLabel({
  errored,
  ...props
}: LinearProgressProps & { value: number; errored: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          color={errored ? "error" : "primary"}
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          color={errored ? "error" : "text.secondary"}
        >
          {Math.round(props.value)}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function PreservationRules() {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();

  const [backupProgress, setBackupProgress] = useState<BackupsInProgress>({});

  const saveStatus = useSelector(getSaveStatus);

  const preservationRules = useSelector(getDiscordPreservationRules);
  useEffect(() => {
    if (!preservationRules) {
      dispatch({
        type: ActionType.fetchStart,
        payload: { appName: "discord" },
      });
    }
  }, []);

  const sortedPreservationRules = useMemo(
    () =>
      preservationRules &&
      sortBy(Object.values(preservationRules), "updatedAt"),
    [preservationRules]
  );

  const [backupProgressFetchInterval, setBackupProgressFetchInterval] =
    useState<NodeJS.Timer | null>(null);
  useEffect(() => {
    if (backupProgressFetchInterval) {
      clearInterval(backupProgressFetchInterval);
    }
    if (preservationRules) {
      const fetchBackupProgress = async () => {
        const newBackupProgress = await window.api.messages.getBackupProgress(
          ...Object.keys(preservationRules).map(Number)
        );
        setBackupProgress(newBackupProgress);
      };
      fetchBackupProgress();
      let interval = setInterval(() => fetchBackupProgress(), 1000);
      setBackupProgressFetchInterval(interval);
      return () => clearInterval(interval);
    } else {
      setBackupProgressFetchInterval(null);
    }
  }, [preservationRules]);

  const isSaving = saveStatus === "pending";

  return (
    <div
      style={{
        paddingLeft: 20,
        paddingTop: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 50,
          paddingBottom: 10,
        }}
      >
        <Typography variant="h6">Your Preservation Rules</Typography>
        <Button
          variant="contained"
          style={{ marginLeft: 20 }}
          onClick={() => navigate("create")}
        >
          <Add />
          Add New
        </Button>
      </div>
      {sortedPreservationRules ? (
        <>
          {!sortedPreservationRules.length && (
            <Typography style={{ paddingTop: 15, paddingLeft: 15 }}>
              You have no preservation rules saved.
            </Typography>
          )}
          {sortedPreservationRules.map((preservationRule) => {
            const ruleBackupProgress = backupProgress[preservationRule.id];
            return (
              <Card
                key={preservationRule.id}
                style={{
                  width: 800,
                  marginTop: 5,
                  marginBottom: 10,
                }}
              >
                <CardContent>
                  <div style={{ display: "flex" }}>
                    <Typography variant="h6">
                      {preservationRule.name}
                    </Typography>
                    <IconButton
                      style={{ marginLeft: "auto" }}
                      disabled={
                        isSaving ||
                        (ruleBackupProgress &&
                          ruleBackupProgress.status !== "complete")
                      }
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      disabled={
                        isSaving ||
                        (ruleBackupProgress &&
                          ruleBackupProgress.status !== "complete")
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        dispatch({
                          type: ActionType.deleteStart,
                          payload: {
                            appName: "discord",
                            preservationRuleId: preservationRule.id,
                          },
                        })
                      }
                      disabled={isSaving}
                    >
                      <Delete />
                    </IconButton>
                  </div>
                  <Typography color="text.secondary">
                    {(preservationRule.createdAt.getTime() ===
                    preservationRule.updatedAt.getTime()
                      ? "Created "
                      : "Edited ") + timeAgo.format(preservationRule.updatedAt)}
                  </Typography>
                  {ruleBackupProgress && (
                    <>
                      <Divider style={{ marginTop: 20 }} />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          marginTop: 20,
                        }}
                      >
                        <Typography
                          style={{ whiteSpace: "nowrap", marginRight: 10 }}
                          color="text.secondary"
                        >
                          {ruleBackupProgress.status === "queued" && "Queued"}
                          {ruleBackupProgress.status === "preparing" &&
                            "Preparing to preserve..."}
                          {ruleBackupProgress.status === "started" &&
                            `Preserved ${ruleBackupProgress.currentMessages.toLocaleString()} messages of ${ruleBackupProgress.totalMessages.toLocaleString()} total`}
                          {ruleBackupProgress.status === "complete" &&
                            "Preservation complete"}
                        </Typography>
                        {["pending", "started", "errored"].includes(
                          ruleBackupProgress.status
                        ) && (
                          <LinearProgressWithLabel
                            value={Math.floor(
                              Math.min(
                                (ruleBackupProgress.currentMessages /
                                  ruleBackupProgress.totalMessages) *
                                  100,
                                100
                              )
                            )}
                            errored={ruleBackupProgress.status === "errored"}
                          />
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
}
