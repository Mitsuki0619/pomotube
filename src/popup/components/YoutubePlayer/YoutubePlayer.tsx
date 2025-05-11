// import { Card } from "@/shared/components/ui/card";
// import { useTimer } from "@/shared/hooks/usePomodoroTimer";
// import { useYoutubePlayer } from "@/shared/hooks/useYoutubePlayer";
// import { useRef } from "react";

interface YoutubePlayerProps {
  className?: string;
}

export function YoutubePlayer({ className }: YoutubePlayerProps) {
  // const playerContainerRef = useRef<HTMLDivElement>(null);

  // const { isReady, currentVideoId } = useYoutubePlayer(
  //   playerContainerRef,
  //   playerMode
  // );

  // return (
  //   <Card className={`overflow-hidden ${className || ""}`}>
  //     {!isReady && !currentVideoId && (
  //       <div className="flex items-center justify-center h-48 bg-muted">
  //         <p className="text-sm text-muted-foreground">
  //           No video set. Configure URLs in settings.
  //         </p>
  //       </div>
  //     )}

  //     {!isReady && currentVideoId && (
  //       <div className="flex items-center justify-center h-48 bg-muted">
  //         <p className="text-sm text-muted-foreground">Loading video...</p>
  //       </div>
  //     )}

  //     <div ref={playerContainerRef} className="w-full aspect-video" />
  //   </Card>
  // );
}
