import type { ProfileStats, PublicUser, UpdateUserDto } from "@lumis/shared-types";

export class ProfileRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  if (!data?.message) return fallback;
  return Array.isArray(data.message) ? data.message.join(" ") : data.message;
}

export async function fetchProfileStats(): Promise<ProfileStats | null> {
  const response = await fetch("/api/stats/profile");
  if (!response.ok) return null;
  return response.json();
}

export async function updateProfile(dto: UpdateUserDto): Promise<PublicUser> {
  const response = await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new ProfileRequestError(
      response.status,
      await parseErrorMessage(response, "No pudimos guardar los cambios."),
    );
  }

  return response.json();
}

export function uploadAvatar(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<PublicUser> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/users/me/avatar");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as PublicUser);
        return;
      }

      let message = "No pudimos subir la foto.";
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string | string[] };
        if (parsed.message) {
          message = Array.isArray(parsed.message) ? parsed.message.join(" ") : parsed.message;
        }
      } catch {
        // keep the default message
      }
      reject(new ProfileRequestError(xhr.status, message));
    };

    xhr.onerror = () => reject(new ProfileRequestError(0, "Error de red al subir la foto."));

    xhr.send(formData);
  });
}
