import { Add } from "@mui/icons-material";
import {
  Button,
  Card,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { sortBy } from "lodash";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/preservationRules/actions";
import { getDiscordPreservationRules } from "../../../redux/preservationRules/selectors";
import { timeAgo } from "../../../utils";

export default function PreservationRules() {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();

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

  console.log(sortedPreservationRules);

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
      <Card style={{ width: 800 }}>
        {sortedPreservationRules ? (
          <>
            {!sortedPreservationRules.length && (
              <Typography style={{ paddingTop: 15, paddingLeft: 15 }}>
                You have no preservation rules saved.
              </Typography>
            )}
            <List dense>
              {sortedPreservationRules.map((preservationRule) => (
                <ListItem key={preservationRule.id}>
                  <ListItemButton>
                    <Typography style={{ width: 400 }}>
                      {preservationRule.name}
                    </Typography>
                    <Typography style={{ fontSize: ".875rem" }}>
                      {preservationRule.createdAt === preservationRule.updatedAt
                        ? "Created"
                        : "Updated"}{" "}
                      {timeAgo.format(preservationRule.updatedAt)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <LinearProgress />
        )}
      </Card>
    </div>
  );
}
