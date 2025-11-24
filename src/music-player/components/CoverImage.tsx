import { Music } from "lucide-react";
import { cn } from "../../libs/cn";

type Props = {
	base64_cover: string | null | undefined;
	className?: HTMLDivElement["className"];
	iconSize?: number;
};

export function CoverImage({ base64_cover, className, iconSize = 120 }: Props) {
	const coverUrl = base64_cover
		? `data:image/jpeg;base64,${base64_cover}`
		: null;

	return coverUrl ? (
		<img
			src={coverUrl}
			alt="Song Album Cover"
			className={`object-cover aspect-square rounded-sm ${className}`}
		/>
	) : (
		<div
			className={cn(
				"w-full bg-primary/15 flex items-center justify-center rounded-sm aspect-square",
				className
			)}
		>
			<Music size={iconSize} className="text-primary" />
		</div>
	);
}
