// Utility function to format seconds into MM:SS
export const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
};

export const extractSpecificMetadata = (song: Song | null, type: keyof Metadata) => {
    return song?.metadata ? song.metadata[type] : null;
}