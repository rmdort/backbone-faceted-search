// Facet View

App.views.facetView = Backbone.View.extend({
  
  el: '#Facets',
  
  template : new t($('#facet_template').html()),
  
  events: {
    'click .facet': 'filterResults'
  },
  
  initialize: function(){
    
    this.renderFacet();
    
  },
  
  renderFacet: function(){
    
    var self = this;
    
    _(this.model.toJSON()).each(function(facet){
      
      // Get Unique Facets 
      
      var _values = self.getFacet(facet.facet);
      
      self.$el.append(self.template.render(
        {
          heading: facet.heading,
          values: _values,
          topic: facet.facet
        }
      ));
      
    });
    
  },
  
  getFacet: function(facet){
    
    var self = this;
          
    var pattern = new RegExp("Lisp"),
    	        _array = new Array();

    _(this.collection.filter(function(doc){        

      if(doc.get(facet)) _array.push(doc.get(facet));
      
    }));
    
    return _.uniq(_.flatten(_array)).sort();
    
  },
  
  filterResults: function(e){
    
    //console.log($('.facet').filter('not(".disabled")'));
    
    var self = this,
        $this = $(e.target),
        $parent = $this.parent();
        
    if(!$this.hasClass('disabled')){
        
        if($this.hasClass('active')){
  
          $this.removeClass("active");
  
        }
        else{
  
          $parent
            .siblings()
            .find('.facet')
            .removeClass("active");
          
          // Added Zepto Support : Removed: end()
          
          $parent
            .find('.facet')
            .addClass("active");
        
        }
    
        // Loop Through all Active Facets

        var _hash = [];

        self.$el.find('.active').each(function(){
          
          var ele = $(this),
              category = ele.attr("data-facet"),
              name = ele.attr("data-facet-name");

          _hash.push(category+"="+escape(name));

        });

        if(_hash.length){
          window.location.hash="!/search?"+_hash.join('&');
        }else{
          window.location.hash="!/";
        }
        
    }
        
    e.preventDefault();
    
  }
  
});