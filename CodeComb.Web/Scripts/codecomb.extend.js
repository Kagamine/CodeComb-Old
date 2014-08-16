﻿var IsPMOpened = false;

var CurrentContactID = null;

function GetContacts()
{
    var contact_ids = GetCookie();
    $.getJSON("/PrivateMessage/GetContacts", { ids: JSON.stringify(contact_ids) }, function (contacts) {
        var html = "";
        for (var i in contacts)
        {
            AutoAddContact(contacts[i].ID);
            html += '<p><a href="javascript:GetChatRecords(' + contacts[i].ID + ')">' + contacts[i].Gravatar + contacts[i].Nickname + '</a> ' + (contacts[i].MessageCount > 0 ? ('(' + contacts[i].MessageCount + ')') : '') + '</p>';
        }
        $("#lstContacts").html(html);
    });
}

function AddContact(id)
{
    var contact_ids = GetCookie();
    var existed = false;
    for (var i in contact_ids) {
        if (contact_ids[i] == id) {
            existed = true;
            break;
        }
    }
    if (!existed)
    {
        contact_ids.push(id);
        SetCookie(contact_ids);
    }
    GetContacts();
    GetChatRecords(id);
    PrivateMessageDispay();
}

function AutoAddContact(id)
{
    var contact_ids = GetCookie();
    for (var i in contact_ids)
    {
        if (id == contact_ids[i])
            return true;
    }
    contact_ids.push(id);
    SetCookie(contact_ids);
    return false;
}

function GetCookie()
{
    var tmp = $.cookie(username);
    if (tmp == null) tmp = "";
    var contact_ids = tmp.split(',');
    return contact_ids;
}

function SetCookie(ids)
{
    var ret = "";
    for (var i = 0; i < ids.length; i++)
        if (parseInt(ids[i]) > 0)
            ret += ids[i] + ",";
    ret = ret.substr(0, ret.length - 1);
    $.cookie(username, ret);
}

function PrivateMessageDispay()
{
    IsPMOpened = true;
    $.colorbox({ inline: true, width: "auto", href: "#PrivateMessage", onClosed: function () { CurrentContactID = null; IsPMOpened = false; } });
    $("#btnPMDisplay").removeClass("btn-highlight");
    if (CurrentContactID == null) { 
        $("#PMRightArea").hide();
        $("#ChatRecords").html("");
    }
}

function GetChatRecords(sender_id)
{
    CurrentContactID = sender_id;
    $.getJSON("/PrivateMessage/GetChatRecords", { sender_id: sender_id, rnd: Math.random() }, function (chatrecords) {
        for (var i in chatrecords)
        {
            var html = '<dt>' + chatrecords[i].Gravatar + ' <a href="/User/' + chatrecords[i].SenderID + '">' + chatrecords[i].SenderNickname + '</a> ' + chatrecords[i].Time + ' :</dt><dd>' + chatrecords[i].Content + '</dd>';
            if ($("#cr_" + chatrecords[i].ID).length > 0)
                $("#cr_" + chatrecords[i].ID).html(html);
            else
            {
                html = '<dl id="cr_' + chatrecords[i].ID + '">' + html + '</dl>';
                $("#ChatRecords").append(html);
            }
        }
        $("#ChatRecords").show();
        $("#PMRightArea").show();
        document.getElementById('ChatRecords').scrollTop = document.getElementById('ChatRecords').scrollHeight;
        GetContacts();
    });
}

function PostMessage()
{
    $.post("/PrivateMessage/PostMessage", { receiver_id: CurrentContactID, content: $("#txtMessageContent").val(), rnd: Math.random() }, function () { $("#txtMessageContent").val(""); });
}

$(document).ready(function () {
    $("#btnAddContact").click(function () {
        var uid = $(this).attr("uid");
        AddContact(uid);
    });
    $("#btnPostMessage").click(function () {
        PostMessage();
    });
    $("#txtMessageContent").keydown(function (e) {
        if (e.ctrlKey && e.which == 13)
            PostMessage();
    });
    //setInterval(function () {
    //    GetContacts();
    //    if (CurrentContactID != null)
    //        GetChatRecords(CurrentContactID);
    //}, 5000);

    //SignalR
    var CodeCombHub = $.connection.codeCombHub;
    CodeCombHub.client.onStatusChanged = function (status) {
        if ($("#lstStatuses") > 0) {
            if ($("#s_" + status.ID).length > 0) {
                BuildStatus(status);
            }
        }
        else {
            if ($("#s_" + status.ID).length > 0) {
                BuildStatusDetail(status);
                $("#MemoryUsage").html(status.MemoryUsage);
                $("#TimeUsage").html(status.TimeUsage);
                GetDetails();
            }
        }
    };
    CodeCombHub.client.onStatusCreated = function (status) {
        if ($("#lstStatuses") > 0)
        {
            if (contest_id != null && status.ContestID != contest_id) return;
            if (status._Nickname.indexOf(nickname) < 0) return;
            if (problem_id != null && problem_id != 0 && status.ProblemID != problem_id) return;
            BuildStatus(status);
        }
    };
    CodeCombHub.client.onMessageReceived = function (msg) {
        GetContacts();
        if (CurrentContactID != null)
            GetChatRecords(CurrentContactID);
        if (!IsPMOpened) $("#btnPMDisplay").addClass("btn-highlight");
    };
    $.connection.hub.start();

    $("#btnLoadCodeEditBox").click(function () {
        $.colorbox({ inline: true, width: "auto", href: "#CodeEditBox" });
    });
    function RefreshHighLight() {
        var language_id = $("#lstLanguages").val();
        switch (language_id) {
            case 0:
                editor.getSession().setMode("ace/mode/c_cpp");
                break;
            case 1:
                editor.getSession().setMode("ace/mode/c_cpp");
                break;
            case 2:
                editor.getSession().setMode("ace/mode/c_cpp");
                break;
            case 3:
                editor.getSession().setMode("ace/mode/java");
                break;
            case 4:
                editor.getSession().setMode("ace/mode/pascal");
                break;
            case 5:
                editor.getSession().setMode("ace/mode/python");
                break;
            case 6:
                editor.getSession().setMode("ace/mode/python");
                break;
            case 7:
                editor.getSession().setMode("ace/mode/ruby");
                break;
            case 8:
                editor.getSession().setMode("ace/mode/csharp");
                break;
            case 9:
                editor.getSession().setMode("ace/mode/vbscript");
                break;
        }
    }
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/textmate");
    editor.getSession().setMode("ace/mode/c_cpp");
    editor.setShowPrintMargin(false);
    editor.setAutoScrollEditorIntoView(true);
    editor.setOptions({
        minLines: 18,
        maxLines: 18
    });
    RefreshHighLight();
    $("#lstLanguages").change(function () {
        RefreshHighLight();
    });
});