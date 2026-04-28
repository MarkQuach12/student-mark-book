import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { Homework, PaymentStatus, Student } from "../pages/classPage/types";
import CompletionCell from "./CompletionCell";
import PaymentCell from "./PaymentCell";

interface StudentRowProps {
  student: Student;
  isInClass: boolean;
  paymentStatus: PaymentStatus;
  homeworkForWeek: Homework[];
  completions: Record<string, boolean>;
  onAttendanceChange: (studentId: string, inClass: boolean) => void;
  onPaymentChange: (studentId: string, status: PaymentStatus) => void;
  onCompletionChange: (
    studentId: string,
    homeworkId: string,
    completed: boolean,
  ) => void;
  isAdmin?: boolean;
}

export default function StudentRow({
  student,
  isInClass,
  paymentStatus,
  homeworkForWeek,
  completions,
  onAttendanceChange,
  onPaymentChange,
  onCompletionChange,
  isAdmin = true,
}: StudentRowProps) {
  const hasHomework = homeworkForWeek.length > 0;
  return (
    <TableRow hover>
      <TableCell sx={{ pl: 2, pr: 1, width: hasHomework ? "1px" : undefined }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Checkbox
            checked={isInClass}
            onChange={(e) => onAttendanceChange(student.id, e.target.checked)}
            size="small"
            disabled={!isAdmin}
            color="success"
          />
        </Box>
      </TableCell>
      <TableCell
        component="th"
        scope="row"
        align="center"
        sx={{
          fontWeight: 500,
          pl: 1,
          pr: 2,
          whiteSpace: "nowrap",
          width: hasHomework ? "1px" : undefined,
        }}
      >
        {student.name}
      </TableCell>
      <PaymentCell
        status={paymentStatus}
        onChange={(status) => onPaymentChange(student.id, status)}
        compact={hasHomework}
        readOnly={!isAdmin}
      />
      {homeworkForWeek.map((hw) => (
        <CompletionCell
          key={hw.id}
          completed={!!completions[`${student.id}-${hw.id}`]}
          onChange={(completed) =>
            onCompletionChange(student.id, hw.id, completed)
          }
          readOnly={!isAdmin}
        />
      ))}
    </TableRow>
  );
}
