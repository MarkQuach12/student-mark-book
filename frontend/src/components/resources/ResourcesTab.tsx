import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FolderIcon from "@mui/icons-material/Folder";
import type { ApiTopic, ApiResource } from "../../services/api";
import {
  toggleTopicVisibility as apiToggleVisibility,
  deleteTopic as apiDeleteTopic,
  deleteResource as apiDeleteResource,
} from "../../services/api";
import AddTopicDialog from "./AddTopicDialog";
import AddResourceDialog from "./AddResourceDialog";

interface ResourcesTabProps {
  classId: string;
  classLevel: string;
  topics: ApiTopic[];
  isAdmin: boolean;
  onTopicsChange: (topics: ApiTopic[]) => void;
}

function getFileIcon(fileType: string | null) {
  switch (fileType) {
    case "pdf":
      return <PictureAsPdfIcon color="error" />;
    case "doc":
    case "docx":
    case "gdoc":
      return <DescriptionIcon color="primary" />;
    case "pptx":
    case "gslides":
      return <SlideshowIcon color="warning" />;
    case "png":
    case "jpg":
    case "jpeg":
      return <ImageIcon color="success" />;
    default:
      return <InsertDriveFileIcon />;
  }
}

export default function ResourcesTab({ classId, classLevel, topics, isAdmin, onTopicsChange }: ResourcesTabProps) {
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [addResourceTopicId, setAddResourceTopicId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;

  const handleToggleVisibility = async (topic: ApiTopic) => {
    try {
      const updated = await apiToggleVisibility(topic.id, classId);
      onTopicsChange(topics.map((t) => (t.id === topic.id ? updated : t)));
    } catch {
      // Could show error
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await apiDeleteTopic(topicId);
      onTopicsChange(topics.filter((t) => t.id !== topicId));
      if (selectedTopicId === topicId) setSelectedTopicId(null);
    } catch {
      // Could show error
    }
  };

  const handleDeleteResource = async (topicId: string, resourceId: string) => {
    try {
      await apiDeleteResource(topicId, resourceId);
      onTopicsChange(
        topics.map((t) =>
          t.id === topicId
            ? { ...t, resources: t.resources.filter((r) => r.id !== resourceId) }
            : t
        )
      );
    } catch {
      // Could show error
    }
  };

  const handleTopicCreated = (newTopic: ApiTopic) => {
    onTopicsChange([...topics, newTopic]);
  };

  const handleResourcesAdded = (topicId: string, newResources: ApiResource[]) => {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId ? { ...t, resources: [...t.resources, ...newResources] } : t
      )
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Resources</Typography>
        {isAdmin && (
          <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => setAddTopicOpen(true)}>
            Add Topic
          </Button>
        )}
      </Box>

      {topics.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No resources yet.
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {topics.map((topic) => (
          <Card
            key={topic.id}
            variant="outlined"
            sx={{
              opacity: !topic.visible && isAdmin ? 0.6 : 1,
            }}
          >
            <CardActionArea
              onClick={() => setSelectedTopicId(topic.id)}
              sx={{ p: 0 }}
            >
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FolderIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {topic.name}
                  </Typography>
                  <Chip
                    label={topic.resources.length}
                    size="small"
                    sx={{ minWidth: 28, height: 22, fontSize: "0.75rem" }}
                  />
                  {!topic.visible && isAdmin && (
                    <Chip label="Hidden" size="small" variant="outlined" color="warning" sx={{ height: 22, fontSize: "0.7rem" }} />
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Dialog for topic resources */}
      <Dialog
        open={selectedTopic !== null}
        onClose={() => setSelectedTopicId(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedTopic && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
              <FolderIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                {selectedTopic.name}
              </Typography>
              <IconButton onClick={() => setSelectedTopicId(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {isAdmin && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
                  <Switch
                    size="small"
                    checked={selectedTopic.visible}
                    onChange={() => handleToggleVisibility(selectedTopic)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedTopic.visible ? "Visible to students" : "Hidden from students"}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAddResourceTopicId(selectedTopic.id)}
                  >
                    Add
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTopic(selectedTopic.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {selectedTopic.resources.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  No resources in this topic.
                </Typography>
              ) : (
                <List sx={{ px: 2, py: 1 }}>
                  {selectedTopic.resources.map((resource) => (
                    <Box key={resource.id} sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemButton
                        component="a"
                        href={resource.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ px: 1.5, borderRadius: 1, flex: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getFileIcon(resource.fileType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={resource.title}
                          secondary={resource.fileType?.toUpperCase()}
                        />
                        <OpenInNewIcon sx={{ fontSize: 16, color: "text.secondary", ml: 1 }} />
                      </ListItemButton>
                      {isAdmin && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteResource(selectedTopic.id, resource.id)}
                          sx={{ ml: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      <AddTopicDialog
        open={addTopicOpen}
        classLevel={classLevel}
        onClose={() => setAddTopicOpen(false)}
        onCreated={handleTopicCreated}
      />
      <AddResourceDialog
        open={addResourceTopicId !== null}
        topicId={addResourceTopicId}
        onClose={() => setAddResourceTopicId(null)}
        onAdded={(resources) => {
          if (addResourceTopicId) handleResourcesAdded(addResourceTopicId, resources);
          setAddResourceTopicId(null);
        }}
      />
    </Box>
  );
}
