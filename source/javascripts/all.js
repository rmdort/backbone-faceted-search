// Avoid `console` errors in browsers that lack a console

function log(msg){ if((window.console && console.log)) console.log(msg) };

function getUrlVars()
{
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        //vars.push(hash[0]);
        //vars[hash[0]] = hash[1];
        
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
	  
	  search: function(params){
	    
	    var arr = {};
	    
	    var self = this,
	        newcollection = this;
	    
	    _.each(params, function(val, key){
	      
	      var pattern = new RegExp(val, "gi")
	      
	      newcollection = _(newcollection.filter(function(doc){        
          pattern.lastIndex= 0; // Reset the last Index          
          return pattern.test(doc.get(key));        
        }));
	      
	    });
	    
	    return newcollection;

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
	      
	      var self = this,
	          $this = $(e.target),
	          $parent = $this.parent(),
	          _category = $parent.data("facet-category"),
	          _name = $parent.data('facet-name'),
	          _thisHash = $this.attr("href");
	      
	      if($parent.hasClass('active')){
	        
	        $parent.removeClass("active").siblings().removeClass("disabled");
	        
	      }else{
	       
	       $parent.siblings().removeClass("active").addClass("disabled").end().addClass("active").removeClass("disabled");
	        
	      }	      	      
	      
	      // Loop Through all Active Facets
	      
	      var _hash = [];
	      
	      $(self.el).find('.active').each(function(){
	        
	        var ele = $(this),
	            category = ele.data("facet-category"),
	            name = ele.data("facet-name");
	        
	        _hash.push(category+"="+escape(name));
	            
	      });
	      if(_hash.length){
	        window.location.hash="search?"+_hash.join('&');
	      }else{
	        window.location.hash="";
	      }
	      	      	      

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
	        results = itemcollection.search(params);
	    
	    new APP.view.ItemView({model: results }).render();
	    
	    // Update Class in facets
	    
	    var $facet = $(Facetview.el),
	        $facets = $facet.find('li');
	        
	    $facets.removeClass("active").removeClass("disabled");
	    
	    _.each(params, function(val, key){

	      $facets.filter(function(i, ele){
	        return $(ele).data("facet-category") == key && $(ele).data("facet-name") == val;
	      })
	      .addClass("active")
	      .siblings()
	      .addClass("disabled");
	      
	    });
	    
	    
	    // Loop Through all the Facets and Update Count
	    
	    //log(results);
	    
	    
	    
	    
	  },
	  
	  index: function(){
	    new APP.view.ItemView({model: itemcollection}).render();
	    
	    $(Facetview.el).find('li').removeClass("active disabled");
	    
	  }
	  
	
	  
	});
	
	
	var navigationRouter = new NavigationRouter();
    
	
	
	
});