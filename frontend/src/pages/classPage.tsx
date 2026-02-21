import { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "react-router-dom";
import { getClassById, saveClass } from "../utils/classStorage";
import type { CompletionMap, Homework, PaymentStatus, Student } from "./classPage/types";
import { getTermByKey } from "./classPage/termData";
import { getHomeworkForWeek } from "./classPage/sampleData";
import AddHomeworkDialog from "../components/AddHomeworkDialog";
import AddStudentDialog from "../components/AddStudentDialog";
import ClassHeader from "../components/ClassHeader";
import TermSelector from "../components/TermSelector";
import WeekContent from "../components/WeekContent";
import WeekTabs from "../components/WeekTabs";

function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classData = id ? getClassById(id) : null;

  const [students, setStudents] = useState<Student[]>(() => classData?.students ?? []);
  const [homework, setHomework] = useState<Homework[]>(() => classData?.homework ?? []);
  const [selectedTermKey, setSelectedTermKey] = useState("term1");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, boolean>>({});
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [payments, setPayments] = useState<Record<string, PaymentStatus>>(() => classData?.payments ?? {});
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

  const handlePaymentChange = (studentId: string, status: PaymentStatus) => {
    const key = `${studentId}-${selectedTermKey}-${selectedWeekIndex}`;
    const updated = { ...payments, [key]: status };
    setPayments(updated);
    saveClass({ ...classData, students, homework, payments: updated });
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
        payments={payments}
        termKey={selectedTermKey}
        weekIndex={selectedWeekIndex}
        homeworkForWeek={homeworkForWeek}
        completions={completions}
        onAttendanceChange={handleAttendanceChange}
        onPaymentChange={handlePaymentChange}
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
}

export default ClassPage;
