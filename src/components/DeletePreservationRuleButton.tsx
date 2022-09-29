import { Delete } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../redux";
import { ActionType as PreservationRulesActionType } from "../redux/preservationRules/actions";
import { useEffect, useState } from "react";
import { getSaveStatus } from "../redux/preservationRules/selectors";
import { LoadingButton } from "@mui/lab";

export function DeletePreservationRuleButton({
  preservationRuleId,
  disabled,
}: {
  preservationRuleId: number;
  disabled?: boolean;
}) {
  const dispatch = useDispatch<Dispatch>();

  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const saveStatus = useSelector(getSaveStatus);

  const onClose = () => setShowConfirm(false);

  useEffect(() => {
    if (saveStatus === "success") {
      onClose();
    }
  }, [saveStatus]);

  return (
    <>
      <IconButton onClick={() => setShowConfirm(true)} disabled={disabled}>
        <Delete />
      </IconButton>
      <Dialog
        open={showConfirm}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Delete this preservation rule?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this preservation rule? You will
            lose any saved messages associated with it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            variant="contained"
            style={{ marginLeft: 10 }}
            disabled={saveStatus === "pending"}
            loading={saveStatus === "pending"}
            loadingPosition="start"
            onClick={() => {
              dispatch({
                type: PreservationRulesActionType.deleteStart,
                payload: {
                  appName: "discord",
                  preservationRuleId: preservationRuleId,
                },
              });
            }}
            autoFocus
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
