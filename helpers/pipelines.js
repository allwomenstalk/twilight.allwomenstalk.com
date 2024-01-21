const fs = require('fs');
var ObjectId = require('mongodb').ObjectId;

// export RealtimePosts view from db to json file
const realtime = require('./aws.realtime.json').map(item=>item.slug);
const faqpost = require('./aws.faq.json').map(item=>new ObjectId(item.post_id["$oid"]));
const related_embeddings = require('./aws.related_annoy.json').map(item=> new ObjectId(item._id));
const related_cluster = require('./aws.related_cluster.json').map(item=> new ObjectId(item._id));
const ids = require('./filter.json');
const { pipeline } = require('stream');

try {
  var filter = JSON.parse(fs.readFileSync('./_filter.json','utf8'))
} catch (err) {
  if (!filter) var filter = [ "aws", "lifestyle", "food", "love", "makeup", "hair", "perfumes", "nails", "inspiration", "beauty", "music", "travel", "gardening", "parenting", "funny", "teen", "fashion", "celebs", "weightloss", "health", "shoes", "movies", "wedding", "money", "streetstyle", "fitness", "diy", "books", "jewelry", "skincare", "diet", "paranormal", "bags", "running", "cooking", "apps", "twilight"] 
}
try {
  var marker = JSON.parse(fs.readFileSync('./_marker.json', 'utf8')); 
} catch (err) {
  var marker = [new Date().toISOString()]
}
if (!marker[0]) {
  console.log('no marker')
  marker = [new Date().toISOString()]
}

// console.log("filter pipe:",filter);
// console.log("marker:",marker);

pipeline_realtime = [
  {
    '$match': {
      'post_name': {$in: realtime}
    }
  }
]

pipeline_marker = [
  {
    '$sort': {
      '_id': -1 
    }
  },
  {
    '$match': {
      //'_id':{ '$lt': new ObjectId(marker[0]) }
    }
  }
]

pipeline_date = [
  {
    '$sort': {
      'post_date': -1 
    }
  },
  {
    '$match': {
      'post_date':{'$lt':new Date(marker[0])}
    }
  }
]

pipeline_sample = [
  {
    '$sample': {'size': 1000}
  }
]

pipeline_recent = [
  {
    '$sort': {
      'post_date': -1 //recently updated posts
    }
  },
  {
    '$limit': 500
  }
]

pipeline_recent_updated = [
  {
    '$sort': {
      'post_modified': -1 //recently updated posts
    }
  },
  {
    '$limit': 2000
  }
]

pipeline_filter = [
   {
    '$match': {
      // '_id': ObjectId('604854b781118707f2732712')
      // '_id': { $in:  ids.map(id=>new ObjectId(id)) },
      'post_name': 'classic-french-desserts-and-puddings-and-sweets-and-cakes-yum-yum',
      
      // 'image_url': new RegExp('_400x400.jpg|_400x300.jpg|720x720.jpg')
      
    },
    
  },
  {"$limit": 100}
]

pipeline_faq = [
  {
    '$match': {
      "_id": {$in: faqpost} 
    }
  }
]


pipeline_related_classify =[
  {

  }
]

pipeline_related_embeddings =[
  {
    '$match': {
      "_id": {$in: related_embeddings} 
    }
  }
]

pipeline_related_cluster =[
  {
    '$match': {
      "_id": {$in: related_cluster} 
    }
  }
]

pipeline_without_h2 = [
  {
    "$match": {
      'post_content': new RegExp('<h2>#5<\/h2>')
    }    
  }
]
  

//testing schema update 
pipeline_recipes = [
  {
    '$match': {
      
      'tags':/_schemarecipe/
    }
  }, /*{
    '$lookup': {
      'from': 'keywords', 
      'localField': 'post_name', 
      'foreignField': 'name', 
      'as': 'keywords'
    }
  }, {
    '$addFields': {
      'clicks': {
        '$sum': '$keywords.clicks'
      }, 
      'impressions': {
        '$sum': '$keywords.impressions'
      }
    }
  }, */
  //{$sample:{size:100}}
]

pipeline_noads = [
  {
    '$match': {
      'tags': '_noads'
    }
  }
]

pipeline_iframe = [
  {
    '$match': {
      'post_content':new RegExp('<iframe'),
    }
  }
]

