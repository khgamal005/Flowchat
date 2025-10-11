"use client";

import { useEffect, useState } from "react";
import slugify from "slugify";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Typography from "@/components/ui/typography";
import { useCreateWorkspaceValues } from "@/hooks/create-workspace-values";
import { createWorkspace } from "@/actions/create-workspace";
import ImageUpload from "@/components/image-upload";

export default function CreateWorkspace() {
  const { currStep } = useCreateWorkspaceValues();

  const stepInView =
    currStep === 1 ? <Step1 /> : currStep === 2 ? <Step2 /> : <Step1 />;

  return (
    <div className="w-screen h-screen grid place-content-center bg-neutral-800 text-white">
      <div className="p-3 max-w-[550px]">
        <Typography
          text={`Step ${currStep} of 2`}
          variant="p"
          className="text-neutral-400"
        />
        {stepInView}
      </div>
    </div>
  );
}

// ✅ Step 1 - Enter workspace name
function Step1() {
  const { name, updateValues, setCurrStep } = useCreateWorkspaceValues();

  return (
    <>
      <Typography
        text="What is the name of your company or team?"
        className="my-4"
      />

      <Typography
        text="This will be the name of your Flowchat workspace — choose something that your team will recognize."
        className="text-neutral-300"
        variant="p"
      />

      <form className="mt-6">
        <fieldset>
          <Input
            className="bg-neutral-700 text-white border-neutral-600"
            type="text"
            value={name}
            placeholder="Enter your company name"
            onChange={(event) => updateValues({ name: event.target.value })}
          />
          <Button
            type="button"
            className="mt-10"
            onClick={() => setCurrStep(2)}
            disabled={!name}
          >
            <Typography text="Next" variant="p" />
          </Button>
        </fieldset>
      </form>
    </>
  );
}

// ✅ Step 2 - Upload image and create workspace
