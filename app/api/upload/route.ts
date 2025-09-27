import { uploadPhotosToS3 } from "@/lib/db/queries/upload";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Get all files with the key "photos"
  const photoFiles = formData.getAll("photos");

  // Filter out any non-File entries and empty files
  const validFiles = photoFiles.filter(
    (file): file is File => file instanceof File && file.size > 0
  );

  if (validFiles.length === 0) {
    return NextResponse.json(
      { error: "No valid photos provided" },
      { status: 400 }
    );
  }

  return await uploadPhotosToS3(validFiles);
}

// Increase the body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
