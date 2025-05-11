import { useEffect, useRef, useState } from "react";
import { extractYoutubeId } from "../lib/utils";
import { useSettingsData } from "./useSettingsData";

declare global {
	interface Window {
		YT: {
			Player: new (
				elementId: string,
				options: {
					videoId: string;
					playerVars?: {
						autoplay?: 0 | 1;
						controls?: 0 | 1;
						loop?: 0 | 1;
						playlist?: string;
						mute?: 0 | 1;
					};
					events?: {
						onReady?: (event: { target: YTPlayer }) => void;
						onStateChange?: (event: { data: number }) => void;
						onError?: (event: { data: number }) => void;
					};
				},
			) => YTPlayer;
			PlayerState: {
				ENDED: number;
				PLAYING: number;
				PAUSED: number;
				BUFFERING: number;
				CUED: number;
			};
		};
		onYouTubeIframeAPIReady: () => void;
	}
}

interface YTPlayer {
	playVideo: () => void;
	pauseVideo: () => void;
	stopVideo: () => void;
	mute: () => void;
	unMute: () => void;
	isMuted: () => boolean;
	setVolume: (volume: number) => void;
	getVolume: () => number;
	loadVideoById: (videoId: string, startSeconds?: number) => void;
	cueVideoById: (videoId: string, startSeconds?: number) => void;
	destroy: () => void;
}

type PlayerMode = "work" | "break";

export function useYoutubePlayer(
	containerRef: React.RefObject<HTMLDivElement | null>,
	mode: PlayerMode,
) {
	const { settings } = useSettingsData();
	const playerRef = useRef<YTPlayer | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isApiLoaded, setIsApiLoaded] = useState(false);
	const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

	// Load YouTube API script
	useEffect(() => {
		if (!window.YT) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";

			window.onYouTubeIframeAPIReady = () => {
				setIsApiLoaded(true);
			};

			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
		} else {
			setIsApiLoaded(true);
		}

		return () => {
			window.onYouTubeIframeAPIReady = () => {};
		};
	}, []);

	// Initialize or update the player when API is loaded and container is available
	useEffect(() => {
		if (!isApiLoaded || !containerRef.current) return;

		const videoUrl = mode === "work" ? settings.workUrl : settings.breakUrl;
		const videoId = extractYoutubeId(videoUrl);

		if (!videoId) {
			setCurrentVideoId(null);
			return;
		}

		setCurrentVideoId(videoId);

		// Create a container for the player if it doesn't exist
		const playerId = `youtube-player-${mode}`;
		let playerElement = document.getElementById(playerId);

		if (!playerElement) {
			playerElement = document.createElement("div");
			playerElement.id = playerId;
			containerRef.current.appendChild(playerElement);
		}

		// Destroy existing player if it exists
		if (playerRef.current) {
			playerRef.current.destroy();
			playerRef.current = null;
		}

		// Create new player
		playerRef.current = new window.YT.Player(playerId, {
			videoId,
			playerVars: {
				autoplay: 1,
				controls: 1,
				loop: 1,
				playlist: videoId, // Required for looping
				mute: settings.isMuted ? 1 : 0,
			},
			events: {
				onReady: (event) => {
					setIsReady(true);

					const player = event.target;

					// Apply volume setting
					player.setVolume(settings.volume);

					// Apply mute setting
					if (settings.isMuted) {
						player.mute();
					} else {
						player.unMute();
					}
				},
				onError: (event) => {
					console.error("YouTube player error:", event.data);
				},
			},
		});

		return () => {
			if (playerRef.current) {
				playerRef.current.destroy();
				playerRef.current = null;
				setIsReady(false);
			}
		};
	}, [
		isApiLoaded,
		containerRef,
		mode,
		settings.workUrl,
		settings.breakUrl,
		settings.isMuted,
		settings.volume,
	]);

	// Update volume and mute state when settings change
	useEffect(() => {
		if (!isReady || !playerRef.current) return;

		playerRef.current.setVolume(settings.volume);

		if (settings.isMuted) {
			playerRef.current.mute();
		} else {
			playerRef.current.unMute();
		}
	}, [isReady, settings.volume, settings.isMuted]);

	return {
		isReady,
		currentVideoId,
		player: playerRef.current,
	};
}
