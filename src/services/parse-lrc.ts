export function parseLRC(lrcText: string, duration: number) {
    const lines = lrcText.trim().split("\n");
    const lyricData: LyricData[] = [];

    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    for (const line of lines) {
        const timestamps = extractTimeTags(line, timeRegex);
        const text = extractLyricText(line, timestamps);

        if (!text) continue;

        for (const ts of timestamps) {
            lyricData.push({
                startTime: convertToSeconds(ts),
                lyric: text,
                endTime: duration, // temp value; updated later
            });
        }
    }

    // Sort and update end times
    lyricData.sort((a, b) => a.startTime - b.startTime);
    updateEndTimes(lyricData, duration);

    return lyricData;
}

/** Extract all time tags from a line */
function extractTimeTags(line: string, regex: RegExp) {
    const matches: { minutes: number; seconds: number; msString: string; index: number }[] = [];
    let match;

    // Reset regex lastIndex (important for global regex reused across lines)
    regex.lastIndex = 0;

    while ((match = regex.exec(line)) !== null) {
        matches.push({
            minutes: parseInt(match[1], 10),
            seconds: parseInt(match[2], 10),
            msString: match[3],
            index: regex.lastIndex,
        });
    }

    return matches;
}

/** Extract text after the last timestamp */
function extractLyricText(
    line: string,
    timestamps: { index: number }[]
): string {
    const startIdx = timestamps.length > 0 ? timestamps[timestamps.length - 1].index : 0;
    return line.substring(startIdx).trim();
}

/** Convert timestamp group to seconds */
function convertToSeconds(ts: { minutes: number; seconds: number; msString: string }) {
    const ms = parseInt(ts.msString.padEnd(3, "0"), 10);
    return ts.minutes * 60 + ts.seconds + ms / 1000;
}

/** Assign the endTime for each segment */
function updateEndTimes(segments: LyricData[], duration: number) {
    for (let i = 0; i < segments.length; i++) {
        segments[i].endTime =
            i < segments.length - 1
                ? segments[i + 1].startTime
                : duration;
    }
}