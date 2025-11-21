import { Music } from "lucide-react";

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
			className={`object-cover rounded-sm ${className}`}
		/>
	) : (
		<div className="w-full bg-primary/15 flex items-center justify-center rounded-sm">
			<Music size={iconSize} className="text-primary" />
		</div>
	);
}
