const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Take commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
   const command = require(`./commands/` + file);
   client.commands.set(command.name, command);
}

// Cooldowns
const cooldowns = new Discord.Collection();

// On Ready
client.once('ready', () => {
   console.log('escolha oq quiser que apareça porque é so pra ti msm que aparece!');
});

// On Message
client.on('message', message => {
   if (!message.content.startsWith(config.prefix) || message.author.bot) return;

   const args = message.content.slice(config.prefix.length).split(/ +/);
   const commandName = args.shift().toLowerCase();

   const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

   // se o comando existir ele retorna o que foi definido pra ele retornar
   if (!command) return;

   // essa parametrisação abaixo é pra checar se alguem esecutou um comando no privado do bot
   if (command.guildOnly && message.channel.type !== 'text') {
      return message.reply('Mensagem de sua preferencia');
   }

   // Essa estrutura de decisão abaixo verifica se o argumento requerido existe ou se funciona
   if (command.args && !args.length) {
      let reply = `Mensagem de sua preferencia, ${message.author}!`;

      if (command.usage) {
         reply += `\nMensagem de sua preferencia: \`${config.prefix}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
   }

   // esse if abaixo checak se o tempo de espera do user esta de acordo com o predefinido pelo comando e verifica o tempo de esoera de resposta do user com o bot
   if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
   }

   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 3) * 1000;

   if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
         // Caso o user tente dar um comando logo em seguida ele ira mandar retornar essa msg abaixo
         const timeLeft = (expirationTime - now) / 1000;
         return message.reply(`Mensagem de  ${timeLeft.toFixed(1)} sua preferencia \`${command.name}\` command.`);
      }
   } else {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      // A execução do comando
      try {
         command.execute(message, args);
      } catch (error) {
         console.error(error);
         message.reply('there was an error trying to execute that command!');
      }
   }
});

client.login(config.token);