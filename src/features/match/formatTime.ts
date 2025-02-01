// export const updateTimeThunk = (timeInSeconds: number): AppThunk => {
//   return async (dispatch, getState) => {
//     // console.log("updateTimeThunk");
//     if (getState().match.mediaPlayer.time !== timeInSeconds)
//       dispatch(updateTime(timeInSeconds));
//   };
// };
// UTILS

export function formatTime(time: number): string {
  return `${minute()}:${second()}`;

  function minute() {
    return String(Math.floor(time / 60)).padStart(2, "0");
  }
  function second() {
    return String(Math.floor(time % 60)).padStart(2, "0");
  }
}
