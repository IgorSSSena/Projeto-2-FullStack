import logotipo from "../assets/white-logotipo.svg";
import {
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
} from "@mui/material";

export default function logo() {
  return (
    <Typography variant="h3" gutterBottom>
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <img
          src={logotipo}
          style={{ height: 80, color: "pink", marginRight: 15 }}
        ></img>
        <div
          style={{
            padding: "0px 5px",
            color: "#7B287D",
            backgroundColor: "#330C2F",
            fontWeight: "600",
            boxShadow: "-4px 4px 0px #7B287D",
            height: 55,
          }}
        >
          GAME
        </div>
        <b
          style={{
            color: "#330C2F",
            textShadow: `
      0 0 5px #7B287D,
      0 0 10px #7B287D,
      0 0 20px #330C2F,
      0 0 30px #330C2F
    `,
            fontWeight: 600,
          }}
        >
          SCOPE
        </b>
      </div>
    </Typography>
  );
}
