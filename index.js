const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const { TOKEN, PREFIX } = require('./config.json');
const client = new Client();


const AdminsUsers = ["910544911131115551", "851696808437743616", "783493253034541136" ];
const PingCommand = `${PREFIX}ping`;
const AfkCommand = `${PREFIX}afk`;
const FollowCommand = `${PREFIX}follow`;
const SendDmcmmand = `${PREFIX}sendm`
const PermCommand = `${PREFIX}check`
let connection = null;
let follower = null;

client.on('ready', () => {
    console.log(`Client logged in as ${client.user.username}`);
});


client.on('voiceStateUpdate', (oldstats, newstats) => {
    if (follower) {
        if (newstats.id == follower && oldstats.channelId != newstats.channelId) {
                connection = joinVoiceChannel({
                    channelId: newstats.channelId,
                    guildId: newstats.guild.id,
                    adapterCreator: newstats.guild.voiceAdapterCreator,
                    selfDeaf: false,  // Ensure the bot is not deafened
                    selfMute: false,  // Ensure the bot is not muted
                });
        }
    }
})

client.on('messageCreate', async (msg) => {


    if (CheckUser(msg.author.id) && msg.content.startsWith(PREFIX)) {


        //======================================================================================
        // Get user roles
        //======================================================================================


        if (msg.content.startsWith(PermCommand)) {
            const userId = msg.content.split(' ')[1];
            if (!userId) {
                return msg.reply("Please provide a user ID.");
            }
    
            try {
                const permissions = await checkPermissionsAcrossGuilds(userId);
                if (permissions.length === 0) {
                    msg.reply(`User ${userId} has no admin or manager permissions in any guild.`);
                } else {
                    const reply = permissions.map(({ guildName, roles }) => 
                        `Guild: ${guildName}\nRoles: ${roles.join(', ')}`
                    ).join('\n\n');
                    msg.reply(`User ${userId} has admin or manager permissions in the following guild(s):\n\n${reply}`);
                }
            } catch (err) {
                console.error(err);
                msg.reply("An error occurred while checking permissions.");
            }
        }

        //======================================================================================
        // Send dm to user ex +sendm [userid] [message]
        //======================================================================================

        if (msg.content.toLocaleLowerCase().startsWith(SendDmcmmand)) {
            let command = msg.content.split(" ")
            if (command.length < 3) {
                msg.reply(`Invalid usage! Use ${SendDmcmmand} [UserId] [msg]`)
            } else {
                let user = client.users.cache.get(command[1]);
                let kalma = ""
                for (let index = 2; index < command.length; index++) {
                   kalma += command[index] + " " 
                }
                try {
                   await user.send(kalma)
                    msg.reply("[+] Message send")
                } catch (ERR) {
                    msg.reply("[-] Err invalid UserId or cant send msg to this user")
                }
            }
        }

        //======================================================================================
        // This command for check if bot is online
        //======================================================================================
        if (msg.content === PingCommand) {
            msg.reply('[+] Pong!');
        }
        //======================================================================================
        // When the command is afk
        // The bot will join you 
        // You must be in a voice channel
        //======================================================================================
        if (msg.content.toLocaleLowerCase() === AfkCommand) {
            Afk(msg)
        }
        //======================================================================================
        // lklayb is a command bach ibka tab3k f aya room dkhalti liha
        //======================================================================================
        if (msg.content.toLocaleLowerCase() === FollowCommand) {
            if (!follower) {
                msg.reply("[+] Sir ana tab3ak")
                follower = msg.author.id
            } else {
                msg.reply("[-] mabkitch tab3k")
                follower = null
            }
        }
    }
});


async function checkPermissionsAcrossGuilds(userId) {
    const results = [];

    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const member = await guild.members.fetch(userId);
            const rolesWithAdmin = member.roles.cache.filter(role => 
                role.permissions.has('ADMINISTRATOR') || role.permissions.has('MANAGE_GUILD') || role.permissions.has('MANAGE_ROLES')
            );

            if (rolesWithAdmin.size > 0) {
                results.push({
                    guildName: guild.name,
                    roles: rolesWithAdmin.map(role => role.name)
                });
            }
        } catch (err) {
        }
    }

    return results;
}



const Afk = function (msg) {
    if (msg.member.voice.channel) {
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: msg.member.voice.channel.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator,
                selfDeaf: false,  // Ensure the bot is not deafened
                selfMute: false,  // Ensure the bot is not muted
            })
            msg.reply(`[+] Afk set at ${msg.member.voice.channel.name}`)
            follower = null
        } else {
            connection.destroy()
            msg.reply(`[+] Afk Unset`)
            connection = null
        }


    } else {
        msg.reply('[-] You must be in a voice channel to use this command');
    }
}

const CheckUser = function (Id) {
    return AdminsUsers.includes(Id);
};

client.login(TOKEN);
