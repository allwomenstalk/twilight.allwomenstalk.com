const tags = require('./tags.js')
const { marked } = require('marked');

module.exports = function (item) {
      //post process
      const temp = {};
      temp.id = item._id;
      temp.slug = item.post_name;
      temp.category = [item.super_categories[0]];
      if(item.keywords && item.keywords.length>0) {
        temp.keywords = item.keywords
                          .sort((a, b) => (a.impressions > b.impressions) ? 1 : -1)
                          .slice(0,5)
                          .map(kw=>kw.query)
      }

      //special tags check 
      if (item.tags.includes('_noads')) { temp.noads = true }
      //tags filter and formating 
      temp.tags = item.tags
          .filter(tag=>tag.slice(0,1)!=="_")
          .filter(tag=>tags.includes(tag))
          .map(tag=> tag = {name:tag.replace(/-/g," "), tag:tag});

      temp.host = item.host?item.host:(item.blog=="aws"?"allwomenstalk.com":item.blog+".allwomenstalk.com")
      // temp.host = item.host
      
      temp.url = `https://${temp.host}/${item.post_name}`;
      temp.amp_url = `https://${temp.host}/${item.post_name}/amp.html`;
      temp.title = item.post_title.replace(/[^a-zA-Z0-9_.-\s'"\?]*/g,''); //removeing all emoji
      temp.date = item.post_date.toISOString();
      temp.modified = new Date().toISOString();
      temp.author = { name: item.author.first_name.replace('_', ''), id: item.author._id };
      temp.image = item.image_url;
      temp.comment_count = item.comment_count;

      // collections 
      if (item.classify&&item.classify.collection) {
        temp.collection = item.classify.collection?item.classify.collection[0]:[];
        temp.collection = temp.collection.map(el=>{
          return {
            name:el,
            slug:slugify(el)}
        })
        collectionslugsarr = temp.collection.map(el=>el.slug) // save collection slugs for later use
        temp.collection.forEach((c,i)=> {
          c.slug = collectionslugsarr.slice(0,i+1).join("/")
        })
      }



      sizearr = GetImageSize(temp.image)

      temp.imagesize = {
        width:sizearr[0],
        height:sizearr[1]
      };
    
      temp.rating = 5-Math.round(Math.random())
      temp.ratingstars = "★".repeat(temp.rating)+"☆".repeat(5-temp.rating)
      temp.imagesource = item.image_url.replace('.jpg','.json')
      temp.imageresize = item.image_url.replace('img.', 'resize.img.');
      temp.imagewebp400  = item.image_url.replace('//img.allw.mn/', '//resize.img.allw.mn/filters:format(webp)/filters:quality(70)/400x400/');
      temp.imagewebp800  = item.image_url.replace('//img.allw.mn/', '//resize.img.allw.mn/filters:format(webp)/filters:quality(70)/800x800/');
      temp.imagewebp1200 = item.image_url.replace('//img.allw.mn/', '//resize.img.allw.mn/filters:format(webp)/filters:quality(70)/1200x1200/');

      // converting contet to string for processing 
      item.post_content = item.post_content.join('')

      // crosslinks
      
      if (item.crosslinks) {
        // console.log('crosslinks:',item.crosslinks)
        uniquetargets = [...new Set(item.crosslinks.map(el=>el.page))]

        for (target of uniquetargets) {
          obj = item.crosslinks.find(el=>el.page==target)
          item.post_content = item.post_content.replace(obj.link.original,obj.link.replace)
        }
      }
      
      // meta description 
      if (item.meta_description) {
        temp.description = item.meta_description
      }

      //makig list for TOC
      var toc = item.post_content
        .match(/<h2>.*?<\/h2>/g)
                    
      if (toc && toc.length > 0 ) {
        temp.toc = [...toc.map(i=>i
          .replace(/<\/?h2>?([0-9]+\.)?/g,'') //remving h2 nad nubmer 
          .replace(/<[^>]*>/g,'') // removing anything else like A tag
          .trim())];
        
        // slice long tolc 
        if (temp.toc.length > 10) {
          temp.toc = temp.toc.slice(0,10)
          temp.toc.push("More ...")
        }
        // item.post_content = item.post_content.replace(/<h2>/,tochtml+"<h2>")
        
        // use table fo content for meta description if it's not set before
        if (!temp.description) {
          temp.description = toc
            .map(i=>i.replace(/<\/?h2>?([0-9]+\.)?/g,'').trim())
            .slice(0,5)
            .join(" • ") + " • More ... "
        }
      } 

      

      temp.content = item.post_content 
        //.replace(/<div class=\"embed\" data-media-type=\"instagram\" data-media-url=\"https:\/\/www.instagram.com\/p\/(.*?)\/">(.*?)?<\/div>/g, 
        //  '<amp-instagram data-shortcode="$1" width="1" height="1" layout="responsive"></amp-instagram>')
        .replace(/(<h2.*?>)\s*(\d*)\./g,'$1<span class="pointnum">$2</span>') //make big point numbers
        .replace(/<div class=\"embed\" data-media-type=\"youtube\" data-media-url=\".*?v=(.*?)\".*?<\/div>/g,
        '<amp-youtube data-videoid="$1" layout="responsive" width="480" height="270"></amp-youtube>')//making youtube embed
        .replace(/<div class=\"embed\" data-media-type=\"instagram\" data-media-url="https?:\/\/(www\.)?instagram\.com\/p\/(.*?)\/.*?">(.*?)?<\/div>/g, 
        '<p><amp-instagram data-shortcode="$2" width="1" height="1" layout="responsive"></amp-instagram></p>')
        .replace(/<iframe(.*?)><\/iframe>/g,"<amp-iframe $1 layout=\"responsive\"></amp-iframe>")
        

        // .replace(/(<img[^>]+) class=".*?"(.*?\/>)/g,"$1$2") //removing class for all images
        // .replace(/(<img[^>]+)(?<!\/)>/g,"$1/>") //close all unclosed img tags

          // temp.content = item.post_content;
      //adding Table of content
      
      temp.contentamp = temp.content
        .replace(/<img([^>]+)\/>/g,"<amp-img $1 layout=\"responsive\"><noscript><img $1 ></noscript></amp-img>")
        .replace(/src="(.*?)(\d*)x(\d*)\.(jpg|gif|png)"/g, 'src="$1$2x$3.$4" width="$2" height="$3"')
        .split(/(?=<h2)/g)

      // extra convertion for non amp pages only 
      temp.content = temp.content
        // lazy loading for images
        .replace(/src="(.*?)(\d*)x(\d*)\.(jpg|gif|png)"/g, 'src="$1$2x$3.$4" width="$2" height="$3" loading="lazy"')
        // adding wepb for images
        .replace(/(<img src=")https:\/\/img\.allw\.mn\/content\/([^"]+)(\.jpg")/g, 
                  '$1https://resize.img.allw.mn/filters:format(webp)/filters:quality(70)/content/$2$3');

      // breaking into pages
      temp.content = temp.content
        // .replace(/<img ([^>]+)\/>/g, "<img $1 class='rounded-lg my-2' loading='lazy' decoding='async'/>") //adding lazy and async 
        // .replace(/<img src="(.*?)(\d*)x(\d*)\.(jpg|png)"(.*?)\/>/g,
        //   '<picture><source type="image/webp" srcset="$1$2x$3.$4"><img src="$1$2x$3.$4"$5></picture>')
        // .replace(/type="image\/webp" srcset="https:\/\/img\.allw\.mn\//g,
        //   'type="image\/webp" srcset="https://resize.img.allw.mn/fit-in/600x0/filters:format(webp)/filters:quality(70)/')
        .split(/(?=<h2)/g)

      // if(item.elaborate) console.log(item.elaborate)
      temp.elaborate = {}
      temp.content.forEach((page,index) => {
        //filter by pageNumber
        extra = item.elaborate.filter(i=>i.pageNumber == index)?.[0]
        html = extra?.response?.[0]?marked(extra?.response?.[0]):''
        if (html) temp.elaborate[index] = html
      })

      // temp.url = `${
      //   (item.blog === 'aws'
      //     ? 'https://allwomenstalk.com/'
      //     : `https://${item.blog}.allwomenstalk.com/`) + item.post_name
      // }/`;

      temp.url = `https://${item.host}/${item.post_name}/`;

      temp.SchemaObjects = [] //additional schemas

      // video objects 
      temp.content.forEach((page,index) => {
        
        if (page.includes('amp-youtube')) {
          temp.ampyt = true
          subtitle = page.match(/span>(.*?)</)
          videoid = page.match(/videoid=\"(.*?)\"/)[1]

          VideoObject = {
            "@context":"https://schema.org",
            "@type":"VideoObject",
            "name":subtitle?subtitle[1].trim():'none',
            "description":subtitle?subtitle[1].trim():'none',
            "thumbnailUrl":`https://img.youtube.com/vi/${videoid}/0.jpg`,
            "embedUrl":`https://www.youtube.com/embed/${videoid}`,
            "uploadDate":temp.date
          }
          temp.SchemaObjects.push(JSON.stringify(VideoObject,null,4))
        }
      })
      //console.log(temp.SchemaObjects)

      // related videos 

      if (item.videos) {
        temp.videos = item.videos
        temp.videos.forEach(video => {
          video.items = video.items.slice(0,2)
        })
        temp.ampyt = true
        temp.amp = true
        // console.log('videos inside:',temp.videos.length)
      }
      
      // recipe schema 
      if (item.tags.includes('_schemarecipes')) {
        
        recipeSchemaObj = {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "headline": temp.title,
              "name": temp.title,
              "image": [
                temp.imageresize+"?width=1000&height=562", //16x9 ratio
                temp.imageresize+"?width=1000&height=750", //4x3 ratio
                temp.imageresize+"?width=1000&height=1000"], //1x1 ratio
              "genre": "food",
              //"keywords": temp.keywords.map(tag=>tag.name),
              "mainEntityOfPage": "true",
              "url": temp.url,
              "datePublished": temp.date,
              "dateCreated": temp.date,
              "dateModified": temp.modified,
              "description": temp.description,
              "publisher": {
                   "@type": "Organization",
                   "name": "All Women's Talk",
                   "url": "https://allwomenstalk.com/",
                   "logo": {
                        "@type": "ImageObject",
                        "url": "https://storage.googleapis.com/aws-static/images/logo-amp.png"
                   }
              },
              "author": {
                   "@type": "Person",
                   "name": temp.author.name
              },
              "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": Math.floor(Math.random() * (50 - 40 + 1))/10 + 4,
                  "ratingCount": Math.floor(Math.random() * (60 - 30 + 1)) + 30
              }
         }
        temp.SchemaObjects.push(JSON.stringify(recipeSchemaObj,null,4))
      }


      // list schema 
      if (toc && toc.length > 0) {
        listSchemaObj = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": 
          toc
          .map(i=>i.replace(/<\/?h2>?([0-9]+\.)?/g,'').trim())
          .map((item,index)=> {
            return {
              "@type": "ListItem",
              "position": index+1,
              "item": {
                  "@type": "Thing",
                  "url": temp.url+"#"+(index+1),
                  "name": item
              }
            }
          })
        }
        temp.SchemaObjects.push(JSON.stringify(listSchemaObj))
      }

      if (temp.content.join('').includes('amp-instagram')) temp.ampig = true
      if (temp.content.join('').includes('amp-iframe')) temp.ampif = true
      if (temp.content.join('').includes('<amp-')) temp.amp = true 

      temp.related = {}
      temp.related.posts = []
      
      if (item.related && item.related.length > 0) {
        temp.related.posts = item.related
          //.sort( () => .5 - Math.random() )
          //.slice(0,5)
          .map(item => {
            obj = {}
            obj.title = item.post_title.replace(/[^a-zA-Z0-9_.-\s]*/g,'');

            if (item.keywords && item.keywords.length>0) {
              obj.title = capitalize(item.keywords[0].query)
            }
            if (item.image_url) {
              obj.image = item.image_url.replace('img.allw.mn','resize.img.allw.mn')+"?width=100&height=100";  
              obj.webp = item.image_url.replace('img.allw.mn/','resize.img.allw.mn/filters:format(webp)/filters:quality(70)/')+"?width=100&height=100";  
            }
            obj.url   = item.url;

            if (item.super_categories) obj.category = item.super_categories[0]
            return obj
          }).sort( () => .5 - Math.random() ) //shuffle order of related posts by
      }

      // split to 2 section 
      // temp.related.inline = temp.related.posts.slice(0,2)
      // temp.related.posts = temp.related.posts.slice(2,8)

      //comments list 
      temp.pagecomments = Array (temp.content.length) // array for inline comments
      item.comments.forEach((el,i)=>{
        anchor = /^#(\d*)[\. ]/
        if (el.comment_content.match(anchor)) { //inline comments, one per page
          //console.log(el.comment_content)
          pageindex = el.comment_content.match(anchor)[1]
          temp.pagecomments[pageindex] = `<div class="mt-4 text-sm">
            <b>${el.comment_author.split(' ')[0]}</b> 
            <span class="opacity-70">${el.comment_content.replace(anchor,'').slice(0,50)}<a href="#comments">...</a></span>
            </div>`
        }
        el.comment_author = el.comment_author.split(' ')[0]
        el.comment_content = el.comment_content
                        .replace(/^#([0-9]{1,2})/,
                        "<a href=\"#$1\" class=\"rounded bg-pink-600 text-white text-white p-1\">#$1</a>")
        answers = item.comments.filter(comment=>comment.comment_parent==el._id+'')
        if(answers.length>0) {
          el.replies = []
          item.comments
          .filter(comment=>comment.comment_parent==el._id+'')
          .forEach(reply => {
            el.replies.push(reply)
            var indexofreply = item.comments.findIndex(el=>el._id===reply._id)
          })
          
        }
      })
      
      // comments
      temp.comments = item.comments.filter(el=>!el.comment_parent)
      temp.content.map(el=>{
        return {
          page: el,
          related:temp.related
        }
      })

      // faq 
      // console.log('faq',item.faq, item.faq.length)
      if (item.faq.length > 0) temp.faq = item.faq.shift().list
      // if (item.seo && item.seo.clicks == 0 && item.seo.ga_visits == 0) temp.noads = true 

      return temp
}    

function GetImageSize(imgurl) {
  var imagename = imgurl.split("/").pop().split(".")[0]
  var sizearr = []
  imagename.split("_").length == 2 ? sizearr = imagename.split("_")[1].split("x") : sizearr = imagename.split("_").slice(1,3)
  return sizearr
}

function capitalize(word) {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
}

function slugify(str) {
  // console.log('str:',str)
  return str.toLowerCase()
  .replace(/\s+/g, '-')           // Replace spaces with -
  .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
  .replace(/\-\-+/g, '-')         // Replace multiple - with single -
  .replace(/^-+/, '')             // Trim - from start of text
  .replace(/-+$/, '')
}