import { extractColorsFromSrc } from "extract-colors";
import { useEffect, useState } from "react";

export function useGetGradientBackgroundColor(base64_cover: string | null) {
	const [gradientBackground, setGradientBackground] = useState<
		string | undefined
	>(undefined);

	useEffect(() => {
		if (base64_cover) {
			extractColorsFromSrc("data:image/jpeg;base64," + base64_cover)
				.then((extractedColors) => {
					const colors = extractedColors
						.slice()
						.sort((a, b) => b.area - a.area)
						.map((color) => color.hex)
						.slice(0, 3);

					if (colors.length >= 2) {
						const gradient = colors
							?.map((c, index) => {
								const position = Math.floor(
									(index / (colors.length - 1)) * 100
								);
								return `${c} ${position}%`;
							})
							.join(", ");
						setGradientBackground(gradient);
					} else {
						setGradientBackground(undefined);
					}
				})
				.catch((err) => {
					console.log(err);
					setGradientBackground(undefined);
				});
		} else {
			setGradientBackground(undefined);
		}
	}, [base64_cover]);

	return { gradientBackground };
}
