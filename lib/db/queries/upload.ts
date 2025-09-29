import { uploadFileToS3, validateImageFile } from "@/lib/aws/s3";
import { NextResponse } from "next/server";

// Define a type that works in both browser and server environments
interface FileData {
  size: number;
  type: string;
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export async function uploadPhotosToS3(photos: FileData[]) {
  try {
    const files = photos;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Limit to 5 photos max
    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 photos allowed" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      // Convert File to Express.Multer.File-like object for validation
      const multerFile = {
        size: file.size,
        mimetype: file.type,
        originalname: file.name,
      } as Express.Multer.File;

      // Validate file
      const validation = validateImageFile(multerFile);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3
      return uploadFileToS3(buffer, file.name, file.type);
    });

    const uploadResults = await Promise.all(uploadPromises);
    const photoUrls = uploadResults.map((result) => result.url);

    return NextResponse.json({
      success: true,
      photos: photoUrls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
