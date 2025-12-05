import { motion } from "framer-motion";

interface Props {
	text: string;
	isActive: boolean;
}

export function KaraokeLine({
	text,
	isActive,
}: Props) {
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
						inactive: { opacity: 0.7, filter: "blur(1px)" },
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
