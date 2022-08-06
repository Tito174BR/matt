module.exports = {
   name: "teste",
   aliases: ["p"],
   description: "description",
   category: "category",
   guildOnly: true,
   memberpermissions:"VIEW_CHANNEL",
   adminPermOverride: false,
   cooldown: 5,
   // args: args,
   usage: "<olaa>",
   execute(message, args) {
      message.reply("teste pindago")
   },
};