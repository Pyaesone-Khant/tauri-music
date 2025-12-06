export const isZawgyiCode = (lyrics: string) => {
    // @ts-ignore
    const detector = new google_myanmar_tools.ZawgyiDetector();
    const score: number = detector.getZawgyiProbability(lyrics);
    return parseInt(score.toFixed(2)) > 0.95;
}
