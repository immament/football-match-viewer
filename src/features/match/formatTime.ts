export function formatTime(time: number): string {
  return `${minute()}:${second()}`;

  function minute() {
    return String(Math.floor(time / 60)).padStart(2, "0");
  }
  function second() {
    return String(Math.floor(time % 60)).padStart(2, "0");
  }
}
