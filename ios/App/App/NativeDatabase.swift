import Foundation
import CoreFoundation
import SQLite3

/// Serialized by the plugin queue. Uses only Apple's system SQLite library.
final class NativeDatabase {
    private var db: OpaquePointer?
    private let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
    private func error(_ message: String) -> NSError { NSError(domain: "GramlotSQLite", code: 1, userInfo: [NSLocalizedDescriptionKey: message]) }
    init(file: URL) throws {
        let rc = sqlite3_open_v2(file.path, &db, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX, nil)
        guard rc == SQLITE_OK else { let message = db.map { String(cString: sqlite3_errmsg($0)) } ?? "Cannot open database"; if let db { sqlite3_close(db) }; db = nil; throw error(message) }
        sqlite3_busy_timeout(db, 1500)
        sqlite3_set_authorizer(db, { _, action, first, _, _, _ in
            if action == SQLITE_ATTACH || action == SQLITE_DETACH { return SQLITE_DENY }
            if action == SQLITE_PRAGMA {
                let allowed = ["foreign_keys", "table_info", "table_xinfo", "index_list", "index_xinfo", "foreign_key_list", "foreign_key_check"]
                if !allowed.contains(first.map { String(cString: $0).lowercased() } ?? "") { return SQLITE_DENY }
            }
            return SQLITE_OK
        }, nil)
        do { _ = try run("PRAGMA foreign_keys=ON", params: []) }
        catch { close(); throw error }
    }
    deinit { close() }
    func close() { if let db { sqlite3_close_v2(db) }; db = nil }
    func run(_ sql: String, params: Any) throws -> [[String: Any]] {
        guard let db else { throw error("Database connection is closed") }
        guard !sql.contains("\0"), sql.utf8.count <= 1_000_000 else { throw error("Invalid SQL statement") }
        var statement: OpaquePointer?
        let rc = try sql.withCString { source -> Int32 in
            var tail: UnsafePointer<CChar>?
            let result = sqlite3_prepare_v2(db, source, -1, &statement, &tail)
            if let tail, !String(cString: tail).trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                if let statement { sqlite3_finalize(statement) }; statement = nil
                throw error("One SQL statement per operation is required")
            }
            return result
        }
        guard rc == SQLITE_OK, let statement else { throw error(String(cString: sqlite3_errmsg(db))) }
        defer { sqlite3_finalize(statement) }
        let count = Int(sqlite3_bind_parameter_count(statement))
        var values: [Any] = []
        if let positional = params as? [Any] {
            guard positional.count == count else { throw error("Parameter count mismatch") }; values = positional
        } else if let named = params as? [String: Any] {
            var used = Set<String>()
            for index in 1..<(count + 1) {
                guard let raw = sqlite3_bind_parameter_name(statement, Int32(index)) else { throw error("Expected named parameters") }
                let key = String(cString: raw)
                guard let value = named[key] else { throw error("Missing SQL parameter") }
                used.insert(key); values.append(value)
            }
            guard used == Set(named.keys) else { throw error("Unexpected SQL parameter") }
        } else { throw error("Invalid SQL parameters") }
        for (offset, value) in values.enumerated() {
            let index = Int32(offset + 1), result: Int32
            if value is NSNull { result = sqlite3_bind_null(statement, index) }
            else if let text = value as? String {
                result = text.withCString { sqlite3_bind_text(statement, index, $0, Int32(text.utf8.count), transient) }
            } else if let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() {
                let n = number.doubleValue
                guard n.isFinite, abs(n) <= 9_007_199_254_740_991 else { throw error("Unsupported numeric parameter") }
                result = n.rounded() == n ? sqlite3_bind_int64(statement, index, Int64(n)) : sqlite3_bind_double(statement, index, n)
            } else { throw error("Only null, text and safe finite numbers are supported") }
            guard result == SQLITE_OK else { throw error(String(cString: sqlite3_errmsg(db))) }
        }
        var rows: [[String: Any]] = []
        while true {
            let step = sqlite3_step(statement)
            if step == SQLITE_DONE { return rows }
            guard step == SQLITE_ROW else { throw error(String(cString: sqlite3_errmsg(db))) }
            var row: [String: Any] = [:]
            for index in 0..<sqlite3_column_count(statement) {
                let name = String(cString: sqlite3_column_name(statement, index))
                guard row[name] == nil else { throw error("Duplicate result column name") }
                switch sqlite3_column_type(statement, index) {
                case SQLITE_NULL: row[name] = NSNull()
                case SQLITE_INTEGER:
                    let value = sqlite3_column_int64(statement, index)
                    guard value >= -9_007_199_254_740_991 && value <= 9_007_199_254_740_991 else { throw error("Result integer exceeds JavaScript safe range") }
                    row[name] = value
                case SQLITE_FLOAT:
                    let value = sqlite3_column_double(statement, index)
                    guard value.isFinite else { throw error("Non-finite result") }; row[name] = value
                case SQLITE_TEXT:
                    let bytes = sqlite3_column_text(statement, index)!
                    row[name] = String(decoding: UnsafeBufferPointer(start: bytes, count: Int(sqlite3_column_bytes(statement, index))), as: UTF8.self)
                default: throw error("BLOB results are outside this scalar database PoC")
                }
            }
            rows.append(row)
        }
    }
}
