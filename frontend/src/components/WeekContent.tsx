import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
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
  onCompletionChange: (
    studentId: string,
    homeworkId: string,
    completed: boolean,
  ) => void;
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4">{weekHeading}</Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={onAddHomework}
          >
            Add homework
          </Button>
        )}
      </Box>
      <Card sx={{ overflow: "auto", p: 0 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  pl: 2,
                  pr: 1,
                  py: 1,
                  width: hasHomework ? "1px" : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                In class
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  pl: 1,
                  pr: 2,
                  width: hasHomework ? "1px" : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                Student
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  pl: 1,
                  pr: 2,
                  width: hasHomework ? "1px" : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                Payment
              </TableCell>
              {homeworkForWeek.map((hw) => (
                <TableCell
                  key={hw.id}
                  align="center"
                  sx={{ minWidth: 120 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    <span>{hw.title}</span>
                    {isAdmin && (
                      <Tooltip title="Delete homework">
                        <IconButton
                          size="small"
                          onClick={() => onDeleteHomework(hw.id)}
                          aria-label={`Delete ${hw.title}`}
                          sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
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
                paymentStatus={
                  payments[`${student.id}-${termKey}-${weekIndex}`] ?? "unpaid"
                }
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
      </Card>
    </Box>
  );
}
