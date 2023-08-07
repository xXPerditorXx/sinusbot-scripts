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
        ],
    },
    (_, { clientUids }) => {
        const engine = require('engine');
        const backend = require('backend');
        const event = require('event');
        const media = require('media');
        const audio = require('audio');

        if (!clientUids) {
            engine.log('No client-UIDs set.');
            return;
        }
        let currentTrack;
        let currentTrackPos = 0;

        const uids = clientUids.trim().split(',');
        event.on('clientMove', ({ client, toChannel }) => {
            const client_id = String(client.uid()).split('/')[1];
            if (uids.includes(client_id)) {
                currentTrackPos = audio.getTrackPosition();
                currentTrack = media.getCurrentTrack();
                media.stop();
                backend.getBotClient().moveTo('');
                currentTrack.play();
                audio.seek(currentTrackPos);
                backend.getBotClient().moveTo(toChannel);
            }
        });
    },
);
