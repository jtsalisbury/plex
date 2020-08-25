let mongoose = require('mongoose');
let VoiceManager = require('@models/VoiceManager');

class GuildManager {
    constructor() {
        this.guildCache = new Map();
        this.voiceCache = new Map();
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_STRING, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
                
            mongoose.connection.on('error', async () => {
                mongoose.connection.disconnect();
                await this.connect();
            });

            this.guildSchema = new mongoose.Schema({
                guildId: mongoose.Schema.Types.String,
                restrictions: [{
                    channelId: mongoose.Schema.Types.String,
                    type: mongoose.Schema.Types.String,
                    canPost: mongoose.Schema.Types.Boolean
                }],
                reactions: [{
                    messageContains: mongoose.Schema.Types.String,
                    reactWith: mongoose.Schema.Types.String
                }],
                autoActions: [{
                    userAction: mongoose.Schema.Types.String,
                    performAction: mongoose.Schema.Types.String
                }],
                events: [{
                    title: mongoose.Schema.Types.String,
                    description: mongoose.Schema.Types.String,
                    channelId: mongoose.Schema.Types.String,
                    messageChannelId: mongoose.Schema.Types.String,
                    messageId: mongoose.Schema.Types.String,
                    date: mongoose.Schema.Types.Date,
                    creatorId: mongoose.Schema.Types.String,
                    eventPassed: mongoose.Schema.Types.Boolean
                }],
                statistics: mongoose.Schema.Types.Mixed,
                externalMessageChannelId: mongoose.Schema.Types.String,
                integrations: [{
                    channelId: mongoose.Schema.Types.String,
                    signature: mongoose.Schema.Types.String,
                    integrationName: mongoose.Schema.Types.String,
                    syncMessages: mongoose.Schema.Types.Boolean,
                    integrationId: mongoose.Schema.Types.Number
                }],
                allowSpeechRecognition: []
            });

            this.Guild = mongoose.model('Guild', this.guildSchema);
        } catch (err) {
            console.error('Connection error: ' + err);
        }
    }

    addGuild(guildId, newGuild = false) {
        return new Promise((resolve, reject) => {
            if (newGuild) {
                let newGuild = new this.Guild({
                    guildId: guildId,
                    restrictions: [],
                    reactions: [],
                    autoActions: [],
                    statistics: {},
                    events: [],
                    integrations: []
                });

                this.voiceCache.set(guildId, new VoiceManager());

                newGuild.save();
                resolve(newGuild);
                this.guildCache.set(guildId, newGuild);
            } else {
                this.Guild.findOne({ guildId: guildId }, (err, res) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    this.voiceCache.set(guildId, new VoiceManager());

                    this.guildCache.set(guildId, res);
                    resolve(res);
                });
            }
        })
    }

    removeGuild(guildId) {
        this.guildCache.set(guildId, null);
        this.Guild.deleteOne({ guildId: guildId }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    getGuild(guildId) {
        return this.guildCache.get(guildId);
    }

    getVoiceManager(guildId) {
        return this.voiceCache.get(guildId);
    }
}

module.exports = new GuildManager();