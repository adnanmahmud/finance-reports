/*
$(function() {
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
          if ( item.Source != currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>Source: " + item.Source + "</li>" );
            currentCategory = item.Source;
          }
          li = that._renderItemData( ul, item );
          if ( item.Source ) {
            li.attr( "aria-label", item.Source + " : " + item.label );
          }
        });
      }
    });

    $( "#tags" ).catcomplete({
      source: resources,	
      select: function(e,ui) { 
      //console.log(ui);    // When you click (select) the ui object is returned , as well as the event
       // You can get at the returned results ( the object via . (dot)  notation )
      // location.href = ui.item.the_link;
	window.open(ui.item.data, '_blank');
	$(this).val(''); 
	
	return false;
      }
    });

$('#tags').focus(function(){
        $(this).val('');
        $(this).keydown();
    }); 

$("#tags").on("input propertychange", function () {
	$( "#spMoline" ).remove();
    var html = '<span id="spMoline">Search Moline website for <a href="http://moline.il.us/Search?searchPhrase=' + $( "#tags" ).val() + '" target="_blank">' + $( "#tags" ).val() + '</a></span>';
	$('.ui-widget').append(html);	
});

});
*/


$(function() {
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
          if ( item.Source != currentCategory ) {
            ul.append( "<li class='ui-autocomplete-category'>Source: " + item.Source + "</li>" );
            currentCategory = item.Source;
          }
          li = that._renderItemData( ul, item );
          if ( item.Source ) {
            li.attr( "aria-label", item.Source + " : " + item.label );
          }
        });
	ul.append( '<li class="ui-menu-item"></li>' );
	ul.append( '<li class="ui-menu-item" aria-label="  Search Moline website" id="website-url"><a href="http://moline.il.us/Search?searchPhrase=' + $( '#tags' ).val() + '" target="_blank">Search Moline website for "' + $( "#tags" ).val() + '"</li>' );
      }
    });

    $( "#tags" ).catcomplete({
      source: resources,	
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

});
