
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
 
var get = await CategoryInstance.get_categories([], {
page: 5, size: 2
}, true); 
    
// get 
var data = await CatInstance.get_data_locally(CatInstance.categories);
console.log(data);
 

// delete locally and remotely
var data = await CatInstance.deleteAsync(CatInstance.categories, {local_id: "71661floeuo65esf17102877004661341"});

// delete locally 
await CatInstance.categories.instance.removeItem(CatInstance.categories.key);

// get async
var data = await CatInstance.bulkGetAsync(CatInstance.categories);
console.log(data);

// update and insert bulk async 
 var data = await CatInstance.bulkCoreAsync(CatInstance.categories);
console.log(data);


// Insert array of data in one time 
await CategoryInstance.bulk_create_update([
    {
        category_name: "Category 1", 
        app_name: 0
    },
    {
        category_name: "Category 2", 
        app_name: 0
    },
    {
        category_name: "Category 3", 
        app_name: 0
    }
])