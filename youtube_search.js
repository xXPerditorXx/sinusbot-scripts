registerPlugin(
  {
    name: "YouTube Search",
    version: "1.0.0",
    backends: ["discord"],
    description: "Search YouTube and play.",
    author: "xXPerditorXx",
    requiredModules: ["http"],
    vars: [],
  },
  (_, config, meta) => {
    // Reply messages
    const YOUTUBE_SEARCH_ERR = "An error occurred while searching YouTube.";
    const YOUTUBE_QUERY_ERR =
      "An error occurred while parsing the YouTube response.";
    const NO_VIDEO_FOUND = "No videos found for the given query.";
    const YOUTUBE_STREAM_ERROR = "Unable to stream this YouTube Video.";

    const event = require("event");
    const http = require("http");
    const engine = require("engine");
    const Command = require("command");
    const media = require("media");
    const apiKey = "";

    event.on("load", () => {
      if (!Command) throw new Error("Command.js library not found!");
      console.log("YT-API-Key: ", apiKey);
      if (!apiKey) {
        reply(
          "YouTube API key is not set. Please configure it in the script itself."
        );
        return;
      }

      Command.createCommand("ytsearch")
        .alias("yts")
        .addArgument((args) => args.rest.setName("search_query"))
        .help("Searches YouTube for videos based on your query")
        .manual(
          "Searched through YouTube with your query, to find the Video you want."
        )
        .exec((client, args, reply, ev) => {
          let query = "";
          if (!args.search_query) {
            reply("Usage: " + engine.getCommandPrefix() + "yts <query>");
            return;
          }
          query = args.search_query;
          query = query.replace(/ /g, "+");

          console.log('Searchquery: "' + query + '"');
          http.simpleRequest(
            {
              method: "GET",
              url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
              timeout: 6000,
              headers: { "Content-Type": "application/json" },
            },
            function (error, response) {
              if (error) {
                reply(YOUTUBE_SEARCH_ERR);
                return;
              }
              try {
                const data = JSON.parse(response.data);
                if (data.items && data.items.length > 0) {
                  const videoId = data.items[0].id.videoId;
                  const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                  reply("Youtube Video found, playing: " + videoURL);
                  if (!media.ytStream(videoURL)) {
                    reply(YOUTUBE_STREAM_ERROR);
                  }
                } else {
                  reply(NO_VIDEO_FOUND);
                }
              } catch (parseError) {
                reply(YOUTUBE_QUERY_ERR);
                reply(parseError);
              }
            }
          );
        });

      Command.createCommand("ytsearchdl")
        .alias("ytsdl")
        .addArgument((args) => args.rest.setName("search_query"))
        .help("Searches YouTube for videos based on your query")
        .manual(
          "Searches through YouTube with your query, to find the Video you want and imports it."
        )
        .exec((client, args, reply, ev) => {
          let query = "";
          if (!args.search_query) {
            reply("Usage: " + engine.getCommandPrefix() + "ytsdl <query>");
            return;
          }
          query = args.search_query;
          query = query.replace(/ /g, "+");

          console.log('Searchquery: "' + query + '"');
          http.simpleRequest(
            {
              method: "GET",
              url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
              timeout: 6000,
              headers: { "Content-Type": "application/json" },
            },
            function (error, response) {
              if (error) {
                reply(YOUTUBE_SEARCH_ERR);
                return;
              }
              try {
                const data = JSON.parse(response.data);
                if (data.items && data.items.length > 0) {
                  const videoId = data.items[0].id.videoId;
                  const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                  reply("Youtube Video found, playing: " + videoURL);
                  media.ytdl(videoURL, true);
                } else {
                  reply(NO_VIDEO_FOUND);
                }
              } catch (parseError) {
                reply(YOUTUBE_QUERY_ERR);
                reply(parseError);
              }
            }
          );
        });
    });
  }
);
