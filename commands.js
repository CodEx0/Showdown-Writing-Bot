/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */
var http = require('http');
var sys = require('sys');

exports.commands = {
    /**
     * Help commands
     *
     * These commands are here to provide information about the bot.
     */

    about: function(arg, by, room, con) {
        if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        text += 'Writing Bot: fork of Roleplaying Bot by Morfent, with custom Writing Room commands AxeBane and SolarisFox. Github Repository: http://github.com/AxeBane/Axe-s-Writing-Bot';
        this.say(con, room, text);
    },
    help: 'guide',
    guide: function(arg, by, room, con) {
        if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        if (config.botguide) {
            text += 'A guide on how to use this bot can be found here: ' + config.botguide;
        } else {
            text += 'There is no guide for this bot. PM the bot\'s owner with any questions.';
        }
        this.say(con, room, text);
    },

    /**
     * Dev commands
     *
     * These commands are here for highly ranked users (or the creator) to use
     * to perform arbitrary actions that can't be done through any other commands
     * or to help with upkeep of the bot.
     */

    reload: function(arg, by, room, con) {
        if (toId(by) !== 'axebane') return false;
        try {
            this.uncacheTree('./commands.js');
            Commands = require('./commands.js').commands;
            this.say(con, room, 'Reloaded. .w.');
            console.log(by, 'reloaded the bot.');
        } catch (e) {
            error('failed to reload: ' + sys.inspect(e));
        }
    },
    do : function(arg, by, room, con) {
        if (!this.hasRank(by, '#')) return false;
        if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
            var tarRoom = arg.slice(1, arg.indexOf(']'));
            arg = arg.substr(arg.indexOf(']') + 1).trim();
        }
        this.say(con, tarRoom || room, arg);
    },
    js: function(arg, by, room, con) {
        if (config.excepts.indexOf(toId(by)) === -1) return false;
        try {
            var result = eval(arg.trim());
            this.say(con, room, JSON.stringify(result));
        } catch (e) {
            this.say(con, room, e.name + ": " + e.message);
        }
    },

    /**
     * Room Owner commands
     *
     * These commands allow room owners to personalise settings for moderation and command use.
     */

    settings: 'set',
    set: function(arg, by, room, con) {
        if (!this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;

        var settable = {
            joke: 1,
            autoban: 1,
            regexautoban: 1,
            banword: 1,
            randpokemon: 1
        };
        var modOpts = {
            flooding: 1,
            caps: 1,
            stretching: 1,
            bannedwords: 1,
            snen: 1
        };

        var opts = arg.split(',');
        var cmd = toId(opts[0]);
        if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
            if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Incorrect command: correct syntax is .set mod, [' +
                Object.keys(modOpts).join('/') + '](, [on/off])');

            if (!this.settings['modding']) this.settings['modding'] = {};
            if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
            if (opts[2] && toId(opts[2])) {
                if (!this.hasRank(by, '#~')) return false;
                if (!(toId(opts[2]) in {
                    on: 1,
                    off: 1
                })) return this.say(con, room, 'Incorrect command: correct syntax is ;set mod, [' +
                    Object.keys(modOpts).join('/') + '](, [on/off])');
                if (toId(opts[2]) === 'off') {
                    this.settings['modding'][room][toId(opts[1])] = 0;
                } else {
                    delete this.settings['modding'][room][toId(opts[1])];
                }
                this.writeSettings();
                this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
                return;
            } else {
                this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
                    (this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
                return;
            }
        } else {
            if (!Commands[cmd]) return this.say(con, room, '.' + opts[0] + ' is not a valid command.');
            var failsafe = 0;
            while (!(cmd in settable)) {
                if (typeof Commands[cmd] === 'string') {
                    cmd = Commands[cmd];
                } else if (typeof Commands[cmd] === 'function') {
                    if (cmd in settable) {
                        break;
                    } else {
                        this.say(con, room, 'The settings for ;' + opts[0] + ' cannot be changed.');
                        return;
                    }
                } else {
                    this.say(con, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
                    return;
                }
                failsafe++;
                if (failsafe > 5) {
                    this.say(con, room, 'The command ";' + opts[0] + '" could not be found.');
                    return;
                }
            }

            var settingsLevels = {
                off: false,
                disable: false,
                '+': '+',
                '%': '%',
                '@': '@',
                '&': '&',
                '#': '#',
                '~': '~',
                on: true,
                enable: true
            };
            if (!opts[1] || !opts[1].trim()) {
                var msg = '';
                if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
                    msg = '.' + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' and above.';
                } else if (this.settings[cmd][room] in settingsLevels) {
                    msg = '.' + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
                } else if (this.settings[cmd][room] === true) {
                    msg = '.' + cmd + ' is available for all users in this room.';
                } else if (this.settings[cmd][room] === false) {
                    msg = '.' + cmd + ' is not available for use in this room.';
                }
                this.say(con, room, msg);
                return;
            } else {
                if (!this.hasRank(by, '#~')) return false;
                var newRank = opts[1].trim();
                if (!(newRank in settingsLevels)) return this.say(con, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
                if (!this.settings[cmd]) this.settings[cmd] = {};
                this.settings[cmd][room] = settingsLevels[newRank];
                this.writeSettings();
                this.say(con, room, 'The command .' + cmd + ' is now ' +
                    (settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
                        (this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
            }
        }
    },
    blacklist: 'autoban',
    ban: 'autoban',
    ab: 'autoban',
    autoban: function(arg, by, room, con) {
        if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

        arg = arg.split(',');
        var added = [];
        var illegalNick = [];
        var alreadyAdded = [];
        if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'You must specify at least one user to blacklist.');
        for (var i = 0; i < arg.length; i++) {
            var tarUser = toId(arg[i]);
            if (tarUser.length < 1 || tarUser.length > 18) {
                illegalNick.push(tarUser);
                continue;
            }
            if (!this.blacklistUser(tarUser, room)) {
                alreadyAdded.push(tarUser);
                continue;
            }
            this.say(con, room, '/roomban ' + tarUser + ', Blacklisted user');
            this.say(con, room, '/modnote ' + tarUser + ' was added to the blacklist by ' + by + '.');
            added.push(tarUser);
        }

        var text = '';
        if (added.length) {
            text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
            this.writeSettings();
        }
        if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
        if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
        this.say(con, room, text);
    },
    unblacklist: 'unautoban',
    unban: 'unautoban',
    unab: 'unautoban',
    unautoban: function(arg, by, room, con) {
        if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

        arg = arg.split(',');
        var removed = [];
        var notRemoved = [];
        if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'You must specify at least one user to unblacklist.');
        for (var i = 0; i < arg.length; i++) {
            var tarUser = toId(arg[i]);
            if (tarUser.length < 1 || tarUser.length > 18) {
                notRemoved.push(tarUser);
                continue;
            }
            if (!this.unblacklistUser(tarUser, room)) {
                notRemoved.push(tarUser);
                continue;
            }
            this.say(con, room, '/roomunban ' + tarUser);
            removed.push(tarUser);
        }

        var text = '';
        if (removed.length) {
            text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
            this.writeSettings();
        }
        if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
        this.say(con, room, text);
    },
    rab: 'regexautoban',
    regexab: 'regexautoban',
    regexautoban: function(arg, by, room, con) {
        if (!this.canUse('regexautoban', room, by) || room.charAt(0) === ',') return false;
        if (!arg) return this.say(con, room, 'No pattern was specified.');
        if (!/[^\\\{,]\w/.test(arg)) return false;
        arg = '/' + arg + '/gi';
        if (!this.blacklistUser(arg, room)) return this.say(con, room, 'Pattern ' + arg + ' is already present in the blacklist.');

        this.say(con, room, 'Pattern ' + arg + ' added to the blacklist successfully.');
        this.writeSettings();
    },
    unrab: 'unregexautoban',
    unregexab: 'unregexautoban',
    unregexautoban: function(arg, by, room, con) {
        if (!this.canUse('regexautoban', room, by) || room.charAt(0) === ',') return false;
        if (!arg) return this.say(con, room, 'No pattern was specified.');
        arg = '/' + arg + '/gi';
        if (!this.unblacklistUser(arg, room)) return this.say(con, room, 'Pattern ' + arg + ' isn\'t present in the blacklist.');

        this.say(con, room, 'Pattern ' + arg + ' removed from the blacklist successfully.');
        this.writeSettings();
    },
    viewbans: 'viewblacklist',
    vab: 'viewblacklist',
    viewautobans: 'viewblacklist',
    viewblacklist: function(arg, by, room, con) {
        if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

        var text = '';
        if (!this.settings.blacklist || !this.settings.blacklist[room]) {
            text = 'No users are blacklisted in this room.';
        } else {
            if (arg.length) {
                var nick = toId(arg);
                if (nick.length < 1 || nick.length > 18) {
                    text = 'Invalid nickname: "' + nick + '".';
                } else {
                    text = 'User "' + nick + '" is currently ' + (nick in this.settings.blacklist[room] ? '' : 'not ') + 'blacklisted in ' + room + '.';
                }
            } else {
                var nickList = Object.keys(this.settings.blacklist[room]);
                if (!nickList.length) return this.say(con, room, '/pm ' + by + ', No users are blacklisted in this room.');
                this.uploadToHastebin(con, room, by, 'The following users are banned in ' + room + ':\n\n' + nickList.join('\n'))
                return;
            }
        }
        this.say(con, room, '/pm ' + by + ', ' + text);
    },
    banphrase: 'banword',
    banword: function(arg, by, room, con) {
        if (!this.canUse('banword', room, by)) return false;
        if (!this.settings.bannedphrases) this.settings.bannedphrases = {};
        arg = arg.trim().toLowerCase();
        if (!arg) return false;
        var tarRoom = room;

        if (room.charAt(0) === ',') {
            if (!this.hasRank(by, '~')) return false;
            tarRoom = 'global';
        }

        if (!this.settings.bannedphrases[tarRoom]) this.settings.bannedphrases[tarRoom] = {};
        if (arg in this.settings.bannedphrases[tarRoom]) return this.say(con, room, "Phrase \"" + arg + "\" is already banned.");
        this.settings.bannedphrases[tarRoom][arg] = 1;
        this.writeSettings();
        this.say(con, room, "Phrase \"" + arg + "\" is now banned.");
    },
    unbanphrase: 'unbanword',
    unbanword: function(arg, by, room, con) {
        if (!this.canUse('banword', room, by)) return false;
        arg = arg.trim().toLowerCase();
        if (!arg) return false;
        var tarRoom = room;

        if (room.charAt(0) === ',') {
            if (!this.hasRank(by, '~')) return false;
            tarRoom = 'global';
        }

        if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom] || !(arg in this.settings.bannedphrases[tarRoom]))
            return this.say(con, room, "Phrase \"" + arg + "\" is not currently banned.");
        delete this.settings.bannedphrases[tarRoom][arg];
        if (!Object.size(this.settings.bannedphrases[tarRoom])) delete this.settings.bannedphrases[tarRoom];
        if (!Object.size(this.settings.bannedphrases)) delete this.settings.bannedphrases;
        this.writeSettings();
        this.say(con, room, "Phrase \"" + arg + "\" is no longer banned.");
    },
    viewbannedphrases: 'viewbannedwords',
    vbw: 'viewbannedwords',
    viewbannedwords: function(arg, by, room, con) {
        if (!this.canUse('banword', room, by)) return false;
        arg = arg.trim().toLowerCase();
        var tarRoom = room;

        if (room.charAt(0) === ',') {
            if (!this.hasRank(by, '~')) return false;
            tarRoom = 'global';
        }

        var text = "";
        if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom]) {
            text = "No phrases are banned in this room.";
        } else {
            if (arg.length) {
                text = "The phrase \"" + arg + "\" is currently " + (arg in this.settings.bannedphrases[tarRoom] ? "" : "not ") + "banned " +
                    (room.charAt(0) === ',' ? "globally" : "in " + room) + ".";
            } else {
                var banList = Object.keys(this.settings.bannedphrases[tarRoom]);
                if (!banList.length) return this.say(con, room, "No phrases are banned in this room.");
                this.uploadToHastebin(con, room, by, "The following phrases are banned " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ":\n\n" + banList.join('\n'))
                return;
            }
        }
        this.say(con, room, text);
    },

    /**
     * General commands
     *
     * Add custom commands here.
     */

    seen: function(arg, by, room, con) { // this command is still a bit buggy
        var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
        arg = toId(arg);
        if (!arg || arg.length > 18) return this.say(con, room, text + 'Invalid username.');
        if (arg === toId(by)) {
            text += 'Have you looked in the mirror lately?';
        } else if (arg === toId(config.nick)) {
            text += 'You might be either blind or illiterate. Might want to get that checked out.';
        } else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
            text += 'The user ' + arg + ' has never been seen.';
        } else {
            text += arg + ' was last seen ' + this.getTimeAgo(this.chatData[arg].seenAt) + ' ago' + (
                this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
        }
        this.say(con, room, text);
    },
    rt: 'randtype',
    gentype: 'randtype',
    randomtype: 'randtype',
    randtype: function(arg, by, room, con) {
        if (!this.hasRank(by, '+%@#~')) return false;
        var text = '';
        var type = [];
        for (i = 0; i < 2; i++) {
            type[i] = Math.floor(17 * Math.random()) + 1;
            switch (type[i]) {
                case 1:
                    type[i] = "Normal";
                    break;
                case 2:
                    type[i] = "Fire";
                    break;
                case 3:
                    type[i] = "Water";
                    break;
                case 4:
                    type[i] = "Electric";
                    break;
                case 5:
                    type[i] = "Grass";
                    break;
                case 6:
                    type[i] = "Ice";
                    break;
                case 7:
                    type[i] = "Fighting";
                    break;
                case 8:
                    type[i] = "Poison";
                    break;
                case 9:
                    type[i] = "Flying";
                    break;
                case 10:
                    type[i] = "Ground";
                    break;
                case 11:
                    type[i] = "Psychic";
                    break;
                case 12:
                    type[i] = "Bug";
                    break;
                case 13:
                    type[i] = "Rock";
                    break;
                case 14:
                    type[i] = "Ghost";
                    break;
                case 15:
                    type[i] = "Dragon";
                    break;
                case 16:
                    type[i] = "Dark";
                    break;
                case 17:
                    type[i] = "Steel";
                    break;
                case 18:
                    type[i] = "Fairy";
                    break;
            }
        }
        if (type[1] !== type[0]) {
            text += "Randomly generated type: " + type[0] + "/" + type[1] + ".";
        } else {
            text += "Randomly generated type: " + type[0] + ".";
        }
        this.say(con, room, text);
    },

    // Roleplaying commands
    setpoll: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by) || !(room in this.RP)) return false;
        if (!arg) return this.say(con, room, 'Please enter a strawpoll link.');

        this.RP[room].poll = arg;
        this.say(con, room, 'The poll was set to ' + arg + '.');
    },
    setwotd: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by) || !(room in this.RP)) return false;
        if (!arg) return this.say(con, room, 'Please enter a Writer of the Day.');

        this.RP[room].wotd = arg;
        this.say(con, room, 'Today\'s Writer of the Day was set to ' + arg + '.');
    },
    wotd: function(arg, by, room, con) {
        if (!(room in this.RP) || room.charAt(0) === ',') return false;
        if (!this.RP[room].wotdCalled) {
            var text = '/pm ' + by + ', ';
        } else {
            var text = '';
            var self = this;
            this.RP[room].wotdCalled = true;
            setTimeout(function() {
                delete self.RP[room].wotdCalled;
            }, 60 * 1000);
        }
        if (!this.RP[room].wotd) return this.say(con, room, text + 'A Writer of the Day hasn\'t been set! :o');
        this.say(con, room, text + 'Today\'s Writer of the Day is [[' + this.RP[room].wotd + ']].');
    },
    wotdremove: 'clearwotd',
    wotdclear: 'clearwotd',
    removewotd: 'clearwotd',
    clearwotd: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by) || !(room in this.RP)) return false;
        if (!this.RP[room].wotd) return this.say(con, room, 'There isn\'t a Writer of the Day to remove. :/');
        this.say(con, room, 'The Writer of the Day has been cleared.');
        delete this.RP[room].wotd;
    },
    setdoc: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by) || !(room in this.RP)) return false;
        if (!arg) return this.say(con, room, 'Please enter a document link.');

        this.RP[room].doc = arg;
        this.say(con, room, 'The document was set to ' + arg + '.');
    },
    doc: function(arg, by, room, con) {
        if (!(room in this.RP) || room.charAt(0) === ',') return false;
        if (this.RP[room].docCalled) {
            var text = '/pm ' + by + ', ';
        } else {
            var text = '';
            var self = this;
            this.RP[room].docCalled = true;
            setTimeout(function() {
                delete self.RP[room].docCalled;
            }, 60 * 1000);
        }
        if (!this.RP[room].doc) return this.say(con, room, text + 'There is no document set.');
        this.say(con, room, text + 'The current document for the RP is available at ' + this.RP[room].doc + '.');
    },
    rmdoc: function(arg, by, room, con) {
        if (!this.canuse('setrp', room, by) || !(room in this.RP)) return false;
        if (!this.RP[room].doc) return this.say(con, room, 'There isn\'t a document to remove. :/');
        this.say(con, room, 'The document has been removed.');
        delete this.RP[room].doc;
    },
    poll: function(arg, by, room, con) {
        if (!(room in this.RP) || room.charAt(0) === ',') return false;
        if (this.RP[room].pollCalled) {
            var text = '/pm ' + by + ', ';
        } else {
            var text = '';
            var self = this;
            this.RP[room].pollCalled = true;
            setTimeout(function() {
                delete self.RP[room].pollCalled;
            }, 60 * 1000);
        }
        if (!this.RP[room].poll) return this.say(con, room, text + 'There is no poll.');
        this.say(con, room, text + 'The current poll is available at ' + this.RP[room].poll + '.');
    },
    endpoll: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by)) return false;
        if (!this.RP[room].poll) return this.say(con, room, 'There isn\'t a poll to remove.');
        this.say(con, room, '**The poll has ended!** Results at ' + this.RP[room].poll + '/r');
        delete this.RP[room].poll;
    },
    rmpoll: function(arg, by, room, con) {
        if (!this.canUse('setrp', room, by) || !(room in this.RP)) return false;
        if (!this.RP[room].poll) return this.say(con, room, 'There isn\'t a poll to remove.');
        this.say(con, room, 'The poll has been cleared.');
        delete this.RP[room].poll;
    },
    site: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Writing Room\'s Website: http://pswriting.weebly.com/');
    },
    newbie: function(arg, by, room, con) {
        if (config.serverid !== 'showdown' || room !== 'writing' || !this.hasRank(by, '@#~')) return false;
        this.say(con, room, 'Welcome to the Writing room! In case you missed the big shiny box, please make sure to visit the room website and read the rules listed there: http://pswriting.weebly.com/rules.html');
        this.say(con, room, 'Also, feel free to ask the staff any questions you may have. I\'m sure they\'d love to answer them!');
    },
    esupport: function(arg, by, room, con) {
        if ((this.hasRank(by, '%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'I love you, ' + by + '.');
    },
    drive: function(arg, by, room, con) {
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Community Drive: http://goo.my/writingarchive');
    },
    contests: 'events',
    contest: 'events',
    events: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return true;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/w ' + by + ', ';
        }
        this.say(con, room, 'The current Contests and Events for the Writing Room can be found here: http://pswriting.weebly.com/contests--events.html');
    },
	randstats: 'randomstats',
	rs: 'randomstats',
	randomstats: function(arg, by, room, con, shuffle) {
		if (this.canUse('randomstats', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var text = '';
		var stat = [0,0,0,0,0,0];
		var currentST = 0;
		var leveler = 2 * (Math.floor(Math.random() + 1));
		if (!arg) {
				var bst = Math.floor(580 * Math.random()) + 200;
		} else {
			var bst = Math.floor(arg);
		arg = parseInt(arg);
			if (isNaN(arg) || arg < 30 || arg > 780) return this.say(con, room, "Specified BST must be a whole number between 30 and 780.");
		}
		
		for (j=0; j<leveler; j++) {
			for (i=0; i<6; i++) {
				var randomPart = Math.floor((bst / ( leveler * 6 )) * Math.random()) + 1;
				stat[i] += randomPart;
				currentST += randomPart;
			}
		}
		if (currentST > bst) {
			for (k=currentST; k>bst; k--) {
				stat[Math.floor(5 * Math.random()) + 1] -= 1;
			}
		} else if (currentST < bst) {
			for (k=currentST; k<bst; k++) {
				stat[Math.floor(5 * Math.random()) + 1] += 1;
			}
		}
		
		ranStats = this.shuffle(stat);
		text += 'Random stats: HP:' + ranStats[0] + ' Atk:' + ranStats[1] + ' Def:' + ranStats[2] + ' SpA:' + ranStats[3] +
				' SpD:' + ranStats[4] + ' Spe:' + ranStats[5] + ' BST:' + bst + '';
		this.say(con, room, text);
	},
	rollpokemon: 'randpokemon',
	randpoke: 'randpokemon',
	randompoke: 'randpokemon',
	randompokemon: 'randpokemon',
	randpokemon: function(arg, by, room, con) {
		if (this.canUse('randomstats', room, by) || room.charAt(0) === ',') {
			var text = '';
                        var rpreminder = '';
		} else {
			var text = '/pm ' + by + ', ';
                        var rpreminder = 'Don\'t forget that you could also use this command in PM. In fact, I\'d prefer that! ^.^\'';
		}
		var randompokes = [];
		var pokequantity = '';
		var pokeNum = '';
		var Uber = '';
		var legend = '';
		var NFE = '';
		var noUber = '';
		var noNFE = '';
		var noLegend = '';
		if (!arg) {
			pokequantity = 1;
		} else {
			var parameters = arg.toLowerCase().split(", ");
			pokequantity = parameters[0];
			if (isNaN(pokequantity) || pokequantity < 1 || pokequantity > 6) return this.say(con, room, "Quantity of random pokemon must be between 1 and 6.");
			if (parameters.length > 1) {
				if (parameters.indexOf('uber') > -1 && parameters.indexOf('!uber') > -1) return this.say(con, room, 'roll cannot contain both \'uber\' and \'!uber\'.');
				if (parameters.indexOf('nfe') > -1 && parameters.indexOf('!nfe') > -1) return this.say(con, room, 'roll cannot contain both \'nfe\' and \'!nfe\'.');
				if (parameters.indexOf('legendary') > -1 && parameters.indexOf('!legendary') > -1) return this.say(con, room, 'roll cannot contain both \'legend\' and \'!legend\'.');
				if (parameters.indexOf('uber') > -1 && parameters.indexOf('!legendary') > -1 && pokequantity > 3) return this.say(con, room, 'Invalid generation conditions.');
				for (j=1; j<parameters.length; j++) {
					switch (parameters[j]) {
						case 'uber': Uber = 1; continue;
						case 'legendary': legend = 1; continue;
						case 'nfe': NFE = 1; continue;
						case '!uber': noUber = 1; continue;
						case '!legendary': noLegend = 1; continue;
						case '!nfe': noNFE = 1; continue;
						default: return this.say(con, room, 'Parameter \'' + parameters[j] + '\' not recognized.');
					}
				}
			}
		}
		if (pokequantity === 1 && room.charAt(0) !== ',' && this.hasRank(by, '+%@#~')) text = '!dex ';
		for (i=0; i<pokequantity; i++) {
			pokeNum = Math.floor(723 * Math.random());
			if (Uber && !Pokedex[pokeNum].uber) {i--; continue;}
			if (legend && !Pokedex[pokeNum].legend) {i--; continue;}
			if (NFE && !Pokedex[pokeNum].nfe) {i--; continue;}
			if (noUber && Pokedex[pokeNum].uber) {i--; continue;}
			if (noLegend && Pokedex[pokeNum].legend) {i--; continue;}
			if (noNFE && Pokedex[pokeNum].nfe) {i--; continue;}
			if (randompokes.indexOf(Pokedex[pokeNum].species) > -1) {i--; continue;}
			randompokes.push(Pokedex[pokeNum].species);
		}
		this.say(con, room, text + randompokes.join(", ") + '. ' + rpreminder);
                if (this.hasRank(by, '+')) { var sender = by.yellow; var roomRank = 'Voiced user ' }
                if (this.hasRank(by, '%')) { var sender = by.cyan; var roomRank = 'Driver ' }
                if (this.hasRank(by, '@')) { var sender = by.blue; var roomRank = 'Moderator ' }
                if (this.hasRank(by, '#')) { var sender = by.red; var roomRank = 'Room Owner or Higher ' }
                if (this.hasRank(by, '~')) { var sender = by.green; var roomRank = 'Admin or Bot Owner ' }
                else { var sender = by; var roomRank = 'Regular User '};
                console.log(roomRank + sender + '  used the Random Pokemon command and got ' + randompokes + '.');
                var sender = ''
                var roomRank = ''
	},
    plug: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Come join our Plug.dj~! http://plug.dj/ps-writing-room/');
    },
    faq: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Check out our Frequently Asked Questions page: http://goo.my/pswritingfaq');
    },
    piarticles: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + "Th!nkPi's Articles: http://goo.my/articlesthinkpi");
    },
    poems: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Writing Room Poems: http://goo.my/writingpoems');
    },
    stories: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Writing Room Stories: http://goo.my/writingstories');
    },
    rules: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Please read our Rules page: http://pswriting.weebly.com/rules.html ^.^');
    },
    voice: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if ((this.hasRank(by, '+%@#~') && config.rprooms.indexOf(room) !== -1) || room.charAt(0) === ',') {
            var text = '';
        } else {
            var text = '/pm ' + by + ', ';
        }
        this.say(con, room, text + 'Interested in becoming a voice? Check out the guideines for your chance at having a shot! http://goo.my/writingvoice or http://goo.my/writingvoicerap');
    },
    goodnight: function(arg, by, room, con) {
        if (config.serverid !== 'showdown') return false;
        if (!this.hasRank(by, '#~')) return false;
        this.say(con, room, 'Goodnight, ' + by)
        this.say(con, room, '/leave');
    },
}