pipeline_comments100 = [
  {
    $match: {
      comment_count: {$lt: 100},
      post_content:{$not: /iframe/},
      blog: {$in : filter}
    }
  },
  //{'$sample': {size:1000}}
]

pipeline_comments1000plus = [
  {
    $match: {
      comment_count: {$gt: 500},
      post_content:{$not: /iframe/},
    }
  },
  { '$limit':100}
  //{'$sample': {size:100}}
]

pipeline_name = [
  {
    '$match': {
      'post_name': {$in:
        [
          "christmas-crafts-for-adults",
          "ultimate-travel-bucket-list-ideas",
          "new-christmas-traditions-to-consider-starting-this-year",
          "never-buy-candy-again-here-are-diy-versions-you-can-make-at-home"
        ]
      }
    }
  }
]

pipeline_category = [
  {
    '$match': {
      "super_categories":{$in:["food","love","nails","hair","makeup"]}
    }
  },
  {
    $sort: {
      "seo.clicks": -1
    }
  },
  {$limit: 1000}
]


pipeline_host = [
  {
      '$match': {
          '$or': [
              {
                  "host": {
                      $in: [
                          // "inspiration.allwomenstalk.com",
                          'mindfulness.allwomenstalk.com',
                          'gifts.allwomenstalk.com',
                          'interior.allwomenstalk.com',
                          'desserts.allwomenstalk.com',
                          'accessories.allwomenstalk.com',
                          'baking.allwomenstalk.com',
                          'sleep.allwomenstalk.com',
                          'swimwear.allwomenstalk.com',
                          'gadgets.allwomenstalk.com',
                          'bodyart.allwomenstalk.com'
                      ]
                  }
              },
              {
                  'super_categories': {
                      $in: [
                          'mindfulness',
                          'gifts',
                          'interior',
                          'desserts',
                          'accessories',
                          'baking',
                          'sleep',
                          'swimwear',
                          'gadgets',
                          'bodyart'
                      ]
                  }
              }
          ]
      }
  }
]




if (!process.env.ELEVENTY_PRODUCTION) {
  // pipeline_category.push({'$sample': {size:100}})
}

pipeline_seo_noclicks = [
    // {
    //   '$match': {
    //     'seo.clicks': 0, 
    //     'seo.ga_visits': 0,
    //     'seo.impressions': {
    //       '$ne': 0
    //     }
    //   }
    // }, 
    {
    '$sort': {
      'seo.impressions': -1
    }
  }
]

pipeline_noseo = [
  {
    '$match': {
      '$or': [
        // {'seo.impressions': {
        //   '$exists': false
        // }},
        // {'seo.impressions': 0},
        {'host':'mindfulness.allwomenstalk.com'}
      ]
    }
  }, 
  {'$sample': {size:100} }
]

pipeline_seo_top = [
  {
    '$sort': {"seo.clicks":-1}
  },
  {
    '$limit': 1000
  }
]

pipeline_instagram = [
  {
    '$match': {
      'post_content': new RegExp('<amp-instagram')
    }
  }
]
//notes 

/*  
   {
    '$match': {
      //'author':'9a7bf4a7_1491831949_1712',
      //'blog': {$in : filter},
      //'blog': {$in : ["love", "makeup", "hair", "perfumes", "nails", "inspiration", "beauty", "music", "travel", "gardening", "parenting", "funny", "teen", "fashion", "celebs", "weightloss", "health", "shoes", "movies", "wedding", "money", "streetstyle", "fitness", "diy", "books", "jewelry", "skincare", "diet", "paranormal", "bags", "running", "cooking", "apps", "twilight"]},
      //'tags':{$not:/_schemarecipe/}, //keep this to avoid any seo issues
      'tags': '_schemarecipes'
      //'blog': {$in : ["food"]},
      //'post_name': '12-best-ways-to-lose-stomach-fat',
    }
  },
  {
    '$sort': {
      'post_modified': -1 //recently updated posts
    }
  },
  //{$limit: 200},
  //{'$sample': {size:5000}},
  /*
  {
    '$lookup': {
      'from': 'keywords', 
      'localField': 'post_name', 
      'foreignField': 'name', 
      'as': 'keywords'
    }
  }, 
  */

pipeline_ids = [
  {
    '$match': {
      '_id': {$in: ids.map(id=>new ObjectId(id))},
    }
  }
]
