import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Re-verify config inside to ensure env vars are fresh
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("Configured with cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file in formData");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Processing file:", file.name, "size:", file.size);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "chat-attachments",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary stream error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload success");
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    }) as any;

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Upload error detail:", error);
    return NextResponse.json({ error: "Upload failed", details: String(error) }, { status: 500 });
  }
}
