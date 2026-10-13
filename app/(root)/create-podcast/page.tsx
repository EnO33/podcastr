"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { title } from "process";
import { useToast } from "@/components/ui/use-toast";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  VoiceProvider,
  openAIVoices,
  parseVoiceType,
  toVoiceType,
} from "@/lib/voices";

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
});

const CreatePodcast = () => {
  const router = useRouter();
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState(0);

  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>("openai");
  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<
    { id: string; name: string; previewUrl: string | null }[] | null
  >(null);

  const { toast } = useToast();

  const listElevenLabsVoices = useAction(api.elevenlabs.listVoicesAction);

  useEffect(() => {
    if (voiceProvider !== "elevenlabs" || elevenLabsVoices) return;

    listElevenLabsVoices()
      .then(setElevenLabsVoices)
      .catch((error) => {
        console.log("Error loading ElevenLabs voices", error);
        toast({
          title: "Could not load ElevenLabs voices",
          variant: "destructive",
        });
      });
  }, [voiceProvider, elevenLabsVoices, listElevenLabsVoices, toast]);

  const voiceOptions =
    voiceProvider === "elevenlabs"
      ? (elevenLabsVoices ?? []).map((voice) => ({
          value: toVoiceType("elevenlabs", voice.id),
          label: voice.name,
        }))
      : openAIVoices.map((voice) => ({ value: voice, label: voice }));

  const voicePreviewUrl = (() => {
    if (!voiceType) return null;
    const { provider, voiceId } = parseVoiceType(voiceType);
    if (provider === "openai") return `/${voiceId}.mp3`;
    return elevenLabsVoices?.find((voice) => voice.id === voiceId)?.previewUrl ?? null;
  })();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPodcast = useMutation(api.podcasts.createPodcast);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: "Please generate audio and image",
          variant: "destructive",
        });
        setIsSubmitting(false);
        throw new Error("Please generate audio and image");
      }

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      });

      toast({
        title: "Podcast created",
      });
      setIsSubmitting(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Podcast</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible: ring-offset-orange-1"
                      placeholder="My Podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Voice provider
              </Label>
              <Select
                value={voiceProvider}
                onValueChange={(value) => {
                  setVoiceProvider(value as VoiceProvider);
                  setVoiceType(null);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue className="placeholder:text-gray-1" />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1">
                  <SelectItem className="focus:bg-orange-1" value="openai">
                    OpenAI
                  </SelectItem>
                  <SelectItem className="focus:bg-orange-1" value="elevenlabs">
                    ElevenLabs
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select Voice
              </Label>
              <Select
                value={voiceType ?? ""}
                onValueChange={(value) => setVoiceType(value)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder={
                      voiceProvider === "elevenlabs" && !elevenLabsVoices
                        ? "Loading ElevenLabs voices..."
                        : "Select Voice"
                    }
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1">
                  {voiceOptions.map((voice) => (
                    <SelectItem
                      className="capitalize focus:bg-orange-1"
                      key={voice.value}
                      value={voice.value}
                    >
                      {voice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voicePreviewUrl && (
                  <audio src={voicePreviewUrl} autoPlay className="hidden" />
                )}
              </Select>
            </div>

            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible: ring-offset-orange-1"
                      placeholder="Write a short podcast description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col pt-10">
            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
            />

            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                {isSubmitting ? (
                  <>
                    Submitting
                    <Loader2 size={20} className="animate-spin ml-2" />
                  </>
                ) : (
                  "Submit & Publish Podcast"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast;
