import Foundation

// IMPORTANT: Copy Config.secrets.swift.example to Config.secrets.swift
// and fill in your Supabase credentials. Config.secrets.swift is gitignored.

enum AppConfig {
    static let supabaseURL: URL = {
        if let url = URL(string: Secrets.supabaseURL) { return url }
        fatalError("Invalid SUPABASE_URL in Config.secrets.swift")
    }()
    static let supabaseAnonKey = Secrets.supabaseAnonKey
}
