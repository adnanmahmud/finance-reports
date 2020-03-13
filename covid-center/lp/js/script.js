$(document).ready(function () {
    $(".tabc").click(function () {
        $('.tabc').prop('checked', false);
        $(this).prop('checked', true);
        $("label[for^='tab'").removeClass('bold');
        $("label[for='" + $(this).attr('id') + "']").addClass('bold');
    });
});
$.getJSON('topics-list.json', function (data) {
    function unique(arr) {
        let result = [];

        for (let str of arr) {
            if (!result.includes(str)) {
                result.push(str);
            }
        }

        return result;
    }

    var arrcat = [];


    for (var i = 0; i < data.length; i++) {
        arrcat.push(data[i].Category);
        id = data[i].Topic + data[i].Category + "t";
        id = id.replace(/\s/g, '');
        $(".textmain").after('<div class="text" id="' + id + '">' + data[i].Details + '</div>');
    }

    arrcatu = unique(arrcat);
    arrcatu.sort();

    for (var f = 0; f < arrcatu.length; f++) {
        $(".menu").append('<div class="tab tab' + (f + 1) + '"><input class="tabc" type="checkbox" id="tab' + (f + 1) + '" name="tab-group"><label for="tab' + (f + 1) + '" class="tab-title">' + arrcatu[f] + '</label>  </div> ');

    }
    for (var q = 0; q < data.length; q++) {
        if (data[q].Category == "Category 1") {
            id1 = data[q].Topic + data[q].Category;
            id1 = id1.replace(/\s/g, '');
            $(".tab1").append('<section class="tab-content"><a href="#" class="getcont" id="' + id1 + '">' + data[q].Topic + '</a></section>');

        }


        if (data[q].Category == "Category 2") {
            id1 = data[q].Topic + data[q].Category;
            id1 = id1.replace(/\s/g, '');
            $(".tab2").append('<section class="tab-content"><a href="#" class="getcont" id="' + id1 + '">' + data[q].Topic + '</a></section>');

        }

        if (data[q].Category == "Category 3") {
            id1 = data[q].Topic + data[q].Category;
            id1 = id1.replace(/\s/g, '');
            $(".tab3").append('<section class="tab-content"><a href="#" class="getcont" id="' + id1 + '">' + data[q].Topic + '</a></section>');

        }

        if (data[q].Category == "Category 4") {
            id1 = data[q].Topic + data[q].Category;
            id1 = id1.replace(/\s/g, '');
            $(".tab4").append('<section class="tab-content"><a href="#" class="getcont" id="' + id1 + '">' + data[q].Topic + '</a></section>');

        }

        if (data[q].Category == "Category 5") {
            id1 = data[q].Topic + data[q].Category;
            id1 = id1.replace(/\s/g, '');
            $(".tab5").append('<section class="tab-content"><a href="#" class="getcont" id="' + id1 + '">' + data[q].Topic + '</a></section>');

        }
    }


    $("a[id^='Topic'").click(function () {

        var clickid = $(this).attr('id');
        $("a[id^='Topic'").removeClass('activelink');
        $(this).addClass("activelink");
        var clickidt = clickid + "t";
        $('.textmain').html($("#" + clickidt).html());
        clickid = '';
        clickidt = '';
    });



});
$.getJSON('resources-list.json', function (datalinks) {
    for (var i = 0; i < datalinks.length; i++) {
        $(".links").append(' <li><a title="' + datalinks[i].Tooltip + '" href="' + datalinks[i].URL + '">' + datalinks[i].Label + '</a></li>');
    }
    $(".links").append('<hr>');
});
