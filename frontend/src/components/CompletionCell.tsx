import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";

interface CompletionCellProps {
  completed: boolean;
  onChange: (completed: boolean) => void;
}

export default function CompletionCell({ completed, onChange }: CompletionCellProps) {
  return (
    <TableCell padding="checkbox" align="center">
      <Checkbox
        checked={completed}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
      />
    </TableCell>
  );
}
