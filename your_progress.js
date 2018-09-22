/*

Your Progress

*/




/*
全体進捗率の計算
*/
function perLeft() {
    var c = 0; //パーセンテージの合計
    var count = 0; //何個のTodoスライダーがあるかカウント
    $(".bar").each(function(i, element) {
        c = parseInt($(element).text().replace('%', "")) + parseInt(c);
        count++;
    });
    var rest = Math.floor(c / count);


    // トップの数字を更新
    $("#r_persent").html(rest);
    if (rest >= 100) {
        $("#message").html("おめでとうございます！ 全てのタスクが終わりました！");
    } else {
        $("#message").html("");
    }
}




/*

新規登録

*/
$(document).on("click", '#new_todo', function() {
    var del_target = $(this);

    var p_id_name = del_target.parent().find(".p_id").text();

    var new_todo = $('#todo_line').val();
    if (new_todo == '') {
        alert("TODO名を決めてください。");
        return;
    }


    send_data('new_todo', p_id_name, '', new_todo).done(function(result) {
        $('#todo_line').val('');
        makeTodoHtml(p_id_name, result, new_todo);

    }).fail(function(result) {
        alert("failed");
    });
});


/*
エンターキーを押した時も、新規登録ボタンを押されたことにする
*/
$('#todo_line').keypress(function(e) {
    if (e.which == 13) {
        $('#new_todo').trigger("click");
    }
});



/*

新規登録したデータを即表示

*/
function makeTodoHtml(p_id, id, new_todo) {

    var new_line = '';
    new_line += '<!--stuck-->';
    new_line += '  <div class="row">';
    new_line += '    <div class="col m3 s12">';
    new_line += '		<span class="todo_name">' + new_todo + '</span><br>';
    new_line += '		<span id="mes_' + id + '"></span>';
    new_line += '		<span class="del" value="' + id + '"><span class="icon-bin"></span></span>';
    new_line += '			<span class="p_id clearText">' + p_id + '</span></div><!--col s3-->';
    new_line += '<div class="col m9 s12">';
    new_line += '<!-- progress bar -->';
    new_line += '<div class="nprogress-bar orange shine stripes">';
    new_line += '    <span class="bar" style="width:0">0%</span></div>';
    new_line += '<div id="slider"></div>';
    new_line += '<!-- end progress bar -->';

    new_line += '<span class="id clearText">' + id + '</span>';
    new_line += '<span class="p_id clearText">' + p_id + '</span>';

    new_line += '</div><!--/col s9-->';
    new_line += '</div><!--/row-->';

    new_line += '<!--stuck end-->';

	M.toast({html: 'TODOを追加しました'});

    $('#add').after(new_line);
    makeSlider('#slider'); //スライダーを新たに作る、今回だけID指定
    perLeft(); //全体進捗率の更新
    return;
}







/*
削除ボタンをおした時の動作
*/
$(document).on("click", '.del', function() {

    var del_target = $(this);

    　　
    $("#dialog").dialog({

        modal: true,
        buttons: {
            "OK": function() {
                $(this).dialog('close');

                var id_name = del_target.attr("value");
                var p_id_name = del_target.parent().find(".p_id").text();

                send_data('delete_this', p_id_name, id_name, 'delete_this').done(function(result) {
            	    M.toast({html: 'TODOを削除しました'});
                    del_target.closest(".row").toggle(500);
                    del_target.parent().parent().find(".bar").remove();
                    perLeft();
                }).fail(function(result) {
                    alert("削除に失敗しました。一度更新してみてください。");
                });


            }
        }
    });

});





/*
メッセージの表示
*/

function mesDisp(id, result) {
    var id_for_message = "#mes_" + id;
    $(id_for_message).text(result);
}


/*
スライダーの表示
*/
makeSlider();





function makeSlider(selector = '.slider_b') {

    var s_num = $(selector).length;
    var flag = 0; //数え上げよう

    $(selector).slider({

        min: 0, //最小値
        max: 100, //最大値
        step: 10, //増減分
        value: 0, // 初期値

        // スライダーによって変更が加えられた時
        slide: function(event, ui) {
            var p_value = ui.value;

            var bar_obj = $(this).parent().find(".bar");
            var bar_value = bar_obj.text().replace('%', "");


            if (p_value == 100) {
                $(this).parent().parent().find(".todo_name").addClass("comp");
            } else {
                $(this).parent().parent().find(".todo_name").removeClass('comp');
            }
            col_chg(bar_obj, p_value);
        },
        create: function(e, ui) {


            var bar_obj = $(this).parent().find(".bar");
            var bar_value = bar_obj.text().replace('%', "");

            if (parseInt(bar_value) == 100) {
                $(this).parent().parent().find(".todo_name").addClass("comp");
            }


            $(this).slider("value", bar_value);

            col_chg(bar_obj, bar_value);


        },
        change: function(e, ui) {
            var id_name = $(this).parent().find(".id").text();
            var p_id_name = $(this).parent().find(".p_id").text();
            flag++;
            if (flag > s_num) {
                send_data('progress', p_id_name, id_name, ui.value).done(function(result) {
                    mesDisp(id_name, result);

                }).fail(function(result) {
                    alert("failed");
                });
            }
            perLeft()
        },

    });


} //makeSlider


/*
色変化
*/

function col_chg(sel, p_value) {


    $(sel).css({ 'width': p_value + '%' });
    $(sel).text(p_value + '%');


    if (p_value < 20) {
        $(sel).css({ "background-color": "#ff7575" });
    } else if (p_value < 30) {
        $(sel).css({ "background-color": '#ffe575' });
    } else if (p_value < 50) {
        $(sel).css({ "background-color": 'Orange' });
    } else if (p_value < 75) {
        $(sel).css({ "background-color": '#d4f442' });
    } else {
        $(sel).css({ "background-color": '#acff28' });
    }
    if (p_value == 100) {
        $(sel).parent().removeClass('stripes');
        $(sel).parent().removeClass('orange');
        $(sel).parent().removeClass('shine');
    } else {
        if (!$(sel).hasClass("stripes")) $(sel).parent().addClass('stripes');
        if (!$(sel).hasClass("orange")) $(sel).parent().addClass('orange');
        if (!$(sel).hasClass("shine")) $(sel).parent().addClass('shine');
    }

}

/*

Ajaxの全て。
モード、
英単語
オプション
*/
function send_data(mode, p_id_name, id_name, option) {
    return jQuery.ajax(
        "ajax_platform.php", {
            type: "POST",
            dataType: 'text',
            data: {
                "mode": mode,
                "p_id": p_id_name,
                "id": id_name,
                "option": option
            }
        }
    );
}

