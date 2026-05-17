import apiInstance from "../../shared/services/api/apiInstance";

export const getCategories = async () => {
    try {
        const response = await apiInstance.get('education/get_categories.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getVideos = async () => {
    try {
        const response = await apiInstance.get('education/get_videos.php');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addVideo = async (payload) => {
    try {
        const isFormData = payload instanceof FormData;
        const headers = isFormData 
            ? { 'Content-Type': 'multipart/form-data' } 
            : { 'Content-Type': 'application/json' };

        const response = await apiInstance.post('education/add_video.php', payload, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
}
