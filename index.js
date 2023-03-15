const Discord=require('discord.js');
// Create a new client instance
const client=new Discord.Client({intents: 3276799});
const {ask}=require("./ai.js");
//Config OpenAi

const gTTS=require('gtts');
const fs=require('fs');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
}=require("@discordjs/voice");
const {createReadStream}=require("fs");
const {OpusEncoder}=require("@discordjs/opus");


const connections=new Map();

client.on('ready',() => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
});


client.on('messageCreate',async (message) => {
  if(message.content==='!join') {
    if(message.member.voice.channel) {
      const connection=joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.member.voice.channel.guild.id,
        adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator
      });

      connections.set(message.guild.id,connection);

    } else {
      message.reply('Vous devez d\'abord rejoindre un salon vocal.');
    }
  }
  if(message.content==='!leave') {
    const connection=connections.get(message.guild.id);
    if(connection) {
      connection.destroy();
      connections.delete(message.guild.id);
    } else {
      message.reply("Le bot n'est pas dans un salon vocal.");
    }
  }

  if(message.content.startsWith('!speak')) {
    const text=message.content.slice(7); // Retirer '!speak ' du message
    const connection=connections.get(message.guild.id);
    if(connection) {
      speak(connection,text);
    } else {
      message.reply("Le bot n'est pas dans un salon vocal.");
    }
  }

  if(message.mentions.users.first()===client.user) {
    const prompt=message.content.slice(message.content.indexOf(" ")+1); // les questions des gens
    console.log(prompt);
    const answer=await ask(prompt);// la reponse d'elephant
    
    const voiceState = message.guild.voiceStates.cache.find((voiceState) => voiceState.member.id === client.user.id);
    if(voiceState&&voiceState.channel) {
      const connection = connections.get(message.guild.id);
      speak(connection,answer);
      message.reply(answer);
    } else {
      message.reply(answer);
    }
  }

});



async function speak(connection,text) {
  if(!text.trim()) {
    console.log("No text to speak");
    return;
  }
  const gtts=new gTTS(text,"fr");
  const fileName=`tts-${Date.now()}.mp3`;
  gtts.save(fileName,function(err,result) {
    if(err) {
      console.error(err);
    } else {
      const player=createAudioPlayer();
      const resource=createAudioResource(createReadStream(fileName));

      player.on(AudioPlayerStatus.Idle,() => {
        fs.unlinkSync(fileName); // Delete the file when the player is idle
        player.stop();
      });

      player.play(resource);
      connection.subscribe(player);
    }
  });
}






client.login('TOKEN_DISCORD');
