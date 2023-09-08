module.exports = [{
    '$lookup': {
      'from': 'users', 
      'localField': 'author', 
      'foreignField': '_id', 
      'as': 'author'
    }
  }, {
    '$unwind': {
      'path': '$author',
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$lookup': {
          'from': 'related_classify', 
          'localField': '_id', 
          'foreignField': '_id', 
          'as': 'related'
      }
  }, { //removing posts without related with false and keep with true 
    '$unwind': {
      'path': '$related',
      'preserveNullAndEmptyArrays': true 
    }
  }, {
    '$set': {
      'related': '$related.posts'
    }
  },{
    '$lookup': {
      'from': 'comments', 
      'let': {
        'postid': '$_id'
      }, 
      'pipeline': [
        {
          '$match': {
            '$expr': {
              '$and': [
                {
                  '$eq': [
                    '$post', '$$postid'
                  ]
                }, {
                  '$lt': [
                    '$toxisity', 0.5
                  ]
                }
              ]
            }
          }
        },
        {$sort:{comment_date:-1}},
        {$limit:10}
      ], 
      'as': 'comments'
    },
  },{
    '$lookup': {
      from: 'classify',
      localField: '_id',
      foreignField: '_id',
      as: 'classify'
    }
  },{
    '$unwind': {
        path: '$classify',
        preserveNullAndEmptyArrays: true
      }
  },{
    '$lookup': {
      from: 'crosslinks',
      localField: '_id',
      foreignField: 'post_id',
      as: 'crosslinks'
    }
  },{
    '$lookup': {
      from: 'tv',
      localField:"_id",
      foreignField: 'post_id',
      as: 'videos'
    }
  },{
    '$lookup': {
      'from': 'faq', 
      'localField': '_id', 
      'foreignField': 'post_id', 
      'as': 'faq'
    }
  },
  {
    $addFields: {
      postIdString: { $toString: "$_id" }
    }
  },
  {
    $lookup: {
      from: "extensions",
      localField: "postIdString",
      foreignField: "postid",
      as: "elaborate",
    },
  }
]