 var file_extension = req.body.exten || ".jpg";
    var image_name = req.body.name; 
    
    // handling current language
    var current_language = req.body.language == undefined? "en": req.body.language; 
    
    
    var localize = language[current_language];
     
    //preparing response object 
    var response = {
        is_error: true, 
        data: [], 
        message: localize.something_wrong
    }

    // Basics Of Each API: checking for database name and model 
    var database = req.body.database_name;
    var model = req.body.model_name;
    var param_id = req.body.param_id == undefined? -1: req.body.param_id;

    if( database == undefined || model == undefined ) {
        response.is_error = true;
        response.message = localize.peroperties_required;
        return res.send(response);
    }
     
    var model_name = flat_schema_name(model);
    var schema_object = get_schema_object(model_name);
    
    
    var db_connection = await create_connection(database, {
        model: model_name, 
        schemaObject:schema_object
    }); 
    
    console.log("data ++++");

    if( ! db_connection ) {
        response["data"] = [];
        response["is_error"] = true;
        response["message"] = localize.services_disabled; 
        return res.send(response); 
    } 

    
    // stored image name 
    var image_name = `${image_name}${file_extension}`;
    var local_id = req.body.post_id;
    var pname = req.body.property_name;

    var updater = {};
    updater[pname] = image_name;
    var uptodate = await db_connection.findOneAndUpdate({local_id}, updater );
    res.send(uptodate);   
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Files will be saved in the 'uploads' directory. Make sure it exists!
      const uploadsDir = "./uploads";
      if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir);
      }
      cb(null, uploadsDir);
    }, 
    filename: function (req, file, cb) {    
      
        // Name the file uniquely to avoid overwriting existing files
        req.body.exten = path.extname(file.originalname);
         
        // file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null, req.body.name + path.extname(file.originalname) );

    } 
});

const upload = multer({ storage: storage });