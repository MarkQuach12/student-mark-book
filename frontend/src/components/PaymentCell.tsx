import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TableCell from "@mui/material/TableCell";
import type { PaymentStatus } from "../pages/classPage/types";

interface PaymentCellProps {
  status: PaymentStatus;
  onChange: (status: PaymentStatus) => void;
  compact?: boolean;
}

export default function PaymentCell({ status, onChange, compact = true }: PaymentCellProps) {
  const backgroundColor =
    status === "paid_cash" || status === "paid_online"
      ? "success.light"
      : status === "away"
        ? "grey.300"
        : "error.light";
  return (
    <TableCell sx={{ pl: 1, pr: 2, width: compact ? "1px" : undefined }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Select
          size="small"
          value={status}
          onChange={(e) => onChange(e.target.value as PaymentStatus)}
          sx={{
            fontSize: "0.75rem",
            minWidth: 80,
            backgroundColor,
            color: "black",
            "& .MuiSelect-select": { py: 0.5, px: 1 },
            "& .MuiSvgIcon-root": { color: "black" },
          }}
        >
          <MenuItem value="unpaid">Unpaid</MenuItem>
          <MenuItem value="paid_cash">Cash</MenuItem>
          <MenuItem value="paid_online">Online</MenuItem>
          <MenuItem value="away">Away</MenuItem>
        </Select>
      </Box>
    </TableCell>
  );
}
