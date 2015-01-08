/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */
const MESSAGES_TIME_OUT = 7 * 24 * 60 * 60 * 1000;

var http = require('http');
var sys = require('sys');

// Lists for random generator commands
var adjectives = ["crystal", "floating", "eternal-dusk", "sunset", "snowy", "rainy", "sunny", "chaotic", "peaceful", "colorful", "gooey", "fiery", "jagged", "glass", "vibrant", 
	"rainbow", "foggy", "calm", "demonic", "polygonal", "glistening", "sexy", "overgrown", "frozen", "dark", "mechanical", "mystic", "steampunk", "subterranean", "polluted", "bleak", 
	"dank", "smooth", "vast", "pixelated", "enigmatic", "illusionary", "sketchy", "spooky", "flying", "legendary", "cubic", "moist", "oriental", "fluffy", "odd", "fancy", "strange", 
	"authentic", "bustling", "barren", "cluttered", "creepy", "dangerous", "distant", "massive", "exotic", "tainted", "filthy", "flawless", "forsaken", "frigid", "frosty", "grand", 
	"grandiose", "grotesque", "harmful", "harsh", "hospitable", "hot", "jaded", "meek", "weird", "awkward", "silly", "cursed", "blessed", "drought-stricken", "futuristic", "ancient",
	"medieval", "gothic", "radioactive"
];
var locations = ["river", "island", "desert", "forest", "jungle", "plains", "mountains", "mesa", "cave", "canyon", "marsh", "lake", "plateau", "tundra", "volcano", "valley", 
	"waterfall", "atoll", "asteroid", "grove", "treetops", "cavern", "beach", "ocean", "heavens", "abyss", "city", "crag", "planetoid", "harbor", "evergreen", "cabin", 
	"hill", "field", "ship", "glacier", "estuary", "wasteland", "clouds", "chamber", "ruin", "tomb", "park", "closet", "terrace", "hot air balloon", "shrine", "room", "swamp", "road", 
	"path", "gateway", "school", "building", "vault", "pool", "pit", "temple", "lagoon", "prison", "harem", "mine", "catacombs", "rainforest", "laboratory", "library", "stadium", 
	"museum", "mansion", "carnival", "amusement park", "farm", "factory", "castle", "spaceship", "space station", "cafe", "theater", "island", "hospital", "ruins", "bazaar" 
];
var characterAdjectives = ["sturdy", "helpless", "young", "rugged", "odd-looking", "amusing", "dynamic", "exuberant", "quirky", "awkward", "elderly", "adolescent", "'ancient'", 
	"odd", "funny-looking", "tall", "short", "round", "blind", 
];
var characterTypes = ["Marksman", "Adventurer", "Pokemon Trainer", "Pokemon", "Dragonkin", "Chef", "Businessman", "Kitsune", "Youkai", "...thing", "Archer", "Taxi Driver", 
	"Dentist", "Demon", "Paladin", "Writer", "Diety", "Spy", "Goverment Agent", "Farmer", "Teacher", "Warrior", "Athlete", "Artist", "Assassin", "Beast", "Journalist", 
	"Designer", "Doctor", "Vampire", "Time Traveller", "Alien", "Butler", "Police Officer", "Toymaker", "Student", "Photographer", "Mage", "Computer Programmer"
];
var perks = ["kind of heart", "powerful", "handsome", "ambitious", "amiable", "brave", "rational", "witty", "honest", "agile", "athletic", "quick on their feet", "assertive", 
	"fearless", "intelligent", "persistent", "philosophical", "pioneering", "quiet", "wealthy", "not afraid to voice their opinion", "quick-witted", "lucky", "friendly", "neat", 
	"sympathetic", "sincere", "mysterious", "loyal", "trustworthy", "imaginative", "gentle"
];
var debuffs = ["sly", "unclean", "smelly", "obnoxiously loud", "fond of 'tricks'", "fond of 'games'", "fond of 'jokes'", "prone to 'accidentally' taking others' things", "cocky", 
	"prone to falling over", "prone to bad luck at times", "clingy", "foolish", "fussy", "greedy", "gullible", "impatient", "inconsiderate", "lazy", "moody", "obsessive", 
	"narrow-minded", "patronizing", "resentful", "unreliable", "vague", "weak-willed", "egotistical", "sensitive", "Grammar Nazi-ish"
];
var genres = ["Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Horror", "Mystery", "Philosophical", "Romance", 
	"Saga", "Satire", "Science Fiction", "Thriller"
];
var roles = ["Protagonist", "Antagonist", "Major character", "Minor character"];
var pronouns = {'male': 'he', 'female': 'she', 'hermaphrodite': 'shi', 'neuter': 'they'};
var possessivePronouns = {'male': 'His', 'female': 'Her', 'hermaphrodite': 'Hir', 'neuter': 'Their'};
var types = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Flying", "Ground", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

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
		text += 'Writing Bot: fork of Roleplaying Bot by Morfent, customised for use in room __Writing__ by AxeBane. Github Repository: http://github.com/AxeBane/Axe-s-Writing-Bot';
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
			console.log(by + ' reloaded the bot.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	do: function(arg, by, room, con) {
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
			randomcommands: 1,
			message: 1
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
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' + Object.keys(modOpts).join('/') + '](, [on/off])');
			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1})) return this.say(con, room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' + Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings['modding'][room][toId(opts[1])] = 0;
				} else {
					delete this.settings['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			} else {
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' + (this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(con, room, ';' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(con, room, 'The settings for ' + config.commandcharacter + opts[0] + ' cannot be changed.');
						return;
					}
				} else {
					this.say(con, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(con, room, 'The command "' + config.commandcharacter + opts[0] + '" could not be found.');
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
					msg = config.commandcharacter + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' and above.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = config.commandcharacter + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
				} else if (this.settings[cmd][room] === true) {
					msg = config.commandcharacter + cmd + ' is available for all users in this room.';
				} else if (this.settings[cmd][room] === false) {
					msg = config.commandcharacter + cmd + ' is not available for use in this room.';
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
				this.say(con, room, 'The command ;' + cmd + ' is now ' + (settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' : (this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
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
		if (!this.hasRank(this.ranks[room] || ' ', '@#&~')) return this.say(con, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

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
		if (!this.hasRank(this.ranks[room] || ' ', '@#&~')) return this.say(con, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(con, room, 'No pattern was specified.');
		if (!/[^\\\{,]\w/.test(arg)) return false;
		arg = '/' + arg + '/i';
		if (!this.blacklistUser(arg, room)) return this.say(con, room, 'Pattern ' + arg + ' is already present in the blacklist.');

		this.say(con, room, 'Pattern ' + arg + ' added to the blacklist successfully.');
		this.writeSettings();
	},
	unrab: 'unregexautoban',
	unregexab: 'unregexautoban',
	unregexautoban: function(arg, by, room, con) {
		if (!this.canUse('regexautoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@#&~')) return this.say(con, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(con, room, 'No pattern was specified.');
		arg = '/' + arg + '/i';
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
			text = 'No users seem to be blacklisted in this room.';
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

	//This is a template for all Random Commands; please don't use this as an actual command.
	randomcommands: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var variableone = list1[Math.floor(list1.length * Math.random())];
		var variabletwo = list2[Math.floor(list2.length * Math.random())];
		this.say(con, room, text + "Randomly generated thing: __" + variableone + " " + variabletwo + "__.");
	},
	//Random Commands Section!
	//Place all 'random thing generator' commands in this area!
	randchar: 'randomcharacter',
	chargen: 'randomcharacter',
	genchar: 'randomcharacter',
	randomcharacter: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var adjective = characterAdjectives[Math.floor(characterAdjectives.length * Math.random())];
		var type = characterTypes[Math.floor(characterTypes.length * Math.random())];
		var role = roles[Math.floor(roles.length * Math.random())];
		var gender = ["male", "female"][Math.floor(2 * Math.random())];
		if (Math.floor(Math.random() * 4200 < 20)) var gender = "hermaphrodite";
		if (Math.floor(Math.random() * 4200 < 10) || type === "...thing") var gender = "neuter";
		var pronoun = pronouns[gender];
		var possessivePronoun = possessivePronouns[gender];
		var perk = [perks[Math.floor(perks.length * Math.random())], perks[Math.floor(perks.length * Math.random())], perks[Math.floor(perks.length * Math.random())]];
		var debuff = debuffs[Math.floor(debuffs.length * Math.random())];
		this.say(con, room, text + "Randomly generated character: __A " + gender + ", " + adjective + " " + type + " (" + role + "). " + possessivePronoun + " postive factors include: " + perk[0] + ", " + perk[1] + ", and " + perk[2] + ", though " + pronoun + (gender === "neuter" ? " are" : " is") + " unfortunately rather " + debuff + ".__");
	},
	gentype: 'randomtype',
	randtype: 'randomtype',
	randomtype: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		arg = toId(arg);
		if (arg && arg !== 'single' && arg !== 'dual') this.say(con, room, text + "Please input either 'single' or 'dual' as arguments, or leave it blank for a random decision. Continuing as if you left it blank.");
		var firstType = types[Math.floor(types.length * Math.random())];
		if (arg !== 'single' && (arg === 'dual' || Math.floor(Math.random() * 2))) {
			var secondType = types[Math.floor(types.length * Math.random())];
			while (firstType === secondType) {
				secondType = types[Math.floor(types.length * Math.random())];
			}
		}
		this.say(con, room, text + "Randomly generated type: __" + firstType + (secondType ? "/" + secondType : "") + "__.");
	},
	randstats: 'randomstats',
	randomstats: function(arg, by, room, con, shuffle) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		arg = parseInt(arg);
		if (arg && (isNaN(arg) || arg < 30 || arg > 780)) return this.say(con, room, text + "Specified BST must be a whole number between 30 and 780.");
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
		this.say(con, room, text + "Randomly generated stats: HP: " + stats[0] + " Atk: " + stats[1] + " Def: " + stats[2] + " SpA: " + stats[3] + " SpD: " + stats[4] + " Spe: " + stats[5] + " BST: " + bst);
	},
	rollpokemon: 'randpokemon',
	randpoke: 'randpokemon',
	randompoke: 'randpokemon',
	randompokemon: 'randpokemon',
	randpokemon: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
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
				if (parameters[j] == parseInt(parameters[j], 10)) {
					if (hasBeenSet) return this.say(con, room, text + "Please only specify number of pokemon once");
					if (parameters[j] < 1 || parameters[j] > 6) return this.say(con, room, text + "Quantity of random pokemon must be between 1 and 6.");
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
					if (conditions[parameters[j]] !== 1) return this.say(con, room, text + "Cannot include both '" + parameters[j] + "' and '!" + parameters[j] + "'.");
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
					if (types[parameters[j]] !== 1) return this.say(con, room, text + "Cannot include both '" + parameters[j] + "' and '!" + parameters[j] + "'.");
					if (notGate) {
						types[parameters[j]] = 0;
					} else {
						types[parameters[j]] = 2;
						singleType = true;
					}
					continue;
				} else {
					return this.say(con, room, text + "Parameter '" + parameters[j] + "' not recognized.");
				}
			}

			//More complex checks to prevent it getting stuck searching for combinations that don't exist
			if (conditions.forms === 2 && singleType) return this.say(con, room, text + "The parameter 'forms' must be used by itself.");
			if ((conditions.uber === 2 && conditions.legend === 0 && pokequantity > 3) || (conditions.mega === 2 && conditions.uber === 2 && pokequantity > 1) ||
				(conditions.nfe === 2 && (conditions.uber === 2 || conditions.legend === 2 || conditions.mega === 2))) return this.say(con, room, text + "Invalid generation conditions.");

			if (singleType) {
				if (conditions.uber === 2 || conditions.legend === 2 || conditions.mega === 2) return this.say(con, room, text + "Invalid generation conditions.");
				for (var set in types) {
					if (types[set] === 1) types[set] = 0;
				}
			}
		}
		if (pokequantity == 1 && room.charAt(0) !== ',' && this.hasRank(by, '+%@#~')) text = '!dt ';

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
				return this.say(con, room, text + "Could not find " + pokequantity + " unique Pokemon with ``" + parameters.join(', ') + "``");
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
				var megaNum = (conditions.mega === 2 ? 0 : -1)
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
		this.say(con, room, (text === "!dt " ? text + randompokes.join(", ") : text + "Randomly generated Pokemon: " + randompokes.join(", ")));
	},
	randscene: 'randomlocation',
	randomscene: 'randomlocation',
	randlocation: 'randomlocation',
	randomlocation: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var adjective = adjectives[Math.floor(adjectives.length * Math.random())];
		var location = locations[Math.floor(locations.length * Math.random())];
		this.say(con, room, text + "Randomly generated scene: __" + adjective + " " + location + "__.");
	},
	randmove: 'randommove',
	randommove: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var types = {"normal":1, "fire":1, "water":1, "grass":1, "electric":1, "ice":1, "fighting":1, "poison":1, "ground":1, "flying":1, "psychic":1, "bug":1, "rock":1, "ghost":1, "dragon":1, "dark":1, "steel":1, "fairy":1};
		var classes = {"physical": 1, "special": 1, "status": 1};
		var moveQuantity = 1;
		var hasBeenSet = false;
		var singleType = false;
		var singleClass = false;

		var parameters = arg.split(', ');
		if (parameters.length > 10) return this.say(con, room, text + "Please use 10 or fewer arguments.");
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i] == parseInt(parameters[i], 10)) {
				if (hasBeenSet) return this.say(con, room, text + "Please only specify number of pokemon once");
				if (parameters[i] < 1 || parameters[i] > 6) return this.say(con, room, text + "Quantity of random moves must be between 1 and 6.");
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
					return this.say(con, room, text + "Cannot include both '" + parameters[i] + "' and '!" + parameters[i] + "'.");
				}
			} else if (parameter in classes) {
				if (classes[parameter] === 1 && !notGate) {
					classes[parameter] = 2;
					singleClass = true;
				} else if (classes.parameter === 1 && notGate) {
					classes[parameter] = 0;
				} else {
					return this.say(con, room, text + "Cannot include both '" + parameters[i] + "' and '!" + parameters[i] + "'.");
				}
			} else {
				return this.say(con, room, text + "Please specify a parameter or check that you are spelling it correctly.");
			}
		}
		if (singleType) {
			if (moveQuantity > 3) return this.say(con, room, text + "Invalid generation conditions.");
			for (var set in types) {
				if (types[set] == 1) types[set] = 0;
			}
		}
		if (singleClass) {
			for (var set in classes) {
				if (classes[set] == 1) classes[set] = 0;
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
		this.say(con, room, text + randomMoves.join(', '));
	},
	randstyle: 'randomgenre',
	randomstyle: 'randomgenre',
	randgenre: 'randomgenre',
	randomgenre: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var genre1 = genres[Math.floor(genres.length * Math.random())];
		var genre2 = genres[Math.floor(genres.length * Math.random())];
		while (genre1 === genre2) {
			genre2 = genres[Math.floor(genres.length * Math.random())];
		}
		this.say(con, room, text + "Randomly generated genre: __" + genre1 + "/" + genre2 + "__.");
	},
	idea: 'randomstory',
	randidea: 'randomstory',
	randomidea: 'randomstory',
	randstory: 'randomstory',
	randomstory: function(arg, by, room, con) {
		if (this.canUse('randomcommands', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
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
		if (Math.floor(Math.random() * 4200 < 20)) var gender = "hermaphrodite";
		if (Math.floor(Math.random() * 4200 < 10) || type === "...thing") var gender = "neuter";
		var pronoun = pronouns[gender];
		var possessivePronoun = possessivePronouns[gender];
		var perk = [perks[Math.floor(perks.length * Math.random())], perks[Math.floor(perks.length * Math.random())], perks[Math.floor(perks.length * Math.random())]];
		var debuff = debuffs[Math.floor(debuffs.length * Math.random())];
		this.say(con, room, text + "Randomly generated story | Setting: __" + adjective + " " + location + "__ | Genre: __" + genre1 + (genre2 ? "/" + genre2 : "") + "__ | " + role + ": __a " + gender + ", " + characterAdjective + " " + type + ". " + possessivePronoun + " postive factors include: " + perk[0] + ", " + perk[1] + ", and " + perk[2] + ", though " + pronoun + (gender === "neuter" ? " are" : " is") + " unfortunately rather " + debuff + ".__");
	},

	//End Random Commands

	sw: 'wotd',
	writer: 'wotd',
	wotd: function(arg, by, room, con) {
		if (!this.canUse('setrp', room, by)) {
			var text = '/pm ' + by + ', ';
		} else {
			var text = '';
			var self = this;
			config.wotdCalled = true;
			setTimeout(function() {
				delete config.wotdCalled;
			}, 60 * 1000);
		}
		if (!config.wotd) return this.say(con, room, text + 'A Writer of the Day hasn\'t been set! :o');
		this.say(con, room, text + 'Today\'s Spotlighted Writer is [[' + config.wotd + ']].');
	},
	site: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Writing Room\'s Website: http://pswriting.weebly.com/');
	},
	activities: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Be sure to read through our list of official activities! http://pswriting.weebly.com/activities.html');
	},
	newbie: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Welcome to the Writing room! In case you missed the big shiny box, please make sure to visit the room website and read the rules listed there: http://pswriting.weebly.com/rules.html');
		this.say(con, room, text + 'Also, feel free to ask the staff any questions you may have. I\'m sure they\'d love to answer them!');
	},
	esupport: function(arg, by, room, con) {
		if (this.hasRank(by, '%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'I love you, ' + by + '.');
	},
	drive: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Community Drive: http://bit.do/pswritingarchives');
	},
	contests: 'events',
	contest: 'events',
	events: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'The current Contests and Events for the Writing Room can be found here: http://pswriting.weebly.com/contests--events.html');
	},
	plug: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Come join our Plug.dj~! https://plug.dj/pokemon-showdown-writing-room');
	},
	faq: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Check out our Frequently Asked Questions page: http://bit.do/PSWritingDriveFAQ');
	},
	poems: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Writing Room Poems: http://bit.do/PSwritingpoems');
	},
	stories: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Writing Room Stories: http://bit.do/PSwritingstories');
	},
	rules: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Please read our Rules page: http://pswriting.weebly.com/rules.html ^.^');
	},
	voice: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Interested in becoming a voice? Check out the guideines for your chance at having a shot! http://bit.do/pswritingvoicerules or http://bit.do/pswritingvoicerap');
	},
	announce: function(arg, by, room, con) {
		if (!this.hasRank(by, '%@#~')) return false;
		arg = toId(arg);
		if (arg === 'off') {
			if (this.buzzer) clearInterval(this.buzzer);
			return this.say(con, room, 'Announcements have been disabled.');
		} else if (arg === 'on') {
			var self = this;
			this.buzzer = setInterval(function() {
				var tips = ["Don't forget to allow people to comment on your work when it's done! Click 'Share' and set permissions accordingly.",
					"We like to play writing games, too! Click 'Activities' in our room introduction (the fancy box you saw when you joined) to see what games are available!",
					"Looking for feedback? Ask writers for an R/R, or a 'review for review'. It's a win-win for both parties!",
					"Questions on the (+) voice rank? Read our Voice Guidelines at http://bit.do/pswritingvoiceguidlines for more information.",
					"Our Halloween contest has ended! Check out http://bit.do/pscontestresults for more info on the turnout, and thank you to all that participated!",
					"Would you like to host your work on our cloud drive? Ask a staff member about getting your own folder!",
					"Be sure to keep your work's presentation up to par, or AxeBane will hunt you down! Or, you could ask one of our staff to take a look and check it for you, but that's boring.",
					"Hey, you. Yes, you! Do __you__ want to improve the room? If you answered 'no', then go sit in the naughty corner. If you said 'yes', on the other hand, then go ahead and click the shiny 'submit and idea' button in the roominto!",
					"Want to play a writing game? Ask one of our friendly staff to host one, or if you think you're up to it, try hosting yourself! It's a great way to gain a good reputation!"
				];
				var num = Math.floor((Math.random() * tips.length));
				self.say(con, room, "**Writing Room Tip #" + (num + 1) + ":** " + tips[num]);
			}, 60*60*1000);
		}
	},

	/**
	 * Messaging related commands
	 *
	 */

	mail: 'message',
	msg: 'message',
	message: function(arg, by, room, con) {
		if (this.settings.messageBlacklist && this.settings.messageBlacklist[toId(by)]) return false;
		if (room.charAt(0) !== ',' && !this.canUse('message', room, by)) return this.say(con, room, '/pm ' + by + ', Messaging is not enabled in this room for your rank, please send mail through PM');
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = arg.split(',');
		if (!arg[0] || !arg[1]) return this.say(con, room, text + 'Please use the following format: ";mail user, message"');
		if (arg[1].length > 215) return this.say(con, room, text + 'Your message cannot exceed 215 characters');
		var user = toId(arg[0]);
		if (user.length > 18) return this.say(con, room, text + 'That\'s not a real username! It\'s too long! >:I');
		if (!this.messages[user]) this.messages[user] = [];
		if (this.messages[user].length >= 5) return this.say(con, room, text + arg[0] + '\'s inbox is full.');
		var message = {
			from: by.substr(1),
			text: arg[1].trim(),
			time: Date.now()
		}
		this.messages[user].push(message);
		this.writeMessages();
		this.say(con, room, text + 'Your message has been sent to ' + arg[0] + '.');
	},
	checkmail: 'readmessages',
	readmail: 'readmessages',
	readmessages: function(arg, by, room, con) {
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		var user = toId(by);
		if (!this.messages[user]) return this.say(con, room, text + 'Your inbox is empty.');
		for (var i = 0; i < this.messages[user].length; i++) {
			this.say(con, room, text + this.messages[user][i].from + " said " + this.getTimeAgo(this.messages[user][i].time) + " ago: " + this.messages[user][i].text);
		}
		delete this.messages[user];
		this.writeMessages();
	},
	clearmail: 'clearmessages',
	clearmessages: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		if (!arg) return this.say(con, room, 'Specify whose mail to clear or \'all\' to clear all mail.');
		if (!this.messages) return this.say(con, room, 'The message file is empty.');
		if (arg === 'all') {
			this.messages = {};
			this.writeMessages();
			this.say(con, room, 'All messages have been cleared.');
		} else if (arg === 'time') {
			for (var user in this.messages) {
				var messages = this.messages[user].slice(0);
				for (var i = 0; i < messages.length; i++) {
					if (messages[i].time < (Date.now() - MESSAGES_TIME_OUT)) this.messages[user].splice(this.messages[user].indexOf(messages[i]), 1);
				}
			}
			this.writeMessages();
			this.say(con, room, 'Messages older than one week have been cleared.');
		} else {
			var user = toId(arg);
			if (!this.messages[user]) return this.say(con, room, arg + ' does not have any pending messages.');
			delete this.messages[user];
			this.writeMessages();
			this.say(con, room, 'Messages for ' + arg + ' have been cleared.');
		}
	},
	countmessages: 'countmail',
	countmail: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		if (!this.messages) this.say(con, room, 'The message file is empty');
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
		this.say(con, room, 'There are currently **' + messageCount + '** pending messages. ' + (messageCount ? 'The oldest message ' + (!day ? 'was left today.' : 'is __' + day + '__ days old.') : ''));
	},
	upl: 'messageblacklist',
	unpoeticlicense: 'messageblacklist',
	messageblacklist: function(arg, by, room, con) {
		if (!this.hasRank(by, '@#~')) return false;
		if (!arg) return this.say(con, room, 'Please specify which user(s) to blacklist from the message system');
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
		if (errors.length) this.say(con, room, errors.join(', ') + ' is already on the message blacklist');
		if (users.length) this.say(con, room, '/modnote ' + users.join(', ') + ' added to the message blacklist by ' + by.substr(1));
	},
	vmb: 'viewmessageblacklist',
	viewmessageblacklist: function(arg, by, room, con) {
		if (!this.hasRank(by, '@#~')) return false;
		if (!this.settings.messageBlacklist) return this.say(con, room, 'No users are blacklisted from the message system');
		var messageBlacklist = Object.keys(this.settings.messageBlacklist);
		this.uploadToHastebin(con, room, by, "The following users are blacklisted from the message system:\n\n" + messageBlacklist.join('\n'));
	},

	/**
	 * These are commands related to the new Choose Your Own Adventure game I'm putting together! Possibly very buggy!
	 *
	 */
	debugroom: function(arg, by, room, con) {
		if (!this.hasRank(by, '%@#~')) return false;
		if (!settings.cyoa.gRoom) settings.cyoa.gRoom = {};
		if (arg == '') { return false }
		else {
		settings.cyoa.gRoom = arg;
		this.say(con, room, "The CYOA room has been changed to: " + arg);
		this.writeSettings();
		}
	},

	//Currently useless.
	debugflags: function(arg, by, room, con) {
		if (!this.hasRank(by, '%@#~')) return false;
		var player = arg
		if (!settings.cyoa.flags) return false;
		if (!arg) this.say(con, room, "Please include the name of a player.");
		if (arg != settings.cyoa.flags) this.say(con, room, "That's not a valid playername, sorry.");
	},
	cyoa: function(arg, by, room, con) {
		//Pre-Game Checking System, useful if this is the first time the command is ran.
		//------------------------------------------------------------------------------------
		arg = toId(arg);
		var user = toId(by);
		var self = this;
		if (!settings.cyoa) {
			this.settings.cyoa = {};
			this.writeSettings();
		}
		if (!settings.cyoa.gRoom) {
			this.settings.cyoa.gRoom = {};
			this.writeSettings();
		}
		if (!settings.cyoa.inventory) {
			this.settings.cyoa.inventory = [];
			this.writeSettings();
		}
		if (!settings.cyoa.stats) {
			this.settings.cyoa.stats = []; //These are the "flags" in the code that a new player will get. Useful for setting little details that you don't want to reset.
			this.writeSettings();
		}
		if (!settings.cyoa.flags) {
			this.settings.cyoa.flags = ["hasFoundKey"=false,"hasFoundWater"=false,"isPoisoned"=false,"gender"="male","morality"=5]; //And these are the variable flags that will reset at the end of every run.
		}
		//Morality system setup. Very basic ATM.
		if (settings.cyoa.flags.morality == 5) {
			var morality = "neutral";
		} else if (settings.cyoa.flags.morality < 5) {
			var morality = "dark";
		} else if (settings.cyoa.flags.morality > 5) {
			var morality = "light";
		}
		//And here's the actual game.
		if (arg == 'start') {
			if (!this.hasRank(by, '+%@#~')) return false;
			this.say(con, room, "The Choose Your Own Adventure Game has been started!");
			this.say(con, room, "You awaken in a dark room, lit only by a single lightbulb. Looking around, you manage to make out three doors; one [red], one [yellow], and one [green]. Which do you enter?");
			this.settings.cyoa.gRoom = 'darkRoom';
		}
		//Green Door Arc!
		//---------------------------------------------------------------------------------
		if (arg == 'green' && settings.cyoa.gRoom == 'darkRoom') {
			this.settings.cyoa.gRoom = 'greenDoor';
			this.say(con, room, "You enter the Green Door, and are greeted by an Old Man. He smiles at you, and asks, 'What can I do for you, young chap?' he seems somewhat docile, though it's possibly a trap... Do you [listen], or [run]?");
		}
		if (arg == 'listen' && settings.cyoa.gRoom == 'greenDoor') {
			this.say(con, room, "You decided to listen to the Old Man. He watches as you sit, smiling slightly. 'I'm so glad you decided to stay', he says, 'It was getting so lonely here...' he continues. The Old Man reaches forward, and taps you on the forehead. You can't move! Smiling, the Old Man says, 'Welcome to my collection.");
			this.say(con, room, "You end up living the rest of your life as a living statue in that one room. You can never see or do much, apart from stare at your new owner. Game Over!");
			this.settings.cyoa.gRoom = {};
		}
		if (arg == 'run' && settings.cyoa.gRoom == 'greenDoor') {
			this.say(con, room, "You decided to flee! You turn tail and head back out the door, not looking to see if you're being followed. However, you didn't end up back where you came! Instead, you're now standing in the middle of a barren wasteland! Huh.");
			this.say(con, room, "Glancing around, you notice that you've two options: 1) [Search] for help, or 2) [Wait] for someone to come help you. Maybe that Old Man from earlier would've helped you in this strange place...");
			this.settings.cyoa.gRoom = 'wasteland';
		}
		if (arg == 'search' && settings.cyoa.gRoom == 'wasteland') {
			this.say(con, room, "You decide to search for someone to help you. There's a fifty-fifty chance that this could end positively or negatively. Are you sure you want to [continue], " + by + "? You can always [flee] now.");
			this.settings.cyoa.gRoom = 'wastelandChoice';
		}
		if (arg == 'continue' && settings.cyoa.gRoom == 'wastelandChoice') {
			this.say(con, room, "Nodding in determination, you press onwards, hoping that you are prepared for whatever you may have to face.");
			var outcome = Math.floor(Math.random() * 99 + 1);
			if (outcome > 50) {
				this.say(con, room, "Looks like you were lucky! Nothing too horrible happened to you, though you did see your fair share of cacti. Abruptly, a figure comes into sight. You've been lucky thus far, should you [approach] them and see if they're friendly, or [run] back to whence you came?");
				self.settings.cyoa.gRoom = 'wastelandLucky';
			} else if (outcome <= 50) {
				this.say(con, room, "Luck wasn't with you, it seems... The moment you stepped out to far, your foot sank into the ground! Looks like you're caught in a sinkhole...");
				this.say(con, room, "That sucking feeling is probably the owner of the sinkhole that's currently draining out your blood. Don't worry; the sand has an odd anaesthetic quality, so you won't feel a thing! Downside is that it's Game Over.");
				self.settings.cyoa.gRoom = '';
			}
		}
		if (arg == 'run' && settings.cyoa.gRoom == 'wastelandChoice' || arg == 'run' && settings.cyoa.gRoom == 'wastelandLucky') {
			this.say(con, room, "You chicken out at the last second and head back to where you first entered this strange wasteland, not knowing nor caring about what you've possibly left behind. You're now back where you started, and can either [search] once more, or [wait].");
			this.settings.cyoa.gRoom = 'wasteland';
		}
		if (arg == 'approach' && settings.cyoa.gRoom == 'wastelandLucky') {
			this.say(con, room, "You decide to approach the figure to see if they're friendly. Interestingly, they don't react until you attempt to touch them, at which point they fall to the ground. This person is died standing up.");
			this.settings.cyoa.inventory = settings.cyoa.inventory + "Odd Key";
			this.settings.cyoa.inventory = settings.cyoa.inventory + "Water Bottle";
			this.say(con, room, "The up-side, however, is that you did manage find a rather strange-looking brass key. It doesn't look like it'll fit into any conventional lock... Due to the fact that almost all keys are useful in situations like your own, you decide to slip it into your pocket.");
			this.say(con, room, "Oh, and you found some water in the man's backpack! Good on you! May as well take the backpack, too. You slip the container of water into the front pocket for the backpack, and sling it over your shoulder. Now, you can either press [further], or go [back].");
			this.settings.cyoa.gRoom = 'wastelandItems';
		}
		if (arg == 'further' && settings.cyoa.gRoom == 'wastelandItems' || arg == 'back' && settings.cyoa.gRoom == 'wastelandItems') {
			if (arg == 'further') var text = 'venture further';
			if (arg == 'back') var text = 'head backwards, venturing';
			this.say(con, room, "You decide to " + text + " into this arid wasteland once more, pressing through the piercing heat, unsure about whether or not you will encounter danger. Let us hope, you your sake, you do not.");
			var outcome = Math.floor(Math.random() * 99 + 1);
			if (outcome >= 50) {
				this.say(con, room, "Looks like you were lucky! Nothing too horrible happened to you, though you did see __much__ more than your fair share of cacti.");
				this.say(con, room, "Somehow, though, you managed to end up back where you came... Looks like the only thing you should do now is [wait]. Venturing out at this point would be dangerous; you might've encountered some rabid wolves or something.");
				self.settings.cyoa.gRoom = 'wasteland';
			} else if (outcome < 50) {
				this.say(con, room, "Ack! As you were walking, you encounted a pack of wolves! Lunging at you, they attack! Prepare for combat!");
				self.settings.cyoa.gRoom = 'wastelandBattle';
				this.say(con, room, "Combat system still under construction. For now, this is the end.");
			}
		}
		if (arg == 'wait' && settings.cyoa.gRoom == 'wasteland') {
			this.say(con, room, "You decide to wait, sitting down on the harsh land's surface, and daydreaming about life...");
			if (settings.cyoa.flags.hasFoundKey === true) {
				this.say(con, room, "Abruptly, the key in your hand starts glowing! Your vision wavers slightly as a 'normal-looking' wooden door forms right before your eyes! It has a [keyhole] on it!");
				this.settings.cyoa.gRoom = 'wastelandDoor';
			} else if (!settings.cyoa.flags.hasFoundKey === true) {
				this.say(con, room, "After some time, you give up waiting and head out to find some help.");
				this.say(con, room, "You decide to search for someone to help you. There's a fifty-fifty chance that this could end positively or negatively. Are you sure you want to [continue], " + by + "? You can always [flee] now.");
				this.settings.cyoa.gRoom = 'wastelandChoice';
			}
		}
		if (arg == 'keyhole' && settings.cyoa.gRoom == 'wastelandDoor') {
			this.say(con, room, "You approach the door, glowing key in hand. Pausing, you tentatively slot it into the golden keyhole. You're cautious, as you do not trust this twisted place in the slightest. Who even placed you here? Why are you here? With these questions burning in your mind, you insert the key and turn it...");
			this.say(con, room, "TO BE CONTINUED...! Game Over, for now!"); //I'll continue this later.
			this.settings.cyoa.gRoom = {};
			this.timesPlayed + 1;
		}
		//Red Door Arc!
		//---------------------------------------------------------------------------------
		if (arg == 'red' && settings.cyoa.gRoom == 'darkRoom') {
			settings.cyoa.gRoom = 'redDoor';
			this.say(con, room, "You have decided to enter the Red Door, and you encounter...");
			this.say(con, room, "Placeholder: Absolutely nothing. You walked right into a void of absolute nothingness! Game Over!");
			this.settings.cyoa.gRoom = {};
		}
		//Yellow Door Arc!
		//---------------------------------------------------------------------------------
		if (arg == 'yellow' && settings.cyoa.gRoom == 'darkRoom') {
			this.settings.cyoa.gRoom = 'ylwDoor';
			this.say(con, room, "You have decided to enter the Yellow Door, and you encounter...");
			this.say(con, room, "Placeholder: A giant talking Bannana! He hits you over the head with a baseball bat whilst yelling something about Peanut Butter and Jelly! Game Over!");
			this.settings.cyoa.gRoom = {};
		}
		//Code for if someone is dumb and leaves the command blank. e-e
		if (arg === '') {
			this.say(con, room, "Please include an argument after 'cyoa'. Thank you! ^.^");
		}
		//Code for ending the whole fiasco.
		if (arg == 'stop' || arg == 'end') {
			if (this.hasRank(by, '%@#~')) {
			this.say(con, room, "The game has ended!");
			this.settings.cyoa.gRoom = {}
			} else return false;
		} else {};
		this.writeSettings();
	}
};
