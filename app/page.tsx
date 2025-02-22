// app/page.tsx
import { GRADE_SUBJECT_CONFIG } from "@/config/curriculum";
import GradeSelector from "@/components/GradeSelector";

export default function Home() {
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
