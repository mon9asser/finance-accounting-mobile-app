
// add 
var asynced = await CatInstance.create_update_category({
    category_name: "Fashions", 
    app_name: 999, 
});

// update
var asynced = await CatInstance.create_update_category({
    category_name: "Fashions", 
    app_name: 999,
    param_id: "34721poe7cbhtg9p17102065587751403"
});
 

// get 
var data = await CatInstance.get_data_locally(CatInstance.categories);
console.log(data);
 

// delete locally and remotely
var data = await CatInstance.deleteAsync(CatInstance.categories, {local_id: "71661floeuo65esf17102877004661341"});

// delete locally 
await CatInstance.categories.instance.removeItem(CatInstance.categories.key);