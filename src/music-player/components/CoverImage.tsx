import { Music } from "lucide-react";
import { useGetImage } from "../../hooks/useGetImage";
import { cn } from "../../libs/cn";

type Props = {
	base64_cover: string | null | undefined;
	className?: HTMLDivElement["className"];
	iconSize?: number;
};

export function CoverImage({ base64_cover, className, iconSize = 120 }: Props) {
	const { coverUrl, isImageLoaded } = useGetImage(base64_cover);

	return coverUrl && isImageLoaded ? (
		<div className="aspect-square shadow-md">
			<img
				src={coverUrl}
				alt="Song Album Cover"
				className={`object-cover rounded-sm ${className}`}
			/>
		</div>
	) : (
		<div
			className={cn(
				"w-full flex items-center justify-center rounded-sm aspect-square bg-blend-darken border border-white/20 shadow-md",
				className
			)}
		>
			<Music size={iconSize} className="mix-blend-overlay" />
		</div>
	);
}
