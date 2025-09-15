#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};
use yahoo_finance_api as yahoo;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct StockData {
    symbol: String,
    price: f64,
    change: f64,
    #[serde(rename = "changePercent")]
    change_percent: f64,
}

#[tauri::command]
async fn fetch_stocks(app: tauri::AppHandle, symbols: Vec<String>) -> Result<Vec<StockData>, String> {
    println!("Fetching stocks for symbols: {:?}", symbols);
    
    let provider = yahoo::YahooConnector::new()
        .map_err(|e| format!("Failed to create Yahoo connector: {}", e))?;
    
    let mut stocks = Vec::new();
    
    for symbol in &symbols {
        println!("Fetching data for {}", symbol);
        
        // Try to get 5 day data to calculate change from previous close
        match provider.get_quote_range(symbol, "1d", "5d").await {
            Ok(response) => {
                let quotes = response.quotes().unwrap_or_default();
                if quotes.len() >= 2 {
                    // Get current (last) and previous quotes
                    let current_quote = &quotes[quotes.len() - 1];
                    let previous_quote = &quotes[quotes.len() - 2];
                    
                    let current_price = current_quote.close;
                    let previous_close = previous_quote.close;
                    let change = current_price - previous_close;
                    let change_percent = (change / previous_close) * 100.0;
                    
                    stocks.push(StockData {
                        symbol: symbol.clone(),
                        price: current_price,
                        change,
                        change_percent,
                    });
                    
                    println!("  Price: ${:.2}, Change: {:.2} ({:.2}%)", 
                        current_price, change, change_percent);
                } else if let Ok(quote) = response.last_quote() {
                    // Fallback to single day data
                    let current_price = quote.close;
                    let open_price = quote.open;
                    let change = current_price - open_price;
                    let change_percent = if open_price != 0.0 { (change / open_price) * 100.0 } else { 0.0 };
                    
                    stocks.push(StockData {
                        symbol: symbol.clone(),
                        price: current_price,
                        change,
                        change_percent,
                    });
                    
                    println!("  Intraday Price: ${:.2}, Change: {:.2} ({:.2}%)", 
                        current_price, change, change_percent);
                } else {
                    println!("  No quote data available for {}", symbol);
                    // Try with a different range as fallback
                    if let Ok(response_5d) = provider.get_quote_range(symbol, "1d", "5d").await {
                        if let Ok(quote) = response_5d.last_quote() {
                            let current_price = quote.close;
                            let open_price = quote.open;
                            let change = current_price - open_price;
                            let change_percent = (change / open_price) * 100.0;
                            
                            stocks.push(StockData {
                                symbol: symbol.clone(),
                                price: current_price,
                                change,
                                change_percent,
                            });
                            
                            println!("  Fallback Price: ${:.2}, Change: {:.2} ({:.2}%)", 
                                current_price, change, change_percent);
                        }
                    }
                }
            }
            Err(e) => {
                println!("  Error fetching {}: {}", symbol, e);
                // Try alternative interval/range combination
                if let Ok(response) = provider.get_quote_range(symbol, "1m", "1d").await {
                    if let Ok(quote) = response.last_quote() {
                        let current_price = quote.close;
                        let high = quote.high;
                        let low = quote.low;
                        let avg = (high + low) / 2.0;
                        let change = current_price - avg;
                        let change_percent = (change / avg) * 100.0;
                        
                        stocks.push(StockData {
                            symbol: symbol.clone(),
                            price: current_price,
                            change,
                            change_percent,
                        });
                        
                        println!("  Alternative Price: ${:.2}, Change: {:.2} ({:.2}%)", 
                            current_price, change, change_percent);
                    }
                }
            }
        }
    }

    if stocks.is_empty() {
        return Err("Failed to fetch any stock data".to_string());
    }

    println!("Successfully fetched {} stocks", stocks.len());
    
    // Update tray title with stock info
    if let Some(tray) = app.tray_by_id("main") {
        if !stocks.is_empty() {
            // Show first stock in tray title
            let stock = &stocks[0];
            let arrow = if stock.change >= 0.0 { "↑" } else { "↓" };
            let title = format!("{}: ${:.2} {} {:.1}%", 
                stock.symbol, 
                stock.price, 
                arrow, 
                stock.change_percent.abs()
            );
            let _ = tray.set_title(Some(&title));
        }
    }
    
    Ok(stocks)
}

#[tauri::command]
async fn update_tray_title(app: tauri::AppHandle, title: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_title(Some(&title));
        Ok(())
    } else {
        Err("Tray not found".to_string())
    }
}

fn position_window_near_tray<R: Runtime>(window: &tauri::WebviewWindow<R>) {
    // Simply center the window on screen
    let _ = window.center();
    let _ = window.show();
    let _ = window.set_focus();
    let _ = window.set_always_on_top(true);
}

fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&show_i, &refresh_i, &quit_i])?;

    let _ = TrayIconBuilder::with_id("main")
        .title("")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "refresh" => {
                app.emit("refresh-stocks", ()).unwrap();
            }
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    position_window_near_tray(&window);
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    println!("Window found, toggling visibility");
                    if window.is_visible().unwrap_or(false) {
                        println!("Hiding window");
                        let _ = window.hide();
                    } else {
                        println!("Showing window");
                        // Position window near the menu bar
                        position_window_near_tray(&window);
                    }
                } else {
                    println!("Window not found!");
                }
            }
        })
        .build(app)?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            create_tray(app.handle())?;
            
            // Handle window close event to hide instead of quit
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // Prevent the window from closing
                    api.prevent_close();
                    // Hide the window instead
                    let _ = window_clone.hide();
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fetch_stocks, update_tray_title])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}