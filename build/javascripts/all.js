// Avoid `console` errors in browsers that lack a console

function log(msg){ if((window.console && console.log)) console.log(msg) };

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function arrayCache(category, name, items){
  return {
    facet: category,
    name: name,
    items : items
  }
};

///////////////////////////////////////////////


$(function(){
  
  var APP = {
		model:{},
		view:{},
		collection:{},
		router:{}
	};
	
	// Create a Model for Items.
	
	APP.model.Item = Backbone.Model.extend({
	  
	});
	
	// Create a Item Collection
	
	APP.collection.ItemCollection = Backbone.Collection.extend({
	  model: APP.model.Item,
	  
	  url: 'javascripts/items.json',
	  
	  search: function(param, category){

	    if(param == "") return this;
	    
	    var pattern = new RegExp(param, "gi");
	    	    
	    return _(this.filter(function(doc){        
        pattern.lastIndex= 0; // Reset the last Index
        return pattern.test(doc.get(category));
        
        
      }));
      
	  },
	  
	  searchFacet: function(category){
	    
	    var pattern = new RegExp("Lisp"),
	        continent = new Array();
	    
	    _(this.filter(function(doc){        
        
        if(doc.get(category)) continent.push(doc.get(category));
        
      }));
      
      return _.union(continent);
	  },
	  countFacet: function(category, name){
	    
	    //var pattern = new RegExp(name, "gi");
	    
	    return _(this.filter(function(doc){
	      //log(name);
	      return doc.get(category) == name;
	      //return $.inArray(name, doc.get(category)) > -1
	    }));
	    
	  }
	  
	});
	
	var itemcollection = new APP.collection.ItemCollection();
	itemcollection.fetch();
	
	
	// Create a View
	
	APP.view.ItemView = Backbone.View.extend({
	  
	  el: $('#Items'),
	  template: $('#document_template').template(),
	  
	  initialize: function(){
	    
	    var self = this;
	          
      itemcollection.bind("reset", function(data){        
        self.render();                        
        
        //Backbone.history.start();
	    });	    	    
	    
	  },
	  
	  render: function(){	    	    

	    
	    $(this.el).html($.tmpl(this.template, this.model.toArray()))
      return this;            
	    
	  }
	  
	});
	
	
	var Appview = new APP.view.ItemView({model: itemcollection});
	
	// Build Facets
	
	APP.view.FacetView = Backbone.View.extend({
	  
	  el: $('#Facets'),
	  
	  events: {	    
	    'click .facet': "facetClick"
	  },
	  
	  facets: [{
     "category" : "category",
     "heading" : "What Category"
     },
     {
      "category" : "continent",
      "heading" : "Which Continent"
      },
      {
       "category" : "language",
       "heading" : "Programming Language"
    }],
	  
	  initialize: function(){
	    
	    var self = this;
	    
	    itemcollection.bind("reset", function(){
	      
	      _.each(self.facets, function(f){
	        
	        var list ='<div class="column"><h3>'+f.heading+'</h3><ul>';
	            results = itemcollection.searchFacet(f.category),
	            count = 0;    		        	
	        
	        _.each(results, function(facet){
	          //log(itemcollection.countFacet(f.category, facet));
	          count = itemcollection.countFacet(f.category, facet).size();
	          
	          list+='<li data-facet-name="'+facet+'" data-facet-category="'+f.category+'"><a class="facet" href="#search?'+f.category+'='+facet+'">'+facet+' ('+count+')</a></li>';
	          
	        });
	        
	        $(self.el).append(list+'</ul></div>');
	      });
	      
	      Backbone.history.start();
	      
	    })
	    
	  },
	  
	  facetClick: function(e){
	    
	    // To add mutliple query vars to the URL
	      
	      var $this = $(e.target),
	          _category = $this.parent().data("facet-category"),
	          _name = $this.parent().data('facet-name');

	      window.location.hash="search?"+_category+"="+_name;

	    e.preventDefault();
	  }
	  
	});
	
	Facetview = new APP.view.FacetView();
	
	
	// Router
	
	var NavigationRouter = Backbone.Router.extend({
	  
	  routes:{
	    '': "index",
	    'search': "filterFacet"
	  },
	  
	  initialize: function(){
	    
	    //this.facetView = new APP.view.ItemView({model: itemcollection }); 	    	    	    
	    
	    this._cache = [];
	    
	  },	  
	  filterFacet: function(params){
	    
	    var self = this,
	        _collection = itemcollection;
	    
      _.each(params, function(val, key){        

        var _found = _.filter(self._cache, function(cache_val, cache_key){
  	        return cache_val.facet == key && cache_val.name == val;  	          	        
  	    });

        if(!_found.length) {
          _collection = itemcollection.search(val, key);

          self._cache.push(arrayCache(key, val, _collection ));          
        }else{
          
          _collection = _found[0].items;
        }
        
        //log(self._cache[0].items.toArray());
        
        new APP.view.ItemView({model: _collection }).render()
        
        
        
        //log(self._cache);
        
        //
        
      });
	    //new APP.view.ItemView({model: itemcollection.search(facet, category) }).render();
	    
	    //log(self._cache);
	    
	  },
	  
	  index: function(){
	    
	  }
	  
	
	  
	});
	
	
	var navigationRouter = new NavigationRouter();
    
	
	
	
});
