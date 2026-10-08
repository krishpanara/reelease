/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageBaseUrl, ImagePath } from "@/constants";

export const isAbsoluteUrl = (url: string): boolean => {
  return /^(https?:|data:|\/\/|blob:)/i.test(url);
};

export const getResolvedImageUrl = (src: any, fallbackSrc?: string): string => {
  const defaultPlaceholder = `${ImagePath}/placeholder.png`;

  if (!src) {
    return fallbackSrc || defaultPlaceholder;
  }

  try {
    let sourceString: string;

    if (typeof src === "string") {
      sourceString = src.trim();
    }
    else if (typeof src === "object" && src !== null) {
      sourceString = (src.file_path || src.src || src.url || "").trim();
    }
    else {
      sourceString = String(src).trim();
    }

    if (!sourceString) {
      return fallbackSrc || defaultPlaceholder;
    }

    // Normalize backslashes to forward slashes (fix for Windows paths)
    sourceString = sourceString.replace(/\\/g, '/');

    if (isAbsoluteUrl(sourceString)) {
      return sourceString;
    }

    if (sourceString.startsWith("/assets/")) {
      return sourceString;
    }

    if (sourceString.startsWith(ImagePath)) {
      return sourceString;
    }

    if (sourceString.startsWith("/_next/")) {
      return sourceString;
    }

    const baseUrl = (ImageBaseUrl || "").endsWith("/") ? ImageBaseUrl : `${ImageBaseUrl}/`;

    if (sourceString.startsWith("/uploads/")) {
      return `${baseUrl}${sourceString.substring(1)}`;
    }

    if (sourceString.startsWith("./")) {
      return `${baseUrl}${sourceString.replace("./", "")}`;
    }

    if (sourceString.startsWith("/")) {
      if (sourceString.startsWith("/uploads/")) {
        return `${baseUrl}${sourceString.substring(1)}`;
      }
      return `${ImagePath}${sourceString}`;
    }

    // Ensure leading slash for non-absolute paths that should be treated as relative to storage
    const pathWithSlash = sourceString.startsWith('/') ? sourceString : `/${sourceString}`;
    if (pathWithSlash.startsWith("/uploads/")) {
      return `${baseUrl}${pathWithSlash.substring(1)}`;
    }

    return sourceString.includes("/") ? `${baseUrl}${sourceString.replace(/^\//, "")}` : `${ImagePath}/${sourceString}`;
  } catch (error) {
    console.error("Error resolving image source:", error);
    return fallbackSrc || defaultPlaceholder;
  }
};
