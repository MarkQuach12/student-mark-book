import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Homework, PaymentStatus, Student } from "../pages/classPage/types";
import StudentRow from "./StudentRow";

interface WeekContentProps {
  weekHeading: string;
  students: Student[];
  attendanceByStudentId: Record<string, boolean>;
  payments: Record<string, PaymentStatus>;
  termKey: string;
  weekIndex: number;
  homeworkForWeek: Homework[];
  completions: Record<string, boolean>;
  onAttendanceChange: (studentId: string, inClass: boolean) => void;
  onPaymentChange: (studentId: string, status: PaymentStatus) => void;
  onCompletionChange: (studentId: string, homeworkId: string, completed: boolean) => void;
  onAddHomework: () => void;
  onDeleteHomework: (hwId: string) => void;
  isAdmin?: boolean;
}

export default function WeekContent({
  weekHeading,
  students,
  attendanceByStudentId,
  payments,
  termKey,
  weekIndex,
  homeworkForWeek,
  completions,
  onAttendanceChange,
  onPaymentChange,
  onCompletionChange,
  onAddHomework,
  onDeleteHomework,
  isAdmin = true,
}: WeekContentProps) {
  const hasHomework = homeworkForWeek.length > 0;
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {weekHeading} – Homework
      </Typography>
      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ pl: 2, pr: 1, py: 1, fontWeight: 600, width: hasHomework ? "1px" : undefined, whiteSpace: "nowrap" }}
              >
                In class
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, pl: 1, pr: 2, width: hasHomework ? "1px" : undefined, whiteSpace: "nowrap" }}
              >
                Student
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, pl: 1, pr: 2, width: hasHomework ? "1px" : undefined, whiteSpace: "nowrap" }}
              >
                Payment
              </TableCell>
              {homeworkForWeek.map((hw) => (
                <TableCell key={hw.id} align="center" sx={{ minWidth: 120 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <span>{hw.title}</span>
                    {isAdmin && (
                      <Tooltip title="Delete homework">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteHomework(hw.id)}
                          aria-label={`Delete ${hw.title}`}
                          sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                isInClass={!!attendanceByStudentId[student.id]}
                paymentStatus={payments[`${student.id}-${termKey}-${weekIndex}`] ?? "unpaid"}
                homeworkForWeek={homeworkForWeek}
                completions={completions}
                onAttendanceChange={onAttendanceChange}
                onPaymentChange={onPaymentChange}
                onCompletionChange={onCompletionChange}
                isAdmin={isAdmin}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
      {isAdmin && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" size="small" onClick={onAddHomework}>
            + Add Homework
          </Button>
        </Box>
      )}
    </Box>
  );
}
