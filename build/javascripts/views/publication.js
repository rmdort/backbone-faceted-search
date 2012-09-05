// View

App.views.pubView = Backbone.View.extend({
  
  el: '#Publications',
  
  tagName: 'li',        
      
  template: new t($('#publication_template').html()),      
  
  initialize: function(){
    
    _.bindAll(this, 'render');

    this.render();
    
  },
  
  render: function(){

    var self = this;
        
    this.$el.html(this.template.render({
      publications: this.collection.toJSON()
    }));
        
  }
  
});
