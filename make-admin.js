import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Get your email from the command line argument or prompt
    const email = process.argv[2];

    if (!email) {
      console.log("❌ Please provide your email address");
      console.log("Usage: node make-admin.js your-email@example.com");
      return;
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(
        "❌ User not found. Make sure you've signed in at least once.",
      );
      return;
    }

    console.log(`✅ Found user: ${user.displayName || user.email}`);

    // Update user to be admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log("🎉 SUCCESS! You are now an admin!");
    console.log(`User: ${updatedUser.displayName || updatedUser.email}`);
    console.log(`Admin status: ${updatedUser.isAdmin}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();

