import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export function generateAccessKey(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

async function main() {
  console.log('Starting key update process for ALL files...');

  // Update NoteAttachments
  const noteAttachments = await prisma.noteAttachment.findMany();
  console.log(`Found ${noteAttachments.length} NoteAttachments.`);
  for (const attachment of noteAttachments) {
    console.log(`Updating NoteAttachment [${attachment.id}]: ${attachment.fileName}`);
    await prisma.noteAttachment.update({
      where: { id: attachment.id },
      data: { accessKey: generateAccessKey() },
    });
  }
  console.log('Finished updating NoteAttachments.');

  // Update ChatMessageAttachments
  const chatMessageAttachments = await prisma.chatMessageAttachment.findMany();
  console.log(`Found ${chatMessageAttachments.length} ChatMessageAttachments.`);
  for (const attachment of chatMessageAttachments) {
    console.log(`Updating ChatMessageAttachment [${attachment.id}]: ${attachment.fileName}`);
    await prisma.chatMessageAttachment.update({
      where: { id: attachment.id },
      data: { accessKey: generateAccessKey() },
    });
  }
  console.log('Finished updating ChatMessageAttachments.');

  // Update DriveFiles
  const driveFiles = await prisma.driveFile.findMany();
  console.log(`Found ${driveFiles.length} DriveFiles.`);
  for (const file of driveFiles) {
    console.log(`Updating DriveFile [${file.id}]: ${file.name}`);
    await prisma.driveFile.update({
      where: { id: file.id },
      data: { accessKey: generateAccessKey() },
    });
  }
  console.log('Finished updating DriveFiles.');

  console.log('Update complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
