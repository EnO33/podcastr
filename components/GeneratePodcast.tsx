import { GeneratePodcastProps } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { generateUploadUrl } from "@/convex/files";

import { useUploadFiles } from "@xixixao/uploadstuff/react";

const useGeneratePodcast = ({
    setAudio,
    voiceType,
    voicePrompt,
    setAudioStorageId,
}: GeneratePodcastProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const { startUpload } = useUploadFiles(generateUploadUrl);

    const getPodcastAudio = useAction(api.openai.generateAudioAction);

    const generatePodcast = async () => {
        setIsGenerating(true);
        setAudio('');

        if (!voicePrompt) {
            // TODO: Show error message
            return setIsGenerating(false);
        }

        try {
            const response = await getPodcastAudio({
                voice: voiceType,
                input: voicePrompt
            })

            const blob = new Blob([response], {type: 'audio/mpeg'});
            const fileName = `podcast-${uuidv4()}.mp3`;
            const file = new File([blob], fileName, { type: "audio/mpeg" });

            const uploaded = await startUpload([file]);
            const storageId = (uploaded[0].response as any).storageId;

            setAudioStorageId(storageId);

            const audioUrl = await getAudioUrl({ storageId });
        } catch (error) {
            console.log("Error generating podcast", error);
            // TODO: Show error message
            return setIsGenerating(false);
        }
    }

    return {
        isGenerating,
        generatePodcast,
    }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-orange-1 py-4 font-bold text-white-1"
        >
          {isGenerating ? (
            <>
              Generating
              <Loader2 size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  );
};

export default GeneratePodcast;
