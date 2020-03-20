$(document).ready(function(){	
	var pageUrl = window.location.href;
	var dataUrl = '';

	if (pageUrl.indexOf('search') > -1) {
  		dataUrl = "https://adnanmahmud.github.io/reports/resources-search/data-search.json";
	} else if (pageUrl.indexOf('moline') > -1) {
  		dataUrl = "https://adnanmahmud.github.io/reports/resources-search/data-moline.json";
	} else if (pageUrl.indexOf('decatur') > -1) {
  		dataUrl = "https://adnanmahmud.github.io/reports/resources-search/data-decatur.json";
	}
	else {
	  return false;
	}


	var arrayReturn = [];
	$.ajax({
		url: dataUrl,
		async: true,
		dataType: 'json',
		success: function (data) {

			for (var i = 0, len = data.length; i < len; i++) {
				var id = (data[i].url).toString();				
				arrayReturn.push({'value' : data[i].title, 'data' : id, 'source' : data[i].source});
			}
			loadSuggestions(arrayReturn);
			//console.log(countries);
			//console.log(arrayReturn);
		},
		error: function(xhr, status, error){
         		var errorMessage = xhr.status + ': ' + xhr.statusText
         		alert('Error - ' + errorMessage);
     		}

	});

});
 
function loadSuggestions(options) {

   //var availableTags = [{label:"Basic", the_link:"http://www.msn.com"},{label:"C++", the_link:"http://www.ibm.com"},{label:"Fortran", the_link:"http://www.yahoo.com"}];

    $.widget( "custom.catcomplete", $.ui.autocomplete, {
      _create: function() {
        this._super();
        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
      },
      _renderMenu: function( ul, items ) {
        var that = this,
          currentCategory = "";
        $.each( items, function( index, item ) {
          var li;
          if ( item.source != currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>Source: " + item.source + "</li>" );
            currentCategory = item.source;
          }
          li = that._renderItemData( ul, item );
          if ( item.Source ) {
            li.attr( "aria-label", item.source + " : " + item.label );
          }
        });
	ul.append( '<li class="ui-menu-item"></li>' );
	ul.append( '<li class="ui-menu-item" aria-label="  Search Moline website" id="website-url"><a href="http://moline.il.us/Search?searchPhrase=' + $( '#tags' ).val() + '" target="_blank">Search Moline website for "' + $( "#tags" ).val() + '"</li>' );
      }
    });

    $( "#tags" ).catcomplete({
      delay: 0,
      source: options,	
      select: function(e,ui) { 
      //console.log(ui);    // When you click (select) the ui object is returned , as well as the event
       // You can get at the returned results ( the object via . (dot)  notation )
      // location.href = ui.item.the_link;
	window.open(ui.item.data, '_blank');
	$(this).val(''); 
	$( "#spMoline" ).remove();
	return false;
      }
    });

$('#tags').focus(function(){
        $(this).val('');
        $(this).keydown();
    }); 

}
