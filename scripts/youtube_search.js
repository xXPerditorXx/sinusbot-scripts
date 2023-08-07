registerPlugin(
    {
        name: 'YouTube Search',
        version: '1.1.0',
        backends: ['discord'],
        description: 'Search YouTube and play.',
        author: 'xXPerditorXx',
        requiredModules: ['http'],
        vars: [
            {
                name: 'ytApiKey',
                title: 'You can get your YouTube Api Key at https://console.cloud.google.com/',
                type: 'string',
                placeholder: 'Enter your YouTube Api Key here',
            },
            {
                name: 'debugmode',
                title: 'If you want see Debug-Information, like your YouTube Api Key or Searchquery',
                type: 'checkbox',
            },
        ],
    },
    (_, { ytApiKey, debugmode }, meta) => {
        // Reply messages
        const YOUTUBE_SEARCH_ERR = 'An error occurred while searching YouTube.';
        const YOUTUBE_QUERY_ERR = 'An error occurred while parsing the YouTube response.';
        const NO_VIDEO_FOUND = 'No videos found for the given query.';
        const YOUTUBE_STREAM_ERROR = 'Unable to stream this YouTube Video.';
        const APIKEY_NOT_SET = 'YouTube API key is not set. Please configure it first.';

        const event = require('event');
        const http = require('http');
        const engine = require('engine');
        const media = require('media');
        var apiKey = '';

        event.on('load', () => {
            engine.log(`Loaded ${meta.name} v${meta.version} by ${meta.author} :)`);
            if (debugmode) {
                engine.log('The debug for YouTube Search is activated!');
            }
            // @ts-ignore
            const command = require('command');
            if (!ytApiKey) {
                engine.log(APIKEY_NOT_SET);
                engine.notify(APIKEY_NOT_SET);
                return;
            } else {
                if (debugmode) {
                    engine.log('YT-API-Key: ' + ytApiKey);
                }
                apiKey = ytApiKey;
            }

            command
                .createCommand('ytsearch')
                .alias('yts')
                .addArgument((args) => args.rest.setName('search_query'))
                .help('Searches YouTube for videos based on your query')
                .manual('Searched through YouTube with your query, to find the Video you want.')
                // @ts-ignore
                .exec((client, args, reply, ev) => {
                    let query = '';

                    if (!args.search_query) {
                        reply('Usage: ' + engine.getCommandPrefix() + 'yts <query>');
                        return;
                    }
                    query = args.search_query;
                    query = query.replace(/ /g, '+');

                    if (debugmode) {
                        engine.log('Searchquery: "' + query + '"');
                    }
                    http.simpleRequest(
                        {
                            method: 'GET',
                            url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
                            timeout: 6000,
                            headers: { 'Content-Type': 'application/json' },
                        },
                        function (error, response) {
                            if (error) {
                                reply(YOUTUBE_SEARCH_ERR);
                                return;
                            }
                            try {
                                // @ts-ignore
                                const data = JSON.parse(response.data);
                                if (data.items && data.items.length > 0) {
                                    const videoId = data.items[0].id.videoId;
                                    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                                    if (!media.ytStream(videoURL)) {
                                        reply(YOUTUBE_STREAM_ERROR);
                                    } else {
                                        reply('Youtube Video found, playing: ' + videoURL);
                                    }
                                } else {
                                    reply(NO_VIDEO_FOUND);
                                }
                            } catch (parseError) {
                                reply(YOUTUBE_QUERY_ERR);
                                reply(parseError);
                            }
                        },
                    );
                });

            command
                .createCommand('qytsearch')
                .alias('qyts')
                .addArgument((args) => args.rest.setName('search_query'))
                .help('Searches YouTube for videos based on your query')
                .manual('Searched through YouTube with your query, to find the Video you want and adds it to  the queue.')
                // @ts-ignore
                .exec((client, args, reply, ev) => {
                    let query = '';

                    if (!args.search_query) {
                        reply('Usage: ' + engine.getCommandPrefix() + 'qyts <query>');
                        return;
                    }
                    query = args.search_query;
                    query = query.replace(/ /g, '+');

                    if (debugmode) {
                        engine.log('Searchquery: "' + query + '"');
                    }
                    http.simpleRequest(
                        {
                            method: 'GET',
                            url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
                            timeout: 6000,
                            headers: { 'Content-Type': 'application/json' },
                        },
                        function (error, response) {
                            if (error) {
                                reply(YOUTUBE_SEARCH_ERR);
                                return;
                            }
                            try {
                                // @ts-ignore
                                const data = JSON.parse(response.data);
                                if (data.items && data.items.length > 0) {
                                    const videoId = data.items[0].id.videoId;
                                    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                                    if (!media.enqueueYt(videoURL)) {
                                        reply(YOUTUBE_STREAM_ERROR);
                                    } else {
                                        reply('Youtube Video found, adding it to the queue: ' + videoURL);
                                    }
                                } else {
                                    reply(NO_VIDEO_FOUND);
                                }
                            } catch (parseError) {
                                reply(YOUTUBE_QUERY_ERR);
                                reply(parseError);
                            }
                        },
                    );
                });

            command
                .createCommand('ytsearchdl')
                .alias('ytsdl')
                .addArgument((args) => args.rest.setName('search_query'))
                .help('Searches YouTube for videos based on your query')
                .manual('Searches through YouTube with your query, to find the Video you want and imports it.')
                // @ts-ignore
                .exec((client, args, reply, ev) => {
                    let query = '';
                    if (!args.search_query) {
                        reply('Usage: ' + engine.getCommandPrefix() + 'ytsdl <query>');
                        return;
                    }
                    query = args.search_query;
                    query = query.replace(/ /g, '+');

                    if (debugmode) {
                        engine.log('Searchquery: "' + query + '"');
                    }
                    http.simpleRequest(
                        {
                            method: 'GET',
                            url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
                            timeout: 6000,
                            headers: { 'Content-Type': 'application/json' },
                        },
                        function (error, response) {
                            if (error) {
                                reply(YOUTUBE_SEARCH_ERR);
                                return;
                            }
                            try {
                                // @ts-ignore
                                const data = JSON.parse(response.data);
                                if (data.items && data.items.length > 0) {
                                    const videoId = data.items[0].id.videoId;
                                    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                                    if (media.ytdl(videoURL, true)) {
                                        reply('Youtube Video found, downloaded and now playing: ' + videoURL);
                                    }
                                } else {
                                    reply(NO_VIDEO_FOUND);
                                }
                            } catch (parseError) {
                                reply(YOUTUBE_QUERY_ERR);
                                reply(parseError);
                            }
                        },
                    );
                });

            command
                .createCommand('qytsearchdl')
                .alias('qytsdl')
                .addArgument((args) => args.rest.setName('search_query'))
                .help('Searches YouTube for videos based on your query')
                .manual('Searches through YouTube with your query, to find the Video you want and imports it and adds it to the queue.')
                // @ts-ignore
                .exec((client, args, reply, ev) => {
                    let query = '';
                    if (!args.search_query) {
                        reply('Usage: ' + engine.getCommandPrefix() + 'qytsdl <query>');
                        return;
                    }
                    query = args.search_query;
                    query = query.replace(/ /g, '+');

                    if (debugmode) {
                        engine.log('Searchquery: "' + query + '"');
                    }
                    http.simpleRequest(
                        {
                            method: 'GET',
                            url: `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}`,
                            timeout: 6000,
                            headers: { 'Content-Type': 'application/json' },
                        },
                        function (error, response) {
                            if (error) {
                                reply(YOUTUBE_SEARCH_ERR);
                                return;
                            }
                            try {
                                // @ts-ignore
                                const data = JSON.parse(response.data);
                                if (data.items && data.items.length > 0) {
                                    const videoId = data.items[0].id.videoId;
                                    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
                                    if (media.enqueueYtdl(videoURL)) {
                                        reply('Youtube Video found, downloaded and added to the queue: ' + videoURL);
                                    }
                                } else {
                                    reply(NO_VIDEO_FOUND);
                                }
                            } catch (parseError) {
                                reply(YOUTUBE_QUERY_ERR);
                                reply(parseError);
                            }
                        },
                    );
                });
        });
    },
);
