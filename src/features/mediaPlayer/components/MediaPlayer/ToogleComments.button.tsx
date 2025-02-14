import { useMemo } from "react";
import { useAppZuStore } from "/app/app.zu.store";

export function ToogleCommentsButton() {
  const commentsVisible = useAppZuStore(
    (state) => state.mediaPlayer.commentsVisible
  );
  const toogleComments = useAppZuStore(
    (state) => state.mediaPlayer.toogleComments
  );

  const iconCss = useMemo(() => {
    return commentsVisible ? "bx bxs-comment-detail" : "bx bx-comment";
  }, [commentsVisible]);

  return (
    <button
      className="mv-toogle-comments"
      onClick={toogleComments}
      title="Toogle comments"
    >
      <i className={iconCss}></i>
    </button>
  );
}
