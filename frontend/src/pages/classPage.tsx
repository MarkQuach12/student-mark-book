import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "react-router-dom";
import type { CompletionMap, Homework, PaymentStatus, Student } from "./classPage/types";
import type { TermPeriod } from "./classPage/termData";
import type { ApiAttendance, ApiClass, ApiCompletion, ApiPayment } from "../services/api";
import { findCurrentWeek } from "../utils/currentWeek";
import {
  fetchClassOverview,
  addStudent as apiAddStudent,
  deleteStudent as apiDeleteStudent,
  createHomework as apiCreateHomework,
  deleteClass as apiDeleteClass,
  deleteHomework as apiDeleteHomework,
  updateAttendance as apiUpdateAttendance,
  toggleCompletion as apiToggleCompletion,
  updatePayment as apiUpdatePayment,
} from "../services/api";
import AddHomeworkDialog from "../components/AddHomeworkDialog";
import AddStudentDialog from "../components/AddStudentDialog";
import RemoveStudentDialog from "../components/RemoveStudentDialog";
import ClassHeader from "../components/ClassHeader";
import TermSelector from "../components/TermSelector";
import WeekContent from "../components/WeekContent";
import WeekTabs from "../components/WeekTabs";

function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Data state ──
  const [classInfo, setClassInfo] = useState<ApiClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [allAttendance, setAllAttendance] = useState<ApiAttendance[]>([]);
  const [allCompletions, setAllCompletions] = useState<ApiCompletion[]>([]);
  const [allPayments, setAllPayments] = useState<ApiPayment[]>([]);
  const [terms, setTerms] = useState<TermPeriod[]>([]);

  // ── UI state ──
  const [selectedTermKey, setSelectedTermKey] = useState("term1");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [removeStudentOpen, setRemoveStudentOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteClassOpen, setDeleteClassOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all data on mount (single aggregate call) ──
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadData() {
      try {
        const data = await fetchClassOverview(id!);
        if (cancelled) return;

        setClassInfo(data.classInfo);
        setStudents(data.students);
        setHomework(data.homework);
        setAllAttendance(data.attendance);
        setAllCompletions(data.completions);
        setAllPayments(data.payments);
        setTerms(data.terms);

        // Auto-navigate to the current week based on today's date
        const current = findCurrentWeek(data.terms);
        if (current) {
          setSelectedTermKey(current.termKey);
          setSelectedWeekIndex(current.weekIndex);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [id]);

  // ── Derived state ──
  const attendanceByStudentId = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of allAttendance) {
      if (a.termKey === selectedTermKey && a.weekIndex === selectedWeekIndex) {
        map[a.studentId] = a.present;
      }
    }
    return map;
  }, [allAttendance, selectedTermKey, selectedWeekIndex]);

  const completions: CompletionMap = useMemo(() => {
    const map: CompletionMap = {};
    for (const c of allCompletions) {
      map[`${c.studentId}-${c.homeworkId}`] = c.completed;
    }
    return map;
  }, [allCompletions]);

  const payments = useMemo(() => {
    const map: Record<string, PaymentStatus> = {};
    for (const p of allPayments) {
      map[`${p.studentId}-${p.termKey}-${p.weekIndex}`] = p.status as PaymentStatus;
    }
    return map;
  }, [allPayments]);

  const currentTerm = useMemo(() => terms.find((t) => t.key === selectedTermKey), [terms, selectedTermKey]);

  const homeworkForWeek = useMemo(
    () => homework.filter((h) => h.termKey === selectedTermKey && h.weekIndex === selectedWeekIndex),
    [homework, selectedTermKey, selectedWeekIndex]
  );

  // ── Handlers ──

  const handleTermChange = (key: string) => {
    setSelectedTermKey(key);
    setSelectedWeekIndex(1);
  };

  const setCompletion = useCallback(
    (studentId: string, homeworkId: string, completed: boolean) => {
      // Optimistic update
      setAllCompletions((prev) => {
        const idx = prev.findIndex((c) => c.studentId === studentId && c.homeworkId === homeworkId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], completed };
          return updated;
        }
        return [...prev, { studentId, homeworkId, completed }];
      });
      apiToggleCompletion({ studentId, homeworkId }).catch(() => {
        // Revert on failure
        setAllCompletions((prev) => {
          const idx = prev.findIndex((c) => c.studentId === studentId && c.homeworkId === homeworkId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], completed: !completed };
            return updated;
          }
          return prev;
        });
      });
    },
    []
  );

  const handleDeleteClass = async () => {
    if (!id) return;
    try {
      await apiDeleteClass(id);
      setDeleteClassOpen(false);
      setDeleteConfirmText("");
      window.dispatchEvent(new CustomEvent("classDeleted"));
      navigate("/");
    } catch {
      setDeleteClassOpen(false);
      setDeleteConfirmText("");
    }
  };

  const handleAddStudent = async (name: string) => {
    if (!id) return;
    try {
      const newStudent = await apiAddStudent(id, name);
      setStudents((prev) => [...prev, newStudent]);
    } catch {
      // Could show error toast
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await apiDeleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch {
      // Could show error toast
    }
  };

  const handleAddHomework = async (title: string) => {
    if (!id) return;
    try {
      const newHw = await apiCreateHomework(id, {
        title,
        termKey: selectedTermKey,
        weekIndex: selectedWeekIndex,
      });
      setHomework((prev) => [...prev, newHw]);
    } catch {
      // Could show error toast
    }
  };

  const handleDeleteHomework = async (hwId: string) => {
    try {
      await apiDeleteHomework(hwId);
      setHomework((prev) => prev.filter((hw) => hw.id !== hwId));
    } catch {
      // Could show error toast
    }
  };

  const handleAttendanceChange = (studentId: string, inClass: boolean) => {
    // Optimistic update
    setAllAttendance((prev) => {
      const idx = prev.findIndex(
        (a) => a.studentId === studentId && a.termKey === selectedTermKey && a.weekIndex === selectedWeekIndex
      );
      const record: ApiAttendance = {
        studentId,
        termKey: selectedTermKey,
        weekIndex: selectedWeekIndex,
        present: inClass,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [...prev, record];
    });
    apiUpdateAttendance({
      studentId,
      termKey: selectedTermKey,
      weekIndex: selectedWeekIndex,
      present: inClass,
    }).catch(() => {
      // Revert on failure
      setAllAttendance((prev) => {
        const idx = prev.findIndex(
          (a) => a.studentId === studentId && a.termKey === selectedTermKey && a.weekIndex === selectedWeekIndex
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], present: !inClass };
          return updated;
        }
        return prev;
      });
    });
  };

  const handlePaymentChange = (studentId: string, status: PaymentStatus) => {
    const key = `${studentId}-${selectedTermKey}-${selectedWeekIndex}`;
    const prevStatus = payments[key] ?? "unpaid";

    // Optimistic update
    setAllPayments((prev) => {
      const idx = prev.findIndex(
        (p) => p.studentId === studentId && p.termKey === selectedTermKey && p.weekIndex === selectedWeekIndex
      );
      const record: ApiPayment = {
        studentId,
        termKey: selectedTermKey,
        weekIndex: selectedWeekIndex,
        status,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [...prev, record];
    });

    apiUpdatePayment({
      studentId,
      termKey: selectedTermKey,
      weekIndex: selectedWeekIndex,
      status,
    }).catch(() => {
      // Revert on failure
      setAllPayments((prev) => {
        const idx = prev.findIndex(
          (p) => p.studentId === studentId && p.termKey === selectedTermKey && p.weekIndex === selectedWeekIndex
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], status: prevStatus };
          return updated;
        }
        return prev;
      });
    });
  };

  // ── Render ──

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!classInfo || !currentTerm) {
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

  const currentWeekInfo = currentTerm.weeks[selectedWeekIndex - 1];
  const weekHeading = `${currentWeekInfo.label} (${currentWeekInfo.dateRange})`;

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 6 }}>
      <ClassHeader
        className={classInfo.name}
        studentCount={students.length}
        onAddStudent={() => setAddStudentOpen(true)}
        onRemoveStudent={() => setRemoveStudentOpen(true)}
        onDeleteClass={() => setDeleteClassOpen(true)}
      />
      <TermSelector terms={terms} selectedTermKey={selectedTermKey} onTermChange={handleTermChange} />
      <WeekTabs
        terms={terms}
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
      <RemoveStudentDialog
        open={removeStudentOpen}
        students={students}
        onClose={() => setRemoveStudentOpen(false)}
        onRemove={handleRemoveStudent}
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
      <Dialog
        open={deleteClassOpen}
        onClose={() => { setDeleteClassOpen(false); setDeleteConfirmText(""); }}
      >
        <DialogTitle>Delete Class?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will permanently delete this class and all its students, homework, attendance, and payment records.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label='Type "delete" to confirm'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDeleteClassOpen(false); setDeleteConfirmText(""); }}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteConfirmText.toLowerCase() !== "delete"}
            onClick={handleDeleteClass}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ClassPage;
