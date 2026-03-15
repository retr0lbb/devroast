"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor, MAX_CHARACTERS } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

function HomeEditor() {
  const router = useRouter();
  const trpc = useTRPC();
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  const { mutate, isPending } = useMutation(
    trpc.roasts.createRoast.mutationOptions({
      onSuccess: ({ id }) => {
        router.push(`/roast/${id}`);
      },
    })
  );

  const isOverLimit = code.length > MAX_CHARACTERS;

  const handleRoast = () => {
    if (code.trim().length === 0 || isOverLimit || isPending) return;
    mutate({ codeSnippet: code, isRoastMode: roastMode });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <CodeEditor
        value={code}
        onChange={setCode}
        className="w-full max-w-3xl"
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span className="font-mono text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={code.trim().length === 0 || isOverLimit || isPending}
          onClick={handleRoast}
        >
          {isPending ? "$ analyzing_shitty_code..." : "$ roast_my_code"}
        </Button>
      </div>
    </div>
  );
}

export { HomeEditor };
