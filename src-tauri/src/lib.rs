// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use base64::prelude::*;
use base64::Engine;
use id3::{Tag, TagLike};

#[derive(serde::Serialize)]
pub struct MetadataResponse {
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    // Base64 encoded JPEG/PNG data
    base64_cover: Option<String>,
    year: Option<i32>,
}

#[tauri::command]
async fn get_metadata(file_path: String) -> MetadataResponse {
    let tag = match Tag::read_from_path(&file_path) {
        Ok(tag) => tag,
        Err(_) => {
            return MetadataResponse {
                title: None,
                artist: None,
                album: None,
                base64_cover: None,
                year: None,
            }
        }
    };

    let cover_base64 = tag
        .pictures()
        .next() // Get the first picture
        .and_then(|picture| {
            // Encode the image data (byte vector) to a Base64 string
            Some(BASE64_STANDARD.encode(&picture.data))
        });

    MetadataResponse {
        title: tag.title().map(|s| s.to_string()),
        artist: tag.artist().map(|s| s.to_string()),
        album: tag.album().map(|s| s.to_string()),
        base64_cover: cover_base64,
        year: tag.year(),
    }
}

pub struct LyricsResponse {
    lyrics: String,
}

#[tauri::command]
async fn get_song_lyrics(song_title: String, artist_name: String) -> Result<String, String> {
    // Placeholder implementation
    let client = lyric_finder::Client::new();
    let result = client
        .get_lyric(&song_title)
        .await
        .map_err(|e| e.to_string())?;

    match result {
        lyric_finder::LyricResult::Some {
            track,
            artists,
            lyric,
        } => Ok(LyricsResponse { lyrics: lyric }.lyrics),
        lyric_finder::LyricResult::None => {
            print!("No lyric found for '{}' by '{}'", song_title, artist_name);
            Err("No lyric found".to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_metadata, get_song_lyrics])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
