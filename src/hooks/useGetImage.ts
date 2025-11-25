import { useEffect, useState } from "react";

export function useGetImage(base64_cover: string | null | undefined) {

    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
    const coverUrl = base64_cover ? `data:image/jpeg;base64,${base64_cover}` : null;

    useEffect(() => {
        if (coverUrl) {
            const img = new Image();
            img.src = coverUrl;
            img.addEventListener("load", () => {
                setIsImageLoaded(true);
            })
            img.addEventListener("error", () => {
                setIsImageLoaded(false);
            })
        } else {
            setIsImageLoaded(false);
        }
    }, [coverUrl])

    return {
        coverUrl,
        isImageLoaded
    }
}
