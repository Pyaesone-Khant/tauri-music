// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use futures_util::{SinkExt, StreamExt};
use tauri::async_runtime::spawn;
use tauri::Emitter;
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_websocket_server(app_handle: tauri::AppHandle) -> Result<(), String> {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .map_err(|e| e.to_string())?;

    spawn(async move {
        loop {
            let (stream, _) = listener.accept().await.unwrap();
            let app_handle: tauri::AppHandle = app_handle.clone();
            spawn(async move {
                let ws_stream: tokio_tungstenite::WebSocketStream<_> =
                    accept_async(stream).await.unwrap();
                let (mut sender, mut receiver) = ws_stream.split();

                while let Some(msg) = receiver.next().await {
                    let msg = msg.unwrap();
                    if msg.is_text() || msg.is_binary() {
                        // Emit to frontend
                        app_handle
                            .emit("websocket-message", msg.to_string())
                            .unwrap();
                        // Echo back
                        sender.send(Message::text("Received")).await.unwrap();
                    }
                }
            });
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_websocket_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
