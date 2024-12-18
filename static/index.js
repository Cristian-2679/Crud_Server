"use strict"

$(document).ready(function() {
    let divIntestazione = $("#divIntestazione")
    let divFilters = $(".card").eq(0)
    let divCollections = $("#divCollections")
    let table = $("#mainTable")
    let divDettagli = $("#divDettagli")
    let btnAdd = $("#btnAdd").prop("disabled", true);
    let currentCollection = "";
    let lstHair = $("#lstHair");

    divFilters.hide()
	$("#lstHair").prop("selectedIndex", -1);
    
    getCollections();

    async function getCollections() 
    {
        const data = await inviaRichiesta("GET", "/api/getCollection");
        if(data)
        {
            console.log(data);
            const label = divCollections.children("label");
            for (const collection of data) {
                const clonedLabel=label.clone().appendTo(divCollections);
                clonedLabel.children("span").text(collection.name);
                clonedLabel.children("input").val(collection.name).on("click", function(){
                    currentCollection = this.value;
                    btnAdd.prop("disabled", false);
                    getDataCollection();
                });
            }
            label.remove();
        }
    }
    
    async function getDataCollection(filter={}) 
    {
        const data = await inviaRichiesta("GET", "/api/" + currentCollection, filter);
        if(data)
        {
            console.log(data);

            divIntestazione.find("strong").eq(0).text(currentCollection);
            divIntestazione.find("strong").eq(1).text(data.length);
            divDettagli.empty();
            const tbody=table.children("tbody");
            tbody.empty();
            data.forEach((element, i) => {
                const tr=$("<tr>").appendTo(tbody);
                $("<td>").appendTo(tr).text(element["_id"])
                .on("click", function(){
                    divDettagli.empty();
                    getDetails($(this).text());
                });
                let key = Object.keys(element)[1];
                $("<td>").appendTo(tr).text(element[key])
                .on("click", function(){
                    getDetails(element["_id"]);
                });

                const td = $("<td>").appendTo(tr);
                $("<div>").appendTo(td)
                .on("click", function(){
                    getDetails(element._id, "PATCH");
                });
                $("<div>").appendTo(td).on("click", function(){
                    putRecord(element._id);
                });
                $("<div>").appendTo(td)
                .on("click", function(){
                    deleteRecord(element._id);
                });
            });
            if(currentCollection == "unicorns")
            {
                divFilters.show();
            }
            else
            {
                divFilters.hide();
                divFilters.find("input:checkbox").prop("checked", false);
                lstHair.prop("selectedIndex", -1);
            }
        }
    }

    $("#btnFind").on("click", function(){
        let hair = lstHair.val();
        let gender = ""

        if(divFilters.find("input:checkbox:checked").length==1)
        {
            gender=divFilters.find("input:checkbox:checked").val();
        }

        let filters = {};

        if(hair)
        {
            filters["hair"]=hair.toLowerCase();
        }
        if(gender)
        {
            filters["gender"]=gender.toLowerCase();
        }

        getDataCollection(filters);
    });

    async function getDetails(id, method="GET") 
    {
        const details = await inviaRichiesta("GET", "/api/" + currentCollection + "/" + id);
        if(details)
        {
            console.log(details);
            if(method=="GET")
            {
                for (const key in details) {
                    $("<strong>").appendTo(divDettagli).text(key + ": ");
                    $("<span>").appendTo(divDettagli).text(JSON.stringify(details[key]));
                    $("<br>").appendTo(divDettagli);
                }
            }
            else
            {
                divDettagli.empty();
                delete details._id;
                const textarea = $("<textarea>").appendTo(divDettagli).val(JSON.stringify(details, null, 2));
                textarea.css("height", textarea.get(0).scrollHeight + "px");
                $("<button>").addClass("btn btn-success btn-sm").text("Update").appendTo(divDettagli)
                .on("click", async function(){
                    if(textarea.val())
                    {
                        let json;
                        try {
                            json = JSON.parse(textarea.val());
                        } catch (err) {
                            alert("Error! Invalid JSON");
                            return;                    
                        }
                        if("_id"  in json)
                        {
                            delete json._id;
                        }
                        const data = await inviaRichiesta("PATCH", "/api/" + currentCollection + "/" + id, {values: json});
                        if(data?.modifiedCount == 1)
                        {
                            alert("Record updated successfully!");
                            getDataCollection();
                        }
                        else
                        {
                            alert("Unable to update the record!");
                        }
                    }
                });
            }
        }   
    }

    btnAdd.on("click", function(){
        divDettagli.empty();
        $("<textarea>").appendTo(divDettagli).prop("placeholder", '{"Name": "[the name of the new unicorn]"}');
        $("<button>").addClass("btn btn-success btn-sm").text("Insert").appendTo(divDettagli).on("click", async function(){
            let record = divDettagli.children("textarea").val();
            try {
                record = JSON.parse(record);
                const data = await inviaRichiesta("POST", "/api/"+currentCollection, record);
                if(data)
                {
                    console.log(data);
                    alert("Record added correctly")
                    getDataCollection();
                }
            } catch (err) {
                alert("Error: JSON not valid\n" + err);
                return;
            }
        })
    });

    async function deleteRecord(_id)
    {
        if(confirm("Do you really want to delite the record: " + _id + "?"))
        {
            const data = await inviaRichiesta("DELETE", "/api/" + currentCollection + "/" + _id);
            if(data)
            {
                console.log(data);
                alert("Record delited correctly");
                getDataCollection();
            }
        }
    }

    async function putRecord(_id)
    {
        divDettagli.empty();
        const textarea = $("<textarea>").appendTo(divDettagli).prop("placeholder", '{"$inc": {"vampires": 2}}');
        $("<button>").addClass("btn btn-success btn-sm").text("Update").appendTo(divDettagli)
        .on("click", async function(){
            if(textarea.val())
            {
                let json;
                try {
                    json = JSON.parse(textarea.val());
                } catch (err) {
                    alert("Error! Invalid JSON");
                    return;                    
                }
                const data = await inviaRichiesta("PUT", "/api/" + currentCollection + "/" + _id, {values: json});
                if(data?.modifiedCount == 1)
                {
                    alert("Record updated successfully!");
                    getDataCollection();
                }
                else
                {
                    alert("Unable to update the record!");
                }
            }
        });
    }
});