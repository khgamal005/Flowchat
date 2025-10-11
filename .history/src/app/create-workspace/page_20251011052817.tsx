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
function Step2() {
  const { setCurrStep, updateImageUrl, imageUrl, name } =
    useCreateWorkspaceValues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ✅ Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // ✅ Ensure user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.warn("No user found in client Supabase:", error);
        toast.error("Session expired. Please log in again.");
        router.push("/auth");
      } else {
        console.log("User in Step2 (client):", user);
      }
    };

    fetchUser();
  }, [router, supabase]);
const handleSubmit = async () => {
  if (isSubmitting || !name) return;

  setIsSubmitting(true);
  try {
    // ✅ Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      toast.error("Session expired. Please log in again.");
      router.push("/auth");
      return;
    }

    const slug = slugify(name, { lower: true, strict: true });
    const invite_code = uuid();

    // ✅ Now pass the token
    const result = await createWorkspace({
      imageUrl,
      name,
      slug,
      invite_code,
      access_token: session.access_token, // <-- session is now defined
    });
  }}

  return (
    <>
      <Button
        size="sm"
        className="text-white"
        variant="link"
        onClick={() => setCurrStep(1)}
      >
        <Typography text="Back" variant="p" />
      </Button>

      <form>
        <Typography text="Add workspace avatar" className="my-4" />
        <Typography
          text="This image can be changed later in your workspace settings."
          className="text-neutral-300"
          variant="p"
        />

        <fieldset
          disabled={isSubmitting}
          className="mt-6 flex flex-col items-center space-y-9"
        >
          <ImageUpload />

          <div className="space-x-5">
            <Button
              type="button"
              onClick={() => {
                updateImageUrl("");
                handleSubmit();
              }}
            >
              <Typography text="Skip for now" variant="p" />
            </Button>

            {imageUrl ? (
              <Button
                type="button"
                onClick={handleSubmit}
                size="sm"
                variant="destructive"
              >
                <Typography text="Submit" variant="p" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="text-white bg-gray-500"
                disabled
              >
                <Typography text="Select an Image" variant="p" />
              </Button>
            )}
          </div>
        </fieldset>
      </form>
    </>
  );
}
