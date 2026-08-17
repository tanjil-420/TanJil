const axios = require('axios');
const fs = require('fs');
const path = require('path');


module.exports = {
  config: {
    name: "art",
    requiredMoney: 1000,
    aliases: ["animeart", "artstyle", "styleart", "animeconverter"],
    version: "1.0.0",
    author: "Nazrul",
    role: 0,
    description: "Convert images to different art styles (Anime, Ghibli, Manga, etc.)",
    category: "ai",
    usePrefix: true,
    isPremium: false,
    countDown: 10,
    guide: {
      en: "{pn} <style> [reply to image]\n{pn} <style> [image url]\n\nAvailable styles:\n• ghibli - Studio Ghibli style\n• anime - Anime style\n• manga - Manga style\n• blocky - Blocky pixel art\n• chinese-ink - Chinese ink painting\n• minimalist - Minimalist art"
    }
  },

  onStart: async ({ message, event, args }) => {
    const styles = {
      ghibli: 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANa2W+vXedrRNL69qOO2kAyinFACvCnI92dPkhiZYuUz4ziNGVWmjQyZ/1WLtfZqIpDNmdsa6fHRRti5Qh1ehMJPltGo+Cr5HMM2GijVWWBw9mJk0GK7lAYjgJ3WhU9Uf+3G6h60IkRFiP3fwNlT9WdBkyWoU1EjDwAWscxTzxP5C4eifIPbvXx7s5W53crT6bA==',
      anime: 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANYrjQmJ+oEF7rgQawjLCWb+TtSokamC48KVGqY1gXzWhZz3D5YYvD3QRjYmfHTNJpMp62FnhG7bXUuABGRU0h7tOeNua+qtL/l9k8xl54FkNTrOvbeHr0CX3pagD4uAYLB77CcGNjdIXK9otrH59BVNDzUMILDOFxK6ivAuNDX19zvZfDgKMI0/rxkojyuladw==',
      manga: 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANcncfLQOC0nsvWPnYab5J9WXOEbry/uxd7mq+nl8cpWYgGX8eRd9UBT2amxq0VmV/mq3TGfs2OVny5D9fJyE8uftCyOLiy3S69WoF5Q6kty1wQB0DUCmXSCxNf6XYFOo1edHJsrANqlxYQvlE7fcuqrWO+nlApVUi1w1FqBHgqvtbb8tQ+ZuOS4O5tKHrUikfQ==',
      blocky: 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANQynlUeOWEWPXtFZQVm9ze9eD7JHWgYB776oVwnnAjnMDc09YdnTHYCIJ/FNQJ1XD1EbtN7fT973qmsZAyQbvgi0jrYvY8pb0TL9Ucb0uvVZIJAxKXmTu0yNoj5xsk/yaByPlAByqirQDS93FPt3lNfBn0nn/5DJBnauU5SSllZK1BuAiOtK5y4eWjNLBT2+F9rK5fo1oJC7AkRAX+htTWcMQuY0cXPfYARQLYUOcHwbF0o7Y1lKnsgBVHaUGmx+/A==',
      'chinese-ink': 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANXAqlula6QmFJcyeXkezRm5uL3o454Pdx8v3iItk7T83LUa1ugFreuO63Nplxo0aomKBlV04vrw+1zs807J/XoavvfxpwGGwnXEDUG83DucSCIv7hOuulu4EtbHm7k2M8RgNqQ+Cdxhy9v+Ibm3gvJrm+LW9/9ObYos9DQF5xWe7vdG6KPa+0HtHuKGb+CdhJg==',
      minimalist: 'L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucAl/+qryNmYNVy6ndccs12kKvEph2JWqGX7Y3E6K1TIOuuZU7DlC3+XXHt7v6H58zbZqcWX9gRl1eMwWSUMaGTXA63S/FmmHZbzAuWw0EMOiUTD61YPwrfkXMaTGbj/ANcdrJgI4S8aZwd9To23kckE6cZoDRmU28+npLXJ5HnmXRGfcTgAo9+HkGFlzwwluaCxBhymjjk5EsWfkqNxSupctTt95IFHNrEYbq6jkcbv8AQK279uQXFHzVq55lEEcudKrAz22eRbXI16I2V9LO9L3tFwb6XWyxmGgc/EChlygzgXT7bfAp7vdEX0GFPgNuoKFEDdE9Y1vswXs8UG49IdaghvcPHGCBv5xwdVeD4r0nsqBfOjsv/Dl6CfR+o4cehAgJOfD/IDYvg8cemD56Ns='
    };

    const styleNames = ["ghibli", "anime", "manga", "blocky", "chinese-ink", "minimalist"];
    const styleDisplayNames = {
      "ghibli": "Studio Ghibli",
      "anime": "Anime",
      "manga": "Manga",
      "blocky": "Blocky Pixel Art",
      "chinese-ink": "Chinese Ink Painting",
      "minimalist": "Minimalist"
    };
    
    let imgUrl = "";
    let selectedStyle = "";
    
    if (args.length > 0 && styleNames.includes(args[0].toLowerCase())) {
      selectedStyle = args[0].toLowerCase();
      args.shift();
    }
    
    if (event.messageReply?.attachments) {
      const imageAttachments = event.messageReply.attachments.filter(
        att => att.type === "photo" || att.type === "image"
      );
      if (imageAttachments.length > 0) {
        imgUrl = imageAttachments[0].url;
      }
    }
    
    if (!imgUrl && args.length > 0) {
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.match(/^https?:\/\/[^\s]+$/i)) {
          imgUrl = arg;
          break;
        }
      }
    }
    
    if (!selectedStyle) {
      return message.reply(`× Usage:
{pn} <style> [reply to image]\n{pn} <style> [image url]\nAvailable Styles:\n• ghibli - Studio Ghibli style\n• anime - Anime style\n• manga - Manga style\n• blocky - Blocky pixel art\n• chinese-ink - Chinese ink painting\n• minimalist - Minimalist art`);
    }
    
    if (!imgUrl) {
      return message.reply(`× Provide an image!`);
    }

    const ok = await message.reply(`⏳ Processing to ${styleDisplayNames[selectedStyle]} style... Please wait`);
    await message.reaction("⏳", event.messageID);

    try {
      async function animeconverter(imageUrl, style) {
        
        if (!styles[style]) {
          throw new Error('Style not supported');
        }
        
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000
        });
        
        const img = Buffer.from(imageResponse.data).toString('base64');
        
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
          'Content-Type': 'application/json',
          origin: 'https://aienhancer.ai',
          referer: 'https://aienhancer.ai/photo-to-anime-converter'
        };
        
        const create = await axios.post('https://aienhancer.ai/api/v1/r/image-enhance/create', {
          model: 5,
          image: `data:image/jpeg;base64,${img}`,
          settings: styles[style]
        }, {
          headers: headers,
          timeout: 30000
        });
        
        const id = create.data.data.id;
        let attempts = 0;
        
        while (attempts < 60) {
          await new Promise(r => setTimeout(r, 3000));
          
          const r = await axios.post('https://aienhancer.ai/api/v1/r/image-enhance/result', {
            task_id: id
          }, {
            headers: headers,
            timeout: 15000
          });
          
          const data = r.data.data;
          
          if (data.status === 'succeeded') {
            return {
              id,
              style,
              output: data.output,
              input: data.input
            };
          }
          
          if (data.status === 'failed') {
            throw new Error('Style conversion failed');
          }
          
          attempts++;
        }
        
        throw new Error('Conversion timeout');
      }

      const result = await animeconverter(imgUrl, selectedStyle);

      if (!result || !result.output) {
        throw new Error("No output generated");
      }

      const imageResponse = await axios.get(result.output, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const filename = path.join(__dirname, `art_${selectedStyle}_${Date.now()}.jpg`);
      
      fs.writeFileSync(filename, Buffer.from(imageResponse.data));

      await message.unsend(ok.messageID);
      await message.reaction("✅", event.messageID);

      await message.reply({
        body: `🎨 ${styleDisplayNames[selectedStyle]} Style Applied!\n`,
        attachment: fs.createReadStream(filename)
      });

      setTimeout(() => {
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename);
        }
      }, 5000);

    } catch (error) {
      await message.unsend(ok.messageID);
      await message.reaction("❌", event.messageID);
      
      console.error("Art error:", error);
      
      let errorMsg = `× Failed to convert to ${styleDisplayNames[selectedStyle]} style.`;
      
      if (error.message?.includes("timeout") || error.message?.includes("Conversion timeout")) {
        errorMsg = "× Style timeout. Please try again.";
      } else if (error.message?.includes("Style not supported")) {
        errorMsg = `× Style "${selectedStyle}" is not supported.`;
      } else if (error.message?.includes("Style failed") || error.message?.includes("No output generated")) {
        errorMsg = `× Could not convert image to ${styleDisplayNames[selectedStyle]} style.`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = "× Art is unreachable.";
      }
      
      return message.reply(errorMsg);
    }
  }
};