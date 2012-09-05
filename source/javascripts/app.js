(function($, window){
  
  
  // Create a Router
  
  App.router.searchRouter = Backbone.Router.extend({
    
    routes: {
      ''      : 'index',
      'search': 'filterResults'
    },
    
    initialize: function(){
      
      var self = this;
      
      this.model = new App.model.Pub();
      
      this.model.fetch();            
      
      this.model.bind("change", function(){

        self.publications = self.model.toJSON()['publications'];
        self.facets = self.model.toJSON()['facets'];
        self.per_page = self.model.toJSON()['per_page'];
        
        
        // Render All the Publications
        
        new App.views.pubView({
          collection: self.publications
        });        
        
        // Render All Facets
                        
        new App.views.facetView({
          model: self.facets,
          collection: self.publications
        });
        
        
        // Start The Router Once Fetch is complete 
        
        Backbone.history.start();
                                      
      });  
      
    },
    
    index: function(){
            
      new App.views.pubView({
        collection: this.publications
      });            
      
    },
    
    filterResults: function(params){
            
      // Search and Render the collection      
      
      var _newCollection = this.search(params);      
      
      // Get All the Facets from Param
      
      var _paramsArray = new Array(),
          _paramsValueArray = new Array()
          $facets = $('.facet');
                      
      
      _.each(params, function(value, key){
        _paramsArray.push(key);
        _paramsValueArray.push(value);
      })
      
      // Update The Showing Text
      
      this.updateText(_paramsValueArray);
      
      // Get All the Available Facets
      
      var _facetArray = new Array();
      
      _(this.facets.filter(function(doc){
        
        _facetArray.push(doc.get('facet'));
        
      }));
      
      
      var _excludedFacet = _.without(_facetArray, _paramsArray),
          _availableFacets = new Array();

      
      _.each(_excludedFacet, function(value, key){        
        _newCollection.filter(function(doc){          
          _availableFacets.push(doc.get(value));          
        });        
      });
      
      _availableFacets.push(_paramsValueArray);
      _availableFacets = _.flatten(_availableFacets);
      
      var $f = $facets.removeClass("disabled").filter(function(i, k){
        
        return _.indexOf(_availableFacets, $(this).text()) == -1? true: false;
        
      }).addClass("disabled");
      
      
      // Add Active Class to Selected Items on Page Load
      
      if(_paramsValueArray.length){
      
          
          var $f = $facets.removeClass("active").filter(function(){
          
            return _.indexOf(_paramsValueArray, $(this).text()) != -1? true: false
          
          }).addClass("active");
          
      
      }
      else{
        $facets.removeClass('active disabled');
      }      
      
      new App.views.pubView({
        collection: _newCollection
      });      
      
    },
    
    search: function(params){
      
	    var newcollection = this.publications;
      
      if(_.size(params)){
        
        _.each(params, function(val, key){

  	      var pattern = new RegExp(val, "gi")

  	      newcollection = newcollection.filter(function(doc){        
            pattern.lastIndex= 0; // Reset the last Index          
            return pattern.test(doc.get(key));        
          });

  	    });
  	    
  	    return new Backbone.Collection(newcollection);
      }
      else return newcollection;
      
            
    },
    
    updateText: function(values){
      var $showing = $('#Showing');
      
      if(values.length){
        
        $showing.text('Showing Items in '+ values.join(' + '));
      }
      else{
        $showing.text('Showing All Items');
      }
    }
    
  });
  
  new App.router.searchRouter();
  
    
  
})(jQuery, window);