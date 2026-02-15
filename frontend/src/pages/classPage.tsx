import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { useSampleData, getHomeworkByWeek } from "./classPage/sampleData";
import type { Homework, Student } from "./classPage/types";

const ClassHeader = ({
  className,
  studentCount,
  totalHomework,
}: {
  className: string;
  studentCount: number;
  totalHomework: number;
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {className}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {studentCount} students · {totalHomework} homework items
      </Typography>
    </Box>
  );
};

const WeekTabs = ({
  selectedWeek,
  onWeekChange,
}: {
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}) => {
  return (
    <Tabs
      value={selectedWeek - 1}
      onChange={(_, value) => onWeekChange((value as number) + 1)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((week) => (
        <Tab key={week} label={`Week ${week}`} value={week - 1} />
      ))}
    </Tabs>
  );
};

const CompletionCell = ({
  completed,
  onChange,
}: {
  completed: boolean;
  onChange: (completed: boolean) => void;
}) => {
  return (
    <TableCell padding="checkbox" align="center">
      <Checkbox
        checked={completed}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
      />
    </TableCell>
  );
};

const StudentRow = ({
  student,
  isInClass,
  homeworkForWeek,
  completions,
  onAttendanceChange,
  onCompletionChange,
}: {
  student: Student;
  isInClass: boolean;
  homeworkForWeek: Homework[];
  completions: Record<string, boolean>;
  onAttendanceChange: (studentId: string, inClass: boolean) => void;
  onCompletionChange: (studentId: string, homeworkId: string, completed: boolean) => void;
}) => {
  return (
    <TableRow hover>
      <TableCell align="center">
        <Checkbox
          checked={isInClass}
          onChange={(e) => onAttendanceChange(student.id, e.target.checked)}
          color="primary"
        />
      </TableCell>
      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
        {student.name}
      </TableCell>
      {homeworkForWeek.map((hw) => (
        <CompletionCell
          key={hw.id}
          completed={!!completions[`${student.id}-${hw.id}`]}
          onChange={(completed) => onCompletionChange(student.id, hw.id, completed)}
        />
      ))}
    </TableRow>
  );
};

const WeekContent = ({
  week,
  students,
  attendanceByStudentId,
  homeworkForWeek,
  completions,
  onAttendanceChange,
  onCompletionChange,
}: {
  week: number;
  students: Student[];
  attendanceByStudentId: Record<string, boolean>;
  homeworkForWeek: Homework[];
  completions: Record<string, boolean>;
  onAttendanceChange: (studentId: string, inClass: boolean) => void;
  onCompletionChange: (studentId: string, homeworkId: string, completed: boolean) => void;
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Week {week} – Homework
      </Typography>
      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 100 }}>
                In class
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Student</TableCell>
              {homeworkForWeek.map((hw) => (
                <TableCell key={hw.id} align="center" sx={{ minWidth: 120 }}>
                  {hw.title}
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
                homeworkForWeek={homeworkForWeek}
                completions={completions}
                onAttendanceChange={onAttendanceChange}
                onCompletionChange={onCompletionChange}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

const ClassPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: false,
    s4: true,
    s5: true,
  });

  const { classData, completions, setCompletion } = useSampleData(id ?? "1");
  const homeworkForWeek = getHomeworkByWeek(classData.homework, selectedWeek);
  const handleAttendanceChange = (studentId: string, inClass: boolean) => {
    setAttendanceByStudentId((prev) => ({ ...prev, [studentId]: inClass }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 6 }}>
      <ClassHeader
        className={classData.name}
        studentCount={classData.students.length}
        totalHomework={classData.homework.length}
      />
      <WeekTabs selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
      <WeekContent
        week={selectedWeek}
        students={classData.students}
        attendanceByStudentId={attendanceByStudentId}
        homeworkForWeek={homeworkForWeek}
        completions={completions}
        onAttendanceChange={handleAttendanceChange}
        onCompletionChange={setCompletion}
      />
    </Container>
  );
};

export default ClassPage;
