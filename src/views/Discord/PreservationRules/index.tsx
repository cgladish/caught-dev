import { Add } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PreservationRules() {
  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 50,
          paddingLeft: 20,
          paddingTop: 10,
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
    </div>
  );
}
