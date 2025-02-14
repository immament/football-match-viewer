import { useEffect, useState } from "react";
import { useAppZuStore } from "/app/app.zu.store";

const COMMENTS_DISPLAY_TIME = 3000;
const COMMENTS_MAX_COUNT = 3;
const COMMENTS_SLICE_ARG = -COMMENTS_MAX_COUNT + 1;

export function CommentsBox() {
  const commentToDisplay = useAppZuStore(
    (state) => state.matchTimer.commentToDisplay
  );
  const commentsVisible = useAppZuStore(
    (state) => state.mediaPlayer.commentsVisible
  );

  const [comments, setComments] = useState<
    { displayTime: string; content: string; step: number }[]
  >([]);

  useEffect(() => {
    if (commentToDisplay) {
      setTimeout(() => {
        setComments((state) => state.filter((c) => c !== commentToDisplay));
      }, COMMENTS_DISPLAY_TIME);
      setComments((state) => [
        ...state.slice(COMMENTS_SLICE_ARG),
        commentToDisplay,
      ]);
    }
  }, [commentToDisplay]);
  useEffect(() => {
    if (!commentsVisible) setComments([]);
  }, [commentsVisible]);

  return (
    <div
      className="comment-box"
      style={{ visibility: comments.length ? "visible" : "hidden" }}
    >
      {comments.map((comment) => (
        <div className="comment-box-content" key={comment.step}>
          <div>{comment.displayTime}</div>
          <div>{comment.content}</div>
        </div>
      ))}
    </div>
  );
}
