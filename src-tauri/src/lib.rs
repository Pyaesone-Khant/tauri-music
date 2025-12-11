// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use base64::prelude::*;
use base64::Engine;
use id3::{Tag, TagLike};
use serde::Deserialize;

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

#[derive(Debug, serde::Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // Maps snake_case (Rust) to camelCase (JSON)
struct LrcLibResponse {
    track_name: String,
    artist_name: String,
    synced_lyrics: Option<String>, // Option because sometimes it might be null
    plain_lyrics: String,
}

#[tauri::command]
async fn fetch_synced_lyrics(artist: String, track: String) -> Result<LrcLibResponse, String> {
    // Note: Arguments must be owned types (String), not borrowed (&str), for async commands.

    let base_url = "https://lrclib.net/api/search";
    let url = format!(
        "{}?artist_name={}&track_name={}",
        base_url,
        urlencoding::encode(&artist),
        urlencoding::encode(&track)
    );

    // 1. Make the HTTP GET request
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network/HTTP Error: {}", e))?;

    // 2. Deserialize the JSON array response
    let results = response
        .json::<Vec<LrcLibResponse>>()
        .await
        .map_err(|e| format!("JSON Parsing Error: {}", e))?;

    // 3. Extract the first result or return a custom error string
    results.into_iter().next().ok_or_else(|| {
        format!(
            "No matching synchronized lyrics found for: {} - {}",
            artist, track
        )
    })
}

#[tauri::command]
fn read_file_content(file_path: String) -> String {
    std::fs::read_to_string(file_path).unwrap_or_else(|_| "Error reading file".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_metadata,
            fetch_synced_lyrics,
            read_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
