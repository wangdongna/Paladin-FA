const config = {
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%d %p %h %z %c %m"
      }
    },
    errorFile: {
      type: "file",
      filename: "log/errors.log"
    },
    errors: {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile"
    }
  },
  categories: {
    default: { appenders: ["console"], level: "DEBUG" }
  }
};

export default (logLevel: string) => {
  config.categories.default.level = logLevel;
  return config;
};
