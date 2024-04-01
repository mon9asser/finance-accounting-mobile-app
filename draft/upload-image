createFormData = (photo, body) => {
        const data = new FormData();
      
        data.append("photo", {
          name: photo.fileName,
          type: photo.type,
          uri:
            Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
        });
      
        Object.keys(body).forEach(key => {
          data.append(key, body[key]);
        });
      
        return data;
    };

      
    storeImage = async () => {
        const photo = this.state.product_thumbnail; // Assuming this is an object with { uri, type, name }
        const url = "http://192.168.100.7:3000/api/create_update_w_image";
    
        // Prepare FormData
        const formData = new FormData(); 
        formData.append("photo", {
            name: photo.fileName || 'upload.jpg', // Ensure a filename is present
            type: photo.type || 'image/jpeg', // Ensure a file type is present, default to 'image/jpeg'
            uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
        });
        formData.append("id", "142544"); // Example of adding another field
    
        // Configure Axios options
        const options = {
            method: "post",
            url: url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data', // This header is important for 'multipart/form-data'
            },
        };
    
        // Perform the request
        try {
            const response = await axios(options);
            console.log("Upload success:", response.data);
        } catch (error) {
            console.error("Upload error:", error.message);
        }
    }