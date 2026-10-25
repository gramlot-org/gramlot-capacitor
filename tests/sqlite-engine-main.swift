import Foundation
@main struct DatabaseHarness {
    static func main() throws {
        let db = try NativeDatabase(file: URL(fileURLWithPath: CommandLine.arguments[1]))
        while let line = readLine() {
            do {
                let request = try JSONSerialization.jsonObject(with: Data(line.utf8)) as! [String: Any]
                let rows = try db.run(request["sql"] as! String, params: request["params"]!)
                print(String(data: try JSONSerialization.data(withJSONObject: ["rows": rows]), encoding: .utf8)!)
            } catch { print(String(data: try! JSONSerialization.data(withJSONObject: ["error": error.localizedDescription]), encoding: .utf8)!) }
            fflush(stdout)
        }
        db.close()
    }
}
