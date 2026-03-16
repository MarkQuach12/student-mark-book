package com.markbook.backend.dto;

import com.markbook.backend.model.Resource;

import java.util.UUID;

public record ResourceDTO(UUID id, String title, String driveFileId, String driveUrl, String fileType, int sortOrder) {
    public static ResourceDTO from(Resource r) {
        return new ResourceDTO(r.getId(), r.getTitle(), r.getDriveFileId(), r.getDriveUrl(), r.getFileType(), r.getSortOrder());
    }
}
