import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { getClassById, saveClass } from "../utils/classStorage";
import type { CompletionMap, Homework, Student } from "./classPage/types";
import { TERMS, getTermByKey } from "./classPage/termData";
import AddHomeworkDialog from "../components/AddHomeworkDialog";
import AddStudentDialog from "../components/AddStudentDialog";

const ClassHeader = ({
  className,
  studentCount,
  totalHomework,
  onAddStudent,
}: {
  className: string;
  studentCount: number;
  totalHomework: number;
  onAddStudent: () => void;
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {className}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {studentCount} students · {totalHomework} homework items
        </Typography>
        <Button size="small" variant="outlined" onClick={onAddStudent}>
          + Add Student
        </Button>
      </Box>
    </Box>
  );
};

const TermSelector = ({
  selectedTermKey,
  onTermChange,
}: {
  selectedTermKey: string;
  onTermChange: (key: string) => void;
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
      <Select
        value={selectedTermKey}
        onChange={(e) => onTermChange(e.target.value)}
      >
        {TERMS.map((t) => (
          <MenuItem key={t.key} value={t.key}>
            {t.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const WeekTabs = ({
  selectedTermKey,
  selectedWeekIndex,
  onWeekChange,
}: {
  selectedTermKey: string;
  selectedWeekIndex: number;
  onWeekChange: (weekIndex: number) => void;
}) => {
  const term = getTermByKey(selectedTermKey);
  if (!term) return null;
  return (
    <Tabs
      value={selectedWeekIndex - 1}
      onChange={(_, value) => onWeekChange((value as number) + 1)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
    >
      {term.weeks.map((week, i) => (
        <Tab key={i} label={week.label} value={i} />
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
      <TableCell align="center" sx={{ px: 0.5 }}>
        <Checkbox
          checked={isInClass}
          onChange={(e) => onAttendanceChange(student.id, e.target.checked)}
          size="small"
          sx={{
            color: "action.active",
            "&.Mui-checked": {
              color: "success.main",
              opacity: 0.85,
            },
          }}
        />
      </TableCell>
      <TableCell component="th" scope="row" sx={{ fontWeight: 500, pl: 0.5 }}>
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
  weekHeading,
  students,
  attendanceByStudentId,
  homeworkForWeek,
  completions,
  onAttendanceChange,
  onCompletionChange,
  onAddHomework,
  onDeleteHomework,
}: {
  weekHeading: string;
  students: Student[];
  attendanceByStudentId: Record<string, boolean>;
  homeworkForWeek: Homework[];
  completions: Record<string, boolean>;
  onAttendanceChange: (studentId: string, inClass: boolean) => void;
  onCompletionChange: (studentId: string, homeworkId: string, completed: boolean) => void;
  onAddHomework: () => void;
  onDeleteHomework: (hwId: string) => void;
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {weekHeading} – Homework
      </Typography>
      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ px: 0.5, py: 1, fontWeight: 600, width: 60 }}>
                In class
              </TableCell>
              <TableCell sx={{ fontWeight: 600, pl: 0.5, width: 140 }}>Student</TableCell>
              {homeworkForWeek.map((hw) => (
                <TableCell key={hw.id} align="center" sx={{ minWidth: 120 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <span>{hw.title}</span>
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
                homeworkForWeek={homeworkForWeek}
                completions={completions}
                onAttendanceChange={onAttendanceChange}
                onCompletionChange={onCompletionChange}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" size="small" onClick={onAddHomework}>
          + Add Homework
        </Button>
      </Box>
    </Box>
  );
};

const getHomeworkForWeek = (homework: Homework[], termKey: string, weekIndex: number): Homework[] =>
  homework.filter((h) => h.termKey === termKey && h.weekIndex === weekIndex);

const ClassPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classData = id ? getClassById(id) : null;

  const [students, setStudents] = useState<Student[]>(classData?.students ?? []);
  const [homework, setHomework] = useState<Homework[]>(classData?.homework ?? []);
  const [selectedTermKey, setSelectedTermKey] = useState("term1");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, boolean>>({});
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleTermChange = (key: string) => {
    setSelectedTermKey(key);
    setSelectedWeekIndex(1);
  };

  const setCompletion = useCallback(
    (studentId: string, homeworkId: string, completed: boolean) => {
      const key = `${studentId}-${homeworkId}`;
      setCompletions((prev) => ({ ...prev, [key]: completed }));
    },
    []
  );

  const handleAddStudent = (name: string) => {
    if (!classData) return;
    const newStudent: Student = { id: crypto.randomUUID(), name };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveClass({ ...classData, students: updated, homework });
  };

  const handleAddHomework = (title: string) => {
    if (!classData) return;
    const newHw: Homework = {
      id: crypto.randomUUID(),
      title,
      termKey: selectedTermKey,
      weekIndex: selectedWeekIndex,
    };
    const updated = [...homework, newHw];
    setHomework(updated);
    saveClass({ ...classData, homework: updated, students });
  };

  const handleDeleteHomework = (hwId: string) => {
    if (!classData) return;
    const updated = homework.filter((hw) => hw.id !== hwId);
    setHomework(updated);
    saveClass({ ...classData, homework: updated, students });
  };

  if (!classData) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Class not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The class you are looking for does not exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const currentTerm = getTermByKey(selectedTermKey)!;
  const currentWeekInfo = currentTerm.weeks[selectedWeekIndex - 1];
  const weekHeading = `${currentWeekInfo.label} (${currentWeekInfo.dateRange})`;
  const homeworkForWeek = getHomeworkForWeek(homework, selectedTermKey, selectedWeekIndex);

  const handleAttendanceChange = (studentId: string, inClass: boolean) => {
    setAttendanceByStudentId((prev) => ({ ...prev, [studentId]: inClass }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 6 }}>
      <ClassHeader
        className={classData.name}
        studentCount={students.length}
        totalHomework={homework.length}
        onAddStudent={() => setAddStudentOpen(true)}
      />
      <TermSelector selectedTermKey={selectedTermKey} onTermChange={handleTermChange} />
      <WeekTabs
        selectedTermKey={selectedTermKey}
        selectedWeekIndex={selectedWeekIndex}
        onWeekChange={setSelectedWeekIndex}
      />
      <WeekContent
        weekHeading={weekHeading}
        students={students}
        attendanceByStudentId={attendanceByStudentId}
        homeworkForWeek={homeworkForWeek}
        completions={completions}
        onAttendanceChange={handleAttendanceChange}
        onCompletionChange={setCompletion}
        onAddHomework={() => setAddDialogOpen(true)}
        onDeleteHomework={setPendingDeleteId}
      />
      <AddStudentDialog
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onAdd={handleAddStudent}
      />
      <AddHomeworkDialog
        open={addDialogOpen}
        weekLabel={`${currentTerm.label} – ${currentWeekInfo.label} (${currentWeekInfo.dateRange})`}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddHomework}
      />
      <Dialog open={pendingDeleteId !== null} onClose={() => setPendingDeleteId(null)}>
        <DialogTitle>Delete Homework?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove this homework item for all students.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleDeleteHomework(pendingDeleteId!);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassPage;
