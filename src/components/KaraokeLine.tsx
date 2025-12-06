import { motion } from "framer-motion";

interface Props {
	text: string;
	isActive: boolean;
	index: number;
	activeLineIndex: number;
}

export function KaraokeLine({ text, isActive, index, activeLineIndex }: Props) {
	const words = text.split(" ");

	return (
		<motion.span
			className="inline-block"
			initial="inactive"
			animate={isActive ? "active" : "inactive"}
			variants={{
				active: {
					transition: { staggerChildren: 0.03 },
				},
				inactive: {},
			}}
		>
			{words.map((word, i) => (
				<motion.span
					key={i}
					className="inline-block mr-1"
					variants={{
						inactive: {
							opacity: 0.7,
							filter: checkDistanceFromActiveLine({
								index,
								activeLineIndex,
								measureDistance: 5,
							})
								? "blur(2px)"
								: checkDistanceFromActiveLine({
										index,
										activeLineIndex,
										measureDistance: 3,
								  })
								? "blur(1.25px)"
								: "blur(0.5px)",
						},
						active: {
							opacity: 1,
							filter: "blur(0px)",
							transition: { duration: 0.25 },
						},
					}}
				>
					{word}
				</motion.span>
			))}
		</motion.span>
	);
}

const checkDistanceFromActiveLine = ({
	index,
	activeLineIndex,
	measureDistance = 2,
}: {
	index: number;
	activeLineIndex: number;
	measureDistance: number;
}): boolean => {
	return (
		index > activeLineIndex + measureDistance ||
		index < activeLineIndex - measureDistance
	);
};
