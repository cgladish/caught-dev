import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
export const timeAgo = new TimeAgo("en-US");

export const combineDateAndTime = (date: Date, time: Date | null) => {
  if (!time) {
    return date;
  }
  return new Date(date.toLocaleDateString() + " " + time.toLocaleTimeString());
};
