export function formatTimeFromMinutes(timeInMinutes: number): string {
  return formatTime(timeInMinutes * 60);
}

export function formatTime(timeInSeconds: number): string {
  return `${minute()}:${second()}`;

  function minute() {
    return String(Math.floor(timeInSeconds / 60)).padStart(2, "0");
  }
  function second() {
    return String(Math.floor(timeInSeconds % 60)).padStart(2, "0");
  }
}
