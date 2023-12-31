import React, { useState } from "react";
import { LoadingSpinner } from "~/components/ui/loading";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

type AimData = RouterOutputs["aims"]["getById"];

const useAimData = (id: string): AimData | undefined => {
  const { data } = api.aims.getById.useQuery({ id });

  return data;
};

const AimWizard = () => {
  const { user } = useUser();
  // In a pro app we could use Zod and React Hook form to invalidate input in-client
  // Also we'd use React Hook form to manage the input state
  // Here we'll probably get a 'sticky key' behavior (since we're re-rendering on key press)
  const [input, setInput] = useState("");

  const ctx = api.useContext();
  const { mutate, isLoading: isSaving } = api.aims.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.aims.getAll.invalidate(); // adding void to tell TS we just want this to happen in the background
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.title;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to save. Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 rounded border bg-white p-2">
      <input
        placeholder="Write your intent here"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ title: input });
            }
          }
        }}
        disabled={isSaving}
      />
      {input !== "" && !isSaving && (
        <button onClick={() => mutate({ title: input })}>Aim</button>
      )}

      {isSaving && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

export { AimWizard, useAimData };
