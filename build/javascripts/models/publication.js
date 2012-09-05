//

var App = {
  model: {},
  views: {},
  collection: {},
  router: {}
};


// Create a publication Model

App.model.Pub = Backbone.Model.extend({
  
  defaults:{
    "title": "",
    "type": "",
    "topic": "",
    "image": "",
    "video_url": "",
    "story": "",
    "release_date": ""
  },
  
  url: 'items.json',
  
  parse: function(response){
    
    var myResponse = {};
    _.each(response, function(value, key){
      myResponse[key] = new Backbone.Collection(value);
    });

    return myResponse;

  }  
});
