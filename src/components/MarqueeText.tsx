import { cn } from "../libs/cn";

type Props = {
	children?: React.ReactNode;
	isAnimated?: boolean;
	classNames?: {
		container?: HTMLDivElement["className"];
		text?: HTMLParagraphElement["className"];
	};
};

export function MarqueeText({ children, classNames, isAnimated }: Props) {
	return (
		<div
			className={cn(
				classNames?.container,
				"w-full overflow-hidden whitespace-nowrap"
			)}
		>
			<p
				className={cn(classNames?.text, {
					"animate-marquee": isAnimated,
				})}
			>
				{children}
			</p>
		</div>
	);
}
