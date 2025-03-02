// app/page.tsx
import { GRADE_SUBJECT_CONFIG } from "@/config/curriculum";
import GradeSelector from "@/components/GradeSelector";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
// import { authOptions } from "../app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/login");
  }
  console.log({ session });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">
          Magical Learning Journey
        </h1>
        <GradeSelector config={GRADE_SUBJECT_CONFIG} />
      </div>
    </div>
  );
}
