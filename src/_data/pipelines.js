const fs = require('fs');
var ObjectId = require('mongodb').ObjectId;


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
  }
]

pipeline_filter = [
   {
    '$match': {
      // '_id': ObjectId('604854b781118707f2732712')
      '_id': {$in: [new ObjectId('54f146bf29ee86141a496042'),new ObjectId('604854b781118707f2732712')]}
      // 'post_content': new RegExp('<li>')
    }
  }
]

pipeline_related_classify =[
  {

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
      comment_count: {$gt: 1000},
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
          "sexy-things-you-can-do-to-him-in-the-bedroom",
          "middle-eastern-recipes-that-are-big-on-flavor-but-easy-to-make"
        ]
      }
    }
  }
]

pipeline_category = [
  {
    '$match': {
      "super_categories":{$in:["love"]}
    }
    
  },
  // {'$sample': {size:100}}
]
if (!process.env.ELEVENTY_PRODUCTION) {
  pipeline_category.push({'$sample': {size:100}})
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