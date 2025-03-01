"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradeLevel, SubjectConfig } from "@/config/curriculum";

interface GradeSelectorProps {
  config: Record<GradeLevel, SubjectConfig>;
}

interface UserGradeInfo {
  grade: GradeLevel;
  created_at: string;
}

export default function GradeSelector({ config }: GradeSelectorProps) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [gradeSubmitted, setGradeSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userGradeInfo, setUserGradeInfo] = useState<UserGradeInfo | null>(
    null
  );
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch user's grade information on component mount
  useEffect(() => {
    const fetchUserGrade = async () => {
      if (!session?.user?.email) return;

      try {
        const { data, error } = await supabase
          .from("user_grades")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (data) {
          setUserGradeInfo(data);
          setGrade(data.grade);
          setGradeSubmitted(true);
        }
      } catch (error) {
        console.error("Error fetching user grade:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGrade();
  }, [session]);

  const handleGradeChange = (value: string) => {
    setGrade(parseInt(value) as GradeLevel);
  };

  const handleGradeSubmit = async () => {
    if (!grade || !session?.user?.email) return;

    try {
      // Store the user's grade
      const { error } = await supabase.from("user_grades").insert([
        {
          email: session.user.email,
          grade: grade,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setGradeSubmitted(true);
      setUserGradeInfo({ grade, created_at: new Date().toISOString() });
    } catch (error) {
      console.error("Error storing grade:", error);
    }
  };

  const handleSubjectSelect = async (subject: keyof SubjectConfig) => {
    if (!session?.user?.email || !grade) return;

    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .insert([
          {
            email: session.user.email,
            grade: grade,
            subject: subject,
            config: config[grade][subject],
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      router.push(`/quiz?session=${data.id}`);
    } catch (error) {
      console.error("Error storing quiz session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const currentConfig = grade ? config[grade] : null;

  return (
    <>
      {!gradeSubmitted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
              What's Your Magic Level?
            </h2>
            <div className="space-y-4">
              <Select
                value={grade?.toString()}
                onValueChange={handleGradeChange}
                disabled={!!userGradeInfo}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your grade level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((gradeLevel) => (
                    <SelectItem key={gradeLevel} value={gradeLevel.toString()}>
                      Grade {gradeLevel} Wizard
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!userGradeInfo && (
                <Button
                  onClick={handleGradeSubmit}
                  disabled={!grade}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
                >
                  Start Your Adventure!
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      ) : currentConfig ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-600">
                Choose Your Path
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Grade {grade} Wizard
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(currentConfig) as Array<keyof SubjectConfig>).map(
                (subject) => (
                  <motion.div
                    key={subject}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleSubjectSelect(subject)}
                      className="w-full h-24 text-lg font-semibold"
                      style={{
                        background:
                          subject === "mathematics" ? "#4CAF50" : "#2196F3",
                      }}
                    >
                      <span className="mr-2 text-2xl">
                        {subject === "mathematics" ? "🧮" : "📚"}
                      </span>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </Button>
                  </motion.div>
                )
              )}
            </div>
          </Card>
        </motion.div>
      ) : null}
    </>
  );
}
