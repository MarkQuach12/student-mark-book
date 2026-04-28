import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TableCell from "@mui/material/TableCell";
import type { PaymentStatus } from "../pages/classPage/types";

interface PaymentCellProps {
  status: PaymentStatus;
  onChange: (status: PaymentStatus) => void;
  compact?: boolean;
  readOnly?: boolean;
}

interface StatusInfo {
  label: string;
  color: string; // theme palette path
}

const STATUS_INFO: Record<PaymentStatus, StatusInfo> = {
  unpaid: { label: "Unpaid", color: "error.main" },
  paid_cash: { label: "Cash", color: "success.main" },
  paid_online: { label: "Online", color: "success.main" },
  away: { label: "Away", color: "text.disabled" },
};

function StatusInline({ status }: { status: PaymentStatus }) {
  const info = STATUS_INFO[status];
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: info.color,
          flexShrink: 0,
        }}
      />
      <Box component="span" sx={{ fontSize: "0.8125rem" }}>
        {info.label}
      </Box>
    </Box>
  );
}

export default function PaymentCell({
  status,
  onChange,
  compact = true,
  readOnly = false,
}: PaymentCellProps) {
  return (
    <TableCell sx={{ pl: 1, pr: 2, width: compact ? "1px" : undefined }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Select
          size="small"
          value={status}
          onChange={(e) => onChange(e.target.value as PaymentStatus)}
          disabled={readOnly}
          variant="standard"
          disableUnderline
          renderValue={(value) => <StatusInline status={value as PaymentStatus} />}
          sx={{
            fontSize: "0.8125rem",
            minWidth: 96,
            "& .MuiSelect-select": {
              py: 0.5,
              px: 1,
              borderRadius: 1,
              "&:hover": { bgcolor: "action.hover" },
            },
          }}
        >
          <MenuItem value="unpaid"><StatusInline status="unpaid" /></MenuItem>
          <MenuItem value="paid_cash"><StatusInline status="paid_cash" /></MenuItem>
          <MenuItem value="paid_online"><StatusInline status="paid_online" /></MenuItem>
          <MenuItem value="away"><StatusInline status="away" /></MenuItem>
        </Select>
      </Box>
    </TableCell>
  );
}
