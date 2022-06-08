const { Webhook, MessageBuilder } = require('discord-webhook-node');

const Log = require('./Log')

const https = require('https')

if(global.config.webhook_url === []){
    Log.Error('Discord webhook url cannot be empty, insert it in the config.json file')
    process.exit()
}

const hooks = []
const botSettings = global.config.discord_message_settings;

var setBotName = botSettings.botName && botSettings.botName != "";
var setBotImage = botSettings.botImage && botSettings.botImage != "";

global.config.webhook_url.forEach(x => {
    var hook = new Webhook(x);

    if(setBotName){
        hook.setUsername(botSettings.botName)
    }

    if(setBotImage){
        hook.setAvatar(botSettings.botImage)
    }

    hooks.push(hook)
})

let Discord = {};

Discord.notifyProduct = async ({title, sellerUrl, image, url, variants, status}) => {
    const embed = new MessageBuilder()
    .setTitle((title.toUpperCase()))
    .setAuthor((sellerUrl.toUpperCase()), botSettings.footerImage, url)
    .setColor('#f1c40f')
    .setURL(url);

    var availablesVariants = variants.filter(x => x.available);
    if(availablesVariants.length > 0){
        var sizesDescription = []
        sizesDescription.push("")
        var count = 0
    
        availablesVariants.forEach(x => {
            var toAdd = `${x.title} [[ATC](https://${sellerUrl}/cart/add?id=${x.id})]\n`
            if(sizesDescription[count].length + toAdd.length > 1024){
                sizesDescription.push(toAdd);
                count++;
            }
            else{
                sizesDescription[count] += toAdd;
            }
        })

        sizesDescription.forEach(x => {
            embed.addField('**Sizes**', x, true)
        })
    }

    embed.addField('**Price**', variants[0].price, true)

    if(status.length > 0){
        embed.addField('**Status**', status.join('\n'), true)
    }    

    embed.addField('**Links**', `[[Cart](https://${sellerUrl}/cart)]`, true).setThumbnail(image); 

    if(botSettings.footerDescription && botSettings.footerDescription != "" || botSettings.footerImage && botSettings.footerImage != ""){
        embed.setFooter(botSettings.footerDescription, botSettings.footerImage)        
    }    

    if(botSettings.timeOfNotification){
        embed.setTimestamp()
    }

    hooks.forEach(hook => {
        
        var token = "2013305151:AAHQBR-l5tE5bFVusl7bTQ35e3Yv7Rp_TUc";

        var chat_id = -1001674893008;
        
        var size_list = sizesDescription ?? "Sold Out";
        
        var text =  `[​​](${image}) ***📌 ${title.toUpperCase()}*** %0A 💵 ${variants[0].price} %0A 🌎 ${url} %0A  📐 ${size_list}`;
        
        var sendurl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${text}&parse_mode=markdown&disable_web_page_preview=false`;
        
        https.get(sendurl, (resp) => {  
            
            hook.send(embed);

        }).on("error", (err) => {
            console.log("Error: " + err.message);w
        });
       
    })
}

Discord.info = async (title) => {
    hooks.forEach(hook => {
        hook.info(title);
    })  
}

module.exports = Discord;
