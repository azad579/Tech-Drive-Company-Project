export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
}

export interface DriveStorageInfo {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
  userDisplayName?: string;
  userEmail?: string;
  userPhotoLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Fetch storage info and user details from Drive
 */
export async function getDriveAbout(accessToken: string): Promise<DriveStorageInfo> {
  const res = await fetch(`${DRIVE_API_URL}/about?fields=storageQuota,user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Drive details: ${res.statusText}`);
  }
  const data = await res.json();
  return {
    limit: data.storageQuota?.limit,
    usage: data.storageQuota?.usage,
    usageInDrive: data.storageQuota?.usageInDrive,
    usageInDriveTrash: data.storageQuota?.usageInDriveTrash,
    userDisplayName: data.user?.displayName,
    userEmail: data.user?.emailAddress,
    userPhotoLink: data.user?.photoLink,
  };
}

/**
 * List files and backups stored in Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  params?: {
    pageSize?: number;
    folderId?: string;
    searchTerm?: string;
  }
): Promise<DriveFileItem[]> {
  const queryParts = ["trashed = false"];

  if (params?.folderId) {
    queryParts.push(`'${params.folderId}' in parents`);
  }

  if (params?.searchTerm) {
    const escaped = params.searchTerm.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escaped}'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const pageSize = params?.pageSize || 25;
  const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents)');

  const res = await fetch(
    `${DRIVE_API_URL}/files?q=${q}&pageSize=${pageSize}&fields=${fields}&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Drive files: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Create or locate a folder in Google Drive
 */
export async function getOrCreateFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<string> {
  const query = parentId
    ? `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`
    : `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const searchRes = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Google Drive folder: ${createRes.statusText}`);
  }

  const created = await createRes.json();
  return created.id;
}

/**
 * Upload text or JSON file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  fileData: {
    name: string;
    mimeType: string;
    content: string | Blob;
    folderId?: string;
  }
): Promise<DriveFileItem> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata: Record<string, any> = {
    name: fileData.name,
    mimeType: fileData.mimeType,
  };
  if (fileData.folderId) {
    metadata.parents = [fileData.folderId];
  }

  let body: BodyInit;
  if (typeof fileData.content === 'string') {
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${fileData.mimeType}\r\n\r\n` +
      fileData.content +
      closeDelimiter;
  } else {
    // Binary or Blob
    const metadataPart = new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' });
    const formData = new FormData();
    formData.append('metadata', metadataPart);
    formData.append('file', fileData.content);
    // Alternatively multipart/related
    const res = await fetch(
      `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Upload failed: ${res.statusText}`);
    }
    return await res.json();
  }

  const res = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload file to Google Drive: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive (Mandatory user confirmation dialog in UI required)
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete Google Drive file: ${res.statusText}`);
  }
  return true;
}

/**
 * Download a file content from Google Drive
 */
export async function downloadDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to download file from Drive: ${res.statusText}`);
  }
  return await res.text();
}
