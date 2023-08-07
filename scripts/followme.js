registerPlugin(
    {
        name: 'Follow Me',
        version: '3.0.1',
        backends: ['discord'],
        description: 'The bot will follow the movements of any of the clients given and continues playing the song.',
        author: 'xXPerditorXx', // Original idea and design by Michael Friese, Max Schmitt, Jonas Bögle (Sinusbot Team)
        vars: [
            {
                name: 'clientUids',
                title: 'Comma-separated list of client-UIDs that the bot should follow',
                type: 'string',
            },
            {
                name: 'debugmode',
                title: 'Debug-Information',
                type: 'checkbox',
            },
        ],
    },
    (_, { clientUids, debugmode }) => {
        const engine = require('engine');
        const backend = require('backend');
        const event = require('event');
        const media = require('media');
        const audio = require('audio');
        // @ts-ignore
        const command = require('command');

        if (!clientUids) {
            engine.log('No client-UIDs set.');
            return;
        }
        let follow = false;
        let currentTrack;
        let currentTrackPos = 0;

        const uids = clientUids.trim().split(',');
        event.on('clientMove', ({ client, toChannel }) => {
            if (debugmode) engine.log(`${client.name()} joined '${toChannel.name()}'`);
            const client_id = String(client.uid()).split('/')[1];
            if (uids.includes(client_id) && follow) {
                if (audio.isPlaying) {
                    currentTrackPos = audio.getTrackPosition();
                    currentTrack = media.getCurrentTrack();
                    media.stop();
                    backend.getBotClient().moveTo('');
                    currentTrack.play();
                    audio.seek(currentTrackPos);
                    backend.getBotClient().moveTo(toChannel);
                } else {
                    backend.getBotClient().moveTo(toChannel);
                }
            }
        });

        event.on('load', () => {
            command
                .createCommand('follow')
                .help('Lets the bot follow you through channels.')
                .manual("Everywhere you'll join, the bot follow you.")
                .exec((client, args, reply, ev) => {
                    if (uids.includes(String(client.uid()).split('/')[1])) {
                        follow = !follow;
                        if (follow) reply("I'm now following you.");
                        else reply("I'm no longer following you.");
                        if (debugmode) engine.log(`${client.name()} changed follow mode: ${follow}`)
                    }
                });
        });
    },
);
