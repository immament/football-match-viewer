import logger from "loglevel";
import prefix from "loglevel-plugin-prefix";

export const logLevels = [
  "SILENT",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
] as const;
export type LogLevels = (typeof logLevels)[number];

logger.setLevel("INFO");

prefix.reg(logger);

export const originalFactory = logger.methodFactory;

logger.methodFactory = function (methodName, logLevel, loggerName) {
  if (methodName === "trace") {
    // eslint-disable-next-line no-console
    return (...args) => console.debug(...args);
  }
  return originalFactory(methodName, logLevel, loggerName);
};

const shortDate = new Intl.DateTimeFormat("en-US", {
  // hour: "2-digit",
  // minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: false,
});
prefix.apply(logger, {
  template: "[%t] %l (%n)",
  nameFormatter: (name) => name || "",
  timestampFormatter: shortDate.format,
});

export { logger };
