type Metadata = {
    title: string | null;
    artist: string | null;
    album: string | null;
    base64_cover: string | null;
    year: number | null;
    lyrics: string | null;
}

type Song = {
    path: string;
    url: string;
    name: string;
    metadata?: Metadata;
    timestamp: number;
}