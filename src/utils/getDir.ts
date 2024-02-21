/**
 * Returns the directory based on the location of the file.
 * @returns The directory name, either "src" or "dist".
 */
export default function getDir(): "src" | "dist" {
  return __dirname.includes("src") ? "src" : "dist";
}
