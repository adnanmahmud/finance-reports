
   $.getJSON('topics-list.json', function(src){
       var data = src.map(function(v){
                        return {
                             value: v.Details, 
                             label: v.Topic 
                        }; 
                     });

        $("#search").autocomplete({
            source: data,
            select: function(event, ui){
                 $(".textmain").html(ui.item.value);                 
            },
            close: function(event, ui)  {
                  //$('#search').data().autocomplete.term = null;
		$("#search").val(" ");
      }
        }).autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<div><span>" + item.label + "</span><br>" + item.value.substring(0, 100) + "</div>" )
        .appendTo( ul );
    };
   });

$("#search").click(function () {
    $("#search").val("");
});