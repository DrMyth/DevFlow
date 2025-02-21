"use client";

import { useUser } from "@clerk/nextjs";
import { getExecutionResult, useCodeEditorStore } from "../store/useCodeEditor";
import { Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";

const RunButton = () => {
  const { user } = useUser();
  const { runCode, language, isRunning } = useCodeEditorStore();

  const handleRun = async () => {
    if (!user) {
      alert("You must be logged in to run code");
      throw new Error("You must be logged in to run code");
    }

    await runCode();
    console.log(user.emailAddresses[0].emailAddress);

    const result = getExecutionResult();
    console.log(result);

    if (user && result) {
      await fetch("/api/save-execution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          email: user.emailAddresses[0].emailAddress,
          language,
          code: result.code,
          output: result.output || "No output available",
          error: result.error || "No error occurred",
        }),
      });
    }
  };

  return (
    <motion.button
      onClick={handleRun}
      disabled={isRunning}
      whileHover={{ scale: 1.0 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative inline-flex items-center gap-2.5 px-5 py-2.5
        disabled:cursor-not-allowed
        focus:outline-none
      `}
    >
      {/* bg wit gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-100 transition-opacity group-hover:opacity-90" />

      <div className="relative flex items-center gap-2.5">
        {isRunning ? (
          <>
            <div className="relative">
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
              <div className="absolute inset-0 blur animate-pulse" />
            </div>
            <span className="text-sm font-medium text-white/90">
              Executing...
            </span>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center w-4 h-4">
              <Play className="w-4 h-4 text-white/90 transition-transform group-hover:scale-100 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-white/90 group-hover:text-white">
              Run Code
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
};

export default RunButton;
