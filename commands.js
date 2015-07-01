/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */
const MESSAGES_TIME_OUT = 7 * 24 * 60 * 60 * 1000;

var http = require('http');
var sys = require('sys');

// Lists for random generator commands
var adjectives = ["crystal","floating","eternal-dusk","sunset","snowy","rainy","sunny","chaotic","peaceful","colorful","gooey","fiery","jagged","glass","vibrant","rainbow","foggy","calm","demonic","polygonal","glistening","sexy","overgrown","frozen","dark","mechanical","mystic","steampunk","subterranean","polluted","bleak","dank","smooth","vast","pixelated","enigmatic","illusionary","sketchy","spooky","flying","legendary","cubic","moist","oriental","fluffy","odd","fancy","strange","authentic", "bustling","barren","cluttered","creepy","dangerous","distant","massive","exotic","tainted","filthy","flawless","forsaken","frigid","frosty","grand","grandiose","grotesque","harmful","harsh","hospitable","hot","jaded","meek","weird","awkward","silly","cursed","blessed","drought-stricken","futuristic","ancient","medieval", "gothic", "radioactive"
];
var locations = ["river","island","desert","forest","jungle","plains","mountains","mesa","cave","canyon","marsh","lake","plateau","tundra","volcano","valley","waterfall","atoll","asteroid","grove","treetops","cavern","beach","ocean","heavens","abyss","city","crag","planetoid","harbor","evergreen","cabin","hill","field","ship","glacier","estuary","wasteland","clouds","chamber","ruin","tomb","park","closet","terrace","hotairballoon","shrine","room","swamp","road","path","gateway","school","building","vault","pool","pit","temple","lagoon","prison","harem","mine","catacombs","rainforest","laboratory","library","stadium","museum","mansion","carnival","amusementpark","farm","factory","castle","spaceship","space station","cafe","theater","island","hospital","ruins","bazaar"
];
var characterAdjectives = ["sturdy","helpless","young","rugged","odd-looking","amusing","dynamic","exuberant","quirky","awkward","elderly","adolescent","'ancient'","odd","funny-looking","tall","short","round","blind" 
];
var characterTypes = ["Marksman","Adventurer","Pokemon Trainer","Pokemon","Dragonkin","Chef","Businessman","Kitsune","Youkai","...thing","Archer","Taxi Driver","Dentist","Demon","Paladin","Writer","Diety","Spy","Goverment Agent","Farmer","Teacher","Warrior","Athlete","Artist","Assassin","Beast","Journalist","Designer","Doctor","Vampire","Time Traveller","Alien","Butler","PoliceOfficer","Toymaker","Student","Photographer","Mage","Computer Programmer","Person"
];
var perks = ["kind of heart","powerful","handsome","ambitious","amiable","brave","rational","witty","honest","agile","athletic","quick on their feet","assertive","fearless","intelligent","persistent","philosophical","pioneering","quiet","wealthy","not afraid to voice their opinion","quick-witted","lucky","friendly","neat","sympathetic","sincere","mysterious","loyal","trustworthy","imaginative","gentle"
];
var debuffs = ["sly","unclean","smelly","obnoxiously loud","fond of 'tricks'","fond of 'games'","fond of 'jokes'","prone to 'accidentally' taking others' things","cocky","prone to falling over","prone to bad luck at times","clingy","foolish","fussy","greedy","gullible","impatient","inconsiderate","lazy","moody","obsessive","narrow-minded","patronizing","resentful","unreliable","vague","weak-willed","egotistical","sensitive","Grammar Nazi-ish","'bitchy'","emotionally scarred","overly-serious","volatile","morally scrupulous","lacking of empathy","prone to overreacting","overbearing","prone to panic attacks","self-pessimistic"
];
var genres = ["Action","Adventure","Comedy","Crime","Drama","Fantasy","Historical","Horror","Mystery","Philosophical","Romance","Saga","Satire","Science Fiction","Thriller"
];
var roles = ["Protagonist","Antagonist","Major character","Minor character"];
var pronouns = {'male': 'he', 'female': 'she', 'hermaphrodite': 'shi', 'neuter': 'they'};
var possessivePronouns = {'male': 'His', 'female': 'Her', 'hermaphrodite': 'Hir', 'neuter': 'Their'};
var types = ["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Flying","Ground","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy","Bird"];

exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */
	about: function (arg, by, room) {
		var text = this.hasRank(by, '#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "**Writing Bot** by AxeBane & sirDonovan __(forked from Pokémon Showdown Bot by: Quinella, TalkTakesTime, and Morfent)__");
	},
	help: 'guide',
	guide: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		if (Config.botguide) {
			text += 'A guide on how to use this bot can be found here: ' + Config.botguide;
		} else {
			text += 'There is no guide for this bot. PM the bot\'s owner with any questions.';
		}
		this.say(room, text);
	},

	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */

	reload: function (arg, by, room) {
		if (Config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			this.uncacheTree('./commands.js');
			global.Commands = require('./commands.js').commands;
			this.say(room, 'Reloaded. .w.');
			console.log(by + ' reloaded the bot.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	do: function (arg, by, room) {
		if (!this.hasRank(by, '#')) return false;
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(tarRoom || room, arg);
	},
	js: function (arg, by, room) {
		if (Config.excepts.indexOf(toId(by)) === -1 || toId(arg) === "configpass") return false;
		try {
			var result = eval(arg.trim());
			this.say(room, JSON.stringify(result));
		} catch (e) {
			this.say(room, e.name + ": " + e.message);
		}
	},
	uptime: function (arg, by, room) {
		var text = Config.excepts.indexOf(toId(by)) < 0 ? '/pm ' + by + ', **Uptime:** ' : '**Uptime:** ';
		var divisors = [52, 7, 24, 60, 60];
		var units = ['week', 'day', 'hour', 'minute', 'second'];
		var buffer = [];
		var uptime = ~~(process.uptime());
		do {
			var divisor = divisors.pop();
			var unit = uptime % divisor;
			buffer.push(unit > 1 ? unit + ' ' + units.pop() + 's' : unit + ' ' + units.pop());
			uptime = ~~(uptime / divisor);
		} while (uptime);

		switch (buffer.length) {
		case 5:
			text += buffer[4] + ', ';
			/* falls through */
		case 4:
			text += buffer[3] + ', ';
			/* falls through */
		case 3:
			text += buffer[2] + ', ' + buffer[1] + ', and ' + buffer[0];
			break;
		case 2:
			text += buffer[1] + ' and ' + buffer[0];
			break;
		case 1:
			text += buffer[0];
			break;
		}

		this.say(room, text);
	},

	/**
	 * Room Owner commands
	 *
	 * These commands allow room owners to personalise settings for moderation and command use.
	 */

	settings: 'set',
	set: function (arg, by, room) {
		if (!this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;

		var settable = {
			say: 1,
			joke: 1,
			choose: 1,
			usagestats: 1,
			buzz: 1,
			'8ball': 1,
			survivor: 1,
			games: 1,
			wifi: 1,
			monotype: 1,
			autoban: 1,
			happy: 1,
			guia: 1,
			studio: 1,
			'switch': 1,
			banword: 1
		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1
		};
		
		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(room, 'Incorrect command: correct syntax is ' + Config.commandcharacter + 'set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#&~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(room, 'Incorrect command: correct syntax is ' + Config.commandcharacter + 'set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings['modding'][room][toId(opts[1])] = 0;
				} else {
					delete this.settings['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			} else {
				this.say(room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
					(this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(room, Config.commandcharacter + '' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(room, 'The settings for ' + Config.commandcharacter + '' + opts[0] + ' cannot be changed.');
						return;
					}
				} else {
					this.say(room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(room, 'The command "' + Config.commandcharacter + '' + opts[0] + '" could not be found.');
					return;
				}
			}

			var settingsLevels = {
				off: false,
				disable: false,
				'false': false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true,
				'true': true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
					msg = '' + Config.commandcharacter + '' + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : Config.defaultrank) + ' and above.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = '' + Config.commandcharacter + '' + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
				} else if (this.settings[cmd][room] === true) {
					msg = '' + Config.commandcharacter + '' + cmd + ' is available for all users in this room.';
				} else if (this.settings[cmd][room] === false) {
					msg = '' + Config.commandcharacter + '' + cmd + ' is not available for use in this room.';
				}
				this.say(room, msg);
				return;
			} else {
				if (!this.hasRank(by, '#&~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable/false, +, %, @, &, #, ~, on/enable/true.');
				if (!this.settings[cmd]) this.settings[cmd] = {};
				this.settings[cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(room, 'The command ' + Config.commandcharacter + '' + cmd + ' is now ' +
					(settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
					(this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')));
			}
		}
	},
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function (arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, Config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(room, 'You must specify at least one user to blacklist.');
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
			this.say(room, '/roomban ' + tarUser + ', Blacklisted user');
			this.say(room, '/modnote ' + tarUser + ' was added to the blacklist by ' + by + '.');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
		if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
		this.say(room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function (arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, Config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(room, 'You must specify at least one user to unblacklist.');
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
			this.say(room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
		this.say(room, text);
	},
	rab: 'regexautoban',
	regexautoban: function (arg, by, room) {
		if (Config.regexautobanwhitelist.indexOf(toId(by)) < 0 || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, Config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(room, 'You must specify a regular expression to (un)blacklist.');

		try {
			var test = new RegExp(arg, 'i');
		} catch (e) {
			return this.say(room, e.message);
		}

		arg = '/' + arg + '/i';
		if (!this.blacklistUser(arg, room)) return this.say(room, '/' + arg + ' is already present in the blacklist.');

		this.writeSettings();
		this.say(room, '/' + arg + ' was added to the blacklist successfully.');
	},
	unrab: 'unregexautoban',
	unregexautoban: function (arg, by, room) {
		if (Config.regexautobanwhitelist.indexOf(toId(by)) < 0 || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, Config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(room, 'You must specify a regular expression to (un)blacklist.');

		arg = '/' + arg.replace(/\\\\/g, '\\') + '/i';
		if (!this.unblacklistUser(arg, room)) return this.say(room,'/' + arg + ' is not present in the blacklist.');

		this.writeSettings();
		this.say(room, '/' + arg + ' was removed from the blacklist successfully.');
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function (arg, by, room) {
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
				if (!nickList.length) return this.say(room, '/pm ' + by + ', No users are blacklisted in this room.');
				this.uploadToHastebin('The following users are banned in ' + room + ':\n\n' + nickList.join('\n'), function (link) {
					this.say(room, "/pm " + by + ", Blacklist for room " + room + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(room, '/pm ' + by + ', ' + text);
	},
	banphrase: 'banword',
	banword: function (arg, by, room) {
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
		if (arg in this.settings.bannedphrases[tarRoom]) return this.say(room, "Phrase \"" + arg + "\" is already banned.");
		this.settings.bannedphrases[tarRoom][arg] = 1;
		this.writeSettings();
		this.say(room, "Phrase \"" + arg + "\" is now banned.");
	},
	unbanphrase: 'unbanword',
	unbanword: function (arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom] || !(arg in this.settings.bannedphrases[tarRoom])) 
			return this.say(room, "Phrase \"" + arg + "\" is not currently banned.");
		delete this.settings.bannedphrases[tarRoom][arg];
		if (!Object.size(this.settings.bannedphrases[tarRoom])) delete this.settings.bannedphrases[tarRoom];
		if (!Object.size(this.settings.bannedphrases)) delete this.settings.bannedphrases;
		this.writeSettings();
		this.say(room, "Phrase \"" + arg + "\" is no longer banned.");
	},
	viewbannedphrases: 'viewbannedwords',
	vbw: 'viewbannedwords',
	viewbannedwords: function (arg, by, room) {
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
				if (!banList.length) return this.say(room, "No phrases are banned in this room.");
				this.uploadToHastebin("The following phrases are banned " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ":\n\n" + banList.join('\n'), function (link) {
					this.say(room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + "Banned Phrases " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(room, text);
	},

	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */

	seen: function (arg, by, room) { // this command is still a bit buggy
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = toId(arg);
		if (!arg || arg.length > 18) return this.say(room, text + 'Invalid username.');
		if (arg === toId(by)) {
			text += 'Have you looked in the mirror lately?';
		} else if (arg === toId(Config.nick)) {
			text += 'You might be either blind or illiterate. Might want to get that checked out.';
		} else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
			text += 'The user ' + arg + ' has never been seen.';
		} else {
			text += arg + ' was last seen ' + this.getTimeAgo(this.chatData[arg].seenAt) + ' ago' + (
				this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
		}
		this.say(room, text);
	},

	/* 
    This is a template for all Random Commands; please don't use this as an actual command.
	randomcommands: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var variableone = list1[Math.floor(list1.length * Math.random())];
		var variabletwo = list2[Math.floor(list2.length * Math.random())];
		this.say(room, text + "Randomly generated thing: __" + variableone + " " + variabletwo + "__.");
	}, 
    */
    
	//Random Commands Section!
	//Place all 'random thing generator' commands in this area!
	randchar: 'randomcharacter',
	chargen: 'randomcharacter',
	genchar: 'randomcharacter',
	randomcharacter: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var adjective = characterAdjectives[Math.floor(characterAdjectives.length * Math.random())];
		var type = characterTypes[Math.floor(characterTypes.length * Math.random())];
		var role = roles[Math.floor(roles.length * Math.random())];
		var gender = ["male", "female"][Math.floor(2 * Math.random())];
		if (Math.floor(Math.random() * 4200 < 20)) gender = "hermaphrodite";
		if (Math.floor(Math.random() * 4200 < 10) || type === "...thing") gender = "neuter";
		var pronoun = pronouns[gender];
		var possessivePronoun = possessivePronouns[gender];
		var perkList = perks.slice(0);
		var perk1 = perkList[Math.floor(perkList.length * Math.random())];
		perkList.splice(perkList.indexOf(perk1), 1);
		var perk2 = perkList[Math.floor(perkList.length * Math.random())];
		perkList.splice(perkList.indexOf(perk2), 1);
		var perk3 = perkList[Math.floor(perkList.length * Math.random())];
		var debuff = debuffs[Math.floor(debuffs.length * Math.random())];
		this.say(room, text + "Randomly generated character: __A " + gender + ", " + adjective + " " + type + " (" + role + "). " + possessivePronoun + " positive factors include: " + perk1 + ", " + perk2 + ", and " + perk3 + ", though " + pronoun + (gender === "neuter" ? " are" : " is") + " unfortunately rather " + debuff + ".__");
	},
	gentype: 'randomtype',
	randtype: 'randomtype',
	randomtype: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		arg = toId(arg);
		if (arg && arg !== 'single' && arg !== 'dual') this.say(room, text + "Please input either 'single' or 'dual' as arguments, or leave it blank for a random decision. Continuing as if you left it blank.");
		var firstType = types[Math.floor(types.length * Math.random())];
		if (arg !== 'single' && (arg === 'dual' || Math.floor(Math.random() * 2))) {
			var secondType = types[Math.floor(types.length * Math.random())];
			while (firstType === secondType) {
				secondType = types[Math.floor(types.length * Math.random())];
			}
		}
		this.say(room, text + "Randomly generated type: __" + firstType + (secondType ? "/" + secondType : "") + "__.");
	},
	randstats: 'randomstats',
	randomstats: function (arg, by, room, shuffle) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		arg = parseInt(arg);
		if (arg && (isNaN(arg) || arg < 30 || arg > 780)) return this.say(room, text + "Specified BST must be a whole number between 30 and 780.");
		var bst = arg ? Math.floor(arg) : Math.floor(580 * Math.random()) + 200;
		var stats = [0, 0, 0, 0, 0, 0];
		var currentST = 0;
		var leveler = 2 * (Math.floor(Math.random() + 1));
		for (var j = 0; j < leveler; j++) {
			for (var i = 0; i < 6; i++) {
				var randomPart = Math.floor((bst / (leveler * 6)) * Math.random()) + 1;
				stats[i] += randomPart;
				currentST += randomPart;
			}
		}
		if (currentST > bst) {
			for (var k = currentST; k > bst; k--) {
				stats[Math.floor(5 * Math.random()) + 1] -= 1;
			}
		} else if (currentST < bst) {
			for (var k = currentST; k < bst; k++) {
				stats[Math.floor(5 * Math.random()) + 1] += 1;
			}
		}
		stats = this.shuffle(stats);
		this.say(room, text + "Randomly generated stats: HP: " + stats[0] + " Atk: " + stats[1] + " Def: " + stats[2] + " SpA: " + stats[3] + " SpD: " + stats[4] + " Spe: " + stats[5] + " BST: " + bst);
	},
	rollpokemon: 'randpokemon',
	randpoke: 'randpokemon',
	randompoke: 'randpokemon',
	randompokemon: 'randpokemon',
	randpokemon: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var randompokes = [];
		var parameters = [];
		/**	OBJECT KEY
		 *  0 = will reject roll if it has property
		 *  1 = property will not affect roll
		 *  2 = roll will be rejected if it lacks this property
		 */
		var conditions = {"uber":1, "legend":1, "nfe":1, "mega":1, "forms":1, "shiny":1};
		var types = {"normal":1, "fire":1, "water":1, "grass":1, "electric":1, "ice":1, "fighting":1, "poison":1, "ground":1, "flying":1, "psychic":1, "bug":1, "rock":1, "ghost":1, "dragon":1, "dark":1, "steel":1, "fairy":1};
		var singleType = false;
		var noDt = {"Unown":1, "Shellos":1, "Gastrodon":1, "Deerling":1, "Sawsbuck":1, "Vivillon":1, "Flabebe":1, "Floette":1, "Florges":1, "Furfrou":1};

		var pokequantity = 1;
		if (arg) {
			var parameters = arg.toLowerCase().split(", ");
			var hasBeenSet = false;
			for (var j = 0; j < parameters.length; j++) {
				if (parameters[j] === parseInt(parameters[j], 10)) {
					if (hasBeenSet) return this.say(room, text + "Please only specify number of pokemon once");
					if (parameters[j] < 1 || parameters[j] > 6) return this.say(room, text + "Quantity of random pokemon must be between 1 and 6.");
					pokequantity = parameters[j];
					hasBeenSet = true;
					continue;
				}
				var notGate = false;
				if (parameters[j].charAt(0) === '!') {
					notGate = true;
					parameters[j] = parameters[j].substr(1);
				}
				//argument alias list
				switch (parameters[j]) {
					case "legendary": parameters[j] = "legend"; break;
					case "fe": parameters[j] = "nfe"; notGate = !notGate; break;
					case "ubers": parameters[j] = "uber"; break;
				}

				if (parameters[j] in conditions) {
					if (conditions[parameters[j]] !== 1) return this.say(room, text + "Cannot include both '" + parameters[j] + "' and '!" + parameters[j] + "'.");
					if (notGate) {
						if (parameters[j] === 'forms') conditions.mega = 0;
						conditions[parameters[j]] = 0;
					} else {
						conditions[parameters[j]] = 2;
					}
					continue;
				}
				if (parameters[j].indexOf(' type') > -1) parameters[j] = parameters[j].substr(0, parameters[j].length - 5);
				if (parameters[j] in types) {
					if (types[parameters[j]] !== 1) return this.say(room, text + "Cannot include both '" + parameters[j] + "' and '!" + parameters[j] + "'.");
					if (notGate) {
						types[parameters[j]] = 0;
					} else {
						types[parameters[j]] = 2;
						singleType = true;
					}
					continue;
				} else {
					return this.say(room, text + "Parameter '" + parameters[j] + "' not recognized.");
				}
			}

			//More complex checks to prevent it getting stuck searching for combinations that don't exist
			if (conditions.forms === 2 && singleType) return this.say(room, text + "The parameter 'forms' must be used by itself.");
			if ((conditions.uber === 2 && conditions.legend === 0 && pokequantity > 3) || (conditions.mega === 2 && conditions.uber === 2 && pokequantity > 1) ||
				(conditions.nfe === 2 && (conditions.uber === 2 || conditions.legend === 2 || conditions.mega === 2))) return this.say(room, text + "Invalid generation conditions.");

			if (singleType) {
				if (conditions.uber === 2 || conditions.legend === 2 || conditions.mega === 2) return this.say(room, text + "Invalid generation conditions.");
				for (var set in types) {
					if (types[set] === 1) types[set] = 0;
				}
			}
		}
		if (pokequantity === 1 && room.charAt(0) !== ',' && this.hasRank(by, '+%@#&~')) text = '!dt ';

		var attempt = -1;
		var dexNumbers = [];
		if (parameters.length > 0) {
			//create an array for all dex numbers and then shuffle it
			for (var g = 0; g < 722; g++) {
				dexNumbers.push(g);
			}
			dexNumbers = this.shuffle(dexNumbers);
		}
		for (var i = 0; i < pokequantity; i++) {
			attempt++;
			if (attempt > 721) {
				console.log('randpoke fail: ' + parameters);
				return this.say(room, text + "Could not find " + pokequantity + " unique Pokemon with ``" + parameters.join(', ') + "``");
			}
			var skipPoke = false;
			if (parameters.length > 0) {
				var pokeNum = dexNumbers[attempt];
			} else {
				var pokeNum = Math.floor(722 * Math.random());
			}
			if (conditions.uber === 2 && !Pokedex[pokeNum].uber) {i--; continue;}
			if (conditions.legend === 2 && !Pokedex[pokeNum].legend) {i--; continue;}
			if (conditions.nfe === 2 && !Pokedex[pokeNum].nfe) {i--; continue;}
			if (conditions.mega === 2 && !Pokedex[pokeNum].mega) {i--; continue;}
			if (conditions.forms === 2 && !Pokedex[pokeNum].forms) {i--; continue;}
			if (conditions.uber === 0 && Pokedex[pokeNum].uber) {i--; continue;}
			if (conditions.legend === 0 && Pokedex[pokeNum].legend) {i--; continue;}
			if (conditions.nfe === 0 && Pokedex[pokeNum].nfe) {i--; continue;}
			for (var h = 0; h < Pokedex[pokeNum].type.length; h++) {
				var currentType = Pokedex[pokeNum].type[h].toLowerCase();
				if (types[currentType] !== 0) break;
				skipPoke = true;
			}
			if (skipPoke) {i--; continue;}
			if (Pokedex[pokeNum].mega && conditions.mega !== 0) {
				var buffer = Pokedex[pokeNum].species;
				var megaNum = (conditions.mega === 2 ? 0 : -1);
				megaNum += Math.floor((Pokedex[pokeNum].mega.length + (conditions.mega === 2 ? 0 : 1)) * Math.random());
				if (megaNum == -1) {
					randompokes.push(buffer);
				} else {
					randompokes.push(buffer + '-' + Pokedex[pokeNum].mega[megaNum]);
				}
				continue;
			}
			if (Pokedex[pokeNum].forms && conditions.forms !== 0) {
				var formNum = Math.floor(Pokedex[pokeNum].forms.length * Math.random());
				if (Pokedex[pokeNum].forms[formNum] !== "norm") {
					var buffer = Pokedex[pokeNum].species;
					if (text === '!dt ' && noDt[buffer] && Pokedex[pokeNum].forms[formNum] !== "eternal-flower") text = '';
					randompokes.push(buffer + '-__' + Pokedex[pokeNum].forms[formNum] + '__');
					continue;
				}
			}
			randompokes.push(Pokedex[pokeNum].species);
		}
		for (var k = 0; k < randompokes.length; k++) {
			if (Math.floor(((conditions.shiny === 2) ? 2 : 1364) * Math.random()) !== 0) continue;
			randompokes[k] = '``shiny`` ' + randompokes[k];
		}
		this.say(room, (text === "!dt " ? text + randompokes.join(", ") : text + "Randomly generated Pokemon: " + randompokes.join(", ")));
	},
	randscene: 'randomlocation',
	randomscene: 'randomlocation',
	randlocation: 'randomlocation',
	randomlocation: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var adjective = adjectives[Math.floor(adjectives.length * Math.random())];
		var location = locations[Math.floor(locations.length * Math.random())];
		this.say(room, text + "Randomly generated scene: __" + adjective + " " + location + "__.");
	},
	randmove: 'randommove',
	randommove: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var types = {"normal":1, "fire":1, "water":1, "grass":1, "electric":1, "ice":1, "fighting":1, "poison":1, "ground":1, "flying":1, "psychic":1, "bug":1, "rock":1, "ghost":1, "dragon":1, "dark":1, "steel":1, "fairy":1};
		var classes = {"physical": 1, "special": 1, "status": 1};
		var moveQuantity = 1;
		var hasBeenSet = false;
		var singleType = false;
		var singleClass = false;

		var parameters = arg.split(', ');
		if (parameters.length > 10) return this.say(room, text + "Please use 10 or fewer arguments.");
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i] === parseInt(parameters[i], 10)) {
				if (hasBeenSet) return this.say(room, text + "Please only specify number of pokemon once");
				if (parameters[i] < 1 || parameters[i] > 6) return this.say(room, text + "Quantity of random moves must be between 1 and 6.");
				moveQuantity = parameters[i];
				hasBeenSet = true;
				continue;
			}
			var notGate = false;
			if (parameters[i].charAt(0) === '!') {
				notGate = true;
				parameters[i] = parameters[i].substr(1);
			}
			var parameter = toId(parameters[i]);
			if (parameter in types) {
				if (types[parameter] === 1 && !notGate) {
					types[parameter] = 2;
					singleType = true;
				} else if (types[parameter] === 1 && notGate) {
					types[parameter] = 0;
				} else {
					return this.say(room, text + "Cannot include both '" + parameters[i] + "' and '!" + parameters[i] + "'.");
				}
			} else if (parameter in classes) {
				if (classes[parameter] === 1 && !notGate) {
					classes[parameter] = 2;
					singleClass = true;
				} else if (classes.parameter === 1 && notGate) {
					classes[parameter] = 0;
				} else {
					return this.say(room, text + "Cannot include both '" + parameters[i] + "' and '!" + parameters[i] + "'.");
				}
			} else {
				return this.say(room, text + "Please specify a parameter or check that you are spelling it correctly.");
			}
		}
		if (singleType) {
			if (moveQuantity > 3) return this.say(room, text + "Invalid generation conditions.");
			for (var set in types) {
				if (types[set] === 1) types[set] = 0;
			}
		}
		if (singleClass) {
			for (var set in classes) {
				if (classes[set] === 1) classes[set] = 0;
			}
		}

		var randomMoves = [];
		for (var j = 0; j < moveQuantity; j++) {
			var roll = Math.floor(614 * Math.random()) + 1;
			if (types[Movedex[roll].type] === 0 || classes[Movedex[roll].class] === 0 || randomMoves.indexOf(Movedex[roll].name) > -1) {
				j--;
				continue;
			}
			randomMoves.push(Movedex[roll].name);
		}
		this.say(room, text + randomMoves.join(', '));
	},
	randstyle: 'randomgenre',
	randomstyle: 'randomgenre',
	randgenre: 'randomgenre',
	randomgenre: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var genre1 = genres[Math.floor(genres.length * Math.random())];
		var genre2 = genres[Math.floor(genres.length * Math.random())];
		while (genre1 === genre2) {
			genre2 = genres[Math.floor(genres.length * Math.random())];
		}
		this.say(room, text + "Randomly generated genre: __" + genre1 + "/" + genre2 + "__.");
	},
	idea: 'randomstory',
	randidea: 'randomstory',
	randomidea: 'randomstory',
	randstory: 'randomstory',
	randomstory: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var genre1 = genres[Math.floor(genres.length * Math.random())];
		if (Math.floor(Math.random() * 2)) {
			var genre2 = genres[Math.floor(genres.length * Math.random())];
			while (genre1 === genre2) {
				genre2 = genres[Math.floor(genres.length * Math.random())];
			}
		}
		var adjective = adjectives[Math.floor(adjectives.length * Math.random())];
		var location = locations[Math.floor(locations.length * Math.random())];
		var characterAdjective = characterAdjectives[Math.floor(characterAdjectives.length * Math.random())];
		var type = characterTypes[Math.floor(characterTypes.length * Math.random())];
		var role = roles[Math.floor(4 * Math.random())];
		var gender = ["male", "female"][Math.floor(2 * Math.random())];
		if (Math.floor(Math.random() * 4200 < 20)) gender = "hermaphrodite";
		if (Math.floor(Math.random() * 4200 < 10) || type === "...thing") gender = "neuter";
		var pronoun = pronouns[gender];
		var possessivePronoun = possessivePronouns[gender];
		var perkList = perks.slice(0);
		var perk1 = perkList[Math.floor(perkList.length * Math.random())];
		perkList.splice(perkList.indexOf(perk1), 1);
		var perk2 = perkList[Math.floor(perkList.length * Math.random())];
		perkList.splice(perkList.indexOf(perk2), 1);
		var perk3 = perkList[Math.floor(perkList.length * Math.random())];
		var debuff = debuffs[Math.floor(debuffs.length * Math.random())];
		this.say(room, text + "Randomly generated story | Setting: __" + adjective + " " + location + "__ | Genre: __" + genre1 + (genre2 ? "/" + genre2 : "") + "__ | " + role + ": __a " + gender + ", " + characterAdjective + " " + type + ". " + possessivePronoun + " postive factors include: " + perk1 + ", " + perk2 + ", and " + perk3 + ", though " + pronoun + (gender === "neuter" ? " are" : " is") + " unfortunately rather " + debuff + ".__");
    },
    
    //End Random Commands

	'word': 'wotd',
	wotd: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		if (!arg || !this.hasRank(by, '+%@#&~')) return this.say(room, text + "Today's Word of the Day is **" + this.settings.wotd.word + "**: " + this.settings.wotd.kind + " [__" + this.settings.wotd.pron + "__] - " + this.settings.wotd.definition);
		if (toId(arg) === 'check' || toId(arg) === 'time') return this.say(room, text + "The Word of the Day was last updated to **" + this.settings.wotd.word + "** " + this.getTimeAgo(this.settings.wotd.time) + " ago by " + this.settings.wotd.user);
		arg = arg.split(', ');
		if (arg.length < 4) return this.say(room, text + "Invalid arguments specified. The format is: __word__, __pronunciation__, __part of speech__, __defintion__.");
		this.settings.wotd = {
			word: arg[0],
            pron: arg[1],
            kind: arg[2],
			definition: arg.slice(3).join(',').trim(),
			time: Date.now(),
			user: by.substr(1)
		};
		this.writeSettings();
		this.say(room, text + "The Word of the Day has been set to '" + arg[0] + "'!");
	},
	site: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "Writing Room's Website: http://pswriting.weebly.com/");
	},
	time: function (arg, by, room) {
        var today = new Date(); 
        var dd = today.getDate(); 
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var mi = today.getMinutes();
        var se = today.getSeconds();
        if (mm === 1) { this.mmm = "January"; var sea = "winter"};
        if (mm === 2) { this.mmm = "Febuary"; var sea = "winter"};
        if (mm === 3) { this.mmm = "March"; var sea = "spring"};
        if (mm === 4) { this.mmm = "April"; var sea = "spring"};
        if (mm === 5) { this.mmm = "May"; var sea = "spring"};
        if (mm === 6) { this.mmm = "June"; var sea = "summer"};
        if (mm === 7) { this.mmm = "July"; var sea = "summer"};
        if (mm === 8) { this.mmm = "August"; var sea = "summer"};
        if (mm === 9) { this.mmm = "September"; var sea = "autumn"};
        if (mm === 10) { this.mmm = "October"; var sea = "autumn"};
        if (mm === 11) { this.mmm = "November"; var sea = "autumn"};
        if (mm === 12) { this.mmm = "December"; var sea = "winter"};
        if (dd === 1) { this.ddd = "first" };
        if (dd === 2) { this.ddd = "second" };
        if (dd === 3) { this.ddd = "third" };
        if (dd === 4) { this.ddd = "forth" };
        if (dd === 5) { this.ddd = "fifth" };
        if (dd === 6) { this.ddd = "sixth" };
        if (dd === 7) { this.ddd = "seventh" };
        if (dd === 8) { this.ddd = "eighth" };
        if (dd === 9) { this.ddd = "nineth" };
        if (dd === 10) { this.ddd = "tenth" };
        if (dd === 11) { this.ddd = "eleventh" };
        if (dd === 12) { this.ddd = "twelfth" };
        if (dd === 13) { this.ddd = "thirteenth" };
        if (dd === 14) { this.ddd = "forteenth" };
        if (dd === 15) { this.ddd = "fifteenth" };
        if (dd === 16) { this.ddd = "sixteenth" };
        if (dd === 17) { this.ddd = "seventeenth" };
        if (dd === 18) { this.ddd = "eighteenth" };
        if (dd === 19) { this.ddd = "nineteenth" };
        if (dd === 20) { this.ddd = "twentieth" };
        if (dd === 21) { this.ddd = "twenty-first" };
        if (dd === 22) { this.ddd = "twenty-second" };
        if (dd === 23) { this.ddd = "twenty-third" };
        if (dd === 24) { this.ddd = "twenty-forth" };
        if (dd === 25) { this.ddd = "twenty-fifth" };
        if (dd === 26) { this.ddd = "twenty-sixth" };
        if (dd === 27) { this.ddd = "twenty-seventh" };
        if (dd === 28) { this.ddd = "twenty-eighth" };
        if (dd === 29) { this.ddd = "twenty-nineth" };
        if (dd === 30) { this.ddd = "thirtieth" };
        if (dd === 31) { this.ddd = "thirty-first" };
        //And one more, just for good luck.
        if (dd === 32) { this.ddd = "thirty-second" };
        var AMorPM = "AM"
        if (hr === 12) AMorPM = "PM"
        if (hr === 24) { hr = 12; AMorPm = "AM" };
        if (hr > 12) {
            if (hr === 13) { hr = 1 };
            if (hr === 14) { hr = 2 };
            if (hr === 15) { hr = 3 };
            if (hr === 16) { hr = 4 };
            if (hr === 17) { hr = 5 };
            if (hr === 18) { hr = 6 };
            if (hr === 19) { hr = 7 };
            if (hr === 20) { hr = 8 };
            if (hr === 21) { hr = 9 };
            if (hr === 22) { hr = 10 };
            if (hr === 23) { hr = 11 };
            AMorPM = "PM";
        };
        if (dd<10) { dd = "0" + dd }; 
        if (mm<10) { mm = "0" + mm };
        if (mi<10) { mi = "0" + mi };
        if (se<10) { se = "0" + se };
        var theDay = today.getDay(); 
        if (theDay === 0) { this.theDay = "Sunday" }; 
        if (theDay === 1) { this.theDay = "Monday" }; 
        if (theDay === 2) { this.theDay = "Tuesday" };
        if (theDay === 3) { this.theDay = "Wednesday" };
        if (theDay === 4) { this.theDay = "Thursday" };
        if (theDay === 5) { this.theDay = "Friday" };
        if (theDay === 6) { this.theDay = "Saturday"};
        var today = hr + ":" + mi + ":" + se + " " + AMorPM + ", " + mm + '/' + dd + '/' + yyyy + ', the ' + this.ddd + " of the " + sea + " month of " + this.mmm + ', ' + yyyy + ' (' + this.theDay + ')';
        this.say(room, "The current time is: " + today);
	},
	newbie: 'rules',
	faq: 'rules',
	rules: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "If you're new to the Writing room, be sure to read our introduction: http://pswriting.weebly.com/introduction.html Feel free to ask any room staff any questions that you may have!");
	},
	esupport: function (arg, by, room) {
		var text = this.hasRank(by, '%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'I love you, ' + by + '.');
	},
	drive: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Community Drive: http://bit.do/pswritingarchives');
	},
	contests: 'events',
	contest: 'events',
	events: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Visit this page for a list of our weekly challenges and contests: http://pswriting.weebly.com/events.html');
	},
	hype: 'sundayscribing',
	slam: 'sundayscribing',
	sundayslam: 'sundayscribing',
	scribing: 'sundayscribing',
	sundayscribing: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "Every week we hold a Sunday Scribing challenge in which participants are to write a story or a poem (depending on the week) based on the topic announced on Sunday. They have until the following Friday to submit it. For more info and the submission link: http://goo.gl/Ezik4q");
	},
	plug: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Come join our Plug.dj~! https://plug.dj/pokemon-showdown-writing-room');
	},
	titlehelp: 'title',
	title: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Need help capitalising a title? Try out this helpful tool! http://titlecapitalization.com/');
	},
	poems: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Writing Room Poems: http://bit.do/PSwritingpoems');
	},
	stories: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Writing Room Stories: http://bit.do/PSwritingstories');
	},
	voice: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + 'Interested in becoming a voice? Check out the guideines for your chance at having a shot! http://bit.do/pswritingvoicerules or http://bit.do/pswritingvoicerap');
	},
	announce: function (arg, by, room) {
		if (!this.hasRank(by, '%@#&~')) return false;
		arg = toId(arg);
		if (arg === 'off') {
			if (this.buzzer) clearInterval(this.buzzer);
			return this.say(room, 'Announcements have been disabled.');
		} else if (arg === 'on') {
			var self = this;
			this.buzzer = setInterval(function() {
				var tips = ["Don't forget to allow people to comment on your work when it's done! Click 'Share', and set permissions accordingly.",
					"We like to play writing games, too! Click 'Activities' in our room introduction (the fancy box you saw when you joined) to see what games are available!",
					"Looking for feedback? Ask writers for an R/R, or a 'review for review'. It's a win-win for both parties!",
					"Questions on the (+) voice rank? Read our Voice Guidelines at http://bit.do/pswritingvoiceguidlines for more information.",
					"Confused as to the time? Wanting to punch timezones in the face? Look no further, for I have a fancy ``time`` command! Try it out!",
					"Would you like to host your work on our cloud drive? Ask a staff member about getting your own folder!",
					"Be sure to keep your work's presentation up to par, or AxeBane will hunt you down! Or, you could ask one of our staff to take a look and check it for you, but that's boring.",
					"Hey, you. Yes, you! Do __you__ want to improve the room? If you answered 'no', then go sit in the naughty corner. If you said 'yes', on the other hand, then go ahead and click the shiny 'submit and idea' button in the roominto!",
					"Want to play a writing game? Ask one of our friendly staff to host one, or if you think you're up to it, try hosting yourself! It's a great way to gain a good reputation!",
					"Every week we hold a Pokemon Showdown! Sunday Scribing contest. Participants are to write a story or a poem, depending on which week it is, based on the topic announced on Saturday. They have the whole of Sunday to write it. For more info, visit http://goo.gl/Ay6U5N",
					"Today's Word of the Day is: " + self.settings.wotd.word + ". Its definition is: " + self.settings.wotd.definition,
					"Need help getting started on a story? Try out the ``;idea`` command! Or, if you need to be a little more specific, try things like ``;randchar`` or ``;randscene``. You'll be writing in no time!",
					"Did you know that we have an official place to share music? It's a great place to listen to something whilst writing, perhaps even gaining some inspiration! Of course, you could also just hang out there and chat. Interested? Good! Head on over to https://plug.dj/pokemon-showdown-writing-room",
					"Need a quick way to access our Community Drive? Type ``;drive``!",
					"Psst... You. Yeah, you! Did you know that you can send messages to your scribing buddies just by using the ``;mail`` command? It works, even when they're offline! :o",
					"Need some love? Try using the ``esupport`` command. I promise I won't bite. <3"
				];
				var num = Math.floor((Math.random() * tips.length));
				self.say(room, tips[num]);
			}, 60 * 60 * 1000);
		}
	},

	/**
	 * Messaging related commands
	 *
	 */

	mail: 'message',
	msg: 'message',
	message: function (arg, by, room) {
		if (this.settings.messageBlacklist && this.settings.messageBlacklist[toId(by)]) return false;
		if (room.charAt(0) !== ',' && !this.canUse('message', room, by)) return this.say(room, '/pm ' + by + ', Messaging is not enabled in this room for your rank, please send mail through PM');
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = arg.split(',');
		if (!arg[0] || !arg[1]) return this.say(room, text + 'Please use the following format: ";mail user, message"');
		var user = toId(arg[0]);
		if (user === toId(Config.nick)) return this.say(room, text + 'Oh, dear. You do know you can just tell me these things up-front, right?');
		var message = arg.slice(1).join(',').trim();
		if (message.length > 215) return this.say(room, text + 'Your message cannot exceed 215 characters');
		if (user.length > 18) return this.say(room, text + 'That\'s not a real username! It\'s too long! >:I');
		if (!this.messages[user]) this.messages[user] = [];
		if (this.messages[user].length >= 5) return this.say(room, text + arg[0] + '\'s inbox is full.');
		var mail = {
			from: by.substr(1),
			text: message,
			time: Date.now()
		}
		this.messages[user].push(mail);
		this.writeMessages();
		this.say(room, text + 'Your message has been sent to ' + arg[0] + '.');
	},
	checkmail: 'readmessages',
	readmail: 'readmessages',
	readmessages: function (arg, by, room) {
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		var user = toId(by);
		if (!this.messages[user]) return this.say(room, text + 'Your inbox is empty.');
		for (var i = 0; i < this.messages[user].length; i++) {
			this.say(room, text + this.getTimeAgo(this.messages[user][i].time) + " ago, " + this.messages[user][i].from + " said: " + this.messages[user][i].text);
		}
		delete this.messages[user];
		this.writeMessages();
	},
	clearmail: 'clearmessages',
	clearmessages: function (arg, by, room) {
		if (!this.hasRank(by, '#&~')) return false;
		if (!arg) return this.say(room, 'Specify whose mail to clear or \'all\' to clear all mail.');
		if (!this.messages) return this.say(room, 'The message file is empty.');
		if (arg === 'all') {
			this.messages = {};
			this.writeMessages();
			this.say(room, 'All messages have been cleared.');
		} else if (arg === 'time') {
			for (var user in this.messages) {
				var messages = this.messages[user].slice(0);
				for (var i = 0; i < messages.length; i++) {
					if (messages[i].time < (Date.now() - MESSAGES_TIME_OUT)) this.messages[user].splice(this.messages[user].indexOf(messages[i]), 1);
				}
			}
			this.writeMessages();
			this.say(room, 'Messages older than one week have been cleared.');
		} else {
			var user = toId(arg);
			if (!this.messages[user]) return this.say(room, arg + ' does not have any pending messages.');
			delete this.messages[user];
			this.writeMessages();
			this.say(room, 'Messages for ' + arg + ' have been cleared.');
		}
	},
	countmessages: 'countmail',
	countmail: function (arg, by, room) {
		if (!this.hasRank(by, '#&~')) return false;
		if (!this.messages) this.say(room, 'The message file is empty');
		var messageCount = 0;
		var oldestMessage = Date.now();
		for (var user in this.messages) {
			for (var i = 0; i < this.messages[user].length; i++) {
				if (this.messages[user][i].time < oldestMessage) oldestMessage = this.messages[user][i].time;
				messageCount++;
			}
		}
		//convert oldestMessage to days
		var day = Math.floor((Date.now() - oldestMessage) / (24 * 60 * 60 * 1000));
		this.say(room, 'There are currently **' + messageCount + '** pending messages. ' + (messageCount ? 'The oldest message ' + (!day ? 'was left today.' : 'is __' + day + '__ days old.') : ''));
	},
	upl: 'messageblacklist',
	unpoeticlicense: 'messageblacklist',
	messageblacklist: function (arg, by, room) {
		if (!this.hasRank(by, '@#&~')) return false;
		if (!arg) return this.say(room, 'Please specify which user(s) to blacklist from the message system');
		var users = arg.split(', ');
		var errors = [];
		if (!this.settings.messageBlacklist) this.settings.messageBlacklist = {};
		for (var i = 0; i < users.length; i++) {
			var user = toId(users[i]);
			if (this.settings.messageBlacklist[user]) {
				errors.push(users[i]);
				users.splice(i, 1);
				continue;
			}
			this.settings.messageBlacklist[user] = 1;
		}
		this.writeSettings();
		if (errors.length) this.say(room, errors.join(', ') + ' is already on the message blacklist');
		if (users.length) this.say(room, '/modnote ' + users.join(', ') + ' added to the message blacklist by ' + by.substr(1));
	},
	vmb: 'viewmessageblacklist',
	viewmessageblacklist: function (arg, by, room) {
		if (!this.hasRank(by, '@#&~')) return false;
		if (!this.settings.messageBlacklist) return this.say(room, 'No users are blacklisted from the message system');
		var messageBlacklist = Object.keys(this.settings.messageBlacklist);
		this.uploadToHastebin(room, by, "The following users are blacklisted from the message system:\n\n" + messageBlacklist.join('\n'));
	},
	bio: 'biography',
	biography: function(arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		var user = toId(arg);
		if (!this.settings.bios) {
			this.settings.bios = [];
			this.writeSettings();
		}
		var bios = this.settings.bios;
		var input = arg.split(' ');
		if (toId(input[0]) === "set" && input[1]) {
			if (!this.hasRank(by, '+%@#&~')) return this.say(room, text + "Sorry, but you need to be at least a voice to set a biography.");
			user = toId(by);
			input = input.slice(1).join(' ');
			for (var i = 0, len = bios.length; i < len; i++) {
				if (bios[i].name === user) {
					bios[i].bio = input;
					this.writeSettings();
					return this.say(room, text + "Biography for user " + by.substr(1) + " has been edited.");
				}
			}
			bios.push({"name": user, "bio": input});
			this.writeSettings();
			return this.say(room, text + "Biography for user " + by.substr(1) + " has been set.");
		} else {
			for (var i = 0, len = bios.length; i < len; i++) {
				if (toId(by) === bios[i].name) {
					return this.say(room, text + by + ": " + bios[i].bio);
				}
				else if (user === bios[i].name) {
					return this.say(room, text + arg + ": " + bios[i].bio);
				}
			}
			if (arg) {
				this.say(room, text + "No biography found for " + arg);
			} else {
				return this.say(room, text + "You haven't set a biography yet! :o")
			}
		}
	},
	genrp: 'randRP',
	genRP: 'randRP',
	randrp: 'randRP',
	randRP: function(arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		arg = arg.split(", ");
		if (!arg || arg.length < 2) return this.say(room, "Please specify two names, seperated by a comma.");
		var X = arg[0];
		var Y = arg[1];
		var RANDNUM = Math.floor((Math.random() * 94));
		var ar = new Array();

		ar[0] = X + " as a superhero and " + Y + " as the sidekick.";
		ar[1] = X + " cooking lunch for " + Y + ".";
		ar[2] = X + " as a vampire feeding on " + Y + ".";
		ar[3] = X + " and " + Y + "  as children playing together.";
		ar[4] = X + " as a film noir detective and " + Y + " as the desperate client.";
		ar[5] = X + " and " + Y + " in hand to hand combat.";
		ar[6] = X + " taking care of an injured " + Y + ".";
		ar[7] = X + " giving " + Y + " a piggy back ride.";
		ar[8] = X + " frustrated by losing a board game or card game to " + Y + ".";
		ar[9] = X + " and " + Y + " fighting together, back to back.  ";
		ar[10] = X + " giving " + Y + " a present.";

		ar[11] = X + " and " + Y + " wearing each other's clothes.";
		ar[12] = X + " and " + Y + " cuddling.";
		ar[13] = X + " and " + Y + " dancing.";
		ar[14] = X + " striking the finishing blow on " + Y + ".";
		ar[15] = X + " and " + Y + " meeting after they haven't seen each other in a very long time.";
		ar[16] = X + " and " + Y + " watching a very sad movie. " + X + " is crying.";
		ar[17] = X + " and " + Y + " at a wild party. " + X + " doesn't want to be there.";
		ar[18] = X + " and " + Y + " going to an event that requires formal attire.";
		ar[19] = X + " and " + Y + " as JRPG style characters.";
		ar[20] = X + " and " + Y + " as medieval-fantasy RPG characters archetypes.";

		ar[21] = X + " is the lead singer and " + Y + " is the guitarist in a band.";
		ar[22] = X + " and " + Y + " at the beach.";
		ar[23] = X + " and " + Y + " watching the sunset.";
		ar[24] = X + " and " + Y + " playing a sports game together.";
		ar[25] = X + " mourning over a dead " + Y + ".";
		ar[26] = X + " and " + Y + " eating dinner together";
		ar[27] = X + " helping " + Y + " with chores.";
		ar[28] = X + " is about to do something stupid. " + Y + " does not think this is a good idea.";
		ar[29] = X + " with a hangover, but " + Y + " is feeling fine.";
		ar[30] = X + " drawing " + Y + ".";

		ar[31] = X + " and " + Y + " taking care of a bunch of orphan puppies and/or kittens."
		ar[32] = X + " and " + Y + " in dressing in drag."
		ar[33] = X + " is a member of the royal family and " + Y + " is a lowly peasant."
		ar[34] = X + " comforting a sad " + Y + "."
		ar[35] = X + " confronting " + Y + " about something bad they have done."
		ar[36] = X + " reveals a secret to " + Y + "."
		ar[37] = X + " discovers " + Y + "'s terrible secret."
		ar[38] = X + " playing pranks on " + Y + "."
		ar[39] = X + " getting revenge on " + Y + "."
		ar[40] = X + " and " + Y + " as rivals in a competition or contest. " + X + " wins.";
	
		ar[41] = X + " and " + Y + " in matching cosplays";
		ar[42] = X + " and " + Y + " go to a bar. " + Y + " gets too drunk and " + X + " has to take them home.";
		ar[43] = X + " suspects " + Y + " is a werewolf. " + Y + " is actually hiding a more mundane secret.";
		ar[44] = X + " and " + Y + " meet during the zombie apocalypse. " + Y + " needs" + X + "'s help.";
		ar[45] = X + " accidentally drinks a love potion and falls for " + Y + ".";
		ar[46] = X + " gets amnesia and forgets everything about " + Y + ".";
		ar[47] = X + " and " + Y + " get separated in a place that's easy to get lost in. They need to reunite.";
		ar[48] = X + " has something that " + Y + " desperately wants or needs. " + X + " won't give it up easily.";
		ar[49] = X + " has offended " + Y + " in some way but doesn't realize it.";
		ar[50] = X + " and " + Y + " as buddy cops.";

		ar[51] = X + " and " + Y + " play an MMO together. " + X + " is the tank and " + Y + " is the healer.";
		ar[52] = X + " is a famous and " + Y + " is their biggest fan.";
		ar[53] = X + " is a super hero hiding their secret identity from " + Y + ".";
		ar[54] = X + " was bullied by " + Y + " when they were both children. " + Y + " doesn't remember doing it.";
		ar[55] = X + " is finally noticed by their sempai, " + Y + ".";
		ar[56] = X + " gets a contract to assassinate " + Y + ".";
		ar[57] = X + " and " + Y + " are in an arranged marriage, but " + X + " doesn't want to go through with it.";
		ar[58] = X + " is " + Y + "'s hired body guard.";
		ar[59] = X + " and " + Y + " meet when " + X + " finds " + Y + "'s lost pet.";
		ar[60] = X + " and " + Y + " are atheletes from different countries that meet at the Olympics.";


		ar[61] = X + " is too nervous to approach " + Y + ", and only admires them from afar.";
		ar[62] = X + " and " + Y + " are part of a team, but their constant arguing causes problems. They have to pull it together for the sake of the team.";
		ar[63] = X + " is a barista at " + Y + "'s favorite coffee shop.";
		ar[64] = X + " has stowed away on a ship that " + Y + " works on.";
		ar[65] = X + " saved " + Y + "'s life. " + Y + " is honorbound to return the favor.";
		ar[66] = X + " is a demon summoned by wizard " + Y + " to do their bidding.";
		ar[67] = "A prophecy foretold that " + X + " would be the only one who could defeat the evil " + Y + ".";
		ar[68] = X + " and " + Y + " are reincarnated lovers, but aren't initially compatable to each other.";
		ar[69] = X + " and " + Y + " meet on a blind date. " + Y + " wants to go on another date, but " + X + " isn't sure.";
		ar[70] = X + " is under a terrible curse. " + Y + " knows how to cure it.";
	
		ar[71] = X + " and " + Y + " are the leaders of rival gangs.";
		ar[72] = X + " is the leader of an organization. " + Y + " is their loyal second-in-command";
		ar[73] = X + " confessed their love to " + Y + ", but was rejected.";
		ar[74] = X + " and " + Y + " pretend to be in a relationship for the purpose of an undercover mission.";
		ar[75] = X + " frequently has dreams or nightmares about " + Y + ".";
		ar[76] = X + " is hired to spy on " + Y + ".";
		ar[77] = X + " and " + Y + " got handcuffed together and lost the key.";
		ar[78] = X + " is cornered by a bully, but " + Y + " comes to the rescue.";
		ar[79] = X + " is bitten by a zombie and has to be put down by " + Y + ".";
		ar[80] = X + " and " + Y + " go on a road trip.";
	
		ar[81] = X + " tries to tell " + Y + " that 'It isn't what it looks like, I swear!'";
		ar[82] = X + " and " + Y + " swap bodies.";
		ar[83] = X + " knits an ugly sweater and forces " + Y + " to wear it.";
		ar[84] = X + " loses a bet to " + Y + ".";
		ar[85] = X + " and " + Y + " decide to go camping. " + Y + " reads the map upside down and they both become terribly lost.";
		ar[86] = X + ", a knight in shining armor, must rescue the distressed " + Y + ".";
		ar[87] = X + " gives up their life so that " + Y + " can live.";
		ar[88] = X + " and " + Y + " fight over who will sleep where on the bunk bed.";
		ar[89] = X + " trains " + Y + " in combat.";
		ar[90] = X + " and " + Y + " go ice skating. " + Y + " is not very good and " + X + " has to help them.";
	
		ar[91] = X + " and " + Y + " watch fireworks together.";
		ar[92] = X + " and " + Y + " are Pokemon trainers that cross paths and end up traveling together.";
		ar[93] = X + " and " + Y + " get caught up in a storm and must stay sheltered together until it passes.";

		this.say(room, text + "Randomly Generated RP: " + ar[RANDNUM]);
	}
};